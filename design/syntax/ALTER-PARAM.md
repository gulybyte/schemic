# ALTER PARAM

Source: https://surrealdb.com/docs/reference/query-language/statements/alter/param

The `ALTER PARAM` statement can be used to modify an existing defined param.

## Statement syntax

## Syntax

```surql
ALTER PARAM [ IF EXISTS ] $name
  [ VALUE @value ]
  [ COMMENT @string | DROP COMMENT ]
  [ PERMISSIONS [ NONE | FULL | WHERE @condition ] ]
```

Note that `ALTER PARAM` does not support `DROP VALUE` as a parameter without a value is not valid.

## Example usage

```surql
DEFINE PARAM $MODE VALUE "production" COMMENT "Don't use this param yet";

ALTER PARAM $MODE DROP COMMENT;

-- Check the statement
(INFO FOR DB).params.MODE;
```

Output: comment is gone

```surql
"DEFINE PARAM $MODE VALUE 'production' PERMISSIONS FULL"
```
