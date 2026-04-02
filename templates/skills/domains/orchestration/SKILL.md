---
name: orchestration
description: 協同編排知識域。多Agent協同、任務分解、並行執行、衝突解決。當魔尊需要多Agent協作、任務編排、並行處理時使用。
license: MIT
user-invocable: false
disable-model-invocation: false
---

# 🕸 協同編排秘典

## 知識主題

| 主題 | 文件 | 涵蓋 |
|------|------|------|
| 多Agent協同 | [multi-agent.md](multi-agent.md) | 角色定義、任務分解、通訊協議、衝突解決、狀態共享 |

## 使用場景

- 大型任務分解
- 多檔案並行處理
- 複雜系統重構
- 跨模組協同開發
- 緊急多點修復

## Codex 強化要點

- 優先使用 `spawn_agent/send_input/wait/close_agent` 形成閉環。
- 程式碼探索優先 `explorer`，執行改動使用 `worker`，長耗時任務使用 `awaiter`。
- 每個檔案同一時刻僅允許一個 Agent 寫入，先鎖檔案再並行。
