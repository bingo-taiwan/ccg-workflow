---
description: '多模型除錯：{{BACKEND_PRIMARY}} 後端診斷 + {{FRONTEND_PRIMARY}} 前端診斷，交叉驗證定位問題'
---

# Debug - 多模型除錯

雙模型並行診斷，交叉驗證快速定位問題根因。

## 使用方法

```bash
/debug <問題描述>
```

## 你的角色

你是**除錯協調者**，編排多模型診斷流程：
- **{{BACKEND_PRIMARY}}** – 後端診斷（**後端問題權威**）
- **{{FRONTEND_PRIMARY}}** – 前端診斷（**前端問題權威**）
- **Claude (自己)** – 綜合診斷、執行修復

---

## 多模型呼叫規範

**工作目錄**：
- 如果使用者透過 `/add-dir` 新增了多個工作區，先用 Glob/Grep 確定任務相關的工作區
- 如果無法確定，用 `AskUserQuestion` 詢問使用者選擇目標工作區
- **必須透過 Bash 執行 `pwd`（Unix）或 `cd`（Windows CMD）獲取當前工作目錄的絕對路徑**，禁止從 `$HOME` 或環境變數推斷

**呼叫示例**：

**{{BACKEND_PRIMARY}} 後端診斷**：
```bash
~/.claude/bin/codeagent-wrapper --progress --backend {{BACKEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}- "$(pwd)" <<'EOF'
ROLE_FILE: ~/.claude/.ccg/prompts/codex/debugger.md
<TASK>
需求：<增強後的需求>
上下文：<錯誤日誌、堆疊資訊、復現步驟>
</TASK>
OUTPUT: 診斷假設（按可能性排序）
EOF
```

**{{FRONTEND_PRIMARY}} 前端診斷**：
```bash
~/.claude/bin/codeagent-wrapper --progress --backend {{FRONTEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}- "$(pwd)" <<'EOF'
ROLE_FILE: ~/.claude/.ccg/prompts/gemini/debugger.md
<TASK>
需求：<增強後的需求>
上下文：<錯誤日誌、堆疊資訊、復現步驟>
</TASK>
OUTPUT: 診斷假設（按可能性排序）
EOF
```

**角色提示詞**：

| 模型 | 提示詞 |
|------|--------|
| Codex | `~/.claude/.ccg/prompts/codex/debugger.md` |
| Gemini | `~/.claude/.ccg/prompts/gemini/debugger.md` |

**並行呼叫**：
1. 使用 `Bash` 工具，設定 `run_in_background: true` 和 `timeout: 600000`（10 分鐘）
2. 同時發起兩個後臺任務（Codex + Gemini）
3. 使用 `TaskOutput` 等待結果：`TaskOutput({ task_id: "<task_id>", block: true, timeout: 600000 })`

**重要**：
- 必須指定 `timeout: 600000`，否則預設 30 秒會超時
- 如果 10 分鐘後仍未完成，繼續用 `TaskOutput` 輪詢，**絕對不要 Kill 程序**
- 若等待時間過長，**必須用 `AskUserQuestion` 詢問使用者是否繼續等待，禁止直接 Kill**
- ⛔ **Gemini 失敗必須重試**：若 Gemini 呼叫失敗（非零退出碼或輸出包含錯誤資訊），最多重試 2 次（間隔 5 秒）。僅當 3 次全部失敗時才跳過 Gemini 結果並使用單模型結果繼續。
- ⛔ **Codex 結果必須等待**：Codex 執行時間較長（5-15 分鐘）屬於正常。TaskOutput 超時後必須繼續用 TaskOutput 輪詢，**絕對禁止在 Codex 未返回結果時直接跳過或繼續下一階段**。已啟動的 Codex 任務若被跳過 = 浪費 token + 丟失結果。

---

## 執行工作流

**問題描述**：$ARGUMENTS

### 🔍 階段 0：Prompt 增強（可選）

`[模式：準備]` - **Prompt 增強**（按 `/ccg:enhance` 的邏輯執行）：分析 $ARGUMENTS 的意圖、缺失資訊、隱含假設，補全為結構化需求（明確目標、技術約束、範圍邊界、驗收標準），**用增強結果替代原始 $ARGUMENTS，後續呼叫 Codex/Gemini 時傳入增強後的需求**

### 🔍 階段 1：上下文收集

`[模式：研究]`

1. 呼叫 `{{MCP_SEARCH_TOOL}}` 檢索相關程式碼（如可用）
2. 收集錯誤日誌、堆疊資訊、復現步驟
3. 識別問題型別：[後端/前端/全棧]

### 🔬 階段 2：並行診斷

`[模式：診斷]`

**⚠️ 必須發起兩個並行 Bash 呼叫**（參照上方呼叫規範）：

1. **{{BACKEND_PRIMARY}} 後端診斷**：`Bash({ command: "...--backend {{BACKEND_PRIMARY}}...", run_in_background: true })`
   - ROLE_FILE: `~/.claude/.ccg/prompts/codex/debugger.md`
   - OUTPUT：診斷假設（按可能性排序），每個假設包含原因、證據、修復建議

2. **{{FRONTEND_PRIMARY}} 前端診斷**：`Bash({ command: "...--backend {{FRONTEND_PRIMARY}}...", run_in_background: true })`
   - ROLE_FILE: `~/.claude/.ccg/prompts/gemini/debugger.md`
   - OUTPUT：診斷假設（按可能性排序），每個假設包含原因、證據、修復建議

用 `TaskOutput` 等待兩個模型的診斷結果。**必須等所有模型返回後才能進入下一階段**。

**務必遵循上方 `多模型呼叫規範` 的 `重要` 指示**

### 🔀 階段 3：假設整合

`[模式：驗證]`

1. 交叉驗證雙方診斷結果
2. 篩選 **Top 1-2 最可能原因**
3. 設計驗證策略

### ⛔ 階段 4：使用者確認（Hard Stop）

`[模式：確認]`

```markdown
## 🔍 診斷結果

### Codex 分析（後端視角）
<診斷摘要>

### Gemini 分析（前端視角）
<診斷摘要>

### 綜合診斷
**最可能原因**：<具體診斷>
**驗證方案**：<如何確認>

---
**確認後我將執行修復。是否繼續？(Y/N)**
```

**⚠️ 必須等待使用者確認後才能進入階段 5**

### 🔧 階段 5：修復與驗證

`[模式：執行]`

使用者確認後：
1. 根據診斷實施修復
2. 執行測試驗證修復

---

## 關鍵規則

1. **使用者確認** – 修復前必須獲得確認
2. **信任規則** – 後端問題以 Codex 為準，前端問題以 Gemini 為準
3. 外部模型對檔案系統**零寫入許可權**
