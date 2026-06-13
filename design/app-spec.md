# surreal-zod Studio — Product Spec / PRD

> **Status:** Draft v1 for build hand-off · **Owner:** product/architecture · **Date:** 2026-06-09
> **Audience:** the AI engineer who will scaffold and build this. Be literal — every recommendation
> below is a decision, not a menu, unless it is in §11 *Open questions*.
>
> **One-line wedge:** *Surrealist, but your schema lives in TypeScript.* A Surrealist-class GUI for
> SurrealDB where the **Zod schema (`sz.*`) is the source of truth**: the app live-generates
> SurrealQL DDL + inferred TS types, manages migrations (generate/apply/diff/rollback), connects to
> real instances, and explores/queries data — all driven from code, not from the database.

---

## Decision Log (confirmed)

> Living record of decisions ratified with the owner during the §-by-§ review. Entries here are
> **authoritative** and supersede any contradicting prose elsewhere in this doc until that prose is
> reconciled. Format: `Dn (§ref · date) — decision — rationale`.

- **D1 (§1 · 2026-06-11)** — *Thesis & wedge confirmed verbatim:* code (`sz.*`) is the source of
  truth, the database is downstream. Keep the tagline *"Surrealist starts from your database. Reverie
  starts from your code."*
- **D2 (§1 · 2026-06-11)** — *Scope = full Surrealist replacement.* Commit to the whole surface
  (authoring + DDL + types + migrations + drift/sync + explorer + query + visual designer + Phase-4
  parity), not a narrow tool.
- **D3 (§1 · 2026-06-11)** — *Form factor = web playground (Phase 1, embeddable) + desktop app
  (Phase 2+),* one codebase, two entry points.
- **D4 (§6.1 · 2026-06-11)** — *Desktop shell = **Electron** (trimmed), replacing Tauri 2.* Trim plan:
  locale pruning, `asar`, production-only deps, delta updates (target ~130MB installed, accepted).
  Rationale: Electron's **Node main process runs `packages/core`'s engine verbatim**, collapsing the
  §6.4 fork to a web-only eval shim; identical Chromium webview gives consistent Monaco rendering
  cross-OS. Electrobun (v1, Feb 2026; ~12MB; Bun-runs-`.ts` is a strong fit for executing user
  schemas) was seriously considered but rejected for system-webview rendering risk on the heavy
  Monaco editor. *This decision supersedes every "Tauri" reference downstream until reconciled.*
- **D5 (§2 · 2026-06-11)** — *Data explorer / analyst promoted to **co-primary** persona* (a full
  Surrealist replacement must win the everyday query/explorer user).
- **D6 (§2 · 2026-06-11)** — *The CI drift-gate is NOT an app persona* — it's a CLI-in-CI use case
  (`sz diff --live` in a GitHub Action); kept implicit under the team-lead persona.
- **D7 (§2/§4 · 2026-06-11)** — *New CORE pillar: **Custom Views / Dashboards**.* Reverie ships a
  library of React components users compose into tailored views/dashboards over their **typed**
  SurrealDB data (`App<>`). **Saved as code** in the repo (versioned, reviewable) — on-brand with the
  schema-as-code thesis. Requires a new §4 module + the data layer (Explorer). Phase TBD (≥ Phase 3).
  *Open:* in-app-viewer only vs exportable/embeddable into the user's own app (→ §11).
- **D8 (§2 · 2026-06-11)** — *Personas added:* internal-tools/ops **builder** (ties to D7;
  co-primary), agency/consultant, indie/solo founder, ops/support **viewer/consumer** (only material
  if dashboards become shareable/read-only). SurrealDB newcomer retained as secondary.
- **D9 (§3.1 · 2026-06-11)** — *Project folder layout confirmed; paths are **config-driven*** via
  `surreal-zod.config.ts`. `database/*` is the default for all schema-related files. Presentation-layer
  files (views / components / pages / forms / dashboards) also live **under `database/`** unless the
  config overrides — exact subfolder structure TBD when the Custom Views module (D7) is specced.
- **D10 (§3.2 · 2026-06-11)** — *GUI↔CLI parity is a **strong guideline, not a hard rule**.* Aim for
  one shared engine, but allow pragmatic GUI-only affordances (e.g. visual-designer codegen) where no
  sensible CLI equivalent exists.
- **D11 (product / §11.3 · 2026-06-11)** — *The product is **commercial***, not purely OSS. Supersedes
  the draft's "open-source the app" leaning in §11.3. Exact model (open-core vs closed, which parts,
  license) TBD at §11.
- **D12 (§4/§7 · 2026-06-11)** — *Phase-1 MVP reshaped into a VSCode-class mini-IDE:* a code editor
  supporting **TypeScript (sz.* schema) and SurrealQL (queries)** with syntax + LSP autocomplete,
  **Run / Query / Result** against the sandbox DB, and a **VSCode-like integrated terminal**. This
  pulls basic query/result (draft §4.6) and the terminal (§5) into Phase 1. The **Generated SurrealQL
  view (§4.2)** and **Inferred Types view (§4.3)** are demoted to **Phase-1 fast-follows** — not
  MVP-blocking (the live TS-service type compute is the riskiest piece; keep it off the critical path).
- **D13 (§4.1 · 2026-06-11)** — *Editor autocomplete/typecheck is **LSP-driven*** from the loaded
  `.d.ts` (`surreal-zod`/`zod`/`surrealdb`); the spec maintains **no** hardcoded `sz.*` vocabulary
  list (verification showed the draft's enumerated list was ~30 builders out of date — removing it
  avoids the maintenance liability; `packages/core/src/pure.ts` is the real source of truth).
- **D14 (§4.6/§7 · 2026-06-11)** — *Explorer split:* basic **SurrealQL query editor + Result view =
  Phase 1 (MVP)**; the **full Explorer** (record grid, link/graph traversal, inline CRUD) and the
  **rich query runner** (saved/history/variables, graph/geo/vector result modes) stay **Phase 3**.
- **D15 (§4.5 · 2026-06-11)** — *Local SurrealDB is an **integrated version manager**, not a bundled
  binary.* Detect binaries on PATH; download/store/switch internally-managed versions (nvm-style). On
  **Windows, detect and interop with a WSL-hosted SurrealDB** — connect into WSL rather than running
  in "Windows land." Supersedes every "bundle a per-OS binary" reference (§4.5, §6.1, §6.5, §11.4).
- **D16 (§4.4 · 2026-06-11)** — *Migrations confirmed as Phase 2:* single-file-per-change with
  `IF $direction` up/down, lock/unlock affordance — all on the existing `sz` CLI engine.
- **D17 (§4.8 · 2026-06-11)** — *Schema Designer is **true bidirectional***, committed. Feasible
  because **SurrealQL→TS codegen already exists** (the pull/introspect path). Editing model: the
  canvas mutates a **buffer**; changes apply only on **save**, routed through the **same
  diff-buffer-vs-snapshot engine** as migrations — so write-back is a diff/apply, not a blind
  overwrite.
- **D18 (§4.10/§11 · 2026-06-11)** — *The AI assistant is a **commercial / paid-tier** feature*
  (ties to D11). Strongest monetization candidate among the parity modules.
- **D19 (§4.9–4.11 · 2026-06-11)** — *Confirmed as written:* Diff/Sync (Phase 3), the Phase-4 parity
  list, and the lib backlog priorities (record references, full-text search, vector indexes first).
- **D20 (§5 · 2026-06-11)** — *The app shell gets a **fresh design**, not just confirmation.* `xr3UV`
  is **inspiration only**; the real studio has outgrown the playground 2-pane into an IDE-class shell.
  All app/studio designs live at Pencil canvas coords **Y < 0** (the website keeps Y > 0). Output-pane
  tabs order by phase (**Result** first; SurrealQL/Types fast-follow; Migration P2). Left-rail module
  order, Dashboards placement, and final region layout are **deferred until the new sample shell is
  designed**.
- **D21 (§5/§6 · 2026-06-11)** — *The shell is a **VSCode-class workbench** with **resizable +
  sortable/dockable panes***, not a fixed layout. The #1 near-term priority is the working shell
  (movable/resizable panels, draggable tabs, dock zones). §6 must pick a **docking/panel library**
  (e.g. dockview / rc-dock / FlexLayout / react-resizable-panels) rather than hand-rolling it.
- **D22 (§5/§7 · 2026-06-11)** — *v1 shell panels = **query editor** + **result***. The first
  buildable target is the workbench chrome (rail + status bar + dock host) hosting exactly two
  dockable/resizable panels: a SurrealQL/TS query editor and a result view. Everything else (extra
  modules, output tabs) docks into the same workbench later.
- **D23 (§5 · 2026-06-11)** — *Design suite + rail order settled.* 8 frames designed in
  `design/website.pen` at Y < 0: App Shell (`sr1wy`, the v1 Query+Result workbench) + module screens
  Schema (`O1mx96`), Migrations (`rEATl`), Explorer (`IzDmU`), Designer (`jYwIy`), Dashboards
  (`M2HcDE`), Diff/Sync (`W5Wrq`), Connections (`q7kpU` — v3; OS titlebar/menus, All/Local/Shared
  filter, org-shared w/ environment tags, auth-level-driven form incl. Record). **Left-rail order:** Schema · Query ·
  Explorer · Migrations · Designer · Dashboards · Diff/Sync · Connections, with Search + Settings
  pinned bottom. These frames are the shell-of-record for §5 (inspiration: `xr3UV`).
- **D24 (§4.5/§6.5 · 2026-06-12)** — *Connections are **main-process-owned** behind a typed IPC bridge.*
  ALL kinds (sandbox/remote/local/cloud) are uniform main-process SDK instances; the renderer drives
  via `window.studio.connections.*` IPC. Desktop sandbox = embedded engine in main; the **web** build
  falls back to `@surrealdb/wasm` in the renderer behind the same connection interface. Secrets and
  local-server spawning stay main-only.
- **D25 (§3.1/§4.5 · 2026-06-12, REVISED)** — *Connections are app-managed in two scopes: **Local** &
  **Shared**.* **Local** = this device (app store non-secret + keychain secret, private). **Shared** =
  provided by an **organization** the project is bound to (D26). Connections are **NOT** stored in
  `surreal-zod.config.ts` — config + env vars are **CLI-only** (override / CI). *Supersedes the earlier
  "config = pinned project connection" model.*
- **D26 (product/§11 · 2026-06-12, REVISED)** — *Commercial cloud = **organizations**.* A project
  **binds to an org**; the org provides **Shared** connections to members, optionally organized **per
  environment** (dev/staging/prod) or however the org prefers. Shared connections are visually distinct
  from Local. Ties to D11. *(Supersedes the "team connection sharing" framing — same idea, org-scoped.)*
- **D27 (§4.5/§11.7 · 2026-06-12)** — *Credentials via Electron **`safeStorage`*** (OS-keychain-backed
  encryption, no native dep); encrypted blob in the app store keyed by connection id. Never in config.
- **D28 (§4.5 · 2026-06-12)** — *First connections build slice:* registry + main-process manager +
  IPC + Connections list/form UI + **Remote (ws) connect/test/doctor** + real top-bar switcher. Local
  version-manager (D15) and Cloud/teams come later. **Design review of connection screens precedes
  the build.**
- **D29 (§4.5 · 2026-06-12)** — *Connection form has **no "kind" field*** — the endpoint scheme implies
  transport (`ws/wss/http/https` remote, `mem://` sandbox, local). **Auth level** drives the conditional
  fields: **Anonymous** (none) · **Root** (user/pass) · **Namespace** (+ns) · **Database** (+ns/db) ·
  **Record** (ns/db + access method + user/pass) · **Token** (raw JWT). Categories in the UI: **Local**
  / **Shared** (org), with optional **environment** tags on shared connections.
- **D30 (§4.5/§5 · 2026-06-12)** — *Connections (and dashboards/queries) are **project-based**, per
  environment; the studio is **project-scoped** (one open project at a time).* A **workspace switcher**
  (top-bar, left, after brand) switches the active project; projects group by **Local** (device) and by
  **org name**. Within a project, connections split into **local** (device-only) and **org-shared** —
  the shared group is labeled with the **org name** (the UI **never shows the word "Shared" verbatim**).
  **Logged-out** users see local projects/connections only. The **org** = people · roles · billing ·
  access that **hosts & shares projects** (D26); org-level features: members/roles, billing, audit log,
  SSO/SAML, project access, usage. Content (connections/dashboards/queries) stays project-scoped,
  shared by binding the project to an org.
- **D31 (auth/§4.5/§5 · 2026-06-12)** — *Login is **optional** (local-first, no signup wall); **"Personal"
  replaces "Local"** as the concept.* Signed-out = a local **personal workspace**; signing in **syncs it
  into a Personal org** (local projects auto-adopt) and unlocks **team orgs**. For authenticated users the
  model is uniform: **Personal org vs Team orgs** (no separate local/shared special-casing). Sign-in is
  prominently *encouraged*, not forced — preserves offline + privacy while keeping the commercial funnel
  (D11). *Supersedes the "Local vs Shared" naming in D30: "Personal" is the device/you scope; team scopes
  show the **org name**.*
- **D32 (§5 · 2026-06-12)** — *Shell-of-record = **"App Shell — A (Refined IDE)"** (`OaUSf`)*, the
  componentized refinement by the `designer` agent — **supersedes `sr1wy`** (D23). **Division of labor:**
  `designer` owns the **shell + visual system + `c/*` components**; `developer` (this instance) owns the
  **Electron build (`packages/studio`) + connections/org subsystem + module screens**. Both sync through
  this Decision Log. The Electron scaffold (currently sr1wy-derived) will be **realigned to A** once
  designer locks A's chrome; module/org frames reparent to A's chrome over time.
- **D33 (§5 · 2026-06-12)** — *Canonical UI source switched to **`design/app.pen`*** (the `design-expert`
  agent's from-scratch design), **superseding A/`OaUSf` (D32)**. Per Manuel: **latest design wins**; the
  two design agents reconcile among themselves; ask Manuel if in doubt. The running app implements
  app.pen: **two-tier titlebar — Variation C default** (tier1 logo+Reverie+menus+window controls;
  tier2 project switcher + connection switcher + drift chip + account) **+ Variation B behind a flag**
  (switcher-centric). Frameless Electron own-titlebar + window controls; web build = no OS controls.
  A's chrome realignment (just done) is superseded — chrome rebuilds to app.pen.
- **D34 (§6 · 2026-06-12)** — *Adopt an **adapter / runtime-profile architecture*** (VSCode/Theia-style)
  for portability + future extensions. Capability interfaces: **`QueryEngine`** (run SurrealQL),
  **`FileSystem`**, **`Terminal`**, **`SecretStore`** — swappable impls chosen by a **runtime profile**:
  *playground* (web) = VirtualFS + **WasmQueryEngine** + NullTerminal + MemorySecrets; *desktop*
  (Electron) = LocalFS + (Wasm|Embedded|Remote) + LocalPty + KeychainSecrets. Interfaces are **async**
  so an impl can be in-process (wasm) or IPC-backed (main) transparently. Extensions register adapters
  via contribution points later. **Build only adapters in use; others stay interface stubs.** First
  adapter shipped: **`WasmQueryEngine`** (`@surrealdb/wasm`, renderer, seeded `mem://`) powering the
  **Run loop** (Run + Cmd/Ctrl+Enter → real results) — with simple placeholder UI until design-expert
  specs the Query module toolbar.
- **D35 (§6 · 2026-06-12)** — *State management = **Zustand + `mutative` middleware** (zustand-mutative)*
  for ergonomic immutable-by-mutation updates. All app state (settings, editor, results, …) flows
  through this store.
- **D36 (§6 · 2026-06-12)** — *VSCode-like **settings system***. A **contribution registry** of setting
  definitions (`key`, `type`, `default`, `scope`, `enum?`, `description`); **scopes** = user (this
  install) + project (committed to repo) with project overriding user; reactive via the mutative store
  (D35); a searchable settings UI later. First settings: **`titlebar.variant`** (replaces the
  localStorage hack) and **`statusbar.segments`** (D38). "Select what shows" = toggling segments.
- **D37 (§6 · 2026-06-12, REVISED)** — *Agent control of the app — **both directions**, both routed
  through the **command/state registry** (the spine).* (a) **External assistants** (Claude Code, Cursor,
  …) → the studio is an **MCP server** (official `@modelcontextprotocol/sdk`, HTTP/SSE local transport,
  main) exposing commands as tools + state/settings as resources. (b) **Integrated "Sidekick" assistant**
  (§4.10, paid — D18) → built with **TanStack AI** (provider-agnostic chat + `@tanstack/ai-mcp` host-side
  client); drives the app via the registry **in-process** and can also consume external MCP servers as
  tools. Build the **command + settings + state registries first** (MCP-shaped); the MCP server and the
  Sidekick both layer on top. (Ties to D34/D36 contribution model.)
- **D38 (§5 · 2026-06-12)** — *Status bar = **dynamic, settings-driven segments** (D36).* Composition
  (Manuel): **LEFT** = ns+db (moved here), git branch, errors/warnings; **RIGHT** = language mode,
  cursor position, indentation. **Removed:** connection (redundant — it's in the titlebar), engine/CLI
  status (no value now; may resurface). The bar is approved; `design-expert` designs each segment and
  its **multi-status** states (showcased on titlebar Variation B).

---

## 0. Grounding: what already exists

This spec is anchored in three concrete, already-built things in this repo. Do not re-derive them.

1. **`surreal-zod` (the library + CLI)** — `packages/core`. Author SurrealDB schemas in Zod with
   `sz.*` (a drop-in for `z.*`), generate SurrealQL DDL, and run a declarative migration CLI
   (`sz` / `surreal-zod`). This app is a **GUI over this exact engine** — see §3 and §6. Its real
   capabilities and limits are catalogued in `packages/core/docs/PARITY.md` and
   `packages/core/docs/SURREALDB-FEATURE-MAP.md`; honour them (§4.11 roadmap).
2. **The playground design** — Pencil frame **`xr3UV`** ("Playground") in `design/website.pen`. This
   is the seed UX for the whole app shell (top bar + editor/output panes + terminal + status bar).
   The app **is** this frame, grown up. Brand tokens live in the same file (§9).
3. **The marketing site** — landing research in `design/landing-research.md`, concepts in
   `design/concepts/`. The landing page embeds a **preview** of the Phase-1 playground; the product
   defined here is the **full standalone app**. Same components, same brand, larger scope.

---

## 1. Vision & positioning

### 1.1 What it is
A desktop + web **schema-as-code studio for SurrealDB**. You write your data model once, in
TypeScript, using `sz.*`. The studio continuously:
- **generates** the SurrealQL DDL (`DEFINE TABLE/FIELD/INDEX/EVENT/FUNCTION/ACCESS …`),
- **infers** the static TS types (`App<>` app-side, `Wire<>` DB-wire-side),
- **plans & manages migrations** (generate → apply → diff → history → rollback),
- **connects** to SurrealDB instances (in-browser WASM sandbox, local, remote, Cloud),
- **explores & queries** data, and
- detects **drift** between your code and a live database, with two-way **sync** and **pull**.

### 1.2 Why (the wedge)
**Surrealist** — SurrealDB's excellent official GUI — is **database-first**: you connect to a DB,
then query/explore/design *against the live instance*. Its Designer writes DDL straight into the
running database; there is no schema-as-code, no migration history, no generated TS types, no drift
detection. That's great for exploration and ops, and weak for teams who treat their schema as
versioned source.

surreal-zod Studio inverts it: **code is the source of truth, the database is downstream.** That
unlocks the things an application team actually wants — typed models that match the DB exactly,
reviewable migrations in git, reproducible environments, and CI that can fail on drift. The
positioning sentence is literally: *"Surrealist, but your schema lives in TypeScript."*

### 1.3 How it differs from the alternatives

| | **surreal-zod Studio** | **Surrealist** (official) | **Drizzle Studio** | **Prisma Studio** |
|---|---|---|---|---|
| DB | SurrealDB | SurrealDB | SQL (PG/MySQL/SQLite/…) | PG/MySQL/SQLite/Mongo |
| Source of truth | **TS schema (`sz.*`)** | the live database | TS schema (drizzle) | `schema.prisma` |
| Schema authoring **in the tool** | ✅ first-class TS editor | ✅ visual designer → live DB | ❌ (edit in your IDE) | ❌ (edit in your IDE) |
| Generated DDL view | ✅ live | n/a (writes to DB) | ✅ (drizzle-kit, CLI) | ✅ (CLI) |
| Inferred TS types view | ✅ live | ❌ | (it *is* TS) | ❌ |
| Migrations (gen/apply/diff/rollback/history) | ✅ in-app | ❌ | partial (CLI) | partial (CLI) |
| Live-DB **drift diff** + sync/pull | ✅ | ❌ | ❌ | (db pull only) |
| Data explorer + query runner | ✅ | ✅ (best-in-class) | ✅ (data browser) | ✅ (data browser) |
| Visual designer ↔ code round-trip | ✅ (Phase 3) | ✅ visual only (no code) | ❌ | ❌ |
| Multi-model (graph / vector / geo) | ✅ (SurrealDB-native) | ✅ | ❌ | ❌ |

**Net:** Drizzle/Prisma Studios are *data browsers* bolted onto code-first ORMs — schema editing
happens in your IDE, and Studio never sees your types. Surrealist is a *database* GUI with a visual
designer that bypasses code entirely. surreal-zod Studio is the only tool that unifies **typed
schema authoring + generated DDL + migrations + drift + explorer/query + visual designer** around a
single code source of truth, SurrealDB-native.

---

## 2. Target users & jobs-to-be-done

**Primary persona — "the TypeScript app engineer on SurrealDB."** Already uses Zod; wants their DB
schema to be typed, versioned, and reviewable; finds hand-writing `DEFINE` statements and tracking
migrations by hand tedious. *The schema author — the lead persona everything optimizes for first.*

**Co-primary — "the data explorer / analyst."** Lives in the Query + Explorer views day to day. A
full Surrealist replacement has to win this person, not just the schema author (D5).

**Co-primary — "the internal-tools / ops builder."** Composes **custom views / dashboards** over the
typed data from Reverie's React components — a support-lookup screen, an ops dashboard, an admin
panel — saved as code in the repo (D7). Wants a tailored data UI over SurrealDB without standing up a
separate app.

**Secondary personas:**
- **Team lead** — wants schema changes to land as reviewed PRs with deterministic migrations; also
  the one who wires `sz diff --live` into **CI** so builds fail on drift (a CLI use case, not an
  in-app feature — D6).
- **Agency / consultant** — spins up many SurrealDB projects; values reproducible scaffolding +
  migrations carried across clients.
- **Indie / solo founder** — wants *one* tool for schema + data + dashboards (overlaps the
  internal-tools builder).
- **Ops / support viewer (consumer)** — non-engineer who only *consumes* a dashboard someone else
  built (material only if dashboards become shareable/read-only — D7 open question).
- **SurrealDB newcomer** — learns the mapping by watching `sz.*` → SurrealQL in real time.

**Jobs-to-be-done**
1. *When I model my domain, I want to write it once in TS and get matching DDL + types,* so the DB
   and app never drift.
2. *When I change the schema, I want a reviewable migration generated for me,* so I can ship safely.
3. *When I point at a real database, I want to see exactly how it differs from my code,* so I can
   sync or write a migration with confidence (and fail CI on drift via the CLI).
4. *When I inherit an existing SurrealDB, I want to pull it into typed `sz.*` files,* so I can adopt
   the workflow without rewriting by hand.
5. *When I'm exploring, I want a great query + data + graph explorer* without leaving the tool.
6. *When I onboard, I want a zero-install web sandbox* to learn the `sz.*` → SurrealQL mapping.
7. *When my team needs a tailored data view (support lookup, ops dashboard), I want to compose one
   from typed components and commit it,* so non-engineers get a safe, purpose-built UI over the data.

---

## 3. Core concepts

### 3.1 Schema-as-code is the source of truth
A surreal-zod project is a folder:
```
surreal-zod.config.ts          # connection + paths (defineConfig)
database/
  schemas/*.ts                 # your sz.* models — the SOURCE OF TRUTH
  migrations/
    NNNN_name.surql            # generated, reviewable SurrealQL migrations (IF $direction up/down)
    meta/_snapshot.json        # the declarative state the diff engine compares against
  seed.ts                      # optional seed script
  views|components|pages|…/    # (commercial) custom views/dashboards-as-code (D7); layout TBD
.env                           # SURREAL_URL / NAMESPACE / DATABASE / USER / PASS
```
All paths are **config-driven** via `surreal-zod.config.ts`; `database/*` is the default. Schema files
live in `database/schema`; presentation-layer files (views / components / pages / forms / dashboards,
D7) also live under `database/` unless the config overrides — exact subfolder structure TBD (D9).

The studio edits these **real files** (desktop) or **in-memory buffers** (web playground). The GUI
and the `sz` CLI are intended as interchangeable views over the same engine — a **strong guideline,
not a hard rule** (D10): aim for parity, but allow GUI-only affordances (e.g. visual-designer
codegen) where no sensible CLI equivalent exists. (Config shape: `packages/core/src/config.ts`;
scaffold: `src/cli/init.ts`.)

### 3.2 The generate → migrate → sync loop
This is the spine of the product. It maps 1:1 to existing CLI commands (§4.4):
```
edit sz.* schema
   │  (live)            ┌──────────────► Generated SurrealQL DDL view
   ├────────────────────┤
   │                    └──────────────► Inferred TS types view (App<> / Wire<>)
   ▼
sz diff            → preview pending changes vs the snapshot (or --live vs a real DB)
sz generate <name> → write NNNN_name.surql + update meta/_snapshot.json
sz migrate         → apply pending migrations to the connected DB
sz status          → applied vs pending
sz rollback        → run the down (IF $direction = "down") statements
─── alternatively, no migration files ───
sz sync            → push code state straight to the DB (declarative; --dry-run, --no-prune)
sz pull            → introspect a live DB → (re)generate sz.* schema files
```
Two channels matter for the **Types** view: surreal-zod rides Zod's two native sides — the **decoded
side** (`z.output`, `App<>`) is your app type, the **encoded side** (`z.input`, `Wire<>`) is the DB
wire shape; `z.decode` reads from the DB, `z.encode` writes to it. The studio surfaces both.

### 3.3 Relationship to the marketing-site playground
The landing page (`design/website.pen`) embeds a **preview** of the Phase-1 playground: a curated,
example-loaded, sandbox-only instance for "try it in the browser." **This app is the full version of
that same surface** — identical shell and components, plus real connections, real files, migrations,
explorer, and designer. Build the playground as a **reusable embeddable** (§6.7) so the landing and
the app share one codebase.

---

## 4. Modules / feature set

Each module below lists **purpose** and **key interactions**, and is tagged with the **phase** it
lands in (§7). Module nav lives in the left icon rail (§5). The first four modules are MVP.

### 4.1 Code Editor (TypeScript + SurrealQL) — *Phase 1 (MVP)*
**Purpose:** a VSCode-class editor that authors the `sz.*` data model in **TypeScript** *and* lets you
write/run **SurrealQL** queries; this is the home screen and the source of truth (D12).
**Key interactions:**
- Monaco hosting **both languages** — **TypeScript** (the `sz.*` schema) and a **SurrealQL** grammar —
  each with syntax highlighting and autocomplete.
- Autocomplete/typecheck is **LSP-driven** (D13): the `surreal-zod` + `zod` + `surrealdb` `.d.ts` are
  loaded into the TS worker, so `sz.`, `defineTable`, `.from()/.to()`, the `$`-clauses, `App<>/Wire<>`,
  etc. surface from the language service itself. The spec maintains **no** hardcoded vocabulary list —
  `packages/core/src/pure.ts` is the source of truth for what exists.
- File tabs (web: virtual files; desktop: real `database/schema/*.ts` + query files), add/search.
- Live "schema valid / N problems" status (status bar + Problems tab) from the in-worker TS service.
  Non-Surreal types used as a table field (the `z.*`-parity builders that carry no SurrealQL mapping)
  surface here as diagnostics, unless taught to serialize via `.$surreal(type, codec)`.
- Example selector ("User schema", "Blog", "Graph", "Vector/RAG", …) to load curated models
  (the `xr3UV` `ExampleSelector`).

### 4.2 Generated SurrealQL view — *Phase 1 (fast-follow)*
**Purpose:** show the DDL the studio produces from the current schema, live.
**Key interactions:** read-only, syntax-highlighted SurrealQL pane (the `xr3UV` `OutputPane` →
`SurrealQL` tab); regenerates on edit (debounced; show "generated in N ms"); copy / expand;
banner notes the target ("SurrealDB 3.x"). Powered by the lib's `emitStatements/emitTable/emitField`
(`packages/core/src/ddl.ts`). Per-table toggle to filter the output to the table under the cursor.

### 4.3 Inferred Types view — *Phase 1 (fast-follow)*
**Purpose:** show the static TypeScript the schema yields, so users see the typed payoff.
**Key interactions:** the `Types` output tab renders `App<typeof X>` and `Wire<typeof X>` for each
table/derived shape, computed by the in-worker TS service against the real `surreal-zod` `.d.ts`.
Toggle App ↔ Wire to teach the decode/encode split (§3.2).

### 4.4 Migrations (generate / apply / diff / history / rollback) — *Phase 2*
**Purpose:** turn schema edits into reviewable, ordered, reversible migrations and apply them.
**Key interactions** (each maps to a CLI command — `src/cli/{diff,migrate,meta}.ts`):
- **Diff:** preview pending changes vs the snapshot (`sz diff`) or vs a live DB (`sz diff --live`),
  with up/down (`--down`), full SQL (`--full`), `--watch`, JSON; rendered as a unified diff viewer.
- **Generate:** name + write `NNNN_name.surql` and bump `meta/_snapshot.json` (`sz generate [name]`),
  with a confirm/preview step.
- **Apply:** `sz migrate [count] [--to <tag>]`, streaming progress into the terminal pane.
- **History / status:** `sz status [--json]` — a timeline of applied vs pending, checksums,
  applied-at; backed by the `_migrations` table (`migrationsTable` config).
- **Rollback:** `sz rollback [count] [--to <tag>]` runs the `IF $direction = "down"` block.
- **New / unlock:** `sz new <name>` (blank hand-written migration), `sz unlock` (clear stale lock).
- Migrations use a single file per change carrying both directions via `IF $direction` (the project
  convention in user memory). Show a clear "lock held / unlock" affordance.

### 4.5 Connections (sandbox + local + remote + Cloud) — *Phase 1 sandbox, Phase 2 real*
**Purpose:** choose what the studio talks to. Mirrors Surrealist's connection switcher.
**Key interactions:**
- **Connection switcher** in the top bar (the `xr3UV` `ExampleSelector` slot becomes a connection
  dropdown in the app; keep the status pill "… · connected").
- Connection kinds:
  - **WASM Sandbox** (Phase 1, web + desktop): an in-browser, ephemeral SurrealDB via
    `@surrealdb/embedded`/WASM — no server, no persistence. This is what powers "Run".
  - **Remote** (Phase 2): `ws://`/`http://` endpoint + namespace/database + auth (`authLevel`
    root/namespace/database), via the `surrealdb` JS SDK. Maps to `db` in `surreal-zod.config.ts`.
  - **Local sidecar + version manager** (Phase 2, desktop only): an integrated SurrealDB **version
    manager** (D15) rather than a bundled binary — detect binaries on PATH, download/store/switch
    internally-managed versions (nvm-style), and spawn the chosen one as an Electron child for a
    one-click local dev DB. On **Windows, detect and connect into a WSL-hosted SurrealDB** instead of
    installing Windows-side. (Surrealist requires a *user-installed* binary on PATH; we manage
    versions for you and handle the WSL case.)
  - **Cloud** (Phase 4): SurrealDB Cloud instances/orgs (parity with Surrealist's Cloud panel).
- Credentials are stored in the OS keychain (Electron `safeStorage` / keytar) — never in plaintext config.

### 4.6 Data Explorer + Query runner — *basic query+result: Phase 1 (MVP); full Explorer: Phase 3 (D14)*
**Purpose:** browse and edit data; run SurrealQL/GraphQL; visualize graph + vector results.
**Phase split (D14):**
- **Phase 1 (MVP):** a **basic SurrealQL query editor + Result view** — run a query against the
  active connection (sandbox in P1), single result rendered as table/JSON, per-query timing
  ("Ran · 142 ms"). This is the "run queries and get results" half of the MVP.
- **Phase 3:** everything below (full Explorer + rich query runner).
**Key interactions (Surrealist parity, our north star here):**
- **Explorer:** table list (from the schema/INFO), record grid, inspector, **follow record links and
  graph edges** (`->edge->`), filters, pagination, inline create/edit/delete.
- **Query runner:** multi-tab editor, **saved queries + history** (the `xr3UV` left pane pattern),
  inferred variables panel, format, run, multi-statement results with table/JSON/graph/combined
  result modes; per-query timing ("Ran · 142 ms").
- Result views: table, JSON, **graph** (relations), **geo** (map), **vector** (similarity) — lean on
  SurrealDB's multi-model strengths to differentiate from SQL studios.

### 4.7 Custom Views / Dashboards — *core pillar; Phase TBD (≥ Phase 3) (D7)*
**Purpose:** let users compose tailored views and dashboards over their **typed** SurrealDB data from
Reverie's React component library — a support-lookup screen, an ops dashboard, an admin panel —
**saved as code** in the repo (D7, D9). The headline differentiator none of Surrealist/Drizzle/Prisma
offer; leans hard on the `App<>` typed-data story and the schema-as-code thesis.
**Key interactions:**
- A **component library** Reverie ships (tables/grids, record cards, forms, stat tiles, charts,
  graph/geo/vector viz) bound to the schema types — a dropped-in component is typed against
  `App<typeof X>`.
- **Compose** views/dashboards (visual arrange and/or code-first) that read — and optionally write,
  via `z.encode` — live data; **read-only** views for safe ops/support consumption (the viewer
  persona, D8).
- **Saved as code** under `database/` (views/components/pages/forms/…, exact layout TBD — D9),
  versioned and reviewable like the schema; the studio round-trips between the canvas and `.tsx`
  source (parity guideline, D10).
- Bind data via typed queries / record links; filters, params, pagination.
**Open (→ §11):** in-app-viewer only vs **exportable / embeddable** into the user's own production app
(a shipped component library) — a major fork with commercial implications (D7, D11).

### 4.8 Schema Designer (visual ↔ code) — *Phase 3*
**Purpose:** an ER-style visual canvas that is a **bidirectional projection of the `sz.*` code** —
the headline differentiator from Surrealist's code-blind designer.
**Key interactions:**
- Render tables/fields/indexes/relations as nodes/edges from the schema AST (the `TableDef`/
  `RelationDef` model in `pure.ts`).
- Edits on the canvas (add field, add index, draw a relation) **write back to the `.ts` file** as
  `sz.*` source (codegen — the SurrealQL→TS path already exists via pull/introspect, D17), keeping
  code authoritative. Code edits re-render the canvas.
- **True bidirectional via buffer + save (D17):** canvas edits mutate an in-memory **buffer**; nothing
  applies until **save**, which routes through the **same diff-buffer-vs-snapshot engine** as
  migrations — write-back is a reviewable diff/apply, not a blind file overwrite.
- Inspector panels for field clauses, permissions, events, access — generating valid `sz.*`.

### 4.9 Diff / Sync vs a live DB — *Phase 3*
**Purpose:** reconcile code with a running database in either direction.
**Key interactions:**
- **Drift panel:** `sz diff --live` rendered as a side-by-side (code → live) diff with per-object
  add/alter/remove badges; a CI-style "no drift / N changes" headline (the `xr3UV` terminal already
  shows `sz diff --live` → "no drift — live schema matches your code").
- **Sync:** `sz sync [--dry-run] [--no-prune]` to push code state straight to the DB (declarative,
  no migration file); always offer dry-run first, with an explicit "prune removed objects" toggle.
- **Pull:** `sz pull [--force]` introspects a live DB (`INFO FOR … STRUCTURE`) and (re)generates
  `sz.*` schema files — the on-ramp for existing databases. Show a preview/merge before writing.

### 4.10 Surrealist-parity modules — *Phase 4*
Marked by phase so MVP stays lean. Each is the GUI for an existing or near-term `define*`:
- **Authentication / Access** — GUI for `defineAccess().record()/.jwt()/.bearer()` (signup/signin/
  authenticate blocks, JWT alg/key/url, bearer for user/record, DURATION). Surrealist calls this
  "Authentication."
- **Functions** — GUI for `defineFunction(name,args).returns().body()`; edit, typecheck, run.
- **Parameters** — `DEFINE PARAM` (a current lib gap; ship the builder with the module).
- **Events** — surfaced inside the Designer/table inspector (`defineEvent`/`.event()`).
- **GraphQL** — query editor against the DB's GraphQL endpoint (Surrealist parity).
- **Models (SurrealML)** — upload/list `.surml` models (Surrealist parity).
- **API docs** — auto-generated reference from the schema (Surrealist parity).
- **AI assistant ("Sidekick"-class)** — a schema/query copilot (generate `sz.*` from prose, explain
  DDL, suggest migrations). Differentiated by being **schema-as-code aware**. *Commercial / paid-tier
  feature (D18).*

### 4.11 Library parity backlog the GUI will want
The GUI will expose builders that the lib does not yet support; track these as joint lib+app work
(source: `docs/PARITY.md`, `docs/SURREALDB-FEATURE-MAP.md`). High value first:
**record `REFERENCE … ON DELETE`**, **full-text search + `DEFINE ANALYZER`**, **vector indexes
(HNSW/MTREE/DISKANN)** for the RAG/AI story, **`RELATION … ENFORCED`**, **object-literal unions**,
**`DEFINE PARAM` / `DEFINE SEQUENCE`**, **`ASYNC` events**, **`WITH JWT` record access**. The
Designer and Explorer (vector/geo result views) are the features that create demand for these.

---

## 5. Screens & UX (the app shell)

Ground everything in Pencil frame **`xr3UV`** ("Playground") in `design/website.pen`. Its anatomy
(read directly from the frame) **is** the app shell:

- **Top bar (`TopBar`, h≈58):** left cluster = brand mark + `surreal-zod` wordmark + a tag badge
  (`pg` in the playground → app/version in the app) + the **connection/example switcher**
  (`file-code` icon, label, chevron). Right cluster = **status pill** (green dot + "SurrealDB
  sandbox · connected"), **Format**, **Reset**, **Share**, a separator, a **"Ran · 142 ms"** status,
  and the gradient **Run** button (purple→pink, `⌘↵` kbd). In the app, Run executes against the
  active connection; Format/Reset/Share act on the active editor.
- **Left icon rail (new in the app; Surrealist-style):** vertical module nav — Schema, SurrealQL,
  Types, Migrations, Explorer, Query, Designer, Diff/Sync, then Auth/Functions/Params (Phase 4),
  with Search (`⌘K`), Help, Settings pinned at the bottom. (Surrealist's confirmed rail: Query,
  Explorer, Designer, Authentication, Parameters, Functions.)
- **Primary work area (`Panes`, split):** a left **editor pane** (`EditorPane`: tab bar + code) and
  a right **output pane** (`OutputPane`) with tabs **SurrealQL · Types · Migration · Result** plus a
  generation banner and copy/maximize actions. In the Query/Explorer modules the right pane becomes
  results; in the Designer it becomes the canvas.
- **Integrated terminal (`Terminal`, resizable):** tabs **Terminal · Output · Problems**, a shell
  pill, and live `sz` command output (the frame shows `sz generate add_users`, `sz migrate`,
  `sz diff --live`). Desktop runs the **real CLI**; web simulates it against the WASM sandbox.
- **Status bar (`StatusBar`, h≈30):** left = "schema valid", "SurrealDB 3.x sandbox", "generated in
  N ms", git branch; right = `Ln/Col`, indent, encoding, language, notifications. Keep verbatim.

**Primary screens to build (in order):**
1. **Playground / Schema home** (Phase 1) — the `xr3UV` frame exactly: edit `sz.*` left, SurrealQL/
   Types/Migration/Result right, terminal + status bar.
2. **Connections** (Phase 2) — connection list + create/edit drawer (kind, url, ns/db, auth level,
   keychain creds), test/doctor button (`sz doctor`).
3. **Migrations** (Phase 2) — timeline (applied/pending), diff viewer, generate/apply/rollback bar.
4. **Explorer + Query** (Phase 3) — Surrealist-parity three-pane (list · grid/editor · inspector).
5. **Designer** (Phase 3) — ER canvas with inspector, bidirectional with code.
6. **Diff/Sync** (Phase 3) — drift view + sync dry-run + pull preview.

---

## 6. Architecture & tech stack (concrete recommendations)

### 6.1 App framework & shell
**React 18 + Vite + TypeScript**, packaged for desktop with **Electron** (Node main process — see
**D4**). One codebase, two targets: a **web build** (Phase 1 playground / embed) and a **desktop
build** (Phase 2+). Electron's main process is **Node**, so it runs `packages/core`'s engine
(`loadDefs`, jiti, the `surrealdb` JS SDK, the `sz` CLI functions) **verbatim** — no Node/browser
fork on desktop; gives filesystem access to the user's real `surreal-zod` project, OS keychain for
credentials (`safeStorage` / keytar), and the ability to **manage & spawn SurrealDB versions** (D15;
detect-on-PATH + internal version manager + WSL interop on Windows). Trade
vs Tauri/Electrobun: larger bundle (~130MB), mitigated by locale pruning + `asar` + production-only
deps + delta updates. We accept the size for a Node-native engine fit and consistent Chromium
rendering of the Monaco editor across OSes. (Surrealist is Tauri + React; we diverge because our core
feature — executing the user's TypeScript — is Node-shaped, which Tauri's Rust backend can't host
natively.)

### 6.2 Editor — **Monaco** (recommended)
Use **Monaco** for the TS schema editor. Rationale: we need **real TypeScript IntelliSense and
in-browser typechecking** to (a) autocomplete `sz.*`/`define*` and (b) compute the **Inferred Types**
view. Monaco hosts the TS language service in a web worker; load `surreal-zod`, `zod`, and
`surrealdb` `.d.ts` into the worker's virtual FS (`@typescript/vfs`). For the read-only **SurrealQL**
output and migration panes, register a SurrealQL **Monarch** grammar in Monaco (keeps one editor
engine). *Note:* Surrealist uses CodeMirror 6 + a SurrealQL language package; that's fine for a
query tool, but our TS-authoring core is where Monaco's TS worker pays off — so we diverge here.

### 6.3 Running the user's schema (TS → `TableDef`s)
The studio must **execute** the user's `sz.*` modules to get the in-memory defs the emitters consume.
- **Web:** transpile each buffer with **esbuild-wasm** (or `sucrase`), then evaluate in a sandboxed
  **Web Worker** with bundled `zod` + `surreal-zod` browser builds; collect the exported
  `TableDef`/`RelationDef`/`EventDef`/`FunctionDef`/`AccessDef` instances.
- **Desktop:** load the real files via **jiti** (already a `surreal-zod` dep) for full fidelity with
  the user's project — i.e., reuse the CLI's `loadDefs` path (`src/cli/schema.ts`).

### 6.4 How surreal-zod (the lib) powers the app
Treat `packages/core` as the **engine**, shared verbatim by CLI and GUI:
- **schema → DDL:** `emitStatements / emitTable / emitField / emitDefStatement` (`src/ddl.ts`).
- **schema model:** `pure.ts` (`sz`, `defineTable`, …, `surrealTypeRegistry`, `objectFieldsRegistry`).
- **migrations / diff / sync / pull:** `src/cli/{diff,migrate,meta,filter,sync(in index),pull,
  introspect,config,schema}.ts`. The GUI calls these functions directly (desktop) or their
  browser-safe equivalents (web). **Do not fork logic into the UI** — extend the lib if a function is
  CLI-only, so CLI and GUI stay identical.

### 6.5 SurrealDB connectivity
- **Web playground:** **`@surrealdb/wasm`** in-browser engine — ephemeral, no server. Apply generated
  DDL + run queries for the **Result** tab and the "Run" button. (Same approach as Surrealist's web
  Sandbox.)
- **Desktop:** the **`surrealdb` JS SDK** over `ws`/`http` for remote + Cloud; a **managed local
  SurrealDB** via the integrated version manager (D15 — detect-on-PATH, internal versions, WSL interop
  on Windows) for a local dev DB (one-click start/stop, console drawer = the terminal's Output tab).

### 6.6 State management & data
- **Zustand** for app/UI state (active module, active connection, editor buffers, pane sizes) — small,
  fast, matches Surrealist's choice.
- **TanStack Query** for Explorer/Query data fetching + caching against the live DB.
- **Persistence:** web = `localStorage`/IndexedDB for buffers + share-links; desktop = the real
  project files on disk + a small app DB (Electron store, e.g. `electron-store`) for connections/preferences.

### 6.7 Where the user's real files fit + the embeddable
- **Desktop = a GUI over a real folder.** "Open project" points at a dir with `surreal-zod.config.ts`;
  the Schema Editor edits `database/schemas/*.ts`; generate/migrate write real `*.surql` +
  `meta/_snapshot.json`; the integrated terminal runs the real `sz` binary. CLI ⇄ GUI are
  interchangeable.
- **Web = file-less.** Virtual buffers, example schemas, WASM sandbox, **Share** via URL-encoded
  state (and optional gist). No real connections, no disk.
- **Embeddable:** ship the Phase-1 playground as a self-contained component/iframe (`<sz-playground>`)
  the **marketing site embeds as a preview** (§3.3). One codebase, two entry points (full app vs
  embed).

### 6.8 Module/dependency sketch
```
@surreal-zod/core (lib + CLI engine)  ──┐
                                        ├─►  packages/studio (React+Vite+Electron)
SurrealDB WASM / JS SDK / sidecar  ─────┤        ├─ shell (top bar, rail, panes, terminal, status)
Monaco + TS worker (@typescript/vfs) ───┤        ├─ modules/{schema,ddl,types,migrations,connections,
esbuild-wasm worker (web eval)  ────────┘        │            explorer,query,designer,diffsync,auth,fn}
Zustand + TanStack Query                         └─ embed entry (<sz-playground>)
```

---

## 7. MVP & phasing (with explicit cut-lines)

### Phase 1 — **Web Playground (MVP)** · *schema → SurrealQL → types → run*
Realize frame `xr3UV` as a standalone web app **and** the embeddable landing preview.
- ✅ Monaco `sz.*` editor with full TS IntelliSense (surreal-zod/zod/surrealdb types loaded).
- ✅ Live **SurrealQL** + **Types** output tabs; **Migration** preview tab.
- ✅ **WASM sandbox**: Run applies DDL + executes queries → **Result** tab.
- ✅ Example selector, Format, Reset, **Share** (URL state), Problems/terminal (simulated `sz`).
- ✅ Status bar, brand shell.
- **MVP CUT-LINE — explicitly NOT in Phase 1:** no filesystem, no real/remote/local connections, no
  persisted migrations, no Explorer editing, no visual Designer, no Auth/Functions modules, no
  accounts. If it needs a server or a disk, it's out.

### Phase 2 — **Desktop + real databases**
- Electron desktop; **Open project** (real `surreal-zod` folder); edit real schema files.
- **Connections** module (remote + Cloud creds + **bundled local sidecar**), `sz doctor`/test.
- **Migrations** module: generate / apply / status / **diff --live** / rollback / history, real `sz`
  CLI in the integrated terminal.
- **CUT-LINE:** Explorer is read-mostly; no visual Designer yet.

### Phase 3 — **Explorer / Query + Visual Designer + Sync**
- Full **Data Explorer** (record grid, link/graph traversal, inline edit) + **Query runner** (saved/
  history/variables, table/JSON/graph/geo/vector result modes).
- **Schema Designer** (ER canvas, bidirectional code ↔ visual).
- **Diff/Sync**: drift view, `sync --dry-run/--no-prune`, **pull** preview.

### Phase 4 — **Full management / Surrealist parity**
- **Authentication/Access**, **Functions**, **Parameters**, **Events**, **GraphQL**, **Models
  (SurrealML)**, **API docs**, **AI assistant**. Close the library parity backlog (§4.11) so the
  Designer can author references, full-text/vector indexes, etc. Optional: hosted shared sandboxes,
  team/collab.

---

## 8. Design system

Use the brand tokens defined in `design/website.pen` (read via Pencil `get_variables`) as CSS
variables; the Pencil frames (`xr3UV` for the app shell, `design/concepts/*` for mood) are the
visual reference of record.

- **Surfaces:** `--canvas #0e0c14`, `--canvas-2 #13101c`, `--surface #16131f`, `--surface-2 #1c1826`,
  `--code-bg #100d18`.
- **Borders:** `--border #2a2438`, `--border-subtle #211b2d`.
- **Text:** `--text-primary #f5f3fa`, `--text-secondary #aaa1bb`, `--text-muted #6f6781`.
- **Accents (signature gradient):** `--accent-purple #9600ff` → `--accent-hot #ff00a0` /
  `--accent-pink #ff85d6`, soft `--accent-soft #c77dff`. The Run button + brand mark use the
  purple→pink linear gradient with a `#9600ff55` glow.
- **Semantic:** `--success-green #46d39a`, `--danger-red #ff5d6c`.
- **Code tokens:** keyword `#c77dff`, string `#ff85d6`, fn `#7bd0ff`, type `#9fe3b0`, comment
  `#5d5670`, plain `#d8d3e4` — wire these into the Monaco/SurrealQL themes.
- **Type:** display = **Geist**, mono = **Geist Mono**. (A light theme palette `light-*` exists in the
  tokens for an optional light mode.)
- **Iconography:** Lucide (the frame already uses `file-code`, `database`, `git-branch`, `play`,
  `sparkles`, `share-2`, etc.).

---

## 9. Naming

"Surrealist" is taken (SurrealDB-official). We want a **Studio** framing that signals
**schema-as-code** and fits the surreal/dream brand. Candidates:

| Name | Read | Notes / collision risk |
|---|---|---|
| **Reverie** ⭐ | a daydream → on-brand "surreal," yet evokes a clean, dreamt-up schema | Distinctive, pronounceable, **ownable**; low collision in dev-tools. Pairs well as "Reverie — the schema studio for SurrealDB." |
| **Lucid** | "lucid dream" (surreal nod) **and** "lucid" = your schema is finally clear/single-source | Strongest *meaning*, but **trademark-blocked**: Lucid Software (Lucidchart/Lucidspark) owns "Lucid" in the design-tool space. Avoid as primary. |
| **Schematic** | literal: schema-first, blueprint vibe (matches the "technical-blueprint" concept) | Very on-the-nose; collides with SchematicHQ (a SaaS) and is hard to trademark. |
| **Conjure** | magic verb — "conjure your database from code"; fits Surrealist's magician motif | Some collision (infra tools named Conjure); decent if Reverie is unavailable. |
| **Codex** | "your schema codex" | Heavy collision now (OpenAI Codex); not recommended. |

**Recommendation: `Reverie`**, marketed as **"Reverie — the schema-as-code studio for SurrealDB"**
(working/dev name "surreal-zod Studio" until a trademark search clears it; §11). It keeps the
surreal/dream brand SurrealDB and Surrealist lean into, is distinctive enough to own, and avoids the
Lucid Software conflict. **Differentiation line to ship with the name:** *"Surrealist starts from
your database. Reverie starts from your code."*

---

## 10. Out of scope for v1

- Writing/running ad-hoc **DML** as "migrations" through the GUI (use `sz new` + the editor).
- **SurrealML** model training; only upload/list later (Phase 4).
- **Real-time multi-user collaboration** / shared cursors.
- **Mobile** apps; **non-SurrealDB** targets.
- **Hosting/billing** a managed cloud (Cloud *connections* are in-scope Phase 4; running our own is
  not).
- A full **query ORM / builder** surface — `sz.*` is DDL-authoring; query building is a separate
  future track (see `docs/query-builder-design.md`), not v1.

---

## 11. Open questions / decisions to make

1. **Hosted shared sandbox?** Share-via-URL (client-only) is safe and cheap for Phase 1. A
   server-backed shared/persistent sandbox (Surrealist's "Deploy to Cloud" analog) raises **cost,
   abuse, and sandboxing** questions — defer unless there's a clear adoption need.
2. **Accounts & auth?** Needed for saved cloud connections, cross-device sync, and team features.
   Recommendation: **no accounts in Phase 1–2** (local-only); revisit at Phase 4 with Cloud.
3. **OSS vs commercial?** Surrealist is free/OSS; matching that lowers adoption friction.
   Recommendation: **open-source the app**, optionally with a commercial "team/cloud" tier later
   (Drizzle-style). Decide license (MIT vs AGPL) before public launch.
4. **Offline-first desktop?** Yes for schema/DDL/types/migrations (all local). Explorer/Query
   obviously need a connection. Confirm the sidecar binary is bundled per-OS (size/signing).
5. **Executing untrusted TS in the browser** (web eval, §6.3) — confirm the Web Worker sandbox is
   sufficient isolation, and cap example/user code (no network, no `eval` escape).
6. **Name/trademark search** for **Reverie** (and fallbacks) before any public/marketing use; secure
   domain + npm/GitHub org.
7. **Credential storage** — confirm OS keychain via Electron `safeStorage`/keytar for all remote/Cloud secrets; never persist
   plaintext in `surreal-zod.config.ts` (env-only there).
8. **Relationship to `surqlize`** (the official SurrealDB TS ORM, noted in project memory) — position
   Reverie as the **schema/migration/studio** layer, complementary to a query ORM; decide whether to
   interop or stay independent.
9. **Telemetry** — opt-in only; decide what (if anything) we collect.
10. **SDK/server version matrix** — JS SDK v2.x ↔ server v3.x (per project memory). Pin tested
    versions and surface a compatibility note in Connections.

---

## 12. Build hand-off checklist (for the AI engineer)

1. Scaffold `packages/studio` = React + Vite + TS + Electron; wire brand tokens (§8) as CSS vars.
2. Build the **app shell** to match frame `xr3UV` (top bar, left rail, split panes, terminal, status
   bar) with Zustand state.
3. Integrate **Monaco** + TS worker; load `surreal-zod`/`zod`/`surrealdb` `.d.ts` (§6.2).
4. Implement the **web eval worker** (esbuild-wasm) → collect `TableDef`s → call `emitStatements`
   for the **SurrealQL** view; compute **Types** view via the TS service (§6.3, §4.2–4.3).
5. Wire the **WASM sandbox** (`@surrealdb/wasm`): Run = apply DDL + query → **Result** tab (§6.5).
6. Add Example selector, Format, Reset, **Share** (URL state), simulated `sz` terminal → **ship
   Phase 1** (standalone web app + `<sz-playground>` embed).
7. Phase 2: Electron **Open project**, real-file editing, **Connections**, **Migrations** over the real
   `sz` engine (`src/cli/*`), bundled sidecar SurrealDB.
8. Phase 3+: Explorer/Query, Designer, Diff/Sync, then Phase 4 parity modules.

> **Reference files:** library API `packages/core/src/{pure.ts,ddl.ts,index.ts}`; CLI/engine
> `packages/core/src/cli/*`; config `packages/core/src/config.ts`; parity/limits
> `packages/core/docs/{PARITY.md,SURREALDB-FEATURE-MAP.md}`; example model
> `packages/core/examples/schema.ts`; design `design/website.pen` frame `xr3UV` + tokens.
