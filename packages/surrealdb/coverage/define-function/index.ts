import { coverage } from "../_kit";
import base from "./base";
import comment from "./comment";
import ifNotExists from "./if-not-exists";
import noArgs from "./no-args";
import overwrite from "./overwrite";
import permissionsFull from "./permissions-full";
import permissionsNone from "./permissions-none";
import permissionsWhere from "./permissions-where";
import returns from "./returns";

/** Every permutation of the `DEFINE FUNCTION` statement, in grammar order. A function is a standalone
 *  def (`defineFunction(name, args).body(…)`), so each item pins its single `DEFINE FUNCTION …` line.
 *  Schemic authors args / -> return / body / PERMISSIONS / COMMENT + OVERWRITE / IF NOT EXISTS;
 *  GRAPHQL_ALIAS / GRAPHQL_DEPRECATED (new in v3.1.0) have no `s.*` surface yet. */
export const defineFunctionCoverage = coverage("DEFINE FUNCTION", [
  // [ OVERWRITE | IF NOT EXISTS ] fn::@name ( @args ) [ -> @type ] { @body } [ PERMISSIONS ] [ COMMENT ]
  base,
  overwrite,
  ifNotExists,
  // ( @args ) [ -> @type ] { @body }
  returns,
  noArgs,
  // [ PERMISSIONS NONE | FULL | WHERE @condition ]
  permissionsFull,
  permissionsNone,
  permissionsWhere,
  // [ COMMENT @string ]
  comment,
]);
