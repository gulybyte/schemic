# example-blog

A minimal blog schema authored with [Schemic](https://schemic.dev) (`@schemic/core`) —
`user`, `post`, and `comment` tables with record links, defaults, asserts, and unique indexes.

## Schema

| Table     | Fields                                                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `user`    | `name`, unique `email`, optional `bio`, `createdAt`                                                                                   |
| `post`    | `title`, unique `slug`, `body`, `author` → `user`, `status` (`draft`/`published`/`archived`), `tags`, `publishedAt`, `createdAt`, auto `updatedAt` |
| `comment` | `post` → `post`, `author` → `user`, `body`, `createdAt`                                                                               |

The schema lives in [`database/schema/`](./database/schema). Each field is a `s.*` builder (a drop-in
for Zod's `z.*`) — see [`tables/post.ts`](./database/schema/tables/post.ts) for record links, enums,
and `$default`/`$value`/`$readonly`.

## Getting started

```bash
bun install
cp .env.example .env        # point SURREAL_* at your SurrealDB
```

```bash
schemic diff                # preview the DDL vs the snapshot
schemic gen first           # write the first migration
schemic migrate             # apply migrations to the database
schemic seed                # run database/seed.ts (creates a user + post + comment)
```

> `sc` is the short alias for `schemic` (e.g. `sc diff`).
