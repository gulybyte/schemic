import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "electron-vite";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    root: "src/renderer",
    base: "./",
    resolve: {
      alias: { "@": resolve("src/renderer/src") },
    },
    plugins: [react(), wasm(), topLevelAwait()],
    optimizeDeps: {
      exclude: ["@surrealdb/wasm"],
    },
    worker: {
      format: "es",
      plugins: () => [wasm(), topLevelAwait()],
    },
    build: {
      target: "esnext",
      chunkSizeWarningLimit: 4096,
      rollupOptions: {
        input: resolve("src/renderer/index.html"),
      },
    },
  },
});
