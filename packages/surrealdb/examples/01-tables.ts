/**
 * `DEFINE TABLE` — the table head: schema mode, table type, permissions, changefeed, comment, drop,
 * relations (edge tables), and pre-computed views. Fields are covered in `02-field-types.ts`.
 */
import { type ExampleGroup, ex } from "./_kit";

const examples = [
  ex({
    title: "SCHEMAFULL (the default)",
    note: "defineTable is SCHEMAFULL by default — fields are constrained to the declared shape.",
    code: `defineTable("account", { id: s.string(), name: s.string() })`,
    ddl: `DEFINE TABLE account TYPE NORMAL SCHEMAFULL;
DEFINE FIELD name ON TABLE account TYPE string;`,
  }),
  ex({
    title: "SCHEMALESS",
    note: "Opt out with .schemaless() — records may carry undeclared fields.",
    code: `defineTable("blob", { id: s.string() }).schemaless()`,
    ddl: `DEFINE TABLE blob TYPE NORMAL SCHEMALESS;`,
  }),
  ex({
    title: "TYPE ANY",
    note: "Accept any record shape (.typeAny()).",
    code: `defineTable("misc", { id: s.string() }).typeAny()`,
    ddl: `DEFINE TABLE misc TYPE ANY SCHEMAFULL;`,
  }),
  ex({
    title: "COMMENT",
    code: `defineTable("account", { id: s.string() }).comment("billing accounts")`,
    ddl: `DEFINE TABLE account TYPE NORMAL SCHEMAFULL COMMENT "billing accounts";`,
  }),
  ex({
    title: "table PERMISSIONS",
    note: "Per-operation row guards; an omitted op defaults to NONE.",
    code: `defineTable("doc", { id: s.string() }).permissions({
  select: surql\`true\`,
  create: surql\`$auth.id != NONE\`,
  update: surql\`$auth.id = id.owner\`,
  delete: surql\`$auth.admin = true\`,
})`,
    ddl: `DEFINE TABLE doc TYPE NORMAL SCHEMAFULL PERMISSIONS FOR select WHERE true FOR create WHERE $auth.id != NONE FOR update WHERE $auth.id = id.owner FOR delete WHERE $auth.admin = true;`,
  }),
  ex({
    title: "CHANGEFEED",
    note: "Retain a change feed for the table; INCLUDE ORIGINAL via the option.",
    code: `defineTable("audited", { id: s.string() }).changefeed("7d", { includeOriginal: true })`,
    ddl: `DEFINE TABLE audited TYPE NORMAL SCHEMAFULL CHANGEFEED 7d INCLUDE ORIGINAL;`,
  }),
  ex({
    title: "DROP",
    note: "A DROP table discards writes (TYPE NORMAL DROP) — useful to retire a table's data.",
    code: `defineTable("legacy", { id: s.string() }).drop(true)`,
    ddl: `DEFINE TABLE legacy TYPE NORMAL DROP SCHEMAFULL;`,
  }),
  ex({
    title: "TYPE RELATION (edge table) with FROM / TO / ENFORCED",
    note: "defineRelation + .from()/.to() restrict endpoints; .enforced() requires both to exist on RELATE.",
    code: `defineRelation("likes", { since: s.datetime() })
  .from(defineTable("user", { id: s.string() }))
  .to(defineTable("post", { id: s.string() }))
  .enforced()`,
    ddl: `DEFINE TABLE likes TYPE RELATION FROM user TO post ENFORCED SCHEMAFULL;
DEFINE FIELD since ON TABLE likes TYPE datetime;`,
  }),
  ex({
    title: "TYPE RELATION — unrestricted endpoints",
    note: "Endpoints are optional; a bare relation links any record to any record.",
    code: `defineRelation("touches", {})`,
    ddl: `DEFINE TABLE touches TYPE RELATION SCHEMAFULL;`,
  }),
  ex({
    title: "Pre-computed VIEW (AS SELECT)",
    note: "defineView emits TYPE ANY SCHEMALESS AS <query>; rows are kept in sync by SurrealDB. No authored fields.",
    code: `defineView("adults", surql\`SELECT name, age FROM user WHERE age >= 18\`)`,
    ddl: `DEFINE TABLE adults TYPE ANY SCHEMALESS AS SELECT name, age FROM user WHERE age >= 18;`,
  }),
];

export const group: ExampleGroup = {
  file: "01-tables.ts",
  about:
    "DEFINE TABLE head — schema mode, type, permissions, changefeed, comment, drop, relations, views",
  examples,
};
