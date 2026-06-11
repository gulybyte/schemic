# SurrealQL Statement Reference (mirrored)

Offline, verbatim mirror of the SurrealDB 3.x SurrealQL statement reference, one file per docs page. Captured from https://surrealdb.com/docs/reference/query-language/statements (the `/docs/surrealql/statements` path redirects here). Each file contains the verbatim formal grammar (in fenced `surql` blocks), clause descriptions, and representative examples.

Generated for building the migration engine. Grammar blocks are copied verbatim; surrounding prose is reformatted to markdown.

## ALTER family

| File | Statement | Source | Purpose |
| --- | --- | --- | --- |
| [ALTER-ACCESS.md](./ALTER-ACCESS.md) | ALTER ACCESS | https://surrealdb.com/docs/reference/query-language/statements/alter/access | Modify a defined access method. |
| [ALTER-ANALYZER.md](./ALTER-ANALYZER.md) | ALTER ANALYZER | https://surrealdb.com/docs/reference/query-language/statements/alter/analyzer | Modify a defined full-text analyzer. |
| [ALTER-API.md](./ALTER-API.md) | ALTER API | https://surrealdb.com/docs/reference/query-language/statements/alter/api | Modify a defined API endpoint. |
| [ALTER-BUCKET.md](./ALTER-BUCKET.md) | ALTER BUCKET | https://surrealdb.com/docs/reference/query-language/statements/alter/bucket | Modify a defined storage bucket. |
| [ALTER-CONFIG.md](./ALTER-CONFIG.md) | ALTER CONFIG | https://surrealdb.com/docs/reference/query-language/statements/alter/config | Modify a defined config (e.g. GraphQL / API). |
| [ALTER-DATABASE.md](./ALTER-DATABASE.md) | ALTER DATABASE | https://surrealdb.com/docs/reference/query-language/statements/alter/database | Modify the current database (comment, changefeed, compaction). |
| [ALTER-EVENT.md](./ALTER-EVENT.md) | ALTER EVENT | https://surrealdb.com/docs/reference/query-language/statements/alter/event | Modify a defined table event. |
| [ALTER-FIELD.md](./ALTER-FIELD.md) | ALTER FIELD | https://surrealdb.com/docs/reference/query-language/statements/alter/field | Modify or DROP individual clauses of a defined field (type, value, assert, default, etc.). |
| [ALTER-FUNCTION.md](./ALTER-FUNCTION.md) | ALTER FUNCTION | https://surrealdb.com/docs/reference/query-language/statements/alter/function | Modify a defined custom function. |
| [ALTER-INDEX.md](./ALTER-INDEX.md) | ALTER INDEX | https://surrealdb.com/docs/reference/query-language/statements/alter/indexes | Modify a defined index: comment and PREPARE REMOVE (staged decommission). |
| [ALTER-NAMESPACE.md](./ALTER-NAMESPACE.md) | ALTER NAMESPACE | https://surrealdb.com/docs/reference/query-language/statements/alter/namespace | Modify the current namespace. |
| [ALTER-PARAM.md](./ALTER-PARAM.md) | ALTER PARAM | https://surrealdb.com/docs/reference/query-language/statements/alter/param | Modify a defined database parameter. |
| [ALTER-SEQUENCE.md](./ALTER-SEQUENCE.md) | ALTER SEQUENCE | https://surrealdb.com/docs/reference/query-language/statements/alter/sequence | Modify a defined sequence. |
| [ALTER-SYSTEM.md](./ALTER-SYSTEM.md) | ALTER SYSTEM | https://surrealdb.com/docs/reference/query-language/statements/alter/system | System-wide alteration (e.g. datastore compaction). |
| [ALTER-TABLE.md](./ALTER-TABLE.md) | ALTER TABLE | https://surrealdb.com/docs/reference/query-language/statements/alter/table | Modify a defined table: schemafull/less, permissions, changefeed, comment, compaction. |
| [ALTER-USER.md](./ALTER-USER.md) | ALTER USER | https://surrealdb.com/docs/reference/query-language/statements/alter/user | Modify a defined system user. |
| [ALTER.md](./ALTER.md) | ALTER | https://surrealdb.com/docs/reference/query-language/statements/alter/overview | Overview of the ALTER family (modify existing schema resources). |

## DEFINE family

| File | Statement | Source | Purpose |
| --- | --- | --- | --- |
| [DEFINE-ACCESS-BEARER.md](./DEFINE-ACCESS-BEARER.md) | DEFINE ACCESS ... TYPE BEARER | https://surrealdb.com/docs/reference/query-language/statements/define/access/bearer | DEFINE ACCESS ... TYPE BEARER (bearer-key access grants). |
| [DEFINE-ACCESS-JWT.md](./DEFINE-ACCESS-JWT.md) | DEFINE ACCESS ... TYPE JWT | https://surrealdb.com/docs/reference/query-language/statements/define/access/jwt | DEFINE ACCESS ... TYPE JWT (JWT verification access). |
| [DEFINE-ACCESS-RECORD.md](./DEFINE-ACCESS-RECORD.md) | DEFINE ACCESS ... TYPE RECORD | https://surrealdb.com/docs/reference/query-language/statements/define/access/record | DEFINE ACCESS ... TYPE RECORD (record/signup-signin access). |
| [DEFINE-ACCESS.md](./DEFINE-ACCESS.md) | DEFINE ACCESS | https://surrealdb.com/docs/reference/query-language/statements/define/access | Define an access method (overview of JWT/RECORD/BEARER types). |
| [DEFINE-ANALYZER.md](./DEFINE-ANALYZER.md) | DEFINE ANALYZER | https://surrealdb.com/docs/reference/query-language/statements/define/analyzer | Define a full-text search analyzer (tokenizers + filters). |
| [DEFINE-API.md](./DEFINE-API.md) | DEFINE API | https://surrealdb.com/docs/reference/query-language/statements/define/api | Define an HTTP API endpoint with middleware and handlers. |
| [DEFINE-BUCKET.md](./DEFINE-BUCKET.md) | DEFINE BUCKET | https://surrealdb.com/docs/reference/query-language/statements/define/bucket | Define a file-storage bucket backend. |
| [DEFINE-CONFIG.md](./DEFINE-CONFIG.md) | DEFINE CONFIG | https://surrealdb.com/docs/reference/query-language/statements/define/config | Define config for GraphQL or the API gateway. |
| [DEFINE-DATABASE.md](./DEFINE-DATABASE.md) | DEFINE DATABASE | https://surrealdb.com/docs/reference/query-language/statements/define/database | Define a database (within a namespace). |
| [DEFINE-EVENT.md](./DEFINE-EVENT.md) | DEFINE EVENT | https://surrealdb.com/docs/reference/query-language/statements/define/event | Define a table event triggered on create/update/delete. |
| [DEFINE-FIELD.md](./DEFINE-FIELD.md) | DEFINE FIELD | https://surrealdb.com/docs/reference/query-language/statements/define/field | Define a field: type, default, value, assert, readonly, reference, permissions. |
| [DEFINE-FUNCTION.md](./DEFINE-FUNCTION.md) | DEFINE FUNCTION | https://surrealdb.com/docs/reference/query-language/statements/define/function | Define a custom SurrealQL function. |
| [DEFINE-INDEX.md](./DEFINE-INDEX.md) | DEFINE INDEX | https://surrealdb.com/docs/reference/query-language/statements/define/indexes | Define an index: UNIQUE, COUNT, FULLTEXT, HNSW, MTREE, CONCURRENTLY. |
| [DEFINE-MODULE.md](./DEFINE-MODULE.md) | DEFINE MODULE | https://surrealdb.com/docs/reference/query-language/statements/define/module | Define a Surrealism (WASM) extension module (experimental). |
| [DEFINE-NAMESPACE.md](./DEFINE-NAMESPACE.md) | DEFINE NAMESPACE | https://surrealdb.com/docs/reference/query-language/statements/define/namespace | Define a namespace. |
| [DEFINE-PARAM.md](./DEFINE-PARAM.md) | DEFINE PARAM | https://surrealdb.com/docs/reference/query-language/statements/define/param | Define a global database parameter. |
| [DEFINE-SCOPE.md](./DEFINE-SCOPE.md) | DEFINE SCOPE (deprecated) | https://surrealdb.com/docs/reference/query-language/statements/define/scope | Legacy DEFINE SCOPE (deprecated; replaced by DEFINE ACCESS TYPE RECORD). |
| [DEFINE-SEQUENCE.md](./DEFINE-SEQUENCE.md) | DEFINE SEQUENCE | https://surrealdb.com/docs/reference/query-language/statements/define/sequence | Define a monotonic sequence generator. |
| [DEFINE-TABLE.md](./DEFINE-TABLE.md) | DEFINE TABLE | https://surrealdb.com/docs/reference/query-language/statements/define/table | Define a table: schema mode, type (normal/relation), permissions, views, changefeed. |
| [DEFINE-TOKEN.md](./DEFINE-TOKEN.md) | DEFINE TOKEN (deprecated) | https://surrealdb.com/docs/reference/query-language/statements/define/token | Legacy DEFINE TOKEN (deprecated; replaced by DEFINE ACCESS TYPE JWT). |
| [DEFINE-USER.md](./DEFINE-USER.md) | DEFINE USER | https://surrealdb.com/docs/reference/query-language/statements/define/user | Define a system user (root/namespace/database) with role and password. |
| [DEFINE.md](./DEFINE.md) | DEFINE | https://surrealdb.com/docs/reference/query-language/statements/define/overview | Overview / index of the DEFINE family. |

## Data and query statements

| File | Statement | Source | Purpose |
| --- | --- | --- | --- |
| [ACCESS.md](./ACCESS.md) | ACCESS | https://surrealdb.com/docs/reference/query-language/statements/access | ACCESS statement: manage bearer/record access grants (GRANT/REVOKE/PURGE/SHOW). |
| [CREATE.md](./CREATE.md) | CREATE | https://surrealdb.com/docs/reference/query-language/statements/create | Create records with explicit content. |
| [DELETE.md](./DELETE.md) | DELETE | https://surrealdb.com/docs/reference/query-language/statements/delete | Delete records. |
| [INFO.md](./INFO.md) | INFO | https://surrealdb.com/docs/reference/query-language/statements/info | Introspect schema info for root/ns/db/table/user. |
| [INSERT.md](./INSERT.md) | INSERT | https://surrealdb.com/docs/reference/query-language/statements/insert | Insert records (with ON DUPLICATE KEY UPDATE / bulk / relation support). |
| [REBUILD.md](./REBUILD.md) | REBUILD | https://surrealdb.com/docs/reference/query-language/statements/rebuild | Rebuild a defined index. |
| [RELATE.md](./RELATE.md) | RELATE | https://surrealdb.com/docs/reference/query-language/statements/relate | Create graph edges between records. |
| [REMOVE.md](./REMOVE.md) | REMOVE | https://surrealdb.com/docs/reference/query-language/statements/remove | Remove (drop) any defined schema resource. |
| [SELECT.md](./SELECT.md) | SELECT | https://surrealdb.com/docs/reference/query-language/statements/select | Query records with filtering, graph traversal, aggregation, and fetching. |
| [UPDATE.md](./UPDATE.md) | UPDATE | https://surrealdb.com/docs/reference/query-language/statements/update | Update existing records (CONTENT/MERGE/PATCH/SET). |
| [UPSERT.md](./UPSERT.md) | UPSERT | https://surrealdb.com/docs/reference/query-language/statements/upsert | Create-or-update records by id. |
| [USE.md](./USE.md) | USE | https://surrealdb.com/docs/reference/query-language/statements/use | Select the active namespace and database. |

## Control flow

| File | Statement | Source | Purpose |
| --- | --- | --- | --- |
| [BREAK.md](./BREAK.md) | BREAK | https://surrealdb.com/docs/reference/query-language/statements/break | Break out of a FOR loop. |
| [CONTINUE.md](./CONTINUE.md) | CONTINUE | https://surrealdb.com/docs/reference/query-language/statements/continue | Skip to the next FOR iteration. |
| [FOR.md](./FOR.md) | FOR | https://surrealdb.com/docs/reference/query-language/statements/for | Iterate over an array/collection. |
| [IF-ELSE.md](./IF-ELSE.md) | IF ELSE | https://surrealdb.com/docs/reference/query-language/statements/if-else | Conditional control flow. |
| [LET.md](./LET.md) | LET | https://surrealdb.com/docs/reference/query-language/statements/let | Define a session/query parameter. |
| [RETURN.md](./RETURN.md) | RETURN | https://surrealdb.com/docs/reference/query-language/statements/return | Return a value from a query/function. |
| [SLEEP.md](./SLEEP.md) | SLEEP | https://surrealdb.com/docs/reference/query-language/statements/sleep | Pause execution for a duration. |
| [THROW.md](./THROW.md) | THROW | https://surrealdb.com/docs/reference/query-language/statements/throw | Raise a custom error. |

## Live queries and changefeeds

| File | Statement | Source | Purpose |
| --- | --- | --- | --- |
| [EXPLAIN.md](./EXPLAIN.md) | EXPLAIN | https://surrealdb.com/docs/reference/query-language/statements/explain | Explain a query plan (SELECT ... EXPLAIN). |
| [KILL.md](./KILL.md) | KILL | https://surrealdb.com/docs/reference/query-language/statements/kill | Terminate a running live query. |
| [LIVE-SELECT.md](./LIVE-SELECT.md) | LIVE SELECT | https://surrealdb.com/docs/reference/query-language/statements/live-select | Subscribe to live query result changes. |
| [SHOW.md](./SHOW.md) | SHOW | https://surrealdb.com/docs/reference/query-language/statements/show | Show changefeed changes since a timestamp/version. |

## Transactions

| File | Statement | Source | Purpose |
| --- | --- | --- | --- |
| [BEGIN-COMMIT-CANCEL.md](./BEGIN-COMMIT-CANCEL.md) | BEGIN / COMMIT / CANCEL | https://surrealdb.com/docs/reference/query-language/statements/begin (+commit, +cancel) | Transaction control: BEGIN, COMMIT, CANCEL. |

## Notes

- `DEFINE SCOPE` and `DEFINE TOKEN` are deprecated legacy statements (superseded by `DEFINE ACCESS`); captured for completeness.
- `DEFINE-MODULE.md` is `DEFINE MODULE` (Surrealism WASM extensions, experimental). The docs sidebar lists no separate `DEFINE MODEL` page.
- The statements overview page is at https://surrealdb.com/docs/reference/query-language/statements/overview (not mirrored as a file; this README is the index).
- No pages failed to load; every source page returned HTTP 200.
