# ✅ SQL Clause Support Comparison

| Feature / Clause | SELECT | INSERT                   | UPDATE           | DELETE           |
| ---------------- | ------ | ------------------------ | ---------------- | ---------------- |
| `JOIN`           | ✅ Yes  | ⚠️ Via `INSERT...SELECT` | ✅ Yes            | ✅ Yes            |
| `WHERE`          | ✅ Yes  | ❌ (direct)               | ✅ Yes            | ✅ Yes            |
| `GROUP BY`       | ✅ Yes  | ⚠️ Via `INSERT...SELECT` | ❌                | ❌                |
| `HAVING`         | ✅ Yes  | ⚠️ Via `INSERT...SELECT` | ❌                | ❌                |
| `ORDER BY`       | ✅ Yes  | ⚠️ Via `INSERT...SELECT` | ⚠️ (DB-specific) | ⚠️ (DB-specific) |
| `LIMIT`          | ✅ Yes  | ⚠️ Via `INSERT...SELECT` | ⚠️ (DB-specific) | ⚠️ (DB-specific) |
| `OFFSET`         | ✅ Yes  | ⚠️ Via `INSERT...SELECT` | ⚠️ (DB-specific) | ⚠️ (DB-specific) |
| Window Functions | ✅ Yes  | ⚠️ Via `INSERT...SELECT` | ❌                | ❌                |
| Subquery         | ✅ Yes  | ✅ Yes                    | ✅ Yes            | ✅ Yes            |
| CTE (`WITH`)     | ✅ Yes  | ✅ Yes                    | ✅ Yes            | ✅ Yes            |

## 1️⃣ SELECT (Fully Supported)

Example:

```sql
SELECT e.name, COUNT(o.id)
FROM employees e
JOIN orders o ON e.id = o.emp_id
WHERE e.salary > 50000
GROUP BY e.name
HAVING COUNT(o.id) > 5
ORDER BY e.name
LIMIT 10 OFFSET 5;
```

## 2️⃣ INSERT

### ❌ Direct `INSERT` does NOT support:

* `WHERE`
* `GROUP BY`
* `HAVING`
* `JOIN`
* `WINDOW FUNCTION`

But we can use them inside `INSERT INTO ... SELECT`

### ✅ Example 1: INSERT with JOIN

```sql
INSERT INTO high_value_customers (customer_id, total_orders)
SELECT c.id, COUNT(o.id)
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id
HAVING COUNT(o.id) > 10;
```

Here:

* JOIN ✅
* GROUP BY ✅
* HAVING ✅
* Works because it is inside SELECT

### ✅ Example 2: INSERT with Window Function

```sql
INSERT INTO ranked_employees (emp_id, rank_no)
SELECT id,
       RANK() OVER (ORDER BY salary DESC)
FROM employees;
```

Window function works inside SELECT.

## 3️⃣ UPDATE

### ✅ Supported:

* WHERE
* JOIN (DB dependent: MySQL, PostgreSQL support)
* Subquery
* CTE

### ❌ Not Supported:

* GROUP BY
* HAVING
* Window functions (directly)

### ✅ Example 1: UPDATE with JOIN (PostgreSQL style)

```sql
UPDATE employees e
SET salary = salary * 1.10
FROM departments d
WHERE e.dept_id = d.id
AND d.name = 'Sales';
```

### ✅ Example 2: UPDATE with Subquery

```sql
UPDATE employees
SET salary = salary + 5000
WHERE id IN (
    SELECT emp_id
    FROM top_performers
);
```

### ⚠️ LIMIT in UPDATE (MySQL only)

```sql
UPDATE employees
SET salary = salary + 1000
ORDER BY salary ASC
LIMIT 5;
```

(PostgreSQL does NOT allow this directly)

## 4️⃣ DELETE

### ✅ Supported:

* WHERE
* JOIN (DB dependent)
* Subquery
* CTE

### ❌ Not Supported:

* GROUP BY
* HAVING
* Window functions

### ✅ Example 1: DELETE with JOIN (MySQL style)

```sql
DELETE e
FROM employees e
JOIN departments d ON e.dept_id = d.id
WHERE d.name = 'HR';
```

### ✅ Example 2: DELETE with Subquery

```sql
DELETE FROM employees
WHERE id IN (
    SELECT emp_id
    FROM resigned_employees
);
```

### ⚠️ LIMIT in DELETE (MySQL only)

```sql
DELETE FROM logs
ORDER BY created_at ASC
LIMIT 100;
```

## 🎯 Important Points

### 🔹 1. GROUP BY & HAVING are ONLY meaningful in SELECT

(Except when used inside `INSERT...SELECT`)

### 🔹 2. Window functions are SELECT-only

(But can be used inside INSERT…SELECT)

### 🔹 3. JOIN in UPDATE and DELETE is DB-specific

* PostgreSQL → `UPDATE ... FROM`
* MySQL → `UPDATE ... JOIN`
* SQL Server → supports JOIN in UPDATE

### 🔹 4. LIMIT / ORDER BY in UPDATE & DELETE

* Supported in MySQL
* Not supported in PostgreSQL (needs CTE workaround)

Example PostgreSQL workaround:

```sql
WITH cte AS (
    SELECT id
    FROM logs
    ORDER BY created_at
    LIMIT 100
)
DELETE FROM logs
WHERE id IN (SELECT id FROM cte);
```
