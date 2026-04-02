---
name: multi-agent
description: Multi-Agent Orchestration - 蟻群仿生設計，定義Agent角色、生命週期、資訊素通訊、任務分解、衝突解決。當需要多Agent並行協作時路由到此。
license: MIT
user-invocable: false
disable-model-invocation: false
---

# 🕸 天羅秘典 · 多 Agent 協同（蟻群仿生版）

> 參考蟻群仿生架構：偵察→工作→審查→修復→完成，資訊素間接通訊，自適應併發。

---

## 蟻群生命週期

所有多 Agent 協同任務遵循統一生命週期：

```
目標 → 偵察(Scout) → 任務池 → 工蟻(Worker)並行執行 → 兵蟻(Soldier)審查 → 修復(如需) → 完成
         │                           │
         │  資訊素衰減（過時資訊自動失效）  │  子任務自動產生
         └───────────────────────────┘
```

### 階段定義

| 階段 | 角色 | 動作 | 產出 |
|------|------|------|------|
| 🔍 偵察 | Scout | 探索程式碼庫，標記關鍵檔案和依賴 | 任務池 + 依賴圖 |
| ⚒️ 工作 | Worker | 並行執行任務，可產生子任務 | 程式碼變更 + 進度資訊素 |
| 🛡️ 審查 | Soldier | 審查所有變更，發現問題 | 修復任務 / 透過 |
| 🔧 修復 | Worker | 執行審查產生的修復任務 | 修復後的程式碼 |
| ✅ 完成 | Lead | 彙總報告，統一 commit | 最終交付 |

---

## Codex 原生協同協議（強化）

在 Codex CLI 中，TeamCreate/Task 抽象統一對映到以下原生動作：

| 協同意圖 | Codex 動作 | 約束 |
|---------|------------|------|
| 建立團隊/子任務 | `spawn_agent` | 明確角色、檔案所有權、完成定義 |
| 下發任務/追問 | `send_input` | 單條訊息只包含一個目標動作 |
| 等待完成 | `wait` | 優先長等待，避免忙輪詢 |
| 長耗時命令 | `awaiter` agent | 測試/構建/監控必須用 awaiter |
| 程式碼探索 | `explorer` agent | 探索結果視為權威，不重複檢索 |
| 執行改動 | `worker` agent | 明確“只改分配檔案” |
| 收尾回收 | `close_agent` | 任務結束必須關閉子 Agent |

### 執行順序（不可跳步）

```
1. 拆解任務 + 檔案鎖定矩陣
2. spawn explorer/worker/awaiter
3. 並行執行 + wait 收斂
4. reviewer 審查 + 必要修復
5. 彙總結果 + close_agent 全量回收
```

---

## 何時啟用多 Agent

### TeamCreate vs Task(subagent) 決策樹

```
收到任務 → 評估規模
  │
  ├─ 涉及 ≥3 個獨立檔案/模組？ → TeamCreate
  ├─ 需要 ≥2 個並行工作流？   → TeamCreate
  ├─ 總步驟 >10 步？          → TeamCreate
  ├─ 使用者明確要求並行/團隊？   → TeamCreate
  │
  ├─ 單一探索/搜尋任務？       → explorer agent
  ├─ 單檔案獨立操作？          → worker agent
  └─ 簡單查詢/單步操作？       → 直接執行
```

**鐵律**：當猶豫時，優先 TeamCreate。多 Agent 並行效率遠高於序列 subagent。

滿足**任意 1 條**即啟用 TeamCreate：

| 條件 | 說明 | 示例 |
|------|------|------|
| 多檔案獨立變更 | ≥3 個無交叉依賴的檔案 | 6 個新秘典各自獨立 |
| 可並行子任務 | ≥2 個無資料依賴的工作流 | 前端+後端+文件 |
| 複雜度高 | 單 Agent 需 >10 步 | 全棧重構 |
| 時間緊迫 | 劫鍾催命，需加速 | 緊急修復多服務 |

---

## 角色體系（蟻群對映）

| 角色 | 蟻群對映 | 道語 | 職責 | 工具許可權 | 模型建議 |
|------|----------|------|------|----------|----------|
| 主修 (Lead) | 蟻后 Queen | 天羅主修 | 任務分解、排程、彙總 | `spawn_agent/send_input/wait/close_agent` | 當前模型 |
| 斥候 (Scout) | 偵察蟻 Scout | 天羅斥候 | 只讀探索，標記關鍵檔案 | `explorer` + Read/Grep/Glob（只讀） | haiku（快速低成本） |
| 道侶 (Worker) | 工蟻 Worker | 天羅道侶 | 執行任務，可產生子任務 | `worker` + Read/Write/Edit/Bash | sonnet/當前模型 |
| 護法 (Soldier) | 兵蟻 Soldier | 天羅護法 | 審查質量，發現問題 | `worker`(審查模式) + Read/Grep/Glob（只讀） | sonnet |
| 走卒 (Drone) | 無人蟻 Drone | 天羅走卒 | 簡單 bash 命令，零 LLM 成本 | Bash（僅此一個） | 無（execSync） |

### 角色使用時機

```
需要了解程式碼庫結構？ → 派 Scout（agent_type=explorer）
需要修改程式碼？       → 派 Worker（agent_type=worker）
需要審查變更？       → 派 Soldier（agent_type=worker，審查提示詞）
需要長耗時命令？      → 派 awaiter（agent_type=awaiter）
需要短命令？         → 直接 Bash（Drone 等價）
```

---

## 企業級角色擴充套件（`/ccg:team` 專用）

`/ccg:team` 命令在蟻群基礎角色之上，增加 3 個大廠級專業角色，對應 Agent Teams 真實 teammates：

| 角色 | Agent 名 | 道語 | 職責 | 工具許可權 | 模型 |
|------|----------|------|------|----------|------|
| 🏗 架構師 (Architect) | `team-architect` | 天羅軍師 | 程式碼庫掃描、架構藍圖、檔案分配矩陣 | Read/Glob/Grep（只讀） | Sonnet |
| 🧪 QA 工程師 (QA) | `team-qa` | 天羅驗毒 | 寫測試、跑測試、lint、typecheck | Read/Write/Edit/Bash/Glob/Grep | Sonnet |
| 🔬 審查員 (Reviewer) | `team-reviewer` | 天羅護法 | 綜合 Codex/Gemini 審查、分級判決 | Read/Glob/Grep（只讀） | Sonnet |

### 8 階段流水線

```
Phase 0: PRE-FLIGHT    → 環境檢測 + 引數解析
Phase 1: REQUIREMENT   → Lead 需求增強 → mini-PRD
Phase 2: ARCHITECTURE  → Codex∥Gemini 外援 + Architect teammate 出藍圖
Phase 3: PLANNING      → Lead 拆任務 → 零決策並行計劃
Phase 4: DEVELOPMENT   → Dev×N teammates 並行編碼（檔案隔離）
Phase 5: TESTING       → QA teammate 寫測試 + 跑全量驗證
Phase 6: REVIEW        → Codex∥Gemini 外援 + Reviewer teammate 綜合審查
Phase 7: FIX           → Dev teammate(s) 修復 Critical（最多 2 輪）
Phase 8: INTEGRATION   → Lead 全量驗證 + 報告 + 清理
```

### 角色生命週期

```
TeamCreate ─── Phase 2: spawn Architect → shutdown
            ├─ Phase 4: spawn Dev×N → shutdown
            ├─ Phase 5: spawn QA → shutdown
            ├─ Phase 6: spawn Reviewer → shutdown
            ├─ Phase 7: spawn Fix-Dev(s) → shutdown
            └─ Phase 8: TeamDelete
```

**推薦入口**：`/ccg:team <需求描述>` — 一鍵跑完 8 階段。
**分步入口**（相容）：`/ccg:team-research` → `/ccg:team-plan` → `/ccg:team-exec` → `/ccg:team-review`

---

## 資訊素系統（Stigmergy）

蟻群透過資訊素間接通訊，而非直接對話。在 Claude Code 中，用 **TaskCreate metadata** 模擬資訊素：

### 資訊素型別

| 型別 | 釋放者 | 含義 | 用途 |
|------|--------|------|------|
| `discovery` | Scout | 發現的程式碼結構、關鍵檔案 | 幫助 Worker 快速定位 |
| `progress` | Worker | 完成的變更、修改的檔案 | 幫助後續 Worker 避免衝突 |
| `warning` | Soldier | 質量問題、衝突風險 | 降低相關任務優先順序 |
| `completion` | Worker | 任務完成標記 | 強化成功路徑 |
| `repellent` | 任意 | 失敗路徑標記（負資訊素） | 阻止後續 Agent 走同一條死路 |

### 實現方式

```
# Scout 完成後，在 TaskUpdate 的 metadata 中記錄發現
TaskUpdate(taskId, metadata: {
  pheromone: "discovery",
  files: ["src/auth.ts", "src/middleware.ts"],
  content: "認證模組依賴 middleware，需先改 middleware"
})

# Worker 失敗後，釋放負資訊素
TaskUpdate(taskId, metadata: {
  pheromone: "repellent",
  files: ["src/legacy.ts"],
  content: "此檔案有迴圈依賴，直接修改會崩潰"
})
```

### 資訊素決策規則

| 規則 | 說明 |
|------|------|
| **正強化** | discovery/completion 資訊素的檔案 → 優先分配 |
| **負懲罰** | warning 資訊素的檔案 → 降低優先順序 |
| **強負懲罰** | repellent 資訊素的檔案 → 避免分配，需主修評估 |
| **ε-greedy** | 90% 按資訊素強度選任務，10% 隨機選 → 避免全擠同一條路 |

---

## 自適應併發

根據任務數量和複雜度動態調整 Agent 數量：

```
任務數 1-2   → 1-2 個 Worker（直接 Task subagent）
任務數 3-5   → TeamCreate, 2-3 個 Worker
任務數 6-10  → TeamCreate, 3-5 個 Worker
任務數 >10   → TeamCreate, 5-7 個 Worker（上限）
```

### 過載保護

| 訊號 | 動作 |
|------|------|
| Agent 連續失敗 ≥2 次 | 減少併發，釋放 repellent 資訊素 |
| 429 限流 | 暫停派發，等待恢復後繼續 |
| 所有任務完成 | 立即進入審查階段 |
| 子任務膨脹 >30 | 停止產生新子任務，先完成現有 |

---

## TeamCreate 最佳實踐

### 命名規範

```yaml
team_name: "{專案}-{任務型別}"  # 如 "abyss-skill-expansion"
agent_type: "{角色}"            # 如 "lead", "developer", "reviewer"
description: "一句話說明團隊目標"
```

---

## 任務分解策略

### 按檔案拆分（首選）

每個 Agent 負責獨立的檔案集合，零交叉：

```
Agent-A: [file1.md, file2.md]  — 互不干涉
Agent-B: [file3.md, file4.md]  — 互不干涉
Agent-C: [file5.md]            — 互不干涉
```

### 按模組拆分

每個 Agent 負責一個功能模組：

```
Agent-前端: src/components/
Agent-後端: src/api/
Agent-基礎: src/lib/
```

### 按流水線拆分（蟻群生命週期）

```
Scout(偵察) → Worker(執行) → Soldier(審查) → Worker(修復) → Lead(彙總)
```

### 依賴感知排程

分配任務前，分析檔案依賴關係：

```
檔案A import 檔案B？
  ├─ 是 → B 的任務必須先完成，A 的任務標記 blocked
  └─ 否 → 可並行
```

**依賴深度優先**：被更多檔案依賴的（底層模組）優先處理。

---

## 並行 vs 序列決策

```
子任務A 和 B 是否共享檔案？
  ├─ 否 → 並行執行
  └─ 是 → 是否寫同一檔案？
       ├─ 否（一讀一寫）→ 先寫後讀，序列
       └─ 是（都寫）→ 嚴格序列，或拆分檔案區域
```

---

## Agent 角色模板

### 主修（Lead / Queen）啟動模板

```
你是天羅主修（蟻后），負責協調多 Agent 協同任務。

生命週期：
1. 偵察階段：派 Scout 探索程式碼庫
2. 工作階段：根據偵察結果分配 Worker 並行執行
3. 審查階段：派 Soldier 審查所有變更
4. 修復階段：如有問題，派 Worker 修復
5. 彙總階段：收集結果，統一 commit

鐵律：
- 每個檔案只能分配給一個 Agent
- 獨立任務必須並行啟動
- 關注資訊素：discovery 優先分配，repellent 避免分配
- 收到所有道侶完成訊息後才能進入審查
- 所有子 Agent 完成後必須 close_agent 回收
```

### 斥候（Scout）啟動模板

```
你是天羅斥候（偵察蟻），負責探索程式碼庫。

職責：
1. 快速掃描專案結構和關鍵檔案
2. 識別檔案間的依賴關係
3. 標記需要修改的檔案和潛在風險
4. 輸出發現（discovery 資訊素）

限制：只讀操作，不修改任何檔案。
```

### 道侶（Worker）啟動模板

```
你是天羅道侶（工蟻），負責執行分配的子任務。

職責：
1. 嚴格按照分配的檔案列表操作
2. 不觸碰未分配的檔案
3. 完成後透過 SendMessage 報告主修
4. 遇阻時立即報告，不自行擴大範圍

報告格式：
- 完成：列出建立/修改的檔案 + 行數
- 阻塞：說明原因 + 建議方案（釋放 warning 資訊素）
```

### 護法（Soldier）啟動模板

```
你是天羅護法（兵蟻），負責審查所有變更。

職責：
1. 審查所有 Worker 的變更
2. 檢查程式碼質量、安全性、一致性
3. 發現問題則生成修復任務
4. 無問題則確認透過

輸出：
- 透過：確認所有變更合格
- 問題：列出問題 + 修復建議（釋放 warning 資訊素）
```

---

## 強約束提示詞模板（可直接複用）

### Worker 指令模板（Codex）

```text
你是執行 Agent，當前任務只允許修改以下檔案：
{owned_files}

硬性約束：
1) 不得修改未分配檔案。
2) 若必須跨檔案修改，先報告阻塞，不得自行擴域。
3) 完成後返回：改動檔案、驗證命令、風險點。
4) 若失敗，返回最小復現與替代方案。
```

### Reviewer 指令模板（Codex）

```text
你是審查 Agent，只讀模式。
請按“正確性 > 安全性 > 迴歸風險 > 風格”輸出問題清單。
若無問題，明確寫“no findings”。
```

### Lead 彙總模板（Codex）

```text
彙總每個子 Agent 的結果，給出：
1) 已完成項
2) 阻塞項
3) 剩餘風險
4) 下一步（可執行命令）
```

---

## 通訊協議

### SendMessage 規範

| 型別 | 用途 | 格式 |
|------|------|------|
| message | 點對點通訊 | `{type: "message", recipient: "agent-name", content: "...", summary: "5字摘要"}` |
| broadcast | 全體通知 | `{type: "broadcast", content: "...", summary: "5字摘要"}` |
| shutdown_request | 請求關閉 | `{type: "shutdown_request", recipient: "agent-name", content: "原因"}` |

### 通訊時機

| 事件 | 傳送者 | 接收者 | 內容 |
|------|--------|--------|------|
| 偵察完成 | Scout | 主修 | 檔案清單 + 依賴圖 + discovery 資訊素 |
| 任務分配 | 主修 | 道侶 | 檔案列表 + 要求 + 相關資訊素 |
| 任務完成 | 道侶 | 主修 | 檔案清單 + 驗證結果 |
| 遇阻報告 | 道侶 | 主修 | 阻塞原因 + warning/repellent 資訊素 |
| 審查完成 | 護法 | 主修 | 透過/問題列表 |
| 彙總指令 | 主修 | 全體 | broadcast 進入彙總階段 |

---

## 檔案鎖定與衝突避免

### 黃金規則

```
每個檔案在同一時刻只能被一個 Agent 修改。
違反此規則 = 道基裂痕 +1。
```

### 鎖定策略

1. **分配時鎖定** — 主修分配任務時明確檔案歸屬
2. **宣告式鎖定** — 道侶開始前宣告要操作的檔案
3. **衝突檢測** — 主修檢查檔案分配無重疊後才啟動
4. **依賴感知** — 檔案 A import 檔案 B，則 A 和 B 不可同時修改

### 衝突解決

| 衝突型別 | 解決方案 |
|----------|----------|
| 兩個 Agent 需寫同一檔案 | 序列執行，先完成的先寫 |
| 寫入內容矛盾 | 主修裁決，以業務邏輯為準 |
| 依賴檔案未就緒 | 標記 blocked，主修協調優先順序 |
| 迴圈依賴 | 釋放 repellent 資訊素，主修手動拆解 |

---

## 狀態共享

### TaskCreate/TaskUpdate 規範

```
TaskCreate: 主修建立總任務 + 子任務
TaskUpdate: 道侶更新子任務狀態 + metadata（資訊素）
TaskList:   主修檢視全域性進度
TaskGet:    檢視任務詳情 + 資訊素
```

### 狀態流轉

```
pending → in_progress → completed
                     → blocked (需等待依賴)
```

---

## 錯誤處理與容錯

### 單 Agent 失敗

```
道侶失敗 → 釋放 repellent 資訊素 → 報告主修 → 主修評估影響
  ├─ 可重試 → 同一道侶重試（≤2次）
  ├─ 需換策略 → 主修調整方案後重新分配（參考 repellent 避開死路）
  └─ 不可恢復 → 主修接管該子任務
```

### 通訊超時

```
道侶無響應 → 主修等待 30s → 再次傳送 → 仍無響應 → 標記異常，重新分配
```

### 降級策略

```
多 Agent 協同失敗 → 降級為單 Agent 序列執行
寧可慢，不可錯。
```

---

## 結果彙總模式

### 彙總流程（蟻群版）

```
1. 收集所有道侶完成報告
2. 派護法審查所有變更（可選，變更 >3 個檔案時建議）
3. 如有修復任務，派道侶修復
4. 驗證檔案完整性（所有預期檔案存在）
5. 驗證內容一致性（交叉引用正確）
6. 統一 git add + commit
7. 輸出彙總報告
```

### 統一 Commit 規範

```bash
# 主修負責最終 commit，道侶不單獨 commit
git add -A
git commit -m "feat: {任務描述}

Co-authored-by: Agent-A
Co-authored-by: Agent-B"
```

### 彙總報告模板

```
🕸 天羅收陣！

【陣法】{團隊名稱}
【陣員】{Agent數量} 道侶 + {Scout數} 斥候 + {Soldier數} 護法
【生命週期】偵察 → 工作 → 審查 → 完成
【資訊素】
  - discovery: {數量} 條
  - completion: {數量} 條
  - warning: {數量} 條
  - repellent: {數量} 條
【戰果】
  - Agent-A: {檔案數} 檔案，{行數} 行
  - Agent-B: {檔案數} 檔案，{行數} 行
【驗證】全部檔案存在 ✓ | 交叉引用正確 ✓
【耗時】{總時間}
```

---
