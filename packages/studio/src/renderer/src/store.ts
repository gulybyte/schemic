import { create } from 'zustand'
import { mutative } from 'zustand-mutative'
import type { QueryOutcome } from './adapters/QueryEngine'
import { getFileSystem, getQueryEngine } from './runtime'
import './settings/defs' // register built-in setting definitions (side effect)
import { getSettingDef } from './settings/registry'

export type OpenFile = { path: string; name: string; language: string }

function langFromPath(name: string): string {
  if (name.endsWith('.surql')) return 'surrealql'
  if (name.endsWith('.ts') || name.endsWith('.tsx')) return 'typescript'
  if (name.endsWith('.js')) return 'javascript'
  if (name.endsWith('.json')) return 'json'
  if (name.endsWith('.md')) return 'markdown'
  return 'plaintext'
}

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
  // Workspace / files.
  workspaceRoot: string | null
  openFile: OpenFile | null
  openProject: (dir?: string) => Promise<void>
  openFileDialog: () => Promise<void>
  openFilePath: (path: string) => Promise<void>
  saveOpenFile: () => Promise<void>
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
    workspaceRoot: null,
    openFile: null,
    openProject: async (dir) => {
      let root = dir ?? null
      if (!root) root = (await window.studio?.fs.openDirectoryDialog()) ?? null
      if (!root) return
      await window.studio?.fs.addRoot(root)
      set((s) => {
        s.workspaceRoot = root
      })
    },
    openFileDialog: async () => {
      const path = (await window.studio?.fs.openFileDialog()) ?? null
      if (path) await get().openFilePath(path)
    },
    openFilePath: async (path) => {
      const content = await getFileSystem().readFile(path)
      const name = path.split(/[\\/]/).pop() ?? path
      set((s) => {
        s.openFile = { path, name, language: langFromPath(name) }
        s.query = content
      })
    },
    saveOpenFile: async () => {
      const { openFile, query } = get()
      if (!openFile) return
      await getFileSystem().writeFile(openFile.path, query)
    },
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
