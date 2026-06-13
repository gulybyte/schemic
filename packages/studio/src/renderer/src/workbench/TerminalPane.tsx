// Static terminal pane matching canonical shell A (full-width, bottom). Becomes a
// real xterm + sz output stream in a later milestone (see PROGRESS.md).
const LINES: Array<Array<[string, string]>> = [
  [
    ["$ ", "m"],
    ["sz push --dry-run", "p"],
  ],
  [
    ["~ ", "a"],
    ["2 changes to apply to local-dev", "s"],
  ],
  [
    ["+ ", "g"],
    ["DEFINE FIELD bio ON user TYPE option<string>", "s"],
  ],
  [
    ["$ ", "m"],
    ["▋", "a"],
  ],
];

export function TerminalPane() {
  return (
    <div className="terminal-pane">
      <div className="term-head">
        <div className="term-tabs">
          <span className="term-tab active">Terminal</span>
          <span className="term-tab">Output</span>
          <span className="term-tab">Problems</span>
        </div>
        <div className="term-actions">
          <span className="term-shell">sz</span>
        </div>
      </div>
      <div className="term-body">
        {LINES.map((segs, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static demo content
          <div className="term-line" key={i}>
            {segs.map((seg, j) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static demo content
              <span className={`tok-${seg[1]}`} key={j}>
                {seg[0]}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
