// Verifies titlebar.variant is a real, reactive, persisted setting.
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { _electron as electron } from 'playwright'

const require = createRequire(import.meta.url)
const electronPath = require('electron')
const here = dirname(fileURLToPath(import.meta.url))
const appDir = join(here, '..')

const app = await electron.launch({
  executablePath: electronPath,
  args: [appDir, '--no-sandbox', '--disable-gpu'],
  cwd: appDir,
})
const win = await app.firstWindow()
win.on('pageerror', (e) => console.log('[pageerror]', e.message))

const chrome = () => win.evaluate(() => (document.querySelector('.tb-c') ? 'C' : document.querySelector('.tb-b') ? 'B' : 'none'))

await win.waitForSelector('.tb-c, .tb-b')
console.log('initial chrome:', await chrome())

// Change the setting → expect a LIVE switch to B (no reload).
await win.evaluate(() => window.__studio.getState().setSetting('titlebar.variant', 'B'))
await win.waitForTimeout(400)
console.log('after setSetting B (live):', await chrome())

// Reload → expect B to PERSIST (read from settings.json synchronously).
await win.reload()
await win.waitForSelector('.tb-b, .tb-c')
await win.waitForTimeout(400)
console.log('after reload (persisted):', await chrome())

// Reset to C so the test is idempotent.
await win.evaluate(() => window.__studio.getState().setSetting('titlebar.variant', 'C'))
await win.waitForTimeout(300)
console.log('after reset C:', await chrome())

await app.close()
console.log('done')
