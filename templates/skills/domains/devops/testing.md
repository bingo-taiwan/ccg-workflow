---
name: testing
description: 軟體測試。單元測試、整合測試、TDD、測試框架。當使用者提到測試、單元測試、pytest、Jest、mock、TDD時使用。
---

# 🔧 煉器秘典 · 軟體測試


## 測試金字塔

```
        /\
       /  \     E2E 測試 (少)
      /----\
     /      \   整合測試 (中)
    /--------\
   /          \ 單元測試 (多)
  --------------
```

## Python (pytest)

```python
import pytest
from myapp import calculate, UserService

# 基礎測試
def test_add():
    assert calculate.add(1, 2) == 3

# 引數化
@pytest.mark.parametrize("a,b,expected", [
    (1, 2, 3),
    (0, 0, 0),
    (-1, 1, 0),
])
def test_add_params(a, b, expected):
    assert calculate.add(a, b) == expected

# Fixture
@pytest.fixture
def user_service():
    service = UserService()
    yield service
    service.cleanup()

def test_create_user(user_service):
    user = user_service.create("test")
    assert user.name == "test"

# Mock
from unittest.mock import Mock, patch

@patch('myapp.requests.get')
def test_fetch(mock_get):
    mock_get.return_value.json.return_value = {"id": 1}
    result = fetch_user(1)
    assert result["id"] == 1

# 非同步測試
@pytest.mark.asyncio
async def test_async_fetch():
    result = await async_fetch()
    assert result is not None
```

### 執行命令
```bash
pytest                      # 執行所有
pytest test_file.py         # 指定檔案
pytest -k "test_add"        # 匹配名稱
pytest -v                   # 詳細輸出
pytest --cov=myapp          # 覆蓋率
pytest -x                   # 失敗即停
```

## JavaScript (Jest/Vitest)

```javascript
import { describe, it, expect, vi } from 'vitest';

// 基礎測試
describe('add', () => {
  it('should add two numbers', () => {
    expect(add(1, 2)).toBe(3);
  });

  it.each([
    [1, 2, 3],
    [0, 0, 0],
    [-1, 1, 0],
  ])('add(%i, %i) = %i', (a, b, expected) => {
    expect(add(a, b)).toBe(expected);
  });
});

// Mock
vi.mock('./api', () => ({
  getUser: vi.fn().mockResolvedValue({ id: 1, name: 'test' })
}));

it('should fetch user', async () => {
  const user = await fetchUser(1);
  expect(user.name).toBe('test');
});

// Spy
const spy = vi.spyOn(console, 'log');
doSomething();
expect(spy).toHaveBeenCalledWith('message');
```

## Go (testing)

```go
package main

import (
    "testing"
    "github.com/stretchr/testify/assert"
)

func TestAdd(t *testing.T) {
    result := Add(1, 2)
    assert.Equal(t, 3, result)
}

// 表驅動測試
func TestAddTable(t *testing.T) {
    tests := []struct {
        name     string
        a, b     int
        expected int
    }{
        {"positive", 1, 2, 3},
        {"zero", 0, 0, 0},
        {"negative", -1, 1, 0},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            assert.Equal(t, tt.expected, Add(tt.a, tt.b))
        })
    }
}

// Benchmark
func BenchmarkAdd(b *testing.B) {
    for i := 0; i < b.N; i++ {
        Add(1, 2)
    }
}
```

## 測試原則

```yaml
FIRST:
  - Fast: 快速執行
  - Independent: 相互獨立
  - Repeatable: 可重複
  - Self-validating: 自驗證
  - Timely: 及時編寫

AAA:
  - Arrange: 準備資料
  - Act: 執行操作
  - Assert: 驗證結果

原則:
  - 每個測試只驗證一件事
  - 測試邊界條件
  - 測試異常情況
  - 避免測試實現細節
```

## TDD 流程

```
紅 → 綠 → 重構

1. 紅: 寫一個失敗的測試
2. 綠: 寫最少程式碼讓測試透過
3. 重構: 最佳化程式碼，保持測試透過
```

---

## 測試策略（源自 testing-strategy）

### 測試金字塔比例

| 層級 | 佔比 | 執行時間 | 成本 |
|------|------|----------|------|
| 單元測試 | 70% | <1s | 低 |
| 整合測試 | 20% | 1-10s | 中 |
| E2E測試 | 10% | 10s-5m | 高 |

### 測試左移 Checklist

```yaml
需求階段: 可測試性評審、驗收標準定義、測試用例設計
開發階段: TDD、單元測試同步編寫、程式碼審查包含測試
提交階段: Pre-commit Hook、本地測試必過、靜態分析
CI階段: 自動化測試、覆蓋率門禁、效能基準測試
```

### 契約測試要點

- 消費者驅動契約 (CDC)：Consumer 定義期望 → Provider 驗證契約
- 工具：Pact（多語言）、Spring Cloud Contract（Java）
- 核心：Provider API <-> Contract <-> Consumer，雙方獨立驗證

### 覆蓋率策略

```yaml
型別: 行覆蓋率、分支覆蓋率、函式覆蓋率、語句覆蓋率
門禁: 全域性 ≥80%，核心模組 ≥90%
排除: tests/、migrations/、__init__.py、config 檔案
```

### 變異測試

- 修改原始碼（變異體）驗證測試是否能捕獲
- 工具：Stryker (JS)、Pitest (Java)
- 閾值：high 80% / low 60% / break 50%

### 測試最佳實踐

- AAA 模式：Arrange → Act → Assert
- 命名：`should [預期行為] when [條件]`
- 單一職責：每個測試只驗證一件事
- 資料隔離：Fixture/Factory 模式，每測試獨立例項
- 並行執行：Jest `maxWorkers: '50%'`、pytest `-n auto`

---

## E2E 測試（源自 e2e-testing）

### Playwright vs Cypress

| 特性 | Playwright | Cypress |
|------|-----------|---------|
| 多瀏覽器 | Chromium/Firefox/WebKit | Chromium/Firefox/Edge |
| 多標籤頁/iframe | 原生支援 | 有限 |
| 並行執行 | 原生支援 | 需付費 |
| 除錯體驗 | 一般 | 優秀 |

### 選擇器優先順序

```
1. data-testid (推薦)
2. role + accessible name
3. 穩定的 class/id
4. 文字內容 (謹慎)
5. CSS/XPath (避免)
```

### E2E Checklist

```yaml
架構:
  - 頁面物件模式 (POM) 封裝頁面操作
  - 測試獨立性：透過 API 準備資料，不依賴其他測試
  - 智慧等待：waitForSelector/waitForResponse，禁止 waitForTimeout

網路:
  - Mock API：page.route() / cy.intercept() 隔離後端
  - 等待響應：waitForResponse 確認資料載入

視覺化迴歸:
  - Playwright: toHaveScreenshot() + mask 動態內容
  - Percy/Chromatic: 雲端截圖對比

認證:
  - Playwright: storageState 複用登入態
  - Cypress: cy.session() 快取會話

CI整合:
  - retries: CI 環境 2 次重試
  - artifacts: 失敗時儲存截圖/影片/trace
```

