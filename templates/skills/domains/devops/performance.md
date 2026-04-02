---
name: performance
description: 效能最佳化秘典。效能分析方法論、Profiling、火焰圖、基準測試、瓶頸最佳化。當使用者提到效能、延遲、吞吐、Profiling、火焰圖、基準測試時路由到此。
---

# 🔧 煉器秘典 · 效能最佳化


## 效能分析方法論

### USE 方法 (Utilization, Saturation, Errors)

對每個資源檢查三個維度：

| 維度 | 含義 | 工具 |
|------|------|------|
| Utilization | 資源繁忙時間佔比 | `top`, `vmstat`, `iostat` |
| Saturation | 排隊等待的工作量 | `vmstat`(r列), `iostat`(avgqu-sz) |
| Errors | 錯誤事件計數 | `dmesg`, 應用日誌 |

```bash
# CPU USE
mpstat -P ALL 1          # Utilization per core
vmstat 1                 # Saturation (r > CPU count)
dmesg | grep -i error    # Errors

# Memory USE
free -m                  # Utilization
vmstat 1 | awk '{print $3,$4}'  # Saturation (si/so > 0 = swapping)

# Disk USE
iostat -xz 1             # Utilization (%util), Saturation (avgqu-sz)

# Network USE
sar -n DEV 1             # Utilization
netstat -s | grep -i error  # Errors
```

### RED 方法 (Rate, Errors, Duration)

面向服務的效能指標：

| 維度 | 含義 | 示例 |
|------|------|------|
| Rate | 每秒請求數 | QPS/RPS |
| Errors | 每秒錯誤數 | 5xx/s |
| Duration | 請求延遲分佈 | P50/P95/P99 |

```promql
# Prometheus PromQL 示例
rate(http_requests_total[5m])                    # Rate
rate(http_requests_total{status=~"5.."}[5m])     # Errors
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))  # P99
```

---

## Profiling 工具

### CPU Profiling

| 語言 | 工具 | 命令 |
|------|------|------|
| Python | cProfile / py-spy | `py-spy record -o profile.svg -- python app.py` |
| Go | pprof | `go tool pprof http://localhost:6060/debug/pprof/profile` |
| Java | async-profiler | `./profiler.sh -d 30 -f flame.html <pid>` |
| Node.js | clinic.js | `clinic flame -- node app.js` |
| Rust | cargo-flamegraph | `cargo flamegraph` |
| 系統級 | perf | `perf record -g -p <pid> -- sleep 30` |

### Memory Profiling

```bash
# Python
python -m memory_profiler script.py
# 或使用 tracemalloc
python -c "import tracemalloc; tracemalloc.start(); ..."

# Go
go tool pprof http://localhost:6060/debug/pprof/heap

# Java
jmap -dump:format=b,file=heap.hprof <pid>
jhat heap.hprof  # 或用 MAT/VisualVM 分析

# 系統級
valgrind --tool=massif ./program
```

### I/O Profiling

```bash
# 磁碟 I/O
iostat -xz 1
iotop -oP
strace -e trace=read,write -p <pid>

# 網路 I/O
ss -tnp                    # 連線狀態
tcpdump -i eth0 -w cap.pcap  # 抓包
```

---

## 火焰圖

### 生成流程

```bash
# 1. 採集資料
perf record -F 99 -g -p <pid> -- sleep 30

# 2. 生成火焰圖
perf script | stackcollapse-perf.pl | flamegraph.pl > flame.svg

# 3. 解讀
# X軸：函式在取樣中出現的比例（越寬=越耗時）
# Y軸：呼叫棧深度
# 顏色：隨機，無特殊含義
```

### 解讀要點

| 特徵 | 含義 | 行動 |
|------|------|------|
| 寬平頂 | 該函式自身耗時大 | 最佳化該函式邏輯 |
| 寬塔形 | 呼叫鏈深但每層都耗時 | 減少呼叫層級 |
| 多個窄尖峰 | 多處小開銷累積 | 關注熱路徑 |

---

## 基準測試

### HTTP 基準測試

```bash
# wrk (推薦)
wrk -t12 -c400 -d30s http://localhost:8080/api

# ab (Apache Bench)
ab -n 10000 -c 100 http://localhost:8080/api

# hey
hey -n 10000 -c 100 http://localhost:8080/api

# k6 (指令碼化)
k6 run --vus 100 --duration 30s script.js
```

### 程式碼級基準測試

```python
# Python - pytest-benchmark
def test_sort_benchmark(benchmark):
    data = list(range(1000, 0, -1))
    benchmark(sorted, data)

# Go
func BenchmarkSort(b *testing.B) {
    for i := 0; i < b.N; i++ {
        sort.Ints(generateData())
    }
}

# Rust
#[bench]
fn bench_sort(b: &mut Bencher) {
    b.iter(|| sort_data(test::black_box(generate_data())));
}
```

### 基準測試原則

1. **隔離環境** — 獨佔機器，關閉無關程序
2. **預熱** — 丟棄前 N 次結果
3. **統計顯著** — 多次執行取中位數
4. **對比基線** — 最佳化前後對比，而非絕對值

---

## 常見瓶頸最佳化

### CPU 密集型

| 問題 | 最佳化 |
|------|------|
| 熱迴圈 | 演算法最佳化、減少分支 |
| 序列化/反序列化 | 換用高效格式(protobuf/msgpack) |
| 正規表示式 | 預編譯、簡化模式 |
| 加密運算 | 硬體加速(AES-NI) |

### I/O 密集型

| 問題 | 最佳化 |
|------|------|
| 同步阻塞 I/O | 非同步 I/O (asyncio/epoll) |
| 頻繁小檔案讀寫 | 批次合併、緩衝區 |
| 網路往返 | 連線池、批次請求、Pipeline |
| DNS 解析 | 本地快取 |

### 記憶體相關

| 問題 | 最佳化 |
|------|------|
| 記憶體洩漏 | Profiling 定位 + 修復引用 |
| GC 壓力 | 減少分配、物件池 |
| 快取未命中 | 資料區域性性、緊湊佈局 |
| 大物件 | 流式處理、分片 |

---

## 資料庫效能

### 查詢最佳化

```sql
-- 1. EXPLAIN 分析
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 123;

-- 2. 索引最佳化
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_composite ON orders(user_id, created_at DESC);

-- 3. 避免 N+1
-- 差：迴圈查詢
-- 好：JOIN 或 IN 批次查詢
SELECT o.*, u.name FROM orders o JOIN users u ON o.user_id = u.id;

-- 4. 分頁最佳化
-- 差：OFFSET 大數值
SELECT * FROM orders ORDER BY id LIMIT 20 OFFSET 100000;
-- 好：遊標分頁
SELECT * FROM orders WHERE id > 100000 ORDER BY id LIMIT 20;
```

### 連線池配置

```yaml
# HikariCP (Java)
maximumPoolSize: 10        # CPU核數 * 2 + 磁碟數
minimumIdle: 5
connectionTimeout: 30000
idleTimeout: 600000

# 通用公式
pool_size = (core_count * 2) + effective_spindle_count
```

---

## 效能最佳化清單

```yaml
應用層:
  - [ ] 熱路徑 Profiling 完成
  - [ ] 演算法複雜度 ≤ O(n log n)
  - [ ] 無 N+1 查詢
  - [ ] 連線池配置合理
  - [ ] 非同步 I/O 用於 I/O 密集操作

資料庫:
  - [ ] 慢查詢 < 100ms (P95)
  - [ ] 索引覆蓋高頻查詢
  - [ ] 無全表掃描
  - [ ] 連線池大小合理

基礎設施:
  - [ ] CPU 利用率 < 70% (P95)
  - [ ] 記憶體利用率 < 80%
  - [ ] 磁碟 I/O 無飽和
  - [ ] 網路無丟包
```

---

## 效能測試（源自 performance-testing）

### 測試型別

| 型別 | 使用者數 | 持續時間 | 目標 |
|------|--------|----------|------|
| 負載測試 | 預期峰值 | 30min-2h | 驗證效能指標 |
| 壓力測試 | 超出峰值 | 1-3h | 找到崩潰點 |
| 浸泡測試 | 正常負載 | 8-72h | 檢測記憶體洩漏 |
| 峰值測試 | 瞬間激增 | 短時間 | 測試彈性 |

### k6 核心模式

```javascript
// 階梯式負載
export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};
```

### 效能基準閾值

| 場景 | P95響應時間 | 錯誤率 | 吞吐量 |
|------|-------------|--------|--------|
| API查詢 | <200ms | <0.1% | >1000 RPS |
| API寫入 | <500ms | <0.5% | >500 RPS |
| 頁面載入 | <2s | <1% | >100 RPS |

### 工具選型

| 工具 | 語言 | 適用場景 |
|------|------|----------|
| k6 | JavaScript | 現代化、DevOps整合、雲原生 |
| JMeter | Java/GUI | 功能全面、外掛豐富 |
| Gatling | Scala | 高效能、大規模測試 |
| Locust | Python | Python生態、分散式 |

### 漸進式測試流程

```
1. 基準測試 → 單使用者建立基準
2. 負載測試 → 預期負載驗證效能
3. 壓力測試 → 超出負載找極限
4. 浸泡測試 → 長時間檢測洩漏
```

### 測試環境要求

- 獨立環境，配置與生產一致
- 資料分佈模擬真實：70%輕度 / 20%中度 / 10%重度使用者
- 資料隔離：`user_${__VU}_${__ITER}`
- CI整合：k6 GitHub Action + 閾值門禁

