// Monaco wiring for Electron/Vite: bundle the workers locally (no CDN), point
// @monaco-editor/react at the local monaco, register a minimal SurrealQL
// language, and define the Reverie brand theme.
import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

self.MonacoEnvironment = {
  getWorker(_workerId, label) {
    if (label === "json") return new jsonWorker();
    if (label === "css" || label === "scss" || label === "less")
      return new cssWorker();
    if (label === "html" || label === "handlebars" || label === "razor")
      return new htmlWorker();
    if (label === "typescript" || label === "javascript") return new tsWorker();
    return new editorWorker();
  },
};

// Minimal SurrealQL language (highlighting only for now; LSP comes later).
const SURQL_KEYWORDS = [
  "SELECT",
  "FROM",
  "WHERE",
  "ORDER",
  "BY",
  "GROUP",
  "LIMIT",
  "START",
  "FETCH",
  "SPLIT",
  "AS",
  "ASC",
  "DESC",
  "AND",
  "OR",
  "NOT",
  "IN",
  "CONTAINS",
  "CREATE",
  "UPDATE",
  "DELETE",
  "RELATE",
  "INSERT",
  "UPSERT",
  "CONTENT",
  "SET",
  "MERGE",
  "RETURN",
  "DEFINE",
  "TABLE",
  "FIELD",
  "INDEX",
  "EVENT",
  "FUNCTION",
  "ACCESS",
  "ON",
  "TYPE",
  "ASSERT",
  "DEFAULT",
  "VALUE",
  "PERMISSIONS",
  "SCHEMAFULL",
  "SCHEMALESS",
  "UNIQUE",
  "FLEXIBLE",
  "IF",
  "ELSE",
  "FOR",
  "LET",
  "BEGIN",
  "COMMIT",
  "TRANSACTION",
  "WITH",
  "INFO",
];

if (!monaco.languages.getLanguages().some((l) => l.id === "surrealql")) {
  monaco.languages.register({ id: "surrealql" });
  monaco.languages.setMonarchTokensProvider("surrealql", {
    ignoreCase: true,
    keywords: SURQL_KEYWORDS,
    tokenizer: {
      root: [
        [/--.*$/, "comment"],
        [/#.*$/, "comment"],
        [/->|<-|<->/, "operator.graph"],
        [/[a-zA-Z_]\w*(?=::)/, "predefined"],
        [/::[a-zA-Z_]\w*/, "predefined"],
        [
          /[a-zA-Z_]\w*/,
          { cases: { "@keywords": "keyword", "@default": "identifier" } },
        ],
        [/"([^"\\]|\\.)*"/, "string"],
        [/'([^'\\]|\\.)*'/, "string"],
        [/\d+(\.\d+)?/, "number"],
        [/[;,.]/, "delimiter"],
        [/[<>=!+\-*/%]+/, "operator"],
      ],
    },
  });
}

monaco.editor.defineTheme("reverie-dark", {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "", foreground: "d8d3e4" },
    { token: "comment", foreground: "5d5670", fontStyle: "italic" },
    { token: "keyword", foreground: "c77dff" },
    { token: "operator", foreground: "aaa1bb" },
    { token: "operator.graph", foreground: "7bd0ff" },
    { token: "predefined", foreground: "7bd0ff" },
    { token: "string", foreground: "ff85d6" },
    { token: "number", foreground: "9fe3b0" },
    { token: "type", foreground: "9fe3b0" },
    { token: "identifier", foreground: "d8d3e4" },
    { token: "delimiter", foreground: "aaa1bb" },
  ],
  colors: {
    "editor.background": "#100d18",
    "editor.foreground": "#d8d3e4",
    "editorLineNumber.foreground": "#5d5670",
    "editorLineNumber.activeForeground": "#aaa1bb",
    "editor.lineHighlightBackground": "#ffffff08",
    "editor.selectionBackground": "#9600ff40",
    "editorCursor.foreground": "#c77dff",
    "editorIndentGuide.background1": "#211b2d",
    "editorWidget.background": "#16131f",
    "editorWidget.border": "#2a2438",
    "input.background": "#13101c",
    focusBorder: "#9600ff",
  },
});

// TypeScript worker config for schema files. The worker runs in the browser with no
// filesystem, so bare specifiers (`surreal-zod`, `surrealdb`, `zod`) can't be resolved —
// without help every schema file shows a false "Cannot find module" (ts2792). Ambient
// module declarations make those imports resolve (typed as any for now). Loading the
// real .d.ts graph for proper sz.* autocomplete is a follow-up.
//
// `monaco.languages.typescript` is typed as deprecated in the ESM build (the full
// namespace lives in the global d.ts), so reach it via a minimal cast + numeric enums.
const tsDefaults = (
  monaco.languages as unknown as {
    typescript: {
      typescriptDefaults: {
        setCompilerOptions(o: Record<string, unknown>): void;
        addExtraLib(content: string, filePath: string): void;
      };
    };
  }
).typescript.typescriptDefaults;
tsDefaults.setCompilerOptions({
  target: 99, // ESNext
  module: 99, // ESNext
  moduleResolution: 2, // NodeJs
  allowNonTsExtensions: true,
  esModuleInterop: true,
  skipLibCheck: true,
  noEmit: true,
  strict: false,
});
tsDefaults.addExtraLib(
  'declare module "surreal-zod";\ndeclare module "surrealdb";\ndeclare module "zod";\n',
  "file:///reverie/ambient-modules.d.ts",
);

loader.config({ monaco });
