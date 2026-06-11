# REBUILD

Source: https://surrealdb.com/docs/reference/query-language/statements/rebuild

The `REBUILD` statement is used to rebuild indexes in SurrealDB. It is usually used in relation to a specified Index to optimize performance. It is useful to rebuild indexes because sometimes HNSW index performance can degrade due to frequent updates.

Rebuilding the index will ensure the index is fully optimized.

###### Note

By default, `REBUILD INDEX` waits until the rebuild finishes before the statement returns (the same behaviour as `DEFINE INDEX` without `CONCURRENTLY`). Adding `CONCURRENTLY` on the rebuild statement will cause it to return immediately, after which progress can be monitored via `INFO FOR INDEX`. Whether the index was originally created with `CONCURRENTLY` does not affect rebuilds. See the `CONCURRENTLY` clause on `DEFINE INDEX` for the same blocking vs non-blocking distinction when creating an index.

### Statement syntax

## Syntax

```surql
REBUILD [
	INDEX [ IF EXISTS ] @name ON [ TABLE ] @table [ CONCURRENTLY ]
]
```

###### Note

The `IF EXISTS` and TABLE clauses are optional.

## Example usage

For example, if you have a table called `book` and you have an index called `uniq_isbn` on the `isbn` field, you can rebuild the index using the following query:

```surql
REBUILD INDEX uniq_isbn ON book;
```

### Using if exists clause

The following queries show an example of how to rebuild resources using the `IF EXISTS` clause, which will only rebuild the resource if it exists.

```surql
REBUILD INDEX IF EXISTS uniq_isbn ON book;
```
