import { create } from 'zustand'
import { mutative } from 'zustand-mutative'
import type { QueryOutcome } from './adapters/QueryEngine'
import { getQueryEngine } from './runtime'
import './settings/defs' // register built-in setting definitions (side effect)
import { getSettingDef } from './settings/registry'

const DEFAULT_QUERY = `-- edit and Run (Cmd/Ctrl+Enter)
SELECT id, name, email, age
FROM user
WHERE age >= 18
ORDER BY age DESC;`

interface StudioState {
  // Settings (user scope) — overrides on top of registered defaults.
  userSettings: Record<string, unknown>
  setSetting: (key: string, value: unknown) => void
  // Command palette.
  paletteOpen: boolean
  setPaletteOpen: (open: boolean) => void
  // Query / results.
  query: string
  outcome: QueryOutcome | null
  running: boolean
  setQuery: (q: string) => void
  run: () => Promise<void>
}

const initialSettings =
  (typeof window !== 'undefined' && window.studio?.settings?.initial) || {}

export const useStudio = create<StudioState>()(
  mutative((set, get) => ({
    userSettings: { ...initialSettings },
    setSetting: (key, value) => {
      set((s) => {
        s.userSettings[key] = value
      })
      window.studio?.settings.save(get().userSettings)
    },
    paletteOpen: false,
    setPaletteOpen: (open) =>
      set((s) => {
        s.paletteOpen = open
      }),
    query: DEFAULT_QUERY,
    outcome: null,
    running: false,
    setQuery: (q) =>
      set((s) => {
        s.query = q
      }),
    run: async () => {
      if (get().running) return
      set((s) => {
        s.running = true
      })
      const outcome = await getQueryEngine().query(get().query)
      set((s) => {
        s.outcome = outcome
        s.running = false
      })
    },
  })),
)

/** Effective setting value: user override if present, else the registered default. */
export function useSetting<T = unknown>(key: string): T {
  return useStudio((s) =>
    key in s.userSettings ? s.userSettings[key] : getSettingDef(key)?.default,
  ) as T
}

/** Non-reactive read of a setting (for commands / non-React code). */
export function getSetting<T = unknown>(key: string): T {
  const s = useStudio.getState()
  return (key in s.userSettings ? s.userSettings[key] : getSettingDef(key)?.default) as T
}
