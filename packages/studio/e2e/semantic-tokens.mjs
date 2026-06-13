// Verifies semantic-token highlighting for .surql files via surrealql-language-server's
// textDocument/semanticTokens/full (Studio passes the data straight to Monaco). Gates
// gracefully: a server without semanticTokens (e.g. <= v0.1.6) just yields no tokens and the
// test reports "skipped". Point SURREALQL_LSP at a build that supports it to exercise fully.
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { _electron as electron } from "playwright";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, "..");

const dir = "/tmp/sz-semtok";
const file = join(dir, "sample.surql");
mkdirSync(dir, { recursive: true });
writeFileSync(
  file,
  [
    "-- create a user",
    "LET $n = math::abs(-3);",
    'CREATE user:tobie SET age = 18, name = "tobie";',
    "DEFINE FIELD email ON TABLE user TYPE string;",
    "",
  ].join("\n"),
);

const app = await electron.launch({
  executablePath: require("electron"),
  args: [appDir, "--no-sandbox", "--disable-gpu"],
  cwd: appDir,
  env: process.env, // honors SURREALQL_LSP override for the semantic-tokens build
});
const win = await app.firstWindow();
win.on("pageerror", (e) => console.log("[pageerror]", e.message));
await win.waitForSelector(".editor-empty-title");
console.log(
  "surql LSP available:",
  await win.evaluate(() => window.studio.surql.available()),
);

await win.evaluate(
  async ([dir, file]) => {
    await window.studio.fs.addRoot(dir);
    await window.__studio.getState().openFilePath(file);
  },
  [dir, file],
);
await win.waitForSelector(".editor-host .monaco-editor");
await win.waitForTimeout(1500);

const legend = [
  "keyword",
  "function",
  "parameter",
  "type",
  "string",
  "number",
  "comment",
  "variable",
];
let decoded = null;
for (let i = 0; i < 20; i++) {
  const res = await win.evaluate(() => {
    const m = window.__monaco.editor
      .getModels()
      .find((x) => x.uri.path.endsWith("sample.surql"));
    if (!m) return null;
    return window.studio.surql.request(
      "textDocument/semanticTokens/full",
      { textDocument: { uri: `file://${m.uri.path}` } },
      `file://${"/tmp/sz-semtok"}`,
    );
  });
  const data = res?.result?.data;
  if (data?.length) {
    const types = new Set();
    for (let k = 0; k < data.length; k += 5) types.add(legend[data[k + 3]]);
    decoded = { count: data.length / 5, types: [...types].sort() };
    break;
  }
  await win.waitForTimeout(400);
}

if (!decoded) {
  console.log(
    "semantic tokens: skipped (server returned none - needs a semanticTokens build)",
  );
} else {
  console.log("semantic tokens count:", decoded.count);
  console.log("types:", decoded.types.join(","));
  const want = [
    "comment",
    "function",
    "keyword",
    "number",
    "parameter",
    "string",
    "type",
    "variable",
  ];
  console.log(
    "all 8 legend types present:",
    want.every((t) => decoded.types.includes(t)),
  );
}
await win.screenshot({ path: "/tmp/sz-semtok.png" });
await app.close();
console.log("done");
