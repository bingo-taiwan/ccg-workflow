---
name: caching
description: 快取策略秘典。快取模式、Redis實踐、三大問題、CDN、快取一致性。當使用者提到快取、Redis、CDN、快取穿透、快取擊穿、快取雪崩時路由到此。
---

# 🏗 陣法秘典 · 快取策略


## 快取層次

```
客戶端快取 (瀏覽器/App)
    ↓ miss
CDN 快取 (邊緣節點)
    ↓ miss
閘道器快取 (Nginx/API Gateway)
    ↓ miss
應用快取 (本地記憶體/程序內)
    ↓ miss
分散式快取 (Redis/Memcached)
    ↓ miss
資料庫
```

| 層級 | 延遲 | 容量 | 一致性 |
|------|------|------|--------|
| L1 本地記憶體 | ~ns | MB級 | 程序內一致 |
| L2 分散式快取 | ~ms | GB級 | 最終一致 |
| L3 CDN | ~10ms | TB級 | TTL控制 |
| DB | ~10-100ms | PB級 | 強一致 |

---

## 快取模式

### Cache-Aside (旁路快取)

```
讀:
  1. 查快取 → 命中 → 返回
  2. 未命中 → 查DB → 寫入快取 → 返回

寫:
  1. 更新DB
  2. 刪除快取 (而非更新)
```

```python
def get_user(user_id: str) -> dict:
    # 1. 查快取
    cached = redis.get(f"user:{user_id}")
    if cached:
        return json.loads(cached)
    
    # 2. 查DB
    user = db.query("SELECT * FROM users WHERE id = %s", user_id)
    
    # 3. 寫快取
    redis.setex(f"user:{user_id}", 3600, json.dumps(user))
    return user

def update_user(user_id: str, data: dict):
    db.execute("UPDATE users SET ... WHERE id = %s", user_id)
    redis.delete(f"user:{user_id}")  # 刪除而非更新
```

**適用**：通用場景，應用控制快取邏輯。

### Read-Through (讀穿透)

```
讀:
  1. 查快取 → 命中 → 返回
  2. 未命中 → 快取層自動查DB → 寫入快取 → 返回

應用只與快取互動，不直接訪問DB。
```

**適用**：快取中介軟體支援（如 Hibernate L2 Cache）。

### Write-Through (寫穿透)

```
寫:
  1. 寫快取
  2. 快取層同步寫DB
  3. 兩者都成功才返回
```

**適用**：強一致性要求，寫入不頻繁。

### Write-Behind (非同步寫回)

```
寫:
  1. 寫快取 → 立即返回
  2. 快取層非同步批次寫DB

風險: 快取宕機可能丟資料
```

**適用**：寫入頻繁、可容忍短暫不一致。

---

## Redis 實踐

### 資料結構選型

| 結構 | 場景 | 示例 |
|------|------|------|
| String | 簡單KV、計數器 | 使用者資訊、頁面PV |
| Hash | 物件屬性 | 使用者Profile各欄位 |
| List | 佇列、最新列表 | 訊息佇列、最新動態 |
| Set | 去重、交集 | 標籤、共同好友 |
| Sorted Set | 排行榜、延遲佇列 | 積分排名、定時任務 |
| Stream | 訊息流 | 事件日誌 |

### 過期策略

```yaml
策略:
  惰性刪除: 訪問時檢查是否過期
  定期刪除: 每秒隨機檢查一批 key
  記憶體淘汰: 記憶體滿時觸發

淘汰策略 (maxmemory-policy):
  volatile-lru:   有過期時間的 key 中 LRU
  allkeys-lru:    所有 key 中 LRU (推薦)
  volatile-ttl:   有過期時間的 key 中 TTL 最小
  noeviction:     不淘汰，寫入報錯
```

### 分散式鎖

```python
import redis
import uuid

def acquire_lock(conn: redis.Redis, lock_name: str, timeout: int = 10) -> str:
    token = str(uuid.uuid4())
    if conn.set(f"lock:{lock_name}", token, nx=True, ex=timeout):
        return token
    return None

def release_lock(conn: redis.Redis, lock_name: str, token: str) -> bool:
    # Lua 指令碼保證原子性
    script = """
    if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
    else
        return 0
    end
    """
    return conn.eval(script, 1, f"lock:{lock_name}", token)
```

---

## 三大問題

### 快取穿透 (Cache Penetration)

```
問題: 查詢不存在的資料，每次都打到DB
攻擊: 惡意請求大量不存在的ID

解決方案:
  1. 布隆過濾器 (Bloom Filter)
     請求 → 布隆過濾器 → 不存在則直接返回
     
  2. 快取空值
     redis.setex(f"user:{user_id}", 300, "NULL")  # 短TTL
     
  3. 引數校驗
     ID格式校驗，攔截非法請求
```

### 快取擊穿 (Cache Breakdown)

```
問題: 熱點key過期瞬間，大量請求打到DB

解決方案:
  1. 互斥鎖 (Mutex)
     未命中 → 獲取鎖 → 查DB → 寫快取 → 釋放鎖
     其他請求等待或返回舊值
     
  2. 永不過期 + 非同步更新
     邏輯過期: 快取中儲存過期時間，過期後非同步重新整理
     
  3. 熱點預載入
     提前重新整理即將過期的熱點key
```

### 快取雪崩 (Cache Avalanche)

```
問題: 大量key同時過期，或快取服務宕機

解決方案:
  1. 過期時間加隨機值
     ttl = base_ttl + random(0, 300)  # 打散過期時間
     
  2. 多級快取
     L1(本地) + L2(Redis) → Redis掛了還有本地快取
     
  3. 熔斷降級
     快取不可用時，限流 + 降級返回預設值
     
  4. Redis 高可用
     Sentinel / Cluster 模式
```

---

## CDN 快取

### 快取策略

```yaml
靜態資源:
  Cache-Control: public, max-age=31536000, immutable
  檔名含 hash: app.a1b2c3.js

API 響應:
  Cache-Control: public, max-age=60, s-maxage=300
  Vary: Accept-Encoding, Authorization

不快取:
  Cache-Control: no-store
  Set-Cookie 響應
```

### 快取失效

```bash
# 主動失效
aws cloudfront create-invalidation \
  --distribution-id E1234 \
  --paths "/api/*" "/images/logo.png"

# 版本化 URL (推薦)
/static/app.v2.js  → 新版本新URL，無需失效
```

---

## 快取一致性

### 最終一致性方案

```
方案1: 先更新DB，再刪快取 (推薦)
  問題: 刪快取失敗 → 資料不一致
  解決: 重試機制 / 訊息佇列非同步刪除

方案2: 延遲雙刪
  1. 刪快取
  2. 更新DB
  3. 延遲N秒再刪快取 (覆蓋併發讀寫)

方案3: 訂閱 Binlog
  DB變更 → Binlog → Canal/Debezium → 刪除/更新快取
  最可靠，但架構複雜
```

### 一致性級別選擇

| 級別 | 方案 | 延遲 | 複雜度 |
|------|------|------|--------|
| 強一致 | Write-Through | 高 | 中 |
| 最終一致 | Cache-Aside + 刪除 | 低 | 低 |
| 最終一致(可靠) | Binlog 訂閱 | 中 | 高 |

---

## 最佳實踐

```yaml
設計:
  - 快取 key 規範: {業務}:{實體}:{ID}
  - 合理 TTL: 熱資料短(分鐘)，冷資料長(小時)
  - 大 value 拆分: 單 value < 10KB
  - 避免 Big Key: 集合型別 < 5000 元素

運維:
  - 監控命中率 (目標 > 95%)
  - 監控記憶體使用和淘汰率
  - 慢查詢日誌分析
  - 定期清理無用 key

安全:
  - 禁止外網直連 Redis
  - 啟用 AUTH 認證
  - 禁用危險命令 (KEYS/FLUSHALL)
  - 定期備份 (RDB + AOF)
```

