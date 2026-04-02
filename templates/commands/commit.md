---
description: '智慧 Git 提交：分析改動生成 Conventional Commit 資訊，支援拆分建議'
---

# Commit - 智慧 Git 提交

分析當前改動，生成 Conventional Commits 風格的提交資訊。

## 使用方法

```bash
/commit [options]
```

## 選項

| 選項 | 說明 |
|------|------|
| `--no-verify` | 跳過 Git 鉤子 |
| `--all` | 暫存所有改動 |
| `--amend` | 修補上次提交 |
| `--signoff` | 附加簽名 |
| `--emoji` | 包含 emoji 字首 |
| `--scope <scope>` | 指定作用域 |
| `--type <type>` | 指定提交型別 |

---

## 執行工作流

### 🔍 階段 1：倉庫校驗

`[模式：檢查]`

1. 驗證 Git 倉庫狀態
2. 檢測 rebase/merge 衝突
3. 讀取當前分支/HEAD 狀態

### 📋 階段 2：改動檢測

`[模式：分析]`

1. 獲取已暫存與未暫存改動
2. 若暫存區為空：
   - `--all` → 執行 `git add -A`
   - 否則提示選擇

### ✂️ 階段 3：拆分建議

`[模式：建議]`

按以下維度聚類：
- 關注點（原始碼 vs 文件/測試）
- 檔案模式（不同目錄/包）
- 改動型別（新增 vs 刪除）

若檢測到多組獨立變更（>300 行 / 跨多個頂級目錄），建議拆分。

### ✍️ 階段 4：生成提交資訊

`[模式：生成]`

**格式**：`[emoji] <type>(<scope>): <subject>`

- 首行 ≤ 72 字元
- 祈使語氣
- 訊息體：動機、實現要點、影響範圍

**語言**：根據最近 50 次提交判斷中文/英文

### 📦 階段 5：Context 自動歸檔（若 .context/ 存在）

`[模式：上下文歸檔]`

**前置判斷**：
- 若 `.context/` 目錄不存在 → 在提交成功後輸出提示：`💡 建議執行 /ccg:context init 啟用決策追蹤`，不阻斷
- 若 `.context/` 存在 → 執行以下步驟

**從 git diff 自動生成 ContextEntry**：

1. 獲取當前分支名：`git branch --show-current`
2. 獲取暫存區變更：`git diff --cached --stat` + `git diff --cached`（完整 diff）
3. **分析 diff 生成 ContextEntry**：
   - `summary`：從階段 4 生成的 commit message 中取首行
   - `decisions`：分析 diff 中的關鍵變更（新增依賴、架構調整、介面變更、配置修改），推斷決策理由
   - `bugs`：若 commit type 為 `fix`，從 diff 中提取 bug 症狀、根因、修復方式
   - `changes.files`：從 `git diff --cached --name-only` 提取
   - `tests`：若變更包含測試檔案，記錄測試相關資訊
4. **合併 session.log**（可選）：若 `.context/current/branches/<branch>/session.log` 存在且非空，將其中的手動記錄合併到 decisions/bugs 中，然後清空 session.log
5. **脫敏**：掃描 token/key/password/secret 模式 → 替換為 `[REDACTED]`
6. **追加**：將 ContextEntry 作為一行追加到 `.context/history/commits.jsonl`
7. **重生成**：更新 `.context/history/commits.md` 人類檢視
8. **暫存**：`git add .context/history/`
9. **Trailer**：在 commit message 中新增 `Context-Id: <uuid>` trailer

**ContextEntry 格式**參見 `/ccg:context` 命令中的 Schema 定義。

**失敗降級**：若歸檔過程出錯，不阻斷提交。寫入 minimal ContextEntry（僅 summary + files），繼續正常提交。

### ✅ 階段 6：執行提交

`[模式：執行]`

```bash
git commit [-S] [--no-verify] [-s] -F .git/COMMIT_EDITMSG
```

---

## Type 與 Emoji 對映

| Emoji | Type | 說明 |
|-------|------|------|
| ✨ | `feat` | 新增功能 |
| 🐛 | `fix` | 缺陷修復 |
| 📝 | `docs` | 文件更新 |
| 🎨 | `style` | 程式碼格式 |
| ♻️ | `refactor` | 重構 |
| ⚡️ | `perf` | 效能最佳化 |
| ✅ | `test` | 測試相關 |
| 🔧 | `chore` | 構建/工具 |
| 👷 | `ci` | CI/CD |
| ⏪️ | `revert` | 回滾 |

---

## 示例

```bash
# 基本提交
/commit

# 暫存所有並提交
/commit --all

# 帶 emoji 提交
/commit --emoji

# 指定型別和作用域
/commit --scope ui --type feat --emoji

# 修補上次提交
/commit --amend --signoff
```

## 關鍵規則

1. **僅使用 Git** – 不呼叫包管理器
2. **尊重鉤子** – 預設執行，`--no-verify` 可跳過
3. **不改原始碼** – 只讀寫 `.git/COMMIT_EDITMSG`
4. **原子提交** – 一次提交只做一件事
