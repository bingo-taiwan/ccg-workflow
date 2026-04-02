# 命令參考

28 個命令，全部 `/ccg:` 開頭。按用途分了幾組。

## 幹活的

最常用的幾個。前端任務自動找 Gemini，後端任務自動找 Codex。

| 命令 | 幹什麼 | 誰來幹 |
|------|--------|--------|
| `/ccg:workflow` | 完整走一遍：研究→構思→計劃→執行→最佳化→評審 | Codex + Gemini |
| `/ccg:plan` | 只做規劃，不動程式碼 | Codex + Gemini |
| `/ccg:execute` | 拿著計劃檔案開幹，Claude 主導 | Codex + Gemini + Claude |
| `/ccg:codex-exec` | 拿著計劃檔案開幹，Codex 主導，Claude 只稽核 | Codex |
| `/ccg:feat` | 智慧判斷該規劃還是直接幹 | 自動選 |
| `/ccg:frontend` | 前端活 | Gemini |
| `/ccg:backend` | 後端活 | Codex |

```bash
# 最簡單的用法
/ccg:frontend 把首頁的卡片元件改成 Grid 佈局
/ccg:backend 給 /api/users 加分頁引數

# 先規劃後執行
/ccg:plan 實現 JWT 認證
# 計劃存在 .claude/plan/ 裡，看完覺得沒問題：
/ccg:execute .claude/plan/jwt-auth.md
```

## 查問題的

不寫程式碼，只分析。雙模型交叉驗證，一個看前端一個看後端。

| 命令 | 幹什麼 |
|------|--------|
| `/ccg:analyze` | 技術分析 |
| `/ccg:debug` | 診斷 Bug + 給修復方案 |
| `/ccg:optimize` | 找效能瓶頸 |
| `/ccg:test` | 生成測試 |
| `/ccg:review` | 程式碼審查，不傳引數就審最近的 git diff |
| `/ccg:enhance` | 把模糊需求變成結構化描述 |

```bash
# 自動審查最近改動
/ccg:review

# 診斷具體問題
/ccg:debug 為什麼 WebSocket 連線會在 30 秒後斷開
```

## OPSX 規範驅動

不想讓 AI 自由發揮？用這組。先把需求變成約束條件，再按約束執行。

| 命令 | 幹什麼 |
|------|--------|
| `/ccg:spec-init` | 初始化 OPSX 環境 |
| `/ccg:spec-research` | 研究需求，輸出約束 |
| `/ccg:spec-plan` | 約束變計劃，所有決策在這步做完 |
| `/ccg:spec-impl` | 按計劃執行 |
| `/ccg:spec-review` | 雙模型審查（任何時候都能用） |

```bash
/ccg:spec-init
/ccg:spec-research 實現 RBAC 許可權系統
# 可以 /clear 釋放上下文
/ccg:spec-plan
/ccg:spec-impl
```

::: tip
狀態存在 `openspec/` 目錄裡，中間隨便 `/clear`，不會丟。
:::

## Agent Teams 並行

任務能拆成 3 個以上獨立模組？用這組。多個 Builder 同時寫程式碼。

| 命令 | 幹什麼 |
|------|--------|
| `/ccg:team-research` | 並行探索程式碼庫，產出約束 |
| `/ccg:team-plan` | 拆分任務，確保模組之間不打架 |
| `/ccg:team-exec` | Builder 們同時開工 |
| `/ccg:team-review` | Codex + Gemini 交叉審查 |

```bash
/ccg:team-research 實現訂單系統的 CRUD + 支付 + 通知三個模組
# /clear
/ccg:team-plan order-system
# /clear
/ccg:team-exec
# /clear
/ccg:team-review
```

::: warning
需要先在 `settings.json` 裡開實驗特性：`"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"`
:::

## Git 工具

| 命令 | 幹什麼 |
|------|--------|
| `/ccg:commit` | 分析 diff 自動生成 conventional commit |
| `/ccg:rollback` | 互動式回滾 |
| `/ccg:clean-branches` | 清理已合併分支（預設 dry-run，放心用） |
| `/ccg:worktree` | Worktree 管理 |

## 專案管理

| 命令 | 幹什麼 |
|------|--------|
| `/ccg:init` | 給專案生成 CLAUDE.md |
| `/ccg:context` | 管理 .context 目錄：記決策、壓縮日誌、看歷史 |

```bash
/ccg:context init
/ccg:context log "選 PostgreSQL 是因為需要 JSONB"
```
