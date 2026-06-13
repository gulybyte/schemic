import { Command } from "cmdk";
import { allCommands, runCommand } from "../commands/registry";
import { useStudio } from "../store";

// Command palette built on cmdk — feeds the command registry; cmdk handles
// fuzzy filtering, keyboard nav, and accessibility.
export function CommandPalette() {
  const open = useStudio((s) => s.paletteOpen);
  const setOpen = useStudio((s) => s.setPaletteOpen);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      className="cmdk"
    >
      <Command.Input placeholder="Run a command…" />
      <Command.List>
        <Command.Empty>No matching commands</Command.Empty>
        {allCommands().map((c) => (
          <Command.Item
            key={c.id}
            value={`${c.category ?? ""} ${c.title}`}
            onSelect={() => {
              setOpen(false);
              void runCommand(c.id);
            }}
          >
            {c.category && <span className="palette-cat">{c.category}</span>}
            <span className="palette-title">{c.title}</span>
          </Command.Item>
        ))}
      </Command.List>
    </Command.Dialog>
  );
}
