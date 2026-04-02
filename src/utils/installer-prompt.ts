import { homedir } from 'node:os'
import fs from 'fs-extra'
import { dirname, join } from 'pathe'

// ═══════════════════════════════════════════════════════
// Fast Context global prompt injection
// ═══════════════════════════════════════════════════════

const FAST_CONTEXT_PROMPT_PRIMARY = `# fast-context MCP 工具使用指南

## 核心原則

**任何需要理解程式碼上下文、探索性搜尋、或自然語言定位程式碼的場景，優先使用 \`mcp__fast-context__fast_context_search\`**`

const FAST_CONTEXT_PROMPT_AUXILIARY = `# fast-context MCP 工具使用指南（輔助模式）

## 核心原則

**主檢索工具為 ace-tool（\`mcp__ace-tool__search_context\`）。當 ace-tool 無法滿足語義搜尋需求時，使用 \`mcp__fast-context__fast_context_search\` 作為補充。**

適合使用 fast-context 的場景：
- 用自然語言描述要找的邏輯（如"部署流程"、"事件處理"）
- 跨模組、跨層級的呼叫鏈路追蹤
- 中文語義搜尋（工具支援中英文雙語查詢）`

const FAST_CONTEXT_PROMPT = `# fast-context MCP 工具使用指南

## 核心原則

**任何需要理解程式碼上下文、探索性搜尋、或自然語言定位程式碼的場景，優先使用 \`mcp__fast-context__fast_context_search\`**

## 使用場景

### 必須用 fast_context_search
- 探索性搜尋（不確定程式碼在哪個檔案/目錄）
- 用自然語言描述要找的邏輯（如"部署流程"、"事件處理"）
- 理解業務邏輯和呼叫鏈路
- 跨模組、跨層級查詢（如從 router 追到 service 到 model）
- 新任務開始前的程式碼調研和架構理解
- 中文語義搜尋（工具支援中英文雙語查詢）

### 根據需求選擇工具
- **語義搜尋 / 不確定位置** → \`mcp__fast-context__fast_context_search\`（返回檔案+行號範圍+grep關鍵詞建議）
- **精確關鍵詞搜尋** → Grep
- **已知檔案路徑，檢視內容** → Read
- **按檔名模式查詢** → Glob
- **編輯已有檔案** → Edit

### fast_context_search 引數調優
- \`tree_depth=1, max_turns=1\` — 快速粗查，適合小專案或初步定位
- \`tree_depth=3, max_turns=3\`（預設）— 平衡精度與速度，適合大多數場景
- \`max_turns=5\` — 深度搜尋，適合複雜呼叫鏈追蹤
- \`project_path\` — 指定搜尋的專案根目錄，預設為當前工作目錄

### 禁止行為
- ❌ 猜測程式碼位置（"應該在 service/firmware 裡"）
- ❌ 跳過搜尋直接回答（"根據框架慣例，應該是..."）
- ❌ 遇到搜尋就啟動子代理（fast-context + Grep 組合優先）

### 子代理使用條件
僅當需要讀取 10+ 檔案交叉比對、或多輪搜尋會撐爆上下文時，才啟動子代理。
`

const FC_MARKER_START = '<!-- CCG-FAST-CONTEXT-START -->'
const FC_MARKER_END = '<!-- CCG-FAST-CONTEXT-END -->'

/**
 * Write fast-context search guidance to:
 * 1. ~/.claude/rules/ccg-fast-context.md (Claude Code — auto-loaded via rules/)
 * 2. ~/.codex/AGENTS.md (Codex CLI — auto-loaded as global instructions)
 * 3. ~/.gemini/GEMINI.md (Gemini CLI — auto-loaded as global instructions)
 */
export async function writeFastContextPrompt(auxiliaryMode = false): Promise<void> {
  const promptContent = auxiliaryMode ? FAST_CONTEXT_PROMPT_AUXILIARY : FAST_CONTEXT_PROMPT_PRIMARY
  const markerStart = FC_MARKER_START
  const markerEnd = FC_MARKER_END
  const markedBlock = `\n${markerStart}\n${promptContent}\n${markerEnd}\n`
  const markerRegex = new RegExp(
    `\\n?${markerStart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${markerEnd.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n?`,
  )

  // Helper: append or replace marked block in a file
  async function injectIntoFile(filePath: string): Promise<void> {
    const dir = dirname(filePath)
    await fs.ensureDir(dir)
    if (await fs.pathExists(filePath)) {
      let content = await fs.readFile(filePath, 'utf-8')
      if (content.includes(markerStart)) {
        content = content.replace(markerRegex, markedBlock)
      }
      else {
        content += markedBlock
      }
      await fs.writeFile(filePath, content, 'utf-8')
    }
    else {
      await fs.writeFile(filePath, markedBlock.trim() + '\n', 'utf-8')
    }
  }

  // 1. Claude Code rules (standalone file, not appended)
  const rulesDir = join(homedir(), '.claude', 'rules')
  await fs.ensureDir(rulesDir)
  await fs.writeFile(join(rulesDir, 'ccg-fast-context.md'), promptContent, 'utf-8')

  // 2. Codex CLI global instructions (~/.codex/AGENTS.md)
  await injectIntoFile(join(homedir(), '.codex', 'AGENTS.md'))

  // 3. Gemini CLI global instructions (~/.gemini/GEMINI.md)
  await injectIntoFile(join(homedir(), '.gemini', 'GEMINI.md'))
}

/**
 * Remove fast-context prompts from all locations
 */
export async function removeFastContextPrompt(): Promise<void> {
  const markerRegex = new RegExp(
    `\\n?${FC_MARKER_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${FC_MARKER_END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n?`,
  )

  // Helper: remove marked block from a file
  async function removeFromFile(filePath: string): Promise<void> {
    if (await fs.pathExists(filePath)) {
      let content = await fs.readFile(filePath, 'utf-8')
      if (content.includes(FC_MARKER_START)) {
        content = content.replace(markerRegex, '')
        await fs.writeFile(filePath, content, 'utf-8')
      }
    }
  }

  // 1. Remove Claude Code rules file
  const rulePath = join(homedir(), '.claude', 'rules', 'ccg-fast-context.md')
  if (await fs.pathExists(rulePath)) {
    await fs.remove(rulePath)
  }

  // 2. Remove from Codex AGENTS.md
  await removeFromFile(join(homedir(), '.codex', 'AGENTS.md'))

  // 3. Remove from Gemini GEMINI.md
  await removeFromFile(join(homedir(), '.gemini', 'GEMINI.md'))
}
