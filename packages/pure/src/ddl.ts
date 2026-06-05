import { z } from "zod";
import { escapeIdent, toSurqlString, type BoundQuery } from "surrealdb";
import {
  objectFieldsRegistry,
  surrealTypeRegistry,
  type SField,
  type Shape,
  type SurrealMeta,
  type TableDef,
} from "./pure";

/** Inline a BoundQuery's bindings into a literal SurrealQL string for DDL use. */
function inline(query: BoundQuery): string {
  let out = query.query;
  for (const [name, value] of Object.entries(query.bindings ?? {})) {
    out = out.replaceAll(`$${name}`, toSurqlString(value));
  }
  return out.trim();
}

/** Read a Zod schema's internal def with a loose type for traversal. */
function zdef(schema: z.ZodType): { type: string; [k: string]: unknown } {
  return schema._zod.def as unknown as { type: string; [k: string]: unknown };
}

/**
 * The SurrealQL type of a field plus any nested fields it expands into:
 * object subfields (`path.key`) and array/record element fields (`path.*`).
 */
interface FieldInfo {
  type: string;
  flexible: boolean;
  children: { suffix: string; info: FieldInfo; surreal?: SurrealMeta }[];
}
const leaf = (type: string): FieldInfo => ({ type, flexible: false, children: [] });

/** Infer a field's SurrealQL type + nested structure from a Zod schema. */
function inferField(schema: z.ZodType): FieldInfo {
  // Surreal-native schemas (datetime, recordId) carry their type explicitly.
  const explicit = surrealTypeRegistry.get(schema);
  if (explicit) return leaf(explicit);

  const def = zdef(schema);
  switch (def.type) {
    case "string":
      return leaf("string");
    case "number":
      return leaf("number");
    case "int":
      return leaf("int");
    case "boolean":
      return leaf("bool");
    case "date":
      return leaf("datetime");

    case "optional":
    case "default": {
      const inner = inferField(def.innerType as z.ZodType);
      return { ...inner, type: `option<${inner.type}>` };
    }
    case "nullable":
    case "readonly":
      return inferField(def.innerType as z.ZodType);
    case "pipe": // a codec with no explicit type — use its encoded (wire) side
      return inferField(def.in as z.ZodType);

    case "object": {
      const shape = def.shape as Record<string, z.ZodType>;
      const fields = objectFieldsRegistry.get(schema); // SField shape if built via sz.object
      const catchall = def.catchall as z.ZodType | undefined;
      const flexible = !!catchall && zdef(catchall).type === "unknown";
      const children = Object.entries(shape).map(([key, value]) => ({
        suffix: `.${escapeIdent(key)}`,
        info: inferField(value),
        surreal: fields?.[key]?.surreal,
      }));
      return { type: "object", flexible, children };
    }

    case "array":
    case "set": {
      const elem = inferField((def.element ?? def.valueType) as z.ZodType);
      // Element subfields live under `path.*`, but only when the element is structured.
      const children =
        elem.children.length > 0 || elem.type === "object"
          ? [{ suffix: ".*", info: elem }]
          : [];
      return { type: `array<${elem.type}>`, flexible: false, children };
    }

    case "record":
    case "map": {
      const value = inferField(def.valueType as z.ZodType);
      return { type: "object", flexible: false, children: [{ suffix: ".*", info: value }] };
    }

    default:
      // union / enum / literal / tuple land here for now (Phase 2).
      return leaf("any");
  }
}

/** Emit `DEFINE FIELD path ...` for a node, then recurse into its children. */
function emit(
  path: string,
  table: string,
  info: FieldInfo,
  surreal: SurrealMeta | undefined,
  opts: { overwrite?: boolean } | undefined,
  lines: string[],
): void {
  let type = info.type;
  // A DB-side DEFAULT/VALUE means the column is always populated -> drop a leading option<>.
  if ((surreal?.default || surreal?.value) && type.startsWith("option<")) {
    type = type.slice("option<".length, -1);
  }
  const parts = [
    `DEFINE FIELD ${opts?.overwrite ? "OVERWRITE " : ""}${path} ON TABLE ${escapeIdent(table)} TYPE ${type}`,
  ];
  if (info.flexible) parts.push("FLEXIBLE");
  if (surreal?.default) parts.push(`DEFAULT ${inline(surreal.default)}`);
  if (surreal?.value) parts.push(`VALUE ${inline(surreal.value)}`);
  if (surreal?.assert) parts.push(`ASSERT ${inline(surreal.assert)}`);
  if (surreal?.readonly) parts.push("READONLY");
  if (surreal?.comment) parts.push(`COMMENT ${JSON.stringify(surreal.comment)}`);
  lines.push(`${parts.join(" ")};`);

  for (const child of info.children) {
    emit(`${path}${child.suffix}`, table, child.info, child.surreal, opts, lines);
  }
}

/** `DEFINE FIELD ...` for a field (and any nested object/array/record subfields). */
export function defineField(
  name: string,
  table: string,
  field: SField,
  opts?: { overwrite?: boolean },
): string {
  const lines: string[] = [];
  emit(escapeIdent(name), table, inferField(field.schema), field.surreal, opts, lines);
  return lines.join("\n");
}

/** `DEFINE TABLE ...` plus a `DEFINE FIELD` per field. */
export function defineTable(
  t: TableDef<string, Shape>,
  opts?: { overwrite?: boolean },
): string {
  const rel = t.config.relation;
  // Surreal manages id (and in/out for relations) implicitly.
  const implicit = rel ? new Set(["id", "in", "out"]) : new Set(["id"]);
  const type = rel
    ? `RELATION FROM ${rel.from.map(escapeIdent).join(" | ")} TO ${rel.to.map(escapeIdent).join(" | ")}`
    : "NORMAL";

  const head = [
    `DEFINE TABLE ${opts?.overwrite ? "OVERWRITE " : ""}${escapeIdent(t.name)}`,
    `TYPE ${type}`,
  ];
  if (t.config.drop) head.push("DROP");
  head.push(t.config.schemafull ? "SCHEMAFULL" : "SCHEMALESS");
  if (t.config.comment) head.push(`COMMENT ${JSON.stringify(t.config.comment)}`);

  const lines = [`${head.join(" ")};`];
  for (const [name, field] of Object.entries(t.fields)) {
    if (implicit.has(name)) continue;
    lines.push(defineField(name, t.name, field as SField, { overwrite: opts?.overwrite }));
  }
  return lines.join("\n");
}
