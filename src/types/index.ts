// 支援的語言
export type SupportedLang = 'zh-TW' | 'zh-CN' | 'en'

// 模型型別
export type ModelType = 'codex' | 'gemini' | 'claude'

// 協作模式
export type CollaborationMode = 'parallel' | 'smart' | 'sequential'

// 路由策略
export type RoutingStrategy = 'parallel' | 'fallback' | 'round-robin'

// 模型路由配置
export interface ModelRouting {
  frontend: {
    models: ModelType[]
    primary: ModelType
    strategy: RoutingStrategy
  }
  backend: {
    models: ModelType[]
    primary: ModelType
    strategy: RoutingStrategy
  }
  review: {
    models: ModelType[]
    strategy: 'parallel'
  }
  mode: CollaborationMode
  geminiModel?: string // Gemini 具體型號（預設 gemini-3.1-pro-preview）
}

// CCG 配置
export interface CcgConfig {
  general: {
    version: string
    language: SupportedLang
    createdAt: string
  }
  routing: ModelRouting
  workflows: {
    installed: string[]
  }
  paths: {
    commands: string
    prompts: string
    backup: string
  }
  mcp: {
    provider: string
    setup_url: string
  }
  performance?: {
    liteMode?: boolean // 輕量模式：禁用 Web UI，更快響應
    skipImpeccable?: boolean // 跳過 Impeccable 前端設計命令安裝
  }
}

// 工作流定義
export interface WorkflowConfig {
  id: string
  name: string
  nameEn: string
  category: string
  commands: string[]
  defaultSelected: boolean
  order: number
  description?: string
  descriptionEn?: string
}

// 初始化選項
export interface InitOptions {
  lang?: SupportedLang
  skipPrompt?: boolean
  skipMcp?: boolean // 更新時跳過 MCP 配置
  force?: boolean
  // 非互動模式引數
  frontend?: string
  backend?: string
  mode?: CollaborationMode
  workflows?: string
  installDir?: string
}

// 安裝結果
export interface InstallResult {
  success: boolean
  installedCommands: string[]
  installedPrompts: string[]
  installedSkills?: number
  installedSkillCommands?: number
  installedRules?: boolean
  errors: string[]
  configPath: string
  binPath?: string
  binInstalled?: boolean
}

// ace-tool 配置
export interface AceToolConfig {
  baseUrl: string
  token: string
}

// fast-context (Windsurf Fast Context) 配置
export interface FastContextConfig {
  apiKey?: string // WINDSURF_API_KEY (本地裝 Windsurf 登入後可自動提取)
  includeSnippets?: boolean // FC_INCLUDE_SNIPPETS — true 返回完整程式碼片段
}

// Re-export CLI types
export * from './cli'
