import Editor from '@monaco-editor/react'
import { ChevronDown, Play } from 'lucide-react'
import { useState } from 'react'
import { runCommand } from '../commands/registry'
import { useStudio } from '../store'

export function EditorPanel() {
  const running = useStudio((s) => s.running)
  const setQuery = useStudio((s) => s.setQuery)

  return (
    <div className="panel editor-panel">
      <div className="editor-toolbar">
        <span className="editor-file">query.surql</span>
        <button
          type="button"
          className="run-btn editor-run"
          onClick={() => runCommand('query.run')}
          disabled={running}
        >
          <Play size={13} />
          {running ? 'Running…' : 'Run'}
          <kbd className="run-kbd">⌘↵</kbd>
        </button>
      </div>
      <div className="editor-host">
        <Editor
          height="100%"
          defaultLanguage="surrealql"
          defaultValue={useStudio.getState().query}
          theme="reverie-dark"
          onChange={(v) => setQuery(v ?? '')}
          onMount={(editor, monaco) => {
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
              void runCommand('query.run')
            })
          }}
          options={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            lineHeight: 21,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12 },
            renderLineHighlight: 'line',
            smoothScrolling: true,
            tabSize: 2,
            fontLigatures: true,
            overviewRulerLanes: 0,
            scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
          }}
        />
      </div>
    </div>
  )
}

function cell(v: unknown): string {
  if (v === null || v === undefined) return ''
  if (typeof v === 'object') {
    const s = String(v)
    return s === '[object Object]' ? JSON.stringify(v) : s
  }
  return String(v)
}

function ResultTable({ rows }: { rows: Array<Record<string, unknown>> }) {
  const cols: string[] = []
  for (const r of rows) for (const k of Object.keys(r)) if (!cols.includes(k)) cols.push(k)
  return (
    <div className="result-scroll">
      <table className="result-table">
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: rows have no stable key guaranteed
            <tr key={i}>
              {cols.map((c) => (
                <td key={c} className={c === 'id' ? 'cell-id' : ''}>
                  {cell(r[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ResultPanel() {
  const outcome = useStudio((s) => s.outcome)
  const running = useStudio((s) => s.running)
  const [format, setFormat] = useState<'Table' | 'JSON'>('Table')

  const last = outcome?.ok ? outcome.statements.at(-1)?.result : undefined
  const rows = Array.isArray(last) && last.every((x) => x && typeof x === 'object')
    ? (last as Array<Record<string, unknown>>)
    : null
  const meta = outcome?.ok
    ? `${rows ? rows.length : 1} ${rows && rows.length === 1 ? 'row' : 'rows'} · ${outcome.elapsedMs.toFixed(0)} ms`
    : outcome
      ? 'error'
      : 'ready'

  return (
    <div className="panel result-panel">
      <div className="result-header">
        <span className="result-meta">{running ? 'running…' : meta}</span>
        <button
          type="button"
          className="format-dropdown"
          onClick={() => setFormat((f) => (f === 'Table' ? 'JSON' : 'Table'))}
        >
          {format}
          <ChevronDown size={13} />
        </button>
      </div>
      {!outcome && !running && <div className="result-empty">Run a query (⌘↵) to see results.</div>}
      {outcome && !outcome.ok && <div className="result-error">{outcome.error}</div>}
      {outcome?.ok &&
        (format === 'JSON' ? (
          <pre className="result-json">{JSON.stringify(last, null, 2)}</pre>
        ) : rows ? (
          <ResultTable rows={rows} />
        ) : (
          <pre className="result-json">{JSON.stringify(last, null, 2)}</pre>
        ))}
    </div>
  )
}
