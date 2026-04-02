---
name: git-workflow
description: Git 版本控制。分支管理、合併策略、GitHub工作流。當使用者提到 Git、分支、merge、rebase、PR、GitHub時使用。
---

# 🔧 煉器秘典 · Git 工作流


## 基礎命令

```bash
# 初始化
git init
git clone <url>

# 日常操作
git add <file>
git commit -m "message"
git push origin main
git pull origin main

# 狀態檢視
git status
git log --oneline -10
git diff
git diff --staged
```

## 分支管理

```bash
# 建立切換
git branch feature-x
git checkout feature-x
git checkout -b feature-x  # 建立並切換

# 檢視
git branch -a   # 所有分支
git branch -vv  # 詳細資訊

# 刪除
git branch -d feature-x     # 已合併
git branch -D feature-x     # 強制刪除
git push origin --delete feature-x  # 遠端
```

## 分支策略

### Git Flow
```
main ─────────────────────────────────────────
  │                                    ↑
  └─ develop ─────────────────────────┬─
       │         ↑         ↑          │
       └─ feature/xxx ─────┘          │
       └─ release/1.0 ────────────────┘
       └─ hotfix/xxx ─────────────────┘
```

### GitHub Flow
```
main ─────────────────────────────────────────
  │              ↑
  └─ feature ────┘ (PR + Review + Merge)
```

### Trunk Based
```
main ─────────────────────────────────────────
  │    ↑    ↑    ↑
  └────┴────┴────┘ (短生命週期分支)
```

## 合併策略

```bash
# Merge (保留歷史)
git checkout main
git merge feature-x

# Rebase (線性歷史)
git checkout feature-x
git rebase main
git checkout main
git merge feature-x

# Squash (壓縮提交)
git merge --squash feature-x
git commit -m "Feature X"
```

## 衝突解決

```bash
# 1. 拉取最新
git fetch origin
git rebase origin/main

# 2. 解決衝突
# 編輯衝突檔案，刪除 <<<< ==== >>>> 標記

# 3. 繼續
git add .
git rebase --continue

# 放棄
git rebase --abort
```

## 撤銷操作

```bash
# 撤銷工作區修改
git checkout -- <file>
git restore <file>

# 撤銷暫存
git reset HEAD <file>
git restore --staged <file>

# 撤銷提交
git reset --soft HEAD~1   # 保留修改
git reset --hard HEAD~1   # 丟棄修改
git revert <commit>       # 新提交撤銷

# 修改最後提交
git commit --amend
```

## Commit 規範

```yaml
格式: <type>(<scope>): <subject>

型別:
  - feat: 新功能
  - fix: 修復
  - docs: 文件
  - style: 格式
  - refactor: 重構
  - test: 測試
  - chore: 構建/工具

示例:
  - feat(auth): add JWT authentication
  - fix(api): handle null response
  - docs(readme): update installation guide
```

## GitHub 工作流

```bash
# Fork 工作流
1. Fork 倉庫
2. git clone <your-fork>
3. git remote add upstream <original>
4. git checkout -b feature
5. 開發 & 提交
6. git push origin feature
7. 建立 PR

# 同步上游
git fetch upstream
git rebase upstream/main
git push origin main
```

## 安全規範

```yaml
禁止:
  - git push --force (除非明確要求)
  - git reset --hard (除非明確要求)
  - git clean -f

必須:
  - commit 前 git status 確認
  - 使用具體檔名 add
  - 每次 commit 聚焦單一變更
```

