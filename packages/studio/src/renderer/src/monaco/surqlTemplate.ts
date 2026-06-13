import type * as Monaco from "monaco-editor";
import type { editor as MonacoEditor } from "monaco-editor";
import { SURQL_KEYWORDS } from "./setup";

// Embedded SurrealQL highlighting inside surql`...` tagged template literals in TS/JS
// schema files. Monaco's built-in TS grammar isn't ours to extend, so we overlay colored
// inline decorations: find each surql`...` region, tokenize the inner SurrealQL, and color
// keywords / fns / strings / params / numbers / comments to match the SurrealQL theme.

const KEYWORDS = new Set(SURQL_KEYWORDS.map((k) => k.toUpperCase()));

// Whole surql`...` template (no nested backticks — typical for surql usage). `s` so it
// spans multiple lines; the inner content is capture group 1.
const TEMPLATE_RE = /\bsurql`((?:[^`\\]|\\.)*)`/gs;

// One pass over the inner SurrealQL, in priority order.
const TOKEN_RE = new RegExp(
  [
    /(?<comment>--[^\n]*|#[^\n]*|\/\/[^\n]*)/,
    /(?<string>'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/,
    /(?<fn>[a-zA-Z_]\w*(?:::[a-zA-Z_]\w*)+)/,
    /(?<param>\$[a-zA-Z_]\w*)/,
    /(?<number>\b\d+(?:\.\d+)?\b)/,
    /(?<word>[a-zA-Z_]\w*)/,
  ]
    .map((r) => r.source)
    .join("|"),
  "g",
);

function classFor(groups: Record<string, string | undefined>): string | null {
  if (groups.comment) return "surql-t-comment";
  if (groups.string) return "surql-t-string";
  if (groups.fn) return "surql-t-fn";
  if (groups.param) return "surql-t-param";
  if (groups.number) return "surql-t-number";
  if (groups.word)
    return KEYWORDS.has(groups.word.toUpperCase()) ? "surql-t-keyword" : null;
  return null;
}

const TS_LANGS = new Set(["typescript", "javascript"]);

/** Wire surql-template highlighting onto an editor for the lifetime of the editor. */
export function installSurqlTemplateHighlight(
  editor: MonacoEditor.IStandaloneCodeEditor,
  monaco: typeof Monaco,
): void {
  const collection = editor.createDecorationsCollection();
  let timer: ReturnType<typeof setTimeout> | null = null;

  const compute = () => {
    const model = editor.getModel();
    if (!model || !TS_LANGS.has(model.getLanguageId())) {
      collection.clear();
      return;
    }
    const text = model.getValue();
    const decorations: MonacoEditor.IModelDeltaDecoration[] = [];
    for (const tpl of text.matchAll(TEMPLATE_RE)) {
      const inner = tpl[1];
      if (inner === undefined) continue;
      const base = (tpl.index ?? 0) + (tpl[0].length - inner.length - 1);
      for (const tok of inner.matchAll(TOKEN_RE)) {
        const cls = classFor(tok.groups ?? {});
        if (!cls) continue;
        const start = base + (tok.index ?? 0);
        const end = start + tok[0].length;
        decorations.push({
          range: monaco.Range.fromPositions(
            model.getPositionAt(start),
            model.getPositionAt(end),
          ),
          options: { inlineClassName: cls },
        });
      }
    }
    collection.set(decorations);
  };

  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(compute, 150);
  };

  editor.onDidChangeModelContent(schedule);
  editor.onDidChangeModel(compute);
  compute();
}
