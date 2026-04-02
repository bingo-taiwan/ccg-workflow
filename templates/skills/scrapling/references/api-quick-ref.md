# Scrapling API 速查卡

## Fetcher（基於 curl_cffi，最快）

```python
from scrapling.fetchers import Fetcher

# GET 請求
page = Fetcher.get(url, impersonate='chrome', timeout=30, headers=None, cookies=None)

# POST 請求
page = Fetcher.post(url, data=None, json=None, impersonate='chrome', timeout=30)
```

**Cookie 格式**: `dict` — `{'name': 'value'}`
**超時單位**: 秒

## FetcherSession（保持會話 cookie）

```python
from scrapling.fetchers import FetcherSession

with FetcherSession(impersonate='chrome') as s:
    s.post(login_url, data={'user': '...', 'pass': '...'})
    page = s.get(target_url)
```

## StealthyFetcher（Camoufox，繞過反爬）

```python
from scrapling.fetchers import StealthyFetcher

page = StealthyFetcher.fetch(
    url,
    headless=True,           # 無頭模式
    solve_cloudflare=True,   # 自動過 Cloudflare
    cookies=None,            # list[dict] 格式
    timeout=60000,           # 毫秒
    network_idle=True,       # 等待網路空閒
    hide_canvas=True,        # 隱藏 canvas 指紋
    block_webrtc=True,       # 阻止 WebRTC 洩露 IP
    disable_resources=False, # 禁用圖片/字型加速
)
```

**Cookie 格式**: `list[dict]` — `[{'name': 'n', 'value': 'v', 'domain': '.site.com', 'path': '/'}]`
**超時單位**: 毫秒

## DynamicFetcher（Playwright，JS 渲染）

```python
from scrapling.fetchers import DynamicFetcher

page = DynamicFetcher.fetch(
    url,
    headless=True,
    cookies=None,            # list[dict] 格式
    timeout=30000,           # 毫秒
    network_idle=True,       # 等待網路空閒
    wait_selector=None,      # 等待特定元素出現
    disable_resources=True,  # 跳過圖片/字型/CSS 加速
)
```

**Cookie 格式**: `list[dict]`
**超時單位**: 毫秒

## Selector（純 HTML 解析，無網路請求）

```python
from scrapling.parser import Selector

page = Selector(html_string, url='https://base-url.com')
```

## Response 常用屬性

```python
page.status          # HTTP 狀態碼 (int)
page.text            # 原始 HTML/文字內容 (str)
page.url             # 最終 URL（可能經過重定向）
page.cookies         # 響應 cookie
page.headers         # 響應頭
```

## 選擇器方法

```python
# CSS 選擇器
page.css('div.content')              # 返回元素列表
page.css_first('h1')                 # 返回第一個匹配元素

# XPath 選擇器
page.xpath('//div[@class="content"]')

# 文字提取偽元素
page.css('h1::text')                 # 提取文字內容
page.css('a::attr(href)')            # 提取屬性值

# 獲取所有匹配結果的文字
results = page.css('h1::text').getall()  # list[str]

# 獲取第一個匹配結果的文字
result = page.css('h1::text').get()      # str | None
```

## 元素方法

```python
element = page.css_first('div.post')

element.text                          # 直接子文字
element.get_all_text(strip=True)      # 遞迴獲取所有文字
element.attrib                        # 屬性字典
element.attrib.get('href')            # 獲取單個屬性
element.css('span.author::text')      # 在子樹中繼續選擇
element.parent                        # 父元素
element.children                      # 子元素列表
```

## 正則提取

```python
# 從文字中提取匹配
page.re(r'price: \$(\d+\.\d+)')      # list[str] — 所有匹配
page.re_first(r'price: \$(\d+\.\d+)')  # str | None — 第一個匹配
```
