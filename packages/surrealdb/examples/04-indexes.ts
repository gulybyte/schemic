/**
 * `DEFINE INDEX` — plain, UNIQUE, composite, COUNT, COMMENT, the vector indexes (HNSW / DISKANN), and
 * FULLTEXT search (with its `DEFINE ANALYZER`). Vector + fulltext defaults are stripped on emit so the
 * minimal authoring round-trips against SurrealDB's materialized form (see `test/parity/define-index`).
 */
import { defineAnalyzer, defineTable, s } from "../src/pure";
import type { Example, ExampleGroup } from "./_kit";

const examples: Example[] = [
  {
    title: "Plain and composite index",
    defs: [
      defineTable("p", { id: s.string(), a: s.string(), b: s.string() }).index(
        "ab",
        ["a", "b"],
      ),
    ],
    ddl: `DEFINE TABLE p TYPE NORMAL SCHEMAFULL;
DEFINE FIELD a ON TABLE p TYPE string;
DEFINE FIELD b ON TABLE p TYPE string;
DEFINE INDEX ab ON TABLE p FIELDS a, b;`,
  },
  {
    title: "UNIQUE (single field via field.unique() or table.index)",
    defs: [
      defineTable("u", { id: s.string(), email: s.string() }).index(
        "uq",
        ["email"],
        { unique: true },
      ),
    ],
    ddl: `DEFINE TABLE u TYPE NORMAL SCHEMAFULL;
DEFINE FIELD email ON TABLE u TYPE string;
DEFINE INDEX uq ON TABLE u FIELDS email UNIQUE;`,
  },
  {
    title: "COUNT (materialized row-count, no FIELDS)",
    defs: [
      defineTable("ct", { id: s.string() }).index("rows", [], { count: true }),
    ],
    ddl: `DEFINE TABLE ct TYPE NORMAL SCHEMAFULL;
DEFINE INDEX rows ON TABLE ct COUNT;`,
  },
  {
    title: "COMMENT",
    defs: [
      defineTable("cm", { id: s.string(), email: s.string() }).index(
        "uq",
        ["email"],
        { unique: true, comment: "email is unique" },
      ),
    ],
    ddl: `DEFINE TABLE cm TYPE NORMAL SCHEMAFULL;
DEFINE FIELD email ON TABLE cm TYPE string;
DEFINE INDEX uq ON TABLE cm FIELDS email UNIQUE COMMENT "email is unique";`,
  },
  {
    title: "Vector HNSW — minimal (defaults stripped)",
    note: "Only DIMENSION authored; SurrealDB materializes DIST/TYPE/EFC/M/M0/LM — all stripped so it round-trips.",
    defs: [
      defineTable("vh", { id: s.string(), emb: s.array(s.float()) }).index(
        "vec",
        ["emb"],
        { hnsw: { dimension: 4 } },
      ),
    ],
    ddl: `DEFINE TABLE vh TYPE NORMAL SCHEMAFULL;
DEFINE FIELD emb ON TABLE vh TYPE array<float>;
DEFINE INDEX vec ON TABLE vh FIELDS emb HNSW DIMENSION 4;`,
  },
  {
    title: "Vector HNSW — tuned",
    defs: [
      defineTable("vh2", { id: s.string(), emb: s.array(s.float()) }).index(
        "vec",
        ["emb"],
        {
          hnsw: { dimension: 8, dist: "cosine", type: "f64", efc: 200, m: 16 },
        },
      ),
    ],
    ddl: `DEFINE TABLE vh2 TYPE NORMAL SCHEMAFULL;
DEFINE FIELD emb ON TABLE vh2 TYPE array<float>;
DEFINE INDEX vec ON TABLE vh2 FIELDS emb HNSW DIMENSION 8 DIST COSINE TYPE F64 EFC 200 M 16;`,
  },
  {
    title: "Vector DISKANN — minimal",
    defs: [
      defineTable("vd", { id: s.string(), emb: s.array(s.float()) }).index(
        "vec",
        ["emb"],
        { diskann: { dimension: 4 } },
      ),
    ],
    ddl: `DEFINE TABLE vd TYPE NORMAL SCHEMAFULL;
DEFINE FIELD emb ON TABLE vd TYPE array<float>;
DEFINE INDEX vec ON TABLE vd FIELDS emb DISKANN DIMENSION 4;`,
  },
  {
    title: "FULLTEXT search index + DEFINE ANALYZER",
    note: "A FULLTEXT index deps on its analyzer (emitted first). Default BM25(1.2,0.75) is stripped.",
    defs: [
      defineAnalyzer("english", {
        tokenizers: ["blank"],
        filters: ["lowercase", "snowball(english)"],
      }),
      defineTable("doc", { id: s.string(), content: s.string() }).index(
        "ft",
        ["content"],
        { fulltext: { analyzer: "english", highlights: true } },
      ),
    ],
    ddl: `DEFINE ANALYZER english TOKENIZERS BLANK FILTERS LOWERCASE, SNOWBALL(ENGLISH);

DEFINE TABLE doc TYPE NORMAL SCHEMAFULL;
DEFINE FIELD content ON TABLE doc TYPE string;
DEFINE INDEX ft ON TABLE doc FIELDS content FULLTEXT ANALYZER english HIGHLIGHTS;`,
  },
];

export const group: ExampleGroup = {
  file: "04-indexes.ts",
  about:
    "DEFINE INDEX — plain/unique/composite/count/comment/HNSW/DISKANN/FULLTEXT (+ DEFINE ANALYZER)",
  examples,
};
