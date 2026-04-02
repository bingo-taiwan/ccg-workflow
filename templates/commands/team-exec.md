---
description: 'Agent Teams 並行實施 - 讀取計劃檔案，spawn Builder teammates 並行寫程式碼'
---
<!-- CCG:TEAM:EXEC:START -->
**Core Philosophy**
- 實施是純機械執行——所有決策已在 team-plan 階段完成。
- Lead 不寫程式碼，只做協調和彙總。
- Builder teammates 並行實施，檔案範圍嚴格隔離。

**Guardrails**
- **前置條件**：`.claude/team-plan/` 下必須有計劃檔案。沒有則終止，提示先執行 `/ccg:team-plan`。
- **Agent Teams 必須啟用**：需要 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`。
- Lead 絕不直接修改產品程式碼。
- 每個 Builder 只能修改分配給它的檔案。

**Steps**
1. **前置檢查**
   - 檢測 Agent Teams 是否可用。
   - 若不可用，輸出啟用指引後終止：
     ```
     ⚠️ Agent Teams 未啟用。請先配置：
     在 settings.json 中新增：
     { "env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" } }
     ```
   - 讀取 `.claude/team-plan/` 下最新的計劃檔案。
   - 若無計劃檔案，提示：`請先執行 /ccg:team-plan <任務描述> 生成計劃`，終止。

2. **解析計劃**
   - 解析子任務列表、檔案範圍、依賴關係、並行分組。
   - 向使用者展示摘要並確認：
     ```
     📋 即將並行實施：
     - 子任務：N 個
     - 並行分組：Layer 1 (X 個並行) → Layer 2 (Y 個)
     - Builder 數量：N 個（Sonnet）
     確認開始？
     ```

3. **使用 TeamCreate 建立 Team，然後 spawn teammates 加入該 Team**
   - ⛔ **禁止使用普通 Agent 子代理。必須透過 TeamCreate 建立 team，再透過 Agent(team_name=...) spawn teammates 加入 team。**
   - 先呼叫 TeamCreate 建立 team。
   - 為每個子任務呼叫 TaskCreate 建立 task。
   - 按 Layer 分組，透過 Agent(team_name=..., name="builder-N") spawn Builder teammates（Sonnet）。
   - 透過 TaskUpdate(owner="builder-N") 將 task 分配給對應 Builder。
   - 每個 Builder 的 spawn prompt 必須包含：

   ```
   你是 Builder，負責實施一個子任務。嚴格按照以下指令執行。

   ## 你的任務
   <從計劃檔案中提取該 Builder 負責的子任務全部內容，包括實施步驟>

   ## 工作目錄
   {{WORKDIR}}

   ## 檔案範圍約束（⛔ 硬性規則）
   你只能建立或修改以下檔案：
   <檔案列表>
   嚴禁修改任何其他檔案。違反此規則等於任務失敗。

   ## 實施要求
   1. 嚴格按照實施步驟執行
   2. 程式碼必須符合專案現有規範和模式
   3. 完成後執行相關的 lint/typecheck 驗證（如果專案有配置）
   4. 程式碼應自解釋，非必要不加註釋

   ## 驗收標準
   <從計劃中提取>

   完成所有步驟後，標記任務為 completed。
   ```

   - **依賴關係**：Layer 2 的 Builder 任務設為依賴 Layer 1 的對應任務，等 Layer 1 完成後自動解鎖。
   - spawn 完成後，進入 **delegate 模式**，只協調不寫碼。

4. **透過 TaskList + SendMessage 監控進度**
   - 透過 TaskList 檢視各 task 狀態，透過 SendMessage 與 Builder 溝通。
   - teammates 完成 task 後會自動發訊息通知你，無需輪詢。
   - 如果某個 Builder 遇到問題併發訊息求助：
     * 透過 SendMessage 回覆指導建議
     * 不要自己寫程式碼替它完成
   - 如果某個 Builder 失敗：
     * 記錄失敗原因
     * 不影響其他 Builder 繼續執行

5. **彙總 + 清理**
   - 所有 Builder 完成後，彙總報告：

   ```markdown
   ## ✅ Team 並行實施完成

   ### 變更摘要
   | Builder | 子任務 | 狀態 | 修改檔案 |
   |---------|--------|------|----------|
   | Builder 1 | <名稱> | ✅/❌ | file1, file2 |
   | Builder 2 | <名稱> | ✅/❌ | file3, file4 |
   | ...     | ...    | ...  | ...      |

   ### 後續建議
   1. 執行完整測試驗證整合：`npm test` / `pnpm test`
   2. 檢查各模組間的整合是否正常
   3. 提交程式碼：`git add -A && git commit`
   ```

   - 透過 SendMessage 傳送 shutdown_request 關閉所有 teammates，清理 team。

**Exit Criteria**
- [ ] 所有 Builder 任務完成（或明確失敗並記錄原因）
- [ ] 變更摘要已輸出
- [ ] Team 已清理
<!-- CCG:TEAM:EXEC:END -->
