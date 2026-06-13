// Captures renderer console + page errors (no selector wait, survives a blank render).
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { _electron as electron } from "playwright";

const require = createRequire(import.meta.url);
const electronPath = require("electron");
const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, "..");

const app = await electron.launch({
  executablePath: electronPath,
  args: [appDir, "--no-sandbox", "--disable-gpu"],
  cwd: appDir,
});
const win = await app.firstWindow();
win.on("console", (m) => console.log(`[${m.type()}]`, m.text()));
win.on("pageerror", (e) => console.log("[pageerror]", e.stack || e.message));
await win.waitForTimeout(6000);
await app.close();
console.log("done");
