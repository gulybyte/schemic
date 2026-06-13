// Built-in commands. Importing this module registers them (side effect).
import { getSetting, useStudio } from '../store'
import { registerCommand } from './registry'

registerCommand({
  id: 'query.run',
  title: 'Run Query',
  category: 'Query',
  run: () => {
    void useStudio.getState().run()
  },
})

registerCommand({
  id: 'titlebar.switchStyle',
  title: 'Switch Title Bar Style (two-tier / switcher)',
  category: 'View',
  run: () => {
    const current = getSetting<'C' | 'B'>('titlebar.variant')
    useStudio.getState().setSetting('titlebar.variant', current === 'B' ? 'C' : 'B')
  },
})

registerCommand({
  id: 'command.palette',
  title: 'Command Palette',
  category: 'View',
  run: () => {
    const { paletteOpen, setPaletteOpen } = useStudio.getState()
    setPaletteOpen(!paletteOpen)
  },
})
