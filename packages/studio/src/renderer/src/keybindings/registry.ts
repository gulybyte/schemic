// Keybinding registry — maps key combos to command ids. Bindings are registered
// here and bound via TanStack Hotkeys (see components/Keybindings). Keeping them in a
// registry (not hardcoded listeners) makes them overridable + settings/MCP-visible later.
// Key syntax is TanStack Hotkeys': 'Mod' (Cmd/Ctrl), 'Shift', 'Enter', etc.

export interface KeybindingDef {
  keys: string;
  command: string;
}

const registry: KeybindingDef[] = [];

export function registerKeybinding(def: KeybindingDef): KeybindingDef {
  registry.push(def);
  return def;
}

export function allKeybindings(): KeybindingDef[] {
  return [...registry];
}
