# ALTER CONFIG

Source: https://surrealdb.com/docs/reference/query-language/statements/alter/config

The `ALTER CONFIG` statement can be used to modify an existing defined config.

## Statement syntax

## Syntax

```surql
ALTER CONFIG [ IF EXISTS ]
  ( API
      [ MIDDLEWARE @function(...), ... ]
      PERMISSIONS [ NONE | FULL | @expression ]
  | GRAPHQL
      TABLES [ AUTO | NONE | INCLUDE @table, ... | EXCLUDE @table, ... ]
      FUNCTIONS [ AUTO | NONE | INCLUDE @function, ... | EXCLUDE @function, ... ]
      [ DEPTH @integer ]
      [ COMPLEXITY @integer ]
      [ INTROSPECTION NONE ]
  | DEFAULT
      NAMESPACE @namespace
      DATABASE @database
  )
  [ COMMENT @string | DROP COMMENT ]
```

## Example usage

```surql
DEFINE CONFIG GRAPHQL TABLES AUTO FUNCTIONS AUTO;

ALTER CONFIG GRAPHQL FUNCTIONS NONE;
```
