# Design Review — Concept 7 "Merged" (`z7A8I`)

**Reviewer:** Dev Anand · **File:** `design/website.pen` · frame `z7A8I` (1440×6265, 11 sections) · **Date:** 2026-06-09
*Read-only review. No canvas edits made.*

---

## Verdict

This is a genuinely strong, on-brand comp — the dual-pane schema→SurrealQL money shot and the before/after comparison are exactly the right moves for this product, and the SurrealDB-purple + Geist palette makes it read as native to the ecosystem. But it's held back by three things: the **fold shows only text** (the proof lives below it), the page is **long and repeats its one idea four times** (Demo, Pipeline, CLI, Depth), and there are **accessibility + consistency slips** (muted captions under AA, two different primary-button styles). All fixable without a redesign.

**Readiness: 7.5 / 10** — near-launch; ship after the P0s.

---

## Strengths (preserve these)

1. **The money shot is right.** The Demo (`X72Rok`) — capabilities rail + synced `schema.ts` | connector | generated-SurrealQL panes — is the single artifact that proves "it's just Zod," "it emits real SurrealQL," and "there's a CLI" at once. This is the tRPC/Kysely pattern done well.
2. **Headline nails the positioning.** "Your SurrealDB schema, in the Zod you already know." + eyebrow "Zod for SurrealDB" is the exact familiarity-anchor the research pointed to. Subhead enumerates the `define*` vocabulary and names the payoff. Don't touch the copy.
3. **The comparison checklist** (`ZwkBv`) is a clean, honest trust device — "Single source of truth / Types in sync / Drift detection" with red-X vs green-check reads instantly and is appropriate pre-launch.
4. **Code chrome is consistent and premium** — every code window shares the macOS dots + purple-glow shadow (`#9600ff22` blur 60) + 1px border treatment. The syntax palette (pink strings, purple keywords, mint types) is cohesive and legible on `#100d18`.
5. **Brand discipline** — dark canvas, one accent system (purple→pink), Geist + Geist Mono. It looks like it belongs next to surrealdb.com without copying it.
6. **The Pipeline diagram** ("Author. Generate. Migrate.", `p84hqJ`) is the closest thing to an owned signature graphic and the punchiest section heading on the page.

---

## Issues, prioritized

### P0 — fix before launch

**P0-1 · Above-the-fold is text-only; the proof is below the fold.** *(conversion)*
The hero (`mZAZW`) ends at y=740 (Banner 42 + Nav 80 + Hero 618). On a ~900px viewport a dev sees eyebrow + H1 + subhead + CTAs + install pill, and only the *heading* of the Demo — the actual schema→DDL panes start ~y=900, below the fold. Every premium analog (tRPC, Tailwind, Kysely) puts the transformation *in* the hero. Right now the 5-second proof requires a scroll.
**Fix:** tighten the hero (top padding 104→~56, the `gap:26` and the `Install` top padding can shrink) and bring a *compact* version of the schema→DDL pane into the hero — either a right-column code card (Hono layout) or a single 2-pane strip directly under the install pill. Goal: the purple→pink "morph" from `sz.*` to `DEFINE` is visible without scrolling.

**P0-2 · Muted text fails WCAG AA.** *(accessibility)*
`text-muted` (`#6f6781`) computes to ≈3.6:1 on `$canvas`/`$surface` — under the 4.5:1 floor for normal text. It's used on functional/informational copy at 11–14px throughout: the Demo caption "Tabs cycle automatically…" (`WEwX2`, 14px), the "CAPABILITIES" rail label (`I5bmBK`, 11px), the checklist column headers "CAPABILITY / BY HAND" (`iGZWx`/`N9WwB9`, 11px), inactive PM-tab labels (`pnpm`/`bun`/`yarn`, 13px), and the copy icons.
**Fix:** lighten the `text-muted` token from `#6f6781` to ≈`#8a8399`–`#938ca3` (gets you ≥4.5:1), or promote informational captions to `text-secondary` (`#aaa1bb`, ≈7.9:1). Leave purely decorative glyphs as-is.

**P0-3 · Two different primary-button styles.** *(consistency / brand)*
The hero primary "Get started" (`kfoR5`) is a **white pill** (`#f5f3fa`, dark label). The FinalCTA primary (`oDgMK`) is the **purple→pink gradient pill** (white label). Same label, two identities — and the *brand gradient is absent from the one button above the fold*, where it would do the most work.
**Fix:** make the hero primary the gradient pill too (adopt `oDgMK`'s fill + `cornerRadius:10`). Pick one corner radius (hero uses 9999, FinalCTA uses 10 — unify). This also lands the signature gradient above the fold for free.

### P1 — should fix

**P1-1 · The page tells one idea four times.** *(information architecture)*
The schema→DDL→migrate story is shown in **Demo** (`X72Rok`, panes **+ an embedded terminal diff** `D9MJpg`), **Pipeline** (`p84hqJ`), **CLISpotlight** (`CXQ0U`, migrate terminal), and **Depth** (`hcFV3`, *another* schema|DDL dual pane). At 6265px / 11 sections for a single-value-prop tool, the middle sags and sections stop earning the scroll.
**Fix (two cheap cuts):** (a) **Delete the Demo's embedded terminal strip** (`D9MJpg`) — it duplicates CLISpotlight and is the main reason the money shot feels overloaded; let CLISpotlight own migrations. (b) **Cut or merge `Depth`** — it re-shows the Demo's exact artifact. If you keep a "one file" beat, fold it into the bento as a single cell. Target ~7–8 sections.

**P1-2 · The Demo's interactivity is ambiguous.** *(demo clarity — dimension 6)*
Two competing tab systems compete for "what drives the panes": the left **CAPABILITIES** rail (`jQaD0`, looks like nav) *and* the in-window **Tabs** (`CYKLF`). Then the caption says "**Tabs cycle automatically** — each one swaps the panes above," which reframes an interactive-looking component as a passive carousel and undercuts the "edit schema → see SurrealQL" pitch. "Open the playground →" (`NC9S0`) is the real interactive affordance but it's a small pill tucked at the bottom-right.
**Fix:** pick one control surface (recommend the CAPABILITIES rail *is* the tab set; drop the duplicate window tabs or make them mirror it). Reword the caption to invite action — e.g. "Click a capability to swap the panes — or edit the schema live." Promote "Open the playground" to a filled/gradient button and move it up beside the heading.

**P1-3 · No trust / ecosystem strip.** *(social proof — dimension 10)*
There's no logo wall, no version-compat signal, no GitHub device anywhere, and the secondary CTA is a bare "GitHub" (no star count — honest pre-launch, but it leaves a credibility void). The research explicitly recommended an honest ecosystem strip.
**Fix:** add a thin strip under the hero: "**Built for SurrealDB 3.x · MIT licensed · works with the official `surrealdb` SDK & Surrealist**" with the SurrealDB mark. Post-launch, swap in a real star count / "star us on GitHub" device. No fake adopters.

**P1-4 · FinalCTA repeats the H1 verbatim.** *(messaging)*
`urahy` re-uses "Your SurrealDB schema, in the Zod you already know." — at the close it reads as déjà vu rather than a fresh push.
**Fix:** give it an action close, e.g. "Define it once. Generate the rest." or "Stop hand-writing DDL — `npm i surreal-zod`."

**P1-5 · The signature graphic is buried.** *(brand distinctiveness — dimension 8)*
The one element that *owns* the Zod+SurrealDB blend is the `sz.*`→`DEFINE` morph — present as the Demo's 64px `Connector` and the Pipeline's middle box, but understated and first seen in section 5–6. The brand currently leans more SurrealDB-derivative than owned.
**Fix:** elevate the morph to the hero (ties to P0-1). Make the connector an explicit animated/gradient arrow that visibly transforms one block into the other — that's your Prisma-glowing-ring / Vite-glass-diamond equivalent.

### P2 — polish

- **P2-1 · "Zod" in the H1 is plain white** while "SurrealDB" gets the gradient (`TMskP`). Since the whole pitch is *blending* the two parents, give "Zod" a pink tint (`#ff85d6`) to balance the wordmark. *(brand)*
- **P2-2 · Gradient-text purple anchor.** The `#9600ff` start of "SurrealDB" sits at ≈3.4:1 on canvas — fine at 64px (AA-large ≥3:1) but the weakest point; nudge the gradient stop slightly lighter (toward `$accent-soft #c77dff`) for safety, and never reuse this gradient on sub-24px text. *(accessibility)*
- **P2-3 · `sz` is overloaded** — it's the import alias (`sz.*`), the CLI bin (`sz generate` / `sz migrate`), and the package is `surreal-zod`. Add one clarifying line near the install pill (e.g. "`surreal-zod` installs the `sz` CLI"). *(clarity)*
- **P2-4 · Hero vertical rhythm is airy** (104px top pad + 618px tall). Tightening also directly helps the fold (P0-1).

---

## Responsive / mobile risk (it's a 1440 desktop comp — flag now)

These will break or be unusable <768px and need an explicit stacking plan before build:
- **Demo body** (`Yks4r`): 298px rail + dual panes + 64px connector is a 3-column layout — must collapse to rail-as-dropdown over a single stacked pane.
- **Comparison checklist** (`ZwkBv`): **fixed `width:980`** with 220/240px columns — will overflow the viewport. Make it `fill_container` and consider a stacked card layout per row on mobile.
- **Pipeline diagram** (`U480YB`, **fixed `width:1312`**): horizontal 4-stage flow — must rotate to vertical on mobile.
- **StopHandwriting before/after** and **Depth dual pane** (`qudRe`): side-by-side code → must stack; code wrapping at narrow widths needs testing.
- The **Demo window** (`920`-ish), **Terminal** (`920`), and **install Cmd** (`380`) fixed widths all need `fill_container` or max-width treatment.

---

## Top 5 changes before launch

1. **Pull the transformation above the fold** — tighten the hero and embed a compact `sz.*`→`DEFINE` pane so the proof + the brand signature are the same object the dev sees in 5 seconds. *(P0-1, highest leverage)*
2. **Make the hero primary the purple→pink gradient** and unify button radius — fixes consistency and lands the signature above the fold. *(P0-3)*
3. **Lighten `text-muted` to clear AA** for all informational captions/labels. *(P0-2)*
4. **Cut the redundancy:** delete the Demo's embedded terminal strip and cut/merge the `Depth` section — declutters the money shot and tightens the page to ~7–8 sections. *(P1-1)*
5. **Add an honest trust strip** ("Built for SurrealDB 3.x · MIT · official SDK") + a real GitHub device, and clarify the Demo's interactivity ("click a capability / edit live" + a prominent Open Playground). *(P1-3, P1-2)*

---

## Benchmark note

Against the research's strongest analogs: this comp already matches **tRPC** (dual synced editors) and **Kysely** (edit→generated-output) on the core artifact, and borrows **Biome's** before/after comparison cleanly — and unlike either, it's genuinely *native* to the SurrealDB visual world. Where those three still beat it: they all put the transformation **in the hero** (the proof is the first thing you see), and the premium tier (**Prisma**, **Vite**, **Resend**) each lead with **one owned signature visual** plus a **trust wall** — neither of which lands above the fold here.

**The single move that takes this from good to premium:** replace the text-only hero with a live `sz.*`→`DEFINE` **morph** as the hero's signature object — so the 5-second value proof and the brand's owned graphic are one and the same. That's the tRPC/Tailwind play, adapted to the one story only surreal-zod can tell.
