---
description: '多模型協作規劃 - 上下文檢索 + 雙模型分析 → 生成 Step-by-step 實施計劃'
---

# Plan - 多模型協作規劃

$ARGUMENTS

---

## 核心協議

- **語言協議**：與工具/模型互動用**英語**，與使用者互動用**中文**
- **強制並行**：Codex/Gemini 呼叫必須使用 `run_in_background: true`（包含單模型呼叫，避免阻塞主執行緒）
- **程式碼主權**：外部模型對檔案系統**零寫入許可權**，所有修改由 Claude 執行
- **止損機制**：當前階段輸出透過驗證前，不進入下一階段
- **僅規劃**：本命令允許讀取上下文與寫入 `.claude/plan/*` 計劃檔案，但**禁止修改產品程式碼**

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
需求：<增強後的需求>
上下文：<檢索到的專案上下文>
</TASK>
OUTPUT: Step-by-step implementation plan with pseudo-code. DO NOT modify any files.
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

**會話複用**：每次呼叫返回 `SESSION_ID: xxx`（通常由 wrapper 輸出），**必須儲存**以供後續 `/ccg:execute` 使用。

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

**規劃任務**：$ARGUMENTS

### 🔍 Phase 1：上下文全量檢索

`[模式：研究]`

#### 1.1 Prompt 增強（必須首先執行）

**Prompt 增強**（按 `/ccg:enhance` 的邏輯執行）：分析 $ARGUMENTS 的意圖、缺失資訊、隱含假設，補全為結構化需求（明確目標、技術約束、範圍邊界、驗收標準），**用增強結果替代原始 $ARGUMENTS** 用於後續所有階段。

#### 1.2 上下文檢索

**呼叫 `{{MCP_SEARCH_TOOL}}` 工具**：

```
{{MCP_SEARCH_TOOL}}({
  query: "<基於增強後需求構建的語義查詢>",
  project_root_path: "{{WORKDIR}}"
})
```

- 使用自然語言構建語義查詢（Where/What/How）
- **禁止基於假設回答**
- 若 MCP 不可用：回退到 Glob + Grep 進行檔案發現與關鍵符號定位

#### 1.3 完整性檢查

- 必須獲取相關類、函式、變數的**完整定義與簽名**
- 若上下文不足，觸發**遞迴檢索**
- 優先輸出：入口檔案 + 行號 + 關鍵符號名；必要時補充最小程式碼片段（僅用於消除歧義）

#### 1.4 需求對齊

- 若需求仍有模糊空間，**必須**向使用者輸出引導性問題列表
- 直至需求邊界清晰（無遺漏、無冗餘）

### 💡 Phase 2：多模型協作分析

`[模式：分析]`

#### 2.1 分發輸入

**並行呼叫** Codex 和 Gemini（`run_in_background: true`）：

將**原始需求**（不帶預設觀點）分發給兩個模型：

1. **{{BACKEND_PRIMARY}} 後端分析**：
   - ROLE_FILE: `~/.claude/.ccg/prompts/codex/analyzer.md`
   - 關注：技術可行性、架構影響、效能考量、潛在風險
   - OUTPUT: 多角度解決方案 + 優劣勢分析

2. **{{FRONTEND_PRIMARY}} 前端分析**：
   - ROLE_FILE: `~/.claude/.ccg/prompts/gemini/analyzer.md`
   - 關注：UI/UX 影響、使用者體驗、視覺設計
   - OUTPUT: 多角度解決方案 + 優劣勢分析

用 `TaskOutput` 等待兩個模型的完整結果。**📌 儲存 SESSION_ID**（`CODEX_SESSION` 和 `GEMINI_SESSION`）。

#### 2.2 交叉驗證

整合各方思路，進行迭代最佳化：

1. **識別一致觀點**（強訊號）
2. **識別分歧點**（需權衡）
3. **互補優勢**：後端邏輯以 Codex 為準，前端設計以 Gemini 為準
4. **邏輯推演**：消除方案中的邏輯漏洞

#### 2.3（可選但推薦）雙模型產出“計劃草案”

為降低 Claude 合成計劃的遺漏風險，可並行讓兩個模型輸出“計劃草案”（仍然**不允許**修改檔案）：

1. **{{BACKEND_PRIMARY}} 計劃草案**（後端權威）：
   - ROLE_FILE: `~/.claude/.ccg/prompts/codex/architect.md`
   - OUTPUT: Step-by-step plan + pseudo-code（重點：資料流/邊界條件/錯誤處理/測試策略）

2. **{{FRONTEND_PRIMARY}} 計劃草案**（前端權威）：
   - ROLE_FILE: `~/.claude/.ccg/prompts/gemini/architect.md`
   - OUTPUT: Step-by-step plan + pseudo-code（重點：資訊架構/互動/可訪問性/視覺一致性）

用 `TaskOutput` 等待兩個模型的完整結果，並記錄其建議的關鍵差異點。

#### 2.4 生成實施計劃（Claude 最終版）

綜合雙方分析，生成 **Step-by-step 實施計劃**：

```markdown
## 📋 實施計劃：<任務名稱>

### 任務型別
- [ ] 前端 (→ Gemini)
- [ ] 後端 (→ Codex)
- [ ] 全棧 (→ 並行)

### 技術方案
<綜合 Codex + Gemini 分析的最優方案>

### 實施步驟
1. <步驟 1> - 預期產物
2. <步驟 2> - 預期產物
...

### 關鍵檔案
| 檔案 | 操作 | 說明 |
|------|------|------|
| path/to/file.ts:L10-L50 | 修改 | 描述 |

### 風險與緩解
| 風險 | 緩解措施 |
|------|----------|

### SESSION_ID（供 /ccg:execute 使用）
- CODEX_SESSION: <session_id>
- GEMINI_SESSION: <session_id>
```

### ⛔ Phase 2 結束：計劃交付（非執行）

**`/ccg:plan` 的職責到此結束，必須執行以下動作**：

1. 向使用者展示完整實施計劃（含虛擬碼）
2. 將計劃儲存至 `.claude/plan/<功能名>.md`（功能名從需求中提取，如 `user-auth`、`payment-module` 等）
3. 以**加粗文字**輸出提示（必須使用實際儲存的檔案路徑）：

   ---
   **📋 計劃已生成並儲存至 `.claude/plan/實際功能名.md`**

   **請審查上述計劃，您可以：**
   - 🔧 **修改計劃**：告訴我需要調整的部分，我會更新計劃
   - ▶️ **執行計劃**：複製以下命令到新會話執行

   ```
   /ccg:execute .claude/plan/實際功能名.md
   ```
   ---

   **⚠️ 注意**：上面的 `實際功能名.md` 必須替換為你實際儲存的檔名！

4. **立即終止當前回覆**（Stop here. No more tool calls.）

**⚠️ 絕對禁止**：
- ❌ 問使用者 "Y/N" 然後自動執行（執行是 `/ccg:execute` 的職責）
- ❌ 對產品程式碼進行任何寫操作
- ❌ 自動呼叫 `/ccg:execute` 或任何實施動作
- ❌ 在使用者未明確要求修改時繼續觸發模型呼叫

---

## 計劃儲存

規劃完成後，將計劃儲存至：

- **首次規劃**：`.claude/plan/<功能名>.md`
- **迭代版本**：`.claude/plan/<功能名>-v2.md`、`.claude/plan/<功能名>-v3.md`...

計劃檔案寫入應在向使用者展示計劃前完成。

---

## 計劃修改流程

如果使用者要求修改計劃：

1. 根據使用者反饋調整計劃內容
2. 更新 `.claude/plan/<功能名>.md` 檔案
3. 重新展示修改後的計劃
4. 再次提示使用者審查或執行

---

## 後續步驟

使用者審查滿意後，**手動**執行：

```bash
/ccg:execute .claude/plan/<功能名>.md
```

---

## 關鍵規則

1. **僅規劃不實施** – 本命令不執行任何程式碼變更
2. **不問 Y/N** – 只展示計劃，讓使用者決定下一步
3. **信任規則** – 後端以 Codex 為準，前端以 Gemini 為準
4. 外部模型對檔案系統**零寫入許可權**
5. **SESSION_ID 交接** – 計劃末尾必須包含 `CODEX_SESSION` / `GEMINI_SESSION`（供 `/ccg:execute resume <SESSION_ID>` 使用）
