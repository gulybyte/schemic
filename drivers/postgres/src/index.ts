// `@schemic/postgres` — the AUTHORING surface (pg-native `s.*`, `defineTable`/`define*`, the `$postgres`
// escape hatch, App/Wire inference) plus the connection re-exports. This entry is SIDE-EFFECT-FREE and
// engine-free: importing it never pulls the diff/emit engine OR the `registerDriver` side-effect — those
// live behind `@schemic/postgres/driver` (the CLI loads that subpath to register). The connection
// surface (`PgConn`/`postgresConnection`/`pgSql`) is re-exported here for convenience from the likewise
// side-effect-free `./connection`. The opt-in query builder is `@schemic/postgres/query`.

import type { SeedContext } from "@schemic/core";
import type { PgConn } from "./connection";

// The pg-native authoring surface (`s.*`, defineTable, PgField, $postgres escape hatch, …).
export * from "./authoring";

// The connection surface (side-effect-free) — re-exported so `@schemic/postgres` stays the one-stop
// import for authoring + connecting; the engine still only loads via `@schemic/postgres/driver`.
export {
  type BoundPgQuery,
  identifier,
  type PgConn,
  type PostgresConnectionConfig,
  pgSql,
  postgresConnection,
  raw,
} from "./connection";

/** A seed function: receives the live {@link PgConn} + the dialect-neutral {@link SeedContext}. */
export type PgSeed = (db: PgConn, ctx: SeedContext) => void | Promise<void>;
/**
 * Type a `database/seed/*` module — an identity wrapper (like `defineConfig`) so a seed gets full
 * typing for `(db, ctx)` with no imports of the connection/context types. The seed runner calls the
 * default export as `seed(db, ctx)`; `ctx.file(name)` reads a supporting file (raw `.sql`, JSON, …)
 * relative to the seed as a string, `ctx.dir` is its directory.
 */
export function defineSeed(fn: PgSeed): PgSeed {
  return fn;
}
