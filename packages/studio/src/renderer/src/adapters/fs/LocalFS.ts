import type { DirEntry, FileSystem } from "../FileSystem";

// Desktop filesystem: proxies to the main process over IPC (main owns node:fs and
// enforces the allowed-roots scoping). The web playground will use a VirtualFS instead.
export class LocalFS implements FileSystem {
  readonly id = "local";
  private get bridge() {
    const fs = window.studio?.fs;
    if (!fs) throw new Error("filesystem unavailable (no main process)");
    return fs;
  }
  readFile(path: string): Promise<string> {
    return this.bridge.read(path);
  }
  writeFile(path: string, content: string): Promise<void> {
    return this.bridge.write(path, content);
  }
  readDir(path: string): Promise<DirEntry[]> {
    return this.bridge.readdir(path);
  }
  exists(path: string): Promise<boolean> {
    return this.bridge.exists(path);
  }
}
