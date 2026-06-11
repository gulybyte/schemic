# ALTER TABLE

Source: https://surrealdb.com/docs/reference/query-language/statements/alter/table

The `ALTER TABLE` statement is used to alter a defined table.

## Syntax

```surql
ALTER TABLE [
	[ IF EXISTS ] @name
		[ DROP COMMENT ]
        [ DROP CHANGEFEED ]
        [ COMPACT ]
		[ SCHEMAFULL | SCHEMALESS ]
		[ PERMISSIONS [ NONE | FULL
			| FOR select @expression
			| FOR create @expression
			| FOR update @expression
			| FOR delete @expression
		] ]
    [ CHANGEFEED @duration ]
    [ COMMENT @string ] 
    [ CHANGEFEED ]
]
```

## COMPACT

Performs storage compaction on a specific table keyspace. To compact other resources, use ALTER SYSTEM to compact the entire datastore, ALTER NAMESPACE to compact the current namespace keyspace, or ALTER DATABASE to compact the current database keyspace.

The actual compaction used will depend on the datastore, such as RocksDB or SurrealKV.

This clause will not work with in-memory storage which has nothing persistent to compact, producing the following error:

```surql
'The storage layer does not support compaction requests.'
```

A successful compaction will return `NONE`.

```surql
ALTER TABLE user COMPACT;
-- NONE
```

## See also

- `DEFINE TABLE`
