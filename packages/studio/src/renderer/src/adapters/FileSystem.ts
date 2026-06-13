// Capability interface: filesystem access. Impls are chosen by the runtime profile
// (LocalFS over IPC on desktop; VirtualFS in the web playground; remote/cloud later).
// Async so an impl can be in-process or IPC-backed transparently. (D34)

export interface DirEntry {
  name: string;
  isDir: boolean;
}

export interface FileSystem {
  readonly id: string;
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  readDir(path: string): Promise<DirEntry[]>;
  exists(path: string): Promise<boolean>;
}
