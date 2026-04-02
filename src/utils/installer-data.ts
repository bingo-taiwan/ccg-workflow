import type { WorkflowConfig } from '../types'

// ═══════════════════════════════════════════════════════
// Command builder — adding a new command = 1 function call
// ═══════════════════════════════════════════════════════

type CommandCategory = 'development' | 'init' | 'git' | 'spec'

/**
 * Create a WorkflowConfig with sensible defaults.
 * @param cmdOverride — Use when the slash command name differs from the id (e.g. 'init-project' → 'init')
 */
function cmd(
  id: string,
  order: number,
  category: CommandCategory,
  name: string,
  nameEn: string,
  description: string,
  descriptionEn: string,
  cmdOverride?: string,
): WorkflowConfig {
  return {
    id,
    name,
    nameEn,
    category,
    commands: [cmdOverride ?? id],
    defaultSelected: true,
    order,
    description,
    descriptionEn,
  }
}

// ═══════════════════════════════════════════════════════
// Command registry (source of truth)
// To add a command: append one cmd() call below.
// ═══════════════════════════════════════════════════════

const WORKFLOW_CONFIGS: WorkflowConfig[] = [
  // ── Development ──────────────────────────────────────
  cmd('workflow', 1, 'development', '完整開發工作流', 'Full Development Workflow', '完整6階段開發工作流（研究→構思→計劃→執行→最佳化→評審）', 'Full 6-phase development workflow'),
  cmd('plan', 1.5, 'development', '多模型協作規劃', 'Multi-Model Planning', '上下文檢索 + 雙模型分析 → 生成 Step-by-step 實施計劃', 'Context retrieval + dual-model analysis → Step-by-step plan'),
  cmd('execute', 1.6, 'development', '多模型協作執行', 'Multi-Model Execution', '根據計劃獲取原型 → Claude 重構實施 → 多模型審計交付', 'Get prototype from plan → Claude refactor → Multi-model audit'),
  cmd('team', 1.75, 'development', 'Agent Teams 統一工作流', 'Agent Teams Unified Workflow', '8 階段企業級工作流：需求→架構→規劃→開發→測試→審查→修復→整合，7 角色自動編排', '8-phase enterprise workflow with 7 specialized roles'),
  cmd('team-research', 1.8, 'development', 'Agent Teams 需求研究', 'Agent Teams Research', '並行探索程式碼庫，產出約束集 + 可驗證成功判據', 'Parallel codebase exploration, produces constraint sets + success criteria'),
  cmd('team-plan', 1.85, 'development', 'Agent Teams 規劃', 'Agent Teams Planning', 'Lead 呼叫 Codex/Gemini 並行分析，產出零決策並行實施計劃', 'Lead orchestrates Codex/Gemini analysis, produces zero-decision parallel plan'),
  cmd('team-exec', 1.9, 'development', 'Agent Teams 並行實施', 'Agent Teams Parallel Execution', '讀取計劃檔案，spawn Builder teammates 並行寫程式碼，需啟用 Agent Teams', 'Read plan file, spawn Builder teammates for parallel implementation'),
  cmd('team-review', 1.95, 'development', 'Agent Teams 審查', 'Agent Teams Review', '雙模型交叉審查並行實施產出，分級處理 Critical/Warning/Info', 'Dual-model cross-review with severity classification'),
  cmd('frontend', 2, 'development', '前端專項', 'Frontend Tasks', '前端專項任務（Gemini主導，更快更精準）', 'Frontend tasks (Gemini-led, faster)'),
  cmd('codex-exec', 2.5, 'development', 'Codex 執行計劃', 'Codex Plan Executor', '讀取 /ccg:plan 計劃檔案，Codex 全權執行 + 多模型稽核', 'Read plan file from /ccg:plan, Codex executes + multi-model review'),
  cmd('context', 2.6, 'development', '專案上下文管理', 'Project Context Manager', '初始化 .context 目錄、記錄決策日誌、壓縮歸檔、檢視歷史', 'Init .context dir, log decisions, compress, view history'),
  cmd('backend', 3, 'development', '後端專項', 'Backend Tasks', '後端專項任務（Codex主導，更快更精準）', 'Backend tasks (Codex-led, faster)'),
  cmd('feat', 4, 'development', '智慧功能開發', 'Smart Feature Development', '智慧功能開發 - 自動規劃、設計、實施', 'Smart feature development - auto plan, design, implement'),
  cmd('analyze', 5, 'development', '技術分析', 'Technical Analysis', '雙模型技術分析，僅分析不修改程式碼', 'Dual-model technical analysis, analysis only'),
  cmd('debug', 6, 'development', '問題診斷', 'Debug', '多模型診斷 + 修復', 'Multi-model diagnosis + fix'),
  cmd('optimize', 7, 'development', '效能最佳化', 'Performance Optimization', '多模型效能最佳化', 'Multi-model performance optimization'),
  cmd('test', 8, 'development', '測試生成', 'Test Generation', '智慧路由測試生成', 'Smart routing test generation'),
  cmd('review', 9, 'development', '程式碼審查', 'Code Review', '雙模型程式碼審查，無引數時自動審查 git diff', 'Dual-model code review, auto-review git diff when no args'),
  cmd('enhance', 9.5, 'development', 'Prompt 增強', 'Prompt Enhancement', 'ace-tool Prompt 增強工具', 'ace-tool prompt enhancement'),

  // ── Init ─────────────────────────────────────────────
  cmd('init-project', 10, 'init', '專案初始化', 'Project Init', '初始化專案 AI 上下文，生成 CLAUDE.md', 'Initialize project AI context, generate CLAUDE.md', 'init'),

  // ── Git ──────────────────────────────────────────────
  cmd('commit', 20, 'git', 'Git 提交', 'Git Commit', '智慧生成 conventional commit 資訊', 'Smart conventional commit message generation'),
  cmd('rollback', 21, 'git', 'Git 回滾', 'Git Rollback', '互動式回滾分支到歷史版本', 'Interactive rollback to historical version'),
  cmd('clean-branches', 22, 'git', 'Git 清理分支', 'Git Clean Branches', '安全清理已合併或過期分支', 'Safely clean merged or stale branches'),
  cmd('worktree', 23, 'git', 'Git Worktree', 'Git Worktree', '管理 Git worktree', 'Manage Git worktree'),

  // ── Spec (OpenSpec / OPSX) ───────────────────────────
  cmd('spec-init', 30, 'spec', 'OpenSpec 初始化', 'OpenSpec Init', '初始化 OpenSpec 環境 + 驗證多模型 MCP 工具', 'Initialize OpenSpec environment with multi-model MCP validation'),
  cmd('spec-research', 31, 'spec', '需求研究', 'Spec Research', '需求 → 約束集（並行探索 + OpenSpec 提案）', 'Transform requirements into constraint sets via parallel exploration'),
  cmd('spec-plan', 32, 'spec', '零決策規劃', 'Spec Plan', '多模型分析 → 消除歧義 → 零決策可執行計劃', 'Refine proposals into zero-decision executable plans'),
  cmd('spec-impl', 33, 'spec', '規範驅動實現', 'Spec Implementation', '按規範執行 + 多模型協作 + 歸檔', 'Execute changes via multi-model collaboration with spec compliance'),
  cmd('spec-review', 34, 'spec', '歸檔前審查', 'Spec Review', '雙模型交叉審查 → Critical 必須修復 → 允許歸檔', 'Multi-model compliance review before archiving'),
]

// ═══════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════

export function getWorkflowConfigs(): WorkflowConfig[] {
  return WORKFLOW_CONFIGS.sort((a, b) => a.order - b.order)
}

export function getWorkflowById(id: string): WorkflowConfig | undefined {
  return WORKFLOW_CONFIGS.find(w => w.id === id)
}

/**
 * Get all command IDs for installation.
 * No more presets — always install all commands.
 */
export function getAllCommandIds(): string[] {
  return WORKFLOW_CONFIGS.map(w => w.id)
}

/**
 * @deprecated Use getAllCommandIds() instead.
 * Kept for backward compatibility.
 */
export const WORKFLOW_PRESETS = {
  full: {
    name: '完整',
    nameEn: 'Full',
    description: `全部命令（${WORKFLOW_CONFIGS.length}個）`,
    descriptionEn: `All commands (${WORKFLOW_CONFIGS.length})`,
    workflows: WORKFLOW_CONFIGS.map(w => w.id),
  },
}

export type WorkflowPreset = keyof typeof WORKFLOW_PRESETS

export function getWorkflowPreset(preset: WorkflowPreset): string[] {
  return [...WORKFLOW_PRESETS[preset].workflows]
}
