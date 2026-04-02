---
description: '多模型協作執行 - 根據計劃獲取原型 → Claude 重構實施 → 多模型審計交付'
---

# Execute - 多模型協作執行

$ARGUMENTS

---

## 核心協議

- **語言協議**：與工具/模型互動用**英語**，與使用者互動用**中文**
- **程式碼主權**：外部模型對檔案系統**零寫入許可權**，所有修改由 Claude 執行
- **髒原型重構**：將 Codex/Gemini 的 Unified Diff 視為"髒原型"，必須重構為生產級程式碼
- **止損機制**：當前階段輸出透過驗證前，不進入下一階段
- **前置條件**：僅在使用者對 `/ccg:plan` 輸出明確回覆 "Y" 後執行（如缺失，必須先二次確認）

---

## 多模型呼叫規範

**工作目錄**：
- `{{WORKDIR}}`：**必須透過 Bash 執行 `pwd`（Unix）或 `cd`（Windows CMD）獲取當前工作目錄的絕對路徑**，禁止從 `$HOME` 或環境變數推斷
- 如果使用者透過 `/add-dir` 新增了多個工作區，先用 Glob/Grep 確定任務相關的工作區
- 如果無法確定，用 `AskUserQuestion` 詢問使用者選擇目標工作區

**呼叫語法**（並行用 `run_in_background: true`）：

```
# 複用會話呼叫（推薦）- 原型生成（Implementation Prototype）
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend <{{BACKEND_PRIMARY}}|{{FRONTEND_PRIMARY}}> {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"{{WORKDIR}}\" <<'EOF'
ROLE_FILE: <角色提示詞路徑>
<TASK>
需求：<任務描述>
上下文：<計劃內容 + 目標檔案>
</TASK>
OUTPUT: Unified Diff Patch ONLY. Strictly prohibit any actual modifications.
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "簡短描述"
})

# 新會話呼叫 - 原型生成（Implementation Prototype）
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend <{{BACKEND_PRIMARY}}|{{FRONTEND_PRIMARY}}> {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EOF'
ROLE_FILE: <角色提示詞路徑>
<TASK>
需求：<任務描述>
上下文：<計劃內容 + 目標檔案>
</TASK>
OUTPUT: Unified Diff Patch ONLY. Strictly prohibit any actual modifications.
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "簡短描述"
})
```

**審計呼叫語法**（Code Review / Audit）：

```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend <{{BACKEND_PRIMARY}}|{{FRONTEND_PRIMARY}}> {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"{{WORKDIR}}\" <<'EOF'
ROLE_FILE: <角色提示詞路徑>
<TASK>
Scope: Audit the final code changes.
Inputs:
- The applied patch (git diff / final unified diff)
- The touched files (relevant excerpts if needed)
Constraints:
- Do NOT modify any files.
- Do NOT output tool commands that assume filesystem access.
</TASK>
OUTPUT:
1) A prioritized list of issues (severity, file, rationale)
2) Concrete fixes; if code changes are needed, include a Unified Diff Patch in a fenced code block.
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "簡短描述"
})
```

**角色提示詞**：

| 階段 | Codex | Gemini |
|------|-------|--------|
| 實施 | `~/.claude/.ccg/prompts/codex/architect.md` | `~/.claude/.ccg/prompts/gemini/frontend.md` |
| 審查 | `~/.claude/.ccg/prompts/codex/reviewer.md` | `~/.claude/.ccg/prompts/gemini/reviewer.md` |

**會話複用**：如果 `/ccg:plan` 提供了 SESSION_ID，使用 `resume <SESSION_ID>` 複用上下文。

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
   - 計劃檔案路徑（如 `.claude/plan/xxx.md`）
   - 直接的任務描述

2. **讀取計劃內容**：
   - 若提供了計劃檔案路徑，讀取並解析
   - 提取：任務型別、實施步驟、關鍵檔案、SESSION_ID

3. **執行前確認**：
   - 若輸入為"直接任務描述"或計劃中缺失 `SESSION_ID` / 關鍵檔案：先向使用者確認補全資訊
   - 若無法確認使用者是否已對計劃回覆 "Y"：必須二次詢問確認後再進入下一階段

4. **任務型別判斷**：

   | 任務型別 | 判斷依據 | 路由 |
   |----------|----------|------|
   | **前端** | 頁面、元件、UI、樣式、佈局 | Gemini |
   | **後端** | API、介面、資料庫、邏輯、演算法 | Codex |
   | **全棧** | 同時包含前後端 | Codex ∥ Gemini 並行 |

---

### 🔍 Phase 1：上下文快速檢索

`[模式：檢索]`

**⚠️ 必須使用 MCP 工具快速檢索上下文，禁止手動逐個讀取檔案**

根據計劃中的"關鍵檔案"列表，呼叫 `{{MCP_SEARCH_TOOL}}` 檢索相關程式碼：

```
{{MCP_SEARCH_TOOL}}({
  query: "<基於計劃內容構建的語義查詢，包含關鍵檔案、模組、函式名>",
  project_root_path: "{{WORKDIR}}"
})
```

**檢索策略**：
- 從計劃的"關鍵檔案"表格提取目標路徑
- 構建語義查詢覆蓋：入口檔案、依賴模組、相關型別定義
- 若檢索結果不足，可追加 1-2 次遞迴檢索
- **禁止**使用 Bash + find/ls 手動探索專案結構

**檢索完成後**：
- 整理檢索到的程式碼片段
- 確認已獲取實施所需的完整上下文
- 進入 Phase 3

---

### 🎨 Phase 3：原型獲取

`[模式：原型]`

**根據任務型別路由**：

#### Route A: 前端/UI/樣式 → Gemini

**限制**：上下文 < 32k tokens

1. 呼叫 Gemini（使用 `~/.claude/.ccg/prompts/gemini/frontend.md`）
2. 輸入：計劃內容 + 檢索到的上下文 + 目標檔案
3. OUTPUT: `Unified Diff Patch ONLY. Strictly prohibit any actual modifications.`
4. **Gemini 是前端設計的權威，其 CSS/React/Vue 原型為最終視覺基準**
5. ⚠️ **警告**：忽略 Gemini 對後端邏輯的建議
6. 若計劃包含 `GEMINI_SESSION`：優先 `resume <GEMINI_SESSION>`

#### Route B: 後端/邏輯/演算法 → Codex

1. 呼叫 Codex（使用 `~/.claude/.ccg/prompts/codex/architect.md`）
2. 輸入：計劃內容 + 檢索到的上下文 + 目標檔案
3. OUTPUT: `Unified Diff Patch ONLY. Strictly prohibit any actual modifications.`
4. **{{BACKEND_PRIMARY}} 是後端邏輯的權威，利用其邏輯運算與 Debug 能力**
5. 若計劃包含 `CODEX_SESSION`：優先 `resume <CODEX_SESSION>`

#### Route C: 全棧 → 並行呼叫

1. **並行呼叫**（`run_in_background: true`）：
   - Gemini：處理前端部分
   - Codex：處理後端部分
2. 用 `TaskOutput` 等待兩個模型的完整結果
3. 各自使用計劃中對應的 `SESSION_ID` 進行 `resume`（若缺失則建立新會話）

**務必遵循上方 `多模型呼叫規範` 的 `重要` 指示**

---

### ⚡ Phase 4：編碼實施

`[模式：實施]`

**Claude 作為程式碼主權者執行以下步驟**：

1. **讀取 Diff**：解析 Codex/Gemini 返回的 Unified Diff Patch

2. **思維沙箱**：
   - 模擬應用 Diff 到目標檔案
   - 檢查邏輯一致性
   - 識別潛在衝突或副作用

3. **重構清理**：
   - 將"髒原型"重構為**高可讀、高可維護性、企業釋出級程式碼**
   - 去除冗餘程式碼
   - 確保符合專案現有程式碼規範
   - **非必要不生成註釋與文件**，程式碼自解釋

4. **最小作用域**：
   - 變更僅限需求範圍
   - **強制審查**變更是否引入副作用
   - 做針對性修正

5. **應用變更**：
   - 使用 Edit/Write 工具執行實際修改
   - **僅修改必要的程式碼**，嚴禁影響使用者現有的其他功能
6. **自檢驗證**（強烈建議）：
   - 執行專案既有的 lint / typecheck / tests（優先最小相關範圍）
   - 若失敗：優先修復迴歸，再繼續進入 Phase 5

---

### ✅ Phase 5：審計與交付

`[模式：審計]`

#### 5.1 自動審計

**變更生效後，強制立即並行呼叫** Codex 和 Gemini 進行 Code Review：

1. **{{BACKEND_PRIMARY}} 審查**（`run_in_background: true`）：
   - ROLE_FILE: `~/.claude/.ccg/prompts/codex/reviewer.md`
   - 輸入：變更的 Diff + 目標檔案
   - 關注：安全性、效能、錯誤處理、邏輯正確性

2. **{{FRONTEND_PRIMARY}} 審查**（`run_in_background: true`）：
   - ROLE_FILE: `~/.claude/.ccg/prompts/gemini/reviewer.md`
   - 輸入：變更的 Diff + 目標檔案
   - 關注：可訪問性、設計一致性、使用者體驗

用 `TaskOutput` 等待兩個模型的完整審查結果。優先複用 Phase 3 的會話（`resume <SESSION_ID>`）以保持上下文一致。

#### 5.2 整合修復

1. 綜合 Codex + Gemini 的審查意見
2. 按信任規則權衡：後端以 Codex 為準，前端以 Gemini 為準
3. 執行必要的修復
4. 修復後按需重複 Phase 5.1（直到風險可接受）

#### 5.3 交付確認

審計透過後，向使用者報告：

```markdown
## ✅ 執行完成

### 變更摘要
| 檔案 | 操作 | 說明 |
|------|------|------|
| path/to/file.ts | 修改 | 描述 |

### 審計結果
- Codex：<透過/發現 N 個問題>
- Gemini：<透過/發現 N 個問題>

### 後續建議
1. [ ] <建議的測試步驟>
2. [ ] <建議的驗證步驟>
```

---

## 關鍵規則

1. **程式碼主權** – 所有檔案修改由 Claude 執行，外部模型零寫入許可權
2. **髒原型重構** – Codex/Gemini 的輸出視為草稿，必須重構
3. **信任規則** – 後端以 Codex 為準，前端以 Gemini 為準
4. **最小變更** – 僅修改必要的程式碼，不引入副作用
5. **強制審計** – 變更後必須進行多模型 Code Review

---

## 使用方法

```bash
# 執行計劃檔案
/ccg:execute .claude/plan/功能名.md

# 直接執行任務（適用於已在上下文中討論過的計劃）
/ccg:execute 根據之前的計劃實施使用者認證功能
```

---

## 與 /ccg:plan 的關係

1. `/ccg:plan` 生成計劃 + SESSION_ID
2. 使用者確認 "Y" 後
3. `/ccg:execute` 讀取計劃，複用 SESSION_ID，執行實施
