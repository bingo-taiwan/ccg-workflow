---
name: architecture
description: 架構設計能力索引。API設計、安全架構、雲原生、資料安全。當使用者提到架構、設計、API、雲原生時路由到此。
license: MIT
user-invocable: false
disable-model-invocation: false
---

# 🏗 陣法秘典 · 架構設計能力中樞


## 能力矩陣

| Skill | 定位 | 核心能力 |
|-------|------|----------|
| [api-design](api-design.md) | API 設計 | RESTful、GraphQL、OpenAPI |
| [security-arch](security-arch.md) | 安全架構 | 零信任、IAM、威脅建模、資料安全、合規審計 |
| [cloud-native](cloud-native.md) | 雲原生 | 容器、K8s、Serverless |
| [message-queue](message-queue.md) | 訊息佇列 | Kafka、RabbitMQ、事件驅動 |
| [caching](caching.md) | 快取策略 | Redis、CDN、快取一致性 |

## 架構原則

```yaml
SOLID:
  - S: 單一職責
  - O: 開閉原則
  - L: 里氏替換
  - I: 介面隔離
  - D: 依賴倒置

分散式:
  - CAP 定理
  - BASE 理論
  - 最終一致性

安全:
  - 縱深防禦
  - 最小許可權
  - 零信任
```

