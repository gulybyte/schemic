import { coverage } from "../_kit";
import base from "./base";

/** Every permutation of the `DEFINE ANALYZER` statement, in grammar order. */
export const defineAnalyzerCoverage = coverage("DEFINE ANALYZER", [
  // [ OVERWRITE | IF NOT EXISTS ] @name … TOKENIZERS @tokenizers
  base,
]);
