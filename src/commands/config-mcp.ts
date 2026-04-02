import ansis from 'ansis'
import inquirer from 'inquirer'
import { i18n } from '../i18n'
import fs from 'fs-extra'
import { homedir } from 'node:os'
import { join } from 'pathe'
import { installAceTool, installAceToolRs, installContextWeaver, installFastContext, installMcpServer, removeFastContextPrompt, syncMcpToCodex, syncMcpToGemini, uninstallAceTool, uninstallContextWeaver, uninstallFastContext, uninstallMcpServer, writeFastContextPrompt } from '../utils/installer'

/**
 * Sync MCP mirrors to Codex & Gemini after any install/uninstall.
 * Silent on success — only logs failures.
 */
async function syncMcpMirrors(): Promise<void> {
  const [codex, gemini] = await Promise.all([syncMcpToCodex(), syncMcpToGemini()])
  const synced: string[] = []
  if (codex.success && codex.synced.length > 0) synced.push(`Codex(${codex.synced.join(',')})`)
  if (gemini.success && gemini.synced.length > 0) synced.push(`Gemini(${gemini.synced.join(',')})`)
  if (synced.length > 0) {
    console.log(ansis.green(`✓ MCP 已同步到 ${synced.join(' + ')}`))
  }
  if (!codex.success) console.log(ansis.yellow(`⚠ Codex 同步失敗: ${codex.message}`))
  if (!gemini.success) console.log(ansis.yellow(`⚠ Gemini 同步失敗: ${gemini.message}`))
}

/**
 * Configure MCP tools after installation
 */
export async function configMcp(): Promise<void> {
  console.log()
  console.log(ansis.cyan.bold(`  配置 MCP 工具`))
  console.log()

  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: '選擇操作',
    choices: [
      { name: `${ansis.green('➜')} 程式碼檢索 MCP ${ansis.gray('(ace-tool / fast-context / ContextWeaver)')}`, value: 'code-retrieval' },
      { name: `${ansis.green('➜')} 聯網搜尋 MCP ${ansis.gray('(grok-search，比內建聯網更好用)')}`, value: 'grok-search' },
      { name: `${ansis.blue('➜')} 輔助工具 MCP ${ansis.gray('(context7 / Playwright / exa...)')}`, value: 'auxiliary' },
      { name: `${ansis.red('✕')} 解除安裝 MCP`, value: 'uninstall' },
      new inquirer.Separator(),
      { name: `${ansis.gray('返回')}`, value: 'cancel' },
    ],
  }])

  if (action === 'cancel')
    return

  if (action === 'code-retrieval') {
    await handleCodeRetrieval()
  }
  else if (action === 'grok-search') {
    await handleGrokSearch()
  }
  else if (action === 'auxiliary') {
    await handleAuxiliary()
  }
  else if (action === 'uninstall') {
    await handleUninstall()
  }
}

async function handleCodeRetrieval(): Promise<void> {
  console.log()

  const { tool } = await inquirer.prompt([{
    type: 'list',
    name: 'tool',
    message: '選擇程式碼檢索工具',
    choices: [
      { name: `ace-tool ${ansis.green('(推薦)')} ${ansis.gray('- 程式碼檢索（enhance_prompt 已不可用）')}`, value: 'ace-tool' },
      { name: `ace-tool-rs ${ansis.green('(推薦)')} ${ansis.gray('- Rust 版本')}`, value: 'ace-tool-rs' },
      { name: `fast-context ${ansis.green('(推薦)')} ${ansis.gray('- Windsurf Fast Context（免費/低成本）')}`, value: 'fast-context' },
      { name: `ContextWeaver ${ansis.gray('- 本地混合搜尋（需矽基流動 API Key）')}`, value: 'contextweaver' },
      new inquirer.Separator(),
      { name: `${ansis.gray('返回')}`, value: 'cancel' },
    ],
  }])

  if (tool === 'cancel')
    return

  if (tool === 'contextweaver') {
    await handleInstallContextWeaver()
  }
  else if (tool === 'fast-context') {
    await handleInstallFastContext()
  }
  else {
    await handleInstallAceTool(tool === 'ace-tool-rs')
  }
}

async function handleInstallAceTool(isRs: boolean): Promise<void> {
  const toolName = isRs ? 'ace-tool-rs' : 'ace-tool'

  console.log()
  console.log(ansis.cyan(`📖 獲取 ${toolName} 訪問方式：`))
  console.log(`   ${ansis.gray('•')} ${ansis.cyan('官方服務')}: ${ansis.underline('https://augmentcode.com/')}`)
  console.log(`   ${ansis.gray('•')} ${ansis.cyan('第三方中轉')} ${ansis.green('(推薦)')}: ${ansis.underline('https://acemcp.heroman.wtf/')}`)
  console.log(`   ${ansis.gray('⚠')} ${ansis.yellow('注意')}: enhance_prompt 已不可用，search_context 程式碼檢索正常`)
  console.log()

  const answers = await inquirer.prompt([
    { type: 'input', name: 'baseUrl', message: `Base URL ${ansis.gray('(中轉服務必填，官方留空)')}` },
    { type: 'password', name: 'token', message: `Token ${ansis.gray('(必填)')}`, validate: (v: string) => v.trim() !== '' || '請輸入 Token' },
  ])

  console.log()
  console.log(ansis.yellow(`⏳ 正在配置 ${toolName} MCP...`))

  const result = await (isRs ? installAceToolRs : installAceTool)({
    baseUrl: answers.baseUrl?.trim() || undefined,
    token: answers.token.trim(),
  })

  console.log()
  if (result.success) {
    console.log(ansis.green(`✓ ${toolName} MCP 配置成功！`))
    await syncMcpMirrors()
    console.log(ansis.gray(`  重啟 Claude Code CLI 使配置生效`))
  }
  else {
    console.log(ansis.red(`✗ ${toolName} MCP 配置失敗: ${result.message}`))
  }
}

async function handleInstallContextWeaver(): Promise<void> {
  console.log()
  console.log(ansis.cyan(`📖 獲取矽基流動 API Key：`))
  console.log(`   ${ansis.gray('1.')} 訪問 ${ansis.underline('https://siliconflow.cn/')} 註冊賬號`)
  console.log(`   ${ansis.gray('2.')} 進入控制檯 → API 金鑰 → 建立金鑰`)
  console.log(`   ${ansis.gray('3.')} 新使用者有免費額度，Embedding + Rerank 完全夠用`)
  console.log()

  const { apiKey } = await inquirer.prompt([{
    type: 'password',
    name: 'apiKey',
    message: `矽基流動 API Key ${ansis.gray('(sk-xxx)')}`,
    mask: '*',
    validate: (v: string) => v.trim() !== '' || '請輸入 API Key',
  }])

  console.log()
  console.log(ansis.yellow('⏳ 正在配置 ContextWeaver MCP...'))

  const result = await installContextWeaver({ siliconflowApiKey: apiKey.trim() })

  console.log()
  if (result.success) {
    console.log(ansis.green('✓ ContextWeaver MCP 配置成功！'))
    await syncMcpMirrors()
    console.log(ansis.gray('  重啟 Claude Code CLI 使配置生效'))
  }
  else {
    console.log(ansis.red(`✗ ContextWeaver MCP 配置失敗: ${result.message}`))
  }
}

async function handleInstallFastContext(): Promise<void> {
  console.log()
  console.log(ansis.cyan('📖 Fast Context (Windsurf Fast Context)：'))
  console.log(`   ${ansis.gray('•')} 需要 Windsurf 賬號的 API Key`)
  console.log(`   ${ansis.gray('•')} 本地裝過 Windsurf 並登入 → Key 可自動提取，也可手動填入`)
  console.log(`   ${ansis.gray('•')} Key 獲取：安裝 Windsurf → 登入 → 從本地 SQLite 提取 apiKey`)
  console.log(`   ${ansis.gray('•')} 輕量模式返回檔案路徑+行範圍，完整模式額外返回程式碼片段`)
  console.log()

  const answers = await inquirer.prompt([
    { type: 'input', name: 'apiKey', message: `WINDSURF_API_KEY ${ansis.gray('(本地裝了 Windsurf 可留空自動提取)')}` },
    {
      type: 'confirm',
      name: 'includeSnippets',
      message: `返回完整程式碼片段？${ansis.gray('(FC_INCLUDE_SNIPPETS，輸出 ~40KB，否則僅路徑+行號 ~2KB)')}`,
      default: false,
    },
  ])

  console.log()
  console.log(ansis.yellow('⏳ 正在配置 fast-context MCP...'))

  const result = await installFastContext({
    apiKey: answers.apiKey?.trim() || undefined,
    includeSnippets: answers.includeSnippets,
  })

  console.log()
  if (result.success) {
    // Write search guidance to Claude Code rules + Codex global instructions
    await writeFastContextPrompt()
    console.log(ansis.green('✓ fast-context MCP 配置成功！'))
    console.log(ansis.green('✓ 搜尋提示詞已寫入 ~/.claude/rules/ + ~/.codex/AGENTS.md + ~/.gemini/GEMINI.md'))
    await syncMcpMirrors()
    console.log(ansis.gray('  重啟 Claude Code CLI 使配置生效'))
  }
  else {
    console.log(ansis.red(`✗ fast-context MCP 配置失敗: ${result.message}`))
  }
}

// ═══════════════════════════════════════════════════════
// Grok Search MCP (web search)
// ═══════════════════════════════════════════════════════

const GROK_SEARCH_PROMPT = `## 0. Language and Format Standards

- **Interaction Language**: Tools and models must interact exclusively in **English**; user outputs must be in **Chinese**.
- MUST ULRTA Thinking in ENGLISH!
- **Formatting Requirements**: Use standard Markdown formatting. Code blocks and specific text results should be marked with backticks. Skilled in applying four or more \`\`\`\`markdown wrappers.

## 1. Search and Evidence Standards
Typically, the results of web searches only constitute third-party suggestions and are not directly credible; they must be cross-verified with sources to provide users with absolutely authoritative and correct answers.

### Search Trigger Conditions
Strictly distinguish between internal and external knowledge. Avoid speculation based on general internal knowledge. When uncertain, explicitly inform the user.

For example, when using the \\\`fastapi\\\` library to encapsulate an API endpoint, despite possessing common-sense knowledge internally, you must still rely on the latest search results or official documentation for reliable implementation.

### Search Execution Guidelines

- Use the \\\`mcp__grok-search\\\` tool for web searches
- Execute independent search requests in parallel; sequential execution applies only when dependencies exist
- Evaluate search results for quality: analyze relevance, source credibility, cross-source consistency, and completeness. Conduct supplementary searches if gaps exist

### Source Quality Standards

- Key factual claims must be supported by >=2 independent sources. If relying on a single source, explicitly state this limitation
- Conflicting sources: Present evidence from both sides, assess credibility and timeliness, identify the stronger evidence, or declare unresolved discrepancies
- Empirical conclusions must include confidence levels (High/Medium/Low)
- Citation format: [Author/Organization, Year/Date, Section/URL]. Fabricated references are strictly prohibited

## 2. Reasoning and Expression Principles

- Be concise, direct, and information-dense: Use lists for discrete items; paragraphs for arguments
- Challenge flawed premises: When user logic contains errors, pinpoint specific issues with evidence
- All conclusions must specify: Applicable conditions, scope boundaries, and known limitations
- Avoid greetings, pleasantries, filler adjectives, and emotional expressions
- When uncertain: State unknowns and reasons before presenting confirmed facts
`

async function writeGrokPromptToRules(): Promise<void> {
  const rulesDir = join(homedir(), '.claude', 'rules')
  const rulePath = join(rulesDir, 'ccg-grok-search.md')

  // Clean up legacy CLAUDE.md injection if present
  const claudeMdPath = join(homedir(), '.claude', 'CLAUDE.md')
  if (await fs.pathExists(claudeMdPath)) {
    const content = await fs.readFile(claudeMdPath, 'utf-8')
    if (content.includes('CCG-GROK-SEARCH-PROMPT')) {
      const cleaned = content.replace(/\n*<!-- CCG-GROK-SEARCH-PROMPT-START -->[\s\S]*?<!-- CCG-GROK-SEARCH-PROMPT-END -->\n*/g, '')
      await fs.writeFile(claudeMdPath, cleaned, 'utf-8')
    }
  }

  await fs.ensureDir(rulesDir)
  await fs.writeFile(rulePath, GROK_SEARCH_PROMPT, 'utf-8')
}

async function handleGrokSearch(): Promise<void> {
  console.log()
  console.log(ansis.cyan.bold('  🔍 聯網搜尋 MCP (grok-search)'))
  console.log(ansis.gray('  比 Claude Code 內建聯網更好用'))
  console.log()

  console.log(ansis.cyan('  📖 獲取 API Keys：'))
  console.log(`     Tavily: ${ansis.underline('https://www.tavily.com/')} ${ansis.gray('(免費額度 1000次/月)')}`)
  console.log(`     Firecrawl: ${ansis.underline('https://www.firecrawl.dev/')} ${ansis.gray('(註冊即送額度)')}`)
  console.log(`     Grok API: ${ansis.gray('需自行部署 grok2api（可選）')}`)
  console.log()

  const answers = await inquirer.prompt([
    { type: 'input', name: 'grokApiUrl', message: `GROK_API_URL ${ansis.gray('(可選)')}`, default: '' },
    { type: 'password', name: 'grokApiKey', message: `GROK_API_KEY ${ansis.gray('(可選)')}`, mask: '*' },
    { type: 'password', name: 'tavilyKey', message: `TAVILY_API_KEY ${ansis.gray('(可選)')}`, mask: '*' },
    { type: 'password', name: 'firecrawlKey', message: `FIRECRAWL_API_KEY ${ansis.gray('(可選)')}`, mask: '*' },
  ])

  const env: Record<string, string> = {}
  if (answers.grokApiUrl?.trim()) env.GROK_API_URL = answers.grokApiUrl.trim()
  if (answers.grokApiKey?.trim()) env.GROK_API_KEY = answers.grokApiKey.trim()
  if (answers.tavilyKey?.trim()) env.TAVILY_API_KEY = answers.tavilyKey.trim()
  if (answers.firecrawlKey?.trim()) env.FIRECRAWL_API_KEY = answers.firecrawlKey.trim()

  if (Object.keys(env).length === 0) {
    console.log(ansis.yellow('  未填寫任何 Key，已跳過'))
    return
  }

  console.log()
  console.log(ansis.yellow('⏳ 正在安裝 grok-search MCP...'))

  const result = await installMcpServer(
    'grok-search',
    'uvx',
    ['--from', 'git+https://github.com/GuDaStudio/GrokSearch@grok-with-tavily', 'grok-search'],
    env,
  )

  console.log()
  if (result.success) {
    await writeGrokPromptToRules()
    console.log(ansis.green('✓ grok-search MCP 配置成功！'))
    console.log(ansis.green('✓ 全域性搜尋提示詞已寫入 ~/.claude/rules/ccg-grok-search.md'))
    await syncMcpMirrors()
    console.log(ansis.gray('  重啟 Claude Code CLI 使配置生效'))
  }
  else {
    console.log(ansis.red(`✗ grok-search MCP 安裝失敗: ${result.message}`))
  }
}

// 輔助工具 MCP 配置
const AUXILIARY_MCPS = [
  { id: 'context7', name: 'Context7', desc: '獲取最新庫文件', command: 'npx', args: ['-y', '@upstash/context7-mcp@latest'] },
  { id: 'Playwright', name: 'Playwright', desc: '瀏覽器自動化/測試', command: 'npx', args: ['-y', '@playwright/mcp@latest'] },
  { id: 'mcp-deepwiki', name: 'DeepWiki', desc: '知識庫查詢', command: 'npx', args: ['-y', 'mcp-deepwiki@latest'] },
  { id: 'exa', name: 'Exa', desc: '搜尋引擎（需 API Key）', command: 'npx', args: ['-y', 'exa-mcp-server@latest'], requiresApiKey: true, apiKeyEnv: 'EXA_API_KEY' },
]

async function handleAuxiliary(): Promise<void> {
  console.log()

  const { selected } = await inquirer.prompt([{
    type: 'checkbox',
    name: 'selected',
    message: '選擇要安裝的輔助工具（空格選擇，回車確認）',
    choices: AUXILIARY_MCPS.map(m => ({
      name: `${m.name} ${ansis.gray(`- ${m.desc}`)}`,
      value: m.id,
    })),
  }])

  if (!selected || selected.length === 0) {
    console.log(ansis.gray('未選擇任何工具'))
    return
  }

  console.log()

  for (const id of selected) {
    const mcp = AUXILIARY_MCPS.find(m => m.id === id)!
    let env: Record<string, string> = {}

    if (mcp.requiresApiKey) {
      console.log(ansis.cyan(`📖 獲取 ${mcp.name} API Key：`))
      console.log(`   訪問 ${ansis.underline('https://exa.ai/')} 註冊獲取（有免費額度）`)
      console.log()

      const { apiKey } = await inquirer.prompt([{
        type: 'password',
        name: 'apiKey',
        message: `${mcp.name} API Key`,
        mask: '*',
        validate: (v: string) => v.trim() !== '' || '請輸入 API Key',
      }])
      env[mcp.apiKeyEnv!] = apiKey.trim()
    }

    console.log(ansis.yellow(`⏳ 正在安裝 ${mcp.name}...`))
    const result = await installMcpServer(mcp.id, mcp.command, mcp.args, env)

    if (result.success) {
      console.log(ansis.green(`✓ ${mcp.name} 安裝成功`))
    }
    else {
      console.log(ansis.red(`✗ ${mcp.name} 安裝失敗: ${result.message}`))
    }
  }

  console.log()
  await syncMcpMirrors()
  console.log(ansis.gray('重啟 Claude Code CLI 使配置生效'))
}

async function handleUninstall(): Promise<void> {
  console.log()

  const allMcps = [
    { name: 'ace-tool', value: 'ace-tool' },
    { name: 'fast-context', value: 'fast-context' },
    { name: 'ContextWeaver', value: 'contextweaver' },
    { name: 'grok-search', value: 'grok-search' },
    ...AUXILIARY_MCPS.map(m => ({ name: m.name, value: m.id })),
  ]

  const { targets } = await inquirer.prompt([{
    type: 'checkbox',
    name: 'targets',
    message: '選擇要解除安裝的 MCP（空格選擇，回車確認）',
    choices: allMcps,
  }])

  if (!targets || targets.length === 0) {
    console.log(ansis.gray('未選擇任何工具'))
    return
  }

  console.log()

  for (const target of targets) {
    console.log(ansis.yellow(`⏳ 正在解除安裝 ${target}...`))

    let result
    if (target === 'ace-tool') {
      result = await uninstallAceTool()
    }
    else if (target === 'fast-context') {
      result = await uninstallFastContext()
      // Also remove search guidance prompts
      await removeFastContextPrompt()
    }
    else if (target === 'contextweaver') {
      result = await uninstallContextWeaver()
    }
    else {
      result = await uninstallMcpServer(target)
    }

    if (result.success) {
      console.log(ansis.green(`✓ ${target} 已解除安裝`))
    }
    else {
      console.log(ansis.red(`✗ ${target} 解除安裝失敗: ${result.message}`))
    }
  }

  // Sync removals to Codex/Gemini
  await syncMcpMirrors()
  console.log()
}
