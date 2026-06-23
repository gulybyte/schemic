import { defineAnalyzer, defineTable, s } from "@schemic/surrealdb";
import { example } from "../_kit";

export default example(import.meta.url, {
  title: "FULLTEXT (single field, inline via field.$fulltext())",
  note: "Overloaded: `.$fulltext(analyzer)` (the name or the `AnalyzerDef`) or `.$fulltext({ analyzer, bm25?, highlights?, name? })`. `bm25: true` emits a bare `BM25` (the default k1=1.2,b=0.75); the index name auto-derives `<table>_<field>_idx`. Needs a matching `defineAnalyzer`.",
  ddl: `DEFINE ANALYZER simple TOKENIZERS BLANK FILTERS LOWERCASE;

DEFINE TABLE doc2 TYPE NORMAL SCHEMAFULL;
DEFINE FIELD body ON TABLE doc2 TYPE string;
DEFINE INDEX doc2_body_idx ON TABLE doc2 FIELDS body FULLTEXT ANALYZER simple BM25 HIGHLIGHTS;`,
  def: [
    defineAnalyzer("simple").tokenizers("blank").filters("lowercase"),
    defineTable("doc2", {
      id: s.string(),
      body: s
        .string()
        .$fulltext({ analyzer: "simple", bm25: true, highlights: true }),
    }),
  ],
});
