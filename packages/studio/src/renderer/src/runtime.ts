import { WasmQueryEngine } from './adapters/engines/WasmQueryEngine'
import { LocalFS } from './adapters/fs/LocalFS'
import type { FileSystem } from './adapters/FileSystem'
import type { QueryEngine } from './adapters/QueryEngine'

// Runtime profile: binds capability adapters for the active mode. For now there is
// one profile (playground = wasm in renderer). Desktop/remote profiles and the
// FileSystem/Terminal/SecretStore adapters are added as they are implemented. (D34)
let queryEngine: QueryEngine | null = null

export function getQueryEngine(): QueryEngine {
  if (!queryEngine) queryEngine = new WasmQueryEngine()
  return queryEngine
}

let fileSystem: FileSystem | null = null

export function getFileSystem(): FileSystem {
  if (!fileSystem) fileSystem = new LocalFS()
  return fileSystem
}
