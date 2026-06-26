import { defineTable, s, sqlExpr } from "@schemic/postgres";

export const user = defineTable("user", {
  email: s.varchar(255).$unique(),
  name: s.text(),
  age: s.smallint().optional(),
  createdAt: s.timestamptz().$default(sqlExpr("now()")),
});
