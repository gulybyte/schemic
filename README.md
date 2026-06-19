<div align="center">

<!-- logo placeholder — graphics-designer's mark drops in here (light/dark <picture>) -->

# Schemic

**Schema-as-code for any database — author once in TypeScript, generate native DDL, run migrations.**

[Docs](https://schemic.dev) &nbsp;•&nbsp; [Drivers](#drivers) &nbsp;•&nbsp; [GitHub](https://github.com/schemichq/schemic)

<!-- add npm-version / license / CI badges once the packages are public -->

</div>

---

Schemic lets you define your database schema once in TypeScript with `s.*` — a
**superset of [Zod](https://zod.dev)**, so the schema you write is the validator
you already know. From that single definition it generates your database's native
DDL, gives you end-to-end types, and runs reviewable migrations.

The engine and CLI are **dialect-neutral**; each database is an installable
**driver**, so the same schema targets any of them. One source of truth — no
separate ORM model, no code generation, no drift.

## Drivers

- [`@schemic/surrealdb`](packages/surrealdb#readme) — **SurrealDB** · available
- [`@schemic/postgres`](packages/postgres#readme) — **PostgreSQL** · in progress

More drivers are planned. The `s.*` authoring API and the CLI are the same across
every driver — only the generated DDL differs.

## Packages

| Package | What it is |
| --- | --- |
| [`@schemic/core`](packages/core#readme) | The dialect-neutral engine: the `Driver` contract, the portable schema IR, and the migration / diff / snapshot engine. Zero dialect code. |
| [`@schemic/cli`](packages/cli#readme) | The `schemic` / `sc` binary — also dialect-neutral; loads your driver from `config.driver`. |
| `@schemic/<driver>` | A database driver: connection, `s.*` authoring, and the dialect's DDL. See [Drivers](#drivers) for the available ones. |

## The workflow

Author your schema with your driver's `s.*` builders, then drive it from the
dialect-neutral CLI (`sc` is the short alias):

```bash
sc init        # scaffold a project: schemic.config.ts + schema + .env.example
sc diff        # preview changes vs the last snapshot   (--ts for a TypeScript view)
sc gen         # write a migration for the pending change
sc migrate     # apply pending migrations
sc status      # show applied vs pending migrations
sc pull        # introspect a live database back into TypeScript
```

The `s.*` builders and the DDL they generate are driver-specific — see your
driver's README for the exact authoring surface and output.

## Status

**Alpha (`0.x`).** APIs may still change.

- [x] **SurrealDB** driver — the most complete
- [ ] **PostgreSQL** driver — in progress
- [ ] more drivers

See each driver's `docs/COVERAGE.md` for a feature-by-feature map.

## Development

A [Bun](https://bun.com) workspaces monorepo (`packages/*`).

```bash
bun install
bun --filter '@schemic/*' test       # run every package's tests
bun --filter '@schemic/*' typecheck
```

## License

[MIT](LICENSE) © Vertio Solutions
