# 元件模式

## 佈局模板

### 經典佈局模式
聖盃佈局(header/nav/main/aside/footer)、卡片網格、側邊欄、儀表盤。優先使用Grid，Flexbox做一維佈局。

```css
.layout {
  display: grid;
  grid-template:
    "header header" auto
    "nav main" 1fr
    "nav aside" auto
    "footer footer" auto
    / 200px 1fr;
  gap: 1rem;
  min-height: 100vh;
}
@media (max-width: 768px) {
  .layout {
    grid-template: "header" "nav" "main" "aside" "footer" / 1fr;
  }
}
```

### Flexbox卡片網格
```css
.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}
.card {
  flex: 1 1 300px;
  max-width: 400px;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: var(--shadow-2);
}
```

## 響應式設計

### 響應式斷點策略
移動優先：320px基準→640px(sm)→768px(md)→1024px(lg)→1280px(xl)。使用em單位斷點(除以16)。優先容器查詢。

```css
.card-container {
  container-type: inline-size;
}
.card {
  padding: 1rem;
}
@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 150px 1fr;
    gap: 1rem;
  }
}
```

## 互動模式

### 微互動設計原則
反饋即時(<100ms)、過渡流暢(200-300ms)、狀態清晰(hover/active/focus)、減少認知負擔。

```css
.btn {
  transition: all 0.2s ease;
}
.btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-3);
}
.btn:active {
  transform: translateY(0);
}
.btn:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

## 動畫

### CSS關鍵幀動畫
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-in {
  animation: fadeInUp 0.4s ease-out;
}
@media (prefers-reduced-motion: reduce) {
  .animate-in {
    animation: none;
  }
}
```

### Framer Motion模板
```javascript
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" }
};
const stagger = {
  animate: { transition: { staggerChildren: 0.1 } }
};
<motion.div variants={stagger}>
  <motion.div variants={fadeInUp} />
</motion.div>
```

## 表單設計

### 表單UX模式
標籤上置、內聯驗證、清晰錯誤提示、禁用狀態明顯、必填標記、合理分組、自動聚焦首欄位。

```css
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}
.input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}
```

## 卡片元件

### 玻璃擬態卡片
```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

## 導航模式

### 響應式導航欄
```css
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}
.nav-links {
  display: flex;
  gap: 2rem;
}
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  .nav-links.open {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    padding: 1rem;
  }
}
```

## 審查清單

- [ ] 響應式適配
- [ ] 互動狀態完整
- [ ] 無障礙支援
- [ ] 效能最佳化
- [ ] 瀏覽器相容
- [ ] 動畫流暢
