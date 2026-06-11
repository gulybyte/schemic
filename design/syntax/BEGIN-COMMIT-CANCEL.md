# BEGIN / COMMIT / CANCEL (Transactions)

Sources:
- https://surrealdb.com/docs/reference/query-language/statements/begin
- https://surrealdb.com/docs/reference/query-language/statements/commit
- https://surrealdb.com/docs/reference/query-language/statements/cancel


---

# BEGIN

Source: https://surrealdb.com/docs/reference/query-language/statements/begin

Each statement within SurrealDB is run within its own transaction by default. The `BEGIN` statement can be used to modify this behaviour by running a group of statements inside a single transaction, either succeeding as a whole, or failing. Once all of the statements within a transaction succeed, then all of the data modifications can be made permanent by finalizing the transaction with a COMMIT statement at the end. If any statement within a transaction encounters an error or the transaction is manually cancelled (CANCEL), then any data modification made within the transaction is rolled back, and will not become a permanent part of the database.

### Statement syntax

## Syntax

```surql
BEGIN [ TRANSACTION ];
```

## Example usage

The following query shows example usage of this statement.

```surql
-- Start a new database transaction. Transactions are a way to ensure multiple operations
-- either all succeed or all fail, maintaining data integrity.
BEGIN TRANSACTION;

-- Create a new account with the ID 'one' and set its initial balance to 135605.16
CREATE account:one SET balance = 135605.16;

-- Create another new account with the ID 'two' and set its initial balance to 91031.31
CREATE account:two SET balance = 91031.31;

-- Update the balance of account 'one' by adding 300.00 to the current balance.
-- This could represent a deposit or other form of credit on the balance property.
UPDATE account:one SET balance += 300.00;

-- Update the balance of account 'two' by subtracting 300.00 from the current balance.
-- This could represent a withdrawal or other form of debit on the balance property.
UPDATE account:two SET balance -= 300.00;

-- Finalize the transaction. This will apply the changes to the database. If there was an error
-- during any of the previous steps within the transaction, all changes would be rolled back and
-- the database would remain in its initial state.
COMMIT TRANSACTION;
```

## Returning early from a transaction

While all transactions require a final `COMMIT` or `CANCEL` statement in order to run, an early return can take place via the following:

- An error inside one of the statements inside the transaction,
- A `THROW` statement to return early with an error,
- A `RETURN` statement to return early. This is often used to customize the output of a transaction.

An example of the above:

```surql
BEGIN;

CREATE account:one SET balance = 135605.16;
CREATE account:two SET balance = 91031.31, wants_to_send_money = true;

IF !account:two.wants_to_send_money {
    THROW "Customer doesn't want to send any money!";
};

LET $first = UPDATE ONLY account:one SET balance += 300.00;
LET $second = UPDATE ONLY account:two SET balance -= 300.00;

RETURN "Money sent! Status:\n" + <string>$first + '\n' + <string>$second;

COMMIT;
```

Output

```surql
'Money sent! Status:
{ balance: 135905.16f, id: account:one }
{ balance: 90731.31f, id: account:two, wants_to_send_money: true }'
```

---

# COMMIT

Source: https://surrealdb.com/docs/reference/query-language/statements/commit

Each statement within SurrealDB is run within its own transaction by default. If a set of changes need to be made together, then groups of statements can be run together as a single transaction, either succeeding as a whole, or failing without leaving any residual data modifications. A `COMMIT` statement is used at the end of such a transaction to make the data modifications a permanent part of the database.

### Statement syntax

## Syntax

```surql
COMMIT [ TRANSACTION ];
```

## Example usage

The following query shows example usage of this statement.

```surql
BEGIN TRANSACTION;

-- Setup accounts
CREATE account:one SET balance = 135605.16;
CREATE account:two SET balance = 91031.31;

-- Move money
UPDATE account:one SET balance += 300.00;
UPDATE account:two SET balance -= 300.00;

-- Finalise all changes
COMMIT TRANSACTION;
```

The following two options can be used at any point if a transaction must be cancelled without commiting the changes:

- CANCEL to manually cancel the transaction.
- THROW to cancel a transaction with an optional error message. THROW is the only way to cancel a transaction based on a condition, such as inside an IF..ELSE block.

In addition, a `RETURN` statement can be used to return early from a successful transaction. This is often used in order to return a customized output.

```surql
BEGIN;

CREATE account:one SET balance = 135605.16;
CREATE account:two SET balance = 91031.31, wants_to_send_money = true;

IF !account:two.wants_to_send_money {
    THROW "Customer doesn't want to send any money!";
};

LET $first = UPDATE ONLY account:one SET balance += 300.00;
LET $second = UPDATE ONLY account:two SET balance -= 300.00;

RETURN "Money sent! Status:\n" + <string>$first + '\n' + <string>$second;

COMMIT;
```

Output

```surql
'Money sent! Status:
{ balance: 135905.16f, id: account:one }
{ balance: 90731.31f, id: account:two, wants_to_send_money: true }'
```

---

# CANCEL

Source: https://surrealdb.com/docs/reference/query-language/statements/cancel

Each statement within SurrealDB is run within its own transaction. If a set of changes need to be made together, then groups of statements can be run together as a single transaction, either succeeding as a whole, or failing without leaving any residual data modifications. While a transaction will fail if any of its statements encounters an error, the `CANCEL` statement can also be used to cancel a transaction manually.

### Statement syntax

## Syntax

```surql
CANCEL [ TRANSACTION ];
```

## Example usage

The following query shows example usage of this statement.

```surql
BEGIN TRANSACTION;

-- Setup accounts
CREATE account:one SET balance = 135605.16;
CREATE account:two SET balance = 91031.31;

-- Move money
UPDATE account:one SET balance += 300.00;
UPDATE account:two SET balance -= 300.00;

-- Rollback all changes
CANCEL TRANSACTION;
```

`CANCEL` is not used to automatically cancel a transaction based on a condition such as inside an IF..ELSE block. Instead, a THROW statement is used. THROW can be followed by any value, usually a string containing context behind the error.

```surql
BEGIN TRANSACTION;

-- Setup accounts
CREATE account:one SET balance = 135605.16;
CREATE account:two SET balance = 200.31;

-- Move money
UPDATE account:one SET balance += 300.00;
UPDATE account:two SET balance -= 300.00;

IF account:two.balance < 0 {
    THROW "Not enough funds";
};

COMMIT TRANSACTION;
```
