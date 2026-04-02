# 快速開始

## CCG 是什麼

一句話：**Codex 和 Gemini 負責分析，Claude 負責寫程式碼。全程透明。**

```
你的需求
   │
   ↓
Claude Code (編排 + 寫程式碼)
   │
   ├── 後端相關 → 發給 Codex 分析
   ├── 前端相關 → 發給 Gemini 分析
   │
   ↓
Codex/Gemini 返回分析結果（Patch / 方案）
   │
   ↓
Claude 綜合分析結果，寫入程式碼 ← 你能看到每一行改動
```

**關鍵點**：預設模式下最終寫程式碼的是 Claude，不是黑盒——你在 Claude Code 裡能看到完整的改動過程。Codex 和 Gemini 是"參謀"，不直接碰你的檔案。

還有一種 **codex-exec 模式**：讓 Codex 來寫程式碼，寫完後 Claude + Gemini 多模型交叉審查。適合目標明確的任務，token 消耗更低。詳見[工作流指南](/guide/workflows)。

## 需要什麼

- **Node.js 20+** — 低於 20 會報錯，不要問為什麼（`ora@9.x` 的鍋）
- **Claude Code CLI** — 沒有這個什麼都跑不了
- **jq** — 自動授權 Hook 要用
- **Codex CLI** — 可選，裝了才有後端路由
- **Gemini CLI** — 可選，裝了才有前端路由

## 裝上

```bash
npx ccg-workflow
```

第一次跑會讓你選語言，選完就不問了。

### jq 怎麼裝

::: code-group

```bash [macOS]
brew install jq
```

```bash [Debian / Ubuntu]
sudo apt install jq
```

```bash [RHEL / CentOS]
sudo yum install jq
```

```bash [Windows]
choco install jq
# 或者
scoop install jq
```

:::

### Claude Code 怎麼裝

```bash
npx ccg-workflow menu  # 裡面有「安裝 Claude Code」選項
```

npm、homebrew、curl、powershell、cmd 都支援。

## 試一下

裝完後，在 Claude Code 裡輸入：

```
/ccg:frontend 給登入頁加個暗色模式切換按鈕
```

看到 Gemini 被呼叫，說明一切正常。

## 更新和解除安裝

```bash
# 更新
npx ccg-workflow@latest

# 解除安裝
npx ccg-workflow  # 選「解除安裝工作流」
```

## 然後呢

- [命令參考](/guide/commands) — 28 個命令，總有你用得上的
- [工作流指南](/guide/workflows) — 什麼場景用什麼工作流
- [MCP 配置](/guide/mcp) — 讓程式碼搜尋更聰明
