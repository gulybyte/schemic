/**
 * surreal-zod brand Shiki theme (dark). Shared by:
 *  - Markdown fenced code blocks (astro.config markdown.shikiConfig)
 *  - the CodeBlock component (slotted fences / astro:components Code)
 * so a plain ```ts fence and a <CodeBlock> render with identical colors.
 * Hexes mirror the code tokens in src/styles/tokens.css.
 */
export const brandShikiTheme = {
  name: "surreal-zod-dark",
  type: "dark",
  colors: {
    "editor.background": "#100d18",
    "editor.foreground": "#d8d3e4",
  },
  settings: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#5d5670", fontStyle: "italic" },
    },
    {
      scope: [
        "keyword",
        "storage",
        "storage.type",
        "storage.modifier",
        "keyword.control",
        "keyword.operator.new",
        "keyword.operator.expression",
        "keyword.other",
        "constant.language",
        "variable.language",
      ],
      settings: { foreground: "#c77dff" },
    },
    {
      scope: ["entity.name.function", "support.function", "variable.function"],
      settings: { foreground: "#7bd0ff" },
    },
    {
      scope: [
        "entity.name.type",
        "entity.name.class",
        "support.type",
        "support.class",
        "entity.other.inherited-class",
        "storage.type.built-in",
      ],
      settings: { foreground: "#9fe3b0" },
    },
    {
      scope: [
        "string",
        "string.quoted",
        "string.template",
        "constant.other.symbol",
        "punctuation.definition.string",
      ],
      settings: { foreground: "#ff85d6" },
    },
    {
      scope: ["constant.numeric", "constant.language.boolean"],
      settings: { foreground: "#9fe3b0" },
    },
    {
      scope: [
        "variable",
        "variable.other",
        "meta.definition.variable",
        "meta.object-literal.key",
        "support.variable.property",
      ],
      settings: { foreground: "#d8d3e4" },
    },
  ],
};
