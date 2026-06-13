// @ts-check
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { brandShikiTheme } from "./src/config/code-theme.mjs";

// The marketing landing lives at "/" (src/pages/index.astro). The docs are a
// bespoke shell (src/layouts/DocsLayout.astro + src/components/docs/**), hand-
// built to match design/website.pen. No Starlight: we own the chrome.
// Docs content is MDX (src/content/docs/**) rendered at /docs/<slug>.
export default defineConfig({
  site: "https://surreal-zod.dev",
  integrations: [mdx()],
  markdown: {
    // Brand syntax colors for plain ``` fences (CodeBlock shares this theme).
    // Shiki has no surql grammar; alias it to sql for DDL highlighting.
    shikiConfig: { theme: brandShikiTheme, langAlias: { surql: "sql" } },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
