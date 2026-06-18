/**
 * Field CLAUSES — DEFAULT (/ALWAYS), VALUE, COMPUTED, ASSERT (+ the baked `$`-constraints and the
 * string-format builders), READONLY, COMMENT, FLEXIBLE, field PERMISSIONS, and record REFERENCE.
 */
import { surql } from "surrealdb";
import { defineTable, s } from "../src/pure";
import type { Example, ExampleGroup } from "./_kit";

const examples: Example[] = [
  {
    title: "DEFAULT and DEFAULT ALWAYS",
    note: "Literals stay bare; wrap an expression in surql`…`. ALWAYS re-applies on every update.",
    defs: [
      defineTable("d", {
        id: s.string(),
        role: s.string().$default("member"),
        seen: s.int().$default(0),
        touched: s.datetime().$defaultAlways(surql`time::now()`),
      }),
    ],
    ddl: `DEFINE TABLE d TYPE NORMAL SCHEMAFULL;
DEFINE FIELD role ON TABLE d TYPE string DEFAULT "member";
DEFINE FIELD seen ON TABLE d TYPE int DEFAULT 0;
DEFINE FIELD touched ON TABLE d TYPE datetime DEFAULT ALWAYS time::now();`,
  },
  {
    title: "VALUE and COMPUTED",
    note: "VALUE computes/coerces on write; COMPUTED is a derived (virtual) value.",
    defs: [
      defineTable("c", {
        id: s.string(),
        email: s.string().$value(surql`string::lowercase($value)`),
        full: s.string().$computed(surql`name.first + ' ' + name.last`),
      }),
    ],
    ddl: `DEFINE TABLE c TYPE NORMAL SCHEMAFULL;
DEFINE FIELD email ON TABLE c TYPE string VALUE string::lowercase($value);
DEFINE FIELD full ON TABLE c TYPE string COMPUTED name.first + ' ' + name.last;`,
  },
  {
    title: "ASSERT — raw and baked $-constraints",
    note: "$min/$max/$length/$gt/... bake into ASSERT; $assert(surql`…`) is the raw escape.",
    defs: [
      defineTable("a", {
        id: s.string(),
        age: s.int().$min(0).$max(120),
        name: s.string().$length(64),
        score: s.float().$gte(0).$lte(1),
        slug: s.string().$assert(surql`$value = /^[a-z-]+$/`),
      }),
    ],
    ddl: `DEFINE TABLE a TYPE NORMAL SCHEMAFULL;
DEFINE FIELD age ON TABLE a TYPE int ASSERT $value >= 0 AND $value <= 120;
DEFINE FIELD name ON TABLE a TYPE string ASSERT string::len($value) == 64;
DEFINE FIELD score ON TABLE a TYPE float ASSERT $value >= 0 AND $value <= 1;
DEFINE FIELD slug ON TABLE a TYPE string ASSERT $value = /^[a-z-]+$/;`,
  },
  {
    title: "String-format builders (reverse to the builder on pull)",
    note: "Each bakes an ASSERT; pull recovers the builder (s.email()) not the raw string ASSERT.",
    defs: [
      defineTable("fmt", {
        id: s.string(),
        email: s.email(),
        site: s.url(),
        ip: s.ipv4(),
        id2: s.ulid(),
      }),
    ],
    ddl: `DEFINE TABLE fmt TYPE NORMAL SCHEMAFULL;
DEFINE FIELD email ON TABLE fmt TYPE string ASSERT string::is_email($value);
DEFINE FIELD site ON TABLE fmt TYPE string ASSERT string::is_url($value);
DEFINE FIELD ip ON TABLE fmt TYPE string ASSERT string::is_ipv4($value);
DEFINE FIELD id2 ON TABLE fmt TYPE string ASSERT string::is_ulid($value);`,
  },
  {
    title: "READONLY and field COMMENT",
    defs: [
      defineTable("rc", {
        id: s.string(),
        createdAt: s.datetime().$readonly(),
        note: s.string().$comment("free-form note"),
      }),
    ],
    ddl: `DEFINE TABLE rc TYPE NORMAL SCHEMAFULL;
DEFINE FIELD createdAt ON TABLE rc TYPE datetime READONLY;
DEFINE FIELD note ON TABLE rc TYPE string COMMENT "free-form note";`,
  },
  {
    title: "FLEXIBLE object",
    note: ".flexible() (alias .loose()) lets a typed object also carry undeclared keys.",
    defs: [
      defineTable("fx", {
        id: s.string(),
        meta: s.object({ k: s.string() }).flexible(),
      }),
    ],
    ddl: `DEFINE TABLE fx TYPE NORMAL SCHEMAFULL;
DEFINE FIELD meta ON TABLE fx TYPE object FLEXIBLE;
DEFINE FIELD meta.k ON TABLE fx TYPE string;`,
  },
  {
    title: "Field PERMISSIONS",
    note: "Field-level guards: select/create/update (no delete at field level, matching SurrealQL).",
    defs: [
      defineTable("fp", {
        id: s.string(),
        secret: s.string().$permissions({
          select: surql`$auth.admin = true`,
          update: surql`false`,
        }),
      }),
    ],
    ddl: `DEFINE TABLE fp TYPE NORMAL SCHEMAFULL;
DEFINE FIELD secret ON TABLE fp TYPE string PERMISSIONS FOR select WHERE $auth.admin = true FOR update WHERE false;`,
  },
  {
    title: "REFERENCE — record link with ON DELETE",
    note: "Reference integrity: REJECT | CASCADE | UNSET | IGNORE | THEN <expr>.",
    defs: [
      defineTable("ref", {
        id: s.string(),
        author: s.recordId("user").reference({ onDelete: "cascade" }),
      }),
    ],
    ddl: `DEFINE TABLE ref TYPE NORMAL SCHEMAFULL;
DEFINE FIELD author ON TABLE ref TYPE record<user> REFERENCE ON DELETE CASCADE;`,
  },
];

export const group: ExampleGroup = {
  file: "03-field-clauses.ts",
  about:
    "Field clauses — default/value/computed/assert/$-constraints/string-formats/readonly/comment/flexible/permissions/reference",
  examples,
};
