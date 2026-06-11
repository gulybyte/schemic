# ALTER ANALYZER

Source: https://surrealdb.com/docs/reference/query-language/statements/alter/analyzer

The `ALTER ANALYZER` statement can be used to modify an existing defined analyzer.

## Statement syntax

## Syntax

```surql
ALTER ANALYZER [ IF EXISTS ] @name
  [ FUNCTION fn::@function | DROP FUNCTION ]
  [ TOKENIZERS @tokenizer, ... | DROP TOKENIZERS ]
  [ FILTERS @filter, ... | DROP FILTERS ]
  [ COMMENT @string | DROP COMMENT ]
```

## Example usage

```surql
-- Define an analyzer
DEFINE ANALYZER example_edgengram TOKENIZERS class FILTERS edgengram(1,3);

-- Shorten the edgengram
ALTER ANALYZER example_edgengram FILTERS edgengram(1,2);

-- Check the output
search::analyze("example_edgengram", "Apple banana!!");
```

Output

```surql
[
	'A',
	'Ap',
	'b',
	'ba',
	'!',
	'!!'
]
```
