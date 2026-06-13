// Verifies the File Explorer: open a project folder, render the tree, click a file
// to open it as a tab (which then drives the live SurrealQL codegen).
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { _electron as electron } from "playwright";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, "..");
const projectDir = resolve(appDir, "../example-git/database/schema/tables");

const app = await electron.launch({
  executablePath: require("electron"),
  args: [appDir, "--no-sandbox", "--disable-gpu"],
  cwd: appDir,
});
const win = await app.firstWindow();
win.on("pageerror", (e) => console.log("[pageerror]", e.message));

await win.waitForSelector(".explorer-empty-title");
console.log(
  "empty state:",
  await win.evaluate(
    () => document.querySelector(".explorer-empty-title")?.textContent,
  ),
);

// Open the project through the store (same path as the Open Folder button).
await win.evaluate(
  (dir) => window.__studio.getState().openProject(dir),
  projectDir,
);
await win.waitForSelector(".tree-row");
const rows = await win.evaluate(() =>
  [...document.querySelectorAll(".tree-name")].map((n) => n.textContent),
);
console.log("tree rows:", rows.join(", "));
console.log(
  "project title:",
  await win.evaluate(
    () => document.querySelector(".explorer-title")?.textContent,
  ),
);

// Click the user.ts row.
await win.evaluate(() => {
  const row = [...document.querySelectorAll(".tree-row")].find((r) =>
    r.textContent?.includes("user.ts"),
  );
  row?.click();
});
await win.waitForSelector(".file-tab.active");
await win.waitForTimeout(2000);
console.log(
  "active tab:",
  await win.evaluate(
    () =>
      document.querySelector(".file-tab.active .file-tab-name")?.textContent,
  ),
);
const ddl = (
  await win.evaluate(
    () =>
      document.querySelector(".output-panel .view-lines")?.textContent ?? "",
  )
).replace(/\s+/g, " ");
console.log(
  "generated DDL has DEFINE TABLE user:",
  ddl.includes("DEFINE TABLE user"),
);

await win.screenshot({ path: "/tmp/sz-explorer.png" });
await app.close();
console.log("done");
