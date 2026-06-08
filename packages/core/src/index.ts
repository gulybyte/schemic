/**
 * surreal-zod — author SurrealDB schemas with Zod.
 *
 * Define tables/relations with `sz.*` (a drop-in for `z.*`), generate SurrealQL
 * DDL, and map JS <-> DB across Zod's two channels via codecs (`decode`/`encode`).
 */

export type { DefineOptions, DefineStatement } from "./ddl";
export {
  emitField,
  emitFieldStatements,
  emitStatements,
  emitTable,
  overwriteStatement,
  removeStatement,
} from "./ddl";
export type {
  App,
  Create,
  Shape,
  SurrealMeta,
  TableConfig,
  TableIndex,
  Update,
  Wire,
} from "./pure";
export {
  defineRelation,
  defineTable,
  objectFieldsRegistry,
  RecordIdField,
  RelationDef,
  SField,
  SystemView,
  surrealTypeRegistry,
  sz,
  TableDef,
} from "./pure";
