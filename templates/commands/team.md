---
description: 'Agent Teams 8 階段企業級工作流 - 7 角色全流程統一編排（需求→架構→規劃→開發→測試→審查→修復→整合）'
---
<!-- CCG:TEAM:UNIFIED:START -->

⛔⛔⛔ **CRITICAL HARD RULE — AGENT TEAMS ONLY** ⛔⛔⛔

**禁止使用普通 Agent 子代理。本命令的所有角色必須透過 Agent Teams 建立：**

1. **第一步永遠是 TeamCreate** — 建立一個 team，獲得 team_name
2. **所有角色透過 Agent(team_name=..., name=...) spawn** — 這樣它們才是真正的 teammates
3. **透過 TaskCreate/TaskUpdate 分配任務** — 共享任務板
4. **透過 SendMessage 通訊** — teammates 之間直接通訊
5. **禁止使用不帶 team_name 的 Agent() 呼叫** — 那是普通子代理，不是 Agent Teams

**正確示範（必須這樣做）**:
```
TeamCreate({ team_name: "todo-crud-team", description: "..." })

TaskCreate({ subject: "架構藍圖設計", description: "..." })

Agent({ team_name: "todo-crud-team", name: "architect", prompt: "...", model: "sonnet" })

TaskUpdate({ taskId: "1", owner: "architect" })
```

**錯誤示範（絕對禁止）**:
```
❌ Agent({ prompt: "...", subagent_type: "Plan" })          ← 這是普通子代理！
❌ Agent({ description: "...", prompt: "..." })              ← 沒有 team_name！
❌ Agent({ name: "architect", prompt: "..." })               ← 沒有 team_name！
```

違反此規則 = 整個工作流無效，必須重來。

⛔⛔⛔ **END HARD RULE** ⛔⛔⛔

---

**Core Philosophy**
- 單命令完成從需求到交付的完整流程，對標大廠工程團隊編制。
- Lead（你自己）是技術總監/PM，只做編排和決策，絕不寫產品程式碼。
- 所有專業角色（Architect、Dev、QA、Reviewer）均為 **Agent Teams 真實 teammates**。
- 必須透過 TeamCreate 建立 team，再透過 Agent(team_name=...) spawn teammates。
- 透過 SendMessage 通訊，透過 TaskList/TaskCreate/TaskUpdate 協調。
- Codex/Gemini 多模型分析只在 Architecture 和 Review 階段作為"外援參考"注入。

**角色編制（7 角色）**

| 角色 | 身份 | spawn 方式 | 模型 | 職責 |
|------|------|-----------|------|------|
| 🏛 Lead | 你自己（主對話） | N/A（不需要 spawn） | Opus | 編排、決策、使用者溝通 |
| 🏗 Architect | Agent Teams teammate | `Agent(team_name=T, name="architect")` | Opus | 程式碼庫掃描、架構藍圖、檔案分配 |
| 📜 Dev × N | Agent Teams teammates | `Agent(team_name=T, name="dev-1")` | Sonnet | 並行編碼，檔案隔離 |
| 🧪 QA | Agent Teams teammate | `Agent(team_name=T, name="qa")` | Sonnet | 寫測試、跑測試、lint、typecheck |
| 🔬 Reviewer | Agent Teams teammate | `Agent(team_name=T, name="reviewer")` | Sonnet | 綜合審查，分級判決 |
| 🔥 {{BACKEND_PRIMARY}} | 外部模型（非 teammate） | Bash + codeagent-wrapper | {{BACKEND_PRIMARY}} | 後端分析/審查（Phase 2, 6） |
| 🔮 {{FRONTEND_PRIMARY}} | 外部模型（非 teammate） | Bash + codeagent-wrapper | {{FRONTEND_PRIMARY}} | 前端分析/審查（Phase 2, 6） |

**8 階段流水線**

```
Phase 0: PRE-FLIGHT    → 環境檢測
Phase 1: REQUIREMENT   → Lead 需求增強 → mini-PRD
Phase 2: ARCHITECTURE  → Codex∥Gemini 分析 + Architect teammate 出藍圖
Phase 3: PLANNING      → Lead 拆任務 → 零決策並行計劃
Phase 4: DEVELOPMENT   → Dev×N teammates 並行編碼
Phase 5: TESTING       → QA teammate 寫測試+跑測試
Phase 6: REVIEW        → Codex∥Gemini 審查 + Reviewer teammate 綜合判決
Phase 7: FIX           → Dev teammate(s) 修復 Critical（最多 2 輪）
Phase 8: INTEGRATION   → Lead 全量驗證 + 報告 + 清理
```

**Guardrails**
- **Agent Teams 必須啟用**：需要 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`。
- Lead 絕不直接修改產品程式碼。
- 每個 Dev 只能修改分配給它的檔案。
- QA 只寫測試檔案，不改產品程式碼。
- Reviewer 只讀不寫。
- Architect 只讀不寫。
- Phase 7 最多 2 輪修復迴圈。

**Steps**

---

### Phase 0: PRE-FLIGHT + 建立 Team

1. **獲取工作目錄**
   - 透過 Bash 執行 `pwd` 獲取當前工作目錄的絕對路徑，儲存為 WORKDIR。

2. **解析 $ARGUMENTS**
   - 如果引數為空，用 AskUserQuestion 請求任務描述。
   - 從任務描述中提取一個英文短橫線命名的任務名（如 `todo-crud`），用於檔案命名和 team 命名。

3. **⛔ 立即建立 Team — 這是你的第一個工具呼叫動作**
   - 你必須現在就呼叫 TeamCreate 工具。不是稍後，不是在 Phase 2，而是**現在**。
   - 呼叫 TeamCreate，引數：team_name 設為 `<任務名>-team`，description 設為任務描述。
   - 這一步建立了共享任務板和通訊通道。後續所有 Agent 呼叫都必須帶上這個 team_name。
   - 如果 TeamCreate 失敗（Agent Teams 未啟用），輸出啟用指引後終止。

---

### Phase 1: REQUIREMENT

**執行者**：Lead（你自己）

1. **需求增強**
   - 分析 $ARGUMENTS 的意圖、缺失資訊、隱含假設。
   - 補全為結構化需求：明確目標、技術約束、範圍邊界、驗收標準。

2. **生成 mini-PRD**
   - 用 Glob/Grep/Read 快速掃描專案結構，瞭解技術棧。
   - 寫入 `.claude/team-plan/<任務名>-prd.md`：

   ```markdown
   # PRD: <任務名>
   ## 目標
   <一句話描述>
   ## 功能範圍
   - 包含：[列表]
   - 不包含：[列表]
   ## 技術上下文
   - 技術棧：[自動檢測]
   - 專案結構：[關鍵目錄]
   ## 驗收標準
   - [AC-1] <可驗證條件>
   - [AC-2] ...
   ```

3. **使用者確認**
   - 用 `AskUserQuestion` 展示 PRD 摘要，請求確認或補充。

---

### Phase 2: ARCHITECTURE

**執行者**：Lead 呼叫 Codex/Gemini → Architect teammate 綜合

1. **Team 已在 Phase 0 建立**，直接使用已有的 team_name。

2. **{{BACKEND_PRIMARY}} + {{FRONTEND_PRIMARY}} 並行分析（PARALLEL）**
   - **CRITICAL**: 必須在一條訊息中同時發起兩個 Bash 呼叫，`run_in_background: true`。

   **FIRST Bash call ({{BACKEND_PRIMARY}})**:
   ```
   Bash({
     command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend {{BACKEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EOF'\nROLE_FILE: ~/.claude/.ccg/prompts/codex/architect.md\n<TASK>\n需求：<PRD 內容>\n請分析後端架構：模組邊界、API 設計、資料模型、依賴關係、實施建議。\n</TASK>\nEOF",
     run_in_background: true,
     timeout: 3600000,
     description: "{{BACKEND_PRIMARY}} 後端架構分析"
   })
   ```

   **SECOND Bash call ({{FRONTEND_PRIMARY}}) - IN THE SAME MESSAGE**:
   ```
   Bash({
     command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend {{FRONTEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EOF'\nROLE_FILE: ~/.claude/.ccg/prompts/gemini/architect.md\n<TASK>\n需求：<PRD 內容>\n請分析前端架構：元件拆分、狀態管理、路由設計、UI/UX 要點、實施建議。\n</TASK>\nEOF",
     run_in_background: true,
     timeout: 3600000,
     description: "{{FRONTEND_PRIMARY}} 前端架構分析"
   })
   ```

   **等待結果**:
   ```
   TaskOutput({ task_id: "<codex_task_id>", block: true, timeout: 600000 })
   TaskOutput({ task_id: "<gemini_task_id>", block: true, timeout: 600000 })
   ```

   ⛔ **Gemini 失敗必須重試**：若 Gemini 呼叫失敗，最多重試 2 次（間隔 5 秒）。3 次全敗才跳過。
   ⛔ **Codex 結果必須等待**：Codex 執行 5-15 分鐘屬正常，超時後繼續輪詢，禁止跳過。

3. **Spawn Architect teammate**
   - 先呼叫 TaskCreate 工具，subject 為 "架構藍圖設計"。
   - 然後呼叫 Agent 工具 spawn Architect。**你必須在 Agent 工具呼叫中設定以下引數**：
     * **team_name**: 設為 Phase 0 建立的 team name（如 `todo-crud-team`）
     * **name**: 設為 `"architect"`
     * **model**: 設為 `"opus"`
     * **prompt**: 包含 PRD 內容、Codex/Gemini 分析摘要（如有）、WORKDIR、以及指令（掃描程式碼庫→設計藍圖→輸出檔案分配矩陣→寫入 .claude/team-plan/→標記 completed）
   - 呼叫 TaskUpdate 將任務 owner 設為 `"architect"`。
   - 等待 Architect 完成（它會自動發訊息通知你）。

4. **讀取藍圖**
   - Read `.claude/team-plan/<任務名>-blueprint.md`
   - 驗證檔案分配矩陣完整性（每個檔案只在一個 Dev 集合中）。

5. **Shutdown Architect**
   - `SendMessage({ to: "architect", message: { type: "shutdown_request" } })`

---

### Phase 3: PLANNING

**執行者**：Lead（你自己）

1. **基於藍圖拆分子任務**
   - 讀取藍圖中的檔案分配矩陣。
   - 為每個 Dev 檔案集合建立一個子任務。
   - 每個子任務必須包含：
     * 精確的檔案範圍（從藍圖的檔案分配矩陣）
     * 具體的實施步驟（從藍圖的設計方案）
     * 驗收標準（從藍圖和 PRD）

2. **確保檔案隔離**
   - 校驗：任何檔案不出現在兩個子任務中。
   - 若發現重疊 → 將重疊檔案放入同一子任務，或設定依賴關係。

3. **並行分層**
   - Layer 1：無依賴的子任務（可並行）。
   - Layer 2：依賴 Layer 1 的子任務。

4. **寫入計劃檔案**
   - 路徑：`.claude/team-plan/<任務名>-plan.md`
   - 格式同現有 team-plan 輸出格式（見 `/ccg:team-plan`）。

5. **使用者確認**
   - 用 `AskUserQuestion` 展示計劃摘要：
     ```
     📋 即將並行實施：
     - 子任務：N 個
     - 並行分組：Layer 1 (X 個並行) → Layer 2 (Y 個)
     - Dev 數量：N 個
     確認開始？
     ```

---

### Phase 4: DEVELOPMENT

**執行者**：Dev × N teammates（⛔ 必須並行）

⛔ **核心規則：所有同 Layer 的 Dev 必須在同一條訊息中同時 spawn，讓它們並行跑。禁止序列（spawn dev-1 → 等完成 → spawn dev-2）。**

1. **一次性建立所有 Task + 設定依賴**
   - 為藍圖中的每個子任務呼叫 TaskCreate（在同一輪完成所有 TaskCreate）。
   - 如有 Layer 依賴：用 TaskUpdate 的 addBlockedBy 設定。

2. **⛔ 在同一條訊息中並行 spawn 所有同 Layer 的 Dev**
   - 你必須在**一條訊息中發起多個 Agent 工具呼叫**，每個 Dev 一個 Agent 呼叫。
   - 例如 3 個並行 Dev，你的這條訊息應包含 3 個 Agent 工具呼叫，它們會同時啟動。
   - 每個 Agent 呼叫必須設定：
     * **team_name**: Phase 0 建立的 team name
     * **name**: `"dev-1"`, `"dev-2"`, `"dev-3"` 等
     * **model**: `"sonnet"`
     * **prompt**: 包含該 Dev 的子任務內容、WORKDIR、檔案範圍約束、實施步驟、驗收標準
   - spawn 後立即對每個 Task 呼叫 TaskUpdate 設 owner。

   示意（3 個 Dev 並行）：
   你的一條訊息中同時包含：
   - Agent(team_name=T, name="dev-1", prompt="...任務1...")
   - Agent(team_name=T, name="dev-2", prompt="...任務2...")
   - Agent(team_name=T, name="dev-3", prompt="...任務3...")
   三個 Dev 同時啟動，並行工作。

3. **等待所有 Dev 完成**
   - teammates 完成後會自動發訊息通知，無需輪詢。
   - 如果某個 Dev 遇到問題併發訊息求助：透過 SendMessage 回覆指導。
   - 如果某個 Dev 失敗：記錄失敗原因，不影響其他 Dev 繼續。

4. **Layer 2（如有）**
   - Layer 1 所有 Dev 完成後，同樣在一條訊息中並行 spawn Layer 2 的所有 Dev。

5. **所有 Dev 完成後，Shutdown 所有 Dev**
   - 逐一傳送 shutdown_request。

---

### Phase 5: TESTING

**執行者**：QA teammate

1. **收集變更清單**
   - 執行 `git diff --name-only` 獲取所有變更檔案列表。

2. **Spawn QA teammate**
   - 呼叫 TaskCreate，subject 為 "QA: 全量測試驗證"。
   - 呼叫 Agent 工具，**必須設定以下引數**：
     * **team_name**: Phase 0 建立的 team name
     * **name**: `"qa"`
     * **model**: `"sonnet"`
     * **prompt**: 包含變更檔案列表、驗收標準、WORKDIR、以及指令（檢測測試框架→寫測試→跑全量→輸出報告→標記 completed）
   - 呼叫 TaskUpdate 設 owner 為 `"qa"`。
   - 等待 QA 完成（它會自動發訊息通知你）。

3. **讀取 QA 報告**
   - 從 QA 的訊息或任務 metadata 中獲取質量報告。
   - 如果測試全部透過 → 繼續 Phase 6。
   - 如果測試失敗 → 記錄失敗項，繼續 Phase 6（Review 可能發現根因）。

4. **Shutdown QA**
   - `SendMessage({ to: "qa", message: { type: "shutdown_request" } })`

---

### Phase 6: REVIEW

**執行者**：Lead 呼叫 Codex/Gemini → Reviewer teammate 綜合

1. **執行 git diff 獲取變更**
   - `Bash: git diff` 獲取完整變更內容。

2. **{{BACKEND_PRIMARY}} + {{FRONTEND_PRIMARY}} 並行審查（PARALLEL）**
   - 模式與 Phase 2 相同，使用 reviewer prompt：

   **FIRST Bash call ({{BACKEND_PRIMARY}})**:
   ```
   Bash({
     command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend {{BACKEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EOF'\nROLE_FILE: ~/.claude/.ccg/prompts/codex/reviewer.md\n<TASK>\n審查以下變更：\n<git diff 輸出或變更檔案列表>\n</TASK>\nOUTPUT (JSON):\n{\n  \"findings\": [{\"severity\": \"Critical|Warning|Info\", \"dimension\": \"logic|security|performance|error_handling\", \"file\": \"path\", \"line\": N, \"description\": \"描述\", \"fix_suggestion\": \"修復建議\"}],\n  \"passed_checks\": [\"檢查項\"],\n  \"summary\": \"總體評估\"\n}\nEOF",
     run_in_background: true,
     timeout: 3600000,
     description: "{{BACKEND_PRIMARY}} 後端審查"
   })
   ```

   **SECOND Bash call ({{FRONTEND_PRIMARY}}) - IN THE SAME MESSAGE**:
   ```
   Bash({
     command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend {{FRONTEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EOF'\nROLE_FILE: ~/.claude/.ccg/prompts/gemini/reviewer.md\n<TASK>\n審查以下變更：\n<git diff 輸出或變更檔案列表>\n</TASK>\nOUTPUT (JSON):\n{\n  \"findings\": [{\"severity\": \"Critical|Warning|Info\", \"dimension\": \"patterns|maintainability|accessibility|ux|frontend_security\", \"file\": \"path\", \"line\": N, \"description\": \"描述\", \"fix_suggestion\": \"修復建議\"}],\n  \"passed_checks\": [\"檢查項\"],\n  \"summary\": \"總體評估\"\n}\nEOF",
     run_in_background: true,
     timeout: 3600000,
     description: "{{FRONTEND_PRIMARY}} 前端審查"
   })
   ```

   ⛔ **Gemini 失敗必須重試**：若失敗，最多重試 2 次（間隔 5 秒）。3 次全敗才跳過。
   ⛔ **Codex 結果必須等待**：超時後繼續輪詢，禁止跳過。

3. **Spawn Reviewer teammate**
   - 呼叫 TaskCreate，subject 為 "Review: 綜合程式碼審查"。
   - 呼叫 Agent 工具，**必須設定以下引數**：
     * **team_name**: Phase 0 建立的 team name
     * **name**: `"reviewer"`
     * **model**: `"sonnet"`
     * **prompt**: 包含 git diff、Codex/Gemini 審查 JSON（如有）、QA 報告、WORKDIR、以及指令（獨立審查→綜合意見→分級→輸出報告→標記 completed）
   - 呼叫 TaskUpdate 設 owner 為 `"reviewer"`。
   - 等待 Reviewer 完成（它會自動發訊息通知你）。

4. **讀取審查報告**
   - 從 Reviewer 訊息中提取 Critical / Warning / Info 列表。
   - 向使用者展示審查摘要。

5. **Shutdown Reviewer**
   - `SendMessage({ to: "reviewer", message: { type: "shutdown_request" } })`

---

### Phase 7: FIX (Evaluator-Optimizer Loop)

**執行者**：Dev teammate(s)，最多 2 輪

**FIX_ROUND = 0**

1. **判斷是否需要修復**
   - 如果 Critical == 0 → 跳過 Phase 7，直接進入 Phase 8。
   - 如果 Critical > 0 → 進入修復迴圈。

2. **修復迴圈（最多 2 輪）**

   **WHILE Critical > 0 AND FIX_ROUND < 2:**

   a. **FIX_ROUND += 1**

   b. **建立修復任務**
      - 為每個 Critical finding 建立修復任務。
      - 根據 finding 的檔案歸屬，分配給對應的 Dev。
      - 如果多個 finding 涉及同一檔案 → 合併為一個修復任務。

   c. **Spawn Fix Dev teammate(s)**
      - 呼叫 Agent 工具，**必須設定以下引數**：
        * **team_name**: Phase 0 建立的 team name
        * **name**: `"fix-dev-1"`, `"fix-dev-2"`, ... 依次命名
        * **model**: `"sonnet"`
        * **prompt**: 包含 Critical findings（檔案、行號、描述、修復建議）、檔案範圍約束、WORKDIR

   d. **等待修復完成**

   e. **Shutdown Fix Dev(s)**

   f. **輕量驗證**
      - Lead 透過 Bash 執行測試命令驗證修復：
        ```
        Bash: cd {{WORKDIR}} && <測試命令>
        ```
      - 快速檢查修復的 Critical 是否解決（Read 修復的檔案驗證）。

   g. **更新 Critical 計數**
      - 如果 Critical 仍 > 0 且 FIX_ROUND < 2 → 繼續迴圈。
      - 如果 FIX_ROUND >= 2 且 Critical 仍 > 0 → 退出迴圈，報告使用者。

3. **修復迴圈結束**
   - 如果所有 Critical 已修復 → 繼續 Phase 8。
   - 如果仍有 Critical → 用 `AskUserQuestion` 報告：
     ```
     經過 2 輪自動修復，仍有 N 個 Critical 問題未解決：
     - [C-X] 描述...
     選擇：繼續手動修復 / 跳過並提交
     ```

---

### Phase 8: INTEGRATION

**執行者**：Lead（你自己）

1. **全量驗證**
   - 執行完整測試套件：`Bash: cd {{WORKDIR}} && <測試命令>`
   - 執行 lint（如有）。
   - 執行 typecheck（如有）。

2. **知識沉澱**
   - 寫入最終報告到 `.claude/team-plan/<任務名>-report.md`：

   ```markdown
   # Team Report: <任務名>

   ## 概述
   <一句話描述完成的工作>

   ## 團隊編制
   - Architect: 1
   - Dev: N
   - QA: 1
   - Reviewer: 1
   - 外援: Codex + Gemini

   ## 階段執行摘要
   | 階段 | 狀態 | 關鍵產出 |
   |------|------|----------|
   | Requirement | ✅ | PRD |
   | Architecture | ✅ | 藍圖 + 檔案分配 |
   | Planning | ✅ | N 個子任務 |
   | Development | ✅/⚠️ | 變更檔案列表 |
   | Testing | ✅/❌ | 測試報告 |
   | Review | ✅/⚠️ | 審查報告 |
   | Fix | ✅/⚠️/N/A | 修復 N 輪 |

   ## 變更摘要
   | Dev | 子任務 | 狀態 | 修改檔案 |
   |-----|--------|------|----------|
   | dev-1 | <名稱> | ✅/❌ | file1, file2 |
   | dev-2 | <名稱> | ✅/❌ | file3 |

   ## 審查結論
   - Critical: 0 ✅
   - Warning: N
   - Info: N

   ## 測試結論
   - 透過: N / 總計: N
   - Lint: ✅/❌
   - Typecheck: ✅/❌

   ## 後續建議
   1. [建議項]
   ```

3. **輸出最終摘要**
   - 向使用者展示簡潔的完成報告。

4. **清理 Team**
   - 確保所有 teammates 已 shutdown。
   - 如果仍有活躍的 teammates → 逐一傳送 shutdown_request。
   - `TeamDelete()` 清理 team。

---

**Exit Criteria**
- [ ] 所有 8 個階段已執行（或明確跳過並記錄原因）
- [ ] PRD、藍圖、計劃、報告 4 個產物檔案已寫入 `.claude/team-plan/`
- [ ] 所有 Critical 審查問題已修復（或使用者確認跳過）
- [ ] 測試透過（或使用者確認接受失敗項）
- [ ] Team 已清理（所有 teammates shutdown + TeamDelete）
- [ ] 最終報告已輸出給使用者
<!-- CCG:TEAM:UNIFIED:END -->
