# DEFINE INDEX

Source: https://surrealdb.com/docs/reference/query-language/statements/define/indexes

###### Note

Before SurrealDB version 3.0.0-beta, the `FULLTEXT ANALYZER` clause used the syntax `SEARCH ANALYZER`.

# DEFINE INDEX statement

Just like in other databases, SurrealDB uses indexes to help optimize query performance. An index can consist of one or more fields in a table and can enforce a uniqueness constraint. If you don't intend for your index to have a uniqueness constraint, then the fields you select for your index should have a high degree of cardinality, meaning that there is a high amount of diversity between the data in the indexed table records.

## Requirements

- You must be authenticated as a root owner or editor, namespace owner or editor, or database owner or editor before you can use the `DEFINE INDEX` statement.
- You must select your namespace and database before you can use the `DEFINE INDEX` statement.

## Statement syntax

Basic syntax

```surql
DEFINE INDEX [ OVERWRITE | IF NOT EXISTS ] @name
    ON [ TABLE ] @table 
    [ FIELDS | COLUMNS ] @fields
    [ @special_clause ]
    [ COMMENT @string ]
    [ CONCURRENTLY ]
    [ DEFER ]
```

The `@special_clause` part of the statement is an optional part in which an index can be declared for special usage such as guaranteeing unique values, full-text search, and so on. The available clauses are:

Special index clauses

```surql
UNIQUE
| COUNT
| FULLTEXT ANALYZER @analyzer [ BM25 [(@k1, @b)] ] [ HIGHLIGHTS ]
| HNSW DIMENSION @dimension [ TYPE @type ] [ DIST @distance ] [ EFC @efc ] [ M @m ]
| DISKANN DIMENSION @dimension [ TYPE @type ] [ DIST @distance ] [ DEGREE @degree ] [ L_BUILD @l_build ] [ ALPHA @alpha ] [ HASHED_VECTOR ]
```

## Index types

SurrealDB offers a range of indexing capabilities designed to optimize data retrieval and search efficiency.

### Standard (non-unique) index

An index without any special clauses allows for the indexing of attributes that may have non-unique values, facilitating efficient data retrieval. Non-unique indexes help index frequently appearing data in queries that do not require uniqueness, such as categorization tags or status indicators.

Let's create a non-unique index for an age field on a user table.

```surql
-- optimise queries looking for users of a given age
DEFINE INDEX userAgeIndex ON TABLE user COLUMNS age;
```

### Unique index

Ensures each value in the index is unique. A unique index helps enforce uniqueness across records by preventing duplicate entries in fields such as user IDs, email addresses, and other unique identifiers.

Let's create a unique index for the email address field on a user table.

```surql
-- Makes sure that the email address in the user table is always unique
DEFINE INDEX userEmailIndex ON TABLE user COLUMNS email UNIQUE;
```

The created index can be tested using the `INFO` statement.

```surql
INFO FOR TABLE user;
```

The `INFO` statement will help you understand what indexes are defined in your `TABLE`.

```surql
{
    "events": {},
    "fields": {},
    "indexes": {
        "userEmailIndex": {
            sql: "DEFINE INDEX userEmailIndex ON user FIELDS email UNIQUE"
        }
    },
    "lives": {},
    "tables": {}
}
```

As we defined a `UNIQUE` index on the `email` column, a duplicate entry for that column or field will throw an error.

```surql
-- Create a user record and set an email ID.
CREATE user:1 SET email = 'test@surrealdb.com';
```

Response

```surql
[
    {
        "email": "test@surrealdb.com",
        "id": "user:1"
    }
]
```

Creating another record with the same email ID will throw an error.

```surql
-- Create another user record and set the same email ID.
CREATE user:2 SET email = 'test@surrealdb.com';
```

Response

```surql
Database index `userEmailIndex` already contains 'test@surrealdb.com',
with record `user:1`
```

To set the same email for `user:2`, the original record must be deleted

```surql
DELETE user:1;
CREATE user:2 SET email = 'test@surrealdb.com'
```

```surql
[
    {
        "email": "test@surrealdb.com",
        "id": "user:2"
    }
]
```

### Composite index

A composite index spans multiple fields and columns of a table. Composite indexes are mainly used to create a unique index when the definition of what is unique pertains to more than one field.

```surql
-- Create an index on the account and email fields of the user table
DEFINE INDEX test ON user FIELDS account, email UNIQUE;
```

#### Array-element composite indexes Available since: v3.1.0

From SurrealDB 3.1.0, a composite index can lead with an **array-element** column (`tags.*`) so containment predicates combine with ordering on a trailing column without a full table scan. This supports patterns such as `WHERE tags CONTAINS 'x' ORDER BY age DESC LIMIT N` and the multi-value forms `CONTAINSANY` / `ANYINSIDE` on array fields.

```surql
DEFINE INDEX tag_age ON article FIELDS tags.*, age;

-- Bounded index walk (check with EXPLAIN FULL)
SELECT * FROM article
WHERE tags CONTAINS 'release-notes'
ORDER BY age DESC
LIMIT 10;
```

`CONTAINSALL` / `ALLINSIDE` may still apply a residual filter above the union when intersection semantics require it. See operators and `EXPLAIN` to confirm the planner choice.

### Count index

An index using the `COUNT` clause is used to maintain a count of the number of records in a table. This is used together with the `count()` function and `GROUP ALL` inside a query. Without a count index, the `count()` function will iterate through the records of a table when it is called.

```surql
DEFINE INDEX idx ON indexed_reading COUNT;

FOR $_ IN 0..100000 {
    CREATE reading SET temperature = rand::int(0, 10);
};

FOR $_ IN 0..100000 {
    CREATE indexed_reading SET temperature = rand::int(0, 10);
};

-- Wait a moment before running these two
-- queries to ensure the index is built
SELECT count() FROM reading GROUP ALL;
SELECT count() FROM indexed_reading GROUP ALL;
```

As a count index is declared on a table as a whole, it cannot use the `FIELDS` / `COLUMNS` clause.

```surql
-- Other clauses like `COMMENT` are fine
DEFINE INDEX idx ON users COUNT
    COMMENT "Users are expected to grow substantially so index the count"
    CONCURRENTLY;

-- But not `FIELD`
DEFINE INDEX idx2 ON person FIELD name;
```

Output

```surql
'There was a problem with the database: Parse error: Unexpected token `FIELD`, expected Eof
 --> [1:29]
  |
1 | DEFINE INDEX idx2 ON person FIELD name;
  |                             ^^^^^ 
'
```

### Full-text search (FULLTEXT) index

Enables efficient searching through textual data, supporting advanced text-matching features like proximity searches and keyword highlighting.

The Full-Text search index helps implement comprehensive search functionalities in applications, such as searching through articles, product descriptions, and user-generated content.

Let's create a full-text search index for a `name` field on a `user` table.

```surql
-- Define the an analyzer with
DEFINE ANALYZER example_ascii TOKENIZERS class FILTERS ascii;
-- Since 3.0.0-beta: only FULLTEXT used to benefit from concurrent full-text search
DEFINE INDEX userNameIndex ON TABLE user COLUMNS name FULLTEXT ANALYZER example_ascii BM25 HIGHLIGHTS;
```

- `SEARCH` or `FULLTEXT`: By using the `SEARCH` keyword, you enable full-text search on the specified column.
- `ANALYZER ascii`: Uses a custom analyzer called `example_ascii` which uses the class tokenizier and `ascii` filter to analysing the text input.
- `BM25`: Ranking algorithm used for relevance scoring.
- `HIGHLIGHTS`: Allows keyword highlighting in search results output when using the `search::highlight` function
- `FIELDS`: a full-text search index can only be used on one field at a time. To use full-text search on more than one field, use a separate `DEFINE INDEX` statement for each one.

#### FULLTEXT vs. SEARCH

Since version 3.0.0-beta, using `FULLTEXT ANALYZER` is the syntax used for a text analyzer. The `FULLTEXT` clause allows for more performant concurrent full-text search, as well as the ability to use the `OR` operator.

## Vector search indexes

Vector search indexes in SurrealDB support efficient k-nearest neighbors (kNN) and Approximate Nearest Neighbor (ANN) operations, which are pivotal in performing similarity searches within complex, high-dimensional datasets and data types. Refer to the Vector Search Cheat Sheet for the parameters allowed.

### Types

When defining a vector index with HNSW, you can define the types the vector will be stored in. The `TYPE` clause is optional and can be used to specify the data type of the vector. SurrealDB supports the following types:
`F64` | `F32` | `I64` | `I32` | `I16`

- `F64`: Represents 64-bit floating-point numbers (double precision floating-point numbers).
- `F32`: Represents 32-bit floating-point numbers (single precision floating-point numbers).
- `I64`: Represents 64-bit signed integers.
- `I32`: Represents 32-bit signed integers.
- `I16`: Represents 16-bit signed integers.

###### Note

In SurrealDB the default type for vectors is `F64`.

DISKANN indexes accept a **narrower** set of element types: `F32`, `F16`, `I8`, and `U8` only, and only a subset of distance metrics — see the DISKANN section below.

For example, to define a vector index with 64-bit signed integers, you can use the following query:

```surql
DEFINE INDEX idx_mtree_embedding ON Document FIELDS items.embedding HNSW DIMENSION 4 TYPE I64;
```

### HNSW (Hierarchical Navigable Small World)

This method uses a graph-based approach to efficiently navigate and search in high-dimensional spaces.
While it is an approximate technique, it offers a high-performance balance between speed and accuracy, making it ideal for very large datasets.

###### Note

Keep in mind the in-memory nature of HNSW when considering system resource allocation.

In the example above, you may notice the `EFC` and `M` parameters. These are optional to your query but are parameters of the HNSW algorithm and can be used to tune the index for better performance.

- M (Max Connections per Element):

Defines the maximum number of bidirectional links (neighbors) per node in each layer of the graph, except for the lowest layer. This parameter controls the connectivity and overall structure of the network. Higher values of MM generally improve search accuracy but increase memory usage and construction time.

- EFC (EF construction):

Stands for "exploration factor during construction." This parameter determines the size of the dynamic list for the nearest neighbor candidates during the graph construction phase. A larger efConstruction value leads to a more thorough construction, improving the quality and accuracy of the search but increasing construction time. The default value is 150.

- M0 (Max Connections in the Lowest Layer):

Similar to M, but specifically for the bottom layer (the base layer) of the graph. This layer contains the actual data points. M0 is often set to twice the value of M to enhance search performance and connectivity at the base layer, at the cost of increased memory usage.

- LM (Multiplier for Level Generation):

Used to determine the maximum level ll for a new element during its insertion into the hierarchical structure. It is used in the formula l←⌊−ln⁡(unif(0..1))⋅mL⌋, where unif(0..1) is a uniform random variable between 0 and 1. This parameter influences the distribution of elements across different levels, impacting the overall balance and efficiency of the search structure.

###### Note

You can only provide TYPE, M, and EFC. SurrealDB automatically computes M0 and LM with the most appropriate value. If not specified, M AND EFC are set to 12 and 150, respectively.  Refer to the Vector Search Cheat Sheet for the parameters allowed.

#### Memory cache usage for HNSW indexes

HNSW vector search uses a bounded memory cache by default, reducing memory spikes and improving stability under load. The default size for the cache is 256 MiB, and can be modified via the `SURREAL_HNSW_CACHE_SIZE` environment variable.

### DISKANN (disk-based approximate nearest neighbours)

DiskANN-style indexes provide **on-disk** approximate nearest-neighbour graphs. They are aimed at **very large** embedding sets where keeping the full graph in RAM (as with HNSW) is impractical: vectors and graph structure are persisted in the key-value store and paged through a bounded cache, trading some latency for a much larger working set.

###### Note

DISKANN indexes are **not supported on WASM** targets. Use HNSW or brute-force KNN for browser / embedded WASM builds.

#### Syntax and defaults

The clause mirrors HNSW: `DISKANN DIMENSION …` followed by optional `TYPE`, `DIST`, tuning knobs, and `HASHED_VECTOR`.

```surql
DEFINE INDEX diskann_pts ON pts FIELDS point DISKANN DIMENSION 4 DIST EUCLIDEAN TYPE F32;
-- Same index with defaults written out explicitly:
-- DEFINE INDEX diskann_pts ON pts FIELDS point DISKANN DIMENSION 4 DIST EUCLIDEAN TYPE F32 DEGREE 64 L_BUILD 100 ALPHA 1.2;
```

| Clause | Default | Notes |
| --- | --- | --- |
| `DIST` | `EUCLIDEAN` | Only `EUCLIDEAN`, `COSINE`, `INNER_PRODUCT`, and `COSINE_NORMALIZED` are valid for DISKANN. |
| `TYPE` | `F32` | Must be one of `F32`, `F16`, `I8`, `U8`. `COSINE_NORMALIZED` further requires `F32` or `F16`. |
| `DEGREE` | `64` | Target maximum graph degree (`> 0`). |
| `L_BUILD` | `100` | Construction search-list size (`> 0`). |
| `ALPHA` | `1.2` | DiskANN pruning parameter. |
| `HASHED_VECTOR` | off | Same semantics as for HNSW — hash-stabilised vector–document keys. |

Queries use the **same** KNN operator shape as HNSW: `<|K, EF|>` (approximate) or `<|K, DIST|>` when the distance matches the index, letting the optimiser pick the DISKANN graph. The second number in the approximate form bounds the dynamic candidate list during search (analogous to HNSW `EF`).

#### Choosing HNSW or DISKANN

| Concern | Prefer HNSW | Prefer DISKANN |
| --- | --- | --- |
| Working set size | Fits comfortably in memory with headroom for the HNSW cache | Much larger than RAM; cold data should stay on disk |
| Latency profile | Lowest latency when the graph is hot in cache | Extra I/O; better for throughput to cost on huge corpora |
| Vector element types | Full set (`F64` … `I16` in docs above) | Quantised-friendly types (`F32`, `F16`, `I8`, `U8`) |
| Deployment target | Includes WASM | Server / native binaries only |

### Brute Force method

The Brute Force method is suitable for tasks with smaller datasets or when the highest accuracy is required.
Brute Force currently supports Euclidean, Cosine, Manhattan and Minkowski distance functions.

In the example below, the query searches for points closest to the vector `[2,3,4,5]` and uses vector functions to calculate the distance between two points, indicated by `<|2|>`.

## Verifying Index Utilization in Queries

The `EXPLAIN` clause from SurrealQL helps you understand the execution plan of the query and provides transparency around index utilization.

```surql
SELECT * FROM user WHERE email='test@surrealdb.com' EXPLAIN FULL;
```

It also reveals details about which `operation` was used by the query planner and how many records matched the search criteria.

```surql
[
    {
        "detail": {
            "plan": {
                "index": "userEmailIndex",
                "operator": "=",
                "value": "test@surrealdb.com"
            },
            "table": "user"
        },
        "operation": "Iterate Index"
    },
    {
        "detail": {
            "count": 1
        },
        "operation": "Fetch"
    }
]
```

## Rebuilding Indexes

Indexes can be rebuilt using the `REBUILD` statement. This can be useful when you want to update the index definition or when you want to rebuild the index to optimize performance.

You may want to rebuild an index overtime to ensure that the index is up-to-date with the latest data in the table.

```surql
REBUILD INDEX userEmailIndex ON user;
```

## Using IF NOT EXISTS clause

The `IF NOT EXISTS` clause can be used to define an index only if it does not already exist. You should use the `IF NOT EXISTS` clause when defining a index in SurrealDB if you want to ensure that the index is only created if it does not already exist. If the index already exists, the `DEFINE INDEX` statement will return an error.

It's particularly useful when you want to safely attempt to define a index without manually checking its existence first.

On the other hand, you should not use the `IF NOT EXISTS` clause when you want to ensure that the index definition is updated regardless of whether it already exists. In such cases, you might prefer using the `OVERWRITE` clause, which allows you to define a index and overwrite an existing one if it already exists, ensuring that the latest version of the index definition is always in use

```surql
-- Create a INDEX if it does not already exist
DEFINE INDEX IF NOT EXISTS example ON example FIELDS example;
```

## Using OVERWRITE clause

The `OVERWRITE` clause can be used to define an index and overwrite an existing one if it already exists. You should use the `OVERWRITE` clause when you want to modify an existing index definition. If the index already exists, the `DEFINE INDEX` statement will overwrite the existing definition with the new one.

```surql
-- Create an INDEX and overwrite if it already exists
DEFINE INDEX OVERWRITE example ON example FIELDS example;
```

## Using CONCURRENTLY clause

Building indexes can be lengthy and may time out before they're completed. Without `CONCURRENTLY`, `DEFINE INDEX` blocks until the index is fully built (or the build fails). The `CONCURRENTLY` clause can be used when you need the statement to return immediately while indexing continues in the background. This allows other operations to keep running while the index builds, during which you can monitor progress with INFO FOR INDEX.

```surql
-- Create an INDEX concurrently
DEFINE INDEX test ON user FIELDS email CONCURRENTLY;
INFO FOR INDEX test ON user;
INFO FOR INDEX test ON user;
```

When building an index concurrently, SurrealDB starts the index creation as a background process. You can monitor the status of this process using the `INFO FOR INDEX` statement. The output includes a building block that provides several key details:

```surql
-- Check the indexing status
INFO FOR INDEX test ON user;
```

Possible response

```surql
-- Query

{
    building:  {
        initial: 8143,
        pending: 19,
        status: 'indexing',
        updated: 80
    }
}
```

The indexing process consists of two stages: **initial** and **update**.

- **Initial Stage:** During this stage, SurrealDB indexes all existing records. The number of indexed records is represented by the `initial` property. While this stage is in progress, any new inserts, updates, or deletions are tracked as `pending`.
- **Update Stage:** Once the initial stage is completed, SurrealDB begins indexing the pending records accumulated during the initial phase. At this point:The `initial` count remains stable.The `pending` count should gradually decrease as these records are processed; however, it may temporarily increase if new modifications occur during indexing.The `updated` property indicates the number of pending records that have been indexed during this stage.

When both stages are complete, the index status changes to **ready**, meaning that the index is now automatically updated within the same transaction that inserts, updates, or deletes records.

```surql
-- Query

{
	building: {
		status: 'ready'
	}
}
```

## Using the ANY/ALL operators for string indexes

An index defined on a string value can be used via the operators `CONTAINSANY`, `ALLINSIDE`, or `ANYINSIDE`. The operator `CONTAINS`, however, will not use a defined index as `CONTAINS` is used for substring matches between strings themselves as opposed to an index lookup.

```surql
DEFINE FIELD name ON account TYPE string;
DEFINE INDEX name_index ON account FIELDS name;

CREATE account:billy SET name = "Billy McConnell";

-- Both return the user Billy McConnell
SELECT * FROM account WHERE name CONTAINS "Billy McConnell";
SELECT * FROM account WHERE name CONTAINSANY ["Billy McConnell"];

-- However, CONTAINS does not use the index
SELECT * FROM account WHERE name CONTAINS "Billy McConnell" EXPLAIN FULL;
-- CONTAINSANY + putting the value inside an array will use the index
SELECT * FROM account WHERE name CONTAINSANY ["Billy McConnell"] EXPLAIN FULL;
```

## The DEFER clause

Index updates in SurrealDB occur synchronously during document operations. This ensures **immediate consistency**, in which all reads return the most recent write. However, this can become a bottleneck during high-volume parallel ingestion, leading to write-write conflicts and increased latency, particularly with Full-Text or Vector indexes.

The `DEFER` clause can be used in this case if **eventual consistency** is acceptable, namely a setting in which reads may return stale data for a short period, but will eventually converge to the most recent write. An index with this clause will be enqueued in a persistent background queue so that ingestion and indexing are decoupled.

```surql
DEFINE ANALYZER simple TOKENIZERS blank,class FILTERS lowercase;
DEFINE INDEX title_index ON blog FIELDS title SEARCH ANALYZER simple BM25(1.2,0.75) HIGHLIGHTS DEFER;
```

Note: As unique indexes offer a guarantee that no records that contravene the index will ever exist, the `UNIQUE` clause cannot be used together with `DEFER`.

## Performance Implications

When defining indexes, it's essential to consider the fields most frequently queried or used to optimize performance.

Indexes may improve the performance of SurrealQL statements. This may not be noticeable with small tables but it can be significant for large tables; especially when the indexed fields are used in the `WHERE` clause of a `SELECT` statement.

Indexes can also impact the performance of write operations (INSERT, UPDATE, DELETE) since the index needs to be updated accordingly. Therefore, it's essential to balance the need for read performance with write performance.
