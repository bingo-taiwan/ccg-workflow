---
name: verify-quality
description: 程式碼質量校驗關卡。檢測複雜度、重複程式碼、命名規範、函式長度等質量指標。當使用者提到程式碼質量、複雜度檢查、程式碼異味、重構建議、lint檢查、程式碼規範時使用。在複雜模組、重構完成時自動觸發。
license: MIT
compatibility: node>=18
user-invocable: true
disable-model-invocation: false
allowed-tools: Bash, Read, Glob
argument-hint: <掃描路徑>
---

# ⚖ 校驗關卡 · 程式碼質量


## 核心原則

```
程式碼質量 = 可讀性 + 可維護性 + 可測試性
劣質程式碼是技術債，技術債是道基裂痕
複雜度是 bug 的溫床
```

## 自動檢查

執行質量檢查指令碼（跨平臺）：

```bash
# 在 skill 目錄下執行
node scripts/quality_checker.js <掃描路徑>
node scripts/quality_checker.js <掃描路徑> -v      # 詳細模式
node scripts/quality_checker.js <掃描路徑> --json  # JSON 輸出
```

## 檢測指標

### 複雜度指標

| 指標 | 閾值 | 超標後果 |
|------|------|----------|
| **圈複雜度** | ≤ 10 | 🟠 警告，建議拆分 |
| **函式長度** | ≤ 50 行 | 🟠 警告，建議拆分 |
| **檔案長度** | ≤ 500 行 | 🟡 提示，考慮拆分 |
| **引數數量** | ≤ 5 | 🟠 警告，考慮封裝 |
| **巢狀深度** | ≤ 4 | 🟠 警告，建議重構 |
| **行長度** | ≤ 120 | 🔵 提示 |

### 命名規範

| 型別 | 規範 | 示例 |
|------|------|------|
| **類名** | PascalCase | `UserService`, `HttpClient` |
| **函式名** | snake_case | `get_user`, `process_data` |
| **常量** | UPPER_SNAKE | `MAX_RETRY`, `DEFAULT_TIMEOUT` |
| **變數** | snake_case | `user_id`, `total_count` |

### 程式碼異味

| 異味 | 說明 | 嚴重度 |
|------|------|--------|
| 重複程式碼 | 相似程式碼塊 > 10 行 | 🟠 High |
| 過長引數列表 | 引數 > 5 個 | 🟡 Medium |
| 魔法數字 | 未命名的常量 | 🟡 Medium |
| 死程式碼 | 未使用的函式/變數 | 🔵 Low |
| 註釋程式碼 | 被註釋的程式碼塊 | 🔵 Low |

## 自動觸發時機

| 場景 | 觸發條件 |
|------|----------|
| 複雜模組 | 程式碼行數 > 200 |
| 重構完成 | 重構任務完成時 |
| 程式碼審查 | PR/MR 審查時 |
| 提交前 | 程式碼提交前檢查 |

## 校驗流程

```
1. 掃描程式碼檔案
2. 計算複雜度指標
3. 檢測程式碼異味
4. 驗證命名規範
5. 輸出質量校驗報告
```

## 校驗報告格式

```
## 程式碼質量校驗報告

✓ 透過 | ✗ 未透過

### 複雜度指標
- 平均函式複雜度: N
- 超標函式數: N
- 最大檔案行數: N

### 程式碼異味
- 🟠 High: N
- 🟡 Medium: N
- 🔵 Low: N

### 問題清單

| 檔案 | 行號 | 型別 | 嚴重度 | 描述 |
|------|------|------|--------|------|
| ... | ... | ... | ... | ... |

### 結論
可交付 / 需重構後交付
```

## 重構建議

### 降低複雜度

```python
# 🔴 高複雜度 - 道基不穩
def process(data):
    if condition1:
        if condition2:
            if condition3:
                # 深層巢狀
                pass

# ✅ 低複雜度 - 道基穩固
def process(data):
    if not condition1:
        return
    if not condition2:
        return
    if not condition3:
        return
    # 主邏輯
```

### 消除重複

```python
# 🔴 重複程式碼 - 異端
def func1():
    # 10行相同邏輯
    pass

def func2():
    # 10行相同邏輯
    pass

# ✅ 提取公共函式 - 正道
def common_logic():
    # 公共邏輯
    pass

def func1():
    common_logic()

def func2():
    common_logic()
```

---
