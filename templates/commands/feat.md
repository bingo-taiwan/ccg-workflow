---
description: '智慧功能開發 - 自動識別輸入型別，規劃/討論/實施全流程'
---

# Feat - 智慧功能開發

$ARGUMENTS

---

## 多模型呼叫規範

**工作目錄**：
- `{{WORKDIR}}`：**必須透過 Bash 執行 `pwd`（Unix）或 `cd`（Windows CMD）獲取當前工作目錄的絕對路徑**，禁止從 `$HOME` 或環境變數推斷
- 如果使用者透過 `/add-dir` 新增了多個工作區，先用 Glob/Grep 確定任務相關的工作區
- 如果無法確定，用 `AskUserQuestion` 詢問使用者選擇目標工作區

**呼叫語法**（並行用 `run_in_background: true`，序列用 `false`）：

```
# 新會話呼叫
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend <{{BACKEND_PRIMARY}}|{{FRONTEND_PRIMARY}}> {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EOF'
ROLE_FILE: <角色提示詞路徑>
<TASK>
需求：<增強後的需求（如未增強則用 $ARGUMENTS）>
上下文：<前序階段收集的專案上下文、計劃檔案內容等>
</TASK>
OUTPUT: 期望輸出格式
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "簡短描述"
})

# 複用會話呼叫
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend <{{BACKEND_PRIMARY}}|{{FRONTEND_PRIMARY}}> {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"{{WORKDIR}}\" <<'EOF'
ROLE_FILE: <角色提示詞路徑>
<TASK>
需求：<增強後的需求（如未增強則用 $ARGUMENTS）>
上下文：<前序階段收集的專案上下文、計劃檔案內容等>
</TASK>
OUTPUT: 期望輸出格式
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
| 實施 | `~/.claude/.ccg/prompts/codex/architect.md` | `~/.claude/.ccg/prompts/gemini/frontend.md` |
| 審查 | `~/.claude/.ccg/prompts/codex/reviewer.md` | `~/.claude/.ccg/prompts/gemini/reviewer.md` |

**會話複用**：每次呼叫返回 `SESSION_ID: xxx`，後續階段用 `resume xxx` 複用上下文。

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

## 溝通守則

1. 在需要詢問使用者時，儘量使用 `AskUserQuestion` 工具進行互動，舉例場景：請求使用者確認/選擇/批准

---

## 核心工作流程

### 1. 輸入型別判斷

**每次互動必須首先宣告**：「我判斷此次操作型別為：[具體型別]」

| 型別 | 關鍵詞 | 動作 |
|------|--------|------|
| **需求規劃** | 實現、開發、新增、新增、構建、設計 | → 步驟 2（完整規劃） |
| **討論迭代** | 調整、修改、最佳化、改進、包含計劃檔案路徑 | → 讀取現有計劃 → 步驟 2.3 |
| **執行實施** | 開始實施、執行計劃、按照計劃、根據計劃 | → 步驟 3（直接實施） |

---

### 2. 需求規劃流程

#### 2.0 Prompt 增強

**Prompt 增強**（按 `/ccg:enhance` 的邏輯執行）：分析 $ARGUMENTS 的意圖、缺失資訊、隱含假設，補全為結構化需求（明確目標、技術約束、範圍邊界、驗收標準），**用增強結果替代原始 $ARGUMENTS，後續呼叫 Codex/Gemini 時傳入增強後的需求**

#### 2.1 上下文檢索

呼叫 `{{MCP_SEARCH_TOOL}}` 檢索相關程式碼、元件、技術棧。

#### 2.2 任務型別判斷

| 任務型別 | 判斷依據 | 呼叫流程 |
|----------|----------|----------|
| **前端** | 頁面、元件、UI、樣式、佈局 | ui-ux-designer → planner |
| **後端** | API、介面、資料庫、邏輯、演算法 | planner |
| **全棧** | 同時包含前後端 | ui-ux-designer → planner |

#### 2.3 呼叫 Agents

**前端/全棧任務**：先呼叫 `ui-ux-designer` agent
```
執行 agent: ~/.claude/agents/ccg/ui-ux-designer.md
輸入: 專案上下文 + 使用者需求 + 技術棧
輸出: UI/UX 設計方案
```

**所有任務**：呼叫 `planner` agent
```
執行 agent: ~/.claude/agents/ccg/planner.md
輸入: 專案上下文 + UI設計方案(如有) + 使用者需求
輸出: 功能規劃文件
```

#### 2.4 儲存計劃

**檔案命名規則**：
- 首次規劃：`.claude/plan/功能名.md`
- 迭代版本：`.claude/plan/功能名-1.md`、`.claude/plan/功能名-2.md`...

#### 2.5 互動確認

規劃完成後詢問使用者：
- **開始實施** → 步驟 3
- **討論調整** → 重新執行步驟 2.3
- **重新規劃** → 刪除當前計劃，重新執行步驟 2
- **僅儲存計劃** → 退出

---

### 3. 執行實施流程

#### 3.1 讀取計劃

優先使用使用者指定路徑，否則讀取最新的計劃檔案。

#### 3.2 任務型別分析

從計劃提取任務分類：前端 / 後端 / 全棧

#### 3.3 多模型路由實施

按上方呼叫規範呼叫外部模型：

- **前端任務**：呼叫 Gemini，使用實施提示詞
- **後端任務**：呼叫 Codex，使用實施提示詞
- **全棧任務**：並行呼叫 Codex + Gemini（`run_in_background: true`），用 `TaskOutput` 等待結果

**⚠️ 強制規則：必須等待 TaskOutput 返回所有模型的完整結果後才能進入下一階段**

**務必遵循上方 `多模型呼叫規範` 的 `重要` 指示**

#### 3.4 實施後驗證

```bash
git status --short
git diff --name-status
```

詢問使用者是否執行程式碼審查（`/ccg:review`）。

---

### 4. 關鍵執行原則

1. **強制響應要求**：每次互動必須首先說明判斷的操作型別
2. **文件一致性**：規劃文件與實際執行保持同步
3. **依賴關係管理**：前端任務必須確保 UI 設計完整性
4. **多模型信任規則**：
   - 前端以 Gemini 為準
   - 後端以 Codex 為準
5. **使用者溝通透明**：所有判斷和動作都要明確告知使用者

---

## 使用方法

```bash
/feat <功能描述>
```
