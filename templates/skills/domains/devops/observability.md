---
name: observability
description: 可觀測性秘典。日誌、指標、追蹤三大支柱，告警設計，SLI/SLO/SLA。當使用者提到可觀測性、日誌、監控、指標、追蹤、告警、SLO時路由到此。
---

# 🔧 煉器秘典 · 可觀測性


## 三大支柱

```
┌─────────────────────────────────────────┐
│            可觀測性 (Observability)       │
├─────────────┬─────────────┬─────────────┤
│   📋 日誌   │   📊 指標   │   🔗 追蹤   │
│   Logs      │   Metrics   │   Traces    │
│  離散事件   │  聚合數值   │  請求鏈路   │
│  What       │  How much   │  Where      │
└─────────────┴─────────────┴─────────────┘
```

| 支柱 | 特徵 | 適用場景 | 代表工具 |
|------|------|----------|----------|
| 日誌 | 離散、非結構化/結構化事件 | 除錯、審計、錯誤追蹤 | ELK, Loki, CloudWatch |
| 指標 | 聚合數值、時間序列 | 告警、趨勢、容量規劃 | Prometheus, Datadog, CloudWatch |
| 追蹤 | 分散式請求鏈路 | 延遲分析、依賴對映 | Jaeger, Zipkin, X-Ray |

---

## 日誌 (Logs)

### 結構化日誌

```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "level": "ERROR",
  "service": "order-service",
  "trace_id": "abc123",
  "span_id": "def456",
  "message": "Payment failed",
  "error": "InsufficientFunds",
  "user_id": "u-789",
  "order_id": "o-012",
  "amount": 99.99,
  "duration_ms": 234
}
```

### 日誌級別規範

| 級別 | 用途 | 生產環境 |
|------|------|----------|
| TRACE | 極細粒度除錯 | ❌ 關閉 |
| DEBUG | 開發除錯資訊 | ❌ 關閉 |
| INFO | 業務關鍵事件 | ✅ 開啟 |
| WARN | 潛在問題，可自愈 | ✅ 開啟 |
| ERROR | 錯誤，需關注 | ✅ 開啟 + 告警 |
| FATAL | 致命錯誤，服務不可用 | ✅ 開啟 + 緊急告警 |

### 日誌聚合架構

```
應用 → Filebeat/Fluentd → Kafka(緩衝) → Logstash → Elasticsearch → Kibana
                                       → S3(歸檔)
```

### 日誌最佳實踐

- ✅ 結構化 JSON 格式
- ✅ 包含 trace_id 關聯追蹤
- ✅ 敏感資料脫敏
- ✅ 合理的保留策略（熱/溫/冷）
- ❌ 不記錄密碼/Token
- ❌ 不在迴圈中打日誌
- ❌ 不用字串拼接（用引數化）

---

## 指標 (Metrics)

### Prometheus 指標型別

| 型別 | 用途 | 示例 |
|------|------|------|
| Counter | 只增不減的計數器 | 請求總數、錯誤總數 |
| Gauge | 可增可減的瞬時值 | 當前連線數、佇列長度 |
| Histogram | 分佈統計（桶） | 請求延遲分佈 |
| Summary | 分佈統計（分位數） | 請求延遲 P99 |

### 關鍵 PromQL

```promql
# 請求速率
rate(http_requests_total[5m])

# 錯誤率
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# P99 延遲
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))

# CPU 使用率
1 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) by (instance)

# 記憶體使用率
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes
```

### Grafana Dashboard 設計

```yaml
四大黃金訊號 Dashboard:
  Row 1 - 流量:
    - QPS (rate)
    - 按 endpoint 分組
  Row 2 - 錯誤:
    - 錯誤率 (%)
    - 按錯誤型別分組
  Row 3 - 延遲:
    - P50/P95/P99
    - 延遲熱力圖
  Row 4 - 飽和度:
    - CPU/Memory/Disk
    - 連線池使用率
```

---

## 追蹤 (Traces)

### OpenTelemetry 整合

```python
# Python 示例
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

provider = TracerProvider()
processor = BatchSpanProcessor(OTLPSpanExporter(endpoint="http://collector:4317"))
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

tracer = trace.get_tracer(__name__)

@tracer.start_as_current_span("process_order")
def process_order(order_id: str):
    span = trace.get_current_span()
    span.set_attribute("order.id", order_id)
    # 業務邏輯...
```

### 追蹤架構

```
Service-A → Service-B → Service-C
    │            │            │
    └── Span ────┴── Span ────┴── Span
         │
    Trace (trace_id 貫穿全鏈路)
```

### Context Propagation

```
HTTP Header: traceparent: 00-{trace_id}-{span_id}-{flags}
gRPC Metadata: 自動傳播
Message Queue: 訊息頭注入 trace context
```

---

## 告警設計

### 告警分級

| 級別 | 響應時間 | 通知方式 | 示例 |
|------|----------|----------|------|
| P0 Critical | 立即 | 電話 + PagerDuty | 服務完全不可用 |
| P1 High | 15 min | Slack + 簡訊 | 錯誤率 > 5% |
| P2 Medium | 1 hour | Slack | 延遲 P99 > 閾值 |
| P3 Low | 次日 | 郵件/工單 | 磁碟使用 > 70% |

### 告警規則示例

```yaml
# Prometheus AlertManager
groups:
  - name: service-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate on {{ $labels.instance }}"

      - alert: HighLatency
        expr: histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
```

### 告警最佳實踐

- ✅ 基於 SLO 告警，而非資源指標
- ✅ 設定合理的 `for` 持續時間，避免抖動
- ✅ 告警必須可操作（收到告警知道該做什麼）
- ✅ 定期審查告警，清理無效告警
- ❌ 不對每個指標都告警（告警疲勞）
- ❌ 不設過低閾值（噪音）

---

## SLI / SLO / SLA

### 定義

| 概念 | 含義 | 示例 |
|------|------|------|
| SLI (指標) | 服務質量的量化度量 | 請求成功率、P99 延遲 |
| SLO (目標) | SLI 的目標值 | 可用性 99.9%、P99 < 200ms |
| SLA (協議) | 對外承諾 + 違約後果 | 99.9% 可用，否則賠償 |

### Error Budget

```
SLO = 99.9% 可用性
Error Budget = 1 - 0.999 = 0.1%
每月 Error Budget = 30天 × 24小時 × 60分鐘 × 0.001 = 43.2 分鐘

已消耗: 15 分鐘
剩餘: 28.2 分鐘
```

### SLO Dashboard

```yaml
SLO Dashboard:
  - 當前 SLI 值 vs SLO 目標
  - Error Budget 剩餘百分比
  - Error Budget 消耗速率
  - 30天滾動視窗趨勢
  - Burn Rate 告警狀態
```

---

## 可觀測性清單

```yaml
日誌:
  - [ ] 結構化 JSON 格式
  - [ ] trace_id 關聯
  - [ ] 敏感資料脫敏
  - [ ] 保留策略配置

指標:
  - [ ] 四大黃金訊號覆蓋
  - [ ] 自定義業務指標
  - [ ] Dashboard 就緒
  - [ ] 告警規則配置

追蹤:
  - [ ] OpenTelemetry 整合
  - [ ] 跨服務 Context Propagation
  - [ ] 取樣策略配置
  - [ ] 關鍵路徑標註

告警:
  - [ ] 基於 SLO 的告警
  - [ ] 分級通知渠道
  - [ ] Runbook 關聯
  - [ ] 定期審查機制
```

