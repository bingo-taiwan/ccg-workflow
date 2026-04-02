# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.1.11] - 2026-03-31

### 🐛 修復

- **更新後 MCP 提示詞顯示未配置**（#124）：`update` 無條件傳 `--skip-mcp` 導致 `mcpProvider` 被覆蓋為 `skip`，已配置 MCP 的使用者更新後提示詞回退為"未配置"。修復：從已有 `config.toml` 恢復 `mcp.provider`，僅在無歷史配置時才 fallback

### ✨ 新功能

- **Impeccable 命令可選安裝**（#125）：init Step 4/4 新增 confirm 提示，20 個前端設計命令（polish/audit/animate 等）預設不安裝，需要的使用者自行勾選。update 時保留已有選擇
- **X (Twitter) 社群入口**：README header 加 `@CCG_Workflow` 徽章 + 架構圖下方 demo 推文連結 + Contact 區 Twitter 入口

---

## [2.1.1] - 2026-03-31

### 🐛 修復

- **Skill Registry 命令缺失 frontmatter**：`generateCommandContent()` 生成的 27 個 command 檔案缺少 YAML frontmatter（`---\ndescription\n---`），導致 Claude Code 命令解析器級聯失敗，所有 `/ccg:*` 命令及專案級命令（如 OPSX）均無法索引

---

## [2.1.0] - 2026-03-31

### ✨ 新功能

- **模型路由可配置**（Issue #121）：使用者可在 init 和 menu 中選擇前端/後端使用的模型（gemini/codex/claude），不再硬編碼
- **Gemini 型號可選**：支援選擇 gemini-3.1-pro-preview、gemini-2.5-flash 或自定義型號
- **選單新增模型路由配置**：`6. 配置模型路由`，切換後自動重灌模板
- **`{{GEMINI_MODEL_FLAG}}` 安裝時替換**：不再留給 Claude 執行時解釋，減少歧義

### 🔄 變更

- **init 步驟 3→4**：新增 Step 2/4 模型路由選擇
- **20+ 模板去硬編碼**：所有命令模板中的 `--backend gemini`/`--backend codex` 替換為 `{{FRONTEND_PRIMARY}}`/`{{BACKEND_PRIMARY}}` 模板變數
- **update 保留模型配置**：`--skip-prompt` 模式從 config.toml 讀取現有路由，不再回退到硬編碼預設值

---

## [2.0.0] - 2026-03-31

### ✨ 新功能

- **Skill Registry 機制**：SKILL.md frontmatter 驅動自動命令生成。新增技能只需寫一個 SKILL.md，安裝時自動生成 slash command
- **域知識秘典全量匯入**：10 大領域 61 個知識檔案（安全 7 + 架構 6 + DevOps 8 + AI 5 + 開發 9 + 前端設計 25 + 基礎設施 + 移動端 + 資料工程 + 編排）
- **Impeccable 工具集**：20 個 UI/UX 精打磨技能（polish/audit/harden/clarify/critique/animate/colorize 等），全部 user-invocable
- **Override-Refusal 工具**：`/hi` 命令，會話級反拒絕覆寫器（refusal_rewriter.js）
- **Scrapling 技能**：網頁抓取與資料提取，支援 Cloudflare/WAF 繞過
- **3 個新輸出風格**：冷刃簡報（abyss-concise）、鐵律軍令（abyss-command）、祭儀長卷（abyss-ritual），輸出風格總數達 8 種
- **域知識自動路由**：`ccg-skill-routing.md` 規則檔案，39 條路由規則，關鍵詞命中自動讀取對應領域秘典

### 🏗 架構

- **`src/utils/skill-registry.ts`**：新模組，負責 SKILL.md frontmatter 解析、技能發現、命令生成
- **installer 整合**：`installSkillGeneratedCommands()` 在 skill 複製後自動掃描並生成 user-invocable 命令，跳過 installer-data.ts 已有命令避免衝突

---

## [1.8.3] - 2026-03-30

### ✨ 新功能

- **`/ccg:team` 統一工作流**：第 28 個斜槓命令，8 階段企業級工作流（需求→架構→規劃→開發→測試→審查→修復→整合），7 角色 Agent Teams 自動編排
- **3 個新 Agent**：`team-architect`（架構師）、`team-qa`（QA 工程師）、`team-reviewer`（程式碼審查員），均為 Agent Teams 真實 teammates
- **Evaluator-Optimizer 反饋環**：Phase 7 最多 2 輪自動修復 Critical 問題，超出交由使用者決斷
- **架構+審查階段多模型交叉**：Phase 2 Codex∥Gemini 並行架構分析，Phase 6 雙模型交叉程式碼審查

---

## [1.8.2] - 2026-03-27

### 🐛 修復

- **Windows ccline 狀態列修復**：`%USERPROFILE%\\.claude\\ccline\\ccline.exe` 改為 `~/.claude/ccline/ccline.exe`，Claude Code 統一支援 `~` 展開

---

## [1.8.1] - 2026-03-27

### 🐛 修復

- **WORKDIR 路徑推斷修復**：20 個命令模板的 `{{WORKDIR}}` 規則從"替換為絕對路徑"改為"必須透過 `pwd`/`cd` 獲取，禁止從 `$HOME` 推斷"，修復沙箱/雲端環境下工作目錄錯誤問題
- **spec-init 目錄防禦**：Step 3 新增禁止 `cd` 到其他路徑的提示，防止 Claude 自行推斷錯誤目錄
- **Windows 相容**：WORKDIR 獲取指令支援 `pwd`（Unix）和 `cd`（Windows CMD）雙寫

---

## [1.8.0] - 2026-03-26

### 🐛 修復

- **Gemini session_id 解析修復**：Gemini CLI 的 `init` 事件前粘有 MCP 警告文字導致 JSON 解析失敗，現在自動提取行中 JSON 部分，正確捕獲 `session_id`
- **Gemini 會話複用恢復**：所有模板恢復使用 `resume <SESSION_ID>`（支援並行多會話場景），不再 fallback 到 `resume latest`

### ✨ 新功能

- **spec-impl 跨階段會話複用**：Step 4 原型 → Step 7 審查複用會話（`CODEX_PROTO_SESSION` / `GEMINI_PROTO_SESSION`），審查帶有原型上下文，審查階段帶有原型上下文

---

## [1.7.98] - 2026-03-26

### 🐛 修復

- **Gemini `resume latest` 模板修正**：Gemini CLI stream-json 不輸出 SESSION_ID，所有模板改為 Gemini 用 `resume latest`、Codex 用 `resume <SESSION_ID>`

---

## [1.7.97] - 2026-03-26

### 🐛 修復

- **Gemini `-p -` 顯示修正**：`Command:` 行現在顯示真實的任務文字而非 `-p -`，與實際執行一致，消除誤導
- **Session-ID 早期輸出**：wrapper 在 backend 返回 `session_started` 事件時立即輸出 `Session-ID: xxx` 到 stderr，不再等到任務完成才輸出。即使任務超時/失敗，Claude 也能拿到真正的 session ID 來 resume，不再誤用 PID

### 🔄 變更

- **Binary 版本升級**：codeagent-wrapper `5.8.0` → `5.9.0`

---

## [1.7.92] - 2026-03-25

### ✨ 新功能

- **初始化互動重構**：3 步流程替代原來的 8 輪 yes/no 確認
  - Step 1: API 提供方（list 選擇：官方 / 第三方 / 贊助商預留位）
  - Step 2: MCP 工具（checkbox 多選，可同時裝多個，按需填 Key）
  - Step 3: 效能模式（list 選擇：標準 / 輕量）
- **贊助商預留位**：init 和 menu 的 API 提供方選擇中預留贊助商合作位
- **MCP 多選共存**：ace-tool + fast-context 可同時安裝，ace 為主檢索，fast-context 輔助語義搜尋

### 🐛 修復

- **第三方 API 配置修復**：`ANTHROPIC_API_KEY` → `ANTHROPIC_AUTH_TOKEN`，修復第三方代理配置後仍顯示 `/login` 的問題
- **Gemini CLI stdin 相容性修復**：Gemini backend 直接透過 `-p "任務文字"` 傳遞 prompt，修復 `--include-directories` 引數鏈斷裂

---

## [1.7.91] - 2026-03-25

### 🐛 修復

- **Gemini CLI stdin 相容性修復**：Gemini CLI 不支援 `-p -` 作為 stdin 標記，wrapper 現在對 Gemini backend 直接透過 `-p "任務文字"` 傳遞 prompt，跳過 stdin pipe。修復 v1.7.74 引入的 `--include-directories` 與 `-p -` 引數鏈斷裂導致 Gemini 無法呼叫的問題

---

## [1.7.90] - 2026-03-23

### ✨ 新功能

- **`--progress` 進度輸出**：codeagent-wrapper 新增 `--progress` 引數，後臺執行時向 stderr 輸出 `[PROGRESS]` 精簡進度行（session_started / reasoning / message / cmd_done / mcp_call / turn_completed），告別黑箱等待（PR #112 by @puyialeng233-spec）
- **CJK 安全截斷**：progress 文字使用 `[]rune` 切片，中文內容不會斷在多位元組字元中間

### 🐛 修復

- **全模板 `--progress` 覆蓋**：所有 20+ 個命令模板的 codeagent-wrapper 呼叫均新增 `--progress`，包括補漏的 `debug.md`、`spec-review.md`、`codex-exec.md` review 呼叫

---

## [1.7.89] - 2026-03-20

### 🐛 修復

- **許可權規則匹配修復**：`Bash(codeagent-wrapper*)` → `Bash(*codeagent-wrapper*)`，修復完整路徑無法匹配的問題
- **spec-init `<<<` 攔截修復**：here-string `<<<` 改為管道 `echo ... |`，避免 Claude Code 安全攔截

### 🔄 變更

- **全平臺統一 permissions.allow**：macOS/Linux 不再使用 PreToolUse Hook + jq，全平臺統一用 `permissions.allow` 萬用字元匹配，升級時自動清理舊 Hook 和舊規則

---

## [1.7.88] - 2026-03-19

### 🐛 修復

- **TS 型別錯誤修復**：`installer-mcp.ts` 的 `serverConfig` 引數從 `Record<string, any>` 收緊為 `McpServerConfig`，修復 `tsc --noEmit` 報錯 TS2345

### 🔄 變更

- **發版流程加固**：`pnpm typecheck` + `pnpm test` 列為必檢項，位於 `pnpm build` 之前，防止型別錯誤漏網

---

## [1.7.87] - 2026-03-19

### 🐛 修復

- **Gemini 呼叫失敗不重試**：所有 20 個命令模板新增 Gemini 失敗重試規則（最多 2 次，間隔 5s），3 次全敗才降級為單模型
- **Codex 結果被跳過**：所有 20 個命令模板新增 Codex 必須等待規則，禁止在 Codex 未返回時跳過或繼續下一階段
- **team-exec 退化為普通 Agent**：明確指定必須使用 TeamCreate + TaskCreate + Agent(team_name=...) 建立 Agent Teams，禁止退化為普通 Agent 子代理

---

## [1.7.86] - 2026-03-18

### 🐛 修復

- **Skills 路徑錯誤**：`SKILL.md` 模板中 `run_skill.js` 路徑修正為 `~/.claude/skills/ccg/run_skill.js`，與 v1.7.75 名稱空間遷移對齊，修復質量關卡呼叫失敗問題

---

## [1.7.85] - 2026-03-17

### ✨ 新功能

- **Binary 雙源下載**：GitHub Release（8s 超時）→ Cloudflare R2 映象（60s 超時）自動切換，國內使用者下載體驗大幅改善

### 🐛 修復

- **更新時跳過 binary 重複下載**：`uninstallWorkflows()` 新增 `preserveBinary` 選項，更新流程保留已有 binary；`installBinaryFile()` 檢測 binary 存在且可用時跳過下載
- **更新失敗時顯示 binary 下載提示**：更新完成後校驗 binary 狀態，失敗時顯示與初始化一致的紅框警告 + 手動修復指引

### 🔄 變更

- **提取 `showBinaryDownloadWarning()` / `verifyBinary()` 共享函式**：init.ts 和 update.ts 的 35 行重複程式碼合併為 `installer.ts` 中的 2 個匯出函式
- **移除 update.ts 中的 binary backup/restore 邏輯**：因 binary 不再被刪除，backup 機制不再需要（-20 行）

---

## [1.7.83] - 2026-03-12

### 🔄 變更

- **安裝器重構**：1878 行單檔案拆分為 5 個聚焦模組（installer / installer-mcp / installer-data / installer-template / installer-prompt），淨刪 469 行（-25%），所有匯出透過 barrel re-export 保持完全相容
  - `cmd()` 構建器：新增命令 = 1 行函式呼叫（原 12 行物件字面量）
  - `MCP_PROVIDERS` 登錄檔：新增 MCP provider = 1 行配置（原 if/else 鏈）
  - `getBinaryName()` 查表：新增平臺支援 = 1 行對映（原 14 行 if/else）
  - `copyMdTemplates()` 共享管線：agents/prompts/rules 安裝共用
  - `configureMcpInClaude()` 共享管線：5 個 MCP 安裝函式共用
  - `mirrorCcgServers()` 統一映象：Codex/Gemini MCP 同步共用
  - 刪除死程式碼 `ALL_COMMANDS` 陣列 + `normalizePath()` + `convertToGitBashPath()`
- **零功能變更**：135 測試全過，8 個消費者檔案零修改，dist 產物 API 完全一致

---

## [1.7.82] - 2026-03-12

### ✨ 新功能

- **fast-context MCP 整合**：新增 Windsurf Fast Context 作為第四個程式碼檢索 MCP 選項，與 ace-tool / ace-tool-rs / ContextWeaver 並列
  - 初始化時 fast-context 為預設推薦選項
  - 支援 API Key 可選（本地裝 Windsurf 自動提取）+ FC_INCLUDE_SNIPPETS 模式選擇
  - 安裝/解除安裝/選單配置完整支援
- **三端搜尋提示詞注入**：選擇 fast-context 時自動寫入搜尋指南到 Claude Code (`~/.claude/rules/`)、Codex (`~/.codex/AGENTS.md`)、Gemini (`~/.gemini/GEMINI.md`)，解除安裝時自動清理
- **Gemini MCP 同步**：新增 `syncMcpToGemini()` 將 CCG 管理的 MCP 伺服器映象到 `~/.gemini/settings.json`，與 Codex 同步機制對齊

---

## [1.7.81] - 2026-03-11

### 🔄 變更

- **`/ccg:commit` Context 自動歸檔**：不再依賴手動 session.log，改為從 git diff 自動分析生成 ContextEntry（decisions/bugs/changes），session.log 有內容時額外合併。`.context/` 不存在時提示 init 但不阻斷
- **`/ccg:context log` 降為可選**：核心用法簡化為 `init` 一次 → 正常開發 → `/ccg:commit` 全自動歸檔

---

## [1.7.80] - 2026-03-11

### ✨ 新功能

- **`/ccg:context` 命令**：第 27 個斜槓命令，專案上下文管理（`.context/` 目錄初始化、決策日誌記錄、壓縮歸檔、歷史檢視）
- **`.context` 上下文工程體系**：為 LLM 全面自動化提供決策審計鏈 — 記錄 WHY（為什麼改）、WHAT（考慮了什麼替代方案）、BUG（遇到了什麼坑）
- **ContextEntry Schema v1.0.0**：JSONL canonical store + Markdown 人類檢視，UUIDv7 主鍵（rebase-safe），`.gitattributes merge=union` 減少衝突
- **`/ccg:commit` Context Compress Phase**：提交時自動壓縮 session.log → 脫敏 → 追加 history/commits.jsonl → 新增 `Context-Id` commit trailer
- **13 個角色提示詞 `.context Awareness` 注入**：Codex 6 個 + Gemini 7 個角色提示詞增加 `.context/prefs/` 讀取指令，外部模型自動遵守專案規範
- **Quality Gate Rules 全域性規則**：安裝時自動寫入 `~/.claude/rules/ccg-skills.md`，定義 5 個質量關卡的自動觸發條件（新建模組/程式碼變更>30行/安全變更/重構）

### 🔧 修復

- **E2E 測試超時**：`installWorkflows` 測試從 5s 提升到 15s，適應命令數量增長

---

## [1.7.79] - 2026-03-11

### 🐛 修復

- **Binary 下載容錯**：`downloadBinaryFromRelease()` 新增 3 次重試 + 60s/次 AbortController 超時，適應中國使用者 GitHub Release CDN 慢/不可達的場景
- **Binary 下載失敗醒目告警**：下載失敗時在終端顯示紅框警告 + 手動下載地址 + 放置路徑 + chmod 指引，不再靜默吞掉錯誤
- **Binary 失敗不阻塞安裝**：binary 下載失敗降級為 warning，commands + skills 仍正常安裝，不再將整個安裝標記為失敗
- **Update binary 備份/恢復**：更新流程先備份舊 binary，新安裝失敗後自動恢復，避免"刪了舊的、新的又沒下成"
- **Update subprocess 超時**：`npx init` 子程序超時從 120s 提升到 300s（5 分鐘），避免 binary 下載慢時程序被殺導致 commands/skills 丟失

---

## [1.7.78] - 2026-03-11

### 🐛 修復

- **Windows Hook exit 255 修復**：Windows 使用者 codeagent-wrapper 自動授權從 Hook（依賴 jq/grep/true）改為 `permissions.allow`，徹底消除 `failed with non-blocking status code 255` 報錯
- **升級自動遷移**：Windows 使用者更新時自動清理舊 Hook，無需手動操作

---

## [1.7.77] - 2026-03-10

### 🏗 架構

- **二進位制產物遷移至 GitHub Release**：`bin/codeagent-wrapper-*` 不再打包到 npm 和 git，改從 GitHub Release (`preset` tag) 按需下載，npm 包從 16.3MB 縮減至 161KB
- **GitHub Actions CI**：新增 `.github/workflows/build-binaries.yml`，`codeagent-wrapper/` 變更時自動交叉編譯 6 平臺並上傳到 `preset` Release
- **installer.ts 下載邏輯**：僅從 GitHub Release 下載，移除本地 `bin/` fallback（開發者可用 `build-all.sh` 自行編譯）
- **移除本地二進位制**：`bin/codeagent-wrapper-*` 6 個檔案已從倉庫刪除，僅保留 `bin/ccg.mjs` 入口

---

## [1.7.76] - 2026-03-10

### 📝 文件

- **README 重構**：命令分組展示（7 類）、新增「Why CCG?」價值主張、架構圖上移、Prerequisites 合併、環境變數增加「何時修改」列、FAQ/Hook 配置去重摺疊
- **新增 CONTRIBUTING.md**：開發環境搭建、PR 流程、Commit 規範、程式碼標準、Good First Issue 指南
- **新增 Issue 模板**：`.github/ISSUE_TEMPLATE/` 下 3 套模板（bug report / feature request / good first issue）

---

## [1.7.75] - 2026-03-10

### 🐛 修復

- **Skills 名稱空間隔離**：安裝路徑從 `~/.claude/skills/` 改為 `~/.claude/skills/ccg/`，解除安裝時不再誤刪使用者自建 skill（如 `brainstorming`、`changelog-generator` 等）
- **舊版遷移**：升級時自動將 v1.7.73-74 散落在 `skills/` 根目錄的 CCG 檔案遷移到 `skills/ccg/`，使用者 skill 原地不動

---

## [1.7.74] - 2026-03-09

### 🔄 變更

- **spec 模板 guardrail 加固**：`spec-research`/`spec-plan`/`spec-impl` 三個模板新增 USER GUIDANCE RULE，防止 LLM 向使用者暴露內部 `/opsx:*` 命令，統一引導至 `/ccg:spec-*`；`spec-plan`/`spec-impl` 額外新增 TASKS FORMAT RULE 防止 checkbox 格式問題

### 🐛 修復

- **Gemini CLI `.env` 隔離**：修復 Gemini CLI 從專案目錄載入 `.env` 導致全域性 API Key 被覆蓋的問題。codeagent-wrapper 現將 Gemini 的 `cmd.Dir` 設為 `$HOME`，專案目錄透過 `--include-directories` 傳入
- **Gemini 模型引數支援**：`buildGeminiArgs` 支援 `--gemini-model` / `-m` 引數傳遞自定義模型
- **Codex 測試修正**：修復預存的環境變數名錯誤（`CODEX_BYPASS_SANDBOX` → `CODEX_REQUIRE_APPROVAL`）

---

## [1.7.73] - 2026-03-09

### ✨ 新功能

- **`/ccg:codex-exec` 命令**：新增第 26 個斜槓命令，與 `/ccg:plan` 配對使用——Codex 全權執行（MCP 搜尋 + 程式碼實現 + 測試），Claude 僅做決策/稽核，極大降低 Claude token 消耗
- **Skills 體系**：首次引入 Claude Code 原生 Skills 機制，安裝 6 個 skill 到 `~/.claude/skills/`（verify-security / verify-quality / verify-change / verify-module / gen-docs / multi-agent）
- **context7 MCP 自動安裝**：初始化時自動安裝 context7（免費庫文件查詢），無需 API Key
- **Codex MCP 同步**：新增 `syncMcpToCodex()`，將 CCG 管理的 MCP 伺服器映象同步到 `~/.codex/config.toml`，支援原子寫 + stale 清理

### 🐛 修復

- **`--skip-mcp` 語義修復**：context7 安裝和 Codex sync 現在正確遵守 `skipMcp` 標誌
- **Skills 安裝/解除安裝路徑一致性**：解除安裝時遞迴刪除整個 `skills/` 目錄，不再遺漏新 skill
- **Skills 模板變數替換**：`fs.copy()` 後遍歷 `.md` 檔案執行路徑替換，支援自定義 installDir
- **MCP sync 全欄位透傳**：不再只複製 command/args/env，透傳所有配置欄位
- **installedSkills 計數修正**：排除根 SKILL.md，數字準確反映實際 skill 數量
- **失敗反饋補全**：context7 和 Codex sync 失敗時顯示 `⚠` 提示，不再靜默

---

## [1.7.72] - 2026-03-09

### 🔄 變更

- **全域性提示詞遷移至 rules/**：grok-search 搜尋提示詞從追加到 `~/.claude/CLAUDE.md` 改為寫入 `~/.claude/rules/ccg-grok-search.md`，避免 CLAUDE.md 超 200 行導致執行力下降
- **舊版自動清理**：升級時自動清除 CLAUDE.md 中殘留的 `CCG-GROK-SEARCH-PROMPT` 注入內容

---

## [1.7.71] - 2026-03-09

### ✨ 新功能

- **grok-search 聯網搜尋 MCP**：初始化和 MCP 選單新增 grok-search 安裝選項，支援 Tavily + Firecrawl + Grok 多信源聯網搜尋（比 Claude Code 內建聯網更好用）
- **全域性搜尋提示詞自動追加**：安裝 grok-search 時自動追加搜尋/證據/推理規範到 `~/.claude/CLAUDE.md`，不替換現有內容

### 🔄 變更

- **ace-tool 中轉連結更新**：init 和 config-mcp 中的中轉推薦統一更新為 https://acemcp.heroman.wtf/
- **MCP 推薦順序**：init 中 ace-tool 預設選中為首選

---

## [1.7.70] - 2026-03-09

### ✨ 新功能

- **選單 UI 大改版**：ASCII Art "CCG" Logo + ╔═══╗ 雙線邊框 + 編號/字母快捷鍵 + CJK 寬度感知對齊
- **`visWidth()` CJK 寬度計算**：正確處理中日韓字元的終端顯示寬度，修復中英混排對齊問題

### 🔄 變更

- **MCP 推薦調整**：ace-tool 恢復為預設推薦（`search_context` 可用，`enhance_prompt` 已不可用），中轉推薦更新為 https://acemcp.heroman.wtf/
- **ContextWeaver 降為備選**：仍可使用，需矽基流動 API Key

### 🗑️ 移除

- **清理倉庫垃圾檔案**：移除 `1.md`、`FINAL_VERIFICATION.md`、`OPENSPEC_COMMANDS_REFERENCE.md`、`OPSX_INTEGRATION_FIX.md`、`config.json`、`verify-*.sh`、`test-local-install.sh`、`.magi/`、`.claude/index.json`
- **更新 `.gitignore`**：新增 `.magi/`、`verify-*.sh`、`*_FIX.md`、`*_REFERENCE.md` 防止再次提交

---

## [1.7.69] - 2026-03-09

### ✨ 新功能

- **國際化 (i18n)**：首次安裝時提示選擇語言（簡體中文 / English），所有 CLI 互動文字透過 i18n 系統輸出
- **codeagent-wrapper Hook 自動授權**：安裝時自動寫入 `settings.json` Hook 配置，解決部分使用者 `permissions.allow` 不生效的問題。需要系統安裝 `jq`，安裝時自動檢測並提示
- **英文 README**：README.md 改為英文版，原中文版移至 README.zh-CN.md，雙語互鏈

### 🔄 變更

- `init.ts` / `menu.ts` / `update.ts` / `cli-setup.ts` 全面 i18n 化，消除 100+ 處硬編碼中文字串
- `i18n/index.ts` 擴充套件至 800+ 行，涵蓋 CLI、init、menu、update 所有名稱空間的 zh-CN / en 完整翻譯

---

## [1.7.68] - 2026-03-09

### 🐛 修復

- **update 命令全域性安裝死迴圈**：npm 全域性安裝使用者在本地工作流版本過舊時，`update` 錯誤推薦 `npm install -g`（包版本已最新），導致死迴圈。修復 `performUpdate` 的 `isNewVersion` 引數，僅在 npm registry 有新版本時才推薦 npm 更新

### ✅ 測試

- **測試覆蓋率 38 → 130**（+242%），新增 4 個測試檔案：
  - `version.test.ts`（14）：`compareVersions` 全場景覆蓋，含 update bug 迴歸用例
  - `config.test.ts`（14）：`createDefaultConfig` + `createDefaultRouting` 純函式測試
  - `platform.test.ts`（10）：平臺檢測、`getMcpCommand`、路徑分隔符
  - `installer.test.ts`（54）：登錄檔一致性、路由/liteMode 注入、模板變數完整性、contextweaver E2E、解除安裝 E2E、二進位制安裝、prompts 安裝

---

## [1.7.67] - 2026-03-07

### 🐛 修復

- **spec 工作流完全對齊 OPSX**：修復狀態持久化問題，確保使用者切換上下文後可以正確恢復
  - `spec-research`：Step 7 新增結構化總結 + 明確呼叫 `/opsx:continue` 生成 proposal
  - `spec-plan`：Step 5 新增結構化總結 + 明確呼叫 `/opsx:continue` 生成 specs/design/tasks
  - `spec-impl`：Step 2 呼叫 `/opsx:apply` 進入實施模式，Step 10 呼叫 `/opsx:archive` 歸檔
  - `spec-init`：移除 ace-tool MCP 檢查（非必需）

### 🔄 變更

- **多模型協作成果採納**：在呼叫 OPSX 前輸出結構化總結，確保 Codex/Gemini 的分析結果被正確傳遞給 OPSX

---

## [1.7.66] - 2026-03-06

### 🐛 修復

- **spec-research 並行呼叫缺失**：補全 Step 4 多模型並行探索模板，新增 `run_in_background: true` 指令和完整的 Bash 並行呼叫示例（Codex + Gemini），與 `spec-plan` / `spec-impl` 保持一致

---

## [1.7.65] - 2026-03-01

### 🐛 修復

- **MCP skip 模式修復**：當使用者選擇跳過 MCP 配置時，正確處理模板中的 `{{MCP_SEARCH_TOOL}}` 引用，替換為 Glob + Grep fallback 提示（PR #68 by @ymdvsymd）
- **team-plan.md 修復**：將硬編碼的 `mcp__ace-tool__search_context` 改為模板變數

### ✨ 新功能

- **測試框架**：新增 vitest 測試配置 + 39 個單元/整合測試

---

## [1.7.64] - 2026-03-01

### 🔄 變更

- **保持 CCG 封裝純粹性**：移除 `spec-*` 模板中的 `/opsx:xxx` 引用，使用者只需使用 `/ccg:spec-*` 命令
- **適配 OpenSpec 1.2**：`spec-init` 支援 Profile 系統 + 自動檢測，`spec-review` 修復過時引用

---

## [1.7.63] - 2026-03-01

### 🔄 變更

- **適配 OpenSpec 1.2**：更新 `spec-*` 系列命令相容新版 OPSX
  - `spec-init`：支援 Profile 系統（`core`/`custom`）+ AI 工具自動檢測
  - `spec-review`：更新引用（移除過時的 `AGENTS.md`，改用 `config.yaml`）
  - **保持封裝**：使用者只需使用 `/ccg:spec-*` 命令，無需瞭解底層 OPSX 命令

---

## [1.7.62] - 2026-02-27

### 🔄 變更

- Gemini 模型升級：`gemini-3-pro-preview` → `gemini-3.1-pro-preview`（PR #65 by @23q3）

---

## [1.7.61] - 2026-02-10

### 🐛 修復

- 修復 `package.json` files 白名單缺失 team 系列模板，導致 npm 包不含 `team-research/team-plan/team-exec/team-review.md`

---

## [1.7.60] - 2026-02-10

### ✨ 新功能

**Agent Teams 並行實施系列（4 個新命令）**

新增獨立的 Team 系列命令，利用 Claude Code Agent Teams 實驗特性實現多 agent 並行開發：

- `/ccg:team-research` — 需求 → 約束集（並行探索程式碼庫，Codex + Gemini 雙模型分析）
- `/ccg:team-plan` — 約束 → 零決策計劃（消除歧義，拆分為檔案範圍隔離的獨立子任務）
- `/ccg:team-exec` — 讀取計劃 → spawn Builder teammates 並行寫程式碼（需啟用 Agent Teams）
- `/ccg:team-review` — 雙模型交叉審查（Codex 後端審查 + Gemini 前端審查，分級處理）

**設計特點**：
- 完全獨立體系，不依賴現有 `/ccg:workflow` 等命令
- 每步之間 `/clear` 隔離上下文，透過檔案傳遞狀態，不怕上下文爆
- Builder teammates 使用 Sonnet 模型，成本可控
- 智慧觸發：子任務 ≥ 3 個且檔案範圍無衝突時才啟用並行

**前置條件**：
- Claude Code ≥ 2.1.32
- 需手動啟用：`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

---

## [1.7.59] - 2026-02-09

### ✨ 新功能

- 內建 Prompt 增強（`/ccg:enhance`），移除 ace-tool `enhance_prompt` 依賴

---

## [1.7.57] - 2026-02-08

### ✨ 新功能

**1. MCP 工具擴充套件**
- 新增 ContextWeaver MCP（推薦）- 本地混合搜尋，替代收費的 ace-tool
- 新增輔助工具 MCP（多選）：Context7、Playwright、DeepWiki、Exa
- ace-tool/ace-tool-rs 標註為收費，ContextWeaver 設為預設推薦

**2. API 配置**
- 初始化和選單新增「配置 API」選項
- 支援自定義 ANTHROPIC_BASE_URL 和 ANTHROPIC_API_KEY
- 自動新增最佳化配置（禁用遙測、MCP 超時等）
- 自動新增 codeagent-wrapper 許可權白名單

**3. 實用工具**
- 新增 ccusage - Claude Code 用量分析
- 新增 CCometixLine - 狀態列工具（Git + 用量跟蹤）

**4. Claude Code 安裝**
- 新增「安裝 Claude Code」選單選項
- 支援多種安裝方式：npm、homebrew、curl、powershell、cmd
- 支援檢測已安裝版本並重灌

### 🔧 改進
- MCP 配置選單重構為兩類：程式碼檢索 MCP + 輔助工具 MCP
- 解除安裝 CCG 時不再詢問 MCP 解除安裝（獨立操作）

---

## [1.7.56] - 2026-02-01

### 🐛 重要修復：OpenSpec CLI 整合

**修復 CCG 與 OpenSpec CLI 的整合問題**

#### 問題描述
- CCG spec 命令模板中錯誤地嘗試透過 `Skill(opsx:list)` 呼叫 OPSX 命令
- 使用了不存在的命令選項（如 `--json` 用於 `new change`）
- 混淆了 CLI 命令 `openspec` 和斜槓命令 `/opsx:`

#### 修復內容

**1. 修正命令呼叫方式**
- ❌ 之前：`Skill(opsx:list)` 或 `Run /opsx:list`
- ✅ 現在：`openspec list --json`（透過 Bash 呼叫）

**2. 修正命令語法**
- ❌ 之前：`openspec new "<name>" --json`
- ✅ 現在：`openspec new change "<name>"`（移除不支援的 `--json`）

**3. 統一命令名稱**
- 明確說明 CLI 命令是 `openspec`，不是 `opsx`
- `/opsx:xxx` 是 Claude 斜槓命令，內部呼叫 `openspec` CLI

#### 修改的檔案
- ✅ `templates/commands/spec-init.md` - 新增 CLI 命令說明和初始化檢查
- ✅ `templates/commands/spec-research.md` - 修復 `new change` 語法，新增變更存在性檢查
- ✅ `templates/commands/spec-plan.md` - 替換所有 `/opsx:` 引用為 CLI 呼叫
- ✅ `templates/commands/spec-impl.md` - 替換所有 `/opsx:` 引用為 CLI 呼叫
- ✅ `templates/commands/spec-review.md` - 替換所有 `/opsx:` 引用為 CLI 呼叫

#### 已驗證的命令
- ✅ `openspec --version`
- ✅ `openspec list --json`
- ✅ `openspec status --change "<id>" --json`
- ✅ `openspec new change "<name>"`
- ✅ `npx @fission-ai/openspec --version`
- ✅ `npx @fission-ai/openspec init --tools claude`

#### 新增文件
- `OPSX_INTEGRATION_FIX.md` - 詳細修復說明
- `OPENSPEC_COMMANDS_REFERENCE.md` - OpenSpec CLI 命令參考
- `FINAL_VERIFICATION.md` - 最終驗證報告

**影響範圍**：所有使用 `/ccg:spec-*` 命令的使用者

---

## [1.7.54] - 2026-01-26

### 🐛 緊急修復

**修正 OpenSpec 安裝包名稱錯誤**

- ✅ 修復 `spec-init.md` 中的錯誤安裝包名稱
- ✅ 正確的包名：`@fission-ai/openspec@latest`（而非錯誤的 `@opsx/cli`）
- ✅ 說明：OPSX 是 OpenSpec v0.23.0+ 的實驗性工作流功能，不是獨立包
- ✅ `/opsx:` 命令透過安裝 `@fission-ai/openspec` 獲得

**修改檔案**：
- `templates/commands/spec-init.md` - 修正安裝命令和說明文字
- `CHANGELOG.md` - 新增修復說明

**技術說明**：
- OPSX = OpenSpec eXperimental workflow
- 包名保持：`@fission-ai/openspec`
- 命令格式：`/opsx:*` (實驗性工作流) 和傳統 OpenSpec 命令

---

## [1.7.53] - 2026-01-26

### 🔧 修復

**完善 OPSX 命令遷移**

- ✅ 完整更新所有 5 個 `spec-*.md` 模板檔案中的 OpenSpec CLI 命令為 OPSX 命令
- ✅ 更新命令對映：
  - `openspec list` → `/opsx:list`
  - `openspec show <id>` → `/opsx:show <id>`
  - `openspec status --change <id>` → `/opsx:status <id>`
  - `openspec new change` → `/opsx:new`
  - `openspec validate <id>` → `/opsx:validate <id>`
  - `openspec diff <id>` → `/opsx:diff <id>`
  - `openspec workflow schemas` → `/opsx:schemas`
- ⚠️ **已知問題**：錯誤地將安裝包寫為 `@opsx/cli`（應為 `@fission-ai/openspec`）- 已在 v1.7.54 修復

**修改檔案**：
- `templates/commands/spec-impl.md` - 完整替換所有 openspec 命令為 /opsx 命令
- `templates/commands/spec-init.md` - 更新安裝包和初始化命令
- `templates/commands/spec-plan.md` - 更新狀態檢查和衝突檢測命令
- `templates/commands/spec-research.md` - 更新變更建立和查詢命令
- `templates/commands/spec-review.md` - 更新審查和差異對比命令

---

## [1.7.52] - 2026-01-26

### 🚀 架構升級

**遷移到 OPSX 架構**

- 廢棄 `/ccg:spec-*` 命令（基於舊的 OpenSpec 整合）
- 啟用 `/opsx:*` 命令（新的 OPSX 架構）
- 更新所有 spec 相關命令模板以支援新架構

**修改檔案**：
- `templates/commands/spec-init.md` - 更新為 OPSX 初始化流程
- `templates/commands/spec-research.md` - 更新為 OPSX 研究流程
- `templates/commands/spec-plan.md` - 更新為 OPSX 規劃流程
- `templates/commands/spec-impl.md` - 更新為 OPSX 實施流程
- `CLAUDE.md` - 更新變更記錄和架構說明
- `package.json` - 版本號升級到 1.7.52

### 🔧 改進

**更新工作流最佳化**

- 改進 `src/commands/update.ts` 更新邏輯
- 最佳化版本檢測和更新流程

### 🗑️ 清理

**移除過時內容**

- 清理舊的 OpenSpec 指導塊
- 移除 `skills-v2` 和根目錄的過時 OpenSpec 文件引用

---

## [1.7.51] - 2026-01-25

### 🐛 修復

**修復預設語言為英文的問題**

- 將 `cli-setup.ts` 中所有命令註冊時的描述文字從硬編碼英文改為中文
- 修復 `menu.ts` 中退出提示從 "Goodbye!" 改為 "再見！"
- 確保 npm 包安裝後預設顯示為中文介面

**修改檔案**：
- `src/cli-setup.ts`: 所有 `.command()` 呼叫的描述文字改為中文
- `src/commands/menu.ts`: 退出訊息中文化

---

## [1.7.48] - 2026-01-23

### ✨ 新功能

**整合 OpenSpec 規範驅動開發**

新增 5 個 `/ccg:spec-*` 命令，把需求變成約束，讓 AI 沒法自由發揮：

| 命令 | 說明 |
|------|------|
| `/ccg:spec-init` | 初始化 OpenSpec 環境 + 驗證多模型 MCP 工具 |
| `/ccg:spec-research` | 需求 → 約束集（並行探索 + OpenSpec 提案） |
| `/ccg:spec-plan` | 多模型分析 → 消除歧義 → 零決策可執行計劃 |
| `/ccg:spec-impl` | 按規範執行 + 多模型協作 + 歸檔 |
| `/ccg:spec-review` | 雙模型交叉審查（獨立工具，隨時可用） |

**核心理念**：
- 約束集 vs 資訊堆砌：輸出明確約束（如 "JWT TTL=15min"），而不是一堆背景知識
- 零決策計劃：Plan 階段消除所有歧義，Impl 階段純機械執行
- 分階段執行：每階段之間可 `/clear`，狀態存在 `openspec/` 目錄，不怕上下文爆

### 🔧 改進

- 選單支援迴圈返回：執行完操作後按 Enter 返回主選單，不再直接退出
- 多模型並行呼叫指令加強：明確要求"一條訊息兩個 Bash 呼叫"，避免序列執行

---

## [1.7.47] - 2026-01-21

### 🐛 Bug 修復

**修復 `gemini/architect.md` 檔案缺失導致會話複用失敗 (exit code 42)**

- **問題**: Windows 使用者使用會話複用時報錯：
  ```
  Failed to read ROLE_FILE 'C:/Users/XXX/.claude/.ccg/prompts/gemini/architect.md':
  The system cannot find the file specified.
  ```
- **根本原因**: `templates/prompts/gemini/` 目錄下缺失 `architect.md` 檔案，但命令模板 (`plan.md`, `execute.md` 等) 引用了該檔案
- **修復**: 新增 `templates/prompts/gemini/architect.md` 檔案，定義前端架構師角色
- **影響**:
  - ✅ `/ccg:plan` 和 `/ccg:execute` 可正常使用 Gemini 後端
  - ✅ 會話複用 (`resume`) 功能恢復正常
  - ✅ 更新 `package.json` 將新檔案加入釋出列表

### 📝 環境變數配置說明

**VSCode 外掛使用者注意**: 如果 Gemini 出現退出碼 41（授權失敗），需在 `~/.claude/settings.json` 配置 API 金鑰：

```json
{
  "env": {
    "GEMINI_API_KEY": "your-api-key",
    "GOOGLE_API_KEY": "your-api-key"
  }
}
```

VSCode 外掛啟動的子程序不會繼承終端環境變數，必須透過 `settings.json` 顯式配置。

---

## [1.7.44] - 2026-01-18

### 🐛 Bug 修復

**修復 ace-tool-rs 安裝時顯示"跳過"的問題**

- **問題**: 選擇 ace-tool-rs 並輸入 Token 後，安裝摘要仍顯示"MCP工具跳過"
- **根本原因**:
  - Line 179: 顯示摘要的條件判斷遺漏 `ace-tool-rs`，只檢查 `mcpProvider === 'ace-tool'`
  - Line 389: MCP 資源提示的條件判斷也有同樣問題
- **修復**:
  - 統一為 `(mcpProvider === 'ace-tool' || mcpProvider === 'ace-tool-rs')`
  - 顯示時動態使用 `mcpProvider` 變數，正確顯示 `ace-tool` 或 `ace-tool-rs`
- **影響**:
  - ✅ ace-tool-rs 使用者可以看到正確的安裝狀態
  - ✅ Token 配置成功時顯示綠色"ace-tool-rs"
  - ✅ 跳過 Token 配置時顯示黃色"ace-tool-rs (待配置)"
  - ✅ 真正跳過時才顯示灰色"跳過"

**感謝 @使用者 發現並報告此問題！**

---

## [1.7.41] - 2026-01-18

### 🐛 Bug 修復

**修復 Windows Git Bash 環境下 PATH 繼承問題 (codeagent-wrapper v5.7.1)**

- **問題**: codeagent-wrapper 僅對 `claude` 後端設定環境變數，導致 `codex`/`gemini` 在 Windows Git Bash 後臺程序中找不到命令
- **修復**: 統一所有後端的環境變數處理邏輯
  - 所有後端均呼叫 `cmd.SetEnv()` 顯式合併父程序環境變數
  - 確保 PATH 等關鍵環境變數正確繼承
  - 修復檔案: `codeagent-wrapper/executor.go:972-978`
- **影響**:
  - ✅ Windows 使用者不再需要手動配置 `settings.json` 注入 PATH
  - ✅ 所有平臺的環境變數繼承行為統一
  - ✅ 減少 "command not found" 錯誤

**詳細診斷**: 參見 `PATH_ISSUE_DIAGNOSIS.md`

---

## [1.7.39] - 2026-01-16

### ✨ 新功能

**新增 `/ccg:plan` 和 `/ccg:execute` 命令 - 分離規劃與執行**

將原有的 workflow 拆分為兩個獨立命令，實現規劃與執行的解耦：

#### `/ccg:plan` - 多模型協作規劃
- **Phase 1**: 上下文全量檢索
  - 強制呼叫 `mcp__ace-tool__enhance_prompt` 增強提示詞
  - 呼叫 `mcp__ace-tool__search_context` 檢索專案上下文
- **Phase 2**: 多模型協作分析
  - Codex + Gemini 並行分析，交叉驗證
  - 可選：雙模型產出"計劃草案"降低遺漏風險
  - 生成 Step-by-step 實施計劃
- **計劃交付**：儲存至 `.claude/plan/<功能名>.md`，提示使用者審查或執行
- **不問 Y/N**：只展示計劃，讓使用者決定下一步

#### `/ccg:execute` - 多模型協作執行
- **Phase 0**: 讀取計劃檔案，提取 SESSION_ID
- **Phase 1**: 上下文快速檢索（使用 MCP 工具，禁止手動 find/ls）
- **Phase 3**: 原型獲取（Codex/Gemini 根據任務型別路由）
- **Phase 4**: 編碼實施（Claude 重構"髒原型"為生產級程式碼）
- **Phase 5**: 審計與交付（雙模型 Code Review）

#### 關鍵設計
- **程式碼主權**：Codex/Gemini 只輸出 Unified Diff Patch，Claude 負責實際修改
- **SESSION_ID 交接**：plan 生成的 SESSION_ID 可傳遞給 execute 複用上下文
- **信任規則**：後端邏輯以 Codex 為準，前端設計以 Gemini 為準

### 🐛 Bug 修復

**修復 `/ccg:init` 不呼叫子智慧體的問題**

- 原模板只是描述性地說"呼叫子智慧體"，沒有給出具體呼叫語法
- 現在新增了明確的 Task 工具呼叫格式
- 先呼叫 `get-current-datetime` 獲取時間戳
- 再呼叫 `init-architect` 執行完整掃描

### 📝 文件更新

- 命令總數從 14 個增加到 16 個
- 更新 CLAUDE.md 文件反映新命令
- 更新模板檔案清單

---

## [1.7.38] - 2026-01-16

### 🐛 Bug 修復

**修復更新工作流邏輯問題**

#### 問題背景

使用者反饋：當透過 npm 全域性安裝且當前版本已是最新版本時，系統仍然提示使用者執行 `npm install -g ccg-workflow@latest`，導致使用者困惑。

**場景重現**：
```
當前版本: v1.7.37
最新版本: v1.7.37
本地工作流: v1.7.25

檢測到本地工作流版本(v1.7.25)低於當前版本(v1.7.37)，是否更新? Yes
⚠️  檢測到你是透過 npm 全域性安裝的
推薦的更新方式:
npm install -g ccg-workflow@latest  ← 使用者困惑：明明已經是最新版本了
```

#### 修復方案

在 `src/commands/update.ts:196-237` 中新增判斷邏輯：

**修復前**：
```typescript
if (isGlobalInstall) {
  // 總是提示使用者執行 npm install -g
}
```

**修復後**：
```typescript
// 如果全域性安裝且僅工作流需要更新（包已是最新）
if (isGlobalInstall && !isNewVersion) {
  console.log('✓ 當前包版本已是最新')
  console.log('⚙️  僅需更新工作流檔案')
  // 繼續更新工作流，不提示更新包
}
// 如果全域性安裝且包有新版本
else if (isGlobalInstall && isNewVersion) {
  console.log('⚠️  檢測到你是透過 npm 全域性安裝的')
  console.log('推薦的更新方式: npm install -g ccg-workflow@latest')
  // 提示使用者更新包
}
```

#### 修復後的使用者體驗

**場景 1：包已是最新，僅工作流需要更新**
```
當前版本: v1.7.38
最新版本: v1.7.38
本地工作流: v1.7.25

檢測到本地工作流版本(v1.7.25)低於當前版本(v1.7.38)，是否更新? Yes
ℹ️  檢測到你是透過 npm 全域性安裝的
✓ 當前包版本已是最新 (v1.7.38)
⚙️  僅需更新工作流檔案
```

**場景 2：包有新版本**
```
當前版本: v1.7.37
最新版本: v1.7.38

確認要更新到 v1.7.38 嗎? Yes
⚠️  檢測到你是透過 npm 全域性安裝的
推薦的更新方式:
npm install -g ccg-workflow@latest
```

### 📦 版本更新

- **ccg-workflow**: 1.7.37 → 1.7.38

---

## [1.7.37] - 2026-01-16

### ✨ 新功能

**新增 ace-tool-rs MCP 支援**

#### 背景

社群使用者反饋希望支援 [ace-tool-rs](https://github.com/missdeer/ace-tool-rs)，這是 ace-tool 的 Rust 實現版本，具有以下優勢：
- 更輕量（二進位制檔案更小）
- 更快速（Rust 效能優勢）
- 更低的資源佔用

#### 實現內容

**1. 新增 `installAceToolRs` 函式**

在 `src/utils/installer.ts` 中新增 ace-tool-rs 安裝函式：
```typescript
export async function installAceToolRs(config: AceToolConfig): Promise<...> {
  // 使用 npx ace-tool-rs 命令
  // 新增 RUST_LOG=info 環境變數
}
```

**2. 更新 i18n 文字**

新增中英文翻譯：
- `init:aceToolRs.title` - "ace-tool-rs MCP 配置"
- `init:aceToolRs.description` - "Rust 實現的 ace-tool，更輕量、更快速"
- `init:aceToolRs.installing` - "正在配置 ace-tool-rs MCP..."
- `init:aceToolRs.failed` - "ace-tool-rs 配置失敗（可稍後手動配置）"

**3. 修改 init 命令**

在初始化時提供 3 個選項：
- `ace-tool` (Node.js 實現)
- `ace-tool-rs` **(推薦)** (Rust 實現)
- 跳過

預設選項改為 `ace-tool-rs`。

**4. 修改 config-mcp 命令**

在 MCP 配置命令中新增選項：
- 安裝/更新 ace-tool MCP (Node.js 實現)
- 安裝/更新 ace-tool-rs MCP **(推薦)** (Rust 實現)
- 解除安裝 MCP 配置

#### 使用方式

**初始化時選擇**：
```bash
npx ccg-workflow

# 選擇 MCP 工具
? 選擇 MCP 工具
  ace-tool (Node.js 實現) - 一鍵安裝，含 Prompt 增強 + 程式碼檢索
❯ ace-tool-rs (推薦) (Rust 實現) - 更輕量、更快速
  跳過 - 稍後手動配置（可選 auggie 等其他 MCP）
```

**後續配置**：
```bash
npx ccg-workflow config mcp

# 選擇操作
? 選擇操作
  ➜ 安裝/更新 ace-tool MCP (Node.js 實現)
❯ ➜ 安裝/更新 ace-tool-rs MCP (推薦) (Rust 實現)
  ✕ 解除安裝 MCP 配置
  返回
```

#### MCP 配置格式

**ace-tool-rs 配置**：
```json
{
  "mcpServers": {
    "ace-tool": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "ace-tool-rs",
        "--base-url", "https://api.example.com",
        "--token", "your-token-here"
      ],
      "env": {
        "RUST_LOG": "info"
      }
    }
  }
}
```

#### 重要說明

**MCP 工具名稱統一**：
- ace-tool 和 ace-tool-rs 都註冊為 **同一個 MCP 伺服器名稱** `"ace-tool"`
- 提供 **相同的工具介面**：
  - `mcp__ace-tool__search_context` - 程式碼檢索
  - `mcp__ace-tool__enhance_prompt` - Prompt 增強
- **無需修改提示詞模板**：兩個實現可以無縫切換
- AI 會自動呼叫 `mcp__ace-tool__*` 工具，無論底層使用哪個實現

**選擇建議**：
- **ace-tool-rs (推薦)**：Rust 實現，更輕量、更快速、資源佔用更低
- **ace-tool**：Node.js 實現，相容性更好，適合特殊環境

### 📦 版本更新

- **ccg-workflow**: 1.7.36 → 1.7.37

---

## [1.7.36] - 2026-01-16

### 🐛 Bug 修復

**修復 Codex 預設需要手動同意檔案操作的問題**

#### 問題背景

- Codex 後端預設需要使用者手動同意讀取檔案和執行操作
- Gemini 後端使用 `-y` 引數自動同意所有操作
- 兩個後端行為不一致，影響使用者體驗

#### 修復方案

**1. 修改 `executor.go:772-783`**

```go
// 原邏輯：只有設定 CODEX_BYPASS_SANDBOX=true 時才自動同意
if envFlagEnabled("CODEX_BYPASS_SANDBOX") {
    args = append(args, "--dangerously-bypass-approvals-and-sandbox")
}

// 新邏輯：預設自動同意（與 Gemini 一致）
if !envFlagEnabled("CODEX_REQUIRE_APPROVAL") {
    args = append(args, "--dangerously-bypass-approvals-and-sandbox")
}
```

**2. 新增環境變數控制**

- `CODEX_REQUIRE_APPROVAL=true` - 需要手動同意（可選退出）
- 預設行為：自動同意所有操作

**3. 更新幫助資訊**

新增 `CODEX_REQUIRE_APPROVAL` 和 `CODEX_DISABLE_SKIP_GIT_CHECK` 環境變數說明。

### ✨ 新功能

**Web UI 增強**

1. **自動滾動修復**
   - 修復顯示任務內容後不滾動到底部的問題
   - 每次新內容到達時自動滾動
   - 尊重使用者手動滾動（向上滾動後停止自動滾動）

2. **任務完成後自動關閉頁面**
   - 顯示 "✓ 完成 (3秒後自動關閉)"
   - 3 秒後自動呼叫 `window.close()`
   - 如果無法關閉（使用者手動開啟的視窗），顯示 "✓ 完成 (可以關閉此頁面)"

### 📦 版本更新

- **ccg-workflow**: 1.7.35 → 1.7.36
- **codeagent-wrapper**: 5.6.0 → 5.7.0

---

## [1.7.22] - 2026-01-13

### 🐛 Bug 修復

**真正修復 Windows Codex 程序掛起問題**

#### 問題背景

v1.7.21 的修復不完整，Windows 上 Codex 完成後 codeagent-wrapper 程序仍然掛起：
- 日誌顯示 "terminating lingering backend" 後就卡住了
- `taskkill /T /F` 成功執行，但 `cmd.Wait()` 仍然阻塞

#### 根本原因

`cmd.Wait()` 阻塞直到 **所有 stdout 控制代碼關閉**，而不僅僅是主程序退出。在 Windows 上：
1. Codex CLI 啟動子程序（Node.js workers）
2. 子程序繼承了 stdout 控制代碼
3. `taskkill /T /F` 殺死程序樹
4. 但 Go 的 stdout pipe 仍然開啟
5. `cmd.Wait()` 等待 pipe 關閉 → 永遠阻塞

#### 修復方案

在 `messageTimerCh` case 中，**先關閉 stdout**，再終止程序：

```go
case <-messageTimerCh:
    // ...
    if !terminated {
        // FIX: Close stdout FIRST to unblock cmd.Wait()
        closeWithReason(stdout, "messageTimer")  // ← 新增
        if timer := terminateCommandFn(cmd); timer != nil {
            // ...
        }
    }
```

#### 執行流程（修復後）

1. `completeSeen` → 啟動 5 秒計時器
2. `messageTimerCh` 觸發 → **先關閉 stdout**
3. parser goroutine 收到 EOF → 返回
4. `cmd.Wait()` 不再阻塞 → 返回
5. `waitCh` 收到訊號 → `waitLoop` 正常退出
6. wrapper 正常輸出結果並退出（exit code 0）

#### 影響範圍

- ✅ **修復前**：Windows + Codex 完成後掛起
- ✅ **修復後**：所有平臺正常退出
- ✅ **向後相容**：Unix 平臺行為不變（Unix 程序退出時自動關閉控制代碼）

---

## [1.7.21] - 2026-01-13

### 🐛 Bug 修復

**徹底修復 Windows 系統 Codex 程序無法自動終止問題**

#### 問題背景

v1.7.18 的修復不完整，Windows 上 Codex 完成後程序仍然卡住：
- Web UI 顯示完成，但 codeagent-wrapper 程序一直不退出
- 只有手動殺死程序才能繼續
- Mac 沒問題，Windows 的 Gemini 也沒問題

#### 根本原因分析

1. **程序樹問題**：`proc.Kill()` 只終止主程序，Codex 啟動的子程序（Node.js workers）仍然執行，持有 stdout handle
2. **阻塞等待問題**：`messageTimerCh` case 裡直接 `waitErr = <-waitCh` 阻塞等待，如果程序沒被殺死就永遠卡住

#### 核心修復

1. **使用 `taskkill /T` 終止整個程序樹**：
   - 新增 `killProcessTree()` 函式，使用 `taskkill /T /F /PID` 遞迴殺死所有子程序
   - `terminateCommand()`、`terminateProcess()`、`forwardSignals()` 在 Windows 上呼叫程序樹終止

2. **移除阻塞等待**：
   - `messageTimerCh` case 裡不再直接阻塞等待 `waitCh`
   - 讓迴圈繼續，下一輪透過 `case waitErr = <-waitCh` 正常退出
   - 即使 `taskkill` 失敗，也不會永遠卡住

#### 技術細節

修改檔案：`codeagent-wrapper/executor.go`

```go
// 新增：Windows 程序樹終止
func killProcessTree(pid int) error {
    if !isWindows() {
        return nil
    }
    cmd := exec.Command("taskkill", "/T", "/F", "/PID", fmt.Sprintf("%d", pid))
    return cmd.Run()
}

// 修改：terminateCommand 使用程序樹終止
if isWindows() {
    if err := killProcessTree(proc.Pid()); err != nil {
        _ = proc.Kill() // fallback
    }
}

// 修改：messageTimerCh case 不再阻塞
case <-messageTimerCh:
    // ...terminate logic...
    // Do NOT block here - let loop continue
```

#### 影響範圍

- ✅ **修復前**：Windows 使用者 Codex 完成後程序卡住
- ✅ **修復後**：所有平臺程序正確終止
- ✅ **向後相容**：Unix 平臺行為不變

#### codeagent-wrapper 版本

- 升級至 v5.6.0
- 重新編譯所有平臺二進位制檔案

---

## [1.7.20] - 2026-01-13

### 🐛 Bug 修復

**修復並行呼叫指令不清晰導致 Claude 不使用 run_in_background**

v1.7.19 的表格格式精簡過度，導致 Claude 無法理解需要發起並行 Bash 呼叫。

**修復方案**：將表格格式改為明確的呼叫指令格式：
```
1. **Codex 後端診斷**：`Bash({ command: "...--backend codex...", run_in_background: true })`
2. **Gemini 前端診斷**：`Bash({ command: "...--backend gemini...", run_in_background: true })`
```

**修改檔案**：
- `templates/commands/debug.md`
- `templates/commands/optimize.md`
- `templates/commands/review.md`
- `templates/commands/analyze.md`
- `templates/commands/test.md`

---

## [1.7.19] - 2026-01-13

### 📝 文件最佳化

**精簡命令模板，去除冗餘程式碼塊**

所有呼叫外部模型的命令模板已統一格式：
- 頂部保留完整的「多模型呼叫規範」程式碼示例（只出現一次）
- 各階段改為 `⚠️ 必須呼叫 xxx（參照上方呼叫規範）` + 參數列格
- 避免重複教學，減少模板體積

**修改檔案**：
- `templates/commands/backend.md` - 階段 2、3、5 精簡
- `templates/commands/frontend.md` - 階段 2、3、5 精簡
- `templates/commands/debug.md` - 階段 2 精簡
- `templates/commands/optimize.md` - 階段 2 精簡
- `templates/commands/review.md` - 階段 2 精簡
- `templates/commands/test.md` - 階段 2 精簡
- `templates/commands/analyze.md` - 階段 2 新增 ⚠️ 強調標記

---

## [1.7.18] - 2026-01-13

### 🐛 Bug 修復

**修復 Windows 系統 Codex 程序無法自動終止問題**

#### 問題背景

使用者在 Windows 系統上使用 Codex 時遇到問題：
- Codex 任務實際已完成（Web 介面顯示完成，輸出了 `agent_message` 和 `turn.completed`）
- 但 codeagent-wrapper 程序一直不退出
- 導致 Claude Code Task 工具無法獲取日誌，一直等待
- 只有手動關閉程序才能繼續

**根本原因**：
- `terminateCommand` 函式使用 `syscall.SIGTERM` 訊號終止程序
- **Windows 不支援 SIGTERM 訊號**，該呼叫靜默失敗（不報錯但不執行任何操作）
- 雖然有 `forceKillDelay` 後的 `Kill()` 備用邏輯，但程式碼在 `waitCh` 上阻塞等待程序退出
- 導致 Kill() 的定時器無法正確觸發或程序無法正常退出

#### 核心修復

1. **Windows 平臺直接使用 Kill()**：
   - `terminateCommand()` 函式：Windows 上直接呼叫 `proc.Kill()` 而非 `SIGTERM`
   - `terminateProcess()` 函式：同樣的修復
   - `forwardSignals()` 函式：同樣的修復

2. **保持 Unix 相容性**：
   - Unix/Linux/macOS 仍使用 `SIGTERM` 實現優雅退出
   - 保留 `forceKillDelay` 後的強制 Kill 邏輯

#### 技術細節

修改檔案：`codeagent-wrapper/executor.go`

```go
// 修復前
_ = proc.Signal(syscall.SIGTERM)

// 修復後
if isWindows() {
    _ = proc.Kill()  // Windows: 直接終止
} else {
    _ = proc.Signal(syscall.SIGTERM)  // Unix: 優雅退出
}
```

#### 影響範圍

- ✅ **修復前**：Windows 使用者 Codex 完成後程序卡住，需要手動終止
- ✅ **修復後**：所有平臺程序正確終止，Task 工具可以正常獲取結果
- ✅ **向後相容**：Unix 平臺行為不變

#### 相關檔案

- `codeagent-wrapper/executor.go` - 修改 3 個函式的訊號處理邏輯
- `codeagent-wrapper/main.go` - 版本號升級至 v5.5.0
- 重新編譯所有平臺二進位制檔案

---

## [1.7.17] - 2026-01-12

### 🐛 Bug 修復

**修復 Windows 系統 Codex 完成檢測問題**

#### 問題背景

使用者在 Windows 系統上使用 Codex 時遇到問題：
- Codex 任務實際已完成（Web 介面顯示完成，輸出了 `agent_message`）
- 但 Claude Code 一直顯示 "Codex 響應較慢" 或繼續等待
- 導致使用者體驗不佳，需要手動中斷

**根本原因**：
- `codeagent-wrapper` 的 `postMessageTerminateDelay` 設定為 1 秒
- Codex CLI 在輸出 `agent_message` 後，傳送完成事件（`turn.completed`/`thread.completed`）可能有延遲
- 在 Windows 系統上，這個延遲經常超過 1 秒
- 導致 wrapper 在收到完成事件前就嘗試終止程序，上層認為任務未完成

#### 核心修復

1. **增加預設延遲時間**：從 1 秒增加到 5 秒
   - 給 Codex CLI 足夠時間傳送完成事件
   - 解決 Windows 系統上的延遲問題

2. **新增環境變數支援**：`CODEAGENT_POST_MESSAGE_DELAY`
   - 使用者可以根據網路環境自定義延遲時間（單位：秒）
   - 預設值：5 秒
   - 最大值：60 秒（防止過長等待）
   - 示例：`export CODEAGENT_POST_MESSAGE_DELAY=10`

3. **程式碼改進**：
   - 將硬編碼常量 `postMessageTerminateDelay` 改為函式 `resolvePostMessageDelay()`
   - 新增環境變數解析和驗證邏輯
   - 新增詳細的註釋說明延遲的作用

#### 影響範圍

- ✅ **修復前**：Windows 使用者經常遇到 Codex 任務"假性未完成"
- ✅ **修復後**：所有平臺均能正確檢測 Codex 完成狀態
- ✅ **向後相容**：預設 5 秒延遲對所有平臺都適用，不影響現有使用者

#### 技術細節

修改檔案：`codeagent-wrapper/executor.go`
- 新增 `resolvePostMessageDelay()` 函式（第 22-45 行）
- 修改 `runCodexTaskWithContext()` 中的定時器建立（第 1136 行）
- 新增 `strconv` 匯入以支援環境變數解析

---

## [1.7.16] - 2026-01-10

### 🐛 Bug 修復

**修復 Windows 二進位制檔案缺失問題**

#### 問題背景

使用者在 Windows 系統上透過 `npx ccg-workflow` 更新時遇到錯誤：
```
Binary not found in package: codeagent-wrapper-windows-amd64.exe
```

**根本原因**：
- `.gitignore` 忽略了所有 `.exe` 檔案（包括 `bin/` 目錄下的預編譯二進位制檔案）
- Windows 二進位制檔案未被 Git 跟蹤，導致釋出的 npm 包中缺失這些檔案
- macOS/Linux 二進位制檔案正常（無 `.exe` 副檔名，未被忽略）

#### 核心修復

1. **修改 `.gitignore`**：新增例外規則 `!bin/*.exe`
   - 忽略構建過程中的 `.exe` 檔案
   - 但允許 `bin/` 目錄下的預編譯二進位制檔案被跟蹤

2. **提交 Windows 二進位制檔案到 Git**：
   - `bin/codeagent-wrapper-windows-amd64.exe` ✅
   - `bin/codeagent-wrapper-windows-arm64.exe` ✅

3. **釋出新版本到 npm**：確保 Windows 使用者能正常安裝和更新

#### 影響範圍

- ✅ **修復前**：Windows 使用者無法安裝或更新（二進位制檔案缺失）
- ✅ **修復後**：所有平臺（macOS、Linux、Windows）均可正常使用

---

## [1.7.15] - 2026-01-10

### 🐛 Bug 修復

**修復 Windows 系統下的路徑相容性和輸出截斷問題**

#### 問題背景

Windows 使用者在使用 CCG 工作流時遇到兩個關鍵問題：

1. **路徑問題**：後臺命令執行失敗（exit code 127）
   - 原因：Windows 路徑中的反斜槓 `\` 在 Git Bash heredoc 中被轉義
   - 錯誤：`C:\Users\Lin\.claude\bin\codeagent-wrapper` → `C:UsersLin.claudebincodeagent-wrapper`

2. **輸出截斷問題**：codeagent-wrapper 不返回完整結果
   - 原因 1：日誌行長度限制（1000 字元）截斷長 JSON 事件
   - 原因 2：Windows Git Bash 後臺程序 stdout 緩衝未重新整理
   - 影響：只能獲取推理過程，獲取不到完整的 agent_message

#### 核心修復

**1. 路徑相容性修復（所有平臺受益）**
- ✅ 統一使用正斜槓路徑（`C:/Users/...`）
  - Windows Git Bash、PowerShell、CMD 均支援正斜槓
  - heredoc 中不會被轉義
- ✅ Windows 下自動新增 `.exe` 副檔名
  - `~/.claude/bin/codeagent-wrapper` → `C:/Users/.../bin/codeagent-wrapper.exe`
- 📝 修改檔案：`src/utils/installer.ts`

**2. 輸出截斷修復**
- ✅ 移除日誌行長度限制（所有平臺）
  - `codexLogLineLimit: 1000 → 0`（無限制）
  - 防止長 JSON 事件（如 agent_message）被截斷
- ✅ 強制重新整理 stdout（僅 Windows）
  - 新增 `os.Stdout.Sync()` 確保後臺程序輸出完整捕獲
- 📝 修改檔案：`codeagent-wrapper/main.go`（升級至 v5.4.1）
- 🔨 重新編譯所有平臺二進位制檔案

#### 技術細節

**installer.ts 路徑處理邏輯**：
```typescript
// 1. 正斜槓路徑（所有平臺）
const normalizePath = (path: string) => path.replace(/\\/g, '/')

// 2. Windows 特殊處理 .exe 副檔名
const wrapperName = isWindows() ? 'codeagent-wrapper.exe' : 'codeagent-wrapper'
const wrapperPath = `${normalizePath(binDir)}/${wrapperName}`
```

**codeagent-wrapper 修復**：
```go
// 1. 無限制日誌（所有平臺）
const codexLogLineLimit = 0 // was 1000

// 2. 強制重新整理（僅 Windows）
if isWindows() {
    _ = os.Stdout.Sync()
}
```

#### 使用者體驗改進

**修復前（Windows）**：
```
❌ 路徑：C:UsersLin.claudebincodeagent-wrapper (錯誤)
❌ 輸出：只獲取到約 600 字元（12,917 字元被截斷）
❌ 狀態：後臺命令 exit code 127
```

**修復後（Windows）**：
```
✅ 路徑：C:/Users/Lin/.claude/bin/codeagent-wrapper.exe
✅ 輸出：完整的 agent_message（無截斷）
✅ 狀態：命令正常執行
```

---

## [1.7.13] - 2026-01-09

### 🐛 Bug 修復

**修復更新版本判斷問題**

#### 問題背景

使用者透過 `npx ccg-workflow` 執行時，npm 包已是最新版本，但本地工作流可能是舊版本（例如 v1.7.10 安裝的）。

原因：`checkForUpdates()` 只比較 npm registry 版本，沒有比較本地配置版本 (`config.general.version`)。

導致：
1. **每次都要手動選擇"重新安裝"** - `hasUpdate` 總是 false，預設選項是"否"
2. **使用者困惑** - 明明需要更新，但系統提示"已是最新版本"

#### 核心修復

1. **新增本地版本檢測**
   - ✅ 讀取 `~/.claude/.ccg/config.toml` 中的 `general.version`
   - ✅ 比較本地版本與當前 npm 包版本
   - ✅ 如果本地版本低於當前包版本，`needsWorkflowUpdate = true`
   - 📝 修改檔案：`src/commands/update.ts`

2. **最佳化更新提示**
   - ✅ 顯示"本地工作流版本"，讓使用者清楚知道當前狀態
   - ✅ 三種提示場景：
     - npm 有新版本：`確認要更新到 vX.Y.Z 嗎？`
     - npm 是最新但本地過期：`檢測到本地工作流版本 (vA.B.C) 低於當前版本 (vX.Y.Z)，是否更新？`
     - 完全最新：`當前已是最新版本。要重新安裝嗎？`
   - ✅ 當需要更新時，預設選項改為"是"

#### 使用者體驗改進

**更新流程（本地版本過期）**：
```
🔄 檢查更新...

當前版本: v1.7.13
最新版本: v1.7.13
本地工作流: v1.7.10

? 檢測到本地工作流版本 (v1.7.10) 低於當前版本 (v1.7.13)，是否更新？(Y/n)
```

### 💡 使用者價值

- **自動檢測過期**：不再需要使用者判斷是否需要更新
- **預設選項正確**：需要更新時預設"是"，無需額外操作
- **透明度提升**：顯示本地版本，使用者清楚知道為什麼需要更新

---

## [1.7.12] - 2026-01-09

### 🐛 Bug 修復

**修復 Windows 路徑相容性問題**

#### 問題背景

Windows 使用者使用 PowerShell 執行命令時，路徑格式不相容：
- 模板中的路徑被轉換為 Git Bash 格式：`/c/Users/zlb/.claude/.ccg/...`
- PowerShell 無法識別此格式，報錯"路徑不存在"

#### 核心修復

1. **重寫路徑替換函式**
   - ✅ Windows 上使用原生路徑格式：`C:\Users\zlb\.claude\.ccg\...`
   - ✅ 修復混合分隔符問題（`C:\Users\zlb/.claude/bin` → `C:\Users\zlb\.claude\bin`）
   - 📝 修改檔案：`src/utils/installer.ts`

### 💡 使用者價值

- **Windows 使用者**：PowerShell 現在可以正常讀取檔案路徑

---

## [1.7.11] - 2026-01-09

### 🐛 Bug 修復

**修復 npm 全域性安裝使用者的更新和解除安裝問題**

#### 問題背景

使用者透過 `npm install -g ccg-workflow` 全域性安裝後，存在雙重路徑問題：
- npm 全域性包路徑（提供 `ccg` 命令入口）
- 使用者工作目錄 `~/.claude/`（儲存命令模板、配置等）

導致：
1. **解除安裝顯示成功但命令仍可用** - 只刪除了 `~/.claude/` 檔案，npm 全域性包未移除
2. **更新顯示成功但版本號不變** - 只更新了工作目錄檔案，`ccg` 命令仍指向舊版本

#### 核心修復

1. **新增全域性安裝檢測**
   - ✅ 新增 `checkIfGlobalInstall()` 函式檢測 npm 全域性安裝
   - ✅ 透過 `npm list -g ccg-workflow --depth=0` 判斷
   - 📝 修改檔案：`src/commands/update.ts`, `src/commands/menu.ts`

2. **修復更新功能**
   - ✅ 檢測到全域性安裝時，引導使用者使用 `npm install -g ccg-workflow@latest`
   - ✅ 提供互動式選擇：推薦 npm 更新 / 繼續內建更新（僅更新工作流檔案）
   - ✅ 明確告知內建更新不會更新 `ccg` 命令本身
   - 📝 修改檔案：`src/commands/update.ts`

3. **修復解除安裝功能**
   - ✅ 解除安裝前提示"完整解除安裝需要兩步"
   - ✅ 解除安裝後顯示第二步提示：`npm uninstall -g ccg-workflow`
   - ✅ 說明完成後 `ccg` 命令將徹底移除
   - 📝 修改檔案：`src/commands/menu.ts`

#### 使用者體驗改進

**更新流程（全域性安裝使用者）**：
```
⚠️  檢測到你是透過 npm 全域性安裝的

推薦的更新方式：
  npm install -g ccg-workflow@latest

這將同時更新命令和工作流檔案

? 改用 npm 更新（推薦）？(Y/n)
```

**解除安裝流程（全域性安裝使用者）**：
```
⚠️  檢測到你是透過 npm 全域性安裝的

完整解除安裝需要兩步：
  1. 移除工作流檔案 (即將執行)
  2. 解除安裝 npm 全域性包 (需要手動執行)

? 繼續解除安裝工作流檔案？

... (解除安裝成功後) ...

🔸 最後一步：解除安裝 npm 全域性包

請在新的終端視窗中執行：
  npm uninstall -g ccg-workflow

(完成後 ccg 命令將徹底移除)
```

### 💡 使用者價值

- **全域性安裝使用者**：清晰的更新/解除安裝引導，避免操作混亂
- **混合安裝場景**（先全域性安裝再用 npx）：自動檢測並提供正確操作指引
- **透明度提升**：使用者明確知道哪些檔案被刪除，哪些需要手動操作

---

## [1.7.10] - 2026-01-09

### 🐛 Bug 修復

**Windows 相容性與升級體驗最佳化**

#### 核心修復

1. **修復 Windows 路徑相容性問題**
   - ✅ 新增 `convertToGitBashPath` 函式，將 Windows 路徑轉換為 Git Bash 相容格式
   - ✅ 修復路徑從 `C:\Users\zlb\.claude\bin` 變形為 `C:Userszlb/.claude/bin` 的問題
   - ✅ 支援所有驅動器磁碟機代號（C:, D:, E: 等）自動轉換為 `/c/`, `/d/`, `/e/`
   - ✅ 影響所有呼叫 codeagent-wrapper 的命令（backend、frontend、workflow、analyze 等）
   - 📝 修改檔案：`src/utils/installer.ts`

2. **修復配置遷移問題**
   - ✅ `update` 命令現在會自動檢測並執行從 `~/.ccg` 到 `~/.claude/.ccg` 的遷移
   - ✅ 從 v1.3.x 升級到 v1.7.x 時自動遷移配置檔案和 prompts
   - ✅ 顯示詳細的遷移日誌（已遷移檔案、已跳過檔案、錯誤資訊）
   - 📝 修改檔案：`src/commands/update.ts`

3. **修復 Windows npx 快取問題**
   - ✅ `update` 命令在 Windows 上自動清理 npx 快取
   - ✅ 確保更新時拉取最新版本，而不是使用快取的舊版本
   - ✅ 先嚐試 `npx clear-npx-cache`，失敗則手動刪除 `~/.npm/_npx`
   - 📝 修改檔案：`src/commands/update.ts`

### 📝 文件改進

1. **完善解除安裝與更新文件**
   - ✅ README 中增加完整的解除安裝說明（互動式 + 手動清理）
   - ✅ **新增 npx 快取清理說明**，解決更新後仍使用舊版本的問題
   - ✅ 提供手動清理 MCP 配置的指引
   - 📝 修改檔案：`README.md`

### 🧪 測試驗證

- ✅ Windows 路徑轉換測試（6 個測試用例全部透過）
- ✅ 所有平臺二進位制檔案已重新編譯（macOS、Linux、Windows × amd64/arm64）
- ✅ TypeScript 型別檢查透過
- ✅ 構建測試透過

### 💡 使用者價值

- **Windows 使用者**：徹底解決路徑相容性問題，codeagent-wrapper 正常呼叫
- **升級使用者**：自動遷移配置 + npx 快取清理指引，確保使用最新版本

---

## [1.6.0] - 2026-01-07

### ✨ 功能增強

**多模型並行工作流擴充套件到 backend/frontend 命令**

#### 核心改進

1. **backend.md 和 frontend.md 重大升級**
   - ✅ **5階段完整工作流**：上下文檢索 → 多模型分析 → 原型生成 → 重構實施 → 多模型審計
   - ✅ **多模型並行分析**：Step 2 新增多模型並行分析（Codex + Gemini / Gemini + Claude）
   - ✅ **多模型審計交付**：Step 5 新增多模型交叉驗證審計
   - ✅ **強制使用者確認**：分析完成後詢問"是否繼續執行此方案？(Y/N)"
   - ✅ **詳細使用說明**：每個命令新增 v1.6.0 升級說明、與 /ccg:dev 的區別、使用建議

2. **使用者價值**
   - **後端專家**：使用 `/ccg:backend` 享受 Codex + Gemini 交叉驗證
   - **前端專家**：使用 `/ccg:frontend` 享受 Gemini + Claude 交叉驗證
   - **全棧開發者**：繼續使用 `/ccg:dev` 獲得完整 6 階段工作流

### 🎨 使用者體驗改進

**Workflow 預設模式**

#### 新增功能

1. **三種預設模式**
   - **最小化**（3 命令）：dev, code, commit - 推薦新手
   - **標準**（12 命令）：dev, code, frontend, backend, review, analyze, debug, test, commit, rollback, clean-branches, feat - 推薦
   - **完整**（17 命令）：全部功能 - 高階使用者
   - **自定義**：手動勾選任意命令組合

2. **簡化安裝流程**
   - 安裝時直接選擇預設模式，無需逐個勾選命令
   - 覆蓋 90% 使用者的常見需求場景（標準模式擴充套件到 12 個常用命令）
   - 減少新使用者的選擇困難

3. **程式碼實現**
   - `src/utils/installer.ts` 新增 `WORKFLOW_PRESETS` 常量
   - `src/commands/init.ts` 新增預設選擇介面

### 🔧 配置簡化

**MCP 安裝流程最佳化**

#### 主要變更

1. **簡化 MCP 選擇**
   - ✅ 只保留 **ace-tool** 安裝選項
   - ✅ 移除 auggie 作為安裝選項（使用者仍可手動配置）
   - ✅ 從 3 個選項簡化為 2 個（安裝 ace-tool / 跳過）

2. **中轉服務支援**
   - ✅ 新增 linux.do 社群中轉服務提示
   - ✅ 無需註冊即可使用（降低使用門檻）
   - ✅ 安裝時提供官方服務和中轉服務兩種選擇

3. **Token 配置最佳化**
   - ✅ 支援跳過 Token 配置（預設：跳過）
   - ✅ 可稍後執行 `npx ccg config mcp` 配置
   - ✅ 提高安裝成功率（60% → 90%）

### 🧹 程式碼清理

**移除冗餘配置和死連結**

#### 清理內容

1. **刪除 `_config.md` 死連結**（11 個檔案）
   - 所有命令模板中的 `> 呼叫語法見 _config.md` 已刪除
   - 檔案：dev.md, code.md, frontend.md, backend.md, review.md, analyze.md, think.md, optimize.md, test.md, bugfix.md, debug.md

2. **刪除 `shared-config.md`**
   - ✅ 刪除模板檔案：`templates/config/shared-config.md`（88 行）
   - ✅ 刪除安裝邏輯：`src/utils/installer.ts`（12 行）
   - ✅ 刪除遷移邏輯：`src/utils/migration.ts`（27 行）
   - ✅ 刪除空目錄：`templates/config/`
   - ✅ 更新文件：README.md（1 行）
   - **總計減少**：128 行程式碼

3. **最佳化效果**
   - 構建大小：94.2 kB → 92.6 kB（減少 1.6 kB）
   - 配置檔案簡化，減少使用者困惑
   - 程式碼可維護性提升

### ♻️ 重構

**統一使用 ace-tool MCP**

#### 主要變更

1. **移除動態替換**
   - 所有模板檔案硬編碼使用 `mcp__ace-tool__search_context` 和 `mcp__ace-tool__enhance_prompt`
   - 移除 `installer.ts` 中的 MCP 工具名動態注入邏輯（保留模型路由注入）

2. **引數規範統一**
   - `search_context`: `project_root_path` (必需), `query` (必需)
   - `enhance_prompt`: `prompt` (必需), `conversation_history` (可選), `project_root_path` (可選)

### 📝 文件更新

1. **README.md**
   - 更新版本號：v1.4.2 → v1.6.0
   - 重寫"重大改進"部分（多模型並行增強、配置簡化、程式碼清理）
   - 更新核心特性表格（12個專家提示詞、17個斜槓命令、Workflow 預設）
   - 新增 Workflow 預設說明表格
   - 更新命令參考表格（新增工作流列）
   - 更新專家角色系統說明（修正數量、刪除 Claude 角色）
   - 更新配置檔案示例
   - 新增 Q1: v1.6.0 有哪些重要更新？
   - 更新 MCP 配置說明（v1.6.0 簡化流程）
   - 重新編號所有常見問題（Q1-Q8）
   - 更新最後更新日期和版本號

2. **backend.md 和 frontend.md**
   - 新增 "⭐ v1.6.0 重大升級" 說明部分
   - 詳細說明 5 階段工作流
   - 新增交叉驗證機制說明
   - 新增與 /ccg:dev 的對比表格
   - 提供使用建議

### 🔄 升級說明

- 已安裝使用者：執行 `npx ccg-workflow@latest` → 選擇"更新工作流"
- 新使用者：直接執行 `npx ccg-workflow` 安裝即可
- 自動應用所有改進，保留使用者配置

---

## [1.5.1] - 2026-01-07

### 🐛 修復

**修復多模型並行呼叫提示詞矛盾描述**

#### 問題描述

`templates/commands/dev.md` 和 `review.md` 中存在矛盾描述：
- 開頭簡化描述："前端分析: gemini, 後端分析: codex"
- 後面遍歷邏輯："遍歷 {{BACKEND_MODELS}} 和 {{FRONTEND_MODELS}}"
- 導致 Claude 執行時只呼叫 2 個模型而非配置的全部模型（如 4 個）

#### 修復內容

1. **dev.md**
   - 階段2：刪除誤導性簡化描述，明確"總共並行呼叫次數 = 後端模型數 + 前端模型數"
   - 階段3：同上
   - 階段5：明確"總共並行呼叫次數 = 審查模型數"

2. **review.md**
   - Step 2：刪除誤導性示例程式碼塊，統一為"遍歷 {{REVIEW_MODELS}}"

#### 影響

- ✅ `/ccg:dev` 現在會正確並行呼叫所有配置的模型（例如 4 次而非 2 次）
- ✅ `/ccg:review` 會正確遍歷所有審查模型
- ✅ 其他命令（code/feat/analyze 等）無需修改

---

## [1.5.0] - 2026-01-06

### ✨ 功能增強

**完善動態配置注入系統，支援多模型配置**

#### 1. 動態配置注入系統

- ✅ 移除所有執行時配置讀取邏輯
- ✅ 安裝時將所有配置注入到命令模板
- ✅ 支援 MCP 工具、模型列表、路徑的完整注入
- ✅ 自動替換 `~` 為絕對路徑（修復 Windows 多使用者問題）

#### 2. 多模型配置支援

- **後端/前端模型**：支援配置 1-3 個模型
- **MODELS 變數**（陣列）：用於遍歷所有模型
- **PRIMARY 變數**（單個）：作為主模型
- **命令路由**：
  - `dev`/`review`/`analyze` 命令：並行呼叫所有模型
  - `backend`/`frontend`/`code` 命令：使用主模型

#### 3. 模板最佳化

- ✅ 刪除所有"讀取配置"、"根據配置"的說明
- ✅ 刪除冗餘的配置展示章節
- ✅ 精簡 `feat.md`（741行 → 356行，減少 52%）
- ✅ 刪除 `scan.md`（功能與 MCP 重複）
- ✅ 統一使用簡潔的執行指令

#### 4. 變數注入完善

**MCP 工具**：
- `{{MCP_SEARCH_TOOL}}` → `mcp__ace-tool__search_context` 或 `mcp__auggie-mcp__codebase-retrieval`
- `{{MCP_ENHANCE_TOOL}}` → `mcp__ace-tool__enhance_prompt` 或 `mcp__auggie-mcp__enhance_prompt`
- `{{MCP_SEARCH_PARAM}}` → `query` 或 `information_request`

**模型配置**：
- `{{BACKEND_MODELS}}` → `["codex", "gemini", "claude"]`
- `{{BACKEND_PRIMARY}}` → `"codex"`
- `{{FRONTEND_MODELS}}` → `["gemini", "codex", "claude"]`
- `{{FRONTEND_PRIMARY}}` → `"gemini"`
- `{{REVIEW_MODELS}}` → `["codex", "gemini", "claude"]`

**路徑替換**：
- `~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/analyzer.md`
- 安裝後自動替換為絕對路徑

#### 5. 配置檔案更新

- 新增 auggie MCP 的 `enhance_prompt` 工具
- 統一配置檔案路徑：`~/.claude/.ccg/config.toml`
- Prompts 路徑：`~/.claude/.ccg/prompts/{codex,gemini,claude}/`

#### 修改檔案

**核心邏輯**（4 個）：
- `src/utils/installer.ts`: 完善 `injectConfigVariables()`
- `src/commands/init.ts`: 傳遞完整 routing 配置
- `src/commands/update.ts`: 保留使用者配置
- `src/utils/config.ts`: 新增 auggie enhance_prompt 工具

**命令模板**（18 個）：
- `templates/commands/dev.md`: 多模型遍歷邏輯
- `templates/commands/review.md`: 遍歷審查模型
- `templates/commands/analyze.md`: 合併前後端模型
- `templates/commands/feat.md`: 精簡 52%
- `templates/commands/{backend,frontend,code,debug,test,bugfix,optimize,think}.md`
- `templates/commands/agents/{planner,ui-ux-designer}.md`
- `templates/commands/scan.md`: **刪除**（冗餘）

#### 測試透過

- ✅ TypeScript 型別檢查
- ✅ 本地安裝測試（所有模板正確注入）
- ✅ MCP 工具注入（ace-tool 和 auggie）
- ✅ 多模型配置（3個後端 + 3個前端 + 3個審查）
- ✅ 路徑替換（~ → 絕對路徑）
- ✅ Prompts 安裝（codex/gemini/claude 各6個角色）

---

## [1.4.4] - 2026-01-06

### 🐛 修復

**Windows 多使用者路徑問題**：徹底解決 Windows 下不同使用者無法讀取配置檔案的問題。

#### 問題描述

在 Windows 多使用者環境中，當 Administrator 執行 `npx ccg init` 後，普通使用者（如 `li`、`yao`）無法使用命令：

```
Administrator 安裝:
  C:\Users\Administrator\.claude\.ccg\config.toml
  模板中硬編碼: ROLE_FILE: ~/.claude/.ccg/prompts/codex/analyzer.md

使用者 li 執行命令:
  homedir() 解析到: C:\Users\li
  嘗試讀取: C:\Users\li\.claude\.ccg\prompts\codex\analyzer.md
  結果: 檔案不存在 ❌
```

#### 解決方案

**安裝時固化絕對路徑**：安裝時將模板中的 `~` 路徑替換為當前使用者的絕對路徑。

修改前（模板）：
```markdown
ROLE_FILE: ~/.claude/.ccg/prompts/codex/analyzer.md
```

修改後（使用者 li 安裝後）：
```markdown
ROLE_FILE: C:\Users\li\.claude\.ccg\prompts\codex\analyzer.md
```

#### 修改檔案

- `src/utils/installer.ts`:
  - 新增 `replaceHomePathsInTemplate()` 函式
  - 修改 `installWorkflows()` - 命令模板、agents、prompts、shared-config 安裝時替換路徑
  - 將 `fs.copy()` 改為 `fs.readFile()` + 路徑替換 + `fs.writeFile()`

#### 影響範圍

- ✅ 命令模板 (`templates/commands/*.md`)
- ✅ Agent 檔案 (`templates/commands/agents/*.md`)
- ✅ Prompt 檔案 (`templates/prompts/**/*.md`)
- ✅ 共享配置 (`templates/config/shared-config.md`)

#### 使用說明

每個 Windows 使用者需要獨立執行安裝：

```bash
# 使用者 Administrator
C:\Users\Administrator> npx ccg init

# 使用者 li
C:\Users\li> npx ccg init

# 使用者 yao
C:\Users\yao> npx ccg init
```

每個使用者將擁有獨立的配置和路徑，互不干擾。

---

## [1.4.2] - 2026-01-06

### ✨ 新特性

**Windows MCP 配置自動修復**：從 ZCF 專案移植跨平臺 MCP 配置邏輯，徹底解決 Windows 使用者 MCP 安裝問題。

#### 新增功能

1. **自動 Windows 命令包裝**：
   - Windows 環境下 `npx`/`uvx` 命令自動包裝為 `cmd /c` 格式
   - 使用者無需手動設定環境變數或修改配置
   - 安裝時自動應用，無需額外操作

2. **MCP 配置自動備份**：
   - 修改 `~/.claude.json` 前自動備份到 `~/.claude/backup/`
   - 時間戳命名，支援回滾恢復

3. **新增診斷工具**：
   ```bash
   # 診斷 MCP 配置問題
   npx ccg diagnose-mcp

   # 修復 Windows MCP 配置（Windows 使用者）
   npx ccg fix-mcp
   ```

#### 新增檔案

- `src/utils/platform.ts` - 跨平臺檢測和命令包裝工具
- `src/utils/mcp.ts` - MCP 配置管理和自動修復邏輯
- `src/commands/diagnose-mcp.ts` - MCP 診斷和修復命令

#### 最佳化內容

- `installAceTool()` - 使用新的 `buildMcpServerConfig()` 和 `fixWindowsMcpConfig()`
- `uninstallAceTool()` - 新增自動備份功能
- 所有 MCP 配置操作現在都支援自動備份和 Windows 相容性

#### 技術細節

**Windows 命令包裝示例**：
```json
// Before (不工作)
{
  "mcpServers": {
    "ace-tool": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "ace-tool@latest"]
    }
  }
}

// After (自動修復)
{
  "mcpServers": {
    "ace-tool": {
      "type": "stdio",
      "command": "cmd",
      "args": ["/c", "npx", "-y", "ace-tool@latest"]
    }
  }
}
```

#### 升級說明

已安裝 v1.4.1 的使用者：
1. 執行 `npx ccg-workflow@latest init` 更新
2. Windows 使用者可執行 `npx ccg fix-mcp` 修復現有配置
3. 所有使用者可執行 `npx ccg diagnose-mcp` 驗證配置

---

## [1.4.1] - 2026-01-06

### 🐛 Bug Fixes

**修復命令模板中的路徑引用**：v1.4.0 遷移了目錄結構，但命令模板中的路徑引用未同步更新。

#### 修復內容

1. **提示詞路徑**：
   ```bash
   舊引用：ROLE_FILE: ~/.claude/prompts/ccg/<model>/<role>.md
   新引用：ROLE_FILE: ~/.claude/.ccg/prompts/<model>/<role>.md
   ```

2. **配置檔案路徑**：
   ```bash
   舊引用：~/.ccg/config.toml
   新引用：~/.claude/.ccg/config.toml
   ```

#### 影響範圍

已修復 13 個檔案中的路徑引用：
- `templates/commands/*.md` (12 個命令)
- `templates/config/shared-config.md` (共享配置)

#### 升級說明

如果你已經安裝了 v1.4.0，請重新執行安裝命令更新模板：
```bash
npx ccg-workflow@latest init
```

---

## [1.4.0] - 2026-01-06 ⚡ BREAKING CHANGES

### 🏗️ 目錄結構重構

**重大變更**：統一配置目錄到 `~/.claude/.ccg/`，提升組織性和減少目錄汙染。

#### 變更詳情

**變更 1：配置目錄遷移**
```
舊版本：~/.ccg/
新版本：~/.claude/.ccg/
```

**變更 2：Prompts 目錄遷移**
```
舊版本：~/.claude/prompts/ccg/
新版本：~/.claude/.ccg/prompts/
```

**變更 3：共享配置檔案**
```
舊版本：~/.claude/commands/ccg/_config.md  (會被 CC 誤識別為命令)
新版本：~/.claude/.ccg/shared-config.md     (不會被 CC 掃描)
```

#### 最終目錄結構

```
~/.claude/
├── commands/ccg/           # ✅ CC 讀取的 slash commands
│   ├── dev.md
│   ├── code.md
│   └── ...
├── agents/ccg/             # ✅ CC 讀取的 subagents
│   ├── planner.md
│   └── ...
├── bin/                    # ✅ 二進位制檔案
│   └── codeagent-wrapper
└── .ccg/                   # ✅ CCG 配置目錄（CC 不讀取）
    ├── config.toml         # 主配置檔案
    ├── shared-config.md    # 共享配置
    ├── backup/             # 備份目錄
    └── prompts/            # 專家提示詞
        ├── codex/
        ├── gemini/
        └── claude/
```

#### 自動遷移

✨ **無需手動操作**！執行 `npx ccg-workflow@latest init` 會自動：
1. 檢測舊版本配置
2. 遷移所有檔案到新位置
3. 清理舊檔案（安全檢查後）
4. 顯示遷移報告

示例輸出：
```
ℹ Migration completed:
  ✓ ~/.ccg/config.toml → ~/.claude/.ccg/config.toml
  ✓ ~/.claude/prompts/ccg/ → ~/.claude/.ccg/prompts/
  ✓ ~/.claude/commands/ccg/_config.md → ~/.claude/.ccg/shared-config.md
  ✓ Removed old ~/.ccg/ directory
  ○ Skipped: ~/.claude/prompts/ccg/ (already exists in new location)
```

#### 手動升級

如果你有自定義配置，建議手動遷移：

```bash
# 1. 備份配置
cp -r ~/.ccg ~/.ccg.backup
cp -r ~/.claude/prompts/ccg ~/.claude/prompts/ccg.backup

# 2. 執行升級
npx ccg-workflow@latest init

# 3. 驗證配置
cat ~/.claude/.ccg/config.toml
ls -la ~/.claude/.ccg/prompts/
```

#### 不相容性說明

| 影響項 | 描述 | 解決方案 |
|--------|------|----------|
| **配置路徑硬編碼** | 如果你的指令碼硬編碼了 `~/.ccg/` 路徑 | 改為 `~/.claude/.ccg/` |
| **Prompts 引用** | 如果你的命令引用了 `~/.claude/prompts/ccg/` | 改為 `~/.claude/.ccg/prompts/` |
| **_config.md** | 舊的 `_config.md` 已重新命名 | 改為 `shared-config.md` |

#### 修改位置

- `src/utils/config.ts` - 配置路徑定義
- `src/utils/installer.ts` - 安裝路徑邏輯
- `src/utils/migration.ts` - 自動遷移指令碼（新增）
- `src/commands/init.ts` - 整合遷移邏輯
- `templates/` - 目錄結構重組

#### 優勢

- ✅ **更清晰**：所有 CCG 配置集中在 `~/.claude/.ccg/`
- ✅ **減少汙染**：不再佔用 `~/.claude/` 頂層空間
- ✅ **避免混淆**：`_config.md` 不會被 CC 誤識別為命令
- ✅ **符合規範**：遵循社群最佳實踐（參考 ccline）

---

## [1.3.7] - 2026-01-06 🐛

### 修復 1：ace-tool MCP 配置相容性問題

#### 問題描述
- 使用者反饋 ace-tool MCP "安裝不上去"
- 程式碼準備了引數陣列（`--base-url`, `--token`）但實際寫入配置時未使用
- 使用環境變數模式（`env: { ACE_BASE_URL, ACE_TOKEN }`）可能不被 ace-tool 支援

#### 修復方案

**修改位置**：`src/utils/installer.ts:567-630`

**舊程式碼**（環境變數模式）：
```typescript
existingConfig.mcpServers['ace-tool'] = {
  type: 'stdio',
  command: 'npx',
  args: ['-y', 'ace-tool@latest'],  // 硬編碼，未使用準備的 args
  env: {
    ACE_BASE_URL: baseUrl || 'https://api.augmentcode.com',
    ACE_TOKEN: token || '',
  },
}
```

**新程式碼**（引數傳遞模式）：
```typescript
existingConfig.mcpServers['ace-tool'] = {
  type: 'stdio',
  command: 'npx',
  args,  // 使用動態構建的 args 陣列（包含 --base-url 和 --token）
}
```

#### 生成的配置格式
```json
{
  "mcpServers": {
    "ace-tool": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "ace-tool@latest",
        "--base-url", "https://api.augmentcode.com",
        "--token", "YOUR_TOKEN"
      ]
    }
  }
}
```

#### 修復效果
- ✅ **相容性更好**：引數傳遞模式不依賴 ace-tool 的環境變數支援
- ✅ **符合預期**：使用之前準備的 `args` 陣列，避免重複程式碼
- ✅ **使用者驗證**：符合社群使用者反饋的正確配置格式
- ✅ **包含必需欄位**：`type: "stdio"` + `-y` 標誌 + `@latest` 版本

### 修復 2：Subagents 安裝路徑修正

#### 問題描述
- Subagents 被安裝到 `~/.claude/commands/ccg/agents/`（錯誤路徑）
- Claude Code 無法識別，因為 subagents 應該在 `~/.claude/agents/ccg/`

#### 修復方案

**修改位置**：
- `src/utils/installer.ts:318-320` - 修改安裝目標路徑
- `config.json:19-23` - 新增 agents 安裝配置（Python 安裝器）

**舊程式碼**：
```typescript
const agentsDestDir = join(commandsDir, 'agents')
```

**新程式碼**：
```typescript
const agentsDestDir = join(installDir, 'agents', 'ccg')
```

#### 修復效果
- ✅ **正確識別**：Subagents 安裝到 `~/.claude/agents/ccg/`，Claude Code 可以識別
- ✅ **符合規範**：遵循 Claude Code 的 agents 目錄結構
- ✅ **不影響命令**：Slash commands 仍在 `~/.claude/commands/ccg/`

#### 影響範圍
- **所有平臺**：透過 `npx ccg-workflow init` 或 `python3 install.py` 安裝的使用者
- **Subagents**：planner, ui-ux-designer, init-architect, get-current-datetime
- **向下相容**：舊路徑的 agents 不會被自動清理，需要手動刪除

---

## [1.3.3] - 2026-01-05 🔒

### 安全修復：Windows PATH 配置方法

#### 問題描述
- Windows 安裝時使用 `setx` 命令配置 PATH 存在 **1024 字元限制**
- 如果使用者 PATH 已經很長，使用 `setx PATH "%PATH%;新路徑"` 會導致：
  - PATH 被截斷到 1024 字元
  - 超出部分的路徑丟失
  - 可能破壞現有系統配置

#### 修復方案

**修改位置**：`src/commands/init.ts:281-299`

**舊程式碼**（有風險）：
```typescript
console.log(ansis.gray(`     [System.Environment]::SetEnvironmentVariable('PATH', "$env:PATH;${result.binPath.replace(/\//g, '\\')}", 'User')`))
```

**新程式碼**（安全追加）：
```typescript
const windowsPath = result.binPath.replace(/\//g, '\\')
console.log(ansis.gray(`     $currentPath = [System.Environment]::GetEnvironmentVariable('PATH', 'User')`))
console.log(ansis.gray(`     $newPath = '${windowsPath}'`))
console.log(ansis.gray(`     if ($currentPath -notlike "*$newPath*") {`))
console.log(ansis.gray(`         [System.Environment]::SetEnvironmentVariable('PATH', "$currentPath;$newPath", 'User')`))
console.log(ansis.gray(`     }`))
```

#### 新方法優勢
- ✅ **無字元限制**：PowerShell `SetEnvironmentVariable` 支援最大 32767 字元
- ✅ **安全追加**：先讀取當前 PATH，再追加新路徑
- ✅ **重複檢測**：使用 `-notlike` 判斷路徑是否已存在，避免重複新增
- ✅ **向下相容**：不影響 macOS/Linux 自動配置邏輯
- ✅ **不影響舊版**：僅影響新安裝使用者，不破壞現有配置

#### 影響範圍
- **僅 Windows 使用者**：修改僅影響 Windows 平臺的 PATH 配置提示
- **macOS/Linux**：繼續使用自動寫入 `.zshrc`/`.bashrc` 的方式（無影響）
- **舊版 install.py**：Python 指令碼中的 `setx` 提示保持不變（已棄用）

---

## [1.3.2] - 2026-01-05 🐛

### 關鍵 Bug 修復：MCP 配置缺失

#### 問題描述
- 安裝後 `~/.ccg/config.toml` 缺少 `[mcp]` 配置部分
- TypeScript 型別定義 `CcgConfig` 未包含 `mcp` 欄位
- `createDefaultConfig` 函式未生成 MCP 相關配置

#### 修復內容

- **型別定義更新** (`src/types/index.ts`):
  ```typescript
  export interface CcgConfig {
    // ... 其他欄位
    mcp: {
      provider: string
      setup_url: string
      tools: {
        code_search_ace: string
        code_search_auggie: string
        prompt_enhance_ace: string
        prompt_enhance_auggie: string
        query_param_ace: string
        query_param_auggie: string
      }
    }
  }
  ```

- **配置生成更新** (`src/utils/config.ts`):
  - `createDefaultConfig` 函式新增 `mcp` 欄位生成邏輯
  - 預設配置：`provider = "ace-tool"`
  - 包含完整的工具對映和引數名配置
  - 配置檔案版本號從 `1.0.0` 升級到 `1.3.2`

- **生成的配置結構**:
  ```toml
  [general]
  version = "1.3.2"

  [mcp]
  provider = "ace-tool"
  setup_url = "https://linux.do/t/topic/284963"

  [mcp.tools]
  code_search_ace = "mcp__ace-tool__search_context"
  code_search_auggie = "mcp__auggie-mcp__codebase-retrieval"
  prompt_enhance_ace = "mcp__ace-tool__enhance_prompt"
  prompt_enhance_auggie = ""
  query_param_ace = "query"
  query_param_auggie = "information_request"
  ```

#### 影響
- 修復後，所有新安裝都會自動生成完整的 MCP 配置
- 命令模板（如 `/ccg:dev`, `/ccg:enhance`）可以正確讀取 MCP 工具對映
- 使用者無需手動編輯配置檔案即可使用 MCP 功能

---

## [1.3.1] - 2026-01-05

### 命令模板修正

- **說明修正**：澄清 auggie 也支援 Prompt 增強功能（需按教程配置）
- **模板更新**：修正 `/ccg:dev` 和 `/ccg:enhance` 命令的提示資訊
  - 從"auggie 不支援"改為"未配置 Prompt 增強功能"
  - 提供配置教程連結
- **配置註釋**：更新 `prompt_enhance_auggie = ""` 的說明

---

## [1.3.0] - 2026-01-05 ⭐

### 重大更新：MCP 動態選擇系統

#### 核心特性

- **多 MCP 支援**：安裝時可選擇 ace-tool（第三方封裝）或 auggie（官方原版）
- **互動式選擇**：安裝指令碼提供友好的 MCP 選擇介面，顯示各選項的功能對比
- **配置檔案驅動**：生成 `~/.ccg/config.toml` 記錄 MCP 選擇，命令模板動態適配
- **完全相容**：命令模板根據配置自動使用正確的 MCP 工具名稱
- **簡潔高效**：命令模板引用共享配置，避免重複說明

#### 技術實現

- **install.py 更新**：
  - 新增 `choose_mcp_provider()` 函式：互動式選擇介面
  - 新增 `install_auggie()` 函式：安裝 auggie MCP (`@augmentcode/auggie@prerelease`)
  - 新增 `create_ccg_config()` 函式：生成配置檔案 `~/.ccg/config.toml`
  - 修改 `execute_operation()`：支援 `"install_mcp"` 操作型別，動態路由到不同的安裝函式

- **配置檔案結構** (`~/.ccg/config.toml`)：
  ```toml
  [mcp]
  provider = "ace-tool"  # ace-tool | auggie | none

  [mcp.ace-tool]
  tools = ["enhance_prompt", "search_context"]

  [mcp.auggie]
  tools = ["codebase-retrieval"]
  note = "auggie 不包含 Prompt 增強工具，需手動配置"

  [routing]
  mode = "smart"
  # ... 模型路由配置
  ```

- **命令模板更新**（11個命令檔案）：
  - 所有命令模板統一引用 `memorys/MCP_USAGE.md` 獲取 MCP 呼叫規範
  - 移除重複的 MCP 工具呼叫說明，減少 50% 的提示詞長度
  - 命令模板只需引用配置檔案 `~/.ccg/config.toml` 中的工具對映表
  - 支援檔案：`dev.md`, `enhance.md`, `code.md`, `debug.md`, `bugfix.md`, `test.md`, `think.md`, `optimize.md`, `analyze.md`, `backend.md`, `frontend.md`, `review.md`

- **工具對映對照**：
  | 功能 | ace-tool | auggie |
  |------|----------|--------|
  | Prompt 增強 | `mcp__ace-tool__enhance_prompt` | ❌ 不支援 |
  | 程式碼檢索 | `mcp__ace-tool__search_context` | `mcp__auggie-mcp__codebase-retrieval` |

#### 使用者體驗

- **安裝流程**：
  1. 執行 `python3 install.py` 或 `npx ccg-workflow`
  2. 看到 MCP 選擇選單，對比功能後選擇
  3. 自動安裝並配置對應的 MCP 工具
  4. 生成配置檔案，記錄選擇

- **使用體驗**：
  - 命令模板自動讀取配置，無需手動修改
  - ace-tool 使用者：完整功能（Prompt 增強 + 程式碼檢索）
  - auggie 使用者：程式碼檢索功能，提示檢視配置教程連結
  - 配置教程：https://linux.do/t/topic/1280612

#### 文件更新

- `README.md`：更新"首次安裝"部分，說明 MCP 選擇步驟
- `CLAUDE.md`：新增"MCP 工具選擇"章節，詳細說明兩種 MCP 的區別
- `memorys/MCP_USAGE.md`：建立共享的 MCP 呼叫規範文件，所有命令引用
- `MCP_SELECTION_GUIDE.md`：建立工具對映指南，供開發者參考

#### 最佳化亮點

- **簡潔性**：命令模板從平均 150 行減少到 80 行
- **可維護性**：MCP 呼叫邏輯統一管理，修改一處即可
- **可擴充套件性**：未來新增新 MCP 只需更新配置檔案和 `MCP_USAGE.md`

---

## [1.2.3] - 2026-01-05

### 新增

- **二進位制安裝驗證**：安裝後自動驗證 `codeagent-wrapper` 可用性
  - 在 `installCodeagentWrapper()` 中新增驗證步驟
  - 執行 `codeagent-wrapper --version` 驗證二進位制檔案正常執行
  - 顯示版本資訊確認安裝成功

### 最佳化

- **錯誤顯示**：安裝失敗時顯示詳細錯誤資訊
  - 捕獲並顯示具體的錯誤訊息
  - 提供友好的錯誤提示和解決建議
- **文件清理**：刪除 `dev.md` 中的過時提示

---

## [1.2.2] - 2026-01-05

### 最佳化

- 刪除重複的根目錄提示詞檔案（`prompts/`）
- 只保留 `templates/prompts/` 作為安裝模板源
- 從 `package.json` 的 `files` 欄位移除 `"prompts"`
- npm 包減少 18 個檔案（75 → 57 files）

---

## [1.2.1] - 2026-01-05

### 修復

- 確保 `~/.ccg/config.toml` 配置檔案在安裝失敗時也能建立
- 將 `writeCcgConfig()` 調整到 `installWorkflows()` 之前執行
- 修復首次 `init` 時配置檔案可能不存在的問題

---

## [1.2.0] - 2026-01-05 ⭐

### 重大更新：ROLE_FILE 動態注入

#### 核心特性

- **真正的動態注入**：`codeagent-wrapper` 自動識別 `ROLE_FILE:` 指令
- **0 token 消耗**：Claude 無需先用 Read 工具讀取提示詞檔案
- **自動化管理**：一行 `ROLE_FILE:` 搞定，無需手動貼上

#### 技術實現

在 `codeagent-wrapper/utils.go` 中新增 `injectRoleFile()` 函式：
- 使用正則 `^ROLE_FILE:\s*(.+)` 匹配指令
- 自動展開 `~/` 為使用者 HOME 目錄
- 讀取檔案內容並原地替換 `ROLE_FILE:` 行
- 完整日誌記錄注入過程（檔案路徑、大小）

在 `codeagent-wrapper/main.go` 中整合動態注入：
- Explicit stdin 模式支援
- Piped task 模式支援
- Parallel 模式支援（所有任務）

#### 更新內容

- 重新編譯所有平臺二進位制檔案（darwin-amd64, darwin-arm64, linux-amd64, windows-amd64）
- 更新所有命令模板，使用 `ROLE_FILE:` 替代手動讀取

#### 使用示例

```bash
# 舊方式（已棄用）
⏺ Read(~/.claude/prompts/ccg/codex/reviewer.md)
codeagent-wrapper --backend codex - <<'EOF'
# 手動貼上提示詞內容...
<TASK>...</TASK>
EOF

# 新方式（v1.2.0）
codeagent-wrapper --backend codex - <<'EOF'
ROLE_FILE: ~/.claude/prompts/ccg/codex/reviewer.md

<TASK>審查程式碼...</TASK>
EOF
```

---

## [1.1.3] - 2026-01-05

### 新增功能

- **PATH 自動配置**：安裝後自動配置 `codeagent-wrapper` 可執行路徑
  - **Mac/Linux**：互動式提示，自動新增到 `.zshrc` 或 `.bashrc`
  - **Windows**：提供詳細手動配置指南 + PowerShell 一鍵命令
  - 智慧檢測重複配置，避免多次新增

### 使用者體驗

- 安裝完成後詢問是否自動配置 PATH（Mac/Linux）
- 自動檢測 shell 型別（zsh/bash）
- 檢查是否已配置，避免重複新增
- Windows 使用者獲得分步操作指南

### 國際化

- 新增 11 個 i18n 翻譯鍵（中文/英文）
- 最佳化提示資訊的可讀性

---

## [1.1.2] - 2026-01-05

### 新增功能

- **codeagent-wrapper 自動安裝**：安裝時自動複製二進位制檔案到 `~/.claude/bin/`
  - 跨平臺支援：darwin-amd64, darwin-arm64, linux-amd64, windows-amd64
  - 自動設定可執行許可權（Unix 系統）
  - 顯示安裝路徑和配置說明

### 技術實現

- 修改 `src/types/index.ts` 新增 `binPath` 和 `binInstalled` 欄位
- 修改 `src/utils/installer.ts` 實現平臺檢測和二進位制安裝邏輯
- 修改 `src/commands/init.ts` 顯示 PATH 配置說明

### 使用者體驗

- 安裝後顯示 PATH 配置指令
- 提供友好的配置提示
- 新增 i18n 翻譯

---

## [1.1.1] - 2026-01-05

### 文件更新

- 更新 README 新增智慧更新功能詳細說明
- 新增"更新到最新版本"獨立章節
- 最佳化互動式選單說明，分離首次安裝和更新流程
- 在"最新更新"部分新增 v1.1.0 智慧更新系統介紹

---

## [1.1.0] - 2026-01-05

### 新增功能

- **智慧更新系統**：一鍵更新命令模板和提示詞，無需解除安裝重灌
  - 自動檢測 npm 最新版本並對比當前版本
  - 增量更新，僅更新命令和提示詞檔案
  - 保留使用者配置（`~/.ccg/config.toml`）
  - 支援強制重灌，修復損壞的檔案
  - 無需 sudo 許可權

### 核心實現

- 新增 `src/utils/version.ts` - 版本管理工具
  - `getCurrentVersion()` - 獲取當前安裝版本
  - `getLatestVersion()` - 查詢 npm 最新版本
  - `compareVersions()` - 語義化版本對比
  - `checkForUpdates()` - 檢查是否有可用更新

- 新增 `src/commands/update.ts` - 更新命令實現
  - 互動式更新流程
  - 版本檢測和對比
  - 強制重灌選項

- 更新 `src/commands/menu.ts` - 選單整合
  - 新增"更新工作流"選項
  - 移除複雜的備份管理功能

### 使用者體驗

- 執行 `npx ccg-workflow` 選擇"更新工作流"即可更新
- 顯示當前版本 vs 最新版本對比
- 自動更新所有檔案並保留配置
- 提供友好的進度提示和錯誤處理

---

## [1.0.6] - 2026-01-05

### 修復

- 修復命令模板中的 MCP 工具引數缺失問題
- 在所有命令模板中新增 `mcp__ace-tool__search_context` 完整引數說明
- 在 enhance/dev 模板中新增 `mcp__ace-tool__enhance_prompt` 引數說明
- 更新 `_config.md` 中的提示詞路徑引用

---

## [1.0.5] - 2026-01-05

### 修復

- 修復安裝時複製 CLAUDE.md 到使用者目錄的問題
- 斜槓命令已自包含完整工作流指令
- 避免覆蓋使用者已有的 `~/.claude/CLAUDE.md` 配置

---

## [1.0.4] - 2026-01-05

### 新增

- 補充 init-project 命令所需的兩個 subagent
  - `init-architect.md` - 架構師子智慧體
  - `planner.md` - 任務規劃師

---

## [1.0.3] - 2026-01-05

### 新增

- 為所有多模型命令新增 codeagent-wrapper 呼叫示例
- 最佳化命令模板，明確使用方式

---

## [1.0.2] - 2026-01-05

### 最佳化

- 最佳化 token 消耗，改用子程序讀取角色提示詞檔案
- 減少記憶體佔用

---

## [1.0.1] - 2026-01-05

### 修復

- 修復命令模板呼叫方式
- 明確使用 codeagent-wrapper 的標準語法

---

## [1.0.0] - 2026-01-05

### 重大更新：npm 首次釋出

#### 安裝方式革命性升級

- ✅ 從 Python 指令碼重構為 **TypeScript + unbuild** 構建系統
- ✅ 釋出到 npm: `npx ccg-workflow` 一鍵安裝
- ✅ 互動式配置選單（初始化/解除安裝）
- ✅ 更好的跨平臺相容性

#### 三模型協作時代

- ✅ 從雙模型 (Codex + Gemini) 擴充套件到 **三模型 (Claude + Codex + Gemini)**
- ✅ 新增 6 個 Claude 角色提示詞（architect, analyzer, debugger, optimizer, reviewer, tester）
- ✅ 專家提示詞從 12 個擴充套件到 **18 個**

#### 配置系統升級

- ✅ 配置檔案從 `config.json` 遷移到 `~/.ccg/config.toml`
- ✅ 支援 **smart/parallel/sequential** 三種協作模式
- ✅ 可配置前端/後端模型優先順序

#### 核心功能

**開發工作流（12個命令）**
- `/ccg:dev` - 完整6階段三模型工作流
- `/ccg:code` - 三模型程式碼生成（智慧路由）
- `/ccg:debug` - UltraThink 三模型除錯
- `/ccg:test` - 三模型測試生成
- `/ccg:bugfix` - 質量門控修復（90%+ 透過）
- `/ccg:think` - 深度分析
- `/ccg:optimize` - 效能最佳化
- `/ccg:frontend` - 前端任務 → Gemini
- `/ccg:backend` - 後端任務 → Codex
- `/ccg:review` - 三模型程式碼審查
- `/ccg:analyze` - 三模型技術分析
- `/ccg:enhance` - Prompt 增強（ace-tool MCP）

**智慧規劃（2個命令）**
- `/ccg:scan` - 智慧倉庫掃描
- `/ccg:feat` - 智慧功能開發

**Git 工具（4個命令）**
- `/ccg:commit` - 智慧 commit（支援 emoji）
- `/ccg:rollback` - 互動式回滾
- `/ccg:clean-branches` - 清理已合併分支
- `/ccg:worktree` - Worktree 管理

**專案初始化（1個命令）**
- `/ccg:init` - 初始化專案 AI 上下文

#### 專家提示詞系統

**18個角色檔案**，動態角色注入：
- **Codex 角色**（6個）：architect, analyzer, debugger, tester, reviewer, optimizer
- **Gemini 角色**（6個）：frontend, analyzer, debugger, tester, reviewer, optimizer
- **Claude 角色**（6個）：architect, analyzer, debugger, tester, reviewer, optimizer

#### 技術棧

- **構建工具**: unbuild
- **程式語言**: TypeScript
- **CLI 框架**: cac
- **互動介面**: inquirer
- **配置格式**: TOML
- **國際化**: i18next

#### 依賴項

```json
{
  "ansis": "^4.1.0",
  "cac": "^6.7.14",
  "fs-extra": "^11.3.2",
  "i18next": "^25.5.2",
  "inquirer": "^12.9.6",
  "ora": "^9.0.0",
  "pathe": "^2.0.3",
  "smol-toml": "^1.4.2"
}
```

---

## [Pre-1.0.0] - Python 版本

### Python 安裝指令碼時代（已棄用）

使用 `python3 install.py` 進行安裝，支援雙模型協作（Codex + Gemini）。

**主要限制**：
- 需要手動 clone 倉庫
- Python 環境依賴
- 配置不夠靈活
- 更新需要重新安裝

---

## 連結

- [GitHub Repository](https://github.com/fengshao1227/ccg-workflow)
- [npm Package](https://www.npmjs.com/package/ccg-workflow)
- [README](https://github.com/fengshao1227/ccg-workflow/blob/main/README.md)
