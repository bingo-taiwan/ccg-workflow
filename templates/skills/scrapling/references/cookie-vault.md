# Cookie 保險庫

按站點分割槽記錄歷史 cookie，供抓取時快速查詢使用。

> **安全提示**: 此檔案儲存敏感 cookie 值，請勿提交到版本控制或分享給他人。
> 實際使用時，請將此檔案複製為 `cookie-vault.local.md` 並填入真實值。

---

## 示例站點 (example.com)

**最後更新**: YYYY-MM-DD
**狀態**: 有效 / 可能已過期
**登入 cookie 欄位**: `session_id`, `auth_token`
**Fetcher 型別**: StealthyFetcher

### Playwright 格式（StealthyFetcher/DynamicFetcher 用）

```python
cookies = [
    {'name': 'session_id', 'value': '<YOUR_SESSION_ID>', 'domain': '.example.com', 'path': '/'},
    {'name': 'auth_token', 'value': '<YOUR_AUTH_TOKEN>', 'domain': '.example.com', 'path': '/'},
]
```

### 備註

- 從瀏覽器 DevTools > Application > Cookies 獲取真實值
- cookie 有效期取決於站點設定，過期後需重新獲取

---

## 模板：新增新站點

複製以下模板，替換具體內容後追加到此檔案：

```markdown
## 站點名稱 (域名)

**最後更新**: YYYY-MM-DD
**狀態**: 有效 / 可能已過期
**登入 cookie 欄位**: `field1`, `field2`
**Fetcher 型別**: Fetcher / StealthyFetcher / DynamicFetcher

### Playwright 格式

\```python
cookies = [
    {'name': 'field1', 'value': '...', 'domain': '.example.com', 'path': '/'},
]
\```

### 備註

- 相關注意事項
```
