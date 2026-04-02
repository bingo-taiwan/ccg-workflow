# 工作流指南

不同的活用不同的工作流。別糾結選哪個，看下面的決策樹。

## 怎麼選

```
拿到任務
  │
  ├─ 很簡單，一句話說清？ ──→ /ccg:frontend 或 /ccg:backend
  │
  ├─ 想先看看計劃？ ────────→ /ccg:plan → /ccg:execute
  │
  ├─ 不想讓 AI 亂來？ ─────→ /ccg:spec-* 系列
  │
  ├─ 能拆成 3+ 個模組？ ───→ /ccg:team-* 系列
  │
  └─ 從頭到尾全包？ ────────→ /ccg:workflow
```

## 規劃 → 執行（最常用）

先讓 Codex 和 Gemini 各出一份分析，Claude 綜合成計劃。你看完計劃覺得沒問題，再執行。

```bash
/ccg:plan 實現使用者認證功能
# 計劃儲存在 .claude/plan/ 目錄
# 開啟看看，不滿意可以直接改

# 兩種執行方式，選一個：
/ccg:execute .claude/plan/user-auth.md   # Claude 親自幹，精細控制
/ccg:codex-exec .claude/plan/user-auth.md  # Codex 全乾，Claude 只稽核
```

**execute 和 codex-exec 怎麼選？**

`execute` 適合複雜任務——Claude 處理每一步，能隨時調整方向。但 token 消耗大。

`codex-exec` 適合目標明確的任務——Codex 一口氣幹完，Claude 最後審一遍。token 消耗小得多。

## OPSX 規範驅動（嚴格控制）

有些場景你不想讓 AI 自由發揮。比如實現許可權系統，你希望每個細節都有據可查。

OPSX 的思路是：**先把需求變成約束條件，再把約束變成零決策計劃。執行階段不需要做任何判斷——所有判斷在規劃階段就做完了。**

```bash
/ccg:spec-init
/ccg:spec-research 實現 RBAC 許可權系統
# 這步會輸出一堆約束條件，比如：
# - 必須支援角色繼承
# - 許可權檢查延遲 < 5ms
# - 必須有審計日誌

/ccg:spec-plan
# 約束 → 零決策計劃
# 每一步該改哪個檔案、改什麼內容、怎麼驗證，都寫清楚了

/ccg:spec-impl
# 按計劃一步步執行，不需要再做決策

/ccg:spec-review
# 雙模型獨立審查，這個隨時都能用
```

每階段之間可以 `/clear` 釋放上下文——狀態存在 `openspec/` 目錄裡，不怕丟。

## Agent Teams 並行（多模組同時開工）

任務能拆成幾個不相干的模組？比如"訂單 CRUD + 支付對接 + 郵件通知"——三個模組互不依賴，讓三個 Builder 同時寫。

```bash
/ccg:team-research 實現訂單系統
# 產出約束集 + 成功判據
# /clear

/ccg:team-plan order-system
# 拆分為互不干擾的子任務，每個 Builder 只改自己的檔案
# /clear

/ccg:team-exec
# 多個 Builder 並行寫程式碼
# /clear

/ccg:team-review
# Codex 審一遍 + Gemini 審一遍，Critical 必須修
```

**跟普通工作流比有什麼區別？**

普通工作流是連續對話，上下文一直累積。Team 系列每步 `/clear`，透過檔案傳遞狀態。好處是上下文不會爆，壞處是沒法隨時插嘴改方向。

適合的場景：任務可以拆成 3 個以上獨立模組，模組之間沒有強依賴。

## 完整工作流（全自動）

`/ccg:workflow` 自動跑完 6 個階段：研究→構思→計劃→執行→最佳化→評審。

```bash
/ccg:workflow 實現完整的使用者認證，註冊、登入、JWT
```

適合不想操心中間過程的場景。但對於大任務，建議還是用 `plan + execute` 分步走，中間自己看一眼計劃。
