# surreal-zod

Author [SurrealDB](https://surrealdb.com) schemas with [Zod](https://zod.dev).

- **`sz.*`** — a drop-in for `z.*` that also carries SurrealQL metadata.
- **`defineTable` / `defineField`** — generate `DEFINE TABLE` / `DEFINE FIELD` DDL from your schema.
- **`decode` / `encode`** — map DB rows ⇄ app objects across Zod's two channels via codecs
  (`DateTime`⇄`Date`, `Uuid`⇄`string`, `RecordId`, …).

## Install

```bash
bun add surreal-zod surrealdb zod
```

`surrealdb` and `zod` are peer dependencies.

## Quick start

```ts
import { sz, table, relation, defineTable, type App } from "surreal-zod";
import { surql } from "surrealdb";

export const User = table("user", {
  id: sz.string(),                                  // -> record<user>
  name: sz.string(),
  email: sz.email(),
  status: sz.string().$default("pending"),          // DB-side DEFAULT
  createdAt: sz.datetime().$default(surql`time::now()`).$readonly(),
});

export const Friend = relation("friend", {
  strength: sz.number().$assert(surql`$value >= 0 AND $value <= 1`),
})
  .from(User)
  .to(User);

// SurrealQL DDL:
console.log(defineTable(User));
// DEFINE TABLE user TYPE NORMAL SCHEMAFULL;
// DEFINE FIELD name ON TABLE user TYPE string;
// ...

// Build a CREATE payload (DB-filled fields optional), then decode a row back:
const payload = User.make({ name: "Alice", email: "alice@example.com" });
type AppUser = App<typeof User>; // id: RecordId, createdAt: Date, ...
```

See [`examples/`](./examples) for a full schema, a live demo (`bun examples/demo.ts`),
and a small CRUD server.

## Develop

```bash
bun test          # unit + live (live skips when no SurrealDB is reachable)
bun run typecheck
bun run build     # -> lib/ (ESM + d.ts) via tsup
```
