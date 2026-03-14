### Which is more efficient - `JOIN + GROUP BY` or `JOIN + Window Function`

`GROUP BY` is generally more efficient because it reduces rows through aggregation, while window functions compute values across partitions while retaining all rows, which may require more processing. The choice depends on whether aggregated results or row-level results are required.

* JOIN + GROUP BY

    Used when you want **one row per group**.
    
    **Example:**
    
    ```sql
    SELECT d.department_id, SUM(e.salary) AS total_salary
    FROM employees e
    JOIN departments d
    ON e.department_id = d.department_id
    GROUP BY d.department_id;
    ```
    
    | department_id | total_salary |
    | ------------- | ------------ |
    | 10            | 50000        |
    | 20            | 70000        |
    
    **Characteristics**
      
    *  ✅ Reduces rows (aggregation)
    *  ✅ Usually less memory usage
    *  ✅ Often faster for pure aggregation


* JOIN + Window Function

    Used when you want **aggregation but still keep all rows**.
    
    **Example:**
    
    ```sql
    SELECT 
        e.employee_id,
        d.department_id,
        e.salary,
        SUM(e.salary) OVER (PARTITION BY d.department_id) AS dept_total
    FROM employees e
    JOIN departments d
    ON e.department_id = d.department_id;
    ```
    
    | employee_id | department_id | salary | dept_total |
    | ----------- | ------------- | ------ | ---------- |
    | 1           | 10            | 20000  | 50000      |
    | 2           | 10            | 30000  | 50000      |
    | 3           | 20            | 70000  | 70000      |
    
    **Characteristics**
    
    * ✅ Keeps **all original rows**
    * ✅ Adds aggregated values as extra columns
    * ❌ Usually more expensive than GROUP BY

* **Performance Comparison**
    
    | Feature                  | JOIN + GROUP BY | JOIN + Window Function |
    | ------------------------ | --------------- | ---------------------- |
    | Rows returned            | Reduced         | Same as original       |
    | Memory usage             | Lower           | Higher                 |
    | Aggregation              | Yes             | Yes                    |
    | Ranking / running totals | No              | Yes                    |
    | Efficiency               | Usually faster  | Slightly slower        |

* Use **GROUP BY** when
  * You need **aggregated results only**
  * Reports / summaries
  * Counts, sums, averages
  * Example: `"Total sales per department"`

* Use **Window Functions** when
  * You need **aggregation but also individual rows**
  * Ranking (`RANK`, `ROW_NUMBER`)
  * Running totals
  * Moving averages
  * Example: `"Show employee salary and department total"`

