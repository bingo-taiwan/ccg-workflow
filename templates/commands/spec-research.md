---
description: '需求 → 約束集（並行探索 + OPSX 提案）'
---
<!-- CCG:SPEC:RESEARCH:START -->
**Core Philosophy**
- Research produces **constraint sets**, not information dumps. Each constraint narrows the solution space.
- Constraints tell subsequent stages "don't consider this direction," enabling mechanical execution without decisions.
- Output: 約束集合 + 可驗證的成功判據 (constraint sets + verifiable success criteria).
- Strictly adhere to OPSX rules when writing spec-structured documents.

**Guardrails**
- **STOP! BEFORE ANY OTHER ACTION**: You MUST perform Prompt Enhancement FIRST. This is NON-NEGOTIABLE.
- **NEVER** divide subagent tasks by roles (e.g., "架構師agent", "安全專家agent").
- **ALWAYS** divide by context boundaries (e.g., "user-related code", "authentication logic").
- Each subagent context must be self-contained with independent output.
- Use `{{MCP_SEARCH_TOOL}}` to minimize grep/find operations.
- Do not make architectural decisions—surface constraints that guide decisions.
- **USER GUIDANCE RULE**: When suggesting next steps to the user, ALWAYS use CCG commands (`/ccg:spec-research`, `/ccg:spec-plan`, `/ccg:spec-impl`, `/ccg:spec-review`). NEVER suggest `/opsx:*` commands to the user. If OpenSpec CLI returns error messages referencing OPSX skills, translate them to CCG equivalents.
- **PHASE BOUNDARY**: This phase ONLY generates the OPSX proposal artifact. Do NOT modify any source code. Do NOT proceed to planning or implementation. After the proposal is generated, STOP and inform the user: "Research complete. Run `/ccg:spec-plan` to continue."

**Steps**
0. **MANDATORY: Enhance Requirement FIRST**
   - **DO THIS IMMEDIATELY. DO NOT SKIP.**
   - **Prompt 增強**（按 `/ccg:enhance` 的邏輯執行）：分析 $ARGUMENTS 的意圖、缺失資訊、隱含假設，補全為結構化需求（明確目標、技術約束、範圍邊界、驗收標準）。
   - Use enhanced prompt for ALL subsequent steps.

1. **Generate OPSX Change**
   - Check if change already exists:
     ```bash
     openspec list --json
     ```
   - If change doesn't exist, create it:
     ```bash
     openspec new change "<brief-descriptive-name>"
     ```
   - This scaffolds `openspec/changes/<name>/` with proposal.md.
   - If change already exists, continue with existing change.

2. **Initial Codebase Assessment**
   - Use `{{MCP_SEARCH_TOOL}}` to scan codebase.
   - Determine project scale: single vs multi-directory structure.
   - **Decision**: If multi-directory → enable parallel Explore subagents.

3. **Define Exploration Boundaries (Context-Based)**
   - Identify natural context boundaries (NOT functional roles):
     * Subagent 1: User domain code (models, services, UI)
     * Subagent 2: Auth & authorization (middleware, session, tokens)
     * Subagent 3: Infrastructure (configs, deployments, builds)
   - Each boundary should be self-contained: no cross-communication needed.

4. **Parallel Multi-Model Exploration**
   - **CRITICAL**: You MUST launch BOTH Codex AND Gemini in a SINGLE message with TWO Bash tool calls.
   - **DO NOT** call one model first and wait. Launch BOTH simultaneously with `run_in_background: true`.
   - **工作目錄**：`{{WORKDIR}}` **必須透過 Bash 執行 `pwd`（Unix）或 `cd`（Windows CMD）獲取當前工作目錄的絕對路徑**，禁止從 `$HOME` 或環境變數推斷。如果使用者透過 `/add-dir` 新增了多個工作區，先確定任務相關的工作區。

   **Output Template** (instruct both models to use this format):
   ```json
   {
     "module_name": "context boundary explored",
     "existing_structures": ["key patterns found"],
     "existing_conventions": ["standards in use"],
     "constraints_discovered": ["hard constraints limiting solution space"],
     "open_questions": ["ambiguities requiring user input"],
     "dependencies": ["cross-module dependencies"],
     "risks": ["potential blockers"],
     "success_criteria_hints": ["observable success behaviors"]
   }
   ```

   **Step 4.1**: In ONE message, make TWO parallel Bash calls:

   **FIRST Bash call ({{BACKEND_PRIMARY}} — backend boundaries)**:
   ```
   Bash({
     command: "~/.claude/bin/codeagent-wrapper --progress --backend {{BACKEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EOF'\nExplore backend context boundaries for <change description>:\n- Existing structures and patterns\n- Conventions in use\n- Hard constraints limiting solution space\n- Dependencies and risks\nOUTPUT: JSON using the output template above\nEOF",
     run_in_background: true,
     timeout: 300000,
     description: "{{BACKEND_PRIMARY}}: backend boundary exploration"
   })
   ```

   **SECOND Bash call ({{FRONTEND_PRIMARY}} — frontend boundaries) - IN THE SAME MESSAGE**:
   ```
   Bash({
     command: "~/.claude/bin/codeagent-wrapper --progress --backend {{FRONTEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EOF'\nExplore frontend context boundaries for <change description>:\n- Existing structures and patterns\n- Conventions in use\n- Hard constraints limiting solution space\n- Dependencies and risks\nOUTPUT: JSON using the output template above\nEOF",
     run_in_background: true,
     timeout: 300000,
     description: "{{FRONTEND_PRIMARY}}: frontend boundary exploration"
   })
   ```

   **Step 4.2**: After BOTH Bash calls return task IDs, wait for results with TWO TaskOutput calls:
   ```
   TaskOutput({ task_id: "<codex_task_id>", block: true, timeout: 600000 })
   TaskOutput({ task_id: "<gemini_task_id>", block: true, timeout: 600000 })
   ```

   ⛔ **Gemini 失敗必須重試**：若 Gemini 呼叫失敗，最多重試 2 次（間隔 5 秒）。3 次全敗才跳過。
   ⛔ **Codex 結果必須等待**：Codex 執行 5-15 分鐘屬正常，超時後繼續輪詢，禁止跳過。

5. **Aggregate and Synthesize**
   - Collect all subagent outputs.
   - Merge into unified constraint sets:
     * **Hard constraints**: Technical limitations, patterns that cannot be violated
     * **Soft constraints**: Conventions, preferences, style guides
     * **Dependencies**: Cross-module relationships affecting implementation order
     * **Risks**: Blockers needing mitigation

6. **User Interaction for Ambiguity Resolution**
   - Compile prioritized list of open questions.
   - Use `AskUserQuestion` tool to present systematically:
     * Group related questions
     * Provide context for each
     * Suggest defaults when applicable
   - Capture responses as additional constraints.

7. **Finalize OPSX Proposal**
   - **BEFORE calling `/opsx:continue`** (internal skill call — do NOT expose this command to user), output a structured summary for OPSX context:
     ```markdown
     ## Research Summary for OPSX

     **Discovered Constraints**:
     - [List all hard and soft constraints from Step 5]

     **Dependencies**:
     - [List cross-module dependencies]

     **Risks & Mitigations**:
     - [List identified risks and mitigation strategies]

     **Success Criteria**:
     - [List verifiable success behaviors]

     **User Confirmations**:
     - [List all user decisions from Step 6]
     ```

   - Then call `/opsx:continue` internally to generate proposal artifact:
     ```
     /opsx:continue
     ```
   - The OPSX skill will use the above summary to write proposal.md.
   - **Note**: This is an internal call. If this step fails, guide the user to re-run `/ccg:spec-research`.
   - **STOP**: After proposal is generated, verify it exists and inform user:
     "Research phase complete. Proposal generated. Run `/ccg:spec-plan` to continue planning."
     Do NOT proceed to planning or implementation.

8. **Context Checkpoint**
   - Report current context usage.
   - If approaching 80K tokens, suggest: "Run `/clear` and continue with `/ccg:spec-plan`"

**Reference**
- OPSX CLI: `openspec status --change "<id>" --json`, `openspec list --json`
- Check prior research: `ls openspec/changes/*/`
- Use `AskUserQuestion` for ANY ambiguity—never assume or guess
<!-- CCG:SPEC:RESEARCH:END -->
