import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Surreal } from "surrealdb";
import type { ResolvedConfig } from "./config";
import {
  introspectStructured,
  type StructField,
  type StructTable,
} from "./structure";

/** The field clauses pull reverses into `sz.*` chains (sourced from `INFO … STRUCTURE`). */
interface ParsedField {
  type: string;
  default?: string;
  defaultAlways?: boolean;
  value?: string;
  assert?: string;
  readonly?: boolean;
  comment?: string;
  flexible?: boolean;
}

/**
 * The bare field path — STRUCTURE backtick-escapes reserved-word segments (`` `value` ``), so we
 * strip them; `ident()` re-quotes only what TS needs, and emit re-escapes for SurrealQL (avoids
 * double-escaping the name).
 */
function unescapeName(name: string): string {
  return name
    .split(".")
    .map((seg) => seg.replace(/^`([\s\S]*)`$/, "$1"))
    .join(".");
}

/** Map a structured field (from STRUCTURE) to the clause bag `renderField` consumes. */
function toParsed(f: StructField): ParsedField {
  return {
    type: f.kind,
    default: f.default,
    defaultAlways: f.default_always,
    value: f.value,
    assert: f.assert,
    readonly: f.readonly,
    comment: f.comment,
    flexible: f.flexible,
  };
}

// --- Cross-table reference resolution (imports / self-refs / relation endpoints) -------------

const pascal = (name: string) =>
  name
    .replace(/(^|[_-])([a-z])/g, (_, __, c) => c.toUpperCase())
    .replace(/[^A-Za-z0-9]/g, "");

/** All `record<…>` target table names in a type expression (handles option/array/union nesting). */
function recordTargets(kind: string): string[] {
  const out: string[] = [];
  const re = /record<([^>]+)>/g;
  let m: RegExpExecArray | null = re.exec(kind);
  while (m) {
    for (const t of m[1].split("|")) out.push(t.trim());
    m = re.exec(kind);
  }
  return out;
}

/** The pulled tables a table points at: `record<…>` field targets + relation endpoints. */
function tableRefs(t: StructTable, pulled: Set<string>): Set<string> {
  const out = new Set<string>();
  const add = (n: string) => {
    if (pulled.has(n)) out.add(n);
  };
  for (const f of t.fields) for (const tgt of recordTargets(f.kind)) add(tgt);
  if (t.kind.kind === "RELATION") {
    for (const n of t.kind.in ?? []) add(n);
    for (const n of t.kind.out ?? []) add(n);
  }
  return out;
}

/** Everything reachable from `start` in the reference graph (excluding `start` itself). */
function reachable(graph: Map<string, Set<string>>, start: string): Set<string> {
  const seen = new Set<string>();
  const stack = [...(graph.get(start) ?? [])];
  while (stack.length) {
    const n = stack.pop();
    if (n === undefined || seen.has(n)) continue;
    seen.add(n);
    for (const m of graph.get(n) ?? []) stack.push(m);
  }
  return seen;
}

/** How a `record<target>` / endpoint reference should be expressed in the generated code. */
type RefKind = "self" | "direct" | "string";

/** Per-table render context: resolves references and accumulates the imports they need. */
interface RenderCtx {
  table: string;
  /** Imported table names (→ value imports of their `const`). */
  imports: Set<string>;
  /** Set when a `record<self>` field used the callback `self` parameter. */
  usesSelf: boolean;
  /** Whether the `self` callback is available (only `defineTable`, not `defineRelation`). */
  allowSelf: boolean;
  /** PascalCase const name for a table. */
  constOf: (name: string) => string;
  /** Resolve a reference from this table to `target`. */
  resolve: (target: string) => RefKind;
}

function makeResolver(graph: Map<string, Set<string>>, pulled: Set<string>) {
  const cache = new Map<string, Set<string>>();
  const reach = (n: string) => {
    let r = cache.get(n);
    if (!r) {
      r = reachable(graph, n);
      cache.set(n, r);
    }
    return r;
  };
  return (from: string, target: string): RefKind => {
    if (target === from) return "self";
    if (!pulled.has(target)) return "string"; // not pulled — can't import it
    return reach(target).has(from) ? "string" : "direct"; // cycle → string, else import
  };
}

/** Split a type expression on its top-level `|` (ignoring `|` inside `<…>`). */
function splitTopUnion(expr: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (const c of expr) {
    if (c === "<") depth++;
    else if (c === ">") depth--;
    if (c === "|" && depth === 0) {
      parts.push(cur.trim());
      cur = "";
    } else cur += c;
  }
  parts.push(cur.trim());
  return parts;
}

/** Parse a SurrealQL literal token (`'a'`, `"a"`, `42`, `true`) to its JS value, else null. */
function parseLiteral(s: string): { value: string | number | boolean } | null {
  const t = s.trim();
  const q = /^'((?:\\.|[^'])*)'$/.exec(t) ?? /^"((?:\\.|[^"])*)"$/.exec(t);
  if (q) return { value: q[1] };
  if (/^-?\d+$/.test(t)) return { value: Number.parseInt(t, 10) };
  if (/^-?\d+\.\d+$/.test(t)) return { value: Number.parseFloat(t) };
  if (t === "true" || t === "false") return { value: t === "true" };
  return null;
}

/** Render a `record<…>` reference, using imports / `self` / a string fallback per `ctx`. */
function renderRecord(targetsRaw: string, ctx?: RenderCtx): string {
  const targets = targetsRaw.split("|").map((s) => s.trim());
  if (ctx && targets.length === 1) {
    const kind = ctx.resolve(targets[0]);
    if (kind === "self" && ctx.allowSelf) {
      ctx.usesSelf = true;
      return "self";
    }
    if (kind === "direct") {
      ctx.imports.add(targets[0]);
      return `${ctx.constOf(targets[0])}.record()`;
    }
  }
  const arg =
    targets.length === 1
      ? JSON.stringify(targets[0])
      : `[${targets.map((t) => JSON.stringify(t)).join(", ")}]`;
  return `sz.recordId(${arg})`;
}

/** Map a SurrealQL type to an `sz.*` expression (`ctx` resolves `record<…>` references). */
function szType(type: string, ctx?: RenderCtx): string {
  const t = type.trim();
  // option<X> and the `none | X` form the DB reports.
  const opt = /^option<(.+)>$/.exec(t);
  if (opt) return `${szType(opt[1], ctx)}.optional()`;
  if (/(^|\|)\s*none\s*(\||$)/.test(t)) {
    const inner = t.replace(/\s*\|?\s*none\s*\|?\s*/g, "").trim();
    return `${szType(inner || "any", ctx)}.optional()`;
  }
  const nullable = /^(.+?)\s*\|\s*null$/.exec(t);
  if (nullable) return `${szType(nullable[1], ctx)}.nullable()`;

  const arr = /^(?:array|set)<(.+)>$/.exec(t);
  if (arr) return `${szType(arr[1], ctx)}.array()`;
  const rec = /^record<(.+?)>$/.exec(t);
  if (rec) return renderRecord(rec[1], ctx);

  // Literal unions: `'a' | 'b'` -> sz.enum (all strings) or a union of literals; lone -> sz.literal.
  const lits = splitTopUnion(t).map(parseLiteral);
  if (lits.length && lits.every((l) => l !== null)) {
    const vals = lits.map(
      (l) => (l as { value: string | number | boolean }).value,
    );
    if (vals.length === 1) return `sz.literal(${JSON.stringify(vals[0])})`;
    if (vals.every((v) => typeof v === "string"))
      return `sz.enum([${vals.map((v) => JSON.stringify(v)).join(", ")}])`;
    return `sz.union([${vals.map((v) => `sz.literal(${JSON.stringify(v)})`).join(", ")}])`;
  }

  switch (t) {
    case "string":
      return "sz.string()";
    case "int":
      return "sz.int()";
    case "float":
      return "sz.float()";
    case "number":
      return "sz.number()";
    case "bool":
      return "sz.boolean()";
    case "datetime":
      return "sz.datetime()";
    case "uuid":
      return "sz.uuid()";
    case "decimal":
      return "sz.decimal()";
    case "duration":
      return "sz.duration()";
    case "bytes":
      return "sz.bytes()";
    case "object":
      return "sz.object({})";
    case "any":
      return "sz.any()";
    default:
      return `sz.any() /* ${t} */`;
  }
}

interface FieldNode {
  parsed?: ParsedField;
  children: Map<string, FieldNode>;
}

/** Build a nested tree from dotted field paths (`settings.theme`, `tags.*`). */
function fieldTree(fields: { name: string; parsed: ParsedField }[]): FieldNode {
  const root: FieldNode = { children: new Map() };
  for (const f of fields) {
    let node = root;
    for (const seg of f.name.split(".")) {
      let child = node.children.get(seg);
      if (!child) {
        child = { children: new Map() };
        node.children.set(seg, child);
      }
      node = child;
    }
    node.parsed = f.parsed;
  }
  return root;
}

/**
 * Strip optionality/nullability wrappers, reporting which were present. Handles both
 * `option<X>` and the `X | none` form SurrealDB's `INFO` reports, plus `X | null`.
 */
function unwrapType(type: string): {
  base: string;
  optional: boolean;
  nullable: boolean;
} {
  let t = type.trim();
  let optional = false;
  let nullable = false;
  const opt = /^option<(.+)>$/.exec(t);
  if (opt) {
    optional = true;
    t = opt[1].trim();
  }
  // `X | none` / `none | X` — SurrealDB's normalized form of `option<X>`.
  if (/(^|\|)\s*none\s*(\||$)/.test(t)) {
    optional = true;
    t = t.replace(/\s*\|?\s*none\s*\|?\s*/g, "").trim();
  }
  const nul = /^(.+?)\s*\|\s*null$/.exec(t);
  if (nul) {
    nullable = true;
    t = nul[1].trim();
  }
  return { base: t, optional, nullable };
}

/** Render an `sz.*` expression for a field node, recursing into nested objects/array elements. */
function renderField(node: FieldNode, indent: string, ctx?: RenderCtx): string {
  const p = node.parsed;
  const objChildren = [...node.children].filter(([k]) => k !== "*");
  const star = node.children.get("*");
  const wrap = p ? unwrapType(p.type) : null;
  let expr: string;
  if (p && wrap?.base === "object") {
    // Rebuild sz.object from dotted children (empty if none) — even when wrapped in
    // option<…>/| null, so optional/nullable/flexible nested objects keep their shape.
    const inner = objChildren.length
      ? `{\n${objChildren
          .map(
            ([k, c]) =>
              `${indent}  ${ident(k)}: ${renderField(c, `${indent}  `, ctx)},`,
          )
          .join("\n")}\n${indent}}`
      : "{}";
    expr = `sz.object(${inner})`;
    if (p.flexible) expr += ".loose()"; // FLEXIBLE — accepts arbitrary keys
    if (wrap.nullable) expr += ".nullable()";
    if (wrap.optional) expr += ".optional()";
  } else if (p && star && /^(array|set)\b/.test(wrap?.base ?? "")) {
    // Any array/set: the element's full structure (incl. nested sub-fields) lives in the `*`
    // child — fold it into `<elem>.array()`. This beats parsing `array<object>` from the parent
    // kind, which would lose the element's sub-fields.
    expr = `${renderField(star, indent, ctx)}.array()`;
    if (wrap?.nullable) expr += ".nullable()";
    if (wrap?.optional) expr += ".optional()";
  } else if (!p) {
    expr = "sz.any()";
  } else {
    expr = szType(p.type, ctx);
  }

  if (p) {
    if (p.default !== undefined) {
      expr += `.${p.defaultAlways ? "$defaultAlways" : "$default"}(surql\`${p.default}\`)`;
    }
    if (p.value !== undefined) expr += `.$value(surql\`${p.value}\`)`;
    if (p.assert !== undefined) expr += `.$assert(surql\`${p.assert}\`)`;
    if (p.readonly) expr += ".$readonly()";
    if (p.comment) expr += `.$comment(${JSON.stringify(p.comment)})`;
  }
  return expr;
}

/** A safe object-key: a bare identifier, or a quoted string. */
function ident(key: string): string {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
}

/** Resolve a relation endpoint set to `.from`/`.to` args (imported consts) — or null if any can't be. */
function wireEndpoints(names: string[], ctx: RenderCtx): string | null {
  if (!names.length) return null;
  const resolved = names.map((n) => {
    const kind = ctx.resolve(n);
    if (kind === "direct") {
      ctx.imports.add(n);
      return ctx.constOf(n);
    }
    if (kind === "self") return ctx.constOf(ctx.table);
    return null; // not pulled / cyclic → can't pass a string to .from/.to
  });
  if (resolved.some((r) => r === null)) return null;
  return resolved.length === 1
    ? (resolved[0] as string)
    : `[${resolved.join(", ")}]`;
}

/** Generate the TypeScript source of a single table's schema module from its structure. */
function renderTable(t: StructTable, ctx: RenderCtx): string {
  const isRelation = t.kind.kind === "RELATION";
  const fields = t.fields.map((f) => ({
    name: unescapeName(f.name),
    parsed: toParsed(f),
  }));
  const tree = fieldTree(fields);
  const fieldLines = [...tree.children]
    .filter(([k]) => k !== "id" && k !== "in" && k !== "out")
    .map(([k, node]) => `  ${ident(k)}: ${renderField(node, "  ", ctx)},`)
    .join("\n");

  const name = ctx.constOf(t.name);
  const factory = isRelation ? "defineRelation" : "defineTable";
  // A `record<self>` field needs the callback shape so `self` is in scope.
  const head = ctx.usesSelf
    ? `export const ${name} = ${factory}(${JSON.stringify(t.name)}, (self) => ({`
    : `export const ${name} = ${factory}(${JSON.stringify(t.name)}, {`;
  const open = ctx.usesSelf ? "}))" : "})";

  const body: string[] = [head];
  if (!isRelation) body.push(`  id: sz.string(),`);
  body.push(fieldLines);

  let close = open;
  if (isRelation) {
    const from = wireEndpoints(t.kind.in ?? [], ctx);
    const to = wireEndpoints(t.kind.out ?? [], ctx);
    if (from) close += `\n  .from(${from})`;
    if (to) close += `\n  .to(${to})`;
  } else if (t.kind.kind === "ANY") {
    close += `\n  .typeAny()`;
  }
  // Common table config (applies to tables and relations alike).
  if (!t.schemafull) close += `\n  .schemaless()`;
  if (t.comment) close += `\n  .comment(${JSON.stringify(t.comment)})`;
  for (const idx of t.indexes) {
    const cols = idx.cols.map((c) => JSON.stringify(c)).join(", ");
    const unique = idx.index === "UNIQUE" ? ", { unique: true }" : "";
    close += `\n  .index(${JSON.stringify(idx.name)}, [${cols}]${unique})`;
  }
  body.push(`${close};`);

  const code = body.join("\n");
  const imports = [`import { sz, ${factory} } from "surreal-zod";`];
  // Cross-table value imports (one per referenced table, sorted, self excluded).
  for (const dep of [...ctx.imports].filter((d) => d !== t.name).sort()) {
    imports.push(`import { ${ctx.constOf(dep)} } from "./${dep}";`);
  }
  if (code.includes("surql`"))
    imports.push('import { surql } from "surrealdb";');
  return `${imports.join("\n")}\n\n${code}\n`;
}

export interface PullResult {
  files: string[];
  skipped: string[];
}

/** Introspect the live database (via `INFO … STRUCTURE`) and write one `sz.*` file per table. */
export async function pull(
  db: Surreal,
  config: ResolvedConfig,
  opts: { force?: boolean } = {},
): Promise<PullResult> {
  const tables = await introspectStructured(
    db,
    new Set([config.migrationsTable, `${config.migrationsTable}_lock`]),
  );

  // Build the reference graph (record<…> targets + relation endpoints) for cycle-aware imports.
  const pulled = new Set(tables.map((t) => t.name));
  const graph = new Map(tables.map((t) => [t.name, tableRefs(t, pulled)]));
  const resolve = makeResolver(graph, pulled);
  const constOf = (n: string) => pascal(n) || n;

  mkdirSync(config.schemaDir, { recursive: true });
  const files: string[] = [];
  const skipped: string[] = [];
  for (const t of tables) {
    const file = join(config.schemaDir, `${t.name}.ts`);
    if (existsSync(file) && !opts.force) {
      skipped.push(`${t.name}.ts`);
      continue;
    }
    const ctx: RenderCtx = {
      table: t.name,
      imports: new Set(),
      usesSelf: false,
      allowSelf: t.kind.kind !== "RELATION", // only defineTable takes the `self` callback
      constOf,
      resolve: (target) => resolve(t.name, target),
    };
    writeFileSync(file, renderTable(t, ctx));
    files.push(`${t.name}.ts`);
  }
  return { files, skipped };
}
