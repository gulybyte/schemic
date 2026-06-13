// Verifies: static menus are gone; Cmd/K opens the palette; running
// `titlebar.switchStyle` from the palette flips the chrome.
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
const chrome = () =>
  win.evaluate(() =>
    document.querySelector(".tb-c")
      ? "C"
      : document.querySelector(".tb-b")
        ? "B"
        : "none",
  );

await win.waitForSelector(".tb-c, .tb-b");
const menusGone = await win.evaluate(
  () =>
    !document.querySelector(".tb-menu") &&
    !document.querySelector(".tb-appmenu"),
);
console.log("menus removed:", menusGone, "| initial chrome:", await chrome());

// Open the palette with Cmd/Ctrl+K (TanStack Hotkeys → command.palette).
await win.keyboard.press("Control+K");
await win.waitForSelector("[cmdk-input]", { timeout: 4000 });
console.log(
  "palette opened:",
  await win.evaluate(() => !!document.querySelector("[cmdk-dialog]")),
);

// Filter + run the titlebar command.
await win.keyboard.type("Switch Title");
await win.waitForTimeout(200);
await win.keyboard.press("Enter");
await win.waitForTimeout(500);
console.log("after run titlebar.switchStyle:", await chrome());

// Reset to C.
await win.evaluate(() =>
  window.__studio.getState().setSetting("titlebar.variant", "C"),
);
await win.waitForTimeout(200);
console.log("after reset:", await chrome());

await app.close();
console.log("done");
