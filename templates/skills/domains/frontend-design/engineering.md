---
name: frontend-engineering
description: 前端工程化。效能最佳化（Web Vitals、懶載入、虛擬滾動）、測試（Vitest、Playwright、MSW）、構建工具（Vite、Webpack、esbuild）。當使用者提到效能最佳化、前端測試、構建工具、程式碼分割時使用。
---

# 前端工程化 · Frontend Engineering

## 一、效能最佳化

### Core Web Vitals

| 指標 | 含義 | 目標值 |
|------|------|--------|
| LCP | Largest Contentful Paint | < 2.5s |
| FID | First Input Delay | < 100ms |
| CLS | Cumulative Layout Shift | < 0.1 |
| FCP | First Contentful Paint | < 1.8s |
| TTI | Time to Interactive | < 3.8s |

### 效能決策樹

```
載入慢 → Bundle 大？程式碼分割 + Tree Shaking | 資源多？懶載入 + 預載入 | 網路慢？CDN + 壓縮
渲染慢 → 列表長？虛擬滾動 | 重渲染？React.memo + useMemo | 佈局抖動？固定尺寸
互動慢 → JS 阻塞？Web Worker + startTransition | 動畫卡頓？CSS 動畫 + rAF
```

### 程式碼分割

```typescript
// 路由級別 — React.lazy + Suspense
const Dashboard = lazy(() => import('./pages/Dashboard'))

// 元件級別 — 按需載入重量級元件
const HeavyChart = lazy(() => import('./components/HeavyChart'))

// Vite manualChunks
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui': ['@mui/material'],
        },
      },
    },
  },
})
```

### 虛擬滾動

```typescript
import { FixedSizeList } from 'react-window'

function VirtualList({ items }: { items: Item[] }) {
  return (
    <FixedSizeList height={600} itemCount={items.length} itemSize={50} width="100%">
      {({ index, style }) => <div style={style}>{items[index].name}</div>}
    </FixedSizeList>
  )
}
```

### React 效能要點

```typescript
// memo 避免重渲染
const Row = memo(function Row({ item, onClick }: Props) {
  return <div onClick={() => onClick(item.id)}>{item.name}</div>
})

// useMemo 快取計算 + useCallback 快取回撥
const filtered = useMemo(() => data.filter(x => x.name.includes(q)), [data, q])
const handleClick = useCallback((id: string) => select(id), [])

// startTransition 低優先順序更新
startTransition(() => setResults(heavySearch(query)))
```

### 資源最佳化 Checklist

- 圖片：WebP 格式 + `loading="lazy"` + 響應式 `<picture>`
- 字型：`font-display: swap` + `preload` woff2
- 預載入：`dns-prefetch` → `preconnect` → `preload` → `prefetch`
- 壓縮：Gzip/Brotli + HTTP/2

### 效能監控

```typescript
import { onCLS, onFID, onLCP } from 'web-vitals'
onCLS(sendToAnalytics)
onFID(sendToAnalytics)
onLCP(sendToAnalytics)

// 自定義指標
performance.mark('start')
doWork()
performance.mark('end')
performance.measure('work', 'start', 'end')
```

## 二、測試

### 測試金字塔

```
    /\       E2E (10%) — Playwright
   /--\      整合 (20%) — Testing Library + MSW
  /----\     單元 (70%) — Vitest
```

### Vitest 配置

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      thresholds: { lines: 80, functions: 80, branches: 75 },
    },
  },
})
```

### 單元測試

```typescript
describe('formatCurrency', () => {
  it('formats number', () => expect(formatCurrency(1234.56)).toBe('$1,234.56'))
  it('handles zero', () => expect(formatCurrency(0)).toBe('$0.00'))
})
```

### 元件測試

```typescript
import { render, screen, fireEvent } from '@testing-library/react'

it('calls onClick', () => {
  const fn = vi.fn()
  render(<Button onClick={fn}>Click</Button>)
  fireEvent.click(screen.getByText('Click'))
  expect(fn).toHaveBeenCalledTimes(1)
})
```

### MSW Mock

```typescript
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  http.get('/api/users/:id', ({ params }) =>
    HttpResponse.json({ id: params.id, name: 'John' })
  ),
)
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### Playwright E2E

```typescript
// playwright.config.ts 核心
export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
  webServer: { command: 'npm run dev', url: 'http://localhost:3000' },
})

// Page Object 模式
class LoginPage {
  constructor(private page: Page) {}
  async login(email: string, password: string) {
    await this.page.fill('[name="email"]', email)
    await this.page.fill('[name="password"]', password)
    await this.page.click('[type="submit"]')
  }
}
```

### 測試 Checklist

- 遵循 AAA 模式（Arrange / Act / Assert）
- 測試行為而非實現
- Mock 外部依賴（API、時間）
- 測試邊界條件和錯誤路徑
- CI 中自動執行 + 覆蓋率門禁 80%+

## 三、構建工具

### 選型決策

```
新專案 React/Vue → Vite | Next.js → Turbopack | 零配置 → Parcel
庫開發 → Rollup / esbuild
老專案複雜配置 → 保持 Webpack | 可遷移 → Vite
```

### 工具對比

| 工具 | 冷啟動 | HMR | 生產構建 | 生態 |
|------|--------|-----|----------|------|
| Vite | < 1s | < 100ms | 10-30s | 成熟 |
| Webpack | 10-30s | 1-3s | 30-60s | 最豐富 |
| Turbopack | < 1s | < 100ms | 10-20s | 新興 |
| esbuild | < 1s | N/A | 5-10s | 基礎 |

### Vite 核心配置

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: {
    port: 3000,
    proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true } },
  },
  build: {
    minify: 'terser',
    terserOptions: { compress: { drop_console: true } },
    rollupOptions: {
      output: {
        manualChunks: { 'react-vendor': ['react', 'react-dom'] },
        entryFileNames: 'assets/[name].[hash].js',
      },
    },
  },
  optimizeDeps: { include: ['react', 'react-dom'] },
})
```

### Webpack 生產最佳化要點

```javascript
optimization: {
  minimize: true,
  minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      react: { test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/, priority: 20 },
      vendor: { test: /[\\/]node_modules[\\/]/, priority: 10 },
    },
  },
  runtimeChunk: 'single',
}
```

### Webpack → Vite 遷移要點

1. `npm install -D vite @vitejs/plugin-react`
2. `index.html` 移到根目錄，加 `<script type="module" src="/src/main.tsx">`
3. `REACT_APP_*` → `VITE_*`，`process.env` → `import.meta.env`
4. `require()` → `import`

### 構建 Checklist

- 合理程式碼分割（路由級 + 第三方庫分組）
- Tree Shaking + 壓縮（terser / esbuild）
- 檔名雜湊實現長期快取
- Source map 僅 dev 或 hidden
- 定期 `webpack-bundle-analyzer` / `rollup-plugin-visualizer` 審計
- CI 快取 `node_modules` + 構建產物

## 工具速查

| 類別 | 推薦工具 |
|------|----------|
| 構建 | Vite (新專案) / Webpack (複雜專案) |
| 單元測試 | Vitest |
| 元件測試 | Testing Library |
| E2E | Playwright |
| API Mock | MSW |
| 效能監控 | web-vitals + Lighthouse |
| Bundle 分析 | webpack-bundle-analyzer / rollup-plugin-visualizer |
| 視覺迴歸 | Playwright screenshots / Chromatic |

---
