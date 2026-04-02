---
name: ai
description: AI/LLM 能力索引。Agent 開發、LLM 安全、RAG 系統。當使用者提到 AI、LLM、Agent、RAG、Prompt 時路由到此。
license: MIT
user-invocable: false
disable-model-invocation: false
---

# 丹鼎秘典 · AI/LLM 能力中樞

## 能力矩陣

| Skill | 定位 | 核心能力 |
|-------|------|----------|
| [agent-dev](agent-dev.md) | Agent 開發 | 多 Agent 編排、工具呼叫、RAG |
| [llm-security](llm-security.md) | LLM 安全 | Prompt 注入、越獄防護、輸出安全 |
| [rag-system](rag-system.md) | RAG 系統 | 向量資料庫、檢索策略、重排演算法 |
| [prompt-and-eval](prompt-and-eval.md) | Prompt 工程與模型評估 | Few-shot、CoT、ReAct、RAGAS、LLM-as-Judge |

## AI 工程原則

```yaml
設計原則:
  - 人機協作，AI 增強而非替代
  - 可解釋性優先
  - 安全邊界明確
  - 漸進式自主

開發原則:
  - Prompt 即程式碼，需版本控制
  - 輸入輸出都需驗證
  - 成本與效果平衡
  - 持續評估與迭代
```
