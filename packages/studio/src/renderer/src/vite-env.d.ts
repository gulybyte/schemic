/// <reference types="vite/client" />

interface StudioBridge {
  platform: string
  versions: Record<string, string | undefined>
  window: {
    minimize: () => void
    maximize: () => void
    close: () => void
  }
  settings: {
    initial: Record<string, unknown>
    save: (values: Record<string, unknown>) => void
  }
}

interface Window {
  studio?: StudioBridge
}
