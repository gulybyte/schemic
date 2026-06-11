# Feature brief — Zod drop-in + bring-your-own-types

> **For the landing / docs writer (or agent).** This describes shipped, user-facing capabilities
> of surreal-zod. Your job: decide whether these warrant a new section or callout on the
> marketing landing page (the production design concept **`np2LC`** in `design/website.pen`) or in
> the docs, and if so draft copy that fits the existing brand and information architecture. This
> is capabilities and value only — no implementation details. The short code snippets show what a
> developer *writes* (the developer experience); they are not internals.
>
> Product context: surreal-zod lets you author SurrealDB schemas in Zod (`sz.*`, a drop-in for
> `z.*`), generate SurrealQL DDL, and run migrations. The landing hero already promises
> *"Your SurrealDB schema, in the Zod you already know."* These features make that promise literal.

---

## Capability 1 — It really is a drop-in for Zod (highest-value story)

**What it does.** `sz.*` mirrors `z.*` one-to-one: the same constructors and chaining, plus the
type-inference helpers developers reach for — `sz.infer<>`, `sz.input<>`, `sz.output<>`,
`sz.TypeOf<>` — plus coercion (`sz.coerce.string()`, …), `sz.nullish()`, and the full constructor
surface.

**Developer experience.** You can take an existing Zod schema and migrate it by find-and-replacing
`z.` with `sz.` — no new API to learn, no naming collisions.

**Why it matters.** This is the literal proof of the hero promise. For anyone who already knows
Zod — most of the TypeScript ecosystem — the cost of adoption is essentially zero. It removes the
single biggest objection: *"do I have to learn a new schema language?"*

**Honesty guardrail.** A few Zod types have no SurrealDB equivalent (e.g. `sz.symbol()`,
`sz.function()`). They exist only so the find-and-replace never breaks — but they are **rejected as
database fields** (see Capability 3). Do not imply you can store a symbol in the database.

**Suggested angles.**
- Headline-adjacent: *"Already know Zod? You already know surreal-zod."*
- Proof line: *"`sz.*` is a 1:1 drop-in for `z.*` — `infer`/`input`/`output`, `coerce`, the lot.
  Migrate with find-and-replace."*
- FAQ entry: *"Do I have to learn a new API?" → "No. It's Zod."*

---

## Capability 2 — Bring your own types

**What it does.** Store any custom class or value in SurrealDB by telling surreal-zod two things:
the **wire type** (as any `sz.*` field) and a small **encode / decode** pair.

```ts
sz.instanceof(Money).$surreal(sz.string(), {
  encode: (m) => m.toString(),   // app value  → database
  decode: (s) => new Money(+s),  // database    → app value
})
```

The wire type can be *any* sz type — `sz.array(sz.string())`, `sz.recordId("user")`, and so on —
and surreal-zod uses it to pick the right SurrealQL column type automatically. It's fully typed:
`encode` must produce the wire type, your app code keeps the rich type (`Money`), and the database
sees the wire type (`string`).

**Why it matters.** Schemas aren't limited to built-in scalars. Domain types — money, big numbers,
branded IDs, custom value objects — become first-class database fields with full type-safety,
instead of forcing you to hand-roll serialization or fall back to `any`. It reframes the rule from
*"that type isn't supported"* to *"teach it how to store, once."*

**Differentiator.** Database-first tools in this space (e.g. Surrealist, Drizzle Studio) start from
the database, not from your typed code, and don't offer a typed escape hatch like this.

**Suggested angles.**
- Bento cell: *"Bring your own types — store any class with a typed codec:
  `.$surreal(wire, { encode, decode })`."*
- A "vs. database-first tools" comparison beat.

---

## Capability 3 — Mistakes are caught while you type

**What it does.** If you use a type that has no SurrealDB mapping as a table field, you get an
editor error as you type (a clear message pointing you to add a serializer or remove the field) —
not a surprise at migration time. It's also caught when generating migrations, as a backstop.

**Why it matters.** Reinforces the end-to-end type-safety story already on the page: the schema,
the generated SurrealQL, the migrations — and now the *validity of every field* — are all checked
by the compiler. Less to discover the hard way.

**Suggested angle.** Supporting copy for the existing "end-to-end types" pillar — not its own
section.

---

## Placement guidance

- **Capability 1** is the highest-value addition — it sharpens the hero's central claim. Strong
  candidate for a trust-strip line, a bento cell, and/or an FAQ entry.
- **Capability 2** is a natural bento cell, or a beat in a "what you get" / depth section.
- **Capability 3** folds into existing type-safety copy.
- Stay within the established brand (dark canvas, the purple→pink gradient, Geist / Geist Mono) and
  the `np2LC` structure. Don't add a whole new section where a line in an existing one will do.
