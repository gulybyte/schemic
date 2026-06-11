# ALTER ACCESS

Source: https://surrealdb.com/docs/reference/query-language/statements/alter/access

The `ALTER ACCESS` statement can be used to modify an existing defined access.

## Statement syntax

## Syntax

```surql
ALTER ACCESS [ IF EXISTS ] @name
  ON [ ROOT | NAMESPACE | DATABASE ]
  [ AUTHENTICATE @expression | DROP AUTHENTICATE ]
  [ DURATION
    [ FOR GRANT [ @duration | NONE ] ]
    [ FOR TOKEN [ @duration | NONE ] ]
    [ FOR SESSION [ @duration | NONE ] ]
  ]
  [ COMMENT @string | DROP COMMENT ]
```

Note that this statement does not allow modification of the access type itself (`RECORD` / `JWT` / `BEARER`), only its duration, the `AUTHENTICATE` clause, and a `COMMENT`.

## Example usage

```surql
-- Define an access
DEFINE ACCESS account ON DATABASE TYPE RECORD
	SIGNUP ( CREATE user SET email = $email, pass = crypto::argon2::generate($pass) )
	SIGNIN ( SELECT * FROM user WHERE email = $email AND crypto::argon2::compare(pass, $pass) )
	DURATION FOR TOKEN 15m, FOR SESSION 12h;

-- Shorten the token duration
ALTER ACCESS account ON DATABASE DURATION FOR TOKEN 1m;
```
