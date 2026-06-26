import { defineSeed } from "@schemic/postgres";

// Seed script — run with `schemic seed`. `defineSeed` types (db, ctx) for you (no imports of the
// connection/context types needed). This is a seed FOLDER: add more named seeds beside this file —
// `schemic seed users` runs ./users.ts (or 01-users.ts), `schemic seed --all` runs them in filename
// order, and bare `schemic seed` runs this index.ts. Load a supporting file (raw .sql, JSON, …) next
// to this seed with ctx.file(name), e.g. const schema = ctx.file("schema.sql").
export default defineSeed(async (db, ctx) => {
  // await db.query('INSERT INTO "user" ("id", "email", "name") VALUES ($1, $2, $3)', [id, email, name]);
});
