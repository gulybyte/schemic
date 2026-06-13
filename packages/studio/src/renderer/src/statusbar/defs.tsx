import {
  Check,
  CircleX,
  Database,
  GitBranch,
  TriangleAlert,
} from "lucide-react";
import { registerSegment } from "./registry";

// Built-in status-bar segments — canonical spec from design/app.pen (design-expert, D38).
// Data is placeholder until wired to real state (git/migrations/connection/editor);
// each segment renders its multi-status states from that state once available.

const isDesktop = typeof window !== "undefined" && !!window.studio;

// LEFT — repo group
function Branch() {
  if (!isDesktop) return null; // desktop-only (web WASM sandbox has no git/fs)
  const dirty = false;
  return (
    <span className={`status-seg${dirty ? " seg-amber" : ""}`}>
      <GitBranch size={12} />
      {dirty ? "main *" : "main"}
    </span>
  );
}

function Migrations() {
  const pending = 0;
  return pending > 0 ? (
    <span className="status-seg seg-amber">{pending} pending</span>
  ) : (
    <span className="status-seg seg-green">
      <Check size={12} />
      up to date
    </span>
  );
}

// LEFT — db group
function NsDb() {
  // states: selected 'ns / db' | namespace-only 'ns / —' | none 'no database' | branched 'ns / db:preview'
  return (
    <span className="status-seg">
      <Database size={12} />
      test / app
    </span>
  );
}

// LEFT — diagnostics group
function Problems() {
  const errors = 0;
  const warnings = 0;
  const quiet = errors === 0 && warnings === 0;
  return (
    <span className={`status-seg${quiet ? " seg-muted" : ""}`}>
      <CircleX size={12} className={quiet ? undefined : "seg-red"} />
      {errors}
      <TriangleAlert size={12} className={quiet ? undefined : "seg-amber"} />
      {warnings}
    </span>
  );
}

// RIGHT — editor segments (contextual: shown when an editor is focused; static for now)
function Language() {
  return <span className="status-mono">SurrealQL</span>;
}
function Cursor() {
  return <span className="status-mono">Ln 6, Col 14</span>;
}
function Indentation() {
  return <span className="status-mono">Spaces: 2</span>;
}
function Encoding() {
  return <span className="status-mono">UTF-8</span>;
}

registerSegment({
  id: "branch",
  side: "left",
  group: "repo",
  title: "Git branch",
  Component: Branch,
});
registerSegment({
  id: "migrations",
  side: "left",
  group: "repo",
  title: "Migrations",
  Component: Migrations,
});
registerSegment({
  id: "ns-db",
  side: "left",
  group: "db",
  title: "Namespace / Database",
  Component: NsDb,
});
registerSegment({
  id: "problems",
  side: "left",
  group: "diagnostics",
  title: "Errors & warnings",
  Component: Problems,
});
registerSegment({
  id: "language",
  side: "right",
  group: "lang",
  title: "Language mode",
  Component: Language,
});
registerSegment({
  id: "cursor",
  side: "right",
  group: "cursor",
  title: "Cursor position",
  Component: Cursor,
});
registerSegment({
  id: "indentation",
  side: "right",
  group: "editor",
  title: "Indentation",
  Component: Indentation,
});
registerSegment({
  id: "encoding",
  side: "right",
  group: "editor",
  title: "Encoding",
  Component: Encoding,
});
