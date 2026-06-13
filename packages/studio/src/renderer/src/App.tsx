import { useEffect, useState } from 'react'
import { runCommand } from './commands/registry'
import { ActivityRail } from './components/ActivityRail'
import { Chrome } from './components/Chrome'
import { CommandPalette } from './components/CommandPalette'
import { StatusBar } from './components/StatusBar'
import { Workbench } from './workbench/Workbench'

export function App() {
  const [active, setActive] = useState('')

  // Global Cmd/Ctrl+K → command palette (capture so it wins over the editor).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        e.stopPropagation()
        void runCommand('command.palette')
      }
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [])

  return (
    <div className="app">
      <Chrome />
      <div className="body">
        <ActivityRail active={active} onSelect={setActive} />
        <main className="workbench">
          <Workbench />
        </main>
      </div>
      <StatusBar />
      <CommandPalette />
    </div>
  )
}
