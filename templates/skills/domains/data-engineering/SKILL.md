---
name: data-engineering
description: 資料工程。Airflow、Dagster、Kafka Streams、Flink、dbt、資料管道、流處理、資料質量。當使用者提到資料管道、ETL、流處理、資料質量時路由到此。
license: MIT
user-invocable: false
disable-model-invocation: false
---

# 資料工程域 · Data Engineering

## 域概覽

資料工程域涵蓋資料管道編排、流式處理、資料質量保障三大核心領域。

```
資料管道層                流處理層              質量保障層
├── Airflow (排程編排)    ├── Kafka Streams     ├── Great Expectations
├── Dagster (資產管理)    ├── Flink             ├── dbt
└── Prefect (現代工作流)  └── Spark Streaming   └── Soda Core
```

---

## 資料管道編排

### 框架對比

| 特性 | Airflow | Dagster | Prefect |
|------|---------|---------|---------|
| 核心模型 | DAG + Task | Asset + Op | Flow + Task |
| 學習曲線 | 陡峭 | 中等 | 平緩 |
| 資產管理 | 無 | 原生支援 | 無 |
| 動態任務 | 支援 | 支援 | 支援 |
| 本地開發 | 複雜 | 簡單 | 簡單 |
| 社群生態 | 最大 | 成長中 | 成長中 |

### Airflow 核心模式

- DAG 定義：`with DAG(dag_id, schedule, default_args) as dag`
- TaskFlow API：`@task` 裝飾器，自動 XCom 傳遞
- 動態任務：`@task` + `.expand()` 實現 dynamic task mapping
- Operators：PythonOperator / BashOperator / SQL / HTTP / S3
- Sensors：FileSensor / HttpSensor / ExternalTaskSensor
- 重試策略：`retries=3, retry_delay=timedelta(minutes=5), retry_exponential_backoff=True`
- 失敗回撥：`on_failure_callback` 傳送告警
- SLA 監控：`sla=timedelta(hours=2)` + `sla_miss_callback`

### Dagster 核心模式

- Asset 定義：`@asset(group_name, deps)` 宣告資料資產
- MaterializeResult：返回後設資料（行數、預覽等）
- Resources：`ConfigurableResource` 管理外部連線
- Jobs：`define_asset_job(selection=AssetSelection.groups(...))`
- Schedules：`ScheduleDefinition(job, cron_schedule)`
- Sensors：`@sensor(job)` 監聽外部事件觸發
- Partitions：`DailyPartitionsDefinition` 按日分割槽
- Asset Checks：`@asset_check` 驗證資料新鮮度/質量

### Prefect 核心模式

- Flow/Task：`@flow` + `@task(retries=3, cache_key_fn=task_input_hash)`
- 併發：`ConcurrentTaskRunner` + `task.map(items)`
- Deployments：`Deployment.build_from_flow(schedule=CronSchedule(...))`
- Blocks：`Secret` / `JSON` 管理配置和金鑰

### 排程策略 Checklist

- [ ] Cron 表示式正確（`0 2 * * *` 日批 / `*/15 * * * *` 實時）
- [ ] 事件驅動：檔案到達 / S3 / API 觸發
- [ ] 跨 DAG 依賴：ExternalTaskSensor / Asset deps
- [ ] 冪等性：UPSERT / 分割槽覆蓋寫入
- [ ] 增量處理：`WHERE updated_at > last_run`
- [ ] 資料血緣：Dagster 原生 / Airflow Lineage / dbt ref()

---

## 流式處理

### 框架對比

| 特性 | Kafka Streams | Flink | Spark Streaming |
|------|---------------|-------|-----------------|
| 部署模式 | 嵌入式(JVM) | 獨立叢集 | 獨立叢集 |
| 狀態管理 | RocksDB | 記憶體/RocksDB | 記憶體 |
| Exactly-Once | 支援 | 支援 | 支援 |
| 視窗型別 | 豐富 | 最豐富 | 基礎 |
| 學習曲線 | 平緩 | 陡峭 | 中等 |
| Python API | kafka-python | PyFlink | PySpark |

### Kafka Streams 核心模式

- 拓撲構建：`StreamsBuilder` → `stream()` → `filter/map/flatMap` → `to()`
- 聚合：`groupByKey().count()` / `.aggregate()` / `.reduce()`
- Join：Stream-Stream（時間視窗）/ Stream-Table / Table-Table
- 狀態儲存：`Stores.persistentKeyValueStore` + Transformer
- Exactly-Once：`PROCESSING_GUARANTEE_CONFIG = EXACTLY_ONCE_V2`
- 效能調優：`NUM_STREAM_THREADS=4` / `CACHE_MAX_BYTES_BUFFERING` / RocksDB 配置

### Flink 核心模式

- DataStream API：`env.addSource()` → `filter/map` → `addSink()`
- 視窗型別：
  - 滾動視窗 `TumblingProcessingTimeWindows.of(Time.minutes(5))`
  - 滑動視窗 `SlidingProcessingTimeWindows.of(size, slide)`
  - 會話視窗 `ProcessingTimeSessionWindows.withGap(gap)`
  - 全域性視窗 `GlobalWindows.create()` + 自定義 Trigger
- 視窗聚合：`aggregate(AggregateFunction, WindowFunction)` 增量+全視窗
- ProcessFunction：低階 API，訪問時間戳、註冊定時器
- 狀態管理：ValueState / ListState / MapState + TTL 清理
- Checkpoint：`env.enableCheckpointing(60000)` + EXACTLY_ONCE
- Savepoint：`flink run -s /path/to/savepoint`
- 時間語義：Event Time + Watermark（`forBoundedOutOfOrderness`）
- 延遲資料：`allowedLateness()` + `sideOutputLateData()`
- 資料傾斜：新增隨機字首打散 key

### 流處理 Checklist

- [ ] 選擇時間語義：Event Time vs Processing Time
- [ ] Watermark 策略：亂序容忍度設定
- [ ] 視窗型別匹配業務場景
- [ ] 狀態 TTL 防止無限增長
- [ ] Checkpoint 間隔和超時配置
- [ ] Exactly-Once 語義端到端保證
- [ ] 背壓監控和處理
- [ ] 並行度調優

---

## 資料質量

### 質量維度

```
完整性(非空) → 準確性(範圍) → 一致性(關聯) → 及時性(新鮮度) → 有效性(格式)
```

### 工具對比

| 工具 | 優勢 | 適用場景 |
|------|------|----------|
| Great Expectations | 豐富 Expectations、Data Docs | Python 生態、複雜驗證 |
| dbt | SQL 原生、血緣追蹤 | 資料倉儲、轉換測試 |
| Soda Core | 簡潔 YAML 配置 | 快速驗證、CI/CD |

### Great Expectations 核心模式

- Data Context：`gx.get_context()` → 新增資料來源 → 構建批次
- 常用 Expectations：
  - `expect_table_row_count_to_be_between(min, max)`
  - `expect_column_values_to_not_be_null(column)`
  - `expect_column_values_to_be_unique(column)`
  - `expect_column_values_to_be_between(column, min, max)`
  - `expect_column_values_to_be_in_set(column, value_set)`
  - `expect_column_values_to_match_regex(column, regex)`
- Checkpoints：批次執行驗證 + 生成 Data Docs
- 自定義 Expectation：繼承 `ColumnMapExpectation`

### dbt 測試核心模式

- Schema 測試：`unique` / `not_null` / `accepted_values` / `relationships`
- Generic 測試：`{% test name(model, column_name, params) %}`
- Singular 測試：`tests/` 目錄下自定義 SQL，返回行 = 失敗
- dbt_expectations 包：`expect_column_mean_to_be_between` / `expect_row_values_to_have_recent_data`
- 執行：`dbt test` / `dbt test --select model` / `dbt test --store-failures`
- 血緣：`{{ ref('model') }}` + `{{ source('schema', 'table') }}` → `dbt docs generate`

### Soda Core 核心模式

```yaml
checks for table_name:
  - row_count > 100
  - missing_count(column) = 0
  - duplicate_count(column) = 0
  - invalid_count(column) = 0:
      valid format: email
  - freshness(timestamp_col) < 1d
```

### 資料質量 Checklist

- [ ] 分層驗證：源資料 → 轉換後 → 目標資料
- [ ] 完整性：必需列非空、無空字串
- [ ] 準確性：數值範圍、格式正則、邏輯一致
- [ ] 一致性：跨表主鍵匹配、值一致
- [ ] 及時性：資料新鮮度 < 閾值
- [ ] 唯一性：主鍵/業務鍵無重複
- [ ] 質量指標：完整性/唯一性/有效性加權評分
- [ ] 告警：指標低於閾值自動通知（Slack/Email/PagerDuty）
- [ ] 持續監控：定時執行質量檢查

---

## 最佳實踐

| 實踐 | 說明 |
|------|------|
| 冪等性設計 | UPSERT / 分割槽覆蓋，重跑不產生副作用 |
| 增量處理 | 基於時間戳/CDC 增量提取，減少全量掃描 |
| 資料血緣 | dbt ref() / Dagster Asset deps 追蹤上下游 |
| 分層驗證 | 源→轉換→目標每層都驗證 |
| 監控告警 | 管道 SLA + 質量指標 + 延遲告警 |
| 狀態管理 | 流處理狀態 TTL + Checkpoint + Savepoint |
| 容錯設計 | 重試策略 + 死信佇列 + 回滾方案 |

## 觸發詞

資料管道、Airflow、Dagster、Prefect、ETL、流處理、Kafka Streams、Flink、資料質量、Great Expectations、dbt、資料驗證、資料血緣
