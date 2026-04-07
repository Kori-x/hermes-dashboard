export interface WikiSkill {
  name: string
  category: string
  description: string
  version: string
  platforms: string[]
  tags: string[]
  body: string
}

export interface WikiPlugin {
  name: string
  version: string
  description: string
  tools: string[]
  hooks: string[]
}

export interface WikiTool {
  name: string
  description: string
  category: string
  params: { name: string; type: string; required: boolean; description: string }[]
}

export interface WikiCommand {
  command: string
  description: string
  flags: string[]
}

export const overview = {
  version: '0.7.0',
  skillCount: 142,
  pluginCount: 8,
  toolCount: 24,
  sessionCount: 1847,
  totalCost: 312.48,
  categories: [
    'apple', 'productivity', 'research', 'creative', 'software-development',
    'github', 'media', 'devops', 'mlops', 'data-science', 'mcp',
    'messaging', 'email', 'leisure', 'red-teaming', 'inference',
  ],
}

export const skills: WikiSkill[] = [
  {
    name: 'imessage',
    category: 'apple',
    description: 'Send and receive iMessages/SMS via the imsg CLI on macOS',
    version: '1.0.0',
    platforms: ['macos'],
    tags: ['iMessage', 'SMS', 'messaging', 'Apple'],
    body: `## When to Use\n\nUse this skill when the user asks you to send or read iMessages, SMS, or text messages on macOS.\n\n## Prerequisites\n\n- macOS only\n- \`imsg\` CLI tool installed\n- Full Disk Access granted to terminal\n\n## Usage\n\n\`\`\`bash\nimsg send "+1234567890" "Hello from Hermes"\nimsg read --limit 10\nimsg conversations\n\`\`\`\n\n## Notes\n\n- Group messages require the conversation ID\n- Media attachments are supported via \`--attachment\` flag`,
  },
  {
    name: 'apple-notes',
    category: 'apple',
    description: 'Create, read, and search Apple Notes via AppleScript',
    version: '1.0.0',
    platforms: ['macos'],
    tags: ['Notes', 'Apple', 'AppleScript'],
    body: `## When to Use\n\nUse when the user wants to interact with Apple Notes -- creating, reading, searching, or organizing notes.\n\n## How It Works\n\nUses AppleScript to interface with Notes.app. All operations are non-destructive by default.\n\n## Commands\n\n- Create note: \`osascript -e 'tell application "Notes" to make new note...'\`\n- List notes: queries the Notes database\n- Search: full-text search across all folders`,
  },
  {
    name: 'slack',
    category: 'messaging',
    description: 'Send messages, read channels, and manage Slack workspaces',
    version: '2.1.0',
    platforms: ['macos', 'linux', 'windows'],
    tags: ['Slack', 'messaging', 'team', 'notifications'],
    body: `## When to Use\n\nUse when the user asks to send Slack messages, read channels, or interact with Slack workspaces.\n\n## Setup\n\nRequires \`SLACK_TOKEN\` environment variable with a bot or user token.\n\n## Capabilities\n\n- Send messages to channels or DMs\n- Read recent messages from channels\n- List channels and users\n- Upload files\n- React to messages\n\n## Rate Limits\n\nRespects Slack API rate limits (1 request/second for most endpoints).`,
  },
  {
    name: 'browser-automation',
    category: 'research',
    description: 'Headless browser automation with Playwright for web scraping and interaction',
    version: '1.2.0',
    platforms: ['macos', 'linux', 'windows'],
    tags: ['browser', 'Playwright', 'scraping', 'automation'],
    body: `## When to Use\n\nUse for tasks requiring real browser interaction: filling forms, navigating SPAs, scraping JavaScript-rendered content, taking screenshots of web pages.\n\n## Prerequisites\n\n- Playwright installed: \`pip install playwright && playwright install\`\n\n## Capabilities\n\n- Navigate to URLs\n- Click elements, fill forms\n- Extract text and attributes\n- Take screenshots\n- Handle authentication flows\n- Wait for network idle`,
  },
  {
    name: 'web-search',
    category: 'research',
    description: 'Search the web using multiple providers (Google, Brave, Perplexity)',
    version: '1.0.0',
    platforms: ['macos', 'linux', 'windows'],
    tags: ['search', 'web', 'Google', 'Brave'],
    body: `## When to Use\n\nUse when you need current information not in your training data, or when the user explicitly asks you to search.\n\n## Providers\n\n1. **Brave Search** (default) -- no API key needed for basic use\n2. **Google Custom Search** -- requires API key\n3. **Perplexity** -- requires API key\n\n## Usage\n\nThe orchestrator automatically selects this skill when it detects a query requiring current information.`,
  },
  {
    name: 'git-workflow',
    category: 'software-development',
    description: 'Git operations: branching, committing, rebasing, PR workflows',
    version: '1.3.0',
    platforms: ['macos', 'linux', 'windows'],
    tags: ['git', 'version control', 'branching', 'PR'],
    body: `## When to Use\n\nUse for any git-related task: creating branches, committing, rebasing, resolving merge conflicts, managing PRs.\n\n## Patterns\n\n### Feature Branch\n\`\`\`bash\ngit checkout -b feature/my-feature\n# ... make changes ...\ngit add -A && git commit -m "add feature"\ngit push -u origin feature/my-feature\ngh pr create --title "Add feature" --body "Description"\n\`\`\`\n\n### Rebase Workflow\n\`\`\`bash\ngit fetch origin\ngit rebase origin/main\n# resolve conflicts if any\ngit push --force-with-lease\n\`\`\``,
  },
  {
    name: 'docker-compose',
    category: 'devops',
    description: 'Manage Docker Compose services, volumes, networks, and builds',
    version: '1.0.0',
    platforms: ['macos', 'linux'],
    tags: ['Docker', 'containers', 'orchestration', 'devops'],
    body: `## When to Use\n\nUse when the user needs to manage Docker Compose services: starting, stopping, building, viewing logs.\n\n## Common Operations\n\n\`\`\`bash\ndocker compose up -d\ndocker compose logs -f service_name\ndocker compose build --no-cache\ndocker compose down -v\n\`\`\``,
  },
  {
    name: 'kubernetes',
    category: 'devops',
    description: 'Kubernetes cluster management: pods, services, deployments, scaling',
    version: '1.1.0',
    platforms: ['macos', 'linux'],
    tags: ['Kubernetes', 'k8s', 'pods', 'deployments'],
    body: `## When to Use\n\nUse for Kubernetes operations: inspecting pods, scaling deployments, managing services, debugging cluster issues.\n\n## Prerequisites\n\n- \`kubectl\` installed and configured\n- Valid kubeconfig\n\n## Common Patterns\n\n\`\`\`bash\nkubectl get pods -n namespace\nkubectl logs -f pod-name\nkubectl scale deployment/name --replicas=3\nkubectl describe pod pod-name\n\`\`\``,
  },
  {
    name: 'jupyter-notebooks',
    category: 'data-science',
    description: 'Create, edit, and execute Jupyter notebooks programmatically',
    version: '1.0.0',
    platforms: ['macos', 'linux', 'windows'],
    tags: ['Jupyter', 'notebooks', 'Python', 'data analysis'],
    body: `## When to Use\n\nUse when the user wants to create data analysis notebooks, run experiments, or visualize data.\n\n## Capabilities\n\n- Create new notebooks from scratch\n- Add/edit/delete cells\n- Execute cells and capture output\n- Export to HTML/PDF\n- Manage kernels`,
  },
  {
    name: 'mcp-server',
    category: 'mcp',
    description: 'Run Hermes as an MCP (Model Context Protocol) server for tool integration',
    version: '1.0.0',
    platforms: ['macos', 'linux', 'windows'],
    tags: ['MCP', 'protocol', 'server', 'integration'],
    body: `## When to Use\n\nUse when you need to expose Hermes tools to other AI systems via the Model Context Protocol.\n\n## Setup\n\n\`\`\`bash\nhermes --mcp-server --port 8080\n\`\`\`\n\n## Protocol\n\nImplements the full MCP specification including:\n- Tool discovery\n- Tool execution\n- Resource management\n- Prompt templates`,
  },
  {
    name: 'computer-use',
    category: 'autonomous-ai-agents',
    description: 'Autonomous desktop control via Claude Computer Use API + PyAutoGUI',
    version: '0.1.0',
    platforms: ['macos', 'linux', 'windows'],
    tags: ['Computer Use', 'Desktop', 'GUI', 'Vision', 'Automation'],
    body: `## When to Use\n\nUse for tasks that require interacting with native desktop applications, visual inspection, or GUI automation that cannot be accomplished through terminal or API tools.\n\n## How It Works\n\n1. Takes a screenshot of the real desktop\n2. Sends it to Claude with the task context\n3. Claude reasons about the screen and issues a single action\n4. Executes via PyAutoGUI (click, type, scroll, drag)\n5. Repeats until complete or max steps reached\n\n## Safety\n\n- Every action checked against dangerous command patterns\n- Rate limited to 120 actions/minute\n- PyAutoGUI failsafe: move mouse to corner to abort`,
  },
  {
    name: 'fine-tuning',
    category: 'mlops',
    description: 'Export training data and launch fine-tuning jobs from agent conversations',
    version: '0.3.0',
    platforms: ['macos', 'linux'],
    tags: ['fine-tuning', 'training', 'LoRA', 'MLOps'],
    body: `## When to Use\n\nUse when the user wants to fine-tune a model on conversation data captured by the agent.\n\n## Pipeline\n\n1. Export: \`fabric_export\` extracts conversations into training format\n2. Filter: quality scoring removes low-signal examples\n3. Train: \`fabric_train\` launches a LoRA job via inference.sh\n4. Monitor: \`fabric_train_status\` checks progress`,
  },
]

export const plugins: WikiPlugin[] = [
  { name: 'agent-monitor', version: '1.0.0', description: 'Real-time agent monitoring bridge -- streams session events to external dashboards and observability tools', tools: [], hooks: ['on_session_start', 'pre_tool_call', 'post_tool_call', 'pre_llm_call', 'post_llm_call', 'on_session_end'] },
  { name: 'memory-fabric', version: '1.2.0', description: 'Persistent memory layer with full-text search, cross-session recall, auto-summarization, and training data export', tools: ['memory_write', 'memory_recall', 'memory_search', 'memory_export'], hooks: ['on_session_start', 'pre_llm_call', 'post_llm_call', 'on_session_end'] },
  { name: 'desktop-control', version: '0.1.0', description: 'Autonomous desktop control via vision model + PyAutoGUI for GUI tasks that cannot be done through terminal', tools: ['desktop_use'], hooks: [] },
  { name: 'notification-relay', version: '0.4.0', description: 'Push notifications to Slack, Teams, or webhooks when agents need attention or complete tasks', tools: ['notify_send'], hooks: ['on_session_start', 'on_session_end'] },
  { name: 'sandbox-runner', version: '0.3.0', description: 'Execute untrusted code in isolated Docker containers with resource limits and network policies', tools: ['sandbox_exec', 'sandbox_status'], hooks: ['pre_tool_call'] },
  { name: 'audit-logger', version: '0.6.0', description: 'Comprehensive audit trail -- logs every tool call, LLM interaction, and approval decision to structured JSON', tools: [], hooks: ['on_session_start', 'pre_tool_call', 'post_tool_call', 'pre_llm_call', 'post_llm_call', 'on_session_end'] },
  { name: 'cost-tracker', version: '0.2.0', description: 'Token usage and cost tracking per session, per agent, and per project with budget alerts', tools: ['cost_report'], hooks: ['post_llm_call', 'on_session_end'] },
  { name: 'cron-scheduler', version: '0.5.0', description: 'Scheduled task execution -- run agent tasks on cron schedules with retry logic and failure alerts', tools: ['cron_create', 'cron_list', 'cron_delete'], hooks: ['on_session_start'] },
]

export const tools: WikiTool[] = [
  { name: 'Read', description: 'Read a file from the filesystem', category: 'File Operations', params: [{ name: 'file_path', type: 'string', required: true, description: 'Absolute path to the file' }, { name: 'offset', type: 'integer', required: false, description: 'Line number to start from' }, { name: 'limit', type: 'integer', required: false, description: 'Number of lines to read' }] },
  { name: 'Edit', description: 'Perform exact string replacements in files', category: 'File Operations', params: [{ name: 'file_path', type: 'string', required: true, description: 'File to modify' }, { name: 'old_string', type: 'string', required: true, description: 'Text to replace' }, { name: 'new_string', type: 'string', required: true, description: 'Replacement text' }] },
  { name: 'Write', description: 'Write content to a file (creates or overwrites)', category: 'File Operations', params: [{ name: 'file_path', type: 'string', required: true, description: 'File to write' }, { name: 'content', type: 'string', required: true, description: 'Content to write' }] },
  { name: 'Glob', description: 'Find files matching a glob pattern', category: 'File Operations', params: [{ name: 'pattern', type: 'string', required: true, description: 'Glob pattern (e.g. **/*.ts)' }, { name: 'path', type: 'string', required: false, description: 'Directory to search in' }] },
  { name: 'Grep', description: 'Search file contents with regex', category: 'File Operations', params: [{ name: 'pattern', type: 'string', required: true, description: 'Regex pattern' }, { name: 'path', type: 'string', required: false, description: 'File or directory to search' }, { name: 'type', type: 'string', required: false, description: 'File type filter (js, py, etc.)' }] },
  { name: 'Bash', description: 'Execute a shell command', category: 'Terminal', params: [{ name: 'command', type: 'string', required: true, description: 'Command to run' }, { name: 'timeout', type: 'integer', required: false, description: 'Timeout in milliseconds' }] },
  { name: 'WebSearch', description: 'Search the web for current information', category: 'Web', params: [{ name: 'query', type: 'string', required: true, description: 'Search query' }, { name: 'provider', type: 'string', required: false, description: 'Search provider (brave, google)' }] },
  { name: 'WebFetch', description: 'Fetch and extract content from a URL', category: 'Web', params: [{ name: 'url', type: 'string', required: true, description: 'URL to fetch' }] },
  { name: 'memory', description: 'Read/write persistent agent memory', category: 'Memory', params: [{ name: 'action', type: 'string', required: true, description: 'add, replace, remove, or read' }, { name: 'content', type: 'string', required: false, description: 'Content to write' }] },
  { name: 'delegate_task', description: 'Delegate a task to a subagent', category: 'Agents', params: [{ name: 'task', type: 'string', required: true, description: 'Task description for the subagent' }, { name: 'model', type: 'string', required: false, description: 'Model override for subagent' }] },
  { name: 'computer_use', description: 'Autonomous desktop control via Computer Use API', category: 'Agents', params: [{ name: 'task_description', type: 'string', required: true, description: 'What to do on the desktop' }, { name: 'max_steps', type: 'integer', required: false, description: 'Max screenshot-action cycles' }] },
  { name: 'fabric_write', description: 'Write an entry to the Icarus fabric memory store', category: 'Memory', params: [{ name: 'content', type: 'string', required: true, description: 'Content to persist' }, { name: 'type', type: 'string', required: true, description: 'Entry type (decision, session, dialogue, review)' }, { name: 'tags', type: 'array', required: false, description: 'Tags for retrieval' }] },
  { name: 'fabric_recall', description: 'Search and recall entries from fabric memory', category: 'Memory', params: [{ name: 'query', type: 'string', required: true, description: 'Search query' }, { name: 'limit', type: 'integer', required: false, description: 'Max results to return' }] },
]

export const commands: WikiCommand[] = [
  { command: 'hermes', description: 'Start an interactive Hermes agent session', flags: ['--tools <toolsets>', '--model <model>', '--auto', '--mcp-server', '--port <port>', '--disable-plugins <list>'] },
  { command: 'hermes batch', description: 'Run a batch of tasks from a file', flags: ['--input <file>', '--output <dir>', '--parallel <n>'] },
  { command: 'hermes config', description: 'View or edit configuration', flags: ['--edit', '--reset', '--show'] },
  { command: 'hermes plugins', description: 'List and manage installed plugins', flags: ['--install <url>', '--remove <name>', '--list', '--enable <name>', '--disable <name>'] },
  { command: 'hermes skills', description: 'List and manage available skills', flags: ['--list', '--search <query>', '--info <name>', '--disable <name>'] },
  { command: 'hermes memory', description: 'Inspect persistent memory stores', flags: ['--show', '--clear', '--export <file>'] },
  { command: 'hermes auth', description: 'Configure API credentials and providers', flags: ['--setup', '--status', '--rotate'] },
  { command: 'hermes cron', description: 'Manage scheduled tasks', flags: ['--list', '--create', '--delete <id>', '--logs <id>'] },
  { command: 'hermes update', description: 'Update Hermes to the latest version', flags: ['--check', '--force'] },
]

export const architecture = `# Architecture

## Core Loop

\`\`\`
User Input
  |
  v
Orchestrator / Planner
  |
  ├── Skill Selection (SKILL.md matching)
  ├── Tool Dispatch (registry.py)
  │     ├── pre_tool_call hooks
  │     ├── Safety check (approval.py)
  │     ├── Tool execution
  │     └── post_tool_call hooks
  ├── LLM Call
  │     ├── pre_llm_call hooks (memory injection)
  │     ├── API call (streaming)
  │     └── post_llm_call hooks (learning capture)
  └── Response
        ├── Text output
        └── Tool calls (loop back)
\`\`\`

## Memory Architecture

Hermes uses a dual-layer memory system:

### Layer 1: Session Memory
- Frozen at session start for prefix cache stability
- Includes MEMORY.md + USER.md snapshots
- Never mutated mid-session

### Layer 2: Fabric (Icarus Plugin)
- SQLite + FTS5 full-text search
- Cross-agent memory sharing
- Automatic session summarization
- Creative state tracking (themes, questions, learnings)
- Training data export for fine-tuning

## Safety System

### Auto Mode
- Risk classifier categorizes every tool call
- 40+ regex patterns for dangerous commands
- Smart approval via auxiliary LLM for ambiguous cases
- Manual fallback for high-risk operations

### Approval Flow
1. Agent proposes tool call
2. \`detect_dangerous_command()\` pattern matching
3. If dangerous: block or route to human approval
4. If safe: execute immediately
5. Permanent allowlist for trusted patterns

## Plugin System

Plugins register via \`register(ctx)\`:
- \`ctx.register_tool()\` -- add tools to the registry
- \`ctx.register_hook()\` -- subscribe to lifecycle events
- \`ctx.inject_message()\` -- send messages into active sessions

### Hook Lifecycle
| Hook | When | Use Case |
|------|------|----------|
| on_session_start | Session begins | Load context, initialize state |
| pre_llm_call | Before API call | Inject memories, context |
| post_llm_call | After response | Capture decisions, learnings |
| pre_tool_call | Before tool exec | Logging, monitoring |
| post_tool_call | After tool exec | Result processing |
| on_session_end | Session ends | Summarize, persist, cleanup |

## Provider Resolution

Hermes auto-detects available AI providers:
1. OpenRouter (OPENROUTER_API_KEY)
2. Nous Portal (auth.json)
3. Custom endpoint (config.yaml)
4. Codex OAuth
5. Native Anthropic
6. Direct API keys (z.ai, Kimi, MiniMax, etc.)
`

export const changelog = `# Changelog

## v0.7.0 (2026-04-01)
- Added Computer Use skill (Anthropic beta)
- Plugin system: \`inject_message()\` for external message injection
- Auto Mode safety improvements: 12 new dangerous patterns
- Credential pool rotation for custom endpoints
- Fix: stale OPENAI_BASE_URL in tests

## v0.6.2 (2026-03-15)
- Icarus: cross-agent feedback sharing
- Honcho integration for multi-session context
- Compression threshold now configurable
- Fix: memory snapshot race condition

## v0.6.0 (2026-03-01)
- MCP server mode (Model Context Protocol)
- Cron scheduler for automated tasks
- WhatsApp bridge plugin
- 20+ new bundled skills
- Tirith security scanner integration

## v0.5.0 (2026-02-01)
- Icarus memory plugin (fabric write/recall)
- Fine-tuning export pipeline
- Creative state tracking
- Session timeline visualization
- Multi-agent delegation improvements

## v0.4.0 (2026-01-15)
- Auto Mode with risk classification
- Smart approval via auxiliary LLM
- Telegram and Discord bridge plugins
- Browser automation skill (Playwright)

## v0.3.0 (2025-12-01)
- Persistent memory (MEMORY.md + USER.md)
- Skill auto-discovery and platform matching
- Configuration system (config.yaml)
- SOUL.md personality files

## v0.2.0 (2025-11-01)
- Plugin system with hook registration
- Tool registry with availability checks
- Context compression
- Streaming responses

## v0.1.0 (2025-10-01)
- Initial release
- Core agent loop
- Terminal, file, and web tools
- Basic skill system
`

export const mockConfig = `# Hermes Agent Configuration
# ~/.hermes/config.yaml

agent:
  max_turns: 60
  reasoning_effort: medium

display:
  personality: default
  skin: default
  streaming: true
  show_reasoning: false

memory:
  memory_enabled: true
  memory_char_limit: 2200
  user_char_limit: 1375
  nudge_interval: 10

security:
  redact_secrets: true
  tirith_enabled: true
  tirith_timeout: 5
  tirith_fail_open: true

skills:
  disabled: []
  external_dirs: []

plugins:
  disabled: []

terminal:
  backend: local
  timeout: 180

model:
  default: openai/gpt-4o
  provider: openrouter

compression:
  enabled: true
  target_ratio: 0.2
  threshold: 0.85
`

export const mockMemory = {
  memory: `# Agent Memory

## Project Conventions
- This monorepo uses pnpm workspaces
- Tests run with vitest, not jest
- CSS modules preferred over styled-components
- API routes follow /api/v1/{resource} pattern

## Tool Quirks
- Grep with multiline flag needed for cross-line patterns
- Edit tool fails silently if old_string isn't unique -- always provide enough context
- Bash timeout defaults to 2 minutes, use explicit timeout for long builds

## Learnings
- User prefers concise responses with no trailing summaries
- Always check git status before making commits
- Run lint before build to catch errors early
`,
  user: `# User Profile

## Role
Senior full-stack engineer working on a SaaS platform.

## Preferences
- Terse communication style
- Prefers explicit over implicit
- Values production-ready code over demos
- Likes monospace fonts and dark themes

## Tech Stack
- TypeScript, React, Node.js
- PostgreSQL, Redis
- Docker, Kubernetes
- Hono for API routes, Zod for validation
`,
}

export const mockSoul = `# Hermes Agent Persona

You are Hermes, a precise and capable AI assistant.

## Communication Style
- Direct and concise
- Technical accuracy over politeness
- Show reasoning when it adds value
- Admit uncertainty instead of guessing

## Principles
- Production code, not demos
- Simplest solution that works
- Delete dead code immediately
- DRY after the second occurrence
- Composition over inheritance
`
