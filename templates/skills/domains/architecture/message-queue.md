---
name: message-queue
description: 訊息佇列秘典。Kafka、RabbitMQ、Redis Streams、事件驅動架構。當使用者提到訊息佇列、Kafka、RabbitMQ、事件驅動、CQRS、Saga時路由到此。
---

# 🏗 陣法秘典 · 訊息佇列


## 核心概念

```
Producer → Broker → Consumer
  傳送       儲存       消費
  
模式:
  點對點 (Queue):  1 Producer → 1 Consumer
  釋出訂閱 (Topic): 1 Producer → N Consumers
```

| 概念 | 含義 | 類比 |
|------|------|------|
| Producer | 訊息生產者 | 發令者 |
| Consumer | 訊息消費者 | 執行者 |
| Broker | 訊息中介軟體 | 傳令陣 |
| Topic/Queue | 訊息通道 | 傳音符 |
| Partition | 分割槽（並行單元） | 陣眼 |
| Offset | 消費位置 | 修行進度 |

---

## Kafka

### 架構

```
Producer ──→ Broker Cluster ──→ Consumer Group
               │
          ┌────┴────┐
          │ Topic-A  │
          │ P0 P1 P2 │  (3 Partitions)
          └──────────┘
          
Replication: Leader + Followers
ZooKeeper/KRaft: 後設資料管理
```

### 生產者

```python
from confluent_kafka import Producer

conf = {
    'bootstrap.servers': 'kafka:9092',
    'acks': 'all',                    # 等待所有副本確認
    'retries': 3,
    'retry.backoff.ms': 1000,
    'enable.idempotence': True,       # 冪等生產者
    'linger.ms': 5,                   # 批次傳送延遲
    'batch.size': 16384,              # 批次大小
    'compression.type': 'snappy',     # 壓縮
}

producer = Producer(conf)

def delivery_report(err, msg):
    if err:
        print(f"Delivery failed: {err}")

producer.produce(
    topic='orders',
    key=order_id.encode(),    # 相同 key → 相同 partition → 有序
    value=json.dumps(order).encode(),
    callback=delivery_report
)
producer.flush()
```

### 消費者

```python
from confluent_kafka import Consumer

conf = {
    'bootstrap.servers': 'kafka:9092',
    'group.id': 'order-processor',
    'auto.offset.reset': 'earliest',
    'enable.auto.commit': False,      # 手動提交
    'max.poll.interval.ms': 300000,
}

consumer = Consumer(conf)
consumer.subscribe(['orders'])

try:
    while True:
        msg = consumer.poll(1.0)
        if msg is None:
            continue
        if msg.error():
            handle_error(msg.error())
            continue
        
        process_message(msg.value())
        consumer.commit(asynchronous=False)  # 處理成功後提交
finally:
    consumer.close()
```

### Kafka 關鍵配置

```yaml
Broker:
  num.partitions: 6                # 預設分割槽數
  default.replication.factor: 3    # 副本數
  min.insync.replicas: 2           # 最小同步副本
  log.retention.hours: 168         # 保留 7 天
  log.segment.bytes: 1073741824    # 1GB 段檔案

Topic 設計:
  分割槽數 = max(生產吞吐/單分割槽寫入能力, 消費者數)
  副本數 = 3 (生產環境)
  Key 選擇: 業務ID (保證同一實體有序)
```

---

## RabbitMQ

### Exchange 型別

| 型別 | 路由規則 | 適用場景 |
|------|----------|----------|
| Direct | 精確匹配 routing key | 點對點 |
| Fanout | 廣播到所有繫結佇列 | 釋出訂閱 |
| Topic | 萬用字元匹配 routing key | 靈活路由 |
| Headers | 匹配訊息頭 | 複雜路由 |

```
Producer → Exchange → Binding → Queue → Consumer
              │
         routing_key 匹配
```

### 可靠性保證

```yaml
生產者:
  - Publisher Confirms (確認模式)
  - 持久化訊息 (delivery_mode=2)
  - 事務模式 (效能差，不推薦)

Broker:
  - 持久化佇列 (durable=True)
  - 映象佇列 / Quorum Queue
  - 磁碟持久化

消費者:
  - 手動 ACK (auto_ack=False)
  - 預取限制 (prefetch_count)
  - 死信佇列 (DLX) 處理失敗訊息
```

### 死信佇列 (DLQ)

```
正常佇列 ──(消費失敗/TTL過期/佇列滿)──→ 死信交換機 → 死信佇列
                                                        │
                                              人工處理 / 重試
```

---

## Redis Streams

```bash
# 生產
XADD orders * user_id "123" amount "99.99"

# 消費組
XGROUP CREATE orders order-group $ MKSTREAM
XREADGROUP GROUP order-group consumer-1 COUNT 10 BLOCK 5000 STREAMS orders >

# 確認
XACK orders order-group <message-id>

# 檢視待處理
XPENDING orders order-group
```

| 特性 | 適用 | 不適用 |
|------|------|--------|
| 輕量級 | 中小規模、低延遲 | 海量資料持久化 |
| 消費組 | 多消費者並行 | 複雜路由 |
| 記憶體儲存 | 實時處理 | 長期儲存 |

---

## 事件驅動架構

### Event Sourcing

```
傳統: 只存最終狀態
  Account { balance: 100 }

Event Sourcing: 儲存所有事件
  AccountCreated { initial: 0 }
  MoneyDeposited { amount: 200 }
  MoneyWithdrawn { amount: 100 }
  → 重放得到 balance: 100
```

### CQRS (Command Query Responsibility Segregation)

```
Command (寫) ──→ Write Model ──→ Event Store
                                    │
                              Event Bus
                                    │
Query (讀) ←── Read Model ←── Projection
```

### Saga 模式

```
分散式事務編排:

Choreography (編舞):
  Order → Payment → Inventory → Shipping
    每個服務監聽事件，自主決策

Orchestration (編排):
  Saga Orchestrator
    ├→ Order Service: 建立訂單
    ├→ Payment Service: 扣款
    ├→ Inventory Service: 扣庫存
    └→ Shipping Service: 發貨
    
  失敗補償:
    Shipping失敗 → 補償Inventory → 補償Payment → 補償Order
```

---

## 選型對比

| 維度 | Kafka | RabbitMQ | Redis Streams |
|------|-------|----------|---------------|
| 吞吐量 | 極高 (百萬/s) | 高 (萬/s) | 高 (十萬/s) |
| 延遲 | ms 級 | μs-ms 級 | μs 級 |
| 持久化 | 磁碟 | 磁碟/記憶體 | 記憶體+AOF |
| 訊息順序 | 分割槽內有序 | 佇列內有序 | 流內有序 |
| 訊息回溯 | ✅ 支援 | ❌ 不支援 | ✅ 支援 |
| 協議 | 自有協議 | AMQP | Redis協議 |
| 適用 | 大資料/日誌/流處理 | 業務訊息/RPC | 輕量級實時 |

### 選型決策樹

```
需要訊息回溯？
  ├─ 是 → Kafka / Redis Streams
  └─ 否 → 需要複雜路由？
       ├─ 是 → RabbitMQ
       └─ 否 → 吞吐量要求？
            ├─ 極高 (>10萬/s) → Kafka
            ├─ 中等 → RabbitMQ
            └─ 輕量 → Redis Streams
```

---

## 常見問題

### 訊息丟失

```yaml
防丟三板斧:
  生產端: acks=all + retries + 冪等
  Broker: replication + 持久化 + min.insync.replicas
  消費端: 手動提交 + 處理後確認
```

### 訊息重複

```yaml
冪等處理:
  - 資料庫唯一約束 (message_id)
  - Redis SETNX 去重
  - 業務層冪等設計 (狀態機)
```

### 訊息積壓

```yaml
應急:
  - 增加消費者例項
  - 臨時擴大分割槽 (Kafka)
  - 跳過非關鍵訊息

根治:
  - 最佳化消費者處理速度
  - 合理設定分割槽數
  - 監控消費 lag 告警
```

---

## 最佳實踐

```yaml
設計:
  - 訊息體儘量小，大資料用引用
  - 訊息必須包含唯一ID和時間戳
  - 定義清晰的訊息 Schema (Avro/Protobuf)
  - 版本相容 (向後相容)

運維:
  - 監控消費 lag
  - 死信佇列告警
  - 定期清理過期訊息
  - 容量規劃 (磁碟/記憶體)

安全:
  - TLS 加密傳輸
  - SASL 認證
  - ACL 授權
  - 審計日誌
```

