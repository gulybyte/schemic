import { defineAnalyzer } from "@schemic/surrealdb";
import { cover } from "../_kit";

export default cover(import.meta.url, {
  title: "Base — DEFINE ANALYZER <name>",
  note: "The minimal analyzer: just a name. TOKENIZERS/FILTERS are optional — config defaults to {}, so defineAnalyzer(name) emits the bare form (valid SurrealQL; INFO returns just the name).",
  ddl: `DEFINE ANALYZER text;`,
  def: defineAnalyzer("text"),
});
