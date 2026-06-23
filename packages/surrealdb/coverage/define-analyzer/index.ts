import { coverage } from "../_kit";
import base from "./base";
import comment from "./comment";
import fn from "./function";
import filters from "./filters";
import ifNotExists from "./if-not-exists";
import overwrite from "./overwrite";
import tokenizersMultiple from "./tokenizers-multiple";
import tokenizersSingle from "./tokenizers-single";

/** Every permutation of the `DEFINE ANALYZER` statement, in grammar order:
 *  DEFINE ANALYZER [OVERWRITE|IF NOT EXISTS] name [FUNCTION fn::…] [TOKENIZERS …] [FILTERS …] [COMMENT …] */
export const defineAnalyzerCoverage = coverage("DEFINE ANALYZER", [
  // [ OVERWRITE | IF NOT EXISTS ] @name
  base,
  overwrite,
  ifNotExists,
  // [ FUNCTION @function ]
  fn,
  // [ TOKENIZERS @tokenizers ]
  tokenizersSingle,
  tokenizersMultiple,
  // [ FILTERS @filters ]
  filters,
  // [ COMMENT @string ]
  comment,
]);
