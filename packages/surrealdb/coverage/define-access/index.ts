import { coverage } from "../_kit";
import authenticate from "./authenticate";
import base from "./base";
import bearerRecord from "./bearer-record";
import bearerUser from "./bearer-user";
import comment from "./comment";
import duration from "./duration";
import ifNotExists from "./if-not-exists";
import jwtAlgorithmKey from "./jwt-algorithm-key";
import jwtUrl from "./jwt-url";
import onNamespace from "./on-namespace";
import overwrite from "./overwrite";
import recordSignupSignin from "./record-signup-signin";
import withRefresh from "./with-refresh";

/** Every permutation of the `DEFINE ACCESS` statement, in grammar order. A standalone def
 *  (`defineAccess(name).record()/.jwt()/.bearer()…`), so each item pins its single `DEFINE ACCESS …`
 *  line. Phase 1: ON DATABASE|NAMESPACE / TYPE RECORD|JWT(URL,ALG-KEY)|BEARER / SIGNUP|SIGNIN|WITH
 *  REFRESH|AUTHENTICATE / DURATION / COMMENT + OVERWRITE / IF NOT EXISTS. Phase 2 (secret refs):
 *  RECORD WITH JWT / WITH ISSUER KEY; multi-level: ON ROOT + namespace round-trip. */
export const defineAccessCoverage = coverage("DEFINE ACCESS", [
  // [ OVERWRITE | IF NOT EXISTS ] @name ON [ NAMESPACE | DATABASE ] TYPE …
  base,
  overwrite,
  ifNotExists,
  onNamespace,
  // TYPE JWT [ ALGORITHM KEY | URL ]
  jwtUrl,
  jwtAlgorithmKey,
  // TYPE BEARER FOR [ USER | RECORD ]
  bearerRecord,
  bearerUser,
  // TYPE RECORD [ SIGNUP ] [ SIGNIN ] [ WITH REFRESH ] [ AUTHENTICATE ]
  recordSignupSignin,
  withRefresh,
  authenticate,
  // [ DURATION … ] [ COMMENT … ]
  duration,
  comment,
]);
