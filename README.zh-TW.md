# CCG - Claude + Codex + Gemini 多模型協作

<div align="center">

<img src="assets/logo/ccg-logo-cropped.png" alt="CCG Workflow" width="400">

[![npm version](https://img.shields.io/npm/v/ccg-workflow.svg)](https://www.npmjs.com/package/ccg-workflow)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Compatible-green.svg)](https://claude.ai/code)
[![Tests](https://img.shields.io/badge/Tests-139%20passed-brightgreen.svg)]()
[![Follow on X](https://img.shields.io/badge/X-@CCG__Workflow-black?logo=x&logoColor=white)](https://x.com/CCG_Workflow)

正體中文 | [简体中文](./README.zh-CN.md) | [English](./README.md)

</div>

Claude Code 編排 Codex + Gemini 的多模型協作開發系統。前端任務路由至 Gemini，後端任務路由至 Codex，Claude 負責編排決策和程式碼稽核。

## 為什麼選擇 CCG？

- **零配置模型路由** — 前端任務自動走 Gemini，後端任務自動走 Codex，無需手動切換。
- **安全設計** — 外部模型無寫入許可權，僅返回 Patch，由 Claude 稽核後應用。
- **29+ 個斜槓命令** — 從規劃到執行、Git 工作流到程式碼審查，透過 `/ccg:*` 一站式訪問。
- **規範驅動開發** — 整合 [OPSX](https://github.com/fission-ai/opsx)，將模糊需求變成可驗證約束，讓 AI 沒法自由發揮。

## 架構

```
Claude Code (編排)
       │
   ┌───┴───┐
   ↓       ↓
Codex   Gemini
(後端)   (前端)
   │       │
   └───┬───┘
       ↓
  Unified Patch
```

外部模型無寫入許可權，僅返回 Patch，由 Claude 稽核後應用。

> **🎬 [檢視 CCG 實戰演示 →](https://x.com/CCG_Workflow/status/2038923720610463876)** — X 上的多模型協作真實案例

## 快速開始

### 前置條件

| 依賴 | 必需 | 說明 |
|------|------|------|
| **Node.js 20+** | 是 | `ora@9.x` 要求 Node >= 20，Node 18 會報 `SyntaxError` |
| **Claude Code CLI** | 是 | [安裝方法](#安裝-claude-code) |
| **jq** | 是 | 用於自動授權 Hook（[安裝方法](#安裝-jq)） |
| **Codex CLI** | 否 | 啟用後端路由 |
| **Gemini CLI** | 否 | 啟用前端路由 |

### 安裝

```bash
npx ccg-workflow
```

首次執行會提示選擇語言（簡體中文 / English），選擇後自動儲存，後續無需再選。

### 安裝 jq

```bash
# macOS
brew install jq

# Linux (Debian/Ubuntu)
sudo apt install jq

# Linux (RHEL/CentOS)
sudo yum install jq

# Windows
choco install jq   # 或: scoop install jq
```

### 安裝 Claude Code

```bash
npx ccg-workflow menu  # 選擇「安裝 Claude Code」
```

支援：npm、homebrew、curl、powershell、cmd。

## 命令

### 開發工作流

| 命令 | 說明 | 模型 |
|------|------|------|
| `/ccg:workflow` | 6 階段完整工作流 | Codex + Gemini |
| `/ccg:plan` | 多模型協作規劃 (Phase 1-2) | Codex + Gemini |
| `/ccg:execute` | 多模型協作執行 (Phase 3-5) | Codex + Gemini + Claude |
| `/ccg:codex-exec` | Codex 全權執行（計劃 → 程式碼 → 稽核） | Codex + 多模型稽核 |
| `/ccg:feat` | 智慧功能開發 | 自動路由 |
| `/ccg:frontend` | 前端任務（快速模式） | Gemini |
| `/ccg:backend` | 後端任務（快速模式） | Codex |

### 分析與質量

| 命令 | 說明 | 模型 |
|------|------|------|
| `/ccg:analyze` | 技術分析 | Codex + Gemini |
| `/ccg:debug` | 問題診斷 + 修復 | Codex + Gemini |
| `/ccg:optimize` | 效能最佳化 | Codex + Gemini |
| `/ccg:test` | 測試生成 | 自動路由 |
| `/ccg:review` | 程式碼審查（自動 git diff） | Codex + Gemini |
| `/ccg:enhance` | Prompt 增強 | 內建 |

### OPSX 規範驅動

| 命令 | 說明 |
|------|------|
| `/ccg:spec-init` | 初始化 OPSX 環境 |
| `/ccg:spec-research` | 需求 → 約束集 |
| `/ccg:spec-plan` | 約束 → 零決策計劃 |
| `/ccg:spec-impl` | 按計劃執行 + 歸檔 |
| `/ccg:spec-review` | 雙模型交叉審查 |

### Agent Teams（v1.7.60+）

| 命令 | 說明 |
|------|------|
| `/ccg:team-research` | 需求 → 約束集（並行探索） |
| `/ccg:team-plan` | 約束 → 並行實施計劃 |
| `/ccg:team-exec` | spawn Builder teammates 並行寫程式碼 |
| `/ccg:team-review` | 雙模型交叉審查 |

> **前置條件**：需在 `settings.json` 中啟用：`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

### Git 工具

| 命令 | 說明 |
|------|------|
| `/ccg:commit` | 智慧提交（conventional commit 格式） |
| `/ccg:rollback` | 互動式回滾 |
| `/ccg:clean-branches` | 清理已合併分支 |
| `/ccg:worktree` | Worktree 管理 |

### 專案管理

| 命令 | 說明 |
|------|------|
| `/ccg:init` | 初始化專案 CLAUDE.md |
| `/ccg:context` | 專案上下文管理（.context 初始化/日誌/壓縮/歷史） |

## 工作流指南

### 規劃與執行分離

```bash
# 1. 生成實施計劃
/ccg:plan 實現使用者認證功能

# 2. 審查計劃（可修改）
# 計劃儲存至 .claude/plan/user-auth.md

# 3a. 執行計劃（Claude 重構）— 精細控制
/ccg:execute .claude/plan/user-auth.md

# 3b. 執行計劃（Codex 全權）— 高效執行，Claude token 極低
/ccg:codex-exec .claude/plan/user-auth.md
```

### OPSX 規範驅動工作流

整合 [OPSX 架構](https://github.com/fission-ai/opsx)，把需求變成約束，讓 AI 沒法自由發揮：

```bash
/ccg:spec-init                       # 初始化 OPSX 環境
/ccg:spec-research 實現使用者認證        # 研究需求 → 輸出約束集
/ccg:spec-plan                       # 並行分析 → 零決策計劃
/ccg:spec-impl                       # 按計劃執行
/ccg:spec-review                     # 獨立審查（隨時可用）
```

> **提示**：`/ccg:spec-*` 命令內部呼叫 `/opsx:*`。每階段之間可 `/clear`，狀態存在 `openspec/` 目錄，不怕上下文爆。

### Agent Teams 並行工作流

利用 Claude Code Agent Teams 實驗特性，spawn 多個 Builder teammates 並行寫程式碼：

```bash
/ccg:team-research 實現實時協作看板 API  # 1. 需求 → 約束集
# /clear
/ccg:team-plan kanban-api               # 2. 規劃 → 並行計劃
# /clear
/ccg:team-exec                          # 3. Builder 並行寫程式碼
# /clear
/ccg:team-review                        # 4. 雙模型交叉審查
```

> **vs 傳統工作流**：Team 系列每步 `/clear` 隔離上下文，透過檔案傳遞狀態。適合可拆分為 3+ 獨立模組的任務。

## 配置

### 目錄結構

```
~/.claude/
├── commands/ccg/       # 29+ 個斜槓命令
├── agents/ccg/         # 子智慧體
├── skills/ccg/         # 質量關卡 + 多 Agent 協同
├── bin/codeagent-wrapper
└── .ccg/
    ├── config.toml     # CCG 配置
    └── prompts/
        ├── codex/      # 6 個 Codex 專家提示詞
        └── gemini/     # 7 個 Gemini 專家提示詞
```

### 環境變數

在 `~/.claude/settings.json` 的 `"env"` 中配置：

| 變數 | 說明 | 預設值 | 何時修改 |
|------|------|--------|----------|
| `CODEAGENT_POST_MESSAGE_DELAY` | Codex 完成後等待時間（秒） | `5` | Codex 程序掛起時設為 `1` |
| `CODEX_TIMEOUT` | wrapper 執行超時（秒） | `7200` | 超長任務時增大 |
| `BASH_DEFAULT_TIMEOUT_MS` | Claude Code Bash 超時（毫秒） | `120000` | 命令超時時增大 |
| `BASH_MAX_TIMEOUT_MS` | Claude Code Bash 最大超時（毫秒） | `600000` | 長時間構建時增大 |

<details>
<summary>settings.json 示例</summary>

```json
{
  "env": {
    "CODEAGENT_POST_MESSAGE_DELAY": "1",
    "CODEX_TIMEOUT": "7200",
    "BASH_DEFAULT_TIMEOUT_MS": "600000",
    "BASH_MAX_TIMEOUT_MS": "3600000"
  }
}
```

</details>

### MCP 配置

```bash
npx ccg-workflow menu  # 選擇「配置 MCP」
```

**程式碼檢索**（多選一）：
- **ace-tool**（推薦）— 程式碼檢索 `search_context` 可用。[官方](https://augmentcode.com/) | [第三方中轉](https://acemcp.heroman.wtf/)
- **fast-context**（推薦）— Windsurf Fast Context，AI 驅動搜尋，無需全量索引。需 Windsurf 賬號
- **ContextWeaver**（備選）— 本地混合搜尋，需要矽基流動 API Key（免費）

**輔助工具**（可選）：
- **Context7** — 獲取最新庫文件（自動安裝）
- **Playwright** — 瀏覽器自動化 / 測試
- **DeepWiki** — 知識庫查詢
- **Exa** — 搜尋引擎（需 API Key）

### 自動授權 Hook

CCG 安裝時自動寫入 Hook，自動授權 `codeagent-wrapper` 命令（需 [jq](#安裝-jq)）。

<details>
<summary>手動配置（v1.7.71 之前的版本）</summary>

在 `~/.claude/settings.json` 中新增：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.command' 2>/dev/null | grep -q 'codeagent-wrapper' && echo '{\"hookSpecificOutput\": {\"hookEventName\": \"PreToolUse\", \"permissionDecision\": \"allow\", \"permissionDecisionReason\": \"codeagent-wrapper auto-approved\"}}' || true",
            "timeout": 1
          }
        ]
      }
    ]
  }
}
```

</details>

## 實用工具

```bash
npx ccg-workflow menu  # 選擇「實用工具」
```

- **ccusage** — Claude Code 用量分析
- **CCometixLine** — 狀態列工具（Git + 用量跟蹤）

## 更新 / 解除安裝

```bash
# 更新
npx ccg-workflow@latest            # npx 使用者
npm install -g ccg-workflow@latest  # npm 全域性使用者

# 解除安裝
npx ccg-workflow  # 選擇「解除安裝工作流」
npm uninstall -g ccg-workflow  # npm 全域性使用者需額外執行
```

## 常見問題

### Codex CLI 0.80.0 程序不退出

`--json` 模式下 Codex 完成輸出後程序不會自動退出。

**解決**：將 `CODEAGENT_POST_MESSAGE_DELAY` 設為 `1`，詳見[環境變數](#環境變數)。

## 參與貢獻

歡迎貢獻！請閱讀 [CONTRIBUTING.md](./CONTRIBUTING.md) 瞭解開發指南。

想找一個入手點？檢視標記為 [`good first issue`](https://github.com/fengshao1227/ccg-workflow/labels/good%20first%20issue) 的 Issue。

## 貢獻者

<!-- readme: contributors -start -->
<table>
<tr>
    <td align="center"><a href="https://github.com/fengshao1227"><img src="https://avatars.githubusercontent.com/fengshao1227?v=4&s=100" width="100;" alt="fengshao1227"/><br /><sub><b>fengshao1227</b></sub></a></td>
    <td align="center"><a href="https://github.com/SXP-Simon"><img src="https://avatars.githubusercontent.com/SXP-Simon?v=4&s=100" width="100;" alt="SXP-Simon"/><br /><sub><b>SXP-Simon</b></sub></a></td>
    <td align="center"><a href="https://github.com/RebornQ"><img src="https://avatars.githubusercontent.com/RebornQ?v=4&s=100" width="100;" alt="RebornQ"/><br /><sub><b>RebornQ</b></sub></a></td>
    <td align="center"><a href="https://github.com/Sakuranda"><img src="https://avatars.githubusercontent.com/Sakuranda?v=4&s=100" width="100;" alt="Sakuranda"/><br /><sub><b>Sakuranda</b></sub></a></td>
    <td align="center"><a href="https://github.com/Mriris"><img src="https://avatars.githubusercontent.com/Mriris?v=4&s=100" width="100;" alt="Mriris"/><br /><sub><b>Mriris</b></sub></a></td>
    <td align="center"><a href="https://github.com/23q3"><img src="https://avatars.githubusercontent.com/23q3?v=4&s=100" width="100;" alt="23q3"/><br /><sub><b>23q3</b></sub></a></td>
    <td align="center"><a href="https://github.com/MrNine-666"><img src="https://avatars.githubusercontent.com/MrNine-666?v=4&s=100" width="100;" alt="MrNine-666"/><br /><sub><b>MrNine-666</b></sub></a></td>
</tr>
<tr>
    <td align="center"><a href="https://github.com/GGzili"><img src="https://avatars.githubusercontent.com/GGzili?v=4&s=100" width="100;" alt="GGzili"/><br /><sub><b>GGzili</b></sub></a></td>
</tr>
</table>
<!-- readme: contributors -end -->

## 致謝

- [cexll/myclaude](https://github.com/cexll/myclaude) — codeagent-wrapper
- [UfoMiao/zcf](https://github.com/UfoMiao/zcf) — Git 工具
- [GudaStudio/skills](https://github.com/GuDaStudio/skills) — 路由設計
- [ace-tool](https://linux.do/t/topic/1344562) — MCP 工具

## 實戰洞見與使用建議

> 以下是實際導入 CCG 後的觀察與建議，供正體中文使用者參考。

### 誰最適合用 CCG？

CCG 的威力在**跨前後端的中大型功能開發**。如果你的任務是：

| 場景 | 建議 |
|------|------|
| 改一行 CSS、修一個 typo | 直接用 Claude Code，不需要 CCG |
| 單純後端 API 或單純前端元件 | `/ccg:backend` 或 `/ccg:frontend` 快速模式即可 |
| 全端功能（如：登入系統、看板 API + UI） | `/ccg:workflow` 或 `/ccg:team-*` 系列最有感 |
| 需要嚴格品質把關的專案 | `/ccg:spec-*` OPSX 規範驅動 |

**經驗法則**：如果你覺得「這個功能我要同時改 3 個以上檔案」，就值得用 CCG。

### 沒有 Codex / Gemini CLI 也能用

CCG 的安全設計意味著 Claude 是唯一有寫入權限的模型。即使你沒裝 Codex 或 Gemini CLI，大部分命令仍可運作（Claude 會自行處理）。先裝起來體驗斜杠命令的工作流紀律，之後再逐步加入其他模型。

### 與既有工作流共存

如果你已經有自己的 Skills 系統（如 Superpowers）、自訂的 slash commands、或 CLAUDE.md 規範，CCG 可以和平共存：

- CCG 命令都有 `/ccg:` 前綴，不會衝突
- CCG 安裝的 skills 在 `~/.claude/skills/ccg/` 子目錄
- 你可以選擇性使用——日常小事用自己的流程，大型功能才出動 CCG

### OPSX 的價值：讓 AI「不能自由發揮」

這是 CCG 最被低估的功能。`/ccg:spec-research` 會先把需求轉成**約束集**（constraint set），AI 必須在約束內實作。這解決了一個常見痛點：

> 「AI 寫的 code 能跑，但不是我要的架構」

用 OPSX 的流程是：需求 → 約束 → 計劃 → 實作。每一步都可以人工審核，確保方向正確。

### Windows 環境注意事項

- 安裝時建議用 `--skip-prompt` 非互動模式（互動選單在某些終端不穩定）
- `codeagent-wrapper` 需要 `jq`，Windows 上用 `choco install jq` 或 `scoop install jq`
- MCP 設定有時需要手動修正，可用 `npx ccg-workflow fix-mcp` 排查

### 省 Token 的技巧

- `/ccg:codex-exec` 讓 Codex 全權執行計劃，Claude 只做最後審核——**大幅降低 Claude token 消耗**
- Agent Teams 系列每步之間 `/clear` 隔離上下文，避免 context window 爆掉
- `/ccg:enhance` 可以把模糊需求轉成結構化描述，減少 AI 來回確認的 token 浪費

### Impeccable UI/UX 命令的隱藏寶藏

除了核心開發命令，CCG 附帶 20+ 個 UI/UX 打磨命令（`/ccg:polish`、`/ccg:audit`、`/ccg:distill` 等），這些命令在做前端專案時非常實用：

```bash
/ccg:audit          # 跑一次無障礙 + 效能 + 主題稽核，產出評分報告
/ccg:polish         # 出貨前最終品質掃描（間距、對齊、一致性）
/ccg:harden         # 強化錯誤處理、i18n、邊界情況
/ccg:distill        # 砍掉不必要的複雜度，讓設計更乾淨
```

即使你不用 CCG 的多模型路由，單獨使用這些 UI/UX 命令也很值得。

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=fengshao1227/ccg-workflow&type=timeline&legend=top-left)](https://www.star-history.com/#fengshao1227/ccg-workflow&type=timeline&legend=top-left)

## 聯絡方式

- **X (Twitter)**: [@CCG_Workflow](https://x.com/CCG_Workflow) — 更新動態、實戰演示、使用技巧
- **郵箱**: [fengshao1227@gmail.com](mailto:fengshao1227@gmail.com) — 贊助、合作洽談、開發交流
- **Issues**: [GitHub Issues](https://github.com/fengshao1227/ccg-workflow/issues) — Bug 反饋與功能建議
- **討論區**: [GitHub Discussions](https://github.com/fengshao1227/ccg-workflow/discussions) — 問題諮詢與社群交流

## License

MIT

---

v2.1.11 | [Issues](https://github.com/fengshao1227/ccg-workflow/issues) | [參與貢獻](./CONTRIBUTING.md)
