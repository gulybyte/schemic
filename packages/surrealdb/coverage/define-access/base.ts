import { defineAccess } from "@schemic/surrealdb";
import { cover } from "../_kit";

export default cover(import.meta.url, {
  title: "Base — DEFINE ACCESS <name> ON DATABASE TYPE RECORD",
  note: "`defineAccess(name)` defaults to `ON DATABASE TYPE RECORD` (end users sign up / sign in directly).",
  ddl: `DEFINE ACCESS account ON DATABASE TYPE RECORD;`,
  def: defineAccess("account"),
});
