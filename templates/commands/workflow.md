---
description: '多模型協作開發工作流（研究→構思→計劃→執行→最佳化→評審），智慧路由前端→{{FRONTEND_PRIMARY}}、後端→{{BACKEND_PRIMARY}}'
---

# Workflow - 多模型協作開發

使用質量把關、MCP 服務和多模型協作執行結構化開發工作流。

## 使用方法

```bash
/workflow <任務描述>
```

## 上下文

- 要開發的任務：$ARGUMENTS
- 帶質量把關的結構化 6 階段工作流
- 多模型協作：{{BACKEND_PRIMARY}}（後端）+ {{FRONTEND_PRIMARY}}（前端）+ Claude（編排）
- MCP 服務整合（ace-tool）以增強功能

## 你的角色

你是**編排者**，協調多模型協作系統（研究 → 構思 → 計劃 → 執行 → 最佳化 → 評審），用中文協助使用者，面向專業程式設計師，互動應簡潔專業，避免不必要解釋。

**協作模型**：
- **{{BACKEND_PRIMARY}}** – 後端邏輯、演算法、除錯（**後端權威，可信賴**）
- **{{FRONTEND_PRIMARY}}** – 前端 UI/UX、視覺設計（**前端高手，後端意見僅供參考**）
- **Claude (自己)** – 編排、計劃、執行、交付

---

## 多模型呼叫規範

**工作目錄**：
- `{{WORKDIR}}`：**必須透過 Bash 執行 `pwd`（Unix）或 `cd`（Windows CMD）獲取當前工作目錄的絕對路徑**，禁止從 `$HOME` 或環境變數推斷
- 如果使用者透過 `/add-dir` 新增了多個工作區，先用 Glob/Grep 確定任務相關的工作區
- 如果無法確定，用 `AskUserQuestion` 詢問使用者選擇目標工作區

**呼叫語法**（並行用 `run_in_background: true`，序列用 `false`）：

```
# 新會話呼叫
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend <{{BACKEND_PRIMARY}}|{{FRONTEND_PRIMARY}}> {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EOF'
ROLE_FILE: <角色提示詞路徑>
<TASK>
需求：<增強後的需求（如未增強則用 $ARGUMENTS）>
上下文：<前序階段收集的專案上下文、分析結果等>
</TASK>
OUTPUT: 期望輸出格式
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "簡短描述"
})

# 複用會話呼叫
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend <{{BACKEND_PRIMARY}}|{{FRONTEND_PRIMARY}}> {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"{{WORKDIR}}\" <<'EOF'
ROLE_FILE: <角色提示詞路徑>
<TASK>
需求：<增強後的需求（如未增強則用 $ARGUMENTS）>
上下文：<前序階段收集的專案上下文、分析結果等>
</TASK>
OUTPUT: 期望輸出格式
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "簡短描述"
})
```

**角色提示詞**：

| 階段 | Codex | Gemini |
|------|-------|--------|
| 分析 | `~/.claude/.ccg/prompts/codex/analyzer.md` | `~/.claude/.ccg/prompts/gemini/analyzer.md` |
| 規劃 | `~/.claude/.ccg/prompts/codex/architect.md` | `~/.claude/.ccg/prompts/gemini/architect.md` |
| 審查 | `~/.claude/.ccg/prompts/codex/reviewer.md` | `~/.claude/.ccg/prompts/gemini/reviewer.md` |

**會話複用**：每次呼叫返回 `SESSION_ID: xxx`，後續階段用 `resume xxx` 複用上下文（注意：是 `resume`，不是 `--resume`）。

**並行呼叫**：使用 `run_in_background: true` 啟動，用 `TaskOutput` 等待結果。**必須等所有模型返回後才能進入下一階段**。

**等待後臺任務**（使用最大超時 600000ms = 10 分鐘）：

```
TaskOutput({ task_id: "<task_id>", block: true, timeout: 600000 })
```

**重要**：
- 必須指定 `timeout: 600000`，否則預設只有 30 秒會導致提前超時。
如果 10 分鐘後仍未完成，繼續用 `TaskOutput` 輪詢，**絕對不要 Kill 程序**。
- 若因等待時間過長跳過了等待 TaskOutput 結果，則**必須呼叫 `AskUserQuestion` 工具詢問使用者選擇繼續等待還是 Kill Task。禁止直接 Kill Task。**
- ⛔ **Gemini 失敗必須重試**：若 Gemini 呼叫失敗（非零退出碼或輸出包含錯誤資訊），最多重試 2 次（間隔 5 秒）。僅當 3 次全部失敗時才跳過 Gemini 結果並使用單模型結果繼續。
- ⛔ **Codex 結果必須等待**：Codex 執行時間較長（5-15 分鐘）屬於正常。TaskOutput 超時後必須繼續用 TaskOutput 輪詢，**絕對禁止在 Codex 未返回結果時直接跳過或繼續下一階段**。已啟動的 Codex 任務若被跳過 = 浪費 token + 丟失結果。

---

## 溝通守則

1. 響應以模式標籤 `[模式：X]` 開始，初始為 `[模式：研究]`。
2. 核心工作流嚴格按 `研究 → 構思 → 計劃 → 執行 → 最佳化 → 評審` 順序流轉。
3. 每個階段完成後必須請求使用者確認。
4. 評分低於 7 分或使用者未批准時強制停止。
5. 在需要詢問使用者時，儘量使用 `AskUserQuestion` 工具進行互動，舉例場景：請求使用者確認/選擇/批准

---

## 執行工作流

**任務描述**：$ARGUMENTS

### 🔍 階段 1：研究與分析

`[模式：研究]` - 理解需求並收集上下文：

1. **Prompt 增強**（按 `/ccg:enhance` 的邏輯執行）：分析 $ARGUMENTS 的意圖、缺失資訊、隱含假設，補全為結構化需求（明確目標、技術約束、範圍邊界、驗收標準），**用增強結果替代原始 $ARGUMENTS，後續呼叫 Codex/Gemini 時傳入增強後的需求**
2. **上下文檢索**：呼叫 `{{MCP_SEARCH_TOOL}}`
3. **需求完整性評分**（0-10 分）：
   - 目標明確性（0-3）、預期結果（0-3）、邊界範圍（0-2）、約束條件（0-2）
   - ≥7 分：繼續 | <7 分：⛔ 停止，提出補充問題

### 💡 階段 2：方案構思

`[模式：構思]` - 多模型並行分析：

**並行呼叫**（`run_in_background: true`）：
- Codex：使用分析提示詞，輸出技術可行性、方案、風險
- Gemini：使用分析提示詞，輸出 UI 可行性、方案、體驗

用 `TaskOutput` 等待結果。**📌 儲存 SESSION_ID**（`CODEX_SESSION` 和 `GEMINI_SESSION`）。

**務必遵循上方 `多模型呼叫規範` 的 `重要` 指示**

綜合兩方分析，輸出方案對比（至少 2 個方案），等待使用者選擇。

### 📋 階段 3：詳細規劃

`[模式：計劃]` - 多模型協作規劃：

**並行呼叫**（複用會話）：
- Codex：使用規劃提示詞 + `resume $CODEX_SESSION`，輸出後端架構
- Gemini：使用規劃提示詞 + `resume $GEMINI_SESSION`，輸出前端架構

用 `TaskOutput` 等待結果。

**務必遵循上方 `多模型呼叫規範` 的 `重要` 指示**

**Claude 綜合規劃**：採納 Codex 後端規劃 + Gemini 前端規劃，使用者批准後存入 `.claude/plan/任務名.md`

### ⚡ 階段 4：實施

`[模式：執行]` - 程式碼開發：

- 嚴格按批准的計劃實施
- 遵循專案現有程式碼規範
- 在關鍵里程碑請求反饋

### 🚀 階段 5：程式碼最佳化

`[模式：最佳化]` - 多模型並行審查：

**並行呼叫**：
- Codex：使用審查提示詞，關注安全、效能、錯誤處理
- Gemini：使用審查提示詞，關注可訪問性、設計一致性

用 `TaskOutput` 等待結果。整合審查意見，使用者確認後執行最佳化。

**務必遵循上方 `多模型呼叫規範` 的 `重要` 指示**

### ✅ 階段 6：質量審查

`[模式：評審]` - 最終評估：

- 對照計劃檢查完成情況
- 執行測試驗證功能
- 報告問題與建議
- 請求終端使用者確認

---

## 關鍵規則

1. 階段順序不可跳過（除非使用者明確指令）
2. 外部模型對檔案系統**零寫入許可權**，所有修改由 Claude 執行
3. 評分 <7 或使用者未批准時**強制停止**
