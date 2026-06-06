/**
 * surreal-zod — author SurrealDB schemas with Zod.
 *
 * Define tables/relations with `sz.*` (a drop-in for `z.*`), generate SurrealQL
 * DDL, and map JS <-> DB across Zod's two channels via codecs (`decode`/`encode`).
 */
export {
  objectFieldsRegistry,
  RecordIdField,
  relation,
  SField,
  surrealTypeRegistry,
  sz,
  table,
  TableDef,
} from "./pure";
export type { App, Create, Shape, SurrealMeta, TableConfig, Update, Wire } from "./pure";
export { defineField, defineTable } from "./ddl";
export type { DefineOptions } from "./ddl";
