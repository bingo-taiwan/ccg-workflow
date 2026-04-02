---
name: scrapling
description: "使用 scrapling 進行網頁抓取和資料提取。自動選擇 Fetcher，支援 Cloudflare/WAF 繞過、Session 登入、HTML 解析。當使用者提到 scrape/crawl/fetch page/extract data/爬取/抓取/繞過Cloudflare/解析HTML/批次採集 時觸發。"
user-invocable: true
allowed-tools: Read, Bash
argument-hint: "[URL or scraping task description]"
license: MIT
---

# Scrapling 網頁抓取 Skill

## 步驟 0：檢查版本

```bash
pip show scrapling
```

- 未安裝 → 執行 `pip install "scrapling[fetchers]"` + `scrapling install`
- 有新版 → 執行 `pip install --upgrade "scrapling[fetchers]"` → 查 changelog 告知使用者
- 已最新 → 繼續

## 步驟 1：選擇 Fetcher

```
目標網站 →
│
├─ 已有 HTML 字串/檔案，只需解析?
│   → Selector（純解析，無網路請求）
│   → 模板: templates/parse_only.py
│
├─ 靜態頁面，無 JS 渲染，無反爬?
│   → Fetcher（最快，基於 curl_cffi）
│   → 模板: templates/basic_fetch.py
│
├─ 需要登入（HTTP 表單，非 JS 登入）?
│   → FetcherSession（保持會話 cookie）
│   → 模板: templates/session_login.py
│
├─ 有 Cloudflare / WAF 保護?
│   → StealthyFetcher（Camoufox 瀏覽器，自動過 CF）
│   → 模板: templates/stealth_cloudflare.py
│
├─ SPA 應用（React/Vue），需要 JS 渲染?
│   → DynamicFetcher（Playwright 瀏覽器）
│   → 基於模板即時生成
│
└─ 不確定?
    → 先用 Fetcher 試，403/空內容 → 升級到 StealthyFetcher
```

## 步驟 2：執行工作流

```
1. 檢查版本（步驟 0）
2. 查閱 references/site-patterns.md — 匹配已有模式則直接複用
3. 無匹配 → 用決策樹選擇 Fetcher
4. 讀取對應模板 → 替換引數 → 生成完整指令碼
5. 執行指令碼 → 返回結果
6. **沉澱經驗（必做）**:
   - 新站點 → 追加到 site-patterns.md
   - 新 cookie / 使用者提供了 cookie → 儲存到 cookie-vault.md
   - **完成抓取後必須檢查**：是否有新的 cookie 或 site pattern 需要儲存
```

## Cookie 格式速查

| Fetcher 型別 | Cookie 格式 | 示例 |
|-------------|-------------|------|
| Fetcher / FetcherSession | `dict` | `{'name': 'value', 'token': 'abc'}` |
| StealthyFetcher / DynamicFetcher | `list[dict]` | `[{'name': 'n', 'value': 'v', 'domain': '.site.com', 'path': '/'}]` |

**瀏覽器 Fetcher cookie 必填欄位**: `name`, `value`, `domain`, `path`

## 超時單位速查

| Fetcher 型別 | 超時單位 | 示例 |
|-------------|---------|------|
| Fetcher / FetcherSession | 秒 | `timeout=30` |
| StealthyFetcher / DynamicFetcher | 毫秒 | `timeout=60000` |

## 模板索引

| 模板 | 檔案 | 何時讀取 |
|------|------|---------|
| 基礎 HTTP 抓取 | `templates/basic_fetch.py` | 目標為靜態頁面，無反爬 |
| Cloudflare 繞過 | `templates/stealth_cloudflare.py` | 目標有 CF/WAF 保護 |
| Session 登入 | `templates/session_login.py` | 需 HTTP 表單登入後抓取 |
| 純 HTML 解析 | `templates/parse_only.py` | 已有 HTML 字串，只需提取資料 |

## References 索引

| 檔案 | 何時讀取 |
|------|---------|
| `references/site-patterns.md` | **每次抓取前先查閱** — 檢查目標站點是否有已記錄的模式 |
| `references/api-quick-ref.md` | 生成指令碼時查閱 — Fetcher/Selector 方法簽名和引數 |
| `references/troubleshooting.md` | 執行報錯時查閱 — 按錯誤資訊查詢原因和解決方案 |
| `references/cookie-vault.md` | 需要登入 cookie 時查閱 — 檢查是否有歷史記錄可複用 |
| `references/maintenance.md` | 安裝/升級/依賴問題時查閱 — 安裝層級和驗證命令 |
