/**
 * Shared kit for the @schemic/surrealdb REFERENCE example suite.
 *
 * Each example pairs the TypeScript authoring (`s.*` / `define*`) with the exact SurrealQL DDL it
 * emits. The `ddl` field is the GOLDEN — `test/examples/reference.test.ts` asserts `emit(defs) === ddl`
 * for every example, so the catalog can never drift from what the driver actually produces: change the
 * emit and the suite fails until the reference is updated.
 *
 * This is a pure-emit catalog (no live database) — it documents authoring -> DDL. Round-trip fidelity
 * (apply -> introspect -> diff = 0, and `pull` regeneration) is proven separately by the live parity
 * suites in `test/parity/*` against SurrealDB 3.1.3.
 */
import { emitDefStatement, emitTable } from "../src/ddl";
import { type StandaloneDef, TableDef } from "../src/pure";

/** A top-level schema object: a table/relation/view (a `TableDef`) or a standalone `define*`. */
// biome-ignore lint/suspicious/noExplicitAny: heterogeneous example schemas — the Shape varies per table.
export type Definable = TableDef<string, any> | StandaloneDef;

/** One catalog entry: authoring + the SurrealQL it emits (the asserted golden). */
export interface Example {
  /** The feature / syntax this entry demonstrates (also the test name). */
  title: string;
  /** Optional caveat — round-trip behavior, a known gap, or a `[~]`/`[ ]` note from COVERAGE.md. */
  note?: string;
  /** The authored schema objects, in emit order. */
  defs: Definable[];
  /** The exact SurrealQL `defs` emit. Asserted by the reference test. */
  ddl: string;
}

/** A named group of examples (one source file in this folder). */
export interface ExampleGroup {
  /** The file these examples live in (for the test's `describe` label). */
  file: string;
  /** What the file covers. */
  about: string;
  examples: Example[];
}

/**
 * Emit a set of definables to SurrealQL — tables/relations/views via `emitTable`, standalone `define*`
 * via `emitDefStatement` — joined with a blank line between each top-level object. This is the exact
 * function the reference test asserts against, and a handy "what does this produce?" helper.
 */
export function emit(defs: Definable[]): string {
  return defs
    .map((d) =>
      d instanceof TableDef ? emitTable(d) : emitDefStatement(d).ddl,
    )
    .join("\n\n");
}
