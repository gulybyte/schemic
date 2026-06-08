/**
 * Configuration for the `surreal-zod` CLI. Author it in `surreal-zod.config.ts`:
 *
 * ```ts
 * import { defineConfig } from "surreal-zod/config";
 *
 * export default defineConfig({
 *   db: {
 *     url: process.env.SURREAL_URL ?? "ws://localhost:8000",
 *     namespace: "app",
 *     database: "app",
 *     username: process.env.SURREAL_USER,
 *     password: process.env.SURREAL_PASS,
 *   },
 * });
 * ```
 *
 * `schema` and `migrations` are optional — they default to `./database/schemas` and
 * `./database/migrations` (the `init` layout).
 *
 * Connection fields fall back to env (`SURREAL_URL`/`SURREAL_NAMESPACE`/`SURREAL_DATABASE`/
 * `SURREAL_USER`/`SURREAL_PASS`) and can be overridden by CLI flags at run time.
 */
/** Which level to authenticate at — mirrors `surreal sql --auth-level`. */
export type AuthLevel = "root" | "namespace" | "database";

export interface SurrealZodConnection {
  /** Endpoint, e.g. `ws://localhost:8000` or `http://localhost:8000`. */
  url: string;
  /** Target namespace. */
  namespace: string;
  /** Target database. */
  database: string;
  /** Auth username. */
  username?: string;
  /** Auth password. */
  password?: string;
  /**
   * Level to sign in at: `root` (default), `namespace`, or `database`. Determines the
   * signin payload — `namespace`/`database` scope the credentials to that ns/db.
   */
  authLevel?: AuthLevel;
}

export interface SurrealZodConfig {
  /** Directory holding your Zod schema modules (loaded recursively). Default `./database/schemas`. */
  schema?: string;
  /** Directory holding `.surql` migrations + their `meta/` snapshot. Default `./database/migrations`. */
  migrations?: string;
  /** SurrealDB connection. Individual fields fall back to env / CLI flags. */
  db: SurrealZodConnection;
  /** Table that records applied migrations. Defaults to `_migrations`. */
  migrationsTable?: string;
  /** Optional seed script run by `surreal-zod seed`. */
  seed?: string;
}

/** Identity helper that types a `surreal-zod.config.ts` default export. */
export function defineConfig(config: SurrealZodConfig): SurrealZodConfig {
  return config;
}
