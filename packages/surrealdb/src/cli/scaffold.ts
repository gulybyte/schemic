// The files `schemic init` writes for a fresh SurrealDB project — a connections-only config via the
// surrealConnection factory, a sample s.* schema, a seed stub, and a .env.example. The CLI (dialect-
// free) calls surrealDriver.initScaffold() and writes these verbatim, then records the neutral snapshot.

const CONFIG = `import { defineConfig } from "@schemic/core/config";
import { surrealConnection } from "@schemic/surrealdb";

// Connections-only config: each named connection comes from a driver's \`<driver>Connection(...)\`
// factory, so there's no \`driver: "…"\` string to keep in sync. Values are explicit — read env here
// yourself (no implicit SURREAL_* magic). Add more named connections for multi-tenant / multi-DB setups.
export default defineConfig({
  connections: {
    default: surrealConnection({
      schema: "./database/schema",
      url: process.env.SURREAL_URL ?? "ws://127.0.0.1:8000/rpc",
      namespace: process.env.SURREAL_NAMESPACE ?? "app",
      database: process.env.SURREAL_DATABASE ?? "app",
      username: process.env.SURREAL_USER,
      password: process.env.SURREAL_PASS,
      authLevel: "root", // "root" | "namespace" | "database"
      // \`schemic check\` replays migrations into a throwaway engine; defaults to an ephemeral in-memory
      // SurrealDB from your local \`surreal\` CLI. Override here, e.g.:
      // check: { engine: "remote", db: { url: "ws://localhost:8000", namespace: "scratch" } },
    }),
  },
});
`;

const USER_TABLE = `import { defineTable, s, surql } from "@schemic/surrealdb";

// A SCHEMAFULL \`user\` table. Each field is a \`s.*\` builder (a drop-in for Zod's \`z.*\`) that also
// carries its SurrealQL DDL — \`s.email()\` validates the address, \`.unique()\` defines a UNIQUE index,
// and \`$default\`/\`$readonly\` map to the DEFAULT / READONLY clauses.
export const User = defineTable("user", {
  name: s.string().$assert(surql\`string::len($value) > 0\`),
  email: s.email().unique(),
  createdAt: s.datetime().$default(surql\`time::now()\`).$readonly(),
}).schemafull();
`;

const SEED = `import { RecordId, type Surreal } from "surrealdb";

/** Run with \`schemic seed\` — receives a connected client. */
export default async function seed(db: Surreal) {
  await db.create(new RecordId("user", "ada")).content({
    name: "Ada Lovelace",
    email: "ada@example.com",
  });
}
`;

const ENV_EXAMPLE = `# Point these at your SurrealDB. The config reads them explicitly (no implicit SURREAL_* magic).
SURREAL_URL=ws://127.0.0.1:8000/rpc
SURREAL_NAMESPACE=app
SURREAL_DATABASE=app
SURREAL_USER=root
SURREAL_PASS=root
`;

/** The dialect-specific files `schemic init` writes, keyed by project-relative path. */
export function initScaffold(): Record<string, string> {
  return {
    "schemic.config.ts": CONFIG,
    "database/schema/tables/user.ts": USER_TABLE,
    "database/seed.ts": SEED,
    ".env.example": ENV_EXAMPLE,
  };
}
