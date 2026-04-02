# Scrapling 安裝與維護

## 安裝層級

| 安裝命令 | 包含內容 |
|---------|---------|
| `pip install scrapling` | 僅核心解析器（Selector），無網路抓取能力 |
| `pip install "scrapling[fetchers]"` | + Fetcher/StealthyFetcher/DynamicFetcher（curl_cffi, Playwright, Camoufox） |
| `pip install "scrapling[ai]"` | + AI 功能（transformers） |
| `pip install "scrapling[shell]"` | + 互動式 shell |
| `pip install "scrapling[all]"` | 全部功能 |

**推薦**: 大多數場景使用 `scrapling[fetchers]` 即可。

## 檢查安裝狀態

```bash
# 檢視版本
pip show scrapling

# 驗證基礎包可用
python -c "from scrapling.parser import Selector; print('Parser OK')"

# 驗證 Fetcher 可用（需要 [fetchers]）
python -c "from scrapling.fetchers import Fetcher; print('Fetcher OK')"

# 驗證 StealthyFetcher 可用
python -c "from scrapling.fetchers import StealthyFetcher; print('StealthyFetcher OK')"

# 驗證 DynamicFetcher 可用
python -c "from scrapling.fetchers import DynamicFetcher; print('DynamicFetcher OK')"
```

## 安裝瀏覽器依賴

StealthyFetcher 和 DynamicFetcher 需要瀏覽器引擎，安裝後需執行:

```bash
# 方式 1: 直接命令（PATH 包含 Scripts 目錄時）
scrapling install

# 方式 2: 透過 Python 呼叫（推薦，避免 PATH 問題）
python -c "from scrapling.cli import main; main(['install'])"
```

## 升級

```bash
pip install --upgrade "scrapling[fetchers]"
```

升級後建議重新驗證三個 Fetcher 是否可用（見上方檢查命令）。

## 三 Fetcher 完整驗證指令碼

```python
#!/usr/bin/env python3
"""驗證 scrapling 三個 Fetcher 均可正常使用"""
import scrapling

print(f"scrapling version: {scrapling.__version__}")

# 1. Fetcher (curl_cffi)
from scrapling.fetchers import Fetcher
page = Fetcher.get("https://httpbin.org/get", impersonate='chrome', timeout=15)
print(f"Fetcher: status={page.status}")

# 2. StealthyFetcher (Camoufox)
from scrapling.fetchers import StealthyFetcher
page = StealthyFetcher.fetch("https://httpbin.org/get", headless=True, timeout=30000)
print(f"StealthyFetcher: status={page.status}")

# 3. DynamicFetcher (Playwright)
from scrapling.fetchers import DynamicFetcher
page = DynamicFetcher.fetch("https://httpbin.org/get", headless=True, timeout=30000)
print(f"DynamicFetcher: status={page.status}")

print("\nAll Fetchers verified successfully")
```
