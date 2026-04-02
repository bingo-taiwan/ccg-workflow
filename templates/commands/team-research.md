---
description: 'Agent Teams 需求研究 - 並行探索程式碼庫，產出約束集 + 可驗證成功判據'
---
<!-- CCG:TEAM:RESEARCH:START -->
**Core Philosophy**
- Research 產出的是**約束集**，不是資訊堆砌。每條約束縮小解決方案空間。
- 約束告訴後續階段"不要考慮這個方向"，使 plan 階段能產出零決策計劃。
- 輸出：約束集合 + 可驗證的成功判據，寫入 `.claude/team-plan/<任務名>-research.md`。

**Guardrails**
- **STOP! BEFORE ANY OTHER ACTION**: 必須先做 Prompt 增強。
- 按上下文邊界（context boundaries）劃分探索範圍，不按角色劃分。
- 多模型協作是 **mandatory**：Codex（後端邊界）+ Gemini（前端邊界）。
- 不做架構決策——只發現約束。
- 使用 `AskUserQuestion` 解決任何歧義，絕不假設。

**Steps**
0. **MANDATORY: Prompt 增強**
   - **立即執行，不可跳過。**
   - 分析 $ARGUMENTS 的意圖、缺失資訊、隱含假設，補全為結構化需求（明確目標、技術約束、範圍邊界、驗收標準）。
   - 後續所有步驟使用增強後的需求。

1. **程式碼庫評估**
   - 用 Glob/Grep/Read 掃描專案結構。
   - 判斷專案規模：單目錄 vs 多目錄。
   - 識別技術棧、框架、現有模式。

2. **定義探索邊界（按上下文劃分）**
   - 識別自然的上下文邊界（不是功能角色）：
     * 邊界 1：使用者域程式碼（models, services, UI）
     * 邊界 2：認證與授權（middleware, session, tokens）
     * 邊界 3：基礎設施（configs, builds, deployments）
   - 每個邊界應自包含，無需跨邊界通訊。

3. **多模型並行探索（PARALLEL）**
   - **CRITICAL**: 必須在一條訊息中同時發起兩個 Bash 呼叫。
   - **工作目錄**：`{{WORKDIR}}` **必須透過 Bash 執行 `pwd`（Unix）或 `cd`（Windows CMD）獲取當前工作目錄的絕對路徑**，禁止從 `$HOME` 或環境變數推斷。

   **FIRST Bash call ({{BACKEND_PRIMARY}})**:
   ```
   Bash({
     command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend {{BACKEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EOF'\nROLE_FILE: ~/.claude/.ccg/prompts/codex/analyzer.md\n<TASK>\n需求：<增強後的需求>\n探索範圍：後端相關上下文邊界\n</TASK>\nOUTPUT (JSON):\n{\n  \"module_name\": \"探索的上下文邊界\",\n  \"existing_structures\": [\"發現的關鍵模式\"],\n  \"existing_conventions\": [\"使用中的規範\"],\n  \"constraints_discovered\": [\"限制解決方案空間的硬約束\"],\n  \"open_questions\": [\"需要使用者確認的歧義\"],\n  \"dependencies\": [\"跨模組依賴\"],\n  \"risks\": [\"潛在阻礙\"],\n  \"success_criteria_hints\": [\"可觀測的成功行為\"]\n}\nEOF",
     run_in_background: true,
     timeout: 3600000,
     description: "{{BACKEND_PRIMARY}} 後端探索"
   })
   ```

   **SECOND Bash call ({{FRONTEND_PRIMARY}}) - IN THE SAME MESSAGE**:
   ```
   Bash({
     command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend {{FRONTEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EOF'\nROLE_FILE: ~/.claude/.ccg/prompts/gemini/analyzer.md\n<TASK>\n需求：<增強後的需求>\n探索範圍：前端相關上下文邊界\n</TASK>\nOUTPUT (JSON):\n{\n  \"module_name\": \"探索的上下文邊界\",\n  \"existing_structures\": [\"發現的關鍵模式\"],\n  \"existing_conventions\": [\"使用中的規範\"],\n  \"constraints_discovered\": [\"限制解決方案空間的硬約束\"],\n  \"open_questions\": [\"需要使用者確認的歧義\"],\n  \"dependencies\": [\"跨模組依賴\"],\n  \"risks\": [\"潛在阻礙\"],\n  \"success_criteria_hints\": [\"可觀測的成功行為\"]\n}\nEOF",
     run_in_background: true,
     timeout: 3600000,
     description: "{{FRONTEND_PRIMARY}} 前端探索"
   })
   ```

   **等待結果**:
   ```
   TaskOutput({ task_id: "<codex_task_id>", block: true, timeout: 600000 })
   TaskOutput({ task_id: "<gemini_task_id>", block: true, timeout: 600000 })
   ```

   ⛔ **Gemini 失敗必須重試**：若 Gemini 呼叫失敗，最多重試 2 次（間隔 5 秒）。3 次全敗才跳過。
   ⛔ **Codex 結果必須等待**：Codex 執行 5-15 分鐘屬正常，超時後繼續輪詢，禁止跳過。

4. **聚合與綜合**
   - 合併所有探索輸出為統一約束集：
     * **硬約束**：技術限制、不可違反的模式
     * **軟約束**：慣例、偏好、風格指南
     * **依賴**：影響實施順序的跨模組關係
     * **風險**：需要緩解的阻礙

5. **歧義消解**
   - 編譯優先順序排序的開放問題列表。
   - 用 `AskUserQuestion` 系統性地呈現：
     * 分組相關問題
     * 為每個問題提供上下文
     * 在適用時建議預設值
   - 將使用者回答轉化為額外約束。

6. **寫入研究檔案**
   - 路徑：`.claude/team-plan/<任務名>-research.md`
   - 格式：

   ```markdown
   # Team Research: <任務名>

   ## 增強後的需求
   <結構化需求描述>

   ## 約束集

   ### 硬約束
   - [HC-1] <約束描述> — 來源：<Codex/Gemini/使用者>
   - [HC-2] ...

   ### 軟約束
   - [SC-1] <約束描述> — 來源：<Codex/Gemini/使用者>
   - [SC-2] ...

   ### 依賴關係
   - [DEP-1] <模組A> → <模組B>：<原因>

   ### 風險
   - [RISK-1] <風險描述> — 緩解：<策略>

   ## 成功判據
   - [OK-1] <可驗證的成功行為>
   - [OK-2] ...

   ## 開放問題（已解決）
   - Q1: <問題> → A: <使用者回答> → 約束：[HC/SC-N]
   ```

7. **上下文檢查點**
   - 報告當前上下文使用量。
   - 提示：`研究完成，執行 /clear 後執行 /ccg:team-plan <任務名> 開始規劃`

**Exit Criteria**
- [ ] Codex + Gemini 探索完成
- [ ] 所有歧義已透過使用者確認解決
- [ ] 約束集 + 成功判據已寫入研究檔案
- [ ] 零開放問題殘留
<!-- CCG:TEAM:RESEARCH:END -->
