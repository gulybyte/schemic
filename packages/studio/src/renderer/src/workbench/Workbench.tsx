import {
  DockviewReact,
  type DockviewReadyEvent,
  type IDockviewPanelProps,
} from 'dockview'
import { EditorPanel, ResultPanel } from './panels'
import { TerminalPane } from './TerminalPane'

const components = {
  editor: (_props: IDockviewPanelProps) => <EditorPanel />,
  result: (_props: IDockviewPanelProps) => <ResultPanel />,
}

function onReady(event: DockviewReadyEvent) {
  const editor = event.api.addPanel({
    id: 'editor',
    component: 'editor',
    title: 'query.surql',
  })
  event.api.addPanel({
    id: 'result',
    component: 'result',
    title: 'Result',
    position: { referencePanel: 'editor', direction: 'right' },
  })
  editor.api.setActive()
}

export function Workbench() {
  return (
    <div className="workbench-inner">
      <div className="dock-area">
        <DockviewReact
          className="dockview-theme-abyss sz-dockview"
          components={components}
          onReady={onReady}
        />
      </div>
      <TerminalPane />
    </div>
  )
}
