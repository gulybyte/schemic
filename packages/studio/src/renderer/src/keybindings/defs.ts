// Built-in keybindings. Importing this module registers them (side effect).
import { registerKeybinding } from "./registry";

registerKeybinding({ keys: "Mod+K", command: "command.palette" });
registerKeybinding({ keys: "Mod+Shift+P", command: "command.palette" });
registerKeybinding({ keys: "Mod+O", command: "file.open" });
registerKeybinding({ keys: "Mod+S", command: "file.save" });
