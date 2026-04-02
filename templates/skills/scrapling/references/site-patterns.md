# 站點抓取模式經驗庫

每次成功抓取新型別站點後，Agent 應提示使用者是否將經驗追加到此檔案。

---

## Discourse 論壇 (linux.do, meta.discourse.org 等)

**站點特徵**: Cloudflare 保護 + Ember.js SPA + 登入態區分
**推薦 Fetcher**: StealthyFetcher
**關鍵引數**:
- `solve_cloudflare=True` — 必須
- `network_idle=True` — 等待 Ember 渲染完成
- `timeout=60000` — CF 驗證耗時長，至少 60 秒（毫秒單位）
**登入 cookie 欄位**: `_forum_session`, `_t`
**不需要**: `cf_clearance`（StealthyFetcher 自動獲取）
**JSON API**: `/t/topic/{id}.json`（需過 CF 後才可用）
**選擇器參考**:
- 帖子列表: `.topic-post`
- 作者: `[data-user-card]::attr(data-user-card)`
- 內容: `.cooked` → `.get_all_text(strip=True)`

---

## 靜態部落格/文件站 (GitHub Pages, Hugo, Jekyll)

**站點特徵**: 純靜態 HTML，無 JS 渲染依賴，無反爬
**推薦 Fetcher**: Fetcher（最快）
**關鍵引數**: `impersonate='chrome'`, `timeout=30`
**選擇器參考**: `article`, `.content`, `.post-body`

---

## SPA 應用 (React/Vue/Next.js)

**站點特徵**: JS 渲染，內容不在初始 HTML 中
**推薦 Fetcher**: DynamicFetcher
**關鍵引數**:
- `network_idle=True` — 等待 API 請求完成
- `wait_selector='.content-loaded'` — 等待關鍵元素（按實際調整）
- `disable_resources=True` — 跳過字型/圖片加速
**備註**: 優先檢查是否有 API 端點可直接用 Fetcher 請求（更快更穩定）

---

## API 端點 (REST/GraphQL)

**站點特徵**: 返回 JSON，無需解析 HTML
**推薦 Fetcher**: Fetcher
**關鍵引數**: `impersonate='chrome'`, 自定義 `headers`
**處理方式**: `page.text` 獲取 JSON → `json.loads()` 解析
**備註**: 如果 API 有反爬，可能需要帶 Referer/Origin 等 header

---

## TAPD 專案管理 (tapd.cn)

**站點特徵**: React SPA + 企業登入態 + 分頁懶載入（"展開更多"按鈕）
**推薦方案**: Playwright 直接控制（非 scrapling Fetcher）
**原因**: DynamicFetcher 可渲染首屏但無法點選互動；scrapling Fetcher 調 API 時 `page.text` 始終為空；curl 可達 API 但返回 500（需瀏覽器環境的 CSRF 校驗）
**關鍵流程**:
1. Playwright + cookies 載入頁面，`wait_until='networkidle'`
2. 迴圈點選"展開更多"按鈕載入全部資料
3. `page.inner_text('body')` 提取純文字，按行解析
**Cookie 格式**: `list[dict]`，必填 `name/value/domain/path`，domain 為 `.tapd.cn`
**API 端點**（參考，瀏覽器內部使用）: `POST /api/my_worktable/my_worktable/get_my_worktable_by_page`
**CSRF**: cookie `dsc-token` 的值需作為 `DSC-TOKEN` header 傳送（由 axios interceptor 自動新增）
**已知限制**: scrapling Fetcher 對 TAPD API 返回空響應（`page.text` 為空），需用 Playwright 或 curl
**資料結構**: 文字按行排列，型別字首(P/E/PROGRAM/TEST/BUG) → 標題 → 狀態 → 優先順序 → ...

---

## 模板：新增新站點模式

複製以下模板，替換具體內容後追加到此檔案：

```markdown
## 站點名稱/型別 (代表域名)

**站點特徵**: 描述
**推薦 Fetcher**: Fetcher / StealthyFetcher / DynamicFetcher
**關鍵引數**:
- `引數名=值` — 說明
**選擇器參考**: CSS 選擇器示例
**備註**: 踩坑經驗
```
