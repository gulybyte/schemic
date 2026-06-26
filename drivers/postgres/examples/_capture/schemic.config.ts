import { defineConfig } from "@schemic/core/config";
import { postgresConnection } from "@schemic/postgres";

// Connections-only config: a map of named connections, each from a driver factory. Values are
// explicit — read env yourself (no magic env vars).
export default defineConfig({
  connections: {
    default: postgresConnection({
      schema: "./database/schema",
      // PGlite (embedded): `file:<dir>` is a persistent data dir; "" is in-memory. Point
      // DATABASE_URL at a real server (`postgres://…`) once the node-postgres client lands.
      url: process.env.DATABASE_URL ?? "file:./.pgdata",
    }),
  },
});
