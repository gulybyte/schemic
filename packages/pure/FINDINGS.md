# Spike findings: "pure" (stock Zod 4 codecs) vs the `@zod/core` fork

**Question:** can a Surreal-aware schema layer be built on *stock* Zod 4 (codecs +
metadata) instead of forking `@zod/core`, and still get good DX — typed
app↔DB mapping, SurrealQL DDL generation, and validation?

**Setup:** `surrealdb@2.0.3` (official) + `zod@4.3.5`, live against SurrealDB
3.1.0-nightly (ns `surreal-zod`, db `pure`).

## What was built & proven (all live)

- `table()` / `relation()` authoring with a fluent `sz.*` surface and `$default`
  / `$assert` / `$value` / `$readonly` / `$comment` DDL methods.
- A field is a Zod **codec**: encoded side (`z.input`) = DB wire type, decoded
  side (`z.output`) = app type. Two channels, no `dbinput`/`dboutput`.
- DDL generation (`DEFINE TABLE`/`FIELD`, `option<>`, `record<>`, `RELATION
  FROM..TO`, `DEFAULT`/`ASSERT`), idempotent via `OVERWRITE`.
- `encode`/`decode` round-trip: `Date`↔`DateTime`, `RecordId` table-restricted.
- A `Bun.serve` CRUD API: user CRUD + `RELATE` friend graph, against the live DB.

## Cost

| | Library code | Tracks Zod? | `@zod/core` coupling |
|---|---|---|---|
| **pure spike** | **306 LOC** (`pure.ts` 183 + `ddl.ts` 103 + `db.ts` 20) | automatic | none |
| **fork (core)** | ~10,350 LOC (`src/`) | manual re-impl | pervasive |

Not strictly apples-to-apples — the fork also reimplements every Zod type,
string/number format, and JSON-schema. But for table + relation + codec fields +
DDL + encode/decode, the pure approach is the whole thing. Upgrading the SDK
alpha.16 → 2.0.3 needed **zero** code changes. (The only Surreal-specific
detail is reading `recordId.table.name`, which the fork needs too.)

## The one real limitation (2 channels vs 4)

A field that wants an **app-side default and an independent DB-side default**
can't have both reached through the typed path:

```ts
status: sz.string().default("active").$default(surql`"pending"`)
```

- Raw insert omitting `status` → DB applies `DEFAULT "pending"`. ✅ (shown live)
- Through `encode()` → Zod's `.default("active")` fills first, so the DB's
  `"pending"` is shadowed. The app default always wins.

Related: a DB-filled field (`$default` only) is *required* in the single app
type, so "omit on create, present on read" isn't expressible in one type. The
fork's 4 channels (`dbinput` optional / `dboutput` required) solve both in one
schema.

**Pure-approach resolution (no fork needed):** derive a separate create-input
type (`$default`/`$value`/`id` fields optional) — the Prisma `Create` vs `Row`
pattern. Two channels + a derived input type covers it; not yet implemented here.

## Verdict

For real-world apps, **stock Zod 4 codecs + metadata + a derived create-input
type** appears to match the fork's DX at ~1/30th the library code and with **no
coupling to Zod internals** (so SDK/Zod upgrades are nearly free). The only thing
it can't do in a single schema is an app default *and* a different DB default on
the same field — niche enough that I'd reserve the `@zod/core` fork for that
requirement alone.
