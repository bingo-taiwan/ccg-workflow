# UI 美學

## 色彩理論

### 色彩體系設計
60-30-10配色法則：主色60%、輔色30%、強調色10%。使用HSL而非RGB便於調整。建立語義化色彩令牌（primary/success/danger）。

```css
:root {
  --primary-h: 220;
  --primary-s: 90%;
  --primary-l: 50%;
  --primary: hsl(var(--primary-h) var(--primary-s) var(--primary-l));
  --primary-dark: hsl(var(--primary-h) var(--primary-s) 40%);
  --primary-light: hsl(var(--primary-h) var(--primary-s) 60%);
}
```

## 排版系統

### 排版層級規範
使用模組化比例（1.25/1.333/1.5）。基準16px，標題用比例放大，正文14-18px。行高1.5-1.8。限制字型族≤3種。

```css
:root {
  --fs-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --fs-h1: clamp(2rem, 1.5rem + 2vw, 3rem);
  --fs-h2: clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem);
}
body {
  font-size: var(--fs-base);
  line-height: 1.6;
}
```

## 間距系統

### 8px網格間距體系
基準8px，建立4/8/12/16/24/32/48/64px間距令牌。元件內用小間距(4-12)，元件間用中間距(16-32)，區塊間用大間距(48+)。

```css
:root {
  --sp-1: 0.25rem; --sp-2: 0.5rem; --sp-3: 0.75rem; --sp-4: 1rem;
  --sp-6: 1.5rem; --sp-8: 2rem; --sp-12: 3rem; --sp-16: 4rem;
}
.stack-sm > * + * { margin-top: var(--sp-2); }
.stack-md > * + * { margin-top: var(--sp-4); }
```

## 視覺層次

### 視覺層次四原則
1. 對比：大小/粗細/顏色差異
2. 對齊：統一對齊建立秩序
3. 重複：一致性建立認知
4. 親密性：相關元素靠近

## 設計令牌

### Design Token架構
三層架構：基礎令牌(顏色/字號原始值)→語義令牌(primary/heading)→元件令牌(button-bg)。

```css
:root {
  --color-gray-50: #f9fafb;
  --color-gray-900: #111827;
  --color-primary: var(--color-blue-600);
  --text-primary: var(--color-gray-900);
  --bg-surface: white;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
}
```

## 暗色模式

### 暗色模式設計規範
背景用深灰(#121212)非純黑。降低白色文字亮度至#e0e0e0。提升表面層級用更亮灰色。注意色彩對比度WCAG AA。

```css
:root { --bg: white; --text: #111; }
@media (prefers-color-scheme: dark) {
  :root { --bg: #121212; --text: #e0e0e0; }
}
[data-theme="dark"] { --bg: #121212; --text: #e0e0e0; }
body { background: var(--bg); color: var(--text); }
```

## 陰影與層級

### 陰影層級體系
5級陰影：1-貼地(1px) 2-懸浮(2-4px) 3-浮起(8-12px) 4-彈出(16-24px) 5-模態(24-32px)。

```css
:root {
  --shadow-1: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-2: 0 2px 4px rgba(0,0,0,0.08);
  --shadow-3: 0 8px 16px rgba(0,0,0,0.12);
  --shadow-4: 0 16px 24px rgba(0,0,0,0.16);
  --shadow-5: 0 24px 32px rgba(0,0,0,0.2);
}
```

## 審查清單

- [ ] 色彩對比度≥4.5:1
- [ ] 字型≤3種
- [ ] 間距符合8px網格
- [ ] 視覺層級清晰
- [ ] 暗色模式適配
- [ ] 陰影層級合理
