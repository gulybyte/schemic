# Landing backlog

Landing-page-worthy items found while shipping code. Apply to the Pencil design
(`design/website.pen`, production concept `np2LC`) in batches. Brand/design system notes live
in the `docs-website` memory.

## From the Zod-drop-in + `$surreal` work (2026-06-09)

- **Drop-in Zod compatibility** — HIGH. Directly reinforces the hero ("the Zod you already
  know"). Message: `sz.*` mirrors `z.*` 1:1 — `infer` / `input` / `output` / `TypeOf`, `coerce`,
  `nullish`, even the exotics (`symbol`/`custom`/`instanceof`/…). Migrate by find-and-replace
  (`z.` → `sz.`), no collisions. Placement: a bento cell or a trust-strip line; also seeds an
  FAQ entry — "Do I have to learn a new API?" → "No. It's Zod."

- **Bring your own types** — MED. Store any custom class with
  `.$surreal(type, { encode, decode })` — a typed codec straight to SurrealDB. A differentiator
  vs Surrealist / Drizzle Studio. Placement: a bento cell, or part of the depth/code section.

- **Compile-time field safety** — LOW / supporting. Field types with no SurrealQL mapping are
  rejected by the LSP, not just at runtime. Folds into the existing "end-to-end types" pillar.

## From the ALTER-migrations work (2026-06-10)

- **Incremental, non-destructive migrations** — HIGH. The CLI now diffs into clause-level
  `ALTER TABLE` / `ALTER FIELD` (and `REMOVE`+`DEFINE` for indexes) instead of blanket
  `OVERWRITE`. Migrations touch only what changed and preserve unmentioned clauses — and every
  generated up/down round-trips on real SurrealDB (live-tested). Message: "Safe migrations, not
  rip-and-replace." A clear differentiator for the CLI spotlight section; also strong as a
  before/after code snippet (OVERWRITE the whole table vs. one `ALTER FIELD … TYPE`).

## From the canonical-parity + shadow-verify work (2026-06-10)

- **Migration drift detection (`sz check`)** — HIGH. `sz check` replays every migration from zero
  on a throwaway database and checks it reproduces your declared schema — catching the bug every
  DDL migration tool has but few detect: a hand-edited migration, or a schema change nobody
  generated a migration for. Message: "Know your migrations actually build your schema." Strong
  CLI-spotlight / trust item; pairs with the incremental-migrations story. Demo: edit a schema,
  skip `sz gen`, run `sz check` -> it shows the exact drift. (`--offline` does fast static-only.)

- **`sz diff --live` drift vs the running DB** — MED (noted earlier, still uncaptured). Diff your
  schema against the *actual* database, normalized through SurrealDB so there's no formatting
  noise. Complements `sz check` (one checks migrations, the other checks the live DB).

- **Zero-setup migration checks** — MED/HIGH. `sz check` spins up an ephemeral in-memory SurrealDB
  from your local `surreal` CLI (your exact version), replays every migration, and tears it down —
  no server to run, no config, your real database never touched. Message: "Verify migrations with
  zero setup — no database required." Reinforces the "safe migrations" pillar and lowers the
  try-it barrier. Demo: `sz check` working with nothing running.
