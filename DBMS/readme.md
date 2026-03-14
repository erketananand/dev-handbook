1. [DB Comparision](https://github.com/erketananand/dev-handbook/blob/main/DBMS/db-comparision.md)
2. [DML Query - Clause Comparision](https://github.com/erketananand/dev-handbook/blob/main/DBMS/sql-clause-comparision-dml-query.md)
3. [Transaction Issolation Levels](https://github.com/erketananand/dev-handbook/blob/main/DBMS/transaction-issolation-levels.md)
4. [Commit vs Rollback vs WAl vs Data Page Crash Recovery](https://github.com/erketananand/dev-handbook/blob/main/DBMS/commit-rollback-wal-data-page-crash-recovery.md)
5. [Join + GroupBy   **vs**   Join + Window Function](https://github.com/erketananand/dev-handbook/blob/main/DBMS/GroupBy-vs-WindowFunction.md)

#### Logical execution order of Select query (simplified)

1. `FROM` / `JOIN`
2. `WHERE`
3. `GROUP BY`
4. `HAVING`
5. Window Functions (`OVER()`)
6. `SELECT`
7. `ORDER BY`
8. `LIMIT` / `OFFSET`
