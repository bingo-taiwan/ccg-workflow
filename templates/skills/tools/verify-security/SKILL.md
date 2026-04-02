---
name: verify-security
description: 安全校驗關卡。自動掃描程式碼安全漏洞，檢測危險模式，確保安全決策有文件記錄。當使用者提到安全掃描、漏洞檢測、安全審計、程式碼安全、OWASP、注入檢測、敏感資訊洩露時使用。在新建模組、安全相關變更、攻防任務、重構完成時自動觸發。
license: MIT
compatibility: node>=18
user-invocable: true
disable-model-invocation: false
allowed-tools: Bash, Read, Grep
argument-hint: <掃描路徑>
---

# ⚖ 校驗關卡 · 安全校驗


## 核心原則

```
安全即道基，破則劫敗
安全決策必須可追溯
Critical/High 問題必須修復後才能交付
```

## 自動掃描

執行安全掃描指令碼（跨平臺）：

```bash
# 在 skill 目錄下執行
node scripts/security_scanner.js <掃描路徑>
node scripts/security_scanner.js <掃描路徑> -v           # 詳細模式
node scripts/security_scanner.js <掃描路徑> --json       # JSON 輸出
node scripts/security_scanner.js <掃描路徑> --exclude vendor  # 排除目錄
```

## 檢測範圍

### 自動檢測的漏洞型別

| 類別 | 檢測項 | 嚴重度 |
|------|--------|--------|
| **注入** | SQL 注入、命令注入、程式碼注入 | 🔴 Critical |
| **敏感資訊** | 硬編碼金鑰、AWS Key、私鑰 | 🔴 Critical |
| **XSS** | innerHTML、dangerouslySetInnerHTML | 🟠 High |
| **反序列化** | pickle.loads、yaml.load | 🟠 High |
| **路徑遍歷** | 未驗證的檔案路徑操作 | 🟠 High |
| **SSRF** | 未驗證的 URL 請求 | 🟠 High |
| **XXE** | 不安全的 XML 解析 | 🟠 High |
| **弱加密** | MD5、SHA1 用於安全場景 | 🟡 Medium |
| **不安全隨機** | random 模組用於安全場景 | 🟡 Medium |
| **除錯程式碼** | console.log、print、debugger | 🔵 Low |

### 文件層面檢查

安全相關程式碼必須在 DESIGN.md 中記錄：

- [ ] **威脅模型** — 防禦哪些攻擊
- [ ] **安全決策** — 為何選擇此方案
- [ ] **安全邊界** — 信任邊界在哪裡
- [ ] **已知風險** — 接受了哪些風險

## 危險模式速查

### Python
```python
# 🔴 危險 - 觸犯道基
eval(), exec(), os.system()
subprocess(..., shell=True)
pickle.loads(), yaml.load()
cursor.execute(f"SELECT * FROM t WHERE id = {id}")

# ✅ 安全替代 - 道基穩固
ast.literal_eval()
subprocess([...], shell=False)
yaml.safe_load()
cursor.execute("SELECT * FROM t WHERE id = %s", (id,))
```

### JavaScript
```javascript
// 🔴 危險 - 觸犯道基
eval(), innerHTML, document.write()
new Function(userInput)

// ✅ 安全替代 - 道基穩固
JSON.parse(), textContent
模板引擎自動轉義
```

### Go
```go
// 🔴 危險 - 觸犯道基
exec.Command("sh", "-c", userInput)
template.HTML(userInput)

// ✅ 安全替代 - 道基穩固
exec.Command("cmd", args...)
html/template 自動轉義
```

## 校驗流程

```
1. 執行 security_scanner.js 自動掃描
2. 分析掃描結果，按嚴重度排序
3. 檢查安全決策是否有文件記錄
4. 輸出安全校驗報告
5. Critical/High 問題必須修復後才能交付
```

## 自動觸發時機

| 場景 | 觸發條件 |
|------|----------|
| 新建模組 | 模組建立完成時 |
| 安全相關變更 | 涉及認證、授權、加密、輸入處理 |
| 攻防任務 | 紅隊/藍隊任務完成時 |
| 重構完成 | 重構任務完成時 |
| 提交前 | 程式碼提交前檢查 |

## 校驗報告格式

```
## 安全校驗報告

✓ 透過 | ✗ 未透過

- 🔴 Critical: N
- 🟠 High: N
- 🟡 Medium: N
- 🔵 Low: N

### 發現問題

| 檔案 | 行號 | 型別 | 嚴重度 | 描述 |
|------|------|------|--------|------|
| ... | ... | ... | ... | ... |

### 結論

可交付 / 需修復後交付
```

---
