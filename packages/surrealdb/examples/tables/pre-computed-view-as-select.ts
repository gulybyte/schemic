import { defineView, surql } from "@schemic/surrealdb";
import { example } from "../_kit";

export default example(import.meta.url, {
  title: "Pre-computed VIEW (AS SELECT)",
  note: "defineView emits TYPE ANY SCHEMALESS AS <query>; rows are kept in sync by SurrealDB. No authored fields.",
  ddl: `DEFINE TABLE adults TYPE ANY SCHEMALESS AS SELECT name, age FROM user WHERE age >= 18;`,
  def: defineView("adults", surql`SELECT name, age FROM user WHERE age >= 18`),
});
