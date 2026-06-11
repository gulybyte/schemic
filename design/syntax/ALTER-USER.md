# ALTER USER

Source: https://surrealdb.com/docs/reference/query-language/statements/alter/user

The `ALTER USER` statement can be used to modify an existing defined database user.

## Statement syntax

## Syntax

```surql
ALTER USER [ IF EXISTS ] @name
  ON [ ROOT | NAMESPACE | DATABASE ]
  [ PASSWORD @pass | PASSHASH @hash ]
  [ ROLES @role, ... ]
  [ DURATION FOR TOKEN [ @duration | NONE ] ]
  [ DURATION FOR SESSION [ @duration | NONE ] ]
  [ COMMENT @string | DROP COMMENT ]
```

## Example usage

```surql
-- Define a user with viewer role
DEFINE USER billy ON DATABASE PASSWORD "example" ROLES VIEWER;

-- Congrats on your promotion billy,
-- be sure to use this power for good
ALTER USER billy ON DATABASE ROLES EDITOR;
```
