import { existsSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type {
  AuthLevel,
  SurrealZodCheckEmbedded,
  SurrealZodConfig,
  SurrealZodConnection,
} from "@schemic/core/config";
import { createJiti } from "jiti";

const CONFIG_NAMES = [
  "schemic.config.ts",
  "schemic.config.mjs",
  "schemic.config.js",
];

const DEFAULT_SCHEMA = "./database/schema";
const DEFAULT_MIGRATIONS = "./database/migrations";

/**
 * Is the schema path a single file (vs a directory of schema modules)? Determined by `stat` when
 * it exists, else inferred from a `.ts`/`.js`-ish extension (so a fresh `schema: "./src/x.ts"`
 * still resolves to file mode before any pull has written it).
 */
function schemaIsFilePath(path: string): boolean {
  if (existsSync(path)) return statSync(path).isFile();
  return /\.[mc]?[jt]s$/.test(path);
}

/**
 * Load `.env(.local)` from the project root into `process.env` so the config's
 * `process.env.SURREAL_*` reads resolve when run under node (bun loads `.env` itself).
 * `loadEnvFile` does not override already-set variables, so shell env still wins; load
 * `.env.local` first so it takes precedence over `.env`.
 */
function loadDotEnv(dir: string): void {
  const proc = process as typeof process & {
    loadEnvFile?: (path: string) => void;
  };
  if (typeof proc.loadEnvFile !== "function") return;
  for (const name of [".env.local", ".env"]) {
    const file = resolve(dir, name);
    if (!existsSync(file)) continue;
    try {
      proc.loadEnvFile(file);
    } catch {
      // ignore a malformed .env file
    }
  }
}

/** A loaded config with absolute paths resolved relative to the config file. */
export interface ResolvedConfig extends SurrealZodConfig {
  /** Project root (the directory containing the config file). */
  root: string;
  /** Absolute schema path — a single `.ts` module, or a directory of them. */
  schemaPath: string;
  /** Whether `schemaPath` is a single file (vs a directory of schema modules). */
  schemaIsFile: boolean;
  /** Absolute migrations directory. */
  migrationsDir: string;
  /** Absolute migration meta directory (the snapshot). */
  metaDir: string;
  /** Name of the table that records applied migrations. */
  migrationsTable: string;
  /** Connection for `schemic check`'s remote-engine replay (`config.check.db` merged over `db`). */
  checkDb: SurrealZodConnection;
  /** Engine for `schemic check`'s migration replay. Default `"auto"`; an object → embedded engine. */
  checkEngine: "auto" | "binary" | "remote" | SurrealZodCheckEmbedded;
  /** Path to the `surreal` CLI for the auto/binary check engines. Default `"surreal"`. */
  checkBinary: string;
}

/**
 * A jiti instance for loading the project's TS/ESM modules. Caches are off so `--watch`
 * re-reads edited schema files instead of returning a stale cached module. (Bare deps like
 * `@schemic/core` are still native-imported, so its codec registries stay shared.)
 */
export function makeJiti() {
  return createJiti(import.meta.url, {
    interopDefault: true,
    fsCache: false,
    moduleCache: false,
  });
}

/** Find, load, and normalize `schemic.config.ts`, applying env overrides for `db`. */
export async function loadConfig(opts?: {
  config?: string;
  cwd?: string;
}): Promise<ResolvedConfig> {
  const cwd = opts?.cwd ?? process.cwd();
  const path = opts?.config
    ? resolve(cwd, opts.config)
    : CONFIG_NAMES.map((n) => resolve(cwd, n)).find((p) => existsSync(p));
  if (!path || !existsSync(path)) {
    throw new Error("No schemic.config.ts found — run `schemic init` first.");
  }

  const root = dirname(path);
  loadDotEnv(root); // populate process.env before the config module reads it

  const jiti = makeJiti();
  const loaded = (await jiti.import(path)) as {
    default?: SurrealZodConfig;
  } & SurrealZodConfig;
  const config = loaded.default ?? loaded;
  if (!config?.db) {
    throw new Error(`Invalid config at ${path}: expected a "db" connection.`);
  }

  const schema = config.schema ?? DEFAULT_SCHEMA;
  const schemaPath = resolve(root, schema);
  const migrations = config.migrations ?? DEFAULT_MIGRATIONS;
  const migrationsDir = resolve(root, migrations);
  const db: SurrealZodConnection = {
    url: process.env.SURREAL_URL ?? config.db.url,
    namespace: process.env.SURREAL_NAMESPACE ?? config.db.namespace,
    database: process.env.SURREAL_DATABASE ?? config.db.database,
    username: process.env.SURREAL_USER ?? config.db.username,
    password: process.env.SURREAL_PASS ?? config.db.password,
    authLevel:
      (process.env.SURREAL_AUTH_LEVEL as AuthLevel | undefined) ??
      config.db.authLevel,
  };
  // `check.db` overrides only the fields it sets (e.g. just `url`/`namespace`), falling back to `db`.
  const checkDb: SurrealZodConnection = { ...db, ...config.check?.db };
  return {
    ...config,
    schema,
    migrations,
    db,
    checkDb,
    checkEngine: config.check?.engine ?? "auto",
    checkBinary: config.check?.binary ?? "surreal",
    root,
    schemaPath,
    schemaIsFile: schemaIsFilePath(schemaPath),
    migrationsDir,
    metaDir: resolve(migrationsDir, "meta"),
    migrationsTable: config.migrationsTable ?? "_migrations",
  };
}

/** Per-command connection flag overrides (CLI args beat env beat config). */
export interface ConnectionOverrides {
  url?: string;
  namespace?: string;
  database?: string;
  username?: string;
  password?: string;
  authLevel?: AuthLevel;
}
