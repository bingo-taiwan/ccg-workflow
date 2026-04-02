---
description: '多模型程式碼審查：無引數時自動審查 git diff，雙模型交叉驗證'
---

# Review - 多模型程式碼審查

雙模型並行審查，交叉驗證綜合反饋。無引數時自動審查當前 git 變更。

## 使用方法

```bash
/review [程式碼或描述]
```

- **無引數**：自動審查 `git diff HEAD`
- **有引數**：審查指定程式碼或描述

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
審查以下程式碼變更：
<git diff 內容>
</TASK>
OUTPUT: 按 Critical/Major/Minor/Suggestion 分類列出問題
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "簡短描述"
})
```

**角色提示詞**：

| 模型 | 提示詞 |
|------|--------|
| Codex | `~/.claude/.ccg/prompts/codex/reviewer.md` |
| Gemini | `~/.claude/.ccg/prompts/gemini/reviewer.md` |

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

### 🔍 階段 1：獲取待審查程式碼

`[模式：研究]`

**無引數時**：執行 `git diff HEAD` 和 `git status --short`

**有引數時**：使用指定的程式碼/描述

呼叫 `{{MCP_SEARCH_TOOL}}` 獲取相關上下文。

### 🔬 階段 2：並行審查

`[模式：審查]`

**⚠️ 必須發起兩個並行 Bash 呼叫**（參照上方呼叫規範）：

1. **{{BACKEND_PRIMARY}} 後端審查**：`Bash({ command: "...--backend {{BACKEND_PRIMARY}}...", run_in_background: true })`
   - ROLE_FILE: `~/.claude/.ccg/prompts/codex/reviewer.md`
   - 需求：審查程式碼變更（git diff 內容）
   - OUTPUT：按 Critical/Major/Minor/Suggestion 分類列出安全性、效能、錯誤處理問題

2. **{{FRONTEND_PRIMARY}} 前端審查**：`Bash({ command: "...--backend {{FRONTEND_PRIMARY}}...", run_in_background: true })`
   - ROLE_FILE: `~/.claude/.ccg/prompts/gemini/reviewer.md`
   - 需求：審查程式碼變更（git diff 內容）
   - OUTPUT：按 Critical/Major/Minor/Suggestion 分類列出可訪問性、響應式、設計一致性問題

用 `TaskOutput` 等待兩個模型的審查結果。**必須等所有模型返回後才能進入下一階段**。

**務必遵循上方 `多模型呼叫規範` 的 `重要` 指示**

### 🔀 階段 3：綜合反饋

`[模式：綜合]`

1. 收集雙方審查結果
2. 按嚴重程度分類：Critical / Major / Minor / Suggestion
3. 去重合並 + 交叉驗證

### 📊 階段 4：呈現審查結果

`[模式：總結]`

```markdown
## 📋 程式碼審查報告

### 審查範圍
- 變更檔案：<數量> | 程式碼行數：+X / -Y

### 關鍵問題 (Critical)
> 必須修復才能合併
1. <問題描述> - [Codex/Gemini]

### 主要問題 (Major) / 次要問題 (Minor) / 建議 (Suggestions)
...

### 總體評價
- 程式碼質量：[優秀/良好/需改進]
- 是否可合併：[是/否/需修復後]
```

---

## 關鍵規則

1. **無引數 = 審查 git diff** – 自動獲取當前變更
2. **雙模型交叉驗證** – 後端問題以 Codex 為準，前端問題以 Gemini 為準
3. 外部模型對檔案系統**零寫入許可權**
