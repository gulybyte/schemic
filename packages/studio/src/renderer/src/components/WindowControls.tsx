import { Minus, Square, X } from 'lucide-react'

// Custom Reverie window controls. Rendered only in the Electron (frameless) build;
// the web build has no OS window controls (returns null).
export function WindowControls() {
  const win = window.studio?.window
  if (!win) return null
  return (
    <div className="win-ctls no-drag">
      <button type="button" className="win-ctl" aria-label="Minimize" onClick={() => win.minimize()}>
        <Minus size={16} />
      </button>
      <button type="button" className="win-ctl" aria-label="Maximize" onClick={() => win.maximize()}>
        <Square size={13} />
      </button>
      <button type="button" className="win-ctl close" aria-label="Close" onClick={() => win.close()}>
        <X size={16} />
      </button>
    </div>
  )
}
