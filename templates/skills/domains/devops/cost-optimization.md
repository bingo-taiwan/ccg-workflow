---
name: cost-optimization
description: 成本最佳化秘典。FinOps框架、計算/儲存/網路最佳化、成本建模。當使用者提到成本、費用、FinOps、省錢、預算、賬單時路由到此。
---

# 🔧 煉器秘典 · 成本最佳化


## FinOps 框架

```
┌─────────────────────────────────────┐
│           FinOps 生命週期            │
├───────────┬───────────┬─────────────┤
│  Inform   │  Optimize │  Operate    │
│  視覺化   │  最佳化     │  運營       │
│  誰花了   │  怎麼省   │  持續治理   │
│  多少錢   │  多少錢   │  流程制度   │
└───────────┴───────────┴─────────────┘
```

| 階段 | 目標 | 關鍵動作 |
|------|------|----------|
| Inform | 成本視覺化 | 標籤策略、成本分攤、Dashboard |
| Optimize | 降低浪費 | 右尺寸、預留、Spot、清理閒置 |
| Operate | 持續治理 | 預算告警、審批流程、定期審查 |

---

## 成本分析

### 標籤策略

```yaml
必選標籤:
  - Environment: prod/staging/dev
  - Team: platform/backend/frontend
  - Service: order-service/user-service
  - Owner: team-email
  - CostCenter: CC-001

可選標籤:
  - Project: project-name
  - Temporary: expiry-date
```

### 成本歸因

```
總成本
├── 按團隊: Team-A (40%) | Team-B (35%) | 共享 (25%)
├── 按環境: Prod (60%) | Staging (25%) | Dev (15%)
├── 按服務: 計算 (45%) | 儲存 (25%) | 網路 (15%) | 其他 (15%)
└── 按型別: On-Demand (30%) | Reserved (50%) | Spot (10%) | 其他 (10%)
```

---

## 計算最佳化

### 右尺寸 (Right-sizing)

```bash
# AWS - 查詢低利用率例項
aws ce get-rightsizing-recommendation \
  --service EC2 \
  --configuration '{"RecommendationTarget":"SAME_INSTANCE_FAMILY","BenefitsConsidered":true}'

# 判斷標準
# CPU 平均 < 20% 且 峰值 < 50% → 縮小
# CPU 平均 > 70% 或 峰值 > 90% → 擴大
# Memory 使用 < 30% → 縮小
```

### 預留例項 / Savings Plans

| 型別 | 折扣 | 靈活性 | 適用 |
|------|------|--------|------|
| Reserved Instance (1yr) | ~30% | 低 | 穩定負載 |
| Reserved Instance (3yr) | ~50% | 低 | 長期穩定 |
| Savings Plans (Compute) | ~30% | 高 | 跨例項族 |
| Savings Plans (EC2) | ~40% | 中 | 固定區域 |

### Spot 例項

```yaml
適用場景:
  - 批處理任務
  - CI/CD 構建
  - 無狀態 Web 服務（配合 ASG）
  - 大資料處理

不適用:
  - 資料庫
  - 有狀態服務
  - 長時間執行的關鍵任務

最佳實踐:
  - 多例項型別混合
  - 跨可用區分散
  - 設定中斷處理 (2分鐘通知)
  - 配合 On-Demand 保底
```

### 自動伸縮

```yaml
# Target Tracking (推薦)
scaling_policy:
  type: TargetTrackingScaling
  target_value: 70          # CPU 目標 70%
  scale_in_cooldown: 300
  scale_out_cooldown: 60

# 預測性伸縮
predictive_scaling:
  mode: ForecastAndScale
  scheduling_buffer_time: 300

# 定時伸縮 (已知流量模式)
scheduled_actions:
  - schedule: "cron(0 8 * * MON-FRI)"   # 工作日早8點擴容
    min_capacity: 10
  - schedule: "cron(0 20 * * MON-FRI)"  # 晚8點縮容
    min_capacity: 2
```

---

## 儲存最佳化

### 儲存分層

| 層級 | 訪問頻率 | 成本 | 適用 |
|------|----------|------|------|
| S3 Standard | 頻繁 | $$$ | 活躍資料 |
| S3 IA | 月級 | $$ | 備份、日誌 |
| S3 Glacier | 季度級 | $ | 歸檔 |
| S3 Glacier Deep | 年級 | ¢ | 合規歸檔 |

### 生命週期策略

```json
{
  "Rules": [
    {
      "ID": "log-lifecycle",
      "Filter": {"Prefix": "logs/"},
      "Transitions": [
        {"Days": 30, "StorageClass": "STANDARD_IA"},
        {"Days": 90, "StorageClass": "GLACIER"},
        {"Days": 365, "StorageClass": "DEEP_ARCHIVE"}
      ],
      "Expiration": {"Days": 2555}
    }
  ]
}
```

### 資料庫儲存

```yaml
最佳化策略:
  - 定期清理過期資料 (TTL/分割槽刪除)
  - 壓縮歷史表
  - 歸檔冷資料到物件儲存
  - 使用列式儲存處理分析查詢
  - 審查未使用的索引
```

---

## 網路最佳化

| 最佳化項 | 方法 | 節省 |
|--------|------|------|
| 跨 AZ 流量 | 同 AZ 優先路由 | ~$0.01/GB |
| 跨 Region 流量 | CDN + 邊緣快取 | ~$0.02/GB |
| NAT Gateway | 使用 VPC Endpoint | ~$0.045/GB |
| 資料傳輸 | 壓縮 + 批次 | 30-70% |

```yaml
VPC Endpoint 優先:
  - S3: Gateway Endpoint (免費)
  - DynamoDB: Gateway Endpoint (免費)
  - 其他 AWS 服務: Interface Endpoint (按小時計費，但省流量費)
```

---

## 應用層最佳化

### 快取降本

```
無快取: 100% 請求打到資料庫 → 需要大例項
加快取: 80% 快取命中 → 資料庫可縮小 60%
```

### 架構降本

| 模式 | 場景 | 節省 |
|------|------|------|
| Serverless | 低流量/突發 | 按呼叫付費，空閒零成本 |
| 容器化 | 中等流量 | 提高資源利用率 |
| 佇列削峰 | 突發流量 | 減少峰值資源需求 |
| 讀寫分離 | 讀多寫少 | 讀副本用小例項 |

### 程式碼級降本

```yaml
減少外部呼叫:
  - 批次 API 呼叫替代迴圈單次
  - 本地快取熱資料
  - 連線池複用

減少計算:
  - 惰性計算
  - 增量處理替代全量
  - 合理的超時設定（避免資源空等）
```

---

## 成本建模

### 單位經濟學

```
單使用者成本 = 總基礎設施成本 / 活躍使用者數

目標: 隨規模增長，單使用者成本遞減
```

### 成本預測

```yaml
輸入:
  - 當前月成本: $10,000
  - 使用者增長率: 20%/月
  - 基礎設施彈性係數: 0.7 (成本增長 = 使用者增長 × 0.7)

預測:
  - M+1: $10,000 × (1 + 0.2 × 0.7) = $11,400
  - M+3: ~$14,800
  - M+6: ~$22,100
```

---

## 成本最佳化清單

```yaml
即時見效 (Quick Wins):
  - [ ] 清理閒置資源 (未掛載 EBS、空閒 EIP、停止的例項)
  - [ ] 刪除未使用的快照和 AMI
  - [ ] 右尺寸低利用率例項
  - [ ] 啟用 S3 生命週期策略

中期最佳化:
  - [ ] 購買 Savings Plans / Reserved Instances
  - [ ] Spot 例項用於非關鍵負載
  - [ ] 配置自動伸縮
  - [ ] VPC Endpoint 替代 NAT Gateway

長期治理:
  - [ ] 標籤策略 100% 覆蓋
  - [ ] 成本分攤 Dashboard
  - [ ] 月度成本審查會議
  - [ ] 預算告警自動化
```

