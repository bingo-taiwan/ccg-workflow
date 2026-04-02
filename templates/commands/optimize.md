---
description: '多模型效能最佳化：{{BACKEND_PRIMARY}} 後端最佳化 + {{FRONTEND_PRIMARY}} 前端最佳化'
---

# Optimize - 多模型效能最佳化

雙模型並行分析效能瓶頸，按價效比排序最佳化建議。

## 使用方法

```bash
/optimize <最佳化目標>
```

## 上下文

- 最佳化目標：$ARGUMENTS
- Codex 專注後端效能（資料庫、演算法、快取）
- Gemini 專注前端效能（渲染、載入、互動）

## 你的角色

你是**效能工程師**，編排多模型最佳化流程：
- **{{BACKEND_PRIMARY}}** – 後端效能最佳化（**後端權威**）
- **{{FRONTEND_PRIMARY}}** – 前端效能最佳化（**前端權威**）
- **Claude (自己)** – 綜合最佳化、實施變更

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
需求：<增強後的需求（如未增強則用 $ARGUMENTS）>
上下文：<目的碼、現有效能指標等>
</TASK>
OUTPUT: 效能瓶頸列表、最佳化方案、預期收益
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "簡短描述"
})
```

**角色提示詞**：

| 模型 | 提示詞 |
|------|--------|
| Codex | `~/.claude/.ccg/prompts/codex/optimizer.md` |
| Gemini | `~/.claude/.ccg/prompts/gemini/optimizer.md` |

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

## 執行工作流

**最佳化目標**：$ARGUMENTS

### 🔍 階段 0：Prompt 增強（可選）

`[模式：準備]` - **Prompt 增強**（按 `/ccg:enhance` 的邏輯執行）：分析 $ARGUMENTS 的意圖、缺失資訊、隱含假設，補全為結構化需求（明確目標、技術約束、範圍邊界、驗收標準），**用增強結果替代原始 $ARGUMENTS，後續呼叫 Codex/Gemini 時傳入增強後的需求**

### 🔍 階段 1：效能基線

`[模式：研究]`

1. 呼叫 `{{MCP_SEARCH_TOOL}}` 檢索目的碼（如可用）
2. 識別效能關鍵路徑
3. 收集現有指標（如有）

### 🔬 階段 2：並行效能分析

`[模式：分析]`

**⚠️ 必須發起兩個並行 Bash 呼叫**（參照上方呼叫規範）：

1. **{{BACKEND_PRIMARY}} 後端分析**：`Bash({ command: "...--backend {{BACKEND_PRIMARY}}...", run_in_background: true })`
   - ROLE_FILE: `~/.claude/.ccg/prompts/codex/optimizer.md`
   - 需求：分析後端效能問題（$ARGUMENTS）
   - OUTPUT：效能瓶頸列表、最佳化方案、預期收益

2. **{{FRONTEND_PRIMARY}} 前端分析**：`Bash({ command: "...--backend {{FRONTEND_PRIMARY}}...", run_in_background: true })`
   - ROLE_FILE: `~/.claude/.ccg/prompts/gemini/optimizer.md`
   - 需求：分析前端效能問題（Core Web Vitals）
   - OUTPUT：效能瓶頸列表、最佳化方案、預期收益

用 `TaskOutput` 等待兩個模型的完整結果。**必須等所有模型返回後才能進入下一階段**。

**務必遵循上方 `多模型呼叫規範` 的 `重要` 指示**

### 🔀 階段 3：最佳化整合

`[模式：計劃]`

1. 收集雙模型分析結果
2. **優先順序排序**：按 `影響程度 × 實施難度⁻¹` 計算價效比
3. 請求使用者確認最佳化方案

### ⚡ 階段 4：實施最佳化

`[模式：執行]`

使用者確認後按優先順序實施，確保不破壞現有功能。

### ✅ 階段 5：驗證

`[模式：評審]`

執行測試驗證功能，對比最佳化前後指標。

---

## 效能指標參考

| 型別 | 指標 | 良好 | 需最佳化 |
|------|------|------|--------|
| 後端 | API 響應 | <100ms | >500ms |
| 後端 | 資料庫查詢 | <50ms | >200ms |
| 前端 | LCP | <2.5s | >4s |
| 前端 | FID | <100ms | >300ms |
| 前端 | CLS | <0.1 | >0.25 |

## 常見最佳化模式

**後端**：N+1→批次載入、缺索引→複合索引、重複計算→快取、同步→非同步

**前端**：大 Bundle→程式碼分割、頻繁重渲染→memo、大列表→虛擬滾動、未最佳化圖片→WebP

---

## 關鍵規則

1. **先測量後最佳化** – 沒有資料不盲目最佳化
2. **價效比優先** – 高影響 + 低難度優先
3. **不破壞功能** – 最佳化不能引入 bug
4. **信任規則** – 後端以 Codex 為準，前端以 Gemini 為準
