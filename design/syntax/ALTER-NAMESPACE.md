# ALTER NAMESPACE

Source: https://surrealdb.com/docs/reference/query-language/statements/alter/namespace

The `ALTER NAMESPACE` statement can be used to modify the namespace. `ALTER NAMESPACE` is used on the current namespace, which is why a `IF EXISTS` clause does not exist.

## Statement syntax

## Syntax

```surql
ALTER NAMESPACE COMPACT
```

## COMPACT

Performs storage compaction onPerforms storage compaction on the current namespace keyspace. To compact other resources, use ALTER SYSTEM to compact the entire datastore, ALTER DATABASE to compact the current database keyspace, or ALTER TABLE to compact a specific table keyspace.

The actual compaction used will depend on the datastore, such as RocksDB or SurrealKV.

This clause will not work with in-memory storage which has nothing persistent to compact, producing the following error:

```surql
'The storage layer does not support compaction requests.'
```

A successful compaction will return `NONE`.

```surql
ALTER NAMESPACE COMPACT;
-- NONE
```

## See also

- `DEFINE NAMESPACE`
