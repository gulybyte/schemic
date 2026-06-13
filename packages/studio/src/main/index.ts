import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { BrowserWindow, app, ipcMain } from 'electron'

// WSL/headless friendliness: avoid GPU + sandbox issues when running under WSLg.
app.disableHardwareAcceleration()
app.commandLine.appendSwitch('no-sandbox')
// The @surrealdb/wasm engine uses SharedArrayBuffer; enable it without requiring
// cross-origin isolation (which file:// can't satisfy cleanly).
app.commandLine.appendSwitch('enable-features', 'SharedArrayBuffer')

// Custom-titlebar window controls (the chrome draws its own traffic lights).
ipcMain.on('win:minimize', (e) => BrowserWindow.fromWebContents(e.sender)?.minimize())
ipcMain.on('win:maximize', (e) => {
  const w = BrowserWindow.fromWebContents(e.sender)
  if (w) (w.isMaximized() ? w.unmaximize() : w.maximize())
})
ipcMain.on('win:close', (e) => BrowserWindow.fromWebContents(e.sender)?.close())

// User settings persistence (`userData/settings.json`). Sync read so the renderer can
// init settings before first paint (no flash); async write on change.
const settingsPath = () => join(app.getPath('userData'), 'settings.json')
function readUserSettings(): Record<string, unknown> {
  try {
    return JSON.parse(readFileSync(settingsPath(), 'utf8'))
  } catch {
    return {}
  }
}
ipcMain.on('settings:read', (e) => {
  e.returnValue = readUserSettings()
})
ipcMain.on('settings:write', (_e, values: Record<string, unknown>) => {
  try {
    const p = settingsPath()
    mkdirSync(dirname(p), { recursive: true })
    writeFileSync(p, JSON.stringify(values, null, 2))
  } catch (err) {
    console.error('settings write failed', err)
  }
})

// Dev screenshot hook: SZ_SHOT=<path> captures the renderer once loaded, then quits.
const SHOT = process.env.SZ_SHOT

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    show: true,
    backgroundColor: '#0e0c14',
    title: 'Reverie Studio',
    frame: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  if (SHOT) {
    win.webContents.once('did-finish-load', async () => {
      await new Promise((r) => setTimeout(r, 1500))
      const image = await win.webContents.capturePage()
      writeFileSync(SHOT, image.toPNG())
      app.quit()
    })
  }
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  app.quit()
})
