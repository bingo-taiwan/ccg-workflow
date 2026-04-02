---
description: '互動式 Git 回滾：安全回滾分支到歷史版本，支援 reset/revert 模式'
---

# Rollback - 互動式 Git 回滾

安全地將分支回滾到指定歷史版本，預設 dry-run 模式。

## 使用方法

```bash
/rollback [options]
```

## 選項

| 選項 | 說明 |
|------|------|
| `--branch <branch>` | 要回滾的分支 |
| `--target <rev>` | 目標版本（commit/tag/reflog） |
| `--mode reset\|revert` | 回滾模式 |
| `--depth <n>` | 列出最近 n 個版本（預設 20） |
| `--dry-run` | 只預覽，不執行（**預設**） |
| `--yes` | 跳過確認直接執行 |

---

## 執行工作流

### 🔍 階段 1：同步遠端

`[模式：準備]`

```bash
git fetch --all --prune
```

### 📋 階段 2：選擇分支

`[模式：選擇]`

1. 列出本地 + 遠端分支
2. 過濾受保護分支
3. 使用者選擇或使用 `--branch` 引數

### 📜 階段 3：選擇版本

`[模式：選擇]`

1. 顯示最近 N 個版本（`git log --oneline`）
2. 顯示相關 tags（`git tag --merged`）
3. 使用者選擇或使用 `--target` 引數

### ⚙️ 階段 4：選擇模式

`[模式：決策]`

| 模式 | 說明 | 推送方式 |
|------|------|----------|
| `reset` | 硬回滾，改變歷史 | `--force-with-lease` |
| `revert` | 生成反向提交，保留歷史 | 普通 push |

### ⛔ 階段 5：最終確認

`[模式：確認]`

顯示即將執行的命令，等待使用者確認（除非 `--yes`）。

### ✅ 階段 6：執行回滾

`[模式：執行]`

**reset 模式**：
```bash
git switch <branch>
git reset --hard <target>
```

**revert 模式**：
```bash
git switch <branch>
git revert --no-edit <target>..HEAD
```

---

## 安全護欄

1. **備份**：執行前自動記錄當前 HEAD 到 reflog
2. **保護分支**：`main`/`master`/`production` 需額外確認
3. **dry-run 預設**：防止誤操作
4. **禁止 --force**：如需強推，手動執行

---

## 示例

```bash
# 全互動模式（dry-run）
/rollback

# 指定分支
/rollback --branch dev

# 完整指定，一鍵執行
/rollback --branch main --target v1.2.0 --mode reset --yes

# 生成反向提交
/rollback --branch release/v2.1 --target v2.0.5 --mode revert
```

## 注意事項

- **reset vs revert**：reset 改變歷史，需強推；revert 更安全
- **LFS/子模組**：回滾前確保狀態一致
- **CI 觸發**：回滾後可能自動觸發流水線
