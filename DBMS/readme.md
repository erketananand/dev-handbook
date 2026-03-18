1. [DB Comparision](https://github.com/erketananand/dev-handbook/blob/main/DBMS/db-comparision.md)
2. [DML Query - Clause Comparision](https://github.com/erketananand/dev-handbook/blob/main/DBMS/sql-clause-comparision-dml-query.md)
3. [Transaction Issolation Levels](https://github.com/erketananand/dev-handbook/blob/main/DBMS/transaction-issolation-levels.md)
4. [Commit vs Rollback vs WAl vs Data Page Crash Recovery](https://github.com/erketananand/dev-handbook/blob/main/DBMS/commit-rollback-wal-data-page-crash-recovery.md)
5. [Join + GroupBy   **vs**   Join + Window Function](https://github.com/erketananand/dev-handbook/blob/main/DBMS/GroupBy-vs-WindowFunction.md)

#### Logical execution order of Select query (simplified)

1. `FROM` / `JOIN`
2. `WHERE`
3. `GROUP BY` // *aggregation is available group by onwards*
4. `HAVING`
5. Window Functions (`OVER()`)
6. `SELECT`
7. `ORDER BY`
8. `LIMIT` / `OFFSET`

#### Design the DB Schema

* For each class that represents an entity in the class diagram, create a table in the schema design.
* For each primitive attribute (int/boolean/string) in each entity class, put that attribute as a column in the corresponding table (non-object & non-associative attribute)
* For every non-primitive attribute (relation with another class)
  * Find the cardinality of the relation
  * Represent that relation as per rules to represent that cardinality.
* Inheritance is not represented by multiple tables with the same attributes. Instead, one table with common attributes and other tables with specific attributes and foreign keys.
