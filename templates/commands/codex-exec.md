---
description: '{{BACKEND_PRIMARY}} 全權執行計劃 - 讀取 /ccg:plan 產出的計劃檔案，{{BACKEND_PRIMARY}} 承擔 MCP 搜尋 + 程式碼實現 + 測試，多模型稽核'
---

# Codex-Exec - Codex 全權執行計劃

$ARGUMENTS

---

## 核心理念

**與 `/ccg:plan` 配對使用**：

```
/ccg:plan → 多模型協同規劃（Codex ∥ Gemini 分析 → Claude 綜合）
                ↓ 計劃檔案 (.claude/plan/xxx.md)
/ccg:codex-exec → Codex 全權執行（MCP 搜尋 + 程式碼實現 + 測試）
                ↓ 程式碼變更
                → 多模型稽核（Codex ∥ Gemini 交叉審查）
```

**與 `/ccg:execute` 的區別**：

| 維度 | `/ccg:execute` | `/ccg:codex-exec` |
|------|---------------|-------------------|
| 程式碼實現 | Claude 重構 {{BACKEND_PRIMARY}}/{{FRONTEND_PRIMARY}} 的 Diff | **{{BACKEND_PRIMARY}} 直接實現** |
| MCP 搜尋 | Claude 呼叫 MCP | **{{BACKEND_PRIMARY}} 呼叫 MCP** |
| Claude 上下文 | 高（搜尋結果 + 程式碼全進來） | **極低（只看摘要 + diff）** |
| Claude token | 大量消耗 | **極少消耗** |
| 稽核 | 多模型審查 | **多模型審查（不變）** |

---

## 語言協議

- 與工具/模型互動用 **英語**
- 與使用者互動用 **中文**

---

## 多模型呼叫規範

**工作目錄**：
- `{{WORKDIR}}`：**必須透過 Bash 執行 `pwd`（Unix）或 `cd`（Windows CMD）獲取當前工作目錄的絕對路徑**，禁止從 `$HOME` 或環境變數推斷
- 如果使用者透過 `/add-dir` 新增了多個工作區，先用 Glob/Grep 確定任務相關的工作區
- 如果無法確定，用 `AskUserQuestion` 詢問使用者選擇目標工作區

**{{BACKEND_PRIMARY}} 執行呼叫語法**：

```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend {{BACKEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EXEC_EOF'
<TASK>
<指令內容>
</TASK>
EXEC_EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "簡短描述"
})
```

**{{BACKEND_PRIMARY}} 複用會話呼叫**：

```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend {{BACKEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"{{WORKDIR}}\" <<'EXEC_EOF'
<TASK>
<指令內容>
</TASK>
EXEC_EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "簡短描述"
})
```

**稽核呼叫語法**（Codex ∥ Gemini 並行審查）：

```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend <{{BACKEND_PRIMARY}}|{{FRONTEND_PRIMARY}}> {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'REVIEW_EOF'
ROLE_FILE: <角色提示詞路徑>
<TASK>
Scope: Audit the code changes made by Codex.
Inputs:
- The git diff (applied changes)
- The implementation plan
Constraints:
- Do NOT modify any files.
</TASK>
OUTPUT:
1) A prioritized list of issues (severity, file, rationale)
2) If code changes are needed, include a Unified Diff Patch in a fenced code block.
REVIEW_EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "簡短描述"
})
```

**角色提示詞**：

| 階段 | Codex | Gemini |
|------|-------|--------|
| 審查 | `~/.claude/.ccg/prompts/codex/reviewer.md` | `~/.claude/.ccg/prompts/gemini/reviewer.md` |

**等待後臺任務**（最大超時 600000ms = 10 分鐘）：

```
TaskOutput({ task_id: "<task_id>", block: true, timeout: 600000 })
```

**重要**：
- 必須指定 `timeout: 600000`，否則預設只有 30 秒會導致提前超時
- 若 10 分鐘後仍未完成，繼續用 `TaskOutput` 輪詢，**絕對不要 Kill 程序**
- 若因等待時間過長跳過了等待，**必須呼叫 `AskUserQuestion` 詢問使用者選擇繼續等待還是 Kill Task**
- ⛔ **Gemini 失敗必須重試**：若 Gemini 呼叫失敗（非零退出碼或輸出包含錯誤資訊），最多重試 2 次（間隔 5 秒）。僅當 3 次全部失敗時才跳過 Gemini 結果並使用單模型結果繼續。
- ⛔ **Codex 結果必須等待**：Codex 執行時間較長（5-15 分鐘）屬於正常。TaskOutput 超時後必須繼續用 TaskOutput 輪詢，**絕對禁止在 Codex 未返回結果時直接跳過或繼續下一階段**。已啟動的 Codex 任務若被跳過 = 浪費 token + 丟失結果。

---

## 執行工作流

**執行任務**：$ARGUMENTS

### 📖 Phase 0：讀取計劃

`[模式：準備]`

1. **識別輸入型別**：
   - 計劃檔案路徑（如 `.claude/plan/xxx.md`）→ 讀取並解析
   - 直接的任務描述 → 提示使用者先執行 `/ccg:plan`

2. **解析計劃內容**，提取：
   - 任務型別（前端/後端/全棧）
   - 技術方案
   - 實施步驟
   - 關鍵檔案列表
   - SESSION_ID（`CODEX_SESSION` / `GEMINI_SESSION`）

3. **執行前確認**：
   向使用者展示計劃摘要，確認後執行：

   ```markdown
   ## 即將執行

   **任務**：<計劃標題>
   **模式**：Codex 全權執行
   **步驟**：<N 步>
   **關鍵檔案**：<N 個>

   Codex 將自主完成：MCP 搜尋 + 程式碼實現 + 測試驗證
   Claude 僅做最終稽核

   確認執行？(Y/N)
   ```

---

### ⚡ Phase 1：Codex 全權執行

`[模式：執行]`

**將計劃轉化為 Codex 結構化指令，一次性下發**：

```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend {{BACKEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}resume <CODEX_SESSION> - \"{{WORKDIR}}\" <<'EXEC_EOF'
<TASK>
You are a full-stack execution agent. Implement the following plan end-to-end.

## Implementation Plan
<將 Phase 0 解析出的完整計劃內容貼上於此>

## Your Instructions

### Step 1: Context Verification
Before coding, verify you have sufficient context:
- Use ace-tool MCP (search_context) to search for relevant existing code patterns
- Read the key files listed in the plan to understand current implementation
- If the plan references external libraries/APIs, use context7 MCP to query their latest documentation
- If latest information is needed, use grok-search MCP for web search

### Step 2: Implementation
Implement each step from the plan in order:
<將計劃的實施步驟逐條列出>

Constraints:
- Follow existing code conventions in this project
- Handle edge cases and errors properly
- Keep changes minimal and focused on the plan
- Do NOT modify files outside the plan's scope

### Step 3: Self-Verification
After implementation:
- Run lint/typecheck if available
- Run existing tests: <從計劃中提取測試命令，如無則 "run project's test suite">
- Verify no regressions in touched modules

## Output Format
Respond with a structured report:

### CONTEXT_GATHERED
<What information was searched/found, key findings from MCP tools>

### CHANGES_MADE
For each file changed:
- File path
- What was changed and why
- Lines added/removed

### VERIFICATION_RESULTS
- Lint/typecheck: pass/fail
- Tests: pass/fail (details if fail)
- Manual checks performed

### REMAINING_ISSUES
<Any unresolved issues, edge cases, or suggestions>
</TASK>
EXEC_EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "Codex 全權執行：<計劃標題>"
})
```

**📌 記錄 SESSION_ID**（`CODEX_EXEC_SESSION`）

如果計劃中無 `CODEX_SESSION`（使用者跳過了 `/ccg:plan` 的多模型分析），則使用新會話。

用 `TaskOutput` 等待完成。

---

### 🔍 Phase 2：Claude 輕量稽核

`[模式：稽核]`

**Claude 只做最小驗證，不重複 Codex 已做的工作**：

1. **讀取 Codex 報告**：解析 CONTEXT_GATHERED / CHANGES_MADE / VERIFICATION_RESULTS / REMAINING_ISSUES
2. **檢視實際變更**：

   ```
   Bash({ command: "git diff HEAD", description: "檢視 Codex 實際變更" })
   ```

3. **快速判定**：
   - 變更是否在計劃範圍內？
   - 是否有明顯安全/邏輯問題？
   - 測試是否透過？

4. **處理結果**：
   - ✅ **透過** → Phase 3 多模型稽核
   - ⚠️ **小問題** → Claude 直接修復（< 10 行的修正 Claude 自己做）
   - ❌ **需返工** → Phase 2.5 追加指令

---

### 🔄 Phase 2.5：追加指令（僅在需返工時）

`[模式：追加]`

**複用 Codex 會話，下發修正指令**：

```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend {{BACKEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}resume <CODEX_EXEC_SESSION> - \"{{WORKDIR}}\" <<'FIXEOF'
<TASK>
The implementation needs corrections:

## Issues Found
1. <問題描述 + 具體檔案:行號>
2. <問題描述 + 具體檔案:行號>

## Required Fixes
1. <具體修正要求>
2. <具體修正要求>

Apply fixes and re-run tests. Report results in the same format.
</TASK>
FIXEOF",
  run_in_background: true,
  timeout: 3600000,
  description: "Codex 修正：<問題簡述>"
})
```

等待完成後回到 Phase 2。**最多 2 輪返工**，超過則 Claude 直接接管修復。

---

### ✅ Phase 3：多模型稽核

`[模式：稽核]`

**並行呼叫 Codex + Gemini 交叉審查**（多模型協同不變）：

1. **獲取變更 diff**：

   ```
   Bash({ command: "git diff HEAD", description: "獲取完整變更 diff" })
   ```

2. **並行呼叫**（`run_in_background: true`）：

   - **{{BACKEND_PRIMARY}} 審查**：
     - ROLE_FILE: `~/.claude/.ccg/prompts/codex/reviewer.md`
     - 輸入：變更 Diff + 計劃檔案內容
     - 關注：安全性、效能、錯誤處理、邏輯正確性

   - **{{FRONTEND_PRIMARY}} 審查**：
     - ROLE_FILE: `~/.claude/.ccg/prompts/gemini/reviewer.md`
     - 輸入：變更 Diff + 計劃檔案內容
     - 關注：程式碼可讀性、設計一致性、可維護性

   用 `TaskOutput` 等待兩個模型的完整審查結果。

3. **整合審查意見**：
   - 按信任規則：後端問題以 Codex 為準，前端問題以 Gemini 為準
   - **Critical** → 必須修復（Claude 直接修或再派 Codex）
   - **Warning** → 建議修復，報告給使用者決定
   - **Info** → 記錄不處理

4. **執行修復**（如有 Critical）：
   - < 10 行修正：Claude 直接修
   - ≥ 10 行修正：再派 Codex（複用 `CODEX_EXEC_SESSION`）
   - 修復後可選重複 Phase 3（直到風險可接受）

---

### 📦 Phase 4：交付

`[模式：交付]`

向使用者報告：

```markdown
## ✅ 執行完成

### 執行摘要
| 專案 | 詳情 |
|------|------|
| 計劃 | <計劃檔案路徑> |
| 模式 | Codex 全權執行 + 多模型稽核 |
| 搜尋 | <Codex 使用了哪些 MCP 工具，關鍵發現> |
| 變更 | <N 個檔案，+X/-Y 行> |
| 測試 | <透過/失敗> |
| 返工 | <0/1/2 輪> |

### 變更清單
| 檔案 | 操作 | 說明 |
|------|------|------|
| path/to/file.ts | 修改/新增 | 描述 |

### 稽核結果
- Codex 審查：<透過/發現 N 個問題>
- Gemini 審查：<透過/發現 N 個問題>
- Claude 處理：<已修復 N 個 Critical，N 個 Warning 待使用者決定>

### 後續建議
1. [ ] <建議的測試步驟>
2. [ ] <建議的驗證步驟>
```

---

## 關鍵規則

1. **Claude 極簡原則** — Claude 不呼叫 MCP、不做程式碼檢索。只讀計劃、指揮 Codex、稽核結果。
2. **{{BACKEND_PRIMARY}} 全權執行** — MCP 搜尋、文件查詢、程式碼檢索、實現、測試全由 {{BACKEND_PRIMARY}} 完成。
3. **多模型稽核不變** — 稽核階段仍然 Codex ∥ Gemini 交叉審查，保證質量。
4. **信任規則** — 後端以 Codex 為準，前端以 Gemini 為準。
5. **一次性下發** — 儘量一次給 Codex 完整指令 + 完整計劃，減少來回通訊。
6. **最多 2 輪返工** — 超過 2 輪 Claude 直接接管，避免無限迴圈。
7. **計劃對齊** — Codex 實現必須在計劃範圍內，超出範圍的變更視為違規。

---

## 使用方法

```bash
# 標準流程：先規劃，再執行
/ccg:plan 實現使用者認證功能
# 審查計劃後...
/ccg:codex-exec .claude/plan/user-auth.md

# 直接執行（會提示先 /ccg:plan）
/ccg:codex-exec 實現使用者認證功能
```

---

## 與 /ccg:plan 的關係

```
/ccg:plan ──→ .claude/plan/xxx.md
                    │
          ┌─────────┴─────────┐
          ↓                   ↓
   /ccg:execute        /ccg:codex-exec
   (Claude 重構)       (Codex 全權)
   Claude 高消耗       Claude 極低消耗
   精細控制             高效執行
```

使用者可根據任務特點選擇：
- **需要精細控制** → `/ccg:execute`（Claude 逐行重構）
- **需要高效執行** → `/ccg:codex-exec`（Codex 一把梭）
