---
description: '專案上下文管理：初始化 .context 目錄、記錄決策日誌、壓縮歸檔、檢視歷史'
---

# Context - 專案上下文管理

管理 `.context/` 目錄結構，為 LLM 工具提供決策審計鏈。

## 使用方法

```bash
/context <subcommand> [options]
```

## 子命令

| 子命令 | 說明 |
|--------|------|
| `init` | 初始化 `.context/` 目錄結構 |
| `log <message>` | （可選）手動追加備註到 session.log，commit 時會合並 |
| `show` | 檢視當前分支的 session.log |
| `compress` | 壓縮 session.log → uncommit.md（手動預覽用） |
| `history` | 檢視 history/commits.md |
| `squash <ids...>` | 合併多條 history 記錄（配合 git squash） |

> **核心用法**：`init` 一次，之後只管開發。`/ccg:commit` 提交時自動從 git diff 分析決策並歸檔到 history/。`log` 僅在你想手動補充備註時使用。

---

## 執行工作流

### 子命令：init

`[模式：初始化]`

在當前專案根目錄建立 `.context/` 結構：

1. 檢測專案根目錄（查詢 `.git/`）
2. 若 `.context/` 已存在，跳過已有檔案，僅補全缺失
3. 建立以下結構：

```
.context/
├── .gitignore
├── .gitattributes
├── prefs/
│   ├── coding-style.md
│   └── workflow.md
├── current/
│   └── branches/
│       └── .gitkeep
└── history/
    ├── commits.jsonl
    ├── commits.md
    └── archives/
        └── .gitkeep
```

4. **建立 `.context/.gitignore`**：

```gitignore
# Ephemeral workspace — never commit
current/

# Raw interaction logs — always local only
**/session.log
**/session.raw.log
**/*.session.log
**/*.raw.log

# Editor / temp
**/*.tmp
**/*.bak
**/*.swp
```

5. **建立 `.context/.gitattributes`**：

```
# JSONL append-only: 'union' merge reduces conflicts
history/commits.jsonl merge=union
history/archives/*.jsonl merge=union
```

6. **建立 `.context/prefs/coding-style.md`**（團隊編碼規範模板）：

```markdown
# Coding Style Guide

> 此檔案定義團隊編碼規範，所有 LLM 工具在修改程式碼時必須遵守。
> 提交到 Git，團隊共享。

## General
- Prefer small, reviewable changes; avoid unrelated refactors.
- Keep functions short (<50 lines); avoid deep nesting (≤3 levels).
- Name things explicitly; no single-letter variables except loop counters.
- Handle errors explicitly; never swallow errors silently.

## Language-Specific
<!-- 根據專案語言補充，例如：-->
<!-- ### TypeScript -->
<!-- - Use strict mode; prefer `interface` over `type` for object shapes. -->

## Git Commits
- Conventional Commits, imperative mood.
- Atomic commits: one logical change per commit.

## Testing
- Every feat/fix MUST include corresponding tests.
- Coverage must not decrease.
- Fix flow: write failing test FIRST, then fix code.

## Security
- Never log secrets (tokens/keys/cookies/JWT).
- Validate inputs at trust boundaries.
```

7. **建立 `.context/prefs/workflow.md`**（LLM 工作流規則）：

```markdown
# Development Workflow Rules

> 此檔案定義 LLM 開發工作流的強制規則。
> 所有 LLM 工具在執行任務時必須遵守，不可跳過任何步驟。

## Full Flow (MUST follow, no exceptions)

### feat (新功能)
1. 理解需求，分析影響範圍
2. 讀取現有程式碼，理解模式
3. 編寫實現程式碼
4. 編寫對應測試
5. 執行測試，修復失敗
6. 更新文件（若 API 變更）
7. 自查 lint / type-check

### fix (缺陷修復)
1. 復現問題，確認症狀
2. 定位根因
3. 編寫失敗測試（先有紅燈）
4. 修復程式碼
5. 驗證測試透過（變綠燈）
6. 迴歸測試

### refactor (重構)
1. 確保現有測試透過
2. 小步重構，每步可驗證
3. 重構後測試必須全部透過
4. 不改變外部行為

## Context Logging (決策記錄)

當你做出以下決策時，MUST 追加到 `.context/current/branches/<當前分支>/session.log`：

1. **方案選擇**：選 A 不選 B 時，記錄原因
2. **Bug 發現與修復**：根因 + 修復方法 + 教訓
3. **API/架構決策**：介面設計選擇
4. **放棄的方案**：為什麼放棄

追加格式：

## <ISO-8601 時間>
**Decision**: <你選擇了什麼>
**Alternatives**: <被排除的方案>
**Reason**: <為什麼>
**Risk**: <潛在風險>
```

8. **建立 `.context/history/commits.jsonl`**（空檔案）

9. **建立 `.context/history/commits.md`**（人類檢視模板）：

```markdown
# Commit Decision History

> 此檔案是 `commits.jsonl` 的人類可讀檢視，可由工具重生成。
> Canonical store: `commits.jsonl` (JSONL, append-only)

| Date | Context-Id | Commit | Summary | Decisions | Bugs | Risk |
|------|-----------|--------|---------|-----------|------|------|
```

10. **注入 CLAUDE.md 引用**（若專案存在 CLAUDE.md）：

檢測專案根目錄是否有 `CLAUDE.md`，若有則在末尾追加：

```markdown

## .context 專案上下文

> 專案使用 `.context/` 管理開發決策上下文。

- 編碼規範：`.context/prefs/coding-style.md`
- 工作流規則：`.context/prefs/workflow.md`
- 決策歷史：`.context/history/commits.md`

**規則**：修改程式碼前必讀 prefs/，做決策時按 workflow.md 規則記錄日誌。
```

11. 輸出初始化結果摘要

---

### 子命令：log

`[模式：記錄]`

1. 獲取當前 Git 分支名：`git branch --show-current`
2. 確保 `.context/current/branches/<branch>/` 目錄存在
3. 將 `<message>` 以結構化格式追加到 `session.log`：

```markdown
## <ISO-8601 當前時間>
<message>
```

---

### 子命令：show

`[模式：檢視]`

1. 獲取當前分支名
2. 讀取 `.context/current/branches/<branch>/session.log`
3. 若不存在，提示 "當前分支暫無決策日誌"
4. 輸出內容

---

### 子命令：compress

`[模式：壓縮]`

將 `session.log` 壓縮為結構化 `uncommit.md`，供提交前審查。

1. 讀取 `.context/current/branches/<branch>/session.log`
2. 若為空，提示無內容可壓縮
3. **脫敏**：掃描並替換潛在敏感資訊（token/key/password → `[REDACTED]`）
4. **結構化提取**：從日誌中提取 decisions / bugs / alternatives
5. **生成 uncommit.md**：

```markdown
# Pre-commit Summary: <branch-name>

| Time | Summary | Decision | Method | Result & Bug |
|------|---------|----------|--------|--------------|
| ... | ... | ... | ... | ... |
```

6. 輸出壓縮結果供使用者審查
7. 提示使用者：確認後可執行 `/ccg:commit` 提交

---

### 子命令：history

`[模式：檢視]`

1. 讀取 `.context/history/commits.md`
2. 若不存在，提示 "暫無歷史記錄，請先使用 /ccg:context init"
3. 輸出內容
4. 若使用者指定檔案路徑，從 `commits.jsonl` 檢索 `changes.files` 包含該路徑的條目

---

### 子命令：squash

`[模式：合併]`

配合 `git squash` 使用，合併多條 ContextEntry。

1. 接收 Context-Id 列表
2. 從 `commits.jsonl` 讀取對應條目
3. 生成新的聚合 ContextEntry：
   - 新 `context_id`（UUIDv7）
   - `Context-Refs` = 所有被 squash 的 ids
   - 合併 decisions / bugs / changes
4. 追加到 `commits.jsonl`
5. 重生成 `commits.md`

---

## ContextEntry Schema (v1.0.0)

每條 JSONL 記錄格式：

```json
{
  "schema_version": "1.0.0",
  "context_id": "<UUIDv7>",
  "created_at": "<ISO-8601>",
  "producer": {
    "tool": "<tool-name>",
    "llm": { "provider": "<provider>", "model": "<model>" }
  },
  "git": {
    "branch": "<branch>",
    "commit_sha": "<short-sha>",
    "trailers": { "Context-Id": "<uuid>" }
  },
  "summary": "<one-line summary>",
  "decisions": [{
    "title": "<decision title>",
    "rationale": "<why>",
    "tradeoffs": ["<tradeoff>"],
    "assumptions": ["<assumption>"],
    "rejected_alternatives": [{ "option": "<alt>", "reason": "<why rejected>" }],
    "side_effects": ["<side effect>"]
  }],
  "bugs": [{
    "symptom": "<what happened>",
    "root_cause": "<why>",
    "fix": "<how fixed>",
    "lesson": "<takeaway>"
  }],
  "changes": { "files": ["<path>"] },
  "tests": [{ "command": "<cmd>", "result": "<pass/fail>", "coverage": "<pct>" }],
  "privacy": { "classification": "internal", "redactions_applied": true }
}
```

---

## 關鍵規則

1. **prefs/ 提交到 Git** — 團隊共享編碼規範
2. **current/ 永不提交** — 原始日誌僅本地
3. **history/ 提交到 Git** — 永久決策歸檔
4. **commits.jsonl 是 canonical** — commits.md 可重生成
5. **UUIDv7 為主鍵** — 不依賴 commit SHA（rebase-safe）
6. **merge=union** — JSONL append 衝突自動合併
7. **脫敏先於一切** — 任何寫入 history 前必須脫敏
