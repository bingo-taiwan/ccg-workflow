---
name: database
description: 資料庫設計與最佳化。SQL、NoSQL、索引、查詢最佳化。當使用者提到資料庫、SQL、PostgreSQL、MySQL、MongoDB、Redis時使用。
---

# 🔧 煉器秘典 · 資料庫


## SQL 基礎

### 查詢
```sql
-- 基礎查詢
SELECT id, name, email
FROM users
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;

-- 聚合
SELECT department, COUNT(*) as count, AVG(salary) as avg_salary
FROM employees
GROUP BY department
HAVING COUNT(*) > 5;

-- 連線
SELECT u.name, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.created_at > '2024-01-01';

-- 子查詢
SELECT * FROM users
WHERE id IN (
    SELECT user_id FROM orders
    WHERE total > 1000
);

-- CTE
WITH active_users AS (
    SELECT * FROM users WHERE status = 'active'
)
SELECT * FROM active_users WHERE created_at > '2024-01-01';

-- 視窗函式
SELECT name, salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rank
FROM employees;
```

### 索引
```sql
-- 建立索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);

-- 部分索引
CREATE INDEX idx_active_users ON users(email) WHERE status = 'active';

-- 檢視執行計劃
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```

### 索引策略
```yaml
適合索引:
  - WHERE 條件列
  - JOIN 關聯列
  - ORDER BY 排序列
  - 高選擇性列

不適合索引:
  - 頻繁更新的列
  - 低選擇性列 (如性別)
  - 小表

複合索引:
  - 最左字首原則
  - 選擇性高的列在前
```

## PostgreSQL

### 特性
```sql
-- JSON 支援
SELECT data->>'name' as name
FROM users
WHERE data @> '{"status": "active"}';

-- 陣列
SELECT * FROM posts
WHERE tags @> ARRAY['python', 'web'];

-- 全文搜尋
SELECT * FROM articles
WHERE to_tsvector('english', content) @@ to_tsquery('python & web');

-- UPSERT
INSERT INTO users (email, name)
VALUES ('test@example.com', 'Test')
ON CONFLICT (email)
DO UPDATE SET name = EXCLUDED.name;
```

## MySQL

### 特性
```sql
-- 全文搜尋
SELECT * FROM articles
WHERE MATCH(title, content) AGAINST('python web' IN NATURAL LANGUAGE MODE);

-- JSON
SELECT JSON_EXTRACT(data, '$.name') as name
FROM users
WHERE JSON_EXTRACT(data, '$.status') = 'active';

-- 分割槽表
CREATE TABLE orders (
    id INT,
    created_at DATE
) PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025)
);
```

## NoSQL

### MongoDB
```javascript
// 查詢
db.users.find({ status: "active" })
db.users.find({ age: { $gt: 18 } })
db.users.find({ tags: { $in: ["python", "web"] } })

// 聚合
db.orders.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: "$user_id", total: { $sum: "$amount" } } },
    { $sort: { total: -1 } },
    { $limit: 10 }
])

// 索引
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ location: "2dsphere" })
```

### Redis
```bash
# 字串
SET key value
GET key
SETEX key 3600 value  # 帶過期時間

# 雜湊
HSET user:1 name "Alice" email "alice@example.com"
HGET user:1 name
HGETALL user:1

# 列表
LPUSH queue task1
RPOP queue

# 集合
SADD tags python web
SMEMBERS tags
SINTER tags1 tags2

# 有序集合
ZADD leaderboard 100 user1
ZRANGE leaderboard 0 9 WITHSCORES

# 過期
EXPIRE key 3600
TTL key
```

## 查詢最佳化

```yaml
原則:
  - 只查詢需要的列
  - 避免 SELECT *
  - 使用索引
  - 避免全表掃描
  - 分頁查詢

技巧:
  - EXPLAIN 分析執行計劃
  - 避免在索引列上使用函式
  - 使用覆蓋索引
  - 批次操作代替迴圈
  - 合理使用快取
```

## 資料庫設計

```yaml
正規化:
  - 1NF: 原子性
  - 2NF: 消除部分依賴
  - 3NF: 消除傳遞依賴

反正規化:
  - 適當冗餘提高查詢效能
  - 讀多寫少場景

命名規範:
  - 表名: 複數小寫 (users, orders)
  - 列名: 小寫下劃線 (created_at)
  - 索引: idx_表名_列名
```

