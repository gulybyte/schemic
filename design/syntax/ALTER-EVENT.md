# ALTER EVENT

Source: https://surrealdb.com/docs/reference/query-language/statements/alter/event

The `ALTER EVENT` statement can be used to modify an existing defined event.

## Statement syntax

## Syntax

```surql
ALTER EVENT [ IF EXISTS ] @name ON [ TABLE ] @table
  [ ASYNC [ RETRY @retry ] [ MAXDEPTH @max_depth ] | DROP ASYNC ]
  [ WHEN @condition | DROP WHEN ]
  [ THEN @action, ... | DROP THEN ]
  [ COMMENT @string | DROP COMMENT ]
```

## Example usage

```surql
DEFINE FIELD status ON post TYPE "submitted" | "published" DEFAULT "submitted";

-- Define an event
DEFINE EVENT publish_post ON TABLE publication
    WHEN $event = "CREATE"
    THEN (
        FOR $post IN $after.posts {
            UPDATE $post SET status = "published";
        }        
    );

-- Make it async
ALTER EVENT publish_post ON TABLE publication ASYNC;

CREATE post:one SET content = "I read the news today, oh boy...";
CREATE post:two SET content = "On the banks of Tuonela Bleach the skeletons of kings";
CREATE post:three SET content = "뭐 화끈한 일 뭐 신나는 일 없을까";
CREATE publication SET posts = [post:one, post:two, post:three];

SELECT * FROM post;
```

Output once async events processed

```surql
[
	{
		content: 'I read the news today, oh boy...',
		id: post:one,
		status: 'submitted'
	},
	{
		content: '뭐 화끈한 일 뭐 신나는 일 없을까',
		id: post:three,
		status: 'submitted'
	},
	{
		content: 'On the banks of Tuonela Bleach the skeletons of kings',
		id: post:two,
		status: 'submitted'
	}
]
```
