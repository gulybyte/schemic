import { coverage } from "../_kit";
import assert from "./assert";
import base from "./base";
import comment from "./comment";
import computed from "./computed";
import defaultAlways from "./default-always";
import defaultExpr from "./default";
import flexible from "./flexible";
import ifNotExists from "./if-not-exists";
import overwrite from "./overwrite";
import permissionsForOps from "./permissions-for-ops";
import permissionsFull from "./permissions-full";
import permissionsNone from "./permissions-none";
import permissionsSameAs from "./permissions-same-as";
import readonly from "./readonly";
import referenceOnDeleteCascade from "./reference-on-delete-cascade";
import referenceOnDeleteIgnore from "./reference-on-delete-ignore";
import referenceOnDeleteReject from "./reference-on-delete-reject";
import referenceOnDeleteThen from "./reference-on-delete-then";
import referenceOnDeleteUnset from "./reference-on-delete-unset";
import value from "./value";

/** Every permutation of the `DEFINE FIELD` statement, in grammar order. A field is authored inline on
 *  a table (`s.*` builders + `$`-methods), so each item is a minimal table whose emit includes the
 *  pinned `DEFINE FIELD …` line. */
export const defineFieldCoverage = coverage("DEFINE FIELD", [
  // [ OVERWRITE | IF NOT EXISTS ] @name ON [ TABLE ] @table [ TYPE @type ]
  base,
  overwrite,
  ifNotExists,
  // [ [ FLEXIBLE ] TYPE @type ]
  flexible,
  // [ REFERENCE [ ON DELETE REJECT | CASCADE | IGNORE | UNSET | THEN @expression ] ]
  referenceOnDeleteReject,
  referenceOnDeleteCascade,
  referenceOnDeleteIgnore,
  referenceOnDeleteUnset,
  referenceOnDeleteThen,
  // [ DEFAULT [ALWAYS] @expression ]
  defaultExpr,
  defaultAlways,
  // [ READONLY ]
  readonly,
  // [ VALUE @expression ]
  value,
  // [ ASSERT @expression ]
  assert,
  // [ COMPUTED @expression ]
  computed,
  // [ PERMISSIONS [ NONE | FULL | FOR select/create/update @expression ] ]  (no FOR delete on fields)
  permissionsNone,
  permissionsFull,
  permissionsForOps,
  permissionsSameAs,
  // [ COMMENT @string ]
  comment,
]);
