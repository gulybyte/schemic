import { ChevronDown, Folder, Moon, Search } from 'lucide-react'
import { runCommand } from '../commands/registry'
import { WindowControls } from './WindowControls'

// Canonical titlebar — Variation B (switcher-centric, single tier), from design/app.pen.
// The collapsed "Menu" was removed; the search icon opens the command palette (Cmd/K).
export function TitleBarB() {
  return (
    <div className="tb-b">
      <div className="tb-b-left no-drag">
        <span className="tb-logo tb-logo-lg">
          <Moon size={15} />
        </span>
        <span className="tb-wordmark">Reverie</span>
      </div>
      <div className="tb-spacer" />
      <div className="tb-seg no-drag">
        <button type="button" className="tb-seg-part">
          <span className="ctx-glyph">
            <Folder size={10} />
          </span>
          <span className="ctx-ws">Personal</span>
          <span className="ctx-sep">/</span>
          <span className="ctx-name">credilisto</span>
          <ChevronDown size={14} className="muted" />
        </button>
        <span className="tb-seg-divider" />
        <button type="button" className="tb-seg-part">
          <span className="conn-dot2" />
          <span className="ctx-env">dev</span>
          <span className="ctx-endpoint">ws://localhost:8000</span>
          <ChevronDown size={14} className="muted" />
        </button>
      </div>
      <div className="tb-spacer" />
      <div className="tb-b-right no-drag">
        <button
          type="button"
          className="tb-icon-btn"
          aria-label="Command palette"
          onClick={() => runCommand('command.palette')}
        >
          <Search size={16} />
        </button>
        <button type="button" className="account-badge">
          M
        </button>
        <span className="tb-b-divider" />
        <WindowControls />
      </div>
    </div>
  )
}
