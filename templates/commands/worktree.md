---
description: '管理 Git Worktree：在 ../.ccg/專案名/ 目錄建立，支援 IDE 整合和內容遷移'
---

# Worktree - Git Worktree 管理

在結構化目錄管理 Git worktree，支援智慧預設和 IDE 整合。

## 使用方法

```bash
/worktree <add|list|remove|prune|migrate> [options]
```

## 子命令

| 命令 | 說明 |
|------|------|
| `add <path>` | 建立新 worktree |
| `list` | 列出所有 worktree |
| `remove <path>` | 刪除指定 worktree |
| `prune` | 清理無效引用 |
| `migrate <target>` | 遷移內容到目標 worktree |

## 選項

| 選項 | 說明 |
|------|------|
| `-b <branch>` | 建立新分支 |
| `-o, --open` | 建立後用 IDE 開啟 |
| `--from <source>` | 遷移源路徑 |
| `--stash` | 遷移 stash 內容 |
| `--track` | 跟蹤遠端分支 |
| `--detach` | 分離 HEAD |
| `--lock` | 鎖定 worktree |

---

## 目錄結構

```
parent-directory/
├── your-project/           # 主專案
│   ├── .git/
│   └── src/
└── .ccg/                   # worktree 管理目錄
    └── your-project/
        ├── feature-ui/     # 功能分支
        ├── hotfix/         # 修復分支
        └── debug/          # 除錯 worktree
```

---

## 執行工作流

### Add - 建立 Worktree

`[模式：建立]`

1. 驗證 Git 倉庫
2. 計算路徑：`../.ccg/專案名/<path>`
3. 建立 worktree
4. 自動複製環境檔案（`.env` 等）
5. 可選：用 IDE 開啟

### Migrate - 遷移內容

`[模式：遷移]`

1. 驗證源有未提交內容
2. 確保目標乾淨
3. 顯示即將遷移的改動
4. 安全遷移
5. 確認結果

---

## 示例

```bash
# 基本建立
/worktree add feature-ui

# 建立並用 IDE 開啟
/worktree add feature-ui -o

# 建立指定分支
/worktree add hotfix -b fix/login -o

# 遷移未提交內容
/worktree migrate feature-ui --from main

# 遷移 stash 內容
/worktree migrate feature-ui --stash

# 管理操作
/worktree list
/worktree remove feature-ui
/worktree prune
```

## 輸出示例

```
✅ Worktree created at ../.ccg/專案名/feature-ui
✅ 已複製 .env
✅ 已複製 .env.local
📋 已從 .gitignore 複製 2 個環境檔案
🖥️ 是否在 IDE 中開啟？[y/n]: y
🚀 正在用 VS Code 開啟...
```

---

## 智慧特性

1. **智慧預設** – 未指定分支時使用路徑名
2. **IDE 整合** – 自動檢測 VS Code / Cursor / WebStorm
3. **環境檔案** – 自動複製 `.gitignore` 中的 `.env` 檔案
4. **路徑安全** – 始終使用絕對路徑防止巢狀問題
5. **分支保護** – 驗證分支未被其他地方使用

## 注意事項

- Worktree 共享 `.git` 目錄，節省磁碟空間
- 遷移僅限未提交改動，已提交內容用 `git cherry-pick`
- 支援 Windows、macOS、Linux
