import { coverage } from "../_kit";
import base from "./base";
import thenOrdered from "./then-ordered";
import ifNotExists from "./if-not-exists";
import overwrite from "./overwrite";
import whenOmitted from "./when-omitted";

/** Every permutation of the `DEFINE EVENT` statement, in grammar order. An event is authored on a table
 *  (`.event(name, { when?, then })`), so each item is a minimal table whose emit pins the `DEFINE EVENT …`
 *  line. Schemic authors WHEN / THEN (single + ordered) + OVERWRITE / IF NOT EXISTS; ASYNC/RETRY/MAXDEPTH
 *  and COMMENT have no `s.*` surface yet. */
export const defineEventCoverage = coverage("DEFINE EVENT", [
  // [ OVERWRITE | IF NOT EXISTS ] @name ON [ TABLE ] @table [ WHEN @condition ] THEN @action
  base,
  overwrite,
  ifNotExists,
  // [ WHEN @condition ] (omitted -> fires every change)
  whenOmitted,
  // THEN @action -- single (base) + ordered list
  thenOrdered,
]);
