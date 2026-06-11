# ALTER FUNCTION

Source: https://surrealdb.com/docs/reference/query-language/statements/alter/function

The `ALTER FUNCTION` statement can be used to modify an existing defined function.

## Statement syntax

## Syntax

```surql
ALTER FUNCTION [ IF EXISTS ] fn::@name
  [ ( [ $argument: @type, ... ] ) ] [ -> @type | DROP RETURNS ]
  [ { @query ... } ]
  [ COMMENT @string | DROP COMMENT ]
  [ PERMISSIONS [ NONE | FULL | WHERE @condition ] ] 
```

## Example usage

```surql
-- Declare a function
DEFINE FUNCTION fn::get_message($input: any) {
    $input.message
};

-- No `message` field, returns nothing
fn::get_message("wrong input");

-- Tighten up the valid input for the function
ALTER FUNCTION fn::get_message($input: { error_code: 200, message: string } | {error_code: 404, message: string} ) {
    $input.message
};

-- Returns an error now
fn::get_message("wrong input");

-- Okay, returns 'Looks good'
fn::get_message({ error_code: 200, message: "Looks good" });
```
