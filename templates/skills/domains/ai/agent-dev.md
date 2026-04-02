---
name: agent-dev
description: AI Agent 開發。多 Agent 編排、工具呼叫、RAG 系統、Prompt 工程。當使用者提到 Agent、RAG、Prompt、LangChain、向量資料庫時使用。
---

# 🔮 丹鼎秘典 · AI Agent 開發


## Agent 架構

```
┌─────────────────────────────────────────────────────────────┐
│                      Agent 系統                              │
├─────────────────────────────────────────────────────────────┤
│  使用者輸入 → 意圖理解 → 規劃 → 執行 → 反思 → 輸出            │
│              │          │      │      │                      │
│           Prompt     Planner  Tools  Memory                  │
└─────────────────────────────────────────────────────────────┘
```

## 核心元件

### 1. Prompt 工程

```yaml
結構化 Prompt:
  - System: 角色定義、能力邊界、行為規範
  - Context: 背景資訊、相關知識
  - Task: 具體任務、輸出格式
  - Examples: Few-shot 示例

技巧:
  - 明確角色和邊界
  - 分步驟引導思考
  - 提供輸出格式示例
  - 設定安全護欄
```

### 2. 工具呼叫

```python
# 工具定義
tools = [
    {
        "name": "search",
        "description": "搜尋知識庫",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "搜尋關鍵詞"}
            },
            "required": ["query"]
        }
    }
]

# 工具執行
def execute_tool(name: str, args: dict) -> str:
    if name == "search":
        return search_knowledge_base(args["query"])
    raise ValueError(f"Unknown tool: {name}")
```

### 3. 記憶系統

```yaml
短期記憶:
  - 對話歷史
  - 當前任務上下文
  - 工具呼叫結果

長期記憶:
  - 向量資料庫儲存
  - 使用者偏好
  - 歷史互動摘要

記憶管理:
  - 滑動視窗
  - 摘要壓縮
  - 重要性排序
```

## RAG 系統

### 架構

```
文件 → 分塊 → 嵌入 → 向量庫
                        ↓
查詢 → 嵌入 → 檢索 → 重排序 → 生成
```

### 實現

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma

# 文件處理
splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\n\n", "\n", "。", "，", " "]
)
chunks = splitter.split_documents(documents)

# 向量儲存
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(chunks, embeddings)

# 檢索
retriever = vectorstore.as_retriever(
    search_type="mmr",  # 最大邊際相關性
    search_kwargs={"k": 5, "fetch_k": 20}
)
```

### 最佳化策略

```yaml
分塊策略:
  - 語義分塊 vs 固定長度
  - 重疊避免資訊丟失
  - 保留後設資料

檢索最佳化:
  - 混合檢索 (關鍵詞 + 向量)
  - 重排序 (Reranker)
  - 查詢擴充套件

生成最佳化:
  - 引用來源
  - 置信度評估
  - 幻覺檢測
```

## 多 Agent 編排

### 模式

```yaml
順序執行:
  Agent A → Agent B → Agent C

並行執行:
  Agent A ─┬─→ Agent B ─┬─→ 彙總
           └─→ Agent C ─┘

層級結構:
  Orchestrator
      ├── Planner Agent
      ├── Executor Agent
      └── Reviewer Agent

對話式:
  Agent A ←→ Agent B (多輪互動)
```

### 實現示例

```python
class Orchestrator:
    def __init__(self):
        self.planner = PlannerAgent()
        self.executor = ExecutorAgent()
        self.reviewer = ReviewerAgent()

    async def run(self, task: str) -> str:
        # 規劃
        plan = await self.planner.plan(task)

        # 執行
        results = []
        for step in plan.steps:
            result = await self.executor.execute(step)
            results.append(result)

        # 審查
        final = await self.reviewer.review(task, results)
        return final
```

## 評估與監控

```yaml
評估維度:
  - 準確性: 答案正確率
  - 相關性: 檢索質量
  - 完整性: 資訊覆蓋
  - 一致性: 多次回答穩定性

監控指標:
  - 延遲 (P50/P95/P99)
  - Token 消耗
  - 工具呼叫成功率
  - 使用者滿意度
```

## 框架選擇

```yaml
LangChain:
  - 優點: 生態豐富，元件多
  - 缺點: 抽象層多，除錯難
  - 適合: 快速原型

LlamaIndex:
  - 優點: RAG 專精
  - 缺點: Agent 能力弱
  - 適合: 知識庫應用

原生實現:
  - 優點: 完全可控
  - 缺點: 開發成本高
  - 適合: 生產系統
```

## 最佳實踐

```yaml
開發:
  - Prompt 版本控制
  - 單元測試覆蓋
  - 成本預算控制
  - 降級策略

部署:
  - 流式輸出
  - 超時處理
  - 重試機制
  - 快取策略

安全:
  - 輸入驗證
  - 輸出過濾
  - 許可權控制
  - 審計日誌
```

---

