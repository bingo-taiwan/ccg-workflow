---
name: gen-docs
description: 文件生成器。自動分析模組結構，生成 README.md 和 DESIGN.md 骨架。當使用者提到生成文件、建立README、建立DESIGN、文件骨架、文件模板時使用。在新建模組開始時自動觸發。
license: MIT
compatibility: node>=18
user-invocable: true
disable-model-invocation: false
allowed-tools: Bash, Read, Write, Glob
argument-hint: <模組路徑> [--force]
---

# 📝 造典關卡 · 文件生成器


## 核心原則

```
無文件不成模組
文件是模組的身份證
沒有身份證的模組不允許上線
```

## 自動生成

執行文件生成指令碼（跨平臺）：

```bash
# 在 skill 目錄下執行
node scripts/doc_generator.js <模組路徑>
node scripts/doc_generator.js <模組路徑> --force  # 強制覆蓋已存在的文件
node scripts/doc_generator.js <模組路徑> --json   # JSON 輸出
```

## 生成內容

### README.md 骨架

自動生成的 README.md 包含：

- **模組名稱** — 從目錄名提取
- **描述** — 從程式碼文件字串提取（如有）
- **特性列表** — 待填充
- **依賴** — 從 requirements.txt/pyproject.toml 提取
- **使用方法** — 基礎模板
- **API 概覽** — 從程式碼提取類和函式列表
- **目錄結構** — 自動掃描生成

### DESIGN.md 骨架

自動生成的 DESIGN.md 包含：

- **設計概述** — 目標與非目標模板
- **架構設計** — 架構圖佔位符
- **核心元件** — 從程式碼提取類列表
- **設計決策** — 決策記錄表格模板
- **技術選型** — 自動檢測語言和依賴
- **權衡取捨** — 已知限制和技術債務模板
- **安全考量** — 威脅模型和安全措施模板
- **變更歷史** — 初始版本記錄

## 智慧分析

### 支援的語言

| 語言 | 分析能力 |
|------|----------|
| **Python** | 類、函式、文件字串、依賴 |
| **Go** | 目錄結構、依賴 |
| **TypeScript** | 目錄結構、依賴 |
| **Rust** | 目錄結構、依賴 |
| **其他** | 基礎目錄結構 |

### 提取的資訊

- 模組名稱（目錄名）
- 主要程式語言
- 程式碼檔案列表
- 類和函式定義（Python）
- 文件字串（Python）
- 依賴列表
- 入口點檔案

## 自動觸發時機

| 場景 | 觸發條件 |
|------|----------|
| 新建模組 | 模組建立開始時 |
| 缺失文件 | 檢測到模組缺少文件時 |

## 使用流程

```
1. 執行 doc_generator.js 生成骨架
2. 填充 TODO 標記的內容
3. 補充設計決策和理由
4. 新增使用示例
5. 執行 /verify-module 校驗完整性
```

## 生成後檢查清單

### README.md

- [ ] 填充模組描述
- [ ] 補充特性列表
- [ ] 新增使用示例
- [ ] 確認依賴完整

### DESIGN.md

- [ ] 明確設計目標
- [ ] 記錄設計決策
- [ ] 說明技術選型理由
- [ ] 列出已知限制

---
