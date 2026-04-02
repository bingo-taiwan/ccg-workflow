---
description: '多模型測試生成：智慧路由 {{BACKEND_PRIMARY}} 後端測試 / {{FRONTEND_PRIMARY}} 前端測試'
---

# Test - 多模型測試生成

根據程式碼型別智慧路由，生成高質量測試用例。

## 使用方法

```bash
/test <測試目標>
```

## 上下文

- 測試目標：$ARGUMENTS
- 智慧路由：後端 → {{BACKEND_PRIMARY}}，前端 → {{FRONTEND_PRIMARY}}，全棧 → 並行
- 遵循專案現有測試框架和風格

## 你的角色

你是**測試工程師**，編排測試生成流程：
- **{{BACKEND_PRIMARY}}** – 後端測試生成（**後端權威**）
- **{{FRONTEND_PRIMARY}}** – 前端測試生成（**前端權威**）
- **Claude (自己)** – 整合測試、驗證執行

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
需求：為以下程式碼生成測試
<程式碼內容>
需求描述：<增強後的需求（如未增強則用 $ARGUMENTS）>
要求：
1. 使用專案現有測試框架
2. 覆蓋正常路徑、邊界條件、異常處理
</TASK>
OUTPUT: 完整測試程式碼
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "簡短描述"
})
```

**角色提示詞**：

| 模型 | 提示詞 |
|------|--------|
| Codex | `~/.claude/.ccg/prompts/codex/tester.md` |
| Gemini | `~/.claude/.ccg/prompts/gemini/tester.md` |

**智慧路由**：

| 程式碼型別 | 路由 |
|---------|------|
| 後端 | {{BACKEND_PRIMARY}} |
| 前端 | {{FRONTEND_PRIMARY}} |
| 全棧 | 並行執行兩者 |

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

## 執行工作流

**測試目標**：$ARGUMENTS

### 🔍 階段 0：Prompt 增強（可選）

`[模式：準備]` - **Prompt 增強**（按 `/ccg:enhance` 的邏輯執行）：分析 $ARGUMENTS 的意圖、缺失資訊、隱含假設，補全為結構化需求（明確目標、技術約束、範圍邊界、驗收標準），**用增強結果替代原始 $ARGUMENTS，後續呼叫 Codex/Gemini 時傳入增強後的需求**

### 🔍 階段 1：測試分析

`[模式：研究]`

1. 檢索目的碼的完整實現
2. 查詢現有測試檔案和測試框架配置
3. 識別程式碼型別：[後端/前端/全棧]
4. 評估當前測試覆蓋率和缺口

### 🔬 階段 2：智慧路由測試生成

`[模式：生成]`

**⚠️ 根據程式碼型別必須呼叫對應模型**（參照上方呼叫規範）：

- **後端程式碼** → `Bash({ command: "...--backend {{BACKEND_PRIMARY}}...", run_in_background: false })`
  - ROLE_FILE: `~/.claude/.ccg/prompts/codex/tester.md`
- **前端程式碼** → `Bash({ command: "...--backend {{FRONTEND_PRIMARY}}...", run_in_background: false })`
  - ROLE_FILE: `~/.claude/.ccg/prompts/gemini/tester.md`
- **全棧程式碼** → 並行呼叫兩者：
  1. `Bash({ command: "...--backend {{BACKEND_PRIMARY}}...", run_in_background: true })`
     - ROLE_FILE: `~/.claude/.ccg/prompts/codex/tester.md`
  2. `Bash({ command: "...--backend {{FRONTEND_PRIMARY}}...", run_in_background: true })`
     - ROLE_FILE: `~/.claude/.ccg/prompts/gemini/tester.md`
  用 `TaskOutput` 等待結果

OUTPUT：完整測試程式碼（使用專案現有測試框架，覆蓋正常路徑、邊界條件、異常處理）

**必須等所有模型返回後才能進入下一階段**。

**務必遵循上方 `多模型呼叫規範` 的 `重要` 指示**

### 🔀 階段 3：測試整合

`[模式：計劃]`

1. 收集模型輸出
2. Claude 重構：統一風格、確保命名一致、最佳化結構、移除冗餘

### ✅ 階段 4：測試驗證

`[模式：執行]`

1. 建立測試檔案
2. 執行生成的測試
3. 如有失敗，分析原因並修復

---

## 輸出格式

```markdown
## 🧪 測試生成：<測試目標>

### 分析結果
- 程式碼型別：[後端/前端/全棧]
- 測試框架：<檢測到的框架>

### 生成的測試
- 測試檔案：<檔案路徑>
- 測試用例數：<數量>

### 執行結果
- 透過：X / Y
- 失敗：<如有，列出原因>
```

## 測試策略金字塔

```
    /\      E2E (10%)
   /--\     Integration (20%)
  /----\    Unit (70%)
```

---

## 關鍵規則

1. **測試行為，不測試實現** – 關注輸入輸出
2. **智慧路由** – 後端測試用 Codex，前端測試用 Gemini
3. **複用現有模式** – 遵循專案已有的測試風格
4. 外部模型對檔案系統**零寫入許可權**
