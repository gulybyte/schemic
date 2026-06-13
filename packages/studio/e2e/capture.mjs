// Verifies the interactive Run loop: edit the query, Ctrl+Enter, results change.
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
win.on("pageerror", (e) => console.log("[pageerror]", e.message));

await win.waitForSelector(".result-table tbody tr");
const rowsBefore = await win.evaluate(
  () => document.querySelectorAll(".result-table tbody tr").length,
);
console.log("rows before edit:", rowsBefore);

// Replace the query and run via Ctrl+Enter.
await win.click(".monaco-editor .view-lines");
await win.keyboard.press("Control+A");
await win.keyboard.type("SELECT name, age FROM user WHERE age >= 40;");
await win.keyboard.press("Control+Enter");
await win.waitForTimeout(1500);

const rowsAfter = await win.evaluate(
  () => document.querySelectorAll(".result-table tbody tr").length,
);
const meta = await win.evaluate(
  () => document.querySelector(".result-meta")?.textContent ?? "",
);
console.log("rows after edit:", rowsAfter, "| meta:", meta);

await win.screenshot({ path: "/tmp/sz-run-edit.png" });
await app.close();
console.log("done");
