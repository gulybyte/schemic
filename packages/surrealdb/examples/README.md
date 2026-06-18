# `@schemic/surrealdb` reference cookbook

A **verified** catalog of every implemented authoring feature, paired with the exact SurrealQL DDL it
emits. Use it to look up "how do I author X, and what does it produce?" when revisiting a feature or
evolving the driver/core.

Each entry is `{ title, note?, defs, ddl }`:

- **`defs`** — the `s.*` / `define*` authoring.
- **`ddl`** — the exact SurrealQL `defs` emit (the **golden**).

`test/examples/reference.test.ts` asserts `emit(defs) === ddl` for every entry, so this catalog **can
never drift** from the driver: change the emitter and the suite fails until the reference is updated.

This is a **pure-emit** reference (no live database) — it documents authoring -> DDL. Round-trip
fidelity (apply -> introspect -> diff = 0, and `pull` regeneration) is proven separately by the live
parity suites in [`test/parity/`](../test/parity) against SurrealDB 3.1.3. See
[`docs/COVERAGE.md`](../docs/COVERAGE.md) for the full feature/status map.

## Files

| File | Covers |
|---|---|
| [`01-tables.ts`](./01-tables.ts) | `DEFINE TABLE` head — schema mode, type, permissions, changefeed, comment, drop, relations, views |
| [`02-field-types.ts`](./02-field-types.ts) | scalars, any/null, optionality, containers, literals/unions, record links, geometry |
| [`03-field-clauses.ts`](./03-field-clauses.ts) | default/value/computed/assert/`$`-constraints/string-formats/readonly/comment/flexible/permissions/reference |
| [`04-indexes.ts`](./04-indexes.ts) | `DEFINE INDEX` — plain/unique/composite/count/comment/HNSW/DISKANN/FULLTEXT (+ `DEFINE ANALYZER`) |
| [`05-events.ts`](./05-events.ts) | `DEFINE EVENT` — inline + standalone, WHEN/THEN |
| [`06-functions.ts`](./06-functions.ts) | `DEFINE FUNCTION` — args, returns, body, permissions, comment |
| [`07-access.ts`](./07-access.ts) | `DEFINE ACCESS` — RECORD/JWT/BEARER, DURATION, ON NS/DB |
| [`08-analyzers.ts`](./08-analyzers.ts) | `DEFINE ANALYZER` — tokenizers + filters |
| [`09-escape-hatch.ts`](./09-escape-hatch.ts) | `.$surreal(wire, codec)` for app-only types, `.$internal()` |

## Run / extend

```sh
bun test test/examples/reference.test.ts     # verify every golden still emits as documented
```

To **add** a feature: add an entry to the relevant group, set `ddl` to what it emits (run the test —
the failure prints the actual DDL — then paste it in, after eyeballing it for correctness). New files
get added to [`index.ts`](./index.ts).

This is the reference implementation of the per-driver
[example-cookbook convention](../../core/docs/EXAMPLE-COOKBOOK-CONVENTION.md).
