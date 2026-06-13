// Capability interface: run SurrealQL and return results. Impls are chosen by the
// runtime profile (wasm in renderer, embedded/remote in main via IPC). Async so an
// impl can be in-process or IPC-backed transparently. (D34)

export type StatementResult = {
  status: 'OK' | 'ERR'
  time?: string
  result: unknown
}

export type QueryOutcome =
  | { ok: true; statements: StatementResult[]; elapsedMs: number }
  | { ok: false; error: string }

export interface QueryEngine {
  readonly id: string
  /** Idempotent; resolves once the engine is connected + seeded. */
  ready(): Promise<void>
  query(sql: string): Promise<QueryOutcome>
}
