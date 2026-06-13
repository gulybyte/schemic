import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { _electron as electron } from 'playwright'
const require = createRequire(import.meta.url)
const electronPath = require('electron')
const appDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const app = await electron.launch({ executablePath: electronPath, args: [appDir, '--no-sandbox', '--disable-gpu'], cwd: appDir })
const win = await app.firstWindow()
win.on('pageerror', (e) => console.log('[pageerror]', e.message))
await win.waitForSelector('.statusbar')
await win.waitForTimeout(800)
const txt = await win.evaluate(() => ({
  left: document.querySelector('.status-left')?.innerText.replace(/\s+/g,' ').trim(),
  right: document.querySelector('.status-right')?.innerText.replace(/\s+/g,' ').trim(),
}))
console.log('left :', txt.left)
console.log('right:', txt.right)
await win.screenshot({ path: '/tmp/sz-statusbar.png' })
await app.close()
console.log('done')
