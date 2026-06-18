/**
 * Shared kit for the @schemic/surrealdb REFERENCE example cookbook.
 *
 * Each example is authored ONCE as a `code` string — the verbatim `s.*` / `define*` snippet — and its
 * `defs` are DERIVED by evaluating that snippet (`ex()` below). So `code`, `defs`, and the golden `ddl`
 * can never disagree: `test/examples/reference.test.ts` asserts `emit(defs) === ddl`, which (since
 * `defs = eval(code)`) is exactly `emit(eval(code)) === ddl` — the strong honesty check from the
 * per-driver cookbook convention (packages/core/docs/EXAMPLE-COOKBOOK-CONVENTION.md). The `code` string
 * is also what the website examples gallery renders for the TypeScript side.
 *
 * Pure-emit catalog (no live database) — it documents authoring -> DDL. Round-trip fidelity
 * (apply -> introspect -> diff = 0, and `pull` regeneration) is proven separately by the live parity
 * suites in `test/parity/*` against SurrealDB 3.1.3.
 */
import { surql } from "surrealdb";
import { emitDefStatement, emitTable } from "../src/ddl";
import {
  defineAccess,
  defineAnalyzer,
  defineEvent,
  defineFunction,
  defineRelation,
  defineTable,
  defineView,
  type StandaloneDef,
  s,
  TableDef,
} from "../src/pure";

/** A top-level schema object: a table/relation/view (a `TableDef`) or a standalone `define*`. */
// biome-ignore lint/suspicious/noExplicitAny: heterogeneous example schemas — the Shape varies per table.
export type Definable = TableDef<string, any> | StandaloneDef;

/** One catalog entry: the authoring snippet, the schema objects it produces, and the SurrealQL golden. */
export interface Example {
  /** The feature / syntax this entry demonstrates (also the test name). */
  title: string;
  /** Optional caveat — round-trip behavior, a known gap, or a `[~]`/`[ ]` note from COVERAGE.md. */
  note?: string;
  /** The verbatim authoring source (the website gallery renders this). Single source of truth. */
  code: string;
  /** The schema objects, DERIVED from `code` via `evalSnippet`. */
  defs: Definable[];
  /** The exact SurrealQL `defs` emit. Asserted by the reference test. */
  ddl: string;
}

/** A named group of examples (one source file in this folder). */
export interface ExampleGroup {
  /** The file these examples live in (for the test's `describe` label / the manifest group slug). */
  file: string;
  /** What the file covers. */
  about: string;
  examples: Example[];
}

/** The driver authoring API a `code` snippet may reference. Extra bindings come in per-example. */
const BASE_SCOPE = {
  s,
  surql,
  defineTable,
  defineRelation,
  defineView,
  defineEvent,
  defineFunction,
  defineAccess,
  defineAnalyzer,
};

const transpiler = new Bun.Transpiler({ loader: "ts" });

/**
 * Evaluate an authoring `code` snippet (with the driver's `s` / `define*` / `surql` in scope) to the
 * `Definable[]` it produces. The snippet is any expression evaluating to a `Definable` or `Definable[]`.
 * TypeScript syntax (e.g. `s.custom<Set<string>>()`) is transpiled away first. `scope` supplies any
 * extra identifiers the snippet references (e.g. a domain class).
 */
export function evalSnippet(
  code: string,
  scope: Record<string, unknown> = {},
): Definable[] {
  const env = { ...BASE_SCOPE, ...scope };
  // Wrap as an arrow so an array-literal snippet keeps its brackets through transpile (a bare
  // parenthesised `[a, b]` degrades to the comma operator); then call it in the driver-API scope.
  const js = transpiler.transformSync(`const __f = () => (\n${code}\n);`);
  const fn = new Function(...Object.keys(env), `${js}\nreturn __f();`);
  const result = fn(...Object.values(env));
  return Array.isArray(result) ? result : [result];
}

/**
 * Build an `Example` from its authoring snippet — `defs` is derived from `code`, so the two cannot
 * disagree. `scope` passes any extra identifiers the snippet uses beyond the driver API.
 */
export function ex(e: {
  title: string;
  note?: string;
  code: string;
  ddl: string;
  scope?: Record<string, unknown>;
}): Example {
  return {
    title: e.title,
    note: e.note,
    code: e.code,
    ddl: e.ddl,
    defs: evalSnippet(e.code, e.scope),
  };
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
