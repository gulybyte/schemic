import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Token resolver: parses theme.css :root so colors can be compared by token NAME on both
// sides (design manifest uses names; the build extractor resolves computed rgb() -> name).
// Comparing names (not raw hex) survives theme changes and yields readable diffs.

const here = dirname(fileURLToPath(import.meta.url));
const themeCss = readFileSync(
  join(here, "../../src/renderer/src/theme.css"),
  "utf8",
);

const nameToHex = {};
for (const m of themeCss.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g))
  nameToHex[m[1]] = m[2].toLowerCase();

// First name wins for a given hex (tokens are roughly 1:1; ties are rare).
const hexToName = {};
for (const [n, h] of Object.entries(nameToHex))
  if (!(h in hexToName)) hexToName[h] = n;

export function rgbToHex(s) {
  if (!s) return null;
  if (s === "transparent") return "transparent";
  if (s.startsWith("#")) return s.toLowerCase();
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (!m) return s;
  const parts = m[1]
    .split(/[ ,/]+/)
    .filter(Boolean)
    .map(Number);
  const [r, g, b, a = 1] = parts;
  if (a === 0) return "transparent";
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** Resolve a computed color (rgb()/hex/transparent) to a token name, or raw hex if unknown. */
export function toToken(value) {
  const hex = rgbToHex(value);
  if (hex === "transparent" || hex == null) return "transparent";
  return hexToName[hex] ?? hex;
}

export { hexToName, nameToHex };
