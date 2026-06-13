// Command registry (D36/D37). The single addressable surface of "what the app can
// do" — used by the Cmd/K palette, keybindings, (future) menus, and both assistant
// paths (the MCP server and the integrated Sidekick invoke commands by id).

export interface CommandDef {
  id: string;
  title: string;
  category?: string;
  run: () => void | Promise<void>;
  // when?: () => boolean  // contextual enablement — added later
}

const registry = new Map<string, CommandDef>();

export function registerCommand(def: CommandDef): CommandDef {
  registry.set(def.id, def);
  return def;
}

export function getCommand(id: string): CommandDef | undefined {
  return registry.get(id);
}

export function allCommands(): CommandDef[] {
  return [...registry.values()];
}

export async function runCommand(id: string): Promise<void> {
  const cmd = registry.get(id);
  if (!cmd) {
    console.warn("[command] unknown command:", id);
    return;
  }
  await cmd.run();
}
