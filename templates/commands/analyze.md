---
description: '多模型技術分析（並行執行）：{{BACKEND_PRIMARY}} 後端視角 + {{FRONTEND_PRIMARY}} 前端視角，交叉驗證後綜合見解'
---

# Analyze - 多模型技術分析

使用雙模型並行分析，交叉驗證得出綜合技術見解。**僅分析，不修改程式碼。**

## 使用方法

```bash
/analyze <分析問題或任務>
```

## 你的角色

你是**分析協調者**，編排多模型分析流程：
- **ace-tool** – 程式碼上下文檢索
- **{{BACKEND_PRIMARY}}** – 後端/系統視角（**後端權威**）
- **{{FRONTEND_PRIMARY}}** – 前端/使用者視角（**前端權威**）
- **Claude (自己)** – 綜合見解

---

## 多模型呼叫規範

**工作目錄**：
- `{{WORKDIR}}`：**必須透過 Bash 執行 `pwd`（Unix）或 `cd`（Windows CMD）獲取當前工作目錄的絕對路徑**，禁止從 `$HOME` 或環境變數推斷
- 如果使用者透過 `/add-dir` 新增了多個工作區，先用 Glob/Grep 確定任務相關的工作區
- 如果無法確定，用 `AskUserQuestion` 詢問使用者選擇目標工作區

**呼叫語法**（並行用 `run_in_background: true`）：

```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend <{{BACKEND_PRIMARY}}|{{FRONTEND_PRIMARY}}> {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EOF'
ROLE_FILE: <角色提示詞路徑>
<TASK>
需求：<增強後的需求（如未增強則用 $ARGUMENTS）>
上下文：<前序階段檢索到的程式碼上下文>
</TASK>
OUTPUT: 期望輸出格式
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "簡短描述"
})
```

**角色提示詞**：

| 模型 | 提示詞 |
|------|--------|
| Codex | `~/.claude/.ccg/prompts/codex/analyzer.md` |
| Gemini | `~/.claude/.ccg/prompts/gemini/analyzer.md` |

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

## 執行工作流

**分析任務**：$ARGUMENTS

### 🔍 階段 0：Prompt 增強（可選）

`[模式：準備]` - **Prompt 增強**（按 `/ccg:enhance` 的邏輯執行）：分析 $ARGUMENTS 的意圖、缺失資訊、隱含假設，補全為結構化需求（明確目標、技術約束、範圍邊界、驗收標準），**用增強結果替代原始 $ARGUMENTS，後續呼叫 Codex/Gemini 時傳入增強後的需求**

### 🔍 階段 1：上下文檢索

`[模式：研究]`

1. 呼叫 `{{MCP_SEARCH_TOOL}}` 檢索相關程式碼
2. 識別分析範圍和關鍵元件
3. 列出已知約束和假設

### 💡 階段 2：並行分析

`[模式：分析]`

**⚠️ 必須發起兩個並行 Bash 呼叫**（參照上方呼叫規範）：

1. **{{BACKEND_PRIMARY}} 後端分析**：`Bash({ command: "...--backend {{BACKEND_PRIMARY}}...", run_in_background: true })`
   - ROLE_FILE: `~/.claude/.ccg/prompts/codex/analyzer.md`
   - OUTPUT：技術可行性、架構影響、效能考量

2. **{{FRONTEND_PRIMARY}} 前端分析**：`Bash({ command: "...--backend {{FRONTEND_PRIMARY}}...", run_in_background: true })`
   - ROLE_FILE: `~/.claude/.ccg/prompts/gemini/analyzer.md`
   - OUTPUT：UI/UX 影響、使用者體驗、視覺設計考量

用 `TaskOutput` 等待兩個模型的完整結果。**必須等所有模型返回後才能進入下一階段**。

**務必遵循上方 `多模型呼叫規範` 的 `重要` 指示**

### 🔀 階段 3：交叉驗證

`[模式：驗證]`

1. 對比雙方分析結果
2. 識別：
   - **一致觀點**（強訊號）
   - **分歧點**（需權衡）
   - **互補見解**（各自領域洞察）
3. 按信任規則權衡：後端以 Codex 為準，前端以 Gemini 為準

### 📊 階段 4：綜合輸出

`[模式：總結]`

```markdown
## 🔬 技術分析：<主題>

### 一致觀點（強訊號）
1. <雙方都認同的點>

### 分歧點（需權衡）
| 議題 | Codex 觀點 | Gemini 觀點 | 建議 |
|------|------------|-------------|------|

### 核心結論
<1-2 句話總結>

### 推薦方案
**首選**：<方案>
- 理由 / 風險 / 緩解措施

### 後續行動
1. [ ] <具體步驟>
```

---

## 適用場景

| 場景 | 示例 |
|------|------|
| 技術選型 | "比較 Redux vs Zustand" |
| 架構評估 | "評估微服務拆分方案" |
| 效能分析 | "分析 API 響應慢的原因" |
| 安全審計 | "評估認證模組安全性" |

## 關鍵規則

1. **僅分析不修改** – 本命令不執行任何程式碼變更
2. **信任規則** – 後端以 Codex 為準，前端以 Gemini 為準
3. 外部模型對檔案系統**零寫入許可權**
