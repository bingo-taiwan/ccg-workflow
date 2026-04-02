# 配置說明

## 裝完之後檔案在哪

```
~/.claude/
├── commands/ccg/       # 28 個命令模板
├── agents/ccg/         # 4 個子智慧體
├── skills/ccg/         # 質量檢查 + 多 Agent 協同
├── bin/codeagent-wrapper
└── .ccg/
    ├── config.toml     # CCG 配置檔案
    └── prompts/
        ├── codex/      # 6 個 Codex 角色提示詞
        └── gemini/     # 7 個 Gemini 角色提示詞
```

## 環境變數

在 `~/.claude/settings.json` 的 `"env"` 裡配：

| 變數 | 幹什麼 | 預設值 | 什麼時候改 |
|------|--------|--------|-----------|
| `CODEAGENT_POST_MESSAGE_DELAY` | Codex 跑完後等幾秒 | `5` | 程序卡住不退出就改成 `1` |
| `CODEX_TIMEOUT` | wrapper 總超時 | `7200` | 特別大的任務改大點 |
| `BASH_DEFAULT_TIMEOUT_MS` | Bash 命令超時 | `120000` | 命令跑超時就改大 |
| `BASH_MAX_TIMEOUT_MS` | Bash 最大超時 | `600000` | 構建特別慢就改大 |

::: details 完整 settings.json 示例

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
:::

## 哪些不能改

v1.7.0 之後這些寫死了：

- 前端模型 = Gemini（它 UI/CSS 確實強）
- 後端模型 = Codex（演算法和除錯它擅長）
- 協作模式 = smart
- 命令 = 全部安裝

不提供自定義是因為測下來這個組合效果最好。如果你覺得不對，歡迎開 Issue 討論。

## 實用工具

```bash
npx ccg-workflow menu  # 選「實用工具」
```

- **ccusage** — 看看你的 Claude Code 花了多少錢
- **CCometixLine** — 狀態列上顯示 Git 資訊 + 用量

## 常見問題

**Codex 跑完了但程序不退出**

`CODEAGENT_POST_MESSAGE_DELAY` 設成 `1`。這是 Codex CLI 0.80.0 在 `--json` 模式下的已知問題。

**Node 18 報 SyntaxError**

升級到 Node 20+。`ora@9.x` 用了 Node 20 的語法。

**MCP 工具沒反應**

跑一下 `npx ccg-workflow diagnose-mcp`。

**Agent Teams 命令找不到**

在 settings.json 里加 `"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"`。這還是實驗特性。
