# surreal-zod — Landing Page Research Brief

Research conducted in a real browser (Chrome DevTools MCP): full-page screenshots + structured DOM/CSS extraction of each landing page. Date: 2026-06-09.

**What surreal-zod is (for grounding):** Author SurrealDB schemas with Zod (`sz.*`, a drop-in for `z.*`), generate SurrealQL DDL, and run migrations via a CLI. "Zod + Drizzle, but for SurrealDB." The killer DX: a familiar `sz.*` schema → generated `DEFINE TABLE/FIELD/INDEX/EVENT/ACCESS …` SurrealQL → a declarative migration CLI.

Sites covered: zod.dev, valibot.dev, orm.drizzle.team, prisma.io, trpc.io, kysely.dev, hono.dev, biomejs.dev, bun.sh, astro.build, tailwindcss.com, turso.tech, resend.com, clerk.com, vite.dev, surrealdb.com. None failed outright; Astro and SurrealDB lazy-load (extracted via scroll).

---

## 1. Per-site teardown

### Closest analogs (schema-as-code / validation / TS-DX)

**zod.dev** — *No marketing page; the home IS the docs intro.*
- Hero: logo + "TypeScript-first schema validation with static type inference" / "by @colinhacks". No CTA buttons — just docs nav + Website/Discord/X links.
- Money demo: a single syntax-highlit `z.object` → `.parse()` block ("define a schema… validated and type safe!"). Code is shown as plain reference, not a sales device.
- Section order: Intro → Features (bulleted) → Installation (`npm install zod`) → Requirements → Ecosystem → Sponsors (Platinum→Bronze sponsor wall).
- Visual: near-black `#050505`, Inter body, mono code, pink accent `#ff85d6`. Extremely austere/docs-first.
- Takeaway: Zod's brand authority comes from restraint + the sponsor wall, not a marketing funnel. We can borrow the trusted-minimal tone but we DO need a real landing.

**valibot.dev** — feature-first, playful.
- Hero: "Validate unknown data with confidence" (with a scramble/glitch animation on "unknown data"). Subhead: "Valibot is the open source schema library for TypeScript with bundle size, type safety and developer experience in mind." CTAs: **Get started** (cyan) + **Playground** (secondary).
- Money demo: NO code in hero — an embedded video card ("Going fully modular with Valibot") instead; pushes you to the Playground.
- Section order: hero → video → "Highlights you should not miss" (2-col icon feature grid) → FAQ ("How is it different from Zod?") → repeat CTA → footer.
- Visual: dark navy `oklch(0.21 0.034 264.665)` ≈ `#1b2236`, **Lexend** rounded display font, cyan accent. Mascot robot.
- Hexes: `#1b2236`, `#06b6d4` (cyan), `#e2e8f0`.

**orm.drizzle.team** — personality + social-proof driven (NOT code-forward).
- Hero: hand-styled "ORM for you to ~~ship ship ship~~ settle" (crossed-out doodle), "backed by PlanetScale". CTAs: Get Started, Documentation, Search Docs, **Ask Docs**. GitHub 33k+ pill.
- Money demo: none in hero. Instead a whiteboard doodle graphic + later a **Performance** benchmark (latency/RPS charts vs Prisma) and **Drizzle Studio** data-explorer demo.
- Section order: hero → "We ship decently fast" (contributor activity + release progress) → Performance (vs Prisma charts) → "Live on the edge" (runtime logo grid) → "Connect to any database" (driver logo grid) → Drizzle Studio → Sponsors → **Pricing ("Just kidding. Drizzle is free and open-source")** → **huge "Developers love Drizzle ORM!" testimonial wall** (incl. ironic "I hate Drizzle" tweets) → footer.
- Visual: `#111`, neon **lime-green** accent, hand-drawn doodle annotations, strong irreverent personality.
- Hexes: `#111111`, `#c5f74f` (lime), `#e1e1e1`.

**prisma.io** — premium platform pitch, 3D hero visual.
- Hero: "Postgres, perfectly managed." (3 words) / "Real Postgres with the developer experience and infrastructure to ship faster." CTAs: **Create database** (teal) + a copyable install pill `$ npx prisma init`. GitHub 46.2K.
- Money demo: feature cards with mini-UI mockups ("Your database, right in your workflow": MCP Server, Manage databases, **Type-safety** [autocomplete + red squiggle error shown], Browse your data) — product screenshots, not raw code.
- Section order: hero → workflow feature cards → "Postgres that fits your stack" (integration logos) → **"Real Postgres. Better experience."** (signature 3D glowing-ring database illustration) → "Build anything. Deploy instantly." → "TRUSTED BY 500k+ DEVELOPERS" testimonial grid → "Ready to try Prisma?" CTA → footer.
- Visual: `#030712` near-black navy, signature **teal glow**, 3D database render with glowing rings, Inter.
- Hexes: `#030712`, `#16a394` (teal), `#5af0c8` (glow).

**trpc.io** — **code-as-hero, twoslash type-flow (most relevant).**
- Hero: "Move Fast and Break Nothing. End-to-end typesafe APIs made easy." / "Experience the full power of TypeScript inference to boost productivity for your full-stack application." CTAs: **Star 40,304** (GitHub) + **Quickstart →**.
- Money demo: **two synced editor windows in the hero** — `server.ts` (left) defines a procedure, `client.ts` (right) calls it — with **twoslash hover tooltips showing inferred types** (`const input: { name: string }`). Shows the value prop (inference flows across the boundary) as live code.
- Section order: hero (dual editors) → "SUPPORTED BY" sponsors → 6-up feature grid (Automatic typesafety, Snappy DX, Framework agnostic, Autocompletion, Light bundle, Batteries included) → "As used by" (Netflix, PayPal) → step-by-step walkthrough ("Define your procedures" → "Create your HTTP server" → "Connect your client and start querying!") → "Try it out for yourself!" → testimonials → sponsors.
- Visual: black, mono-heavy, blue accent; twoslash tooltips are the signature.
- Hexes: `#000000`, `#398ccb` (blue), `#e6e6e6`.

**kysely.dev** — autocomplete-in-editor + live input→output playground.
- Hero: big light "Kysely" / "The type-safe SQL query builder for TypeScript." CTAs: **Getting started** + **View on GitHub**.
- Money demo: a **macOS editor window with an animated IntelliSense autocomplete dropdown** (`.selectFrom(...)` completions) — the "what you see is what you get" pitch as live typing. Later, a **"Try it out for yourself!" playground: edit the query on the left, see generated SQL on the right.**
- Section order: hero (editor w/ autocomplete) → **"Show this to your boss!"** (2-col checkmark feature grid; note **"Take control over your migrations"**) → **"What the internet is saying"** (very large testimonial wall) → "Try it out for yourself!" (query→SQL playground) → "Looking for code examples?" → footer.
- Visual: light blue gradient hero → dark body; realistic editor chrome; blue accent.
- Hexes: `#0b1929` (body), `#3b82f6`, gradient `#bcd7ff`.

### DX / landing exemplars

**hono.dev** — clean minimal: hero-left + code-card-right.
- Hero: "Hono" (orange) + "Web application framework" / "Fast, lightweight, built on Web Standards. Support for any JavaScript runtime." CTAs: **Get Started** (orange pill) + **View on GitHub**.
- Money demo: a code card to the right of the hero text — the minimal 6-line "Hello Hono" (`import { Hono }` → `app.get('/', …)` → `export default app`). macOS dots.
- Section order: hero (text left / code right) → 4 feature cards (Ultrafast & Lightweight, Multi-runtime, Batteries Included, Delightful DX) → footer. That's it — radically minimal.
- Visual: `#1e1e20`, orange flame accent `#ff6b00`, VitePress-based.
- Hexes: `#1e1e20`, `#ff6b00`, `#e3e3e3`.

**biomejs.dev** — before/after/benchmark code triptych.
- Hero: "One toolchain for your web project" / "Format, lint, and more in a fraction of a second." + wordmark. CTAs: **Get started** (blue) + **View on GitHub**.
- Money demo: **"Format code like Prettier"** = a 3-pane block: **CODE (messy) → OUTPUT (formatted) → PERFORMANCE (bar chart, "~35x faster than Prettier")**. Then **"Fix problems, learn best practice"** = a terminal-style **linter diagnostic with contextual safe-fix output**. Install snippets `npm i -D --save-exact @biomejs/biome`.
- Section order: hero → format triptych → lint diagnostics → "Everything all at once" (`check`) → 6-up feature grid → "Try Biome" (editor ext) → **"Trusted by leading organizations" logo wall** (Astro, AWS, Cloudflare, Google, Microsoft…) → Community → Sponsors.
- Visual: deep blue `#17181c`, blue/purple accent + glow, line-numbered code.
- Hexes: `#17181c`, `#5b6fff`/`#60a5fa`, `#e8e8ea`.

**bun.sh** — typing/cycling headline + live benchmark race.
- Hero: "Bun is a fast JavaScript **[runtime|bundler|test runner|package manager]**" — the noun **cycles with a typing/blinking-cursor animation**. Right side: a **live animated benchmark** ("Bundling 10,000 React components") with racing bars. Install `curl -fsSL https://bun.sh/install | bash` with **OS tabs** + copy.
- Section order: hero → "Four tools, one toolkit" → **"Who uses Bun?"** (Claude Code, Railway, Midjourney — video thumbnails) → "What's different about Bun?" (big comparison table) → "Everything you need to build & ship" (API category grid) → runtime/pkg-manager/test-runner deep dives (each with animated benchmark) → "The APIs you need. Baked in." → "Developers love Bun" testimonials.
- Visual: `#14151a`, warm **cream/beige** brand + pink/magenta accents, mascot, lots of animated bars.
- Hexes: `#14151a`, `#fbf0df` (cream), `#f472b6` (pink).

**astro.build** — cosmic purple gradient + Core-Web-Vitals bars.
- Hero: "The web framework for content-driven websites" / "Astro powers the world's fastest marketing sites, blogs, e-commerce websites, and more." CTA: Get Started + `npm create astro@latest`.
- Money demo: not code-in-hero; instead **"Astro Islands" performance bar chart** (Astro 66% passing CWV vs WordPress 48%, Gatsby 47%, Next 30%, Nuxt 28% — Astro's bar in brand color, winning) and a live "Zero Lock-in" interactive component+preview (add-to-cart demo).
- Section order: hero → "Used by the world's leading companies" logo wall (Google, VISA, Microsoft, Porsche, OpenAI…) → 3 pillars → Astro Islands (perf bars) → Zero Lock-in (framework logos + live demo) → **"Fully Featured" mega feature grid (14+ cards)** → Themes gallery → partner agencies → "Start building with Astro today" → sponsor wall.
- Visual: deep **purple/violet cosmic gradient** with nebula glow, dark body.
- Hexes: `#0d0f1a`, `#7611f9`/`#a78bfa` (purple), `#ff5d01` (orange accent).

**tailwindcss.com** — code→live-preview + bento of live demos.
- Hero: "Rapidly build modern websites without ever leaving your HTML." Money demo in hero: **HTML-with-Tailwind-classes (left) → live rendered card "The Lost Mariner" music player (right)** — input→output made literal. File tabs (index.html / app.css / package.json / Terminal).
- Section order: hero (code→preview) → **"Supported by the best" massive logo wall** (Cursor, Sanity, Supabase, OpenAI, Shopify, Clerk…) → **"Built for the modern web" bento grid where every cell is a LIVE rendered demo** (Responsive, Dark mode, P3 colors swatches, CSS grid, Gradients, 3D transforms…) → "Ship faster and smaller" → "Build whatever you want…" → Tailwind Plus.
- Visual: dark navy, sky-blue/cyan accent + **rainbow P3 gradients**, Inter. The live-component bento is the signature premium move.
- Hexes: `#0a0a14`, `#38bdf8` (sky), rainbow.

**turso.tech** — problem-framing narrative + dual product cards.
- Hero (styled h2): "Millions of Databases. One Architecture." Eyebrow: "The Database for the Age of AI Agents." / "Built on SQLite. Lightweight enough to multiply, fast enough to run anywhere…" CTA: **Start for free now** (mint) + `npx turso@latest`.
- Section order: hero → logo wall (KIN, mastra, val town, Prisma, Drizzle…) → **"Why Agents Need a New Database" (problem-first narrative paragraph)** → dual cards "Turso" (embedded) vs "Turso Cloud" each w/ icon mini-feature grids + layered DB-stack illustration → "Don't just take our word for it" testimonials → "Turso is the Database for Modern Applications" (use-case cards) → SDK logo grids → "Join the Community".
- Visual: `#0d1318` teal-black, **mint/green** accent `#4ade80`, pink/magenta eyebrow tags, layered green-cylinder illustrations.
- Hexes: `#0d1318`, `#4ade80`, `#e879f9` (tag).

**resend.com** — pure-black ultra-minimal premium.
- Hero: "Email for developers" (3 words) / "The best way to reach humans instead of spam folders. Deliver transactional and marketing emails at scale." CTAs: **Get started** (white pill) + Documentation. Subtle 3D wireframe topographic line + light beam.
- Money demo: "Integrate this morning" — SDK code editor with **multi-language tabs (Node.js / Serverless / Ruby / Python / PHP / CLI)** + email preview; later **"Develop emails using React"** = React code (left) → rendered email (right).
- Section order: hero → logo wall → "Integrate this morning" (SDK code) → "First-class developer experience" (Test mode, Modular webhooks) → "Write using a delightful editor" → "Develop emails using React" → "Reach humans, not spam folders" → "Everything in your control" → "Beyond expectations" testimonials → "Email reimagined. Available today."
- Visual: **pure black `#000`**, white text, ultra-restrained, floating 3D wireframe/orb accents, Inter. Reads most "premium."
- Hexes: `#000000`, `#ffffff`, subtle gray `#a1a1aa`.

**clerk.com** — alternating light/dark + component-code→rendered-UI.
- Hero: "More than authentication, Complete User Management" / "Need more than sign-in? Clerk gives you full stack auth and user management — so you can launch faster, scale easier…" CTAs: **Start building for free** (purple) + **Build with agents**. Announcement bar: "Clerk raises $50m Series C."
- Money demo: **"Pixel-perfect UIs, embedded in minutes"** — component code (`<SignUp/>`, `<SignIn/>`, `<UserButton/>`) on the left → the actual rendered, polished "Create your account" widget on the right.
- Section order: hero → logo wall → component code→UI demo → "Everything you need for authentication" (dark bento) → "The easy solution to multi-tenancy" (light, UI mockups) → "Subscription billing…" (UI mockup) → "Build with SDKs / Integrate with the tools you love" (dark) → "Trusted around the world" testimonials.
- Visual: primarily **LIGHT** `#f7f7f8` with **alternating dark sections**, Clerk purple `#6c47ff`, Geist/Suisse. Realistic product UI as the visual.
- Hexes: `#f7f7f8`, `#6c47ff`, `#1d1d1f`.

**vite.dev** — 3D glass isometric hero + purple gradient panels + big stats.
- Hero: "The Build Tool for the Web" / "Vite is a blazing fast frontend build tool powering the next generation of web applications." CTAs: **Get Started** + **View on GitHub**, install `npm create vite@latest` with **PM tabs** (npm/Yarn/pnpm/Bun/Deno). Right: signature **3D isometric glass-layer diamond** (deconstructed lightning logo) with purple glow.
- Section order: hero → "Trusted by the world's best software teams" (OpenAI, Shopify, Stripe, Linear, ClickUp) → **"Redefining developer experience"** (Instant Server Start, Lightning Fast HMR, Rich Features, Optimized Build — each a **terminal/code shot on a purple gradient panel**) → "A shared foundation to build upon" → "Powering your favorite frameworks" → **"Loved by the community" + big stats "80k+ GitHub Stars / 80m+ Weekly NPM downloads"** + testimonials → "Free & open source" (VoidZero) + sponsor wall → "Start building with Vite."
- Visual: `#16171d`, Vite **purple→yellow gradient**, 3D glass hero, purple gradient code panels, Inter.
- Hexes: `#16171d`, `#646cff` (purple), `#ffb13b` (yellow).

### Ecosystem anchor

**surrealdb.com** — purple-black brand, AI-agent positioning, problem-first.
- Hero: "The context layer for AI agents" (recent repositioning toward agent memory). Eyebrow/banner: "SurrealDB 3.1 is here! Stability, DiskANN, new release process." CTA: **Try SurrealDB** (purple). Install `curl -sSf https://install.surrealdb.com | sh`. GitHub 32.3k.
- Section order: hero (animated purple **waveform** visual) → **"Agents fail due to context. Not models."** (problem-first) → "Build and run agents on the context layer" (Memory / Context / Storage / Recommendations pillars) → "Memory in the database, not above it" → use-case grid (Agent Memory, Real-Time Apps, Knowledge Graphs, Embedded/Edge, Digital Twins) → footer.
- Visual: dark purple-black `#0e0c14`, **purple/violet + magenta-pink** brand (`#9600ff` purple, `#ff00a0` pink), **Geist** font, dotted-waveform motion graphic.
- Brand to match/contrast: deep purple + a hot-pink secondary, dark, Geist. surreal-zod should feel native to this world but earn its own identity (lean Zod-pink-meets-Surreal-purple).

---

## 2. Cross-cutting patterns (what the best ones share)

**Hero formula.** The winners use one of two shapes:
- *"X for Y" / category claim* in ≤8 words (Resend "Email for developers"; Prisma "Postgres, perfectly managed."; Turso "Millions of Databases. One Architecture."; SurrealDB "The context layer for AI agents"). Subhead = one sentence naming the audience + the payoff.
- *Outcome promise* (tRPC "Move Fast and Break Nothing."; Tailwind "…without ever leaving your HTML"; Valibot "…with confidence").
- Almost always: **two CTAs** — primary "Get Started / Try it" (filled, brand color) + secondary "View on GitHub" (often with a live star count). A **copyable install snippet** sits right under the CTAs (`npx … / npm create … / curl …`), frequently with **package-manager or OS tabs**.

**How code is made the hero.** This is the single most important pattern for us. Ranked by relevance to a "schema → generated output" tool:
1. **Input→output side-by-side** (Tailwind HTML→preview; Kysely query→SQL; tRPC server→client; Resend React→email; Clerk component→UI). This literally shows the transformation. *This is exactly our story: `sz.*` schema → generated SurrealQL.*
2. **Twoslash type hovers** (tRPC) — proves the type-safety/inference claim inside the code itself.
3. **Animated typing / autocomplete** (Kysely IntelliSense dropdown; Bun cycling noun) — proves DX live.
4. **Before/after + benchmark triptych** (Biome) — proves "better + faster."
5. **Hero-text-left + code-card-right** (Hono) — the simplest, cleanest, lowest-effort version.
- Note the anti-pattern: Drizzle and Valibot put **no code in the hero**, leaning on personality/video/social proof instead — viable only if you already have a community.

**Section rhythm (the consensus order):**
`hero (+ code/visual) → logo/“used by” wall → the money demo (input→output) → feature grid/bento → comparison or benchmark → testimonial wall → final CTA → rich footer.`
Testimonial walls (Drizzle, Kysely, Bun, Vite, Prisma) and logo walls (Biome, Astro, Tailwind, Vite) are near-universal trust devices. "Show this to your boss!" (Kysely) and "Don't take our word for it" (Turso) are good section-header voices.

**The 1–2 visual moves that read "premium":**
- A **signature 3D/illustrated hero object** with glow (Prisma's glowing-ring DB, Vite's glass diamond, Resend's wireframe, SurrealDB's waveform) — one hero-defining graphic beats ten icons.
- **Dark canvas + a single saturated accent + a subtle gradient/glow** (Astro purple, Prisma teal, Vite purple→yellow). Restraint reads as quality (Resend's pure black is the extreme).
- **Live, real product UI** instead of stock icons (Tailwind bento, Clerk widgets, Drizzle Studio).
- **Real monospace code with proper syntax highlighting + macOS window chrome + line numbers**, never screenshots-of-screenshots. Inter for body, a quality mono (Geist Mono / JetBrains Mono / ui-monospace) for code is the default stack across nearly every site.

---

## 3. Landing ARCHETYPES for surreal-zod

### Archetype A — "Code-first hero with live input→output" (RECOMMENDED)
- **Hero angle:** the transformation is the pitch — Zod-shaped schema in, SurrealQL out.
- **Hero demo:** two synced editor panes. Left: `schema.ts` with `sz.table('user', { email: sz.string().email(), age: sz.number() })`. Right: the **generated `DEFINE TABLE user … DEFINE FIELD email … ASSERT string::is_email(...)`** SurrealQL, updating as you scrub. Optionally a third "terminal" tab showing `surreal-zod migrate` diff output. (tRPC × Kysely × Tailwind.)
- **Section order:** hero (schema→DDL) → "Built on / works with SurrealDB" logo+ecosystem strip → "From Zod to SurrealQL" deep-dive (the full `define*` vocabulary, tabbed) → migration CLI demo (terminal: declarative diff → `IF $direction` migration) → feature grid → "If you know Zod, you already know this" comparison → testimonials/early adopters → final CTA + install → footer.
- **Visual:** dark canvas, Surreal-purple→Zod-pink gradient accent, one signature visual (an animated arrow/morph from `sz.*` block to SurrealQL block), Geist + Geist Mono.

### Archetype B — "Comparison-driven (vs raw SurrealQL)"
- **Hero angle:** "Stop hand-writing SurrealQL DDL."
- **Hero demo:** before/after — left "By hand" (verbose `DEFINE TABLE/FIELD/INDEX …` with comments about drift), right "With surreal-zod" (a tight typed schema) + a small benchmark/credibility stat ("one source of truth, types + DDL + migrations"). (Biome triptych.)
- **Section order:** hero (before/after) → why-it-matters narrative ("Your schema and your types drift. surreal-zod makes them one file.") → migration CLI → feature grid → testimonials → CTA.
- **Visual:** split-screen red/strike "before" vs green/clean "after"; dark, high-contrast.

### Archetype C — "Terminal/CLI-forward"
- **Hero angle:** the migration workflow is the headline — "Schema migrations for SurrealDB that just work."
- **Hero demo:** an animated **terminal**: `surreal-zod migrate` → declarative diff → applied `DEFINE …` statements, with a typing animation. Install pill `npm i surreal-zod` / `bunx surreal-zod` with PM tabs. (Bun × Biome × Turso.)
- **Section order:** hero (terminal) → "Define once, migrate forever" → schema authoring (the `sz.*` API) → "Works with the whole SurrealDB define vocabulary" → ecosystem → CTA.
- **Visual:** terminal-centric, monospace-heavy, mint or purple prompt accent on near-black.

### Archetype D — "Minimal-elegant, docs-adjacent" (Zod/Hono/Resend lineage)
- **Hero angle:** quiet authority — "Type-safe SurrealDB schemas in TypeScript."
- **Hero demo:** hero-text-left + a single clean code card right (the canonical `sz.table(...)` example). One screen: hero + 4 feature cards + footer. (Hono × Zod restraint × Resend polish.)
- **Section order:** hero (text + code card) → 4 feature cards (Zod-familiar API · Generates SurrealQL · Migration CLI · Full define* coverage) → small "used by / ecosystem" → footer that doubles as docs nav.
- **Visual:** pure/near-black, one accent, generous whitespace, premium typography. Fast to ship, easy to maintain alongside the docs site.

---

## 4. Specific recommendations for surreal-zod

**Positioning (one line):** surreal-zod = your SurrealDB schema, written in the Zod you already know — with generated SurrealQL DDL and a migration CLI as the payoff. The "X for Y" anchor everyone will instantly parse: **"Zod for SurrealDB."** Use it as the eyebrow/meta even if the H1 is punchier.

**Headline angles to test (pick 1 H1, A/B a second):**
1. **"Your SurrealDB schema, in the Zod you already know."** (familiarity + outcome — top pick)
2. **"Define SurrealDB schemas with Zod. Get SurrealQL for free."** (transformation, names the payoff)
3. **"Zod for SurrealDB."** (3-word category claim; pair with a strong subhead — Resend/Prisma style)
4. **"Type-safe SurrealDB schemas, migrations included."** (covers schema + CLI in one breath)
5. **"Stop hand-writing SurrealQL. Author it in TypeScript."** (problem-first, Archetype B voice)

Suggested subhead: *"Author tables, fields, indexes, events and access rules with a drop-in `sz.*` API. surreal-zod generates the SurrealQL DDL and runs your migrations — one typed source of truth."*

**The single best "money demo" to build:** the **live schema→SurrealQL input→output pane** (Archetype A). Left editor = `sz.*` schema; right pane = the generated `DEFINE …` SurrealQL, syntax-highlit, updating in sync; a third tab/strip = `surreal-zod migrate` terminal diff. This is the one artifact that simultaneously proves (a) the API is just Zod, (b) it generates real SurrealQL, and (c) there's a migration CLI — the entire value prop in one component. Steal tRPC's dual-pane sync + Kysely's "edit-and-see-output" interactivity + a macOS window frame. If interactivity is too much for v1, ship it as a tabbed static before/after with a "typing" reveal; make it interactive later.

**Recommended section order (Archetype A):**
1. Hero: H1 + subhead + [Get Started] [GitHub ★] + install pill (`npm i surreal-zod` w/ npm/pnpm/bun tabs) + the schema→SurrealQL pane.
2. Ecosystem strip: "Built for SurrealDB" + a short "pairs with the official SDK / Surrealist" line (borrow Turso's logo-row trust without faking adopters you don't have yet).
3. Money deep-dive: "From `sz.*` to SurrealQL" — tabbed coverage of the `define*` vocabulary (TABLE, FIELD, INDEX, EVENT, ACCESS, ASSERTs/constraints), each tab schema-left / DDL-right.
4. Migration CLI: terminal showing declarative diff → `IF $direction` up/down migration applied.
5. "If you know Zod, you already know this" — a tight comparison (raw SurrealQL vs surreal-zod) + the familiarity pitch.
6. Feature grid (6-up): Drop-in Zod API · Generates SurrealQL DDL · Declarative migrations · Full define* coverage · Types + schema in one file · Open source.
7. Social proof: start with a GitHub-star callout + a "Show this to your team" voice; grow into a testimonial wall post-launch.
8. Final CTA + install snippet → rich footer doubling as docs nav (Zod-style).

**Visual direction (bridge Zod's and SurrealDB's worlds):**
- **Dark canvas** (`#0e0c14`-ish, matching SurrealDB) so we read as native to the ecosystem, with **Geist + Geist Mono** (SurrealDB's stack) for instant kinship.
- **Accent = a gradient from SurrealDB purple `#9600ff` to Zod pink `#ff85d6`** (literally blending the two parents) — use it on the primary CTA, the H1 keyword, and the arrow/morph between the schema and SurrealQL panes. SurrealDB's hot-pink `#ff00a0` is a ready-made secondary.
- **One signature hero graphic:** an animated **morph/arrow turning a `sz.*` block into a `DEFINE …` block** (our equivalent of Prisma's glowing DB / Vite's glass diamond). Subtle glow behind the code panes; no grain/noise overload.
- **Real syntax-highlit code with macOS window chrome + line numbers**, twoslash-style hover on at least one type to prove inference. Keep everything else restrained (Resend/Hono discipline) so the code is unmistakably the star.
- Optionally a light/dark toggle later, but **launch dark** — it matches both Zod and SurrealDB and flatters code.

**Build-effort note:** Archetype D (minimal, text+code-card) is the fastest path to a credible launch and is the safe fallback; Archetype A is the higher-ceiling version and the one to aim for — they share a hero structure, so you can ship D and upgrade the hero pane to A's interactivity without redesigning.

---

## Most striking visual ideas worth stealing (shortlist)
- **tRPC's dual synced editors with twoslash type hovers** → map directly to schema↔generated-SurrealQL.
- **Kysely's "edit query → see generated SQL" live playground** → "edit schema → see generated SurrealQL."
- **Tailwind's input→live-output hero + bento of real demos** → make the transformation literal; consider a bento of `define*` examples.
- **Biome's before/after/benchmark triptych** → "by hand vs surreal-zod."
- **Prisma's glowing-ring 3D object / Vite's glass diamond** → invest in ONE signature hero graphic (the sz→SurrealQL morph) for premium feel.
- **Resend's pure-black restraint** and **Hono's hero-text-left + code-card-right** → the discipline templates if we want minimal.
- **Drizzle/Kysely testimonial walls + "Show this to your boss!"** voice → trust device for post-launch.
- **Bun's cycling/typing headline noun** → could cycle our `DEFINE` targets (TABLE/FIELD/INDEX/EVENT/ACCESS) in the H1.
- **SurrealDB's purple + Geist + waveform** → our brand anchor to match-and-differentiate (purple→pink gradient).
