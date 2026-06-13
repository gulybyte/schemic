import { Check, ChevronDown, Folder, Moon } from 'lucide-react'
import { WindowControls } from './WindowControls'

// Canonical titlebar — Variation C (two-tier), from design/app.pen.
// Tier 1 = window chrome (the static app menus were removed; actions live in the
// command palette / future menus driven by the command registry).
// Tier 2 = project/connection context + drift + account.
export function TitleBarC() {
  return (
    <div className="tb-c">
      <div className="tb-c-tier1">
        <div className="tb-c-left no-drag">
          <span className="tb-logo">
            <Moon size={10} />
          </span>
          <span className="tb-wordmark">Reverie</span>
        </div>
        <div className="tb-spacer" />
        <WindowControls />
      </div>
      <div className="tb-c-tier2">
        <button type="button" className="ctx-switcher no-drag">
          <span className="ctx-glyph">
            <Folder size={10} />
          </span>
          <span className="ctx-ws">Personal</span>
          <span className="ctx-sep">/</span>
          <span className="ctx-name">credilisto</span>
          <ChevronDown size={14} className="muted" />
        </button>
        <button type="button" className="ctx-switcher no-drag">
          <span className="conn-dot2" />
          <span className="ctx-env">dev</span>
          <span className="ctx-endpoint">ws://localhost:8000</span>
          <ChevronDown size={14} className="muted" />
        </button>
        <div className="tb-spacer" />
        <button type="button" className="drift-chip no-drag">
          <Check size={13} />
          In sync
        </button>
        <button type="button" className="account-badge no-drag">
          M
        </button>
      </div>
    </div>
  )
}
