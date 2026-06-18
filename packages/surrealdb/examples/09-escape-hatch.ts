/**
 * Escape hatches — app-only types and DB-managed fields.
 *
 * App-only types (s.custom / s.instanceof / s.symbol / ...) have NO SurrealQL mapping and are rejected
 * at `defineTable` unless given a wire type + codec via `.$surreal(wire, codec?)` (the standard
 * chainable escape hatch — see packages/core/docs/ESCAPE-HATCH-CONVENTION.md). `.$internal()` keeps a
 * field DB-managed and hidden from the public surface (PERMISSIONS NONE).
 */
import { defineTable, s } from "../src/pure";
import type { Example, ExampleGroup } from "./_kit";

/** A domain type with no wire representation of its own. */
class Money {
  constructor(readonly cents: number) {}
  toString() {
    return (this.cents / 100).toFixed(2);
  }
}

const examples: Example[] = [
  {
    title: ".$surreal(wire, codec) — store an instanceof type as a string",
    note: "App type = Money, wire/DDL type = string; the codec maps both ways. Clears the no-DDL brand.",
    defs: [
      defineTable("wallet", {
        id: s.string(),
        price: s.instanceof(Money).$surreal(s.string(), {
          encode: (m) => m.toString(),
          decode: (v) => new Money(Math.round(Number(v) * 100)),
        }),
      }),
    ],
    ddl: `DEFINE TABLE wallet TYPE NORMAL SCHEMAFULL;
DEFINE FIELD price ON TABLE wallet TYPE string;`,
  },
  {
    title: ".$surreal on s.custom — store a Set as array<string>",
    defs: [
      defineTable("bag", {
        id: s.string(),
        tags: s.custom<Set<string>>().$surreal(s.array(s.string()), {
          encode: (set) => [...set],
          decode: (arr) => new Set(arr),
        }),
      }),
    ],
    ddl: `DEFINE TABLE bag TYPE NORMAL SCHEMAFULL;
DEFINE FIELD tags ON TABLE bag TYPE array<string>;`,
  },
  {
    title: ".$internal() — DB-managed, client-hidden field (PERMISSIONS NONE)",
    defs: [
      defineTable("account", {
        id: s.string(),
        passhash: s.string().$internal(),
      }),
    ],
    ddl: `DEFINE TABLE account TYPE NORMAL SCHEMAFULL;
DEFINE FIELD passhash ON TABLE account TYPE string PERMISSIONS NONE;`,
  },
];

export const group: ExampleGroup = {
  file: "09-escape-hatch.ts",
  about:
    "Escape hatches — .$surreal(wire, codec) for app-only types, .$internal() for DB-managed fields",
  examples,
};
