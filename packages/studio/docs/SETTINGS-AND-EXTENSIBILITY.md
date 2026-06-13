# Settings & Extensibility — DRAFT plan (for review)

> Status: **draft for Manuel's review** — no code yet. Captures D35–D38 + the MCP plan (D37).
> The thesis: build a small **contribution core** (VSCode/Theia-style) — registries for **settings**,
> **commands**, and **status-bar segments** — over a reactive store, so the UI is configurable, agents
> can drive it (MCP), and future extensions plug into the same contracts. The adapter model (D34) is the
> same idea for capabilities (engine/fs/terminal); this extends it to config + commands.

## 0. Layers at a glance

```
  Contribution registries   settings · commands · statusbar segments · (adapters, D34)
            │  (register definitions: key/type/default, id/handler, segment specs)
  Reactive store            Zustand + mutative (D35)  ── single source of truth, UI subscribes
            │
  Persistence               user settings (userData) + project settings (repo)   [main, IPC]
            │
  Surfaces                  Settings UI · Command palette (Cmd/K) · Status bar · MCP server (main)
```

Everything configurable or invokable is a **registered definition**, not a hardcoded branch. That's
what makes it settable, palette-able, and MCP-addressable for free.

## 1. State — Zustand + mutative (D35)

- Store via `zustand` with the `mutative` middleware (`zustand-mutative`): reducers mutate a draft,
  middleware produces the next immutable state. Ergonomic for nested state (settings tree, segment lists).
- One root store, sliced by domain (`settings`, `editor`, `results`, `workspace`, …). Selectors keep
  re-renders tight.
- Replaces ad-hoc state (the current `useStudio`, and the `localStorage` titlebar flag → `settings`).

## 2. Settings system (D36)

**Definition (contribution).** Features register settings; the registry is the source of truth for
type, default, UI, and validation:

```ts
defineSetting({
  key: 'titlebar.variant',
  type: 'enum', enum: ['C', 'B'], default: 'C',
  scope: 'user',
  title: 'Title bar style', description: 'Two-tier (C) or switcher-centric (B).',
})
defineSetting({
  key: 'statusbar.segments',
  type: 'segment-list', default: DEFAULT_SEGMENTS, scope: 'user',
})
```

**Scopes & resolution.** `user` (this install) and `project` (committed to the repo). Effective value =
project ?? user ?? default. (Org-level may layer in later, since orgs share config — D26.)

**Storage.** user → `userData/settings.json`; project → a repo file (proposed `.reverie/settings.json`,
committed). Writes happen in **main** over IPC; **never** in `surreal-zod.config.ts` (D25). Secrets are
not settings (those are keychain, D27).

**Reactivity.** Settings live in the store (§1); `useSetting('titlebar.variant')` re-renders on change.
Changing a setting is live (titlebar swaps, status bar recomposes) — no reload.

**UI (later).** A VSCode-style settings page: searchable, grouped by category, typed editors
(toggle/enum/text/list) + a raw-JSON escape hatch. The **registry drives the UI** — add a setting, it
appears automatically.

**First consumers.** `titlebar.variant` (retire the localStorage hack) and `statusbar.segments` (§4).

## 3. Command registry (foundation for palette + MCP)

- `registerCommand({ id, title, category?, when?, run })`. UI buttons, menu items, keybindings, the
  **Cmd/K palette**, and the **MCP server** all invoke commands by `id`.
- Examples: `query.run`, `titlebar.setVariant`, `project.open`, `settings.set`, `statusbar.toggleSegment`.
- Keybindings map keystrokes → command id (also a contribution). Cmd/Ctrl+Enter → `query.run`.
- This makes "what the app can do" an enumerable, addressable surface — the key enabler for §5.

## 4. Status bar — dynamic segments (D38)

- Registry of **segments**: `{ id, side: 'left'|'right', priority, render(state), statuses? }`.
- `statusbar.segments` (a setting) selects which show, their side, and order. "Select what shows" =
  toggling/reordering this list.
- **Default composition (Manuel):**
  - **LEFT:** `ns+db` (moved here) · `git.branch` · `problems` (errors/warnings)
  - **RIGHT:** `editor.language` · `editor.cursor` · `editor.indentation`
  - **Removed:** `connection` (redundant with the titlebar) · `engine/cli status` (no value now)
- Segments are **multi-status** (e.g., problems = none / N warnings / N errors; git = clean / ahead /
  dirty). `design-expert` designs each segment + its states (showcased on titlebar Variation B).
- The bar is approved; only the segment set is dynamic.

## 5. Agent control — both directions (D37)

Both routes drive the app through the **same command/state registry (§3)** — that's the spine. Build it
once; both layer on top.

**(a) External assistants control the app** (Claude Code, Cursor, …):
- The studio runs an **MCP server** in the **main process**, built on the official
  `@modelcontextprotocol/sdk`.
- **Transport:** HTTP/SSE (Streamable HTTP) on a local port — a GUI app isn't a stdio child of the agent
  host, so the host connects by URL.
- Exposes: **tools** = command registry; **resources** = readable state/settings; settings get/set via
  commands. Destructive commands gated (`when` / confirmation).

**(b) Integrated "Sidekick" assistant** (§4.10, paid — D18):
- Built with **TanStack AI** (provider-agnostic chat: Anthropic/OpenAI/Gemini/Ollama) + its host-side
  `@tanstack/ai-mcp` **client**.
- Drives the app via the command registry **in-process** (no network hop), and can **consume external
  MCP servers** as tools for its own capabilities (and could consume our own server too).

**Net:** "agents interact with the app" = exposing the existing registries; "integrated assistant" =
a TanStack-AI chat wired to the same registries + external tools. Neither is a parallel API.

## 5b. Resolved (Manuel)
- **Project settings location:** `.reverie/settings.json`, committed to the repo. ✅
- **MCP:** build registries **MCP-ready now**; MCP server + Sidekick as follow-ons (both directions wanted). ✅
- **Settings UI:** configure in **code** for now; the settings *page* waits for design-expert. ✅
- **Org-scoped settings:** **deferred** to the org subsystem. ✅

## 6. Open questions — resolved (see §5b)

All four resolved with Manuel: project settings = committed `.reverie/settings.json`; MCP-ready now with
both server + Sidekick as follow-ons; settings UI in code until design-expert; org-scoped deferred.

## 7. Suggested build order (deliberate, not committed)

1. Store on Zustand+mutative; move `titlebar.variant` + query/result state into it.
2. Settings registry + user-scope persistence (main/IPC); wire `titlebar.variant` as the first real setting.
3. Status-bar segment registry + `statusbar.segments`; recompose to the D38 default.
4. Command registry + keybindings; route `query.run` (Cmd/Enter) through it.
5. Cmd/K palette over the command registry.
6. **MCP server** (official SDK, HTTP/SSE) wrapping commands/settings/state — external-agent control.
7. Settings page UI (after design-expert specs it).
8. Project-scope settings (`.reverie/settings.json`).
9. **Integrated Sidekick** (TanStack AI) over the same registries — §4.10, paid (later).
