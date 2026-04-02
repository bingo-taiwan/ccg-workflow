---
description: 'Agent Teams 規劃 - Lead 呼叫 Codex/Gemini 並行分析，產出零決策並行實施計劃'
---
<!-- CCG:TEAM:PLAN:START -->
**Core Philosophy**
- 產出的計劃必須讓 Builder teammates 能無決策機械執行。
- 每個子任務的檔案範圍必須隔離，確保並行不衝突。
- 多模型協作是強制的：Codex（後端權威）+ Gemini（前端權威）。

**Guardrails**
- 多模型分析是 **mandatory**：必須同時呼叫 Codex 和 Gemini。
- 不寫產品程式碼，只做分析和規劃。
- 計劃檔案必須包含 Codex/Gemini 的實際分析摘要。
- 使用 `AskUserQuestion` 解決任何歧義。

**Steps**
1. **上下文收集**
   - 用 Glob/Grep/Read 分析專案結構、技術棧、現有程式碼模式。
   - 如果 `{{MCP_SEARCH_TOOL}}` 可用，優先語義檢索。
   - 整理出：技術棧、目錄結構、關鍵檔案、現有模式。

2. **多模型並行分析（PARALLEL）**
   - **CRITICAL**: 必須在一條訊息中同時發起兩個 Bash 呼叫，`run_in_background: true`。
   - **工作目錄**：`{{WORKDIR}}` **必須透過 Bash 執行 `pwd`（Unix）或 `cd`（Windows CMD）獲取當前工作目錄的絕對路徑**，禁止從 `$HOME` 或環境變數推斷。

   **FIRST Bash call ({{BACKEND_PRIMARY}})**:
   ```
   Bash({
     command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend {{BACKEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EOF'\nROLE_FILE: ~/.claude/.ccg/prompts/codex/analyzer.md\n<TASK>\n需求：$ARGUMENTS\n上下文：<步驟1收集的專案結構和關鍵程式碼>\n</TASK>\nOUTPUT:\n1) 技術可行性評估\n2) 推薦架構方案（精確到檔案和函式）\n3) 詳細實施步驟\n4) 風險評估\nEOF",
     run_in_background: true,
     timeout: 3600000,
     description: "{{BACKEND_PRIMARY}} 後端分析"
   })
   ```

   **SECOND Bash call ({{FRONTEND_PRIMARY}}) - IN THE SAME MESSAGE**:
   ```
   Bash({
     command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend {{FRONTEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EOF'\nROLE_FILE: ~/.claude/.ccg/prompts/gemini/analyzer.md\n<TASK>\n需求：$ARGUMENTS\n上下文：<步驟1收集的專案結構和關鍵程式碼>\n</TASK>\nOUTPUT:\n1) UI/UX 方案\n2) 元件拆分建議（精確到檔案和函式）\n3) 詳細實施步驟\n4) 互動設計要點\nEOF",
     run_in_background: true,
     timeout: 3600000,
     description: "{{FRONTEND_PRIMARY}} 前端分析"
   })
   ```

   **等待結果**:
   ```
   TaskOutput({ task_id: "<codex_task_id>", block: true, timeout: 600000 })
   TaskOutput({ task_id: "<gemini_task_id>", block: true, timeout: 600000 })
   ```

   - 必須指定 `timeout: 600000`，否則預設 30 秒會提前超時。
   - 若 10 分鐘後仍未完成，繼續輪詢，**絕對不要 Kill 程序**。
   - ⛔ **Gemini 失敗必須重試**：若 Gemini 呼叫失敗（非零退出碼或輸出包含錯誤資訊），最多重試 2 次（間隔 5 秒）。僅當 3 次全部失敗時才跳過 Gemini 結果並使用單模型結果繼續。
   - ⛔ **Codex 結果必須等待**：Codex 執行時間較長（5-15 分鐘）屬於正常。TaskOutput 超時後必須繼續輪詢，**絕對禁止在 Codex 未返回結果時直接跳過**。

3. **綜合分析 + 任務拆分**
   - 後端方案以 Codex 為準，前端方案以 Gemini 為準。
   - 拆分為獨立子任務，每個子任務：
     * 檔案範圍不重疊（**強制**）
     * 如果無法避免重疊 → 設為依賴關係
     * 有具體實施步驟和驗收標準
   - 按依賴關係分 Layer：同 Layer 可並行，跨 Layer 序列。

4. **寫入計劃檔案**
   - 路徑：`.claude/team-plan/<任務名>.md`（英文短橫線命名）
   - 格式：

   ```markdown
   # Team Plan: <任務名>

   ## 概述
   <一句話描述>

   ## Codex 分析摘要
   <Codex 實際返回的關鍵內容>

   ## Gemini 分析摘要
   <Gemini 實際返回的關鍵內容>

   ## 技術方案
   <綜合最優方案，含關鍵技術決策>

   ## 子任務列表

   ### Task 1: <名稱>
   - **型別**: 前端/後端
   - **檔案範圍**: <精確檔案路徑列表>
   - **依賴**: 無 / Task N
   - **實施步驟**:
     1. <具體步驟>
     2. <具體步驟>
   - **驗收標準**: <怎麼算完成>

   ### Task 2: <名稱>
   ...

   ## 檔案衝突檢查
   ✅ 無衝突 / ⚠️ 已透過依賴關係解決

   ## 並行分組
   - Layer 1 (並行): Task 1, Task 2
   - Layer 2 (依賴 Layer 1): Task 3
   ```

5. **使用者確認**
   - 展示計劃摘要（子任務數、並行分組、Builder 數量）。
   - 用 `AskUserQuestion` 請求確認。
   - 確認後提示：`計劃已就緒，執行 /ccg:team-exec 開始並行實施`

6. **上下文檢查點**
   - 報告當前上下文使用量。
   - 如果接近 80K：建議 `/clear` 後執行 `/ccg:team-exec`。

**Exit Criteria**
- [ ] Codex + Gemini 分析完成
- [ ] 子任務檔案範圍無衝突
- [ ] 計劃檔案已寫入 `.claude/team-plan/`
- [ ] 使用者已確認計劃
<!-- CCG:TEAM:PLAN:END -->
