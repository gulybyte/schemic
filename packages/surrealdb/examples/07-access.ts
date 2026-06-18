/**
 * `DEFINE ACCESS` — authentication methods. RECORD (SIGNUP/SIGNIN/AUTHENTICATE), JWT (validate
 * external tokens), BEARER (API-key grants), with DURATION and ON NAMESPACE | DATABASE.
 *
 * Note: JWT signing keys and BEARER grant secrets are REDACTED by SurrealDB on introspect — they
 * emit + apply but cannot be pulled (so those are `[~]` partial in COVERAGE.md). The structure
 * round-trips; the secret does not.
 */
import { surql } from "surrealdb";
import { defineAccess } from "../src/pure";
import type { Example, ExampleGroup } from "./_kit";

const examples: Example[] = [
  {
    title: "RECORD access (SIGNUP / SIGNIN / DURATION)",
    defs: [
      defineAccess("user")
        .record()
        .signup(
          surql`CREATE user SET email = $email, pass = crypto::argon2::generate($pass)`,
        )
        .signin(
          surql`SELECT * FROM user WHERE email = $email AND crypto::argon2::compare(pass, $pass)`,
        )
        .duration({ token: "1h", session: "12h" }),
    ],
    ddl: `DEFINE ACCESS user ON DATABASE TYPE RECORD SIGNUP { CREATE user SET email = $email, pass = crypto::argon2::generate($pass) } SIGNIN { SELECT * FROM user WHERE email = $email AND crypto::argon2::compare(pass, $pass) } DURATION FOR TOKEN 1h, FOR SESSION 12h;`,
  },
  {
    title: "RECORD access with AUTHENTICATE",
    defs: [
      defineAccess("api")
        .record()
        .authenticate(surql`RETURN $auth`)
        .duration({ session: "1d" }),
    ],
    ddl: `DEFINE ACCESS api ON DATABASE TYPE RECORD AUTHENTICATE { RETURN $auth } DURATION FOR SESSION 1d;`,
  },
  {
    title: "JWT access (validate external tokens)",
    note: "Structure (alg + key/url) applies + introspects, but the signing KEY is redacted on pull.",
    defs: [
      defineAccess("external")
        .jwt({ alg: "HS512", key: "secret" })
        .onDatabase(),
    ],
    ddl: `DEFINE ACCESS external ON DATABASE TYPE JWT ALGORITHM HS512 KEY "secret";`,
  },
  {
    title: "BEARER access (API-key grants)",
    note: "Subject + duration round-trip; the grant secret is redacted on introspect.",
    defs: [
      defineAccess("apikey")
        .bearer({ for: "user" })
        .duration({ session: "30d" }),
    ],
    ddl: `DEFINE ACCESS apikey ON DATABASE TYPE BEARER FOR USER DURATION FOR SESSION 30d;`,
  },
];

export const group: ExampleGroup = {
  file: "07-access.ts",
  about:
    "DEFINE ACCESS — RECORD/JWT/BEARER, SIGNUP/SIGNIN/AUTHENTICATE, DURATION, ON NS/DB",
  examples,
};
