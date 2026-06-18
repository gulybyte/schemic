/**
 * `DEFINE ANALYZER` — text analyzers for FULLTEXT search indexes. Its own schema object (kind); a
 * FULLTEXT index depends on the analyzer it names (see `04-indexes.ts`). Tokenizers + filters are
 * uppercased on emit to match SurrealDB's stored form.
 */
import { defineAnalyzer } from "../src/pure";
import type { Example, ExampleGroup } from "./_kit";

const examples: Example[] = [
  {
    title: "Analyzer with tokenizers + filters",
    defs: [
      defineAnalyzer("english", {
        tokenizers: ["blank", "class"],
        filters: ["lowercase", "snowball(english)"],
      }),
    ],
    ddl: `DEFINE ANALYZER english TOKENIZERS BLANK, CLASS FILTERS LOWERCASE, SNOWBALL(ENGLISH);`,
  },
  {
    title: "Analyzer with tokenizers only",
    defs: [defineAnalyzer("simple", { tokenizers: ["blank"] })],
    ddl: `DEFINE ANALYZER simple TOKENIZERS BLANK;`,
  },
];

export const group: ExampleGroup = {
  file: "08-analyzers.ts",
  about: "DEFINE ANALYZER — tokenizers + optional filters",
  examples,
};
