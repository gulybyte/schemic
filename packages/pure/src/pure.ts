import { z } from "zod";
import { DateTime, RecordId, type BoundQuery, type RecordIdValue } from "surrealdb";

/**
 * The "pure" approach: a field is a stock Zod schema + SurrealQL DDL metadata.
 * The JS<->DB mapping rides on Zod's two native channels via codecs:
 *   - encoded side (`z.input`)  = DB wire type
 *   - decoded side (`z.output`) = app type
 * `z.decode` reads from the DB, `z.encode` writes to it.
 */

/**
 * Maps a Surreal-native schema (datetime codec, recordId) to its SurrealQL type.
 * Kept on the schema — not the field — so it composes through array()/optional()/nesting.
 */
export const surrealTypeRegistry = new WeakMap<z.ZodType, string>();

/**
 * Maps an object schema built via `sz.object` to its original SField shape, so
 * nested fields keep their DDL metadata ($default/$assert/...) during generation.
 */
export const objectFieldsRegistry = new WeakMap<z.ZodType, Record<string, AnyField>>();

/** SurrealQL DDL metadata — the `$`-prefixed field options. */
export interface SurrealMeta {
  default?: BoundQuery;
  defaultAlways?: boolean;
  value?: BoundQuery;
  assert?: BoundQuery;
  readonly?: boolean;
  comment?: string;
}

/**
 * A Zod schema paired with SurrealQL DDL metadata. `Flags` tracks input traits
 * used by `Create<>`/`Update<>`: `"create"` (DB-filled -> optional on create) and
 * `"readonly"` (excluded from updates). It only appears in method return types, so
 * `SField` is covariant in it.
 */
export class SField<S extends z.ZodType = z.ZodType, Flags extends string = never> {
  constructor(
    readonly schema: S,
    readonly surreal: SurrealMeta = {},
  ) {}

  // Zod wrappers — delegate to the inner schema, carry DDL metadata + flags forward.
  optional(): SField<z.ZodOptional<S>, Flags> {
    return new SField(this.schema.optional(), this.surreal);
  }
  nullable(): SField<z.ZodNullable<S>, Flags> {
    return new SField(this.schema.nullable(), this.surreal);
  }
  default(value: z.input<S>): SField<z.ZodDefault<S>, Flags> {
    return new SField(this.schema.default(value as never), this.surreal);
  }
  array(): SField<z.ZodArray<S>, Flags> {
    return new SField(z.array(this.schema), this.surreal);
  }

  // SurrealQL DDL metadata. $default/$defaultAlways mark the field create-optional;
  // $readonly marks it non-updatable (see Create<>/Update<>).
  $default(expr: BoundQuery): SField<S, Flags | "create"> {
    return new SField(this.schema, { ...this.surreal, default: expr, defaultAlways: false });
  }
  $defaultAlways(expr: BoundQuery): SField<S, Flags | "create"> {
    return new SField(this.schema, { ...this.surreal, default: expr, defaultAlways: true });
  }
  $value(expr: BoundQuery): SField<S, Flags> {
    return new SField(this.schema, { ...this.surreal, value: expr });
  }
  $assert(expr: BoundQuery): SField<S, Flags> {
    return new SField(this.schema, { ...this.surreal, assert: expr });
  }
  $readonly(readonly = true): SField<S, Flags | "readonly"> {
    return new SField(this.schema, { ...this.surreal, readonly });
  }
  $comment(comment: string): SField<S, Flags> {
    return new SField(this.schema, { ...this.surreal, comment });
  }
}

/** A flag-agnostic SField, for internal storage where flags don't matter. */
type AnyField = SField<z.ZodType, string>;

// --- Surreal-native field schemas ---

/** Surreal `datetime` <-> JS `Date` (a real codec — the types differ). */
function datetimeCodec() {
  const codec = z.codec(z.instanceof(DateTime), z.date(), {
    decode: (dt) => new Date(dt.toString()),
    encode: (d) => new DateTime(d),
  });
  surrealTypeRegistry.set(codec, "datetime");
  return codec;
}

/** A `RecordId` restricted to `tables` (+ optional id-value type). Identity, so no codec. */
function recordIdSchema<T extends string, V extends RecordIdValue = RecordIdValue>(
  tables: T[],
  valueType?: z.ZodType<V>,
): z.ZodType<RecordId<T, V>, RecordId<T, V>> {
  const schema = z.instanceof(RecordId).refine(
    // RecordId.table is a Table object; .name is the unescaped name.
    (r) =>
      (tables as readonly string[]).includes(r.table.name) &&
      (valueType ? valueType.safeParse(r.id).success : true),
    { error: `Expected record<${tables.join(" | ")}>` },
  );
  surrealTypeRegistry.set(schema, `record<${tables.join(" | ")}>`);
  return schema as unknown as z.ZodType<RecordId<T, V>, RecordId<T, V>>;
}

/** A `record<…>` field: table restriction (+ optional id-value type) and construction helpers. */
export class RecordIdField<
  T extends string,
  V extends RecordIdValue = RecordIdValue,
> extends SField<z.ZodType<RecordId<T, V>, RecordId<T, V>>> {
  constructor(
    readonly tables: T[],
    readonly valueType?: z.ZodType<V>,
    surreal: SurrealMeta = {},
  ) {
    super(recordIdSchema<T, V>(tables, valueType), surreal);
  }

  /** Restrict the id value's type — reflected as `RecordId<T, V>` and validated at runtime. */
  type<V2 extends RecordIdValue>(schema: z.ZodType<V2>): RecordIdField<T, V2> {
    return new RecordIdField<T, V2>(this.tables, schema, this.surreal);
  }

  /** Build a RecordId. Single-table: `make(id)`; multi-table: `make(table, id)`. */
  make(idOrTable: V | T, id?: V): RecordId<T, V> {
    return (
      id === undefined
        ? new RecordId(this.tables[0]!, idOrTable as V)
        : new RecordId(idOrTable as T, id)
    ) as RecordId<T, V>;
  }
}

/** Unwrap an SField to its Zod schema (raw Zod schemas pass through). */
const toZod = (v: AnyField | z.ZodType): z.ZodType => (v instanceof SField ? v.schema : v);
type ZodsOf<T extends readonly (AnyField | z.ZodType)[]> = {
  -readonly [K in keyof T]: SchemaOf<T[K]>;
};

/** Field constructors — the authoring surface. */
export const sz = {
  string: () => new SField(z.string()),
  number: () => new SField(z.number()),
  boolean: () => new SField(z.boolean()),
  email: () => new SField(z.email()),
  datetime: () => new SField(datetimeCodec()),
  recordId: <T extends string>(table: T | T[]) =>
    new RecordIdField<T>(Array.isArray(table) ? table : [table]),
  /** A nested object whose fields keep their surreal metadata + native types. */
  object: <S extends Shape>(shape: S): SField<z.ZodObject<ZShape<S>>> => {
    const fields: Record<string, AnyField> = {};
    const zshape: Record<string, z.ZodType> = {};
    for (const [k, v] of Object.entries(shape)) {
      const f = v instanceof SField ? v : new SField(v);
      fields[k] = f;
      zshape[k] = f.schema;
    }
    const schema = z.object(zshape) as z.ZodObject<ZShape<S>>;
    objectFieldsRegistry.set(schema, fields);
    return new SField(schema);
  },
  /** An array of `element` (an SField or a raw Zod schema). */
  array: <F extends AnyField | z.ZodType>(element: F): SField<z.ZodArray<SchemaOf<F>>> =>
    (element instanceof SField ? element : new SField(element)).array() as SField<
      z.ZodArray<SchemaOf<F>>
    >,
  /** A literal value type. */
  literal: <const T extends string | number | boolean | bigint>(value: T) =>
    new SField(z.literal(value)),
  /** A string enum. */
  enum: <const T extends readonly [string, ...string[]]>(values: T) => new SField(z.enum(values)),
  /** A union of fields/schemas. */
  union: <const T extends readonly [AnyField | z.ZodType, ...(AnyField | z.ZodType)[]]>(
    options: T,
  ): SField<z.ZodUnion<ZodsOf<T>>> => new SField(z.union(options.map(toZod) as ZodsOf<T>)),
  /** A fixed-length tuple of fields/schemas. */
  tuple: <const T extends readonly [AnyField | z.ZodType, ...(AnyField | z.ZodType)[]]>(
    items: T,
  ): SField<z.ZodTuple<ZodsOf<T>>> => new SField(z.tuple(items.map(toZod) as ZodsOf<T>)),
};

// --- Tables & relations ---

export type Shape = Record<string, AnyField | z.ZodType>;
type SchemaOf<F> = F extends SField<infer S, infer _> ? S : F extends z.ZodType ? F : never;
type FlagsOf<F> = F extends SField<z.ZodType, infer Fl> ? Fl : never;
type ZShape<S extends Shape> = { [K in keyof S]: SchemaOf<S[K]> };
type ToField<F> = F extends SField<infer Sc, infer Fl> ? SField<Sc, Fl> : SField<SchemaOf<F>>;
type Fields<S extends Shape> = { [K in keyof S]: ToField<S[K]> };
type Unwrap<F> = F extends SField<z.ZodOptional<infer Inner extends z.ZodType>, infer Fl>
  ? SField<Inner, Fl>
  : F;
type PartialShape<S extends Shape> = {
  [K in keyof S]: SField<z.ZodOptional<SchemaOf<S[K]>>, FlagsOf<S[K]>>;
};
type RequiredShape<S extends Shape> = { [K in keyof S]: Unwrap<Fields<S>[K]> };

export interface TableConfig {
  schemafull: boolean;
  drop?: boolean;
  comment?: string;
  relation?: { from: string[]; to: string[] };
}

function normalizeFields<S extends Shape>(shape: S): Fields<S> {
  const out: Record<string, AnyField> = {};
  for (const [k, v] of Object.entries(shape)) {
    out[k] = v instanceof SField ? v : new SField(v);
  }
  return out as unknown as Fields<S>;
}

/** Encode a (partial) app object to a wire payload, omitting absent fields. */
function encodeInput(
  fields: Record<string, AnyField>,
  input: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    const field = fields[k];
    out[k] = field ? z.encode(field.schema, v as never) : v;
  }
  return out;
}

// --- Create / Update input shapes ---
type Prettify<T> = { [K in keyof T]: T[K] } & {};
type AppOf<F> = z.output<SchemaOf<F>>;
type InputOptional<F> = undefined extends z.input<SchemaOf<F>> ? true : false;

type CreateOptional<S extends Shape, K extends keyof S> = K extends "id"
  ? true
  : "create" extends FlagsOf<S[K]>
    ? true
    : InputOptional<S[K]>;
type CreateShape<S extends Shape> = Prettify<
  { [K in keyof S as CreateOptional<S, K> extends true ? never : K]: AppOf<S[K]> } & {
    [K in keyof S as CreateOptional<S, K> extends true ? K : never]?: AppOf<S[K]>;
  }
>;

type UpdateExcluded<S extends Shape, K extends keyof S> = K extends "id"
  ? true
  : "readonly" extends FlagsOf<S[K]>
    ? true
    : false;
type UpdateShape<S extends Shape> = Prettify<{
  [K in keyof S as UpdateExcluded<S, K> extends true ? never : K]?: AppOf<S[K]>;
}>;

/** A table (or relation) definition: shape + DDL config, with chainable builders. */
export class TableDef<Name extends string, S extends Shape> {
  /** Zod object over the inner schemas — drives validation, encode/decode, types. */
  readonly object: z.ZodObject<ZShape<S>>;

  constructor(
    readonly name: Name,
    readonly fields: Fields<S>,
    readonly config: TableConfig = { schemafull: true },
  ) {
    const zshape: Record<string, z.ZodType> = {};
    for (const [k, f] of Object.entries(fields)) zshape[k] = (f as AnyField).schema;
    this.object = z.object(zshape) as z.ZodObject<ZShape<S>>;
  }

  get kind(): "table" | "relation" {
    return this.config.relation ? "relation" : "table";
  }

  /** DB wire row -> app object. */
  decode(row: unknown): z.output<z.ZodObject<ZShape<S>>> {
    return z.decode(this.object, row as never);
  }
  /** App object -> DB wire row. */
  encode(value: z.output<z.ZodObject<ZShape<S>>>): z.input<z.ZodObject<ZShape<S>>> {
    return z.encode(this.object, value);
  }

  /** Build a wire payload for `CREATE` (DB-filled fields optional). */
  make(input: CreateShape<S>): Record<string, unknown> {
    return encodeInput(this.fields as unknown as Record<string, AnyField>, input);
  }
  /** Build a wire payload for `UPDATE`/`MERGE` (a partial patch; excludes id/readonly). */
  makePartial(input: UpdateShape<S>): Record<string, unknown> {
    return encodeInput(this.fields as unknown as Record<string, AnyField>, input);
  }

  // --- DDL config (chainable, immutable) ---
  private withConfig(config: Partial<TableConfig>): TableDef<Name, S> {
    return new TableDef(this.name, this.fields, { ...this.config, ...config });
  }
  schemafull() {
    return this.withConfig({ schemafull: true });
  }
  schemaless() {
    return this.withConfig({ schemafull: false });
  }
  drop(drop = true) {
    return this.withConfig({ drop });
  }
  comment(comment: string) {
    return this.withConfig({ comment });
  }

  // --- Shape ops (mirror Zod's object methods; carry DDL metadata + config) ---
  extend<E extends Shape>(ext: E): TableDef<Name, Omit<S, keyof E> & E> {
    const f: Record<string, AnyField> = {
      ...(this.fields as unknown as Record<string, AnyField>),
      ...normalizeFields(ext),
    };
    return new TableDef(this.name, f as unknown as Fields<Omit<S, keyof E> & E>, this.config);
  }
  pick<K extends keyof S>(...keys: K[]): TableDef<Name, Pick<S, K>> {
    const src = this.fields as unknown as Record<string, AnyField>;
    const f: Record<string, AnyField> = {};
    for (const k of keys) f[k as string] = src[k as string]!;
    return new TableDef(this.name, f as unknown as Fields<Pick<S, K>>, this.config);
  }
  omit<K extends keyof S>(...keys: K[]): TableDef<Name, Omit<S, K>> {
    const f: Record<string, AnyField> = { ...(this.fields as unknown as Record<string, AnyField>) };
    for (const k of keys) delete f[k as string];
    return new TableDef(this.name, f as unknown as Fields<Omit<S, K>>, this.config);
  }
  partial(): TableDef<Name, PartialShape<S>> {
    const f: Record<string, AnyField> = {};
    for (const [k, field] of Object.entries(this.fields)) f[k] = (field as AnyField).optional();
    return new TableDef(this.name, f as unknown as Fields<PartialShape<S>>, this.config);
  }
  required(): TableDef<Name, RequiredShape<S>> {
    const f: Record<string, AnyField> = {};
    for (const [k, field] of Object.entries(this.fields)) {
      const sf = field as AnyField;
      const def = sf.schema._zod.def as unknown as { type: string; innerType?: z.ZodType };
      f[k] = def.type === "optional" && def.innerType ? new SField(def.innerType, sf.surreal) : sf;
    }
    return new TableDef(this.name, f as unknown as Fields<RequiredShape<S>>, this.config);
  }

  /** Derive a `record<name>` link to this table (carrying its id value type). */
  record(): S extends { id: RecordIdField<Name, infer V> }
    ? RecordIdField<Name, V>
    : RecordIdField<Name> {
    const idField = (this.fields as unknown as Record<string, AnyField>).id as
      | RecordIdField<Name>
      | undefined;
    return new RecordIdField([this.name], idField?.valueType) as never;
  }
}

// --- Smart id: the `id` field describes the id value type; wrapped as record<thisTable, V>. ---
type IdValue<Id> = Id extends RecordIdField<string, infer V>
  ? V
  : Id extends SField<infer Sc, infer _>
    ? z.output<Sc> extends RecordIdValue
      ? z.output<Sc>
      : RecordIdValue
    : Id extends z.ZodType
      ? z.output<Id> extends RecordIdValue
        ? z.output<Id>
        : RecordIdValue
      : RecordIdValue;
type WithSmartId<Name extends string, S extends Shape> = Omit<S, "id"> & {
  id: RecordIdField<Name, "id" extends keyof S ? IdValue<S["id"]> : RecordIdValue>;
};

/** Build a table's `id` field: a `record<name>` whose value type comes from `given`. */
function buildIdField(name: string, given: AnyField | z.ZodType | undefined): RecordIdField<string> {
  if (given === undefined) return new RecordIdField([name]);
  if (given instanceof RecordIdField) return new RecordIdField([name], given.valueType);
  const valueSchema = given instanceof SField ? given.schema : given;
  return new RecordIdField([name], valueSchema as z.ZodType<RecordIdValue>);
}

/** Normalize a shape, replacing/adding the special `id` field via buildIdField. */
function applySmartId(name: string, shape: Shape): Record<string, AnyField> {
  const out: Record<string, AnyField> = {};
  for (const [k, v] of Object.entries(shape)) {
    if (k === "id") continue;
    out[k] = v instanceof SField ? v : new SField(v);
  }
  out.id = buildIdField(name, (shape as Record<string, AnyField | z.ZodType>).id);
  return out;
}

/** Define a normal table (schemafull by default). */
export function table<Name extends string, S extends Shape>(
  name: Name,
  shape: S,
): TableDef<Name, WithSmartId<Name, S>> {
  return new TableDef(name, applySmartId(name, shape) as unknown as Fields<WithSmartId<Name, S>>, {
    schemafull: true,
  });
}

// biome-ignore lint/suspicious/noExplicitAny: shape-agnostic table reference for relation endpoints
type AnyTable = TableDef<string, any>;
type TableRef = AnyTable | readonly AnyTable[];
type NamesOf<T> = T extends TableDef<infer N extends string, infer _>
  ? N
  : T extends readonly (infer E)[]
    ? E extends TableDef<infer N extends string, infer _>
      ? N
      : never
    : never;

type RelationShape<
  Name extends string,
  S extends Shape,
  From extends TableRef,
  To extends TableRef,
> = Omit<WithSmartId<Name, S>, "in" | "out"> & {
  in: RecordIdField<NamesOf<From>>;
  out: RecordIdField<NamesOf<To>>;
};

function tableNames(ref: TableRef): string[] {
  return (Array.isArray(ref) ? ref : [ref as AnyTable]).map((t) => t.name);
}

/** Staged relation builder — set the source endpoint with `.from(...)`. */
class RelationFrom<Name extends string, S extends Shape> {
  constructor(
    readonly name: Name,
    readonly fields: S,
  ) {}
  from<From extends TableRef>(from: From): RelationTo<Name, S, From> {
    return new RelationTo(this.name, this.fields, from);
  }
}

/** Staged relation builder — set the target endpoint with `.to(...)`, producing the table. */
class RelationTo<Name extends string, S extends Shape, From extends TableRef> {
  constructor(
    readonly name: Name,
    readonly fields: S,
    readonly from: From,
  ) {}
  to<To extends TableRef>(to: To): TableDef<Name, RelationShape<Name, S, From, To>> {
    const fromNames = tableNames(this.from);
    const toNames = tableNames(to);
    const fields: Record<string, AnyField> = {
      ...applySmartId(this.name, this.fields),
      in: sz.recordId(fromNames),
      out: sz.recordId(toNames),
    };
    return new TableDef(this.name, fields as unknown as Fields<RelationShape<Name, S, From, To>>, {
      schemafull: true,
      relation: { from: fromNames, to: toNames },
    });
  }
}

/** Define a graph relation (edge table). Chain `.from(X).to(Y)` to set endpoints. */
export function relation<Name extends string, S extends Shape = {}>(
  name: Name,
  fields?: S,
): RelationFrom<Name, S> {
  return new RelationFrom(name, (fields ?? {}) as S);
}

/** The app-facing type (what your code reads). */
export type App<T extends { object: z.ZodType }> = z.output<T["object"]>;
/** The DB wire type (what crosses the wire). */
export type Wire<T extends { object: z.ZodType }> = z.input<T["object"]>;
/** The typed input for creating a record (DB-filled fields optional). */
export type Create<T> = T extends TableDef<string, infer S> ? CreateShape<S> : never;
/** The typed input for updating a record (partial; excludes id and readonly fields). */
export type Update<T> = T extends TableDef<string, infer S> ? UpdateShape<S> : never;
