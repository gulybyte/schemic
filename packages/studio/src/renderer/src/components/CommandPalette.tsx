import { useEffect, useMemo, useRef, useState } from 'react'
import { allCommands, runCommand } from '../commands/registry'
import { useStudio } from '../store'

export function CommandPalette() {
  const open = useStudio((s) => s.paletteOpen)
  const setOpen = useStudio((s) => s.setPaletteOpen)
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const cmds = useMemo(() => {
    const all = allCommands()
    const term = q.trim().toLowerCase()
    if (!term) return all
    return all.filter((c) => `${c.category ?? ''} ${c.title}`.toLowerCase().includes(term))
  }, [q])

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset when opened
  useEffect(() => {
    if (open) {
      setQ('')
      setIdx(0)
      inputRef.current?.focus()
    }
  }, [open])

  if (!open) return null

  const choose = (i: number) => {
    const c = cmds[i]
    if (!c) return
    setOpen(false)
    void runCommand(c.id)
  }

  return (
    <div
      className="palette-scrim"
      onMouseDown={() => setOpen(false)}
      role="presentation"
    >
      <div className="palette" onMouseDown={(e) => e.stopPropagation()} role="presentation">
        <input
          ref={inputRef}
          className="palette-input"
          placeholder="Run a command…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setIdx(0)
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setIdx((i) => Math.min(i + 1, cmds.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setIdx((i) => Math.max(i - 1, 0))
            } else if (e.key === 'Enter') {
              e.preventDefault()
              choose(idx)
            } else if (e.key === 'Escape') {
              setOpen(false)
            }
          }}
        />
        <div className="palette-list">
          {cmds.map((c, i) => (
            <button
              type="button"
              key={c.id}
              className={`palette-item${i === idx ? ' active' : ''}`}
              onMouseEnter={() => setIdx(i)}
              onClick={() => choose(i)}
            >
              {c.category && <span className="palette-cat">{c.category}</span>}
              <span className="palette-title">{c.title}</span>
            </button>
          ))}
          {cmds.length === 0 && <div className="palette-empty">No matching commands</div>}
        </div>
      </div>
    </div>
  )
}
