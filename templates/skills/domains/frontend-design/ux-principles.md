# UX 原則

## 可用性

### Nielsen十大可用性原則
1. 系統狀態可見
2. 系統匹配現實
3. 使用者控制自由
4. 一致性標準
5. 防錯
6. 識別優於回憶
7. 靈活高效
8. 美學簡約
9. 幫助識別錯誤
10. 幫助文件

## 無障礙

### WCAG 2.1速查
- **可感知**：文字替代、時基媒體、適配性、可辨別
- **可操作**：鍵盤、足夠時間、無癲癇、導航
- **可理解**：可讀、可預測、輸入輔助
- **健壯**：相容性

### ARIA標籤最佳實踐
```html
<button aria-label="關閉對話方塊">
  <svg aria-hidden="true">...</svg>
</button>
<nav aria-label="主導航">
  <ul role="list">...</ul>
</nav>
<div role="alert" aria-live="assertive">錯誤訊息</div>
```

### 鍵盤導航支援
```javascript
element.addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    handleClick();
  }
  if (e.key === "Escape") {
    closeModal();
  }
});
element.setAttribute("tabindex", "0");
```

## 資訊架構

### 資訊架構設計模式
- 層級結構(樹形)
- 順序結構(線性)
- 矩陣結構(網格)
- 資料庫結構(標籤)

導航深度≤3層，廣度5±2項。

## 使用者流程

### 使用者流程設計原則
減少步驟、清晰進度、允許跳過、儲存狀態、提供退出、即時反饋。關鍵流程≤3步。

## 載入體驗

### 骨架屏與載入策略
優先順序：骨架屏>進度條>載入動畫>空白。首屏<1s，互動<100ms，載入>1s顯示進度。

```css
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
}
@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

## 反饋設計

### 使用者反饋模式
- **Toast**(臨時提示)
- **Alert**(重要警告)
- **Modal**(阻斷操作)
- **Inline**(表單驗證)

成功綠、警告黃、錯誤紅、資訊藍。

```css
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: var(--shadow-4);
  animation: slideInRight 0.3s ease;
}
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

## 移動端優先

### 移動端設計原則
觸控目標≥44px、拇指熱區、避免懸停、簡化導航、減少輸入、最佳化效能、考慮單手操作。

```css
.btn-touch {
  min-height: 44px;
  min-width: 44px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
@media (hover: hover) {
  .btn-touch:hover {
    background: var(--primary-dark);
  }
}
```

## 效能感知

### 感知效能最佳化
骨架屏、樂觀更新、預載入、懶載入、漸進增強。讓使用者感覺快比實際快更重要。

## 審查清單

- [ ] 符合Nielsen原則
- [ ] WCAG AA達標
- [ ] 鍵盤可訪問
- [ ] 移動端友好
- [ ] 載入狀態清晰
- [ ] 反饋及時

## 最佳實踐

1. 使用者優先於技術
2. 簡單優於複雜
3. 一致性建立信任
4. 反饋建立信心
5. 可訪問性非可選
