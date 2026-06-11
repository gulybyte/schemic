# ALTER BUCKET

Source: https://surrealdb.com/docs/reference/query-language/statements/alter/bucket

The `ALTER BUCKET` statement can be used to modify an existing defined bucket.

## Statement syntax

## Syntax

```surql
ALTER BUCKET [ IF EXISTS ] @name
  [ READONLY | DROP READONLY ]
  [ BACKEND @string | DROP BACKEND ]
  [ PERMISSIONS @expression ]
  [ COMMENT @string | DROP COMMENT ]
```

## Example usage

```surql
DEFINE BUCKET my_bucket BACKEND "memory";

ALTER BUCKET my_bucket COMMENT "Should we make this read-only too??";
```
