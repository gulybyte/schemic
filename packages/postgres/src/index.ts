// The POSTGRES driver — driver #2, the spike's proof the seam holds for a very different database
// (see docs/MULTI-DB-SPIKE.md, Milestone 3). It produces/consumes the PORTABLE IR natively: `emit`
// translates portable types to `CREATE TABLE`, `introspect` reads `information_schema` back into the
// portable IR, and `normalize` PROJECTS the portable IR onto what Postgres can actually represent.
//
// The execution engine is PGlite (embedded Postgres in WASM) — a real engine, so the round-trip is
// genuine, and it doubles as the driver's `shadow` capability (the "embedded engine" option the
// design calls out for DBs that can't spin an in-process throwaway the way SurrealDB can).
//
// KNOWN CAPABILITY GAPS (deliberate, documented — not silent loss):
//  - `option<T>` and `T | null` BOTH collapse to a nullable column: Postgres has no column-level
//    notion of "absent" distinct from NULL, so `normalize` folds option -> nullable. This is the
//    portable model working as designed — a rich superset projected down per dialect.
//  - Nested objects map to a single `jsonb` column; the dotted sub-fields are folded in (dropped by
//    `normalize`), mirroring how the Surreal IR auto-creates `x.*` elements.
//  - Surreal-only constructs (events, access, db functions, relations, changefeed, permissions) have
//    no Postgres analogue and are dropped by `normalize` with no DDL emitted.

import type {
  ApplyOptions,
  ConnectionConfigBase,
  ConnectionEntry,
  ConnectionInput,
  ConnectionOverrides,
  Diff,
  DiffItem,
  Driver,
  EmitOptions,
  PortableDb,
  PortableField,
  PortableTable,
  PortableType,
  ResolveContext,
  ResolvedConfig,
  ScalarName,
  ShadowCapability,
  Statement,
} from "@schemic/core/driver";
import {
  connectionEntry,
  nullable,
  registerDriver,
} from "@schemic/core/driver";

// A minimal structural view of a PGlite/node-postgres connection (so core needs no hard pg dep).
export interface PgConn {
  query<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ): Promise<{ rows: T[] }>;
  exec(sql: string): Promise<unknown>;
  close(): Promise<void>;
}

// --- Type mapping (portable <-> Postgres) -------------------------------------------------------

const SCALAR_TO_PG: Partial<Record<ScalarName, string>> = {
  string: "text",
  int: "integer",
  float: "double precision",
  decimal: "numeric",
  number: "double precision",
  bool: "boolean",
  datetime: "timestamp with time zone",
  uuid: "uuid",
  bytes: "bytea",
  duration: "interval",
};

// information_schema.data_type -> portable scalar.
const PG_TO_SCALAR: Record<string, ScalarName> = {
  text: "string",
  "character varying": "string",
  character: "string",
  integer: "int",
  bigint: "int",
  smallint: "int",
  "double precision": "float",
  real: "float",
  numeric: "decimal",
  boolean: "bool",
  "timestamp with time zone": "datetime",
  "timestamp without time zone": "datetime",
  uuid: "uuid",
  bytea: "bytes",
  interval: "duration",
};

const escId = (name: string) => `"${name.replace(/"/g, '""')}"`;

/** A portable column type and how it lands in Postgres: base SQL type, nullability, and FK target. */
interface PgColumn {
  sql: string;
  nullable: boolean;
  /** A `record<table>` link -> a FK to that table (single-target only; spike scope). */
  references?: string;
}

function pgColumn(type: PortableType): PgColumn {
  // Peel option/nullable: Postgres represents both as a nullable column (the documented collapse).
  if (type.t === "option" || type.t === "nullable") {
    return { ...pgColumn(type.inner), nullable: true };
  }
  if (type.t === "scalar") {
    const sql = SCALAR_TO_PG[type.name];
    if (!sql) throw new Error(`postgres: unsupported scalar "${type.name}"`);
    return { sql, nullable: false };
  }
  if (type.t === "literal") {
    // A single literal -> its base scalar (PG has no singleton types). Enums (literal unions) below.
    const base =
      typeof type.value === "number"
        ? "double precision"
        : typeof type.value === "boolean"
          ? "boolean"
          : "text";
    return { sql: base, nullable: false };
  }
  if (type.t === "union") {
    // A union of string literals -> text (an enum-ish column; a CHECK could be added later).
    if (
      type.members.every(
        (m) => m.t === "literal" && typeof m.value === "string",
      )
    ) {
      return { sql: "text", nullable: false };
    }
    throw new Error("postgres: non-enum unions are unsupported");
  }
  if (type.t === "array" || type.t === "set") {
    const elem = pgColumn(type.elem);
    return { sql: `${elem.sql}[]`, nullable: false };
  }
  if (type.t === "object") {
    return { sql: "jsonb", nullable: false };
  }
  if (type.t === "record") {
    if (type.tables.length !== 1) {
      // Multi-target links would need a polymorphic FK; out of spike scope -> plain text id.
      return { sql: "text", nullable: false };
    }
    return { sql: "text", nullable: false, references: type.tables[0] };
  }
  if (type.t === "geometry") {
    // Would map to PostGIS `geometry`; without the extension, store GeoJSON as jsonb.
    return { sql: "jsonb", nullable: false };
  }
  if (type.t === "native") {
    if (type.db !== "postgres") {
      throw new Error(
        `postgres: native type "${type.name}" belongs to driver "${type.db}"`,
      );
    }
    return { sql: type.name, nullable: false };
  }
  throw new Error(`postgres: cannot emit type ${JSON.stringify(type)}`);
}

// --- normalize: project the portable IR onto what Postgres represents ---------------------------

/** Collapse option -> nullable (Postgres can't distinguish absence from NULL). Idempotent. */
function pgCanonType(type: PortableType): PortableType {
  if (type.t === "option") return nullable(pgCanonType(type.inner));
  if (type.t === "nullable") return nullable(pgCanonType(type.inner));
  if (type.t === "array")
    return {
      t: "array",
      elem: pgCanonType(type.elem),
      ...(type.size !== undefined ? { size: type.size } : {}),
    };
  if (type.t === "set")
    return {
      t: "set",
      elem: pgCanonType(type.elem),
      ...(type.size !== undefined ? { size: type.size } : {}),
    };
  // A nested object becomes an opaque jsonb column -> canonical empty object (sub-keys not tracked).
  if (type.t === "object") return { t: "object", fields: {} };
  return type;
}

function pgNormalizeTable(t: PortableTable): PortableTable {
  // Drop dotted sub-fields (folded into their jsonb parent) and Surreal-only field clauses; keep
  // only what a Postgres column carries: name, (canonical) type, nullability via the type.
  const fields = t.fields
    .filter((f) => !f.name.includes("."))
    .map<PortableField>((f) => ({
      name: f.name,
      table: t.name,
      type: pgCanonType(f.type),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return {
    name: t.name,
    kind: { kind: "NORMAL" }, // Postgres has no relation/any table kinds.
    schemafull: true,
    fields,
    indexes: [],
    events: [],
  };
}

function pgNormalize(db: PortableDb): PortableDb {
  return {
    tables: [...db.tables]
      .map(pgNormalizeTable)
      .sort((a, b) => a.name.localeCompare(b.name)),
    functions: [], // no portable Postgres function model in the spike
    accesses: [],
  };
}

// --- emit: portable IR -> CREATE TABLE ----------------------------------------------------------

function emitTable(t: PortableTable): Statement[] {
  const norm = pgNormalizeTable(t);
  const cols: string[] = [`${escId("id")} text PRIMARY KEY`]; // implicit id (mirrors Surreal).
  const fks: Statement[] = [];
  for (const f of norm.fields) {
    const col = pgColumn(f.type);
    cols.push(`${escId(f.name)} ${col.sql}${col.nullable ? "" : " NOT NULL"}`);
    if (col.references) {
      fks.push({
        kind: "index", // reuse a structured kind for ordering; FK applied after all tables exist.
        name: `${t.name}_${f.name}_fkey`,
        table: t.name,
        ddl: `ALTER TABLE ${escId(t.name)} ADD CONSTRAINT ${escId(
          `${t.name}_${f.name}_fkey`,
        )} FOREIGN KEY (${escId(f.name)}) REFERENCES ${escId(col.references)} (${escId("id")});`,
      });
    }
  }
  const create: Statement = {
    kind: "table",
    name: t.name,
    ddl: `CREATE TABLE ${escId(t.name)} (\n  ${cols.join(",\n  ")}\n);`,
  };
  return [create, ...fks];
}

function pgEmit(db: PortableDb, _opts?: EmitOptions): Statement[] {
  // All CREATE TABLEs first, then all FK constraints (so referenced tables already exist).
  const tables = [...db.tables].sort((a, b) => a.name.localeCompare(b.name));
  const stmts = tables.flatMap(emitTable);
  const RANK: Record<string, number> = {
    table: 0,
    field: 1,
    index: 2,
    event: 3,
    function: 4,
    access: 5,
  };
  return [...stmts].sort((a, b) => (RANK[a.kind] ?? 9) - (RANK[b.kind] ?? 9));
}

/** DROP DDL for one Postgres object. (Postgres emits per-table, so objects are tables + FK constraints.) */
function pgRemove(s: Statement): string {
  if (s.kind === "index" && s.table) {
    // The FK-constraint statements pgEmit produces (ALTER TABLE … ADD CONSTRAINT).
    return `ALTER TABLE ${escId(s.table)} DROP CONSTRAINT IF EXISTS ${escId(s.name)};`;
  }
  return `DROP TABLE IF EXISTS ${escId(s.name)} CASCADE;`;
}

/**
 * Replace one Postgres object. Postgres has no in-place CREATE-OR-REPLACE for tables, so a changed
 * table is drop+recreate (COARSE — destructive of row data). Per-column ALTERs are a future
 * refinement once the portable diff tracks field-level changes for the pg driver.
 */
function pgOverwrite(s: Statement): string {
  return `${pgRemove(s)}\n${s.ddl}`;
}

// --- diff: FIELD-LEVEL Postgres DDL (ALTER TABLE), not whole-table drop+recreate ----------------

/** A column definition body (`"name" type [NOT NULL]`) for ADD COLUMN / CREATE TABLE. */
function colDef(f: PortableField): string {
  const c = pgColumn(f.type);
  return `${escId(f.name)} ${c.sql}${c.nullable ? "" : " NOT NULL"}`;
}
const fkName = (table: string, field: string) => `${table}_${field}_fkey`;
const addColSql = (table: string, f: PortableField) =>
  `ALTER TABLE ${escId(table)} ADD COLUMN ${colDef(f)};`;
const dropColSql = (table: string, field: string) =>
  `ALTER TABLE ${escId(table)} DROP COLUMN IF EXISTS ${escId(field)};`;
const addFkSql = (table: string, field: string, ref: string) =>
  `ALTER TABLE ${escId(table)} ADD CONSTRAINT ${escId(fkName(table, field))} FOREIGN KEY (${escId(field)}) REFERENCES ${escId(ref)} (${escId("id")});`;
const dropFkSql = (table: string, field: string) =>
  `ALTER TABLE ${escId(table)} DROP CONSTRAINT IF EXISTS ${escId(fkName(table, field))};`;
const dropTableSql = (table: string) =>
  `DROP TABLE IF EXISTS ${escId(table)} CASCADE;`;

/** One ordered diff op: forward `up` DDL, the `down` DDL that undoes it (internal order preserved). */
interface PgOp {
  up: string[];
  down: string[];
  items: DiffItem[];
}

/**
 * Field-level Postgres diff. Tables present on BOTH sides diff column-by-column into ALTER TABLE
 * ADD/DROP/ALTER COLUMN — so adding a column no longer drops the table's rows (the old coarse
 * drop+recreate). Whole tables added/removed still CREATE / DROP CASCADE. Ops are built in up-
 * dependency order (all CREATEs before FKs; column drops/table drops last); `down` is the inverse
 * run backwards (ops reversed, each op's own DDL inverted). A column TYPE change is best-effort —
 * Postgres attempts the cast and an incompatible change surfaces at apply.
 */
function pgDiff(prev: PortableDb, next: PortableDb): Diff {
  const a = pgNormalize(prev);
  const b = pgNormalize(next);
  const prevT = new Map(a.tables.map((t) => [t.name, t]));
  const nextT = new Map(b.tables.map((t) => [t.name, t]));
  const refOf = (f: PortableField) => pgColumn(f.type).references;

  const ops: PgOp[] = [];
  const add = (op: PgOp) => ops.push(op);

  // 1) New tables: CREATE first (all of them), then their FKs — so a cross-table FK finds its target.
  const newTables = b.tables.filter((t) => !prevT.has(t.name));
  for (const t of newTables) {
    const create = `CREATE TABLE ${escId(t.name)} (\n  ${[`${escId("id")} text PRIMARY KEY`, ...t.fields.map((f) => colDef(f))].join(",\n  ")}\n);`;
    add({
      up: [create],
      down: [dropTableSql(t.name)],
      items: [
        {
          op: "add",
          key: `table:${t.name}:${t.name}`,
          kind: "table",
          table: t.name,
          ddl: create,
        },
      ],
    });
  }
  for (const t of newTables) {
    for (const f of t.fields) {
      const ref = refOf(f);
      if (!ref) continue;
      add({
        up: [addFkSql(t.name, f.name, ref)],
        down: [dropFkSql(t.name, f.name)],
        items: [
          {
            op: "add",
            key: `index:${t.name}:${fkName(t.name, f.name)}`,
            kind: "index",
            table: t.name,
            ddl: addFkSql(t.name, f.name, ref),
          },
        ],
      });
    }
  }

  // 2) Tables on BOTH sides: column-level ALTERs.
  for (const t of b.tables) {
    const before = prevT.get(t.name);
    if (!before) continue;
    const beforeF = new Map(before.fields.map((f) => [f.name, f]));
    const afterF = new Map(t.fields.map((f) => [f.name, f]));

    // added columns (+ FK)
    for (const f of t.fields) {
      if (beforeF.has(f.name)) continue;
      const ref = refOf(f);
      const up = [
        addColSql(t.name, f),
        ...(ref ? [addFkSql(t.name, f.name, ref)] : []),
      ];
      add({
        up,
        down: [dropColSql(t.name, f.name)], // DROP COLUMN cascades to its FK
        items: [
          {
            op: "add",
            key: `field:${t.name}:${f.name}`,
            kind: "field",
            table: t.name,
            ddl: addColSql(t.name, f),
          },
        ],
      });
    }

    // changed columns (type and/or nullability)
    for (const f of t.fields) {
      const bf = beforeF.get(f.name);
      if (!bf) continue;
      const ca = pgColumn(f.type);
      const cb = pgColumn(bf.type);
      if (ca.sql === cb.sql && ca.nullable === cb.nullable) continue;
      const upStmts: string[] = [];
      const downStmts: string[] = [];
      if (ca.sql !== cb.sql) {
        upStmts.push(
          `ALTER TABLE ${escId(t.name)} ALTER COLUMN ${escId(f.name)} TYPE ${ca.sql};`,
        );
        downStmts.push(
          `ALTER TABLE ${escId(t.name)} ALTER COLUMN ${escId(f.name)} TYPE ${cb.sql};`,
        );
      }
      if (ca.nullable !== cb.nullable) {
        const setNull = (n: boolean) =>
          `ALTER TABLE ${escId(t.name)} ALTER COLUMN ${escId(f.name)} ${n ? "DROP NOT NULL" : "SET NOT NULL"};`;
        upStmts.push(setNull(ca.nullable));
        downStmts.push(setNull(cb.nullable));
      }
      add({
        up: upStmts,
        down: downStmts,
        items: [
          {
            op: "change",
            key: `field:${t.name}:${f.name}`,
            kind: "field",
            table: t.name,
            before: `${escId(f.name)} ${cb.sql}${cb.nullable ? "" : " NOT NULL"}`,
            after: `${escId(f.name)} ${ca.sql}${ca.nullable ? "" : " NOT NULL"}`,
          },
        ],
      });
    }

    // dropped columns (DROP COLUMN cascades to its FK; recreate adds the column back + FK on down)
    for (const f of before.fields) {
      if (afterF.has(f.name)) continue;
      const ref = refOf(f);
      add({
        up: [dropColSql(t.name, f.name)],
        down: [
          addColSql(t.name, f),
          ...(ref ? [addFkSql(t.name, f.name, ref)] : []),
        ],
        items: [
          {
            op: "remove",
            key: `field:${t.name}:${f.name}`,
            kind: "field",
            table: t.name,
            ddl: dropColSql(t.name, f.name),
            old: addColSql(t.name, f),
          },
        ],
      });
    }
  }

  // 3) Removed tables: DROP CASCADE up / recreate (table then FKs) down.
  for (const t of a.tables) {
    if (nextT.has(t.name)) continue;
    const create = `CREATE TABLE ${escId(t.name)} (\n  ${[`${escId("id")} text PRIMARY KEY`, ...t.fields.map((f) => colDef(f))].join(",\n  ")}\n);`;
    const fks = t.fields
      .map((f) => ({ f, ref: refOf(f) }))
      .filter((x) => x.ref)
      .map((x) => addFkSql(t.name, x.f.name, x.ref as string));
    add({
      up: [dropTableSql(t.name)],
      down: [create, ...fks],
      items: [
        {
          op: "remove",
          key: `table:${t.name}:${t.name}`,
          kind: "table",
          table: t.name,
          ddl: dropTableSql(t.name),
          old: create,
        },
      ],
    });
  }

  const up = ops.flatMap((o) => o.up);
  // `down` undoes `up`: reverse the op order, each op contributing its own (internally-ordered) down.
  const down = [...ops].reverse().flatMap((o) => o.down);
  const items = ops.flatMap((o) => o.items);
  return { up, down, items };
}

// --- introspect: information_schema -> portable IR ----------------------------------------------

interface ColRow {
  table_name: string;
  column_name: string;
  data_type: string;
  udt_name: string;
  is_nullable: string;
}
interface FkRow {
  table_name: string;
  column_name: string;
  foreign_table_name: string;
}

function scalarFromPg(dataType: string, udtName: string): PortableType {
  if (dataType === "ARRAY") {
    // udt_name is the element type prefixed with `_` (e.g. `_int4`, `_text`).
    const elem = pgScalarFromUdt(udtName.replace(/^_/, ""));
    return { t: "array", elem };
  }
  if (dataType === "jsonb" || dataType === "json") {
    return { t: "object", fields: {} };
  }
  const name = PG_TO_SCALAR[dataType];
  if (!name) return { t: "native", db: "postgres", name: dataType };
  return { t: "scalar", name };
}

const UDT_TO_SCALAR: Record<string, ScalarName> = {
  text: "string",
  varchar: "string",
  int4: "int",
  int8: "int",
  int2: "int",
  float8: "float",
  float4: "float",
  numeric: "decimal",
  bool: "bool",
  timestamptz: "datetime",
  timestamp: "datetime",
  uuid: "uuid",
  bytea: "bytes",
  interval: "duration",
};
function pgScalarFromUdt(udt: string): PortableType {
  const name = UDT_TO_SCALAR[udt];
  return name
    ? { t: "scalar", name }
    : { t: "native", db: "postgres", name: udt };
}

async function pgIntrospect(
  conn: PgConn,
  exclude: Set<string> = new Set(),
): Promise<PortableDb> {
  const { rows: cols } = await conn.query<ColRow>(
    `SELECT table_name, column_name, data_type, udt_name, is_nullable
       FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position`,
  );
  const { rows: fks } = await conn.query<FkRow>(
    `SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
       JOIN information_schema.constraint_column_usage ccu
         ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'`,
  );
  const fkBy = new Map<string, string>(); // `table.col` -> foreign table
  for (const f of fks)
    fkBy.set(`${f.table_name}.${f.column_name}`, f.foreign_table_name);

  const byTable = new Map<string, PortableField[]>();
  for (const c of cols) {
    if (exclude.has(c.table_name)) continue;
    if (c.column_name === "id") continue; // implicit PK, not part of the portable IR.
    let type: PortableType;
    const fkTarget = fkBy.get(`${c.table_name}.${c.column_name}`);
    if (fkTarget) {
      type = { t: "record", tables: [fkTarget] };
    } else {
      type = scalarFromPg(c.data_type, c.udt_name);
    }
    if (c.is_nullable === "YES") type = nullable(type);
    const list = byTable.get(c.table_name) ?? [];
    list.push({ name: c.column_name, table: c.table_name, type });
    byTable.set(c.table_name, list);
  }

  const tables: PortableTable[] = [...byTable.entries()].map(
    ([name, fields]) => ({
      name,
      kind: { kind: "NORMAL" },
      schemafull: true,
      fields,
      indexes: [],
      events: [],
    }),
  );
  return { tables, functions: [], accesses: [] };
}

// --- connection (PGlite, embedded) --------------------------------------------------------------

async function newPglite(dataDir?: string): Promise<PgConn> {
  const pkg: string = "@electric-sql/pglite"; // non-literal so it stays an optional dep.
  let PGlite: (new (dir?: string) => PgConn) | undefined;
  try {
    const mod = (await import(pkg)) as {
      PGlite?: new (dir?: string) => PgConn;
    };
    PGlite = mod.PGlite;
  } catch {
    PGlite = undefined;
  }
  if (!PGlite) {
    throw new Error(
      "postgres driver needs `@electric-sql/pglite` (embedded) — install it, or wire a node-postgres client.",
    );
  }
  return new PGlite(dataDir);
}

const shadow: ShadowCapability<PgConn> = {
  // A throwaway in-memory PGlite IS the shadow: apply the DDL, read it back, done (no drop needed —
  // the instance is discarded). This is the "embedded engine" canonicalization path.
  async roundTrip(_conn, _config, ddl) {
    const scratch = await newPglite();
    try {
      if (ddl.trim()) await scratch.exec(ddl);
      return pgNormalize(await pgIntrospect(scratch));
    } finally {
      await scratch.close();
    }
  },
  async ephemeral() {
    const conn = await newPglite();
    return { conn, stop: () => conn.close() };
  },
};

// --- pgSql: a safe tagged-template query builder (the Postgres analogue of `surql`) -------------

/** A bound Postgres query: text with positional `$1..$n` placeholders + the values bound to them. */
export interface BoundPgQuery {
  query: string;
  params: unknown[];
}

/** A raw SQL fragment spliced VERBATIM into a `pgSql` template (NOT parameterized — caller-trusted). */
interface PgFragment {
  readonly __pgRaw: string;
}
const isFragment = (v: unknown): v is PgFragment =>
  typeof v === "object" && v !== null && "__pgRaw" in v;
const isBound = (v: unknown): v is BoundPgQuery =>
  typeof v === "object" &&
  v !== null &&
  typeof (v as BoundPgQuery).query === "string" &&
  Array.isArray((v as BoundPgQuery).params);

/** Splice a raw SQL string verbatim (NOT parameterized — only for caller-trusted SQL). */
export function raw(sql: string): PgFragment {
  return { __pgRaw: sql };
}

/** A safely double-quoted identifier (table/column) to splice into a `pgSql` template. */
export function identifier(name: string): PgFragment {
  return { __pgRaw: escId(name) };
}

/**
 * Tagged-template SQL builder — the Postgres analogue of SurrealDB's `surql`. Interpolated values
 * become positional bind params (`$1..$n`), so values are never string-interpolated (injection-safe).
 * Wrap a value in {@link raw} / {@link identifier} to splice SQL STRUCTURE instead of a param, and a
 * nested `pgSql` composes (its placeholders renumber, its params merge). Returns a {@link BoundPgQuery}
 * — it does NOT execute; pass it to `postgresDriver.query` / `conn.query`, or nest it in another `pgSql`.
 *
 *   pgSql`SELECT * FROM ${identifier("user")} WHERE id = ${id}`
 *   // -> { query: 'SELECT * FROM "user" WHERE id = $1', params: [id] }
 */
export function pgSql(
  strings: TemplateStringsArray,
  ...values: unknown[]
): BoundPgQuery {
  let query = "";
  const params: unknown[] = [];
  strings.forEach((str, i) => {
    query += str;
    if (i >= values.length) return;
    const v = values[i];
    if (isFragment(v)) {
      query += v.__pgRaw;
    } else if (isBound(v)) {
      // Compose: renumber the nested query's $n by the params already collected, then merge.
      query += v.query.replace(
        /\$(\d+)/g,
        (_m, n) => `$${params.length + Number(n)}`,
      );
      params.push(...v.params);
    } else {
      params.push(v);
      query += `$${params.length}`;
    }
  });
  return { query, params };
}

// --- postgresConnection: the multi-connection authoring factory ---------------------------------

/** Postgres connection params, on top of the dialect-neutral base ({schema, key?, migrations?}). */
export interface PostgresConnectionConfig extends ConnectionConfigBase {
  /**
   * Where to connect. `file:<dir>` (or a bare path) -> embedded PGlite data dir; empty/omitted ->
   * in-memory PGlite. A `postgres://` URL is reserved for a future node-postgres client.
   */
  url?: string;
}

/**
 * Typed `postgresConnection(...)` factory — the only thing a config's `connections` map accepts for
 * this driver. Wraps {@link connectionEntry} with the Postgres connection shape. Pass a static config,
 * a resolver yielding one config, or a resolver yielding a keyed COLLECTION (each entry needs `key`).
 */
export function postgresConnection(
  config: PostgresConnectionConfig,
): ConnectionEntry;
export function postgresConnection(
  resolver: (
    ctx: ResolveContext,
  ) => PostgresConnectionConfig | Promise<PostgresConnectionConfig>,
): ConnectionEntry;
export function postgresConnection(
  resolver: (
    ctx: ResolveContext,
  ) =>
    | (PostgresConnectionConfig & { key: string })[]
    | Promise<(PostgresConnectionConfig & { key: string })[]>,
): ConnectionEntry;
export function postgresConnection(
  input: ConnectionInput<PostgresConnectionConfig>,
): ConnectionEntry {
  return connectionEntry("postgres", input);
}

export const postgresDriver: Driver<PgConn> = {
  name: "postgres",

  // Postgres authoring (a pg-native `sz`) is future work; for now `lower` is unused (the spike
  // authors with the Surreal surface and targets pg via the portable IR). Throw a clear error.
  lower() {
    throw new Error(
      "postgres: native authoring (sz.pg.*) is not part of the spike — author via the portable IR.",
    );
  },

  emit: pgEmit,
  remove: pgRemove,
  overwrite: pgOverwrite,
  introspect: (conn, exclude) => pgIntrospect(conn, exclude),
  normalize: pgNormalize,
  equal: (a, b) => deepEqualJson(pgNormalize(a), pgNormalize(b)),
  diff: pgDiff,

  /**
   * Raw READ query for connection RESOLVERS + seed (returns rows opaquely). Postgres binds
   * POSITIONALLY, so the uniform `vars` record is mapped onto `$1..$n`: a string with NAMED `$name`
   * placeholders + `vars` is rewritten to positional `$1..$n` with `vars` bound by name (never
   * string-interpolated); native numeric `$1` is left untouched; no `vars` -> run as-is. To build a
   * query safely from interpolated values, use {@link pgSql} (positional) and run it via the raw
   * connection: `conn.query(q.query, q.params)` — that also avoids rewriting `$` inside string literals.
   */
  async query<T = unknown>(
    conn: PgConn,
    sql: string,
    vars?: Record<string, unknown>,
  ): Promise<T[]> {
    if (!vars || Object.keys(vars).length === 0) {
      return (await conn.query<T>(sql)).rows;
    }
    const params: unknown[] = [];
    const text = sql.replace(
      /\$([A-Za-z_][A-Za-z0-9_]*)/g,
      (_m, name: string) => {
        if (!(name in vars)) {
          throw new Error(`postgres query: no binding for $${name}`);
        }
        params.push(vars[name]);
        return `$${params.length}`;
      },
    );
    return (await conn.query<T>(text, params)).rows;
  },

  connect(
    config: ResolvedConfig,
    _over?: ConnectionOverrides,
  ): Promise<PgConn> {
    // PGlite is embedded; treat a `file:`/path url as a data dir, else in-memory.
    const url = config.db?.url ?? "";
    const dir = url.startsWith("file:") ? url.slice("file:".length) : undefined;
    return newPglite(dir);
  },

  async apply(
    conn: PgConn,
    statements: string[],
    opts?: ApplyOptions,
  ): Promise<void> {
    if (!statements.length) return;
    const body = statements.join("\n");
    if (opts?.transactional === false) {
      await conn.exec(body);
      return;
    }
    await conn.exec(`BEGIN;\n${body}\nCOMMIT;`);
  },

  close(conn: PgConn): Promise<void> {
    return conn.close();
  },

  shadow,
};

/** A small structural deep-equal (the portable IR is plain JSON). */
function deepEqualJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

registerDriver(postgresDriver as Driver<unknown>);
