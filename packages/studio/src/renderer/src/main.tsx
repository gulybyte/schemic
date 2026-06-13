import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/geist'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import 'dockview/dist/styles/dockview.css'
import './monaco/setup'
import './theme.css'
import './commands/defs' // register built-in commands (side effect)
import './statusbar/defs' // register built-in status-bar segments (side effect)
import { App } from './App'
import { useStudio } from './store'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Run the default query once on load so the result pane isn't empty at start.
useStudio.getState().run()

// Dev/e2e seam: expose the store for inspection + automation.
;(window as unknown as { __studio?: typeof useStudio }).__studio = useStudio
