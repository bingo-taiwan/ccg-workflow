---
name: prompt-and-eval
description: Prompt 工程與模型評估。Prompt 模式（Zero-shot、Few-shot、CoT、ReAct、ToT）、模板設計、RAGAS、LLM-as-Judge、基準測試、A/B 測試、持續監控。當使用者提到 Prompt 工程、Few-shot、CoT、模型評估、RAGAS、LLM-as-Judge、基準測試時使用。
---

# Prompt 工程與模型評估

## 一、Prompt 模式

### 模式對比

| 模式 | 複雜度 | 準確性 | Token 消耗 | 適用場景 |
|------|--------|--------|------------|----------|
| Zero-shot | 低 | 中 | 低 | 簡單任務、通用問題 |
| Few-shot | 中 | 高 | 中 | 格式化輸出、分類 |
| CoT | 中 | 高 | 中 | 推理、數學、邏輯 |
| Self-Consistency | 高 | 極高 | 高 | 關鍵決策 |
| ToT | 極高 | 極高 | 極高 | 複雜規劃 |
| ReAct | 高 | 高 | 高 | 工具呼叫、Agent |

### Zero-shot

```python
# 關鍵：清晰指令 + 角色設定 + 輸出格式
prompt = """
你是一位資深安全工程師。
任務: 將以下文字分類為正面、負面或中性。
輸入: {text}
輸出格式: JSON {"sentiment": "...", "confidence": 0.0-1.0}
"""
```

### Few-shot

```python
# 關鍵：2-5 個高質量示例 + 語義相似度選擇
prompt = """
將評論分類:

評論: 音質很棒，佩戴舒適。 → 正面
評論: 電池續航太差。 → 負面
評論: {new_review} →
"""

# 動態示例選擇（LangChain）
selector = SemanticSimilarityExampleSelector.from_examples(
    examples, OpenAIEmbeddings(), Chroma, k=2
)
```

### Chain-of-Thought (CoT)

```python
# Zero-shot CoT — 魔法咒語
prompt = f"問題: {question}\n\n讓我們一步步思考:"

# Self-Consistency — 多路投票
answers = [extract_answer(llm.predict(prompt, temperature=0.7)) for _ in range(5)]
final = Counter(answers).most_common(1)[0][0]
```

### ReAct

```python
# Thought → Action → Observation 迴圈
prompt = """
工具: Search[query], Calculate[expr], Finish[answer]

Thought: 我需要查詢埃菲爾鐵塔高度
Action: Search[埃菲爾鐵塔高度]
Observation: 330 米
Thought: 現在知道答案了
Action: Finish[330 米]
"""
```

### Tree-of-Thoughts (ToT)

```python
# 生成多條思路 → 評估打分 → Beam Search 選最優 → 遞迴擴充套件
class TreeOfThoughts:
    def solve(self, problem):
        thoughts = self._generate(problem, n=3)
        scored = self._evaluate(problem, thoughts)
        best = sorted(scored, key=lambda x: x[1], reverse=True)[:self.beam_width]
        # 遞迴深入最佳路徑
```

## 二、Prompt 設計技巧

### 模板結構

```python
messages = [
    {"role": "system", "content": "角色 + 能力邊界 + 輸出約束"},
    {"role": "user", "content": "### 指令\n{task}\n### 輸入\n{input}\n### 輸出格式\n{format}"},
]
```

### 最佳化原則

| 原則 | 做 | 不做 |
|------|-----|------|
| 清晰性 | 具體、可執行、有約束 | 模糊指令 |
| 結構化 | 分隔符、編號、格式 | 大段文字 |
| 示例驅動 | 2-5 個高質量示例 | 無示例 |
| 分步指令 | 步驟 1/2/3 | 一句話包辦 |
| 約束邊界 | 說明要做和不做什麼 | 無限制 |

### 高階技巧

```python
# 元提示 — 用 LLM 生成 Prompt
meta = "你是 Prompt 專家。為以下任務生成最優 Prompt: {task}"

# 自我批評 — 生成 → 批評 → 改進
answer = llm(question)
critique = llm(f"批評: {answer}")
improved = llm(f"基於批評改進: {critique}")
```

### Prompt 模板速查

```yaml
程式碼生成: "生成 {lang} 程式碼: {desc}。要求: 最佳實踐 + 註釋 + 異常處理"
文字摘要: "總結為 {n} 字: {text}。保留關鍵資訊，語言簡潔"
資料提取: "從文字提取 {fields}，輸出 JSON: {text}"
NL2SQL: "將自然語言轉 SQL: {query}。表結構: {schema}"
```

## 三、模型評估

### 評估維度

| 維度 | 指標 | 適用場景 |
|------|------|----------|
| 準確性 | Accuracy, F1, Precision, Recall | 分類、NER |
| 相關性 | Relevance, Context Precision | RAG、檢索 |
| 忠實性 | Faithfulness, Hallucination Rate | 生成任務 |
| 效率 | Latency P95, Throughput, Cost/1K | 生產部署 |

### RAGAS 框架

```python
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision, context_recall

dataset = Dataset.from_dict({
    "question": questions,
    "answer": answers,
    "contexts": contexts,
    "ground_truth": ground_truths,
})

result = evaluate(dataset, metrics=[
    faithfulness,        # 答案是否基於上下文（0-1）
    answer_relevancy,    # 答案與問題相關度（0-1）
    context_precision,   # 檢索上下文中相關資訊比例（0-1）
    context_recall,      # 上下文是否包含所需全部資訊（0-1）
])
```

### LLM-as-Judge

```python
class LLMJudge:
    def evaluate(self, question, answer, criteria):
        prompt = f"""
評估答案質量（1-5 分）:
問題: {question}
答案: {answer}
標準: {criteria}

輸出 JSON: {{"accuracy": N, "completeness": N, "clarity": N, "overall": N, "feedback": "..."}}
"""
        return json.loads(self.llm.predict(prompt))

# 成對比較 + ELO 排名
def pairwise(q, a, b):
    # 返回 {"winner": "A"|"B", "confidence": 0-1}
    ...
```

### 基準測試速查

| 基準 | 評估能力 | 核心指標 |
|------|----------|----------|
| MMLU | 多工語言理解 | Accuracy |
| HumanEval | 程式碼生成 | Pass@k |
| GSM8K | 數學推理 | Accuracy (CoT) |
| 自定義 | 業務場景 | 加權評分 + 延遲 |

### 檢索指標

```python
def evaluate_retrieval(retrieved, relevant, k=5):
    precision_at_k = len(set(retrieved[:k]) & set(relevant)) / k
    recall_at_k = len(set(retrieved[:k]) & set(relevant)) / len(relevant)
    # MRR: 第一個相關文件的倒數排名
    # NDCG: 歸一化折損累積增益
    return {"precision@k": precision_at_k, "recall@k": recall_at_k, "mrr": mrr, "ndcg": ndcg}
```

### 生成指標

```python
# ROUGE: 摘要質量（rouge-1, rouge-2, rouge-l）
# BLEU: 翻譯質量
from rouge import Rouge
rouge_scores = Rouge().get_scores(predictions, references, avg=True)
```

## 四、A/B 測試與監控

### A/B 測試

```python
class ABTest:
    def __init__(self, variants):  # [Variant(name, model, ratio)]
        self.variants = variants

    def get_variant(self, user_id):
        # 一致性雜湊分流
        return self.variants[hash(user_id) % 100 < cumulative_ratio]

    def check_significance(self, a_scores, b_scores, alpha=0.05):
        t_stat, p_value = stats.ttest_ind(a_scores, b_scores)
        cohens_d = (mean(a) - mean(b)) / pooled_std
        return {"p_value": p_value, "significant": p_value < alpha, "effect": cohens_d}
```

### 持續監控

```python
from prometheus_client import Counter, Histogram, Gauge

request_count = Counter('llm_requests_total', 'Total', ['model', 'status'])
latency = Histogram('llm_latency_seconds', 'Latency', ['model'])
quality = Gauge('llm_quality_score', 'Quality', ['model'])

# 異常檢測: Z-score > 2.0 觸發告警
class AnomalyDetector:
    def check(self, value):
        z = abs((value - mean(self.window)) / std(self.window))
        return z > self.threshold
```

## 五、Checklist

### Prompt 工程

- 清晰指令 + 角色設定 + 輸出格式約束
- 複雜任務用 CoT / ReAct
- 關鍵決策用 Self-Consistency 多路投票
- 版本管理 Prompt，A/B 測試對比效果
- 迭代最佳化：測試 → 分析 → 改進

### 模型評估

- 多維度評估：準確性 + 相關性 + 忠實性 + 效率
- RAG 用 RAGAS 四指標
- 自動評估 LLM-as-Judge + 定期人工抽檢
- 標準基準（MMLU/HumanEval）+ 業務自定義基準
- 上線前 A/B 測試，上線後持續監控 + 異常告警
- 反饋閉環：收集使用者反饋持續改進

## 工具速查

| 工具 | 用途 |
|------|------|
| RAGAS | RAG 專用評估 |
| LangSmith | LLM 應用監控 |
| Phoenix | 可觀測性平臺 |
| LangChain | Prompt 模板管理 |
| Guidance | 結構化生成 |
| OpenAI Evals | 模型評估框架 |
| W&B | 實驗追蹤 |

---
