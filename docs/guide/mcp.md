# MCP 配置

MCP 工具讓 Claude Code 的程式碼搜尋更聰明。不配也能用，配了體驗好很多。

```bash
npx ccg-workflow menu  # 選「配置 MCP」
```

## 程式碼檢索工具（選一個就行）

### ace-tool

基於 Augment Code 的語義搜尋。搜程式碼的時候不是傻找關鍵字，而是理解你想找什麼。

需要 Augment Code 賬號。沒有的話可以用[第三方中轉](https://acemcp.heroman.wtf/)。

### fast-context

Windsurf 的 Fast Context。不需要給整個倉庫建索引就能搜，速度快。

需要 Windsurf 賬號。

### ContextWeaver

完全本地執行的混合搜尋（Embedding + Rerank）。不用聯網，但需要矽基流動 API Key（免費註冊就有）。

## 輔助工具（可選）

- **Context7** — 查最新的庫文件。初始化時自動裝好，不用管。
- **Playwright** — 瀏覽器自動化和測試。
- **DeepWiki** — 知識庫查詢。
- **Exa** — 搜尋引擎，需要 API Key。

## MCP 同步

配好 MCP 之後，CCG 會自動把配置同步到 Codex 和 Gemini：

- Codex 同步到 `~/.codex/config.toml`
- Gemini 同步到 `~/.gemini/settings.json`

這樣 `/ccg:codex-exec` 的時候 Codex 也能直接用 MCP 搜尋程式碼，不用你單獨配。

## 自動授權

CCG 裝好後會自動配一個 Hook，讓 `codeagent-wrapper` 的命令不用每次都手動確認。需要裝 [jq](https://jqlang.github.io/jq/)。

::: details v1.7.71 之前需要手動配

在 `~/.claude/settings.json` 里加：

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
:::

## 出問題了？

```bash
npx ccg-workflow diagnose-mcp
```

這個命令會檢查你的 MCP 配置哪裡不對。
