# Production Review — Concept 7 "Merged" (`z7A8I`)

**Reviewer:** Sofia Reyes · art director · **File:** `design/website.pen` · frame `z7A8I` (1440 × 6265, 11 sections) · **Date:** 2026-06-09

Lens: **layout, information architecture, visual appeal, structure** — composition, grid, spacing rhythm, type hierarchy, color/depth, craft. Conversion funnels and accessibility audits are out of scope here (handled in `c7-design-review.md`). This document drives the **"Concept 7 — Production"** build.

---

## Studio verdict

This is a genuinely confident comp — native to the SurrealDB world (deep purple-black, Geist, syntax-true code chrome) without copying it, and the dual-pane schema→SurrealQL artifact is the right hero idea. What keeps it from reading *expensive* is **three craft gaps**: the **fold is text-only** (the one image worth selling lives below it), the page **shows the same dual-pane window four times** so the middle loses cadence, and the **measurements drift** — every section invents its own H2 size, eyebrow style, vertical padding, and inner max-width, so the page never settles into a grid. None of this needs a redesign; it needs an art-director pass: bring the transform into the fold, cut the echoes, and impose one spacing/type/width system so the whole thing breathes on a single rhythm.

---

## Per-section crit (all 11)

### 1. Banner (`F5T61`)
- **Composition/type:** Centered `NEW` gradient pill + one line + arrow. Clean, slim (42px). Good.
- **Craft:** The pill gradient is `rotation 270` (vertical) while every other brand gradient is `300` (diagonal) — a 1-degree-of-care inconsistency. The line is `text-secondary` at 13px — fine here.
- **Changes:** Unify the pill gradient angle to the brand `300`. Otherwise keep. It earns its 42px.

### 2. Nav (`IZCoU`)
- **Composition:** Logo left, links centered-ish, GitHub + "Get started" right. Standard, well balanced at 64px gutter.
- **Craft:** Nav "Get started" is a **white pill**; the hero "Get started" is also white; the FinalCTA "Get started" is the **gradient** pill. Three CTAs, two identities. The nav can stay neutral (white/ghost) but the *hero* primary must carry the brand gradient.
- **Changes:** Keep nav as-is (neutral is correct for a nav). Note it as the reference for resolving the hero button.

### 3. Hero (`mZAZW`) — **the headline problem**
- **Composition:** Center axis, vertical: eyebrow → H1 → subhead → CTAs → install. Disciplined single-axis composition; airy. But it ends at ~y740 and **shows zero proof** — the product's whole reason to exist (schema in → SurrealQL out) is below the fold.
- **Type:** H1 64/600/-1.8 is the right display size. But "SurrealDB" gets the purple→pink gradient while "Zod" — the other half of the entire pitch — is plain white. The wordmark is lopsided; the blend isn't expressed.
- **Color/depth:** Radial purple wash behind the text is tasteful. The primary CTA is a **white pill** — the signature gradient is *absent from the one button above the fold*, where it would do the most work.
- **Changes:** (a) Tighten top padding 104→56 and the internal gaps so the fold can hold more. (b) **Add a compact `schema.ts → user.surql` code window directly under the install pill**, with a gradient-circle connector — the morph becomes the hero's signature object and the 5-second proof. (c) Make the primary CTA the purple→pink gradient pill; unify corner radius. (d) Tint "Zod" pink (`#ff85d6`) to balance the gradient "SurrealDB" and literally render the blend.

### 4. Demo (`X72Rok`) — strong, but overloaded
- **Composition:** 298px CAPABILITIES rail + a full code window (title bar → schema|connector|DDL panes → **embedded terminal**) + a caption row. The single best artifact on the page.
- **Hierarchy issue:** Two competing control surfaces — the left rail *and* the in-window tabs — both look like "what drives the panes," and the caption ("Tabs cycle automatically") reframes an interactive-looking thing as a passive carousel. One focal control, please.
- **Redundancy:** The **embedded terminal** (`D9MJpg`) duplicates the dedicated CLI Spotlight and is the main reason the money shot feels heavy.
- **Connector:** The pane divider here is a plain bordered 64px gutter — weaker than the gradient-circle connector that the Depth window already uses. Borrow the better one.
- **Changes:** Cut the embedded terminal (migrations belong to the CLI section). Pick one control surface (the rail leads; tabs mirror or go). Upgrade the connector to the gradient circle. Reword the caption to invite action.

### 5. StopHandwriting / comparison (`z9Rwe`)
- **Composition:** Eyebrow → "Stop **hand-writing** SurrealQL." → before/after windows → caption pill → 6-row checklist (`ZwkBv`, **fixed 980**). A clean, honest "why not raw SurrealQL" beat — the red-struck "hand-writing" + the danger-red/success-green windows give the page its one moment of *drama*.
- **Craft:** The two compare windows aren't height-locked, so their bottom edges don't align — sloppy on close read. The checklist's fixed 980 width is narrower than the section's 1312 content, so it floats without a deliberate reason. H2 here is 44 — bigger than every other section H2 (36/42).
- **Changes:** Lock the before/after windows to equal height. Bring the checklist into the shared centered max-width. Normalize H2 to the section scale. Keep the drama — it's the best emotional beat.

### 6. WhatYouGet / bento (`lymfP`)
- **Composition:** Row1 = one wide 748 card + a 2-stack right column; Row2 = three equal cards. A reasonable bento, but the row heights (330 / 262) and the 748 hero-card width feel arbitrary rather than tuned, and the section currently sits at position 6 — *before* the Pipeline and CLI prove the workflow, so the "everything you get" roundup lands before the page has earned it.
- **Type/craft:** Card eyebrows/titles are consistent; the mini code chips inside are a nice texture. Good restraint.
- **Changes:** **Move the bento to after the CLI section** so it reads as the closing roundup of proven capabilities. Tune the bento proportions to the shared grid (golden-ish split, equal gutters). Keep the card system.

### 7. Pipeline (`p84hqJ`) — the owned graphic
- **Composition:** "Author. Generate. Migrate." over a 4-stage flow (`schema.ts → surreal-zod → user.surql → surrealdb`) on a faint blueprint grid with `.compile() / .diff() / .migrate()` labels. This is the closest thing to a *signature* diagram and the punchiest heading on the page.
- **Craft:** The faint grid + corner ticks read premium. The central surreal-zod node has a gradient border + glow — good focal point. The connector dots between stages are slightly mechanical.
- **Changes:** Keep and elevate. Tighten the stage spacing to the grid, make the gradient flow arrows a touch more deliberate. This is a keeper — protect it.

### 8. CLISpotlight (`CXQ0U`)
- **Composition:** "Migrations are first-class." over a single 920 terminal running `sz generate add_users` → `sz migrate` → `sz diff --live` with realistic diff output. Excellent, real, and the most credible proof of the CLI.
- **Craft:** Terminal chrome (traffic-light dots, running pill, purple glow) is consistent with the rest. Width 920 vs the checklist's 980 vs the demo's full-bleed — three different "centered artifact" widths.
- **Changes:** Promote this to the **sole owner of migrations** (now that the Demo's terminal is cut). Snap its width to the shared centered max-width token. Otherwise it's already strong.

### 9. Depth (`hcFV3`) — the echo to cut
- **Composition:** "Schema, DDL, and migrations — one file." over *another* dual-pane window (`access.ts → access.surql`). The content is honest (it shows the access-control capability), but structurally it's the **fourth** schema→SurrealQL dual-pane on the page — the format has stopped surprising.
- **Salvage:** Its connector (`gSM91`, a 38px gradient circle labeled "DDL") is the **best connector in the file** — better than the Demo's plain divider.
- **Changes:** **Remove the section**, but **harvest its gradient-circle connector** into the hero card and the Demo. The access-control capability is already represented in the bento, so nothing essential is lost.

### 10. FinalCTA (`urahy`)
- **Composition:** Radial purple wash, centered H2 + sub + dual CTA (gradient primary + install pill). The composition is right and the gradient primary here is the button the hero should be borrowing.
- **Issue:** The H2 repeats the H1 **verbatim** ("Your SurrealDB schema, in the Zod you already know.") — at the close it reads as déjà vu, not a fresh push. The sub ("Generate the DDL. Run the migrations. Keep your types. One install away.") is good.
- **Changes:** Keep the composition and gradient button. Recommend a fresh closing headline (copy decision for the owner — I'll preserve the verbatim copy in the build per the "keep copy verbatim" constraint, and flag the swap).

### 11. Footer (`JIhYo`)
- **Composition:** Brand blurb (300) + three 160 link columns, space-between. Clean, conventional, correctly the quietest thing on the page.
- **Changes:** None structural. It already doubles as docs nav (Zod-style). Optionally add a bottom legal/credit line for finish.

---

## Whole-page (aggregate) crit

**Narrative / IA flow.** The arc is mostly right — *what it is* (hero) → *proof* (demo) → *why not raw SurrealQL* (compare) → *what you get* (bento) → *how* (pipeline) → *payoff* (CLI) → *one file* (depth) → *act* (CTA). But two things break the cadence:
1. **The bento (sec 6) lands before the workflow is proven** (Pipeline/CLI, sec 7–8). A "here's everything you get" grid should *summarize* proof, not precede it. Move it after the CLI.
2. **The same dual-pane window appears four times** (Demo, Pipeline's middle, Depth, plus the Demo's embedded terminal echoing the CLI). After the second, it stops being a reveal and becomes wallpaper. The page must show the transform *once* with full weight (the Demo), gesture at it in the fold (a compact hero card), and then change the *form* of the argument each subsequent section (diagram, terminal, grid) rather than repeat the window.

**Rhythm / cadence.** Surfaces currently alternate only loosely and section vertical padding is improvised (72/80, 76/84, 80/88, 96/96). The page never locks to a beat. Fix: one vertical spacing scale and a strict canvas / canvas-2 surface alternation so the eye feels a steady pulse down the scroll.

**Balance / consistency (the expensive-craft tax).** Four section H2 sizes (36/42/44/46), three eyebrow treatments (a pill in the Demo, `// COMMENT` mono elsewhere, a dot-label in the hero), and three "centered artifact" widths (920 / 980 / full-bleed). Each is small; together they read as *unsettled*. A single H2 size, one eyebrow style, and one content max-width is the difference between "good comp" and "Linear-tier."

**What is MISSING:**
- **A trust / ecosystem strip.** No version-compat signal, no ecosystem anchor, no GitHub device anywhere. Every premium analog (Biome, Astro, Vite, Turso) seats one near the top. *Add a thin, honest strip under the hero* — "Built for SurrealDB 3.x · MIT licensed · works with the official `surrealdb` SDK & Surrealist" — no fake adopters.
- **An objection-handling beat (FAQ).** The comparison answers "why not hand-write SurrealQL"; nothing answers "is it *really* just Zod?", "how do migrations run?", "does it cover the whole `define*` vocabulary?", "which SurrealDB version?". Valibot/Kysely both seat a short FAQ. *Add a compact 4-item FAQ before the final CTA.*
- **The transform above the fold** (covered in Hero). The single biggest miss.

**What should be REMOVED or MERGED:**
- **Remove Depth** — the 4th dual-pane echo. Harvest its gradient connector; the access capability survives in the bento.
- **Merge the Demo's embedded terminal into the CLI section** — delete `D9MJpg`; let CLISpotlight be the single home for migrations.
- (Result: the schema→SurrealQL *window* appears exactly twice — a compact taste in the hero and the full showcase in the Demo — and every other section argues the same point in a *different visual form*.)

---

## Final section list (the build)

| # | Section | Action | One-line rationale |
|---|---------|--------|--------------------|
| 1 | Banner | keep | Slim announcement; just unify the gradient angle. |
| 2 | Nav | keep | Neutral nav is correct; it's the reference for button hierarchy. |
| 3 | Hero **+ code card** | **rebuild** | Bring the transform above the fold; gradient primary; tint "Zod"; the morph becomes the signature object. |
| 4 | **Trust strip** | **ADD** | Honest ecosystem/version anchor — the missing credibility beat, seated where every premium analog puts it. |
| 5 | Demo | keep (−terminal) | The money shot stays early; cut its embedded terminal and upgrade the connector. |
| 6 | StopHandwriting / compare | keep | The "why not raw SurrealQL" drama — the page's one emotional moment; height-lock the windows. |
| 7 | Pipeline | keep | The owned signature diagram — protect and elevate it. |
| 8 | CLISpotlight | keep | Now the sole, credible home for migrations. |
| 9 | WhatYouGet / bento | **REORDER → here** | Reads as the closing roundup of *proven* capabilities, not a premature promise. |
| 10 | **FAQ** | **ADD** | Objection-handling ("is it really Zod?", migrations, version) the page currently lacks. |
| 11 | FinalCTA | keep | Composition is right; it already owns the gradient button the hero borrows. |
| 12 | Footer | keep | Quiet docs-nav close. |
| — | ~~Depth~~ | **REMOVE** | 4th dual-pane echo; connector harvested, capability lives in the bento. |

**Net structural moves:** ADD Trust strip + FAQ + hero card · REMOVE Depth + Demo's embedded terminal · REORDER bento to after the CLI · plus the system pass (one spacing scale, one H2 size, one eyebrow style, one content max-width, strict surface alternation).

---

## The system to impose (art-director pass)

- **Grid:** 1440 frame, **64px gutter** (keep), content max **1312**; one **centered-artifact max-width = 960** (terminal, checklist, hero card) so "focused" blocks share a column while big showcases (Demo, Pipeline) go full 1312.
- **Vertical spacing scale:** section padding **100 top / 100 bottom** for all major sections (hero and FinalCTA get the larger end); head→body gaps on a 12/24/36 step. Sections breathe on one pulse.
- **Type hierarchy:** Hero H1 **64/600/-1.8**; every section H2 **40/600/-1.1**; eyebrow **mono 12 / +1.2 tracking / accent-pink** in the `// LABEL` comment voice (one style everywhere); subhead **17–18/1.5/secondary** ≤ 680 wide; one focal point per section.
- **Color/depth restraint:** dark canvas + the single purple→pink gradient reserved for *actions and the morph* (CTA, hero connector, pipeline node), never decorative. Code windows share one chrome (traffic-light dots, 1px `$border`, `#9600ff22` glow). **Strict surface alternation:** canvas-2 / canvas / canvas-2 … down the page for cadence.
- **The morph as signature:** the gradient-circle `sz.* → DEFINE` connector becomes the recurring brand object — in the hero card, the Demo, and the Pipeline node — so the page has one owned graphic instead of four similar windows.

---

## Responsive / mobile risk (desktop comp — flag for build)

- **Demo body** (rail 298 + dual panes + connector) is a 3-column layout — must collapse to rail-as-tabs over a single stacked pane < 900px.
- **Comparison checklist** (`ZwkBv`, fixed 980 with 220/240 columns) and **Pipeline diagram** (fixed 1312, absolute-positioned children) will both overflow — the checklist needs a stacked-card fallback per row; the pipeline must rotate to a vertical flow.
- **Before/after compare windows** and any dual-pane must stack vertically; test code-line wrapping at narrow widths.
- The new **hero card** (~960) and **CLI terminal** (960) should be `fill_container` with a max-width, not fixed, so they shrink cleanly.

---

## The one move that takes it from good to premium

Put the `sz.* → DEFINE` **morph in the fold** as the hero's signature object, then **stop repeating the window** — argue the same transform in a *different visual form* every section after (diagram, terminal, grid). The proof and the brand's owned graphic become the same object the developer sees in five seconds, and the page finally reads on one grid, one type scale, one rhythm.
