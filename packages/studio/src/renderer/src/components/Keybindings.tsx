import { useHotkey } from '@tanstack/react-hotkeys'
import { runCommand } from '../commands/registry'
import { allKeybindings } from '../keybindings/registry'

// One binding = one component with a single useHotkey (avoids hooks-in-a-loop;
// the registry is static so the list length is constant across renders).
// Registry keys are dynamic strings; TanStack Hotkeys types the first arg as a
// literal-union of valid combos, so cast to its exact param type (runtime accepts the string).
type HotkeyArg = Parameters<typeof useHotkey>[0]

function Binding({ keys, command }: { keys: string; command: string }) {
  useHotkey(keys as HotkeyArg, () => {
    void runCommand(command)
  })
  return null
}

export function Keybindings() {
  return (
    <>
      {allKeybindings().map((kb) => (
        <Binding key={`${kb.keys}:${kb.command}`} keys={kb.keys} command={kb.command} />
      ))}
    </>
  )
}
