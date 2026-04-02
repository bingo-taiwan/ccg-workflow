# Scrapling 踩坑記錄與解決方案

## ModuleNotFoundError: curl_cffi

**錯誤資訊**: `ModuleNotFoundError: No module named 'curl_cffi'`
**原因**: 安裝了基礎包 `pip install scrapling`，不含抓取依賴
**解決方案**:
```bash
pip install "scrapling[fetchers]"
```

## Cloudflare 403 + "Just a moment"

**錯誤資訊**: 返回 403，頁面內容包含 "Just a moment" 或 "Checking your browser"
**原因**: Fetcher（curl_cffi）無法透過 Cloudflare 驗證
**解決方案**: 換用 StealthyFetcher + `solve_cloudflare=True`
```python
from scrapling.fetchers import StealthyFetcher
page = StealthyFetcher.fetch(url, headless=True, solve_cloudflare=True, timeout=60000)
```

## cf_clearance cookie 無效

**錯誤資訊**: 手動傳入 `cf_clearance` cookie 但仍被 Cloudflare 攔截
**原因**: `cf_clearance` 繫結瀏覽器指紋（TLS/JA3/UA），不可跨客戶端複用
**解決方案**: 不要手動傳 `cf_clearance`，讓 StealthyFetcher 自己透過 Cloudflare 獲取

## Expected array, got object at $.cookies

**錯誤資訊**: `Expected array, got object` at `$.cookies`
**原因**: 瀏覽器 Fetcher（StealthyFetcher/DynamicFetcher）cookie 必須是 `list[dict]`，不能是 `dict`
**解決方案**:
```python
# ❌ 錯誤
cookies = {'name': 'value'}

# ✅ 正確
cookies = [{'name': 'cookie_name', 'value': 'cookie_value', 'domain': '.site.com', 'path': '/'}]
```

## Cookie should have a url or a domain/path pair

**錯誤資訊**: `Cookie should have a url or a domain/path pair`
**原因**: cookie dict 缺少 `domain` 和 `path` 欄位
**解決方案**: 每個 cookie dict 必須包含 `domain`（以 `.` 開頭）和 `path`（通常 `/`）
```python
cookies = [
    {'name': 'token', 'value': 'abc', 'domain': '.example.com', 'path': '/'},
]
```

## 404 "page is private"

**錯誤資訊**: 返回 404，頁面提示內容為私有
**原因**: Cloudflare 已透過，但目標頁面需要登入態
**解決方案**: 帶上登入 cookie（從瀏覽器手動獲取），參見 `cookie-vault.md`
```python
page = StealthyFetcher.fetch(
    url,
    solve_cloudflare=True,
    cookies=[{'name': '_session', 'value': '...', 'domain': '.site.com', 'path': '/'}],
    timeout=60000,
)
```

## Cloudflare 多輪 Turnstile

**現象**: StealthyFetcher 執行時間很長（30-90 秒），日誌顯示多次 Turnstile 驗證
**原因**: 正常現象，Cloudflare 有時需要 2-3 輪驗證
**解決方案**: 耐心等待，確保 `timeout` 足夠長（至少 60000ms）。如果超時失敗，增加到 120000ms 重試

## scrapling: command not found

**錯誤資訊**: `scrapling: command not found`
**原因**: Python Scripts 目錄不在 PATH 中
**解決方案**:
```python
# 方式 1: 使用 python -c
python -c "from scrapling.cli import main; main(['install'])"

# 方式 2: 使用 python -m（如果支援）
python -m scrapling install
```

## StealthyFetcher/DynamicFetcher 報瀏覽器未安裝

**錯誤資訊**: 類似 "browser not found" 或 Playwright/Camoufox 相關錯誤
**原因**: 未安裝瀏覽器依賴
**解決方案**:
```bash
# 安裝 scrapling 瀏覽器依賴
scrapling install
# 或
python -c "from scrapling.cli import main; main(['install'])"
```
