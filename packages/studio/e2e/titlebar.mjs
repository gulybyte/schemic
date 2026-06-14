// Verifies the titlebar: app-menu bar + File dropdown (C), and the B collapsed "Menu" dropdown.
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { _electron as electron } from "playwright";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, "..");

const app = await electron.launch({
  executablePath: require("electron"),
  args: [appDir, "--no-sandbox", "--disable-gpu"],
  cwd: appDir,
});
const win = await app.firstWindow();
win.on("pageerror", (e) => console.log("[pageerror]", e.message));
await win.waitForSelector(".tb-c");

// Menu bar: 6 menus.
const menus = await win.evaluate(() =>
  [...document.querySelectorAll(".tb-menus .tb-menu")].map(
    (b) => b.textContent,
  ),
);
console.log("C menu bar:", menus.join(" "));

// Open File menu.
await win.evaluate(() =>
  document
    .querySelector(".tb-menus .tb-menu")
    ?.dispatchEvent(new MouseEvent("click", { bubbles: true })),
);
await win.waitForSelector(".ctx-menu");
const fileItems = await win.evaluate(() =>
  [...document.querySelectorAll(".ctx-menu .ctx-item")].map((b) =>
    b.textContent?.trim(),
  ),
);
const hasSubmenuChevron = await win.evaluate(
  () => !!document.querySelector(".ctx-menu .ctx-chevron"),
);
console.log("File menu items:", fileItems.join(" | "));
console.log("Open Recent submenu chevron:", hasSubmenuChevron);
console.log(
  "window controls present:",
  await win.evaluate(() => !!document.querySelector(".win-ctls")),
);
await win.keyboard.press("Escape");

// Dump all 6 menus' contents to eyeball against the inventory ((x)=disabled).
for (let i = 0; i < 6; i++) {
  await win.evaluate((idx) => {
    document
      .querySelectorAll(".tb-menus .tb-menu")
      [idx]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }, i);
  await win.waitForSelector(".ctx-menu");
  const dump = await win.evaluate(() => {
    const open = document.querySelector(".tb-menu.open")?.textContent;
    const rows = [
      ...document.querySelectorAll(".ctx-menu .ctx-item, .ctx-menu .ctx-sep"),
    ].map((el) =>
      el.classList.contains("ctx-sep")
        ? "—"
        : `${el.textContent?.trim()}${el.disabled ? "(x)" : ""}`,
    );
    return `[${open}] ${rows.join(" / ")}`;
  });
  console.log(dump);
  await win.keyboard.press("Escape");
  await win.waitForTimeout(80);
}

// Switch to variant B and exercise the collapsed Menu dropdown.
await win.evaluate(() =>
  window.__studio.getState().setSetting("titlebar.variant", "B"),
);
await win.waitForSelector(".tb-b .tb-menu-collapsed");
await win.evaluate(() =>
  document
    .querySelector(".tb-menu-collapsed")
    ?.dispatchEvent(new MouseEvent("click", { bubbles: true })),
);
await win.waitForSelector(".ctx-menu");
const topList = await win.evaluate(() =>
  [...document.querySelectorAll(".ctx-menu .ctx-item")].map((b) =>
    b.textContent?.trim(),
  ),
);
console.log("B Menu top-level:", topList.join(" | "));
// Click "File" in the top list -> swaps to File items.
await win.evaluate(() => {
  const file = [...document.querySelectorAll(".ctx-menu .ctx-item")].find((b) =>
    b.textContent?.includes("File"),
  );
  file?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
});
await win.waitForTimeout(200);
const afterFile = await win.evaluate(() =>
  [...document.querySelectorAll(".ctx-menu .ctx-item")].map((b) =>
    b.textContent?.trim(),
  ),
);
console.log("B Menu -> File expands to:", afterFile.join(" | "));

// Reset to C.
await win.evaluate(() =>
  window.__studio.getState().setSetting("titlebar.variant", "C"),
);
await win.screenshot({ path: "/tmp/sz-titlebar.png" });
await app.close();
console.log("done");
