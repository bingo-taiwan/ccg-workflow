---
name: code-audit
description: 程式碼安全審計。危險函式識別、汙點分析、漏洞挖掘、安全審計。當使用者提到程式碼審計、安全審計、漏洞挖掘、危險函式、sink點、source點、汙點分析時使用。
---

# 🔥 赤焰秘典 · 程式碼安全審計 (Code Audit)


## 審計流程

```
┌─────────────────────────────────────────────────────────────┐
│                    程式碼審計流程                               │
├─────────────────────────────────────────────────────────────┤
│  1. 資訊收集                                                 │
│  ├─ 識別語言、框架、依賴                                     │
│  ├─ 定位入口點（路由、API、使用者輸入）                        │
│  └─ 梳理資料流向                                             │
│                        ↓                                     │
│  2. 危險函式掃描                                             │
│  ├─ 命令執行 Sink                                            │
│  ├─ SQL 注入 Sink                                            │
│  ├─ 檔案操作 Sink                                            │
│  └─ 反序列化 Sink                                            │
│                        ↓                                     │
│  3. 汙點分析                                                 │
│  └─ Source (使用者輸入) → 傳播路徑 → Sink (危險函式)          │
│                        ↓                                     │
│  4. 漏洞驗證 & 報告                                          │
│  └─ PoC 編寫 → 影響評估 → 修復建議                          │
└─────────────────────────────────────────────────────────────┘
```

## 危險函式速查

### Python
```python
# 🔴 命令執行
os.system(cmd)
os.popen(cmd)
subprocess.call(cmd, shell=True)
subprocess.Popen(cmd, shell=True)
eval(user_input)
exec(user_input)

# 🔴 SQL 注入
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
cursor.execute("SELECT * FROM users WHERE id = " + user_id)

# 🔴 反序列化
pickle.loads(user_data)
yaml.load(user_data)  # 不安全
marshal.loads(user_data)

# 🔴 檔案操作
open(user_path, 'r')  # 路徑穿越
shutil.copy(user_src, user_dst)

# 🔴 SSRF
requests.get(user_url)
urllib.request.urlopen(user_url)

# ✅ 安全替代
subprocess.run([cmd, arg1, arg2], shell=False)
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
yaml.safe_load(user_data)
```

### Java
```java
// 🔴 命令執行
Runtime.getRuntime().exec(userInput);
new ProcessBuilder(userInput).start();

// 🔴 SQL 注入
Statement stmt = conn.createStatement();
stmt.execute("SELECT * FROM users WHERE id = " + userId);

// 🔴 反序列化
ObjectInputStream ois = new ObjectInputStream(userInputStream);
ois.readObject();

// 🔴 SSRF
new URL(userUrl).openConnection();
HttpClient.newHttpClient().send(request);

// 🔴 XXE
DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(userXml);

// ✅ 安全替代
PreparedStatement pstmt = conn.prepareStatement("SELECT * FROM users WHERE id = ?");
pstmt.setInt(1, userId);
```

### JavaScript/Node.js
```javascript
// 🔴 命令執行
child_process.exec(userInput);
eval(userInput);
new Function(userInput)();

// 🔴 原型汙染
Object.assign(target, userInput);
_.merge(target, userInput);
JSON.parse(userInput);  // 配合 __proto__

// 🔴 SQL 注入
db.query(`SELECT * FROM users WHERE id = ${userId}`);

// 🔴 XSS
element.innerHTML = userInput;
document.write(userInput);

// ✅ 安全替代
child_process.execFile(cmd, [arg1, arg2]);
db.query("SELECT * FROM users WHERE id = ?", [userId]);
element.textContent = userInput;
```

### Go
```go
// 🔴 命令執行
exec.Command("sh", "-c", userInput).Run()

// 🔴 SQL 注入
db.Query("SELECT * FROM users WHERE id = " + userId)

// 🔴 路徑穿越
filepath.Join(baseDir, userPath)  // 未校驗 ..

// 🔴 SSTI
template.HTML(userInput)

// ✅ 安全替代
exec.Command(cmd, arg1, arg2).Run()
db.Query("SELECT * FROM users WHERE id = ?", userId)
```

## 汙點分析

### 概念
```
Source (汙點源)     →    傳播路徑    →    Sink (匯聚點)
使用者可控輸入              資料流轉          危險函式呼叫
```

### Source 識別
```python
# HTTP 請求引數
request.args.get('param')
request.form.get('param')
request.json.get('param')
request.headers.get('header')
request.cookies.get('cookie')

# 檔案輸入
open(file).read()
sys.stdin.read()

# 環境變數
os.environ.get('VAR')

# 資料庫查詢結果（二次注入）
cursor.fetchone()
```

### 傳播追蹤
```python
# 示例：追蹤汙點傳播
user_input = request.args.get('id')  # Source
processed = user_input.strip()        # 傳播
query = f"SELECT * FROM users WHERE id = {processed}"  # 傳播
cursor.execute(query)                  # Sink!
```

## 快速掃描命令

```bash
# Python 危險函式
grep -rn "eval\|exec\|os.system\|subprocess\|pickle.loads" --include="*.py" .

# Java 危險函式
grep -rn "Runtime.exec\|ProcessBuilder\|ObjectInputStream\|Statement.execute" --include="*.java" .

# JavaScript 危險函式
grep -rn "eval\|child_process\|innerHTML\|document.write" --include="*.js" .

# Go 危險函式
grep -rn "exec.Command\|template.HTML" --include="*.go" .

# SQL 注入模式
grep -rn "execute.*+\|execute.*f\"\|Query.*+" --include="*.py" --include="*.java" .
```

## 漏洞報告格式

```markdown
## [漏洞型別] - [嚴重程度: Critical/High/Medium/Low]

**檔案:** `path/to/file.py:行號`

**漏洞程式碼:**
```python
# 有問題的程式碼片段
user_id = request.args.get('id')
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
```

**漏洞原理:**
使用者輸入直接拼接到 SQL 語句中，未經過濾或引數化，導致 SQL 注入。

**汙點追蹤:**
```
request.args.get('id')  [Source]
    ↓
f"SELECT ... {user_id}" [傳播]
    ↓
cursor.execute(query)   [Sink]
```

**PoC:**
```
GET /api/users?id=1' OR '1'='1
```

**修復建議:**
```python
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
```
```

## 審計檢查清單

### 輸入驗證
- [ ] 所有使用者輸入是否經過驗證
- [ ] 是否使用白名單驗證
- [ ] 是否有長度限制

### SQL 注入
- [ ] 是否使用引數化查詢
- [ ] 是否有 ORM 保護
- [ ] 動態表名/列名是否白名單

### 命令注入
- [ ] 是否避免 shell=True
- [ ] 引數是否正確轉義
- [ ] 是否使用白名單命令

### 檔案操作
- [ ] 路徑是否規範化
- [ ] 是否檢查路徑穿越
- [ ] 檔案型別是否驗證

### 認證授權
- [ ] 敏感操作是否驗證身份
- [ ] 是否有越權檢查
- [ ] 會話管理是否安全

### 加密
- [ ] 是否使用安全演算法
- [ ] 金鑰管理是否安全
- [ ] 是否有硬編碼金鑰

---

