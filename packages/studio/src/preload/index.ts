import { contextBridge, ipcRenderer } from 'electron'

// Minimal, safe surface for the renderer. Grows as the studio needs main-process APIs.
contextBridge.exposeInMainWorld('studio', {
  platform: process.platform,
  versions: process.versions,
  window: {
    minimize: () => ipcRenderer.send('win:minimize'),
    maximize: () => ipcRenderer.send('win:maximize'),
    close: () => ipcRenderer.send('win:close'),
  },
  settings: {
    // Synchronous so the store can initialize before first paint (no flash).
    initial: ipcRenderer.sendSync('settings:read') as Record<string, unknown>,
    save: (values: Record<string, unknown>) => ipcRenderer.send('settings:write', values),
  },
})
