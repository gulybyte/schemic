import { createWasmEngines } from '@surrealdb/wasm'
import { Surreal } from 'surrealdb'
import type { QueryEngine, QueryOutcome, StatementResult } from '../QueryEngine'

// Playground/sandbox engine: an ephemeral in-memory SurrealDB running in the
// renderer via WebAssembly. Seeded so the default query returns rows. (D34)
const SEED = `
CREATE user:ada    SET name = 'Ada Lovelace',   email = 'ada@calc.io',      age = 36;
CREATE user:alan   SET name = 'Alan Turing',    email = 'alan@ml.dev',      age = 41;
CREATE user:grace  SET name = 'Grace Hopper',   email = 'grace@navy.mil',   age = 38;
CREATE user:linus  SET name = 'Linus Torvalds', email = 'linus@kernel.org', age = 29;
CREATE user:junior SET name = 'Ada Junior',     email = 'junior@calc.io',   age = 12;
`

export class WasmQueryEngine implements QueryEngine {
  readonly id = 'wasm'
  private db: Surreal | null = null
  private initPromise: Promise<void> | null = null

  ready(): Promise<void> {
    if (!this.initPromise) this.initPromise = this.init()
    return this.initPromise
  }

  private async init(): Promise<void> {
    const db = new Surreal({ engines: createWasmEngines() })
    await db.connect('mem://')
    await db.use({ namespace: 'reverie', database: 'playground' })
    await db.query(SEED)
    this.db = db
  }

  async query(sql: string): Promise<QueryOutcome> {
    const started = performance.now()
    try {
      await this.ready()
      const raw = (await this.db!.query(sql)) as unknown[]
      const statements: StatementResult[] = raw.map((result) => ({
        status: 'OK',
        result,
      }))
      return { ok: true, statements, elapsedMs: performance.now() - started }
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e)
      return { ok: false, error }
    }
  }
}
