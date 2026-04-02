---
description: '清理 Git 分支：安全清理已合併或過期分支，預設 dry-run 模式'
---

# Clean-Branches - 清理 Git 分支

安全識別並清理已合併或長期未更新的分支。

## 使用方法

```bash
/clean-branches [options]
```

## 選項

| 選項 | 說明 |
|------|------|
| `--base <branch>` | 基準分支（預設 main/master） |
| `--stale <days>` | 清理超過 N 天未更新的分支 |
| `--remote` | 同時清理遠端分支 |
| `--dry-run` | 只預覽，不執行（**預設**） |
| `--yes` | 跳過確認直接刪除 |
| `--force` | 強制刪除未合併分支 |

---

## 執行工作流

### 🔍 階段 1：預檢

`[模式：準備]`

1. 同步遠端：`git fetch --all --prune`
2. 讀取保護分支配置
3. 確定基準分支

### 📋 階段 2：分析識別

`[模式：分析]`

**已合併分支**：
- 已完全合併到 `--base` 的分支

**過期分支**（如指定 `--stale`）：
- 最後提交在 N 天前的分支

**排除**：
- 從待清理列表中移除保護分支

### 📊 階段 3：報告預覽

`[模式：報告]`

```markdown
## 將要刪除的分支

### 已合併分支
- feature/old-feature (合併於 3 天前)
- bugfix/fixed-issue (合併於 7 天前)

### 過期分支
- experiment/old-test (最後更新 90 天前)
```

### ✅ 階段 4：執行清理

`[模式：執行]`

僅在不帶 `--dry-run` 且確認後執行：

```bash
# 本地分支
git branch -d <branch>

# 遠端分支（如果 --remote）
git push origin --delete <branch>

# 強制刪除（如果 --force）
git branch -D <branch>
```

---

## 保護分支配置

```bash
# 新增保護分支
git config --add branch.cleanup.protected develop
git config --add branch.cleanup.protected 'release/*'

# 檢視保護分支
git config --get-all branch.cleanup.protected
```

---

## 示例

```bash
# 預覽將清理的分支
/clean-branches --dry-run

# 清理已合併且超過 90 天未動的分支
/clean-branches --stale 90

# 清理已合併到 release/v2.1 的分支
/clean-branches --base release/v2.1 --remote --yes
```

## 最佳實踐

1. **優先 dry-run** – 先預覽再執行
2. **活用 --base** – 適配 release 工作流
3. **謹慎 --force** – 除非確定無用
4. **團隊協作** – 清理遠端分支前先通知
5. **定期執行** – 每月/季度一次保持清爽
