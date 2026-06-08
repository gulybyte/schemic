import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { Shape, TableDef } from "surreal-zod";
import { makeJiti } from "./config";

export type AnyTable = TableDef<string, Shape>;

/**
 * Duck-typed `TableDef` check. We avoid `instanceof` on purpose: the user's schema and the
 * CLI may end up with different module instances of `surreal-zod`, so we recognize a table
 * by shape instead. (Structural access into `emitStatements` works regardless.)
 */
function isTableDef(v: unknown): v is AnyTable {
  if (!v || typeof v !== "object") return false;
  const t = v as Record<string, unknown>;
  return (
    typeof t.name === "string" &&
    typeof t.fields === "object" &&
    t.fields !== null &&
    typeof t.config === "object" &&
    t.config !== null &&
    typeof t.record === "function"
  );
}

function tsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir).sort()) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...tsFiles(p));
    else if (/\.(ts|mts|js|mjs)$/.test(entry) && !entry.endsWith(".d.ts"))
      out.push(p);
  }
  return out;
}

/**
 * Load every schema module under `schemaDir` and return its tables/relations, ordered with
 * normal tables before relations (and by name) for stable, dependency-friendly DDL.
 */
export async function loadSchemas(schemaDir: string): Promise<AnyTable[]> {
  if (!existsSync(schemaDir)) {
    throw new Error(`Schema directory not found: ${schemaDir}`);
  }
  const jiti = makeJiti();
  const defs = new Map<string, AnyTable>();
  for (const file of tsFiles(schemaDir)) {
    const mod = (await jiti.import(file)) as Record<string, unknown>;
    for (const value of Object.values(mod)) {
      if (isTableDef(value)) defs.set(value.name, value); // last definition of a name wins
    }
  }
  const rank = (t: AnyTable) => (t.config.relation ? 1 : 0);
  return [...defs.values()].sort(
    (a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name),
  );
}
