# ALTER DATABASE

Source: https://surrealdb.com/docs/reference/query-language/statements/alter/database

The `ALTER DATABASE` statement can be used to modify the database. `ALTER DATABASE` is used on the current database, which is why a `IF EXISTS` clause does not exist.

## Statement syntax

## Syntax

```surql
ALTER DATABASE COMPACT
```

## COMPACT

Performs storage compaction on the current database keyspace. To compact other resources, use ALTER SYSTEM to compact the entire datastore, ALTER NAMESPACE to compact the current namespace keyspace, or ALTER TABLE to compact a specific table keyspace.

The actual compaction used will depend on the datastore, such as RocksDB or SurrealKV.

This clause will not work with in-memory storage which has nothing persistent to compact, producing the following error:

```surql
'The storage layer does not support compaction requests.'
```

A successful compaction will return `NONE`.

```surql
ALTER DATABASE COMPACT;
-- NONE
```

## See also

- `DEFINE DATABASE`
