/**
 * The @schemic/surrealdb REFERENCE example suite — a verified cookbook of authoring -> SurrealQL DDL.
 *
 * Every entry pairs `s.*` / `define*` authoring with the EXACT DDL it emits; `test/examples/reference.test.ts`
 * asserts `emit(defs) === ddl` for all of them, so this catalog can never drift from the driver. Browse
 * the per-area files for quick reference; run the test to verify everything still emits as documented.
 *
 * See packages/core/docs/EXAMPLE-COOKBOOK-CONVENTION.md for the standing per-driver convention.
 */
import type { ExampleGroup } from "./_kit";
import { group as tables } from "./01-tables";
import { group as fieldTypes } from "./02-field-types";
import { group as fieldClauses } from "./03-field-clauses";
import { group as indexes } from "./04-indexes";
import { group as events } from "./05-events";
import { group as functions } from "./06-functions";
import { group as access } from "./07-access";
import { group as analyzers } from "./08-analyzers";
import { group as escapeHatch } from "./09-escape-hatch";

export type { Definable, Example, ExampleGroup } from "./_kit";
export { emit } from "./_kit";

/** Every example group, in reading order. The reference test iterates this. */
export const allGroups: ExampleGroup[] = [
  tables,
  fieldTypes,
  fieldClauses,
  indexes,
  events,
  functions,
  access,
  analyzers,
  escapeHatch,
];
