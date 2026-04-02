---
layout: home

hero:
  name: CCG
  text: 三個 AI 協作，程式碼你看得見
  tagline: Codex 分析後端，Gemini 分析前端，Claude 寫程式碼。全程透明，沒有黑盒。
  image:
    src: /logo.svg
    alt: CCG
  actions:
    - theme: brand
      text: 三分鐘上手
      link: /guide/getting-started
    - theme: alt
      text: 看看有哪些命令
      link: /guide/commands
    - theme: alt
      text: GitHub
      link: https://github.com/fengshao1227/ccg-workflow

features:
  - icon: 🔀
    title: 前端後端自動分流
    details: 你說"改登入頁"，Gemini 分析方案；你說"加個介面"，Codex 分析方案。Claude 拿到分析結果後寫程式碼——你能看到每一行改動。
  - icon: 🔒
    title: 程式碼透明，沒有黑盒
    details: 預設模式下 Claude 寫程式碼，你看得見過程。也可以用 codex-exec 讓 Codex 寫程式碼，最後 Claude + Gemini 多模型審查。怎麼選都不是黑盒。
  - icon: 📐
    title: 不讓 AI 自由發揮
    details: 整合 OPSX 規範驅動，需求先變成約束條件，AI 只能在框框裡幹活。
  - icon: 👥
    title: 多人幹活，一起寫
    details: Agent Teams 模式下，多個 Builder 同時寫不同模組的程式碼，完了還有雙模型交叉審查。
  - icon: ⚡
    title: 一行裝完，開箱即用
    details: npx ccg-workflow，28 個命令直接可用。macOS、Linux、Windows 都行。
  - icon: 🧩
    title: MCP 生態打通
    details: ace-tool、fast-context、Context7 等 MCP 工具一鍵配置，Codex 和 Gemini 自動同步。
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);
  --vp-home-hero-image-background-image: linear-gradient(-45deg, #bd34fe50 50%, #47caff50 50%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>
