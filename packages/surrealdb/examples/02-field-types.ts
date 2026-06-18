/**
 * Field TYPES — scalars, geometry, containers (array/set/object/tuple), record links, literals/enums,
 * scalar unions, and the three-way optionality (`option<T>` vs `T | null` vs `option<T | null>`).
 * Field CLAUSES (default/value/assert/...) live in `03-field-clauses.ts`.
 */
import { defineTable, s } from "../src/pure";
import type { Example, ExampleGroup } from "./_kit";

const examples: Example[] = [
  {
    title: "Scalars",
    note: "Plus aliases: s.int32/uint32/bigint, s.date (datetime).",
    defs: [
      defineTable("scalars", {
        id: s.string(),
        str: s.string(),
        i: s.int(),
        f: s.float(),
        dec: s.decimal(),
        num: s.number(),
        b: s.boolean(),
        when: s.datetime(),
        uid: s.uuid(),
        raw: s.bytes(),
        dur: s.duration(),
        doc: s.file(),
      }),
    ],
    ddl: `DEFINE TABLE scalars TYPE NORMAL SCHEMAFULL;
DEFINE FIELD str ON TABLE scalars TYPE string;
DEFINE FIELD i ON TABLE scalars TYPE int;
DEFINE FIELD f ON TABLE scalars TYPE float;
DEFINE FIELD dec ON TABLE scalars TYPE decimal;
DEFINE FIELD num ON TABLE scalars TYPE number;
DEFINE FIELD b ON TABLE scalars TYPE bool;
DEFINE FIELD when ON TABLE scalars TYPE datetime;
DEFINE FIELD uid ON TABLE scalars TYPE uuid;
DEFINE FIELD raw ON TABLE scalars TYPE bytes;
DEFINE FIELD dur ON TABLE scalars TYPE duration;
DEFINE FIELD doc ON TABLE scalars TYPE file;`,
  },
  {
    title: "any / null",
    defs: [
      defineTable("loose", {
        id: s.string(),
        anything: s.any(),
        nothing: s.null(),
      }),
    ],
    ddl: `DEFINE TABLE loose TYPE NORMAL SCHEMAFULL;
DEFINE FIELD anything ON TABLE loose TYPE any;
DEFINE FIELD nothing ON TABLE loose TYPE null;`,
  },
  {
    title: "Optionality — option<T> vs T | null vs option<T | null>",
    note: "Kept distinct (absent vs present-null vs both), unlike SQL drivers that collapse them.",
    defs: [
      defineTable("opt", {
        id: s.string(),
        maybe: s.string().optional(),
        nullable: s.string().nullable(),
        both: s.string().nullish(),
      }),
    ],
    ddl: `DEFINE TABLE opt TYPE NORMAL SCHEMAFULL;
DEFINE FIELD maybe ON TABLE opt TYPE option<string>;
DEFINE FIELD nullable ON TABLE opt TYPE string | null;
DEFINE FIELD both ON TABLE opt TYPE option<string | null>;`,
  },
  {
    title: "Containers — array / set (with max), object, tuple",
    defs: [
      defineTable("containers", {
        id: s.string(),
        tags: s.array(s.string()),
        top3: s.array(s.string(), { max: 3 }),
        uniq: s.set(s.int()),
        coords: s.tuple([s.float(), s.float()]),
        meta: s.object({ k: s.string(), n: s.int() }),
      }),
    ],
    ddl: `DEFINE TABLE containers TYPE NORMAL SCHEMAFULL;
DEFINE FIELD tags ON TABLE containers TYPE array<string>;
DEFINE FIELD top3 ON TABLE containers TYPE array<string, 3>;
DEFINE FIELD uniq ON TABLE containers TYPE set<int>;
DEFINE FIELD coords ON TABLE containers TYPE [float, float];
DEFINE FIELD meta ON TABLE containers TYPE object;
DEFINE FIELD meta.k ON TABLE containers TYPE string;
DEFINE FIELD meta.n ON TABLE containers TYPE int;`,
  },
  {
    title: "Literals, enums, scalar unions",
    defs: [
      defineTable("choice", {
        id: s.string(),
        kind: s.literal("a"),
        status: s.enum(["draft", "live", "archived"]),
        idOrName: s.union([s.int(), s.string()]),
      }),
    ],
    ddl: `DEFINE TABLE choice TYPE NORMAL SCHEMAFULL;
DEFINE FIELD kind ON TABLE choice TYPE "a";
DEFINE FIELD status ON TABLE choice TYPE "draft" | "live" | "archived";
DEFINE FIELD idOrName ON TABLE choice TYPE int | string;`,
  },
  {
    title: "Record links — record<table>, multi-table, array<record<…>>",
    defs: [
      defineTable("links", {
        id: s.string(),
        author: s.recordId("user"),
        owner: s.recordId(["user", "org"]),
        tags: s.array(s.recordId("tag")),
      }),
    ],
    ddl: `DEFINE TABLE links TYPE NORMAL SCHEMAFULL;
DEFINE FIELD author ON TABLE links TYPE record<user>;
DEFINE FIELD owner ON TABLE links TYPE record<user | org>;
DEFINE FIELD tags ON TABLE links TYPE array<record<tag>>;`,
  },
  {
    title: "Geometry — bare and the 7 kinds",
    defs: [
      defineTable("geo", {
        id: s.string(),
        any: s.geometry(),
        pt: s.geometry("point"),
        ln: s.geometry("line"),
        poly: s.geometry("polygon"),
        mpt: s.geometry("multipoint"),
        mln: s.geometry("multiline"),
        mpoly: s.geometry("multipolygon"),
        coll: s.geometry("collection"),
      }),
    ],
    ddl: `DEFINE TABLE geo TYPE NORMAL SCHEMAFULL;
DEFINE FIELD any ON TABLE geo TYPE geometry;
DEFINE FIELD pt ON TABLE geo TYPE geometry<point>;
DEFINE FIELD ln ON TABLE geo TYPE geometry<line>;
DEFINE FIELD poly ON TABLE geo TYPE geometry<polygon>;
DEFINE FIELD mpt ON TABLE geo TYPE geometry<multipoint>;
DEFINE FIELD mln ON TABLE geo TYPE geometry<multiline>;
DEFINE FIELD mpoly ON TABLE geo TYPE geometry<multipolygon>;
DEFINE FIELD coll ON TABLE geo TYPE geometry<collection>;`,
  },
];

export const group: ExampleGroup = {
  file: "02-field-types.ts",
  about:
    "Field types — scalars, any/null, optionality, containers, literals/unions, record links, geometry",
  examples,
};
