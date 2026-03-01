# System Design: The Database Selection Framework

Choosing a database is one of the most consequential decisions in system design. This guide provides a structured, multi-step methodology to narrow down the search space from "every possible tool" to the "right tool for the job."

## Step 1: The Three Core Questions (Pre-Analysis)

Before mentioning a specific product, define the operational characteristics of your workload.

1. **Workload Type:** Is this **OLTP** (Online Transaction Processing), **Analytics** (OLAP), or **Search/Logging**?
2. **Traffic Pattern:** Is the traffic **Read-heavy**, **Write-heavy**, or **Balanced**?
3. **Consistency Requirements:** Does the business logic require **Strong Consistency** (e.g., banking) or is **Eventual Consistency** acceptable (e.g., social media likes)?

## Step 2: Choose the Data Model Family

Identify the logical structure of your data before picking a vendor.

| Model Family | Best Use Case | Rule of Thumb |
| --- | --- | --- |
| **Relational** | Complex relationships, ACID transactions. | "Follow the money." Use for payments and orders. |
| **Document** | Flexible JSON-like records, evolving schemas. | User profiles, content management, catalogs. |
| **Key-Value** | Simple ID lookups, extremely low latency. | Sessions, feature flags, rate limiting. |
| **Columnar** | Heavy reporting on massive historical sets. | BI dashboards, aggregate trends on billions of rows. |
| **Time-Series** | Metrics or events indexed by time. | IoT sensors, server monitoring, clickstream. |
| **Search Index** | Free-text search, fuzzy matching, ranking. | Product search, log exploration. |

## Step 3: Map to Technologies

Once the model is selected, map it to the industry-standard tools.

### 1. Classic Relational (OLTP)

* **Usage:** User accounts, bookings, financial ledgers.
* **Tech:** `PostgreSQL`, `MySQL`.

### 2. Distributed SQL (High-Scale Relational)

* **Usage:** High-scale or multi-region writes with ACID guarantees.
* **Tech:** `CockroachDB`, `YugabyteDB`, `TiDB`.

### 3. Key-Value & Caching

* **Usage:** Temporary state, hot-key management.
* **Tech:** `Redis`, `Memcached`.

### 4. Document Store

* **Usage:** Hierarchical data, rapid application iteration.
* **Tech:** `MongoDB`, `Couchbase`.

### 5. Wide Column Store

* **Usage:** Massive scale, write-heavy, sparse tables (Big Data).
* **Tech:** `Cassandra`, `HBase`.

### 6. Columnar Analytics (OLAP)

* **Usage:** Offline analytics, complex aggregations.
* **Tech:** `ClickHouse`, `BigQuery`, `Snowflake`.

### 7. Time-Series & Metrics

* **Usage:** High-ingest rate of timestamped data.
* **Tech:** `TimescaleDB` (Postgres-based), `InfluxDB`, `Prometheus`.

### 8. Logs & Search

* **Usage:** Full-text indexing and observability.
* **Tech:** `Elasticsearch`, `OpenSearch`.

## Step 4: Database Scaling Techniques

Once a database is chosen, use these techniques to handle growth and performance bottlenecks:

1. **Indexing:** Speed up read queries by creating indexes on frequently accessed columns.
2. **Vertical Scaling:** Add more CPU, RAM, or storage to the database server to handle higher workloads.
3. **Caching:** Use in-memory stores like Redis to serve hot data faster and reduce DB load.
4. **Sharding:** Split the database into smaller, independent shards and distribute them across servers for horizontal scaling.
5. **Replication:** Create multiple copies (replicas) to balance read traffic and improve availability.
6. **Query Optimization:** Fine-tune SQL, eliminate expensive operations, and leverage indexes effectively.
7. **Connection Pooling:** Reduce overhead by reusing existing database connections.
8. **Vertical Partitioning:** Split large tables into smaller ones containing a subset of the original columns.
9. **Denormalization:** Store redundant data to minimize complex joins in read-heavy workloads.
10. **Materialized Views:** Pre-compute and store results of complex queries to avoid expensive recalculation.

## Step 5: Internal Decision Flow

Use this logic during design interviews to justify your choice:

1. **Is it core transactional data requiring strong consistency?**
    * **YES:** Start with `Postgres` or `MySQL`.
    * *Scale-up required?* Move to `CockroachDB`.


2. **Is it analytics or reporting over large history?**
    * **YES:** Replicate data into a columnar store like `ClickHouse`.


3. **Is it metrics or time-series?**
    * **YES:** Use `Timescale` or `Influx`.


4. **Is it full-text search or logs?**
    * **YES:** Use `Elasticsearch`.


5. **Need sub-millisecond latency for a small working set?**
    * **YES:** Add a `Redis` cache layer in front of the primary store.
