// Playwright-Electron driver: launches the built app and captures both titlebar
// variants (C default, B via the flag). Run via `bun run e2e` (builds first).
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { _electron as electron } from "playwright";

const require = createRequire(import.meta.url);
const electronPath = require("electron");

const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, "..");
const outDir = process.env.SZ_E2E_OUT || "/tmp";

const app = await electron.launch({
  executablePath: electronPath,
  args: [appDir, "--no-sandbox", "--disable-gpu"],
  cwd: appDir,
});

const win = await app.firstWindow();
await win.waitForSelector(".tb-c");
await win.waitForTimeout(700);
await win.screenshot({ path: join(outDir, "sz-titlebar-C.png") });
console.log("captured Variation C (default)");

// Flip the flag to Variation B and reload.
await win.evaluate(() => localStorage.setItem("sz.titlebar", "B"));
await win.reload();
await win.waitForSelector(".tb-b");
await win.waitForTimeout(700);
await win.screenshot({ path: join(outDir, "sz-titlebar-B.png") });
console.log("captured Variation B (flag)");

await app.close();
console.log("done");
