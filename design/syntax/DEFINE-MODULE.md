# DEFINE MODULE

Source: https://surrealdb.com/docs/reference/query-language/statements/define/module

A `DEFINE MODULE` statement is used to define a module via which Surrealism extensions functions can be called.

###### Note

The `surrealism` experimental feature must be enabled before you can use a `DEFINE MODULE` statement.

## Statement syntax

## Syntax

```surql
DEFINE MODULE [ OVERWRITE | IF NOT EXISTS ] @mod::@sub AS @file_name
```

## Example

A module includes a module and a sub, followed by `AS` and a pointer to the `.surli` file containing the Rust code compiled to WASM through the Surrealism CLI.

```surql
DEFINE MODULE mod::test AS f"test:/demo.surli";
```

Once the module is defined, functions can be accessed through this path.

Assuming these two functions in the Rust code before compilation to WASM via the Surrealism CLI:

```surql
#[surrealism]
fn returns_true() -> bool { true };

#[surrealism]
fn check_num_size(num: i32) -> Result<i32, &'static str> {
    if num >= 500 {
        Err("Number is too big!")
    } else {
        Ok(num)
    }
}
```

They will then be accessible using the following paths.

```surql
RETURN mod::test::returns_true();
-- true

RETURN mod::test::check_num_size(100);
-- 100
```
