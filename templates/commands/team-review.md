---
description: 'Agent Teams 審查 - 雙模型交叉審查並行實施的產出，分級處理 Critical/Warning/Info'
---
<!-- CCG:TEAM:REVIEW:START -->
**Core Philosophy**
- 雙模型交叉驗證捕獲單模型審查遺漏的盲區。
- Critical 問題必須修復後才能結束。
- 審查範圍嚴格限於 team-exec 的變更，不擴大範圍。

**Guardrails**
- **MANDATORY**: Codex 和 Gemini 必須都完成審查後才能綜合。
- 審查範圍限於 `git diff` 的變更，不做範圍蔓延。
- Lead 可以直接修復 Critical 問題（審查階段允許寫程式碼）。

**Steps**
1. **收集變更產物**
   - 執行 `git diff` 獲取變更摘要。
   - 如果有 `.claude/team-plan/` 下的計劃檔案，讀取約束和成功判據作為審查基準。
   - 列出所有被修改的檔案。

2. **多模型審查（PARALLEL）**
   - **CRITICAL**: 必須在一條訊息中同時發起兩個 Bash 呼叫。
   - **工作目錄**：`{{WORKDIR}}` **必須透過 Bash 執行 `pwd`（Unix）或 `cd`（Windows CMD）獲取當前工作目錄的絕對路徑**，禁止從 `$HOME` 或環境變數推斷。

   **FIRST Bash call ({{BACKEND_PRIMARY}})**:
   ```
   Bash({
     command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend {{BACKEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EOF'\nROLE_FILE: ~/.claude/.ccg/prompts/codex/reviewer.md\n<TASK>\n審查以下變更：\n<git diff 輸出或變更檔案列表>\n</TASK>\nOUTPUT (JSON):\n{\n  \"findings\": [\n    {\n      \"severity\": \"Critical|Warning|Info\",\n      \"dimension\": \"logic|security|performance|error_handling\",\n      \"file\": \"path/to/file\",\n      \"line\": 42,\n      \"description\": \"問題描述\",\n      \"fix_suggestion\": \"修復建議\"\n    }\n  ],\n  \"passed_checks\": [\"已驗證的檢查項\"],\n  \"summary\": \"總體評估\"\n}\nEOF",
     run_in_background: true,
     timeout: 3600000,
     description: "{{BACKEND_PRIMARY}} 後端審查"
   })
   ```

   **SECOND Bash call ({{FRONTEND_PRIMARY}}) - IN THE SAME MESSAGE**:
   ```
   Bash({
     command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend {{FRONTEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EOF'\nROLE_FILE: ~/.claude/.ccg/prompts/gemini/reviewer.md\n<TASK>\n審查以下變更：\n<git diff 輸出或變更檔案列表>\n</TASK>\nOUTPUT (JSON):\n{\n  \"findings\": [\n    {\n      \"severity\": \"Critical|Warning|Info\",\n      \"dimension\": \"patterns|maintainability|accessibility|ux|frontend_security\",\n      \"file\": \"path/to/file\",\n      \"line\": 42,\n      \"description\": \"問題描述\",\n      \"fix_suggestion\": \"修復建議\"\n    }\n  ],\n  \"passed_checks\": [\"已驗證的檢查項\"],\n  \"summary\": \"總體評估\"\n}\nEOF",
     run_in_background: true,
     timeout: 3600000,
     description: "{{FRONTEND_PRIMARY}} 前端審查"
   })
   ```

   **等待結果**:
   ```
   TaskOutput({ task_id: "<codex_task_id>", block: true, timeout: 600000 })
   TaskOutput({ task_id: "<gemini_task_id>", block: true, timeout: 600000 })
   ```

   ⛔ **Gemini 失敗必須重試**：若 Gemini 呼叫失敗，最多重試 2 次（間隔 5 秒）。3 次全敗才跳過。
   ⛔ **Codex 結果必須等待**：Codex 執行 5-15 分鐘屬正常，超時後繼續輪詢，禁止跳過。

3. **綜合發現**
   - 合併兩個模型的發現。
   - 去重重疊問題。
   - 按嚴重性分級：
     * **Critical**: 安全漏洞、邏輯錯誤、資料丟失風險 → 必須修復
     * **Warning**: 模式偏離、可維護性問題 → 建議修復
     * **Info**: 小改進建議 → 可選修復

4. **輸出審查報告**
   ```markdown
   ## 審查報告

   ### 🔴 Critical (X issues) - 必須修復
   - [ ] [安全] file.ts:42 - 描述
   - [ ] [邏輯] api.ts:15 - 描述

   ### 🟡 Warning (Y issues) - 建議修復
   - [ ] [模式] utils.ts:88 - 描述

   ### 🔵 Info (Z issues) - 可選
   - [ ] [維護] helper.ts:20 - 描述

   ### ✅ 已透過檢查
   - ✅ 無 XSS 漏洞
   - ✅ 錯誤處理完整
   ```

5. **決策門**
   - **Critical > 0**:
     * 展示發現，用 `AskUserQuestion` 詢問："立即修復 / 跳過"
     * 選擇修復 → Lead 直接修復（後端問題參考 Codex 建議，前端參考 Gemini 建議）
     * 修復後重新執行受影響的審查維度
     * 重複直到 Critical = 0
   - **Critical = 0**:
     * 報告透過，建議提交程式碼

6. **上下文檢查點**
   - 報告當前上下文使用量。

**Exit Criteria**
- [ ] Codex + Gemini 審查完成
- [ ] 所有發現已綜合分級
- [ ] Critical = 0（已修復或使用者確認跳過）
- [ ] 審查報告已輸出
<!-- CCG:TEAM:REVIEW:END -->
