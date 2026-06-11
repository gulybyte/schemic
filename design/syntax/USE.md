# USE

Source: https://surrealdb.com/docs/reference/query-language/statements/use

The `USE` statement specifies a namespace and / or a database to use for the subsequent SurrealQL statements when switching between namespaces and databases. If you have a single namespace and database, you can define them in the sql command.

Ensure that your database and namespace exist and you have started your database before using the Sql command option.

### Statement syntax

## Syntax

```surql
USE [ NS @ns ] [ DB @db ];
```

## Example usage

The following query shows example usage of this statement if you have multiple namespaces and databases.

```surql
USE NS test; -- Switch to the 'main' Namespace
```

```surql
USE DB test; -- Switch to the 'main' Database
```

```surql
USE NS test DB test; -- Switch to the 'main' Namespace and 'main' Database
```

You can also use the INFO Statement to check the current namespace and database.

```surql
INFO FOR NS; -- Check the current Namespace
```

```surql
INFO FOR DB; -- Check the current Database
```

## USE statement behaviour when resource does not exist

The behaviour of the `USE` statement differs depending on which mode the database server is run in.

When run in regular mode, a `USE` statement will create the namespace or database indicated if it does not already exist.

```surql
USE NS ns; -- Output: NONE (success)
(INFO FOR ROOT).namespaces; -- Output: { ns: 'DEFINE NAMESPACE ns' }
```

In strict mode, a resource will not be created unless it is already defined. In this case, the `USE` statement will return an error.

```surql
USE NS ns; -- Output: "The namespace 'ns' does not exist"
DEFINE NS ns;
USE NS ns; -- Now defined, no error
```

## Value returned by USE statement

Before SurrealDB 3.0.0-beta, the output of a `USE` statement was `NONE`. Since then, each `USE` statement returns an object containing the current namespace and database.

```surql
USE NS main;
```

Output

```surql
{ database: 'main', namespace: 'main' }
```
