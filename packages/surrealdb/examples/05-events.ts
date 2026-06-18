/**
 * `DEFINE EVENT` — row-change triggers. Inline via `table.event(name, { when?, then })` or standalone
 * via `defineEvent(table, name, spec)`; `then` takes a single expression or an ordered array.
 */
import { type ExampleGroup, ex } from "./_kit";

const examples = [
  ex({
    title: "Inline event with WHEN + THEN",
    code: `defineTable("account", { id: s.string(), balance: s.float() }).event("overdraft", {
  when: surql\`$after.balance < 0\`,
  then: surql\`CREATE alert SET account = $after.id, kind = 'overdraft'\`,
})`,
    ddl: `DEFINE TABLE account TYPE NORMAL SCHEMAFULL;
DEFINE FIELD balance ON TABLE account TYPE float;
DEFINE EVENT overdraft ON TABLE account WHEN $after.balance < 0 THEN CREATE alert SET account = $after.id, kind = 'overdraft';`,
  }),
  ex({
    title: "Event without WHEN (fires on every change)",
    code: `defineTable("doc", { id: s.string() }).event("touch", {
  then: surql\`UPDATE audit SET at = time::now()\`,
})`,
    ddl: `DEFINE TABLE doc TYPE NORMAL SCHEMAFULL;
DEFINE EVENT touch ON TABLE doc THEN UPDATE audit SET at = time::now();`,
  }),
  ex({
    title: "Standalone event with an ordered THEN array",
    note: "defineEvent declares an event apart from its table; pull regenerates it inline.",
    code: `defineEvent("account", "onCreate", {
  when: surql\`$event = "CREATE"\`,
  then: [
    surql\`CREATE log SET account = $after.id\`,
    surql\`UPDATE stats SET count += 1\`,
  ],
})`,
    ddl: `DEFINE EVENT onCreate ON TABLE account WHEN $event = "CREATE" THEN (CREATE log SET account = $after.id), (UPDATE stats SET count += 1);`,
  }),
];

export const group: ExampleGroup = {
  file: "05-events.ts",
  about:
    "DEFINE EVENT — inline and standalone, WHEN/THEN (single or ordered array)",
  examples,
};
