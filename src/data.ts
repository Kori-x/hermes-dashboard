export type Phase =
  | 'idle'
  | 'processing'
  | 'waiting_for_input'
  | 'waiting_for_approval'
  | 'compacting'
  | 'ended'

export type ToolStatus = 'running' | 'success' | 'error' | 'interrupted' | 'waiting_for_approval'

export interface ToolCall {
  id: string
  name: string
  input: string
  status: ToolStatus
  timestamp: Date
  durationMs?: number
}

export interface Subagent {
  id: string
  description: string
  tools: ToolCall[]
  startTime: Date
}

export interface Agent {
  sessionId: string
  displayTitle: string
  projectName: string
  cwd: string
  phase: Phase
  lastActivity: Date
  createdAt: Date
  pid: number
  tty: string
  isInTmux: boolean
  lastMessage: string
  lastMessageRole: 'user' | 'assistant' | 'tool'
  lastToolName?: string
  toolsInProgress: ToolCall[]
  recentTools: ToolCall[]
  subagents: Subagent[]
  approvalTool?: string
  approvalInput?: string
  tokenCount: number
  turnCount: number
}

const now = new Date()
const ago = (min: number) => new Date(now.getTime() - min * 60_000)

export const agents: Agent[] = [
  {
    sessionId: 'sess_a1b2c3',
    displayTitle: 'refactor auth middleware',
    projectName: 'hermes-api',
    cwd: '/Users/ash/hermes-api',
    phase: 'processing',
    lastActivity: ago(0.5),
    createdAt: ago(47),
    pid: 48291,
    tty: 'ttys003',
    isInTmux: true,
    lastMessage: 'Refactoring the session validation logic to use the new token store...',
    lastMessageRole: 'assistant',
    lastToolName: 'Edit',
    toolsInProgress: [
      { id: 't1', name: 'Edit', input: 'src/middleware/auth.ts', status: 'running', timestamp: ago(0.3) },
    ],
    recentTools: [
      { id: 't0a', name: 'Read', input: 'src/middleware/auth.ts', status: 'success', timestamp: ago(2), durationMs: 120 },
      { id: 't0b', name: 'Grep', input: 'validateSession', status: 'success', timestamp: ago(1.5), durationMs: 340 },
      { id: 't0c', name: 'Read', input: 'src/stores/token.ts', status: 'success', timestamp: ago(1), durationMs: 95 },
      { id: 't0d', name: 'Read', input: 'src/types/session.ts', status: 'success', timestamp: ago(0.8), durationMs: 88 },
    ],
    subagents: [
      {
        id: 'agent_x1',
        description: 'find all auth middleware usages',
        startTime: ago(3),
        tools: [
          { id: 'st1', name: 'Grep', input: 'authMiddleware', status: 'success', timestamp: ago(2.8), durationMs: 450 },
          { id: 'st2', name: 'Read', input: 'src/routes/index.ts', status: 'success', timestamp: ago(2.5), durationMs: 110 },
          { id: 'st3', name: 'Read', input: 'src/routes/api.ts', status: 'success', timestamp: ago(2.2), durationMs: 105 },
        ],
      },
    ],
    tokenCount: 284_300,
    turnCount: 12,
  },
  {
    sessionId: 'sess_d4e5f6',
    displayTitle: 'fix postgres connection pooling',
    projectName: 'hermes-api',
    cwd: '/Users/ash/hermes-api',
    phase: 'waiting_for_approval',
    lastActivity: ago(1),
    createdAt: ago(22),
    pid: 48455,
    tty: 'ttys005',
    isInTmux: true,
    lastMessage: 'I need to run the migration to update the pool configuration.',
    lastMessageRole: 'assistant',
    approvalTool: 'Bash',
    approvalInput: 'npx prisma migrate dev --name update-pool-config',
    toolsInProgress: [],
    recentTools: [
      { id: 't2a', name: 'Read', input: 'prisma/schema.prisma', status: 'success', timestamp: ago(5), durationMs: 130 },
      { id: 't2b', name: 'Edit', input: 'src/db/pool.ts', status: 'success', timestamp: ago(3), durationMs: 200 },
      { id: 't2c', name: 'Bash', input: 'npx prisma validate', status: 'success', timestamp: ago(2), durationMs: 3400 },
    ],
    subagents: [],
    tokenCount: 156_800,
    turnCount: 8,
  },
  {
    sessionId: 'sess_g7h8i9',
    displayTitle: 'add webhook retry logic',
    projectName: 'hermes-events',
    cwd: '/Users/ash/hermes-events',
    phase: 'processing',
    lastActivity: ago(0.2),
    createdAt: ago(15),
    pid: 49102,
    tty: 'ttys007',
    isInTmux: true,
    lastMessage: 'Writing the exponential backoff implementation with jitter...',
    lastMessageRole: 'assistant',
    lastToolName: 'Write',
    toolsInProgress: [
      { id: 't3', name: 'Write', input: 'src/webhooks/retry.ts', status: 'running', timestamp: ago(0.1) },
    ],
    recentTools: [
      { id: 't3a', name: 'Glob', input: 'src/webhooks/**/*.ts', status: 'success', timestamp: ago(8), durationMs: 45 },
      { id: 't3b', name: 'Read', input: 'src/webhooks/dispatcher.ts', status: 'success', timestamp: ago(6), durationMs: 150 },
      { id: 't3c', name: 'Read', input: 'src/config/retry.ts', status: 'success', timestamp: ago(4), durationMs: 90 },
    ],
    subagents: [
      {
        id: 'agent_y2',
        description: 'research retry patterns in codebase',
        startTime: ago(10),
        tools: [
          { id: 'st4', name: 'Grep', input: 'retry|backoff|exponential', status: 'success', timestamp: ago(9.5), durationMs: 520 },
          { id: 'st5', name: 'Read', input: 'src/queue/worker.ts', status: 'success', timestamp: ago(9), durationMs: 140 },
        ],
      },
    ],
    tokenCount: 98_400,
    turnCount: 6,
  },
  {
    sessionId: 'sess_j0k1l2',
    displayTitle: 'deploy monitoring dashboards',
    projectName: 'hermes-infra',
    cwd: '/Users/ash/hermes-infra',
    phase: 'idle',
    lastActivity: ago(12),
    createdAt: ago(55),
    pid: 47833,
    tty: 'ttys001',
    isInTmux: true,
    lastMessage: 'Done. The Grafana dashboards have been deployed to staging.',
    lastMessageRole: 'assistant',
    toolsInProgress: [],
    recentTools: [
      { id: 't4a', name: 'Bash', input: 'terraform plan -out=tfplan', status: 'success', timestamp: ago(18), durationMs: 12400 },
      { id: 't4b', name: 'Bash', input: 'terraform apply tfplan', status: 'success', timestamp: ago(15), durationMs: 45200 },
      { id: 't4c', name: 'Bash', input: 'curl -s https://grafana.staging/api/health', status: 'success', timestamp: ago(13), durationMs: 890 },
    ],
    subagents: [],
    tokenCount: 342_100,
    turnCount: 19,
  },
  {
    sessionId: 'sess_m3n4o5',
    displayTitle: 'implement rate limiter',
    projectName: 'hermes-gateway',
    cwd: '/Users/ash/hermes-gateway',
    phase: 'processing',
    lastActivity: ago(0.1),
    createdAt: ago(8),
    pid: 49500,
    tty: 'ttys009',
    isInTmux: true,
    lastMessage: 'Testing the sliding window rate limiter with Redis...',
    lastMessageRole: 'assistant',
    lastToolName: 'Bash',
    toolsInProgress: [
      { id: 't5', name: 'Bash', input: 'npm test -- --grep "rate limiter"', status: 'running', timestamp: ago(0.3) },
    ],
    recentTools: [
      { id: 't5a', name: 'Write', input: 'src/ratelimit/sliding-window.ts', status: 'success', timestamp: ago(2), durationMs: 180 },
      { id: 't5b', name: 'Write', input: 'src/ratelimit/__tests__/sliding-window.test.ts', status: 'success', timestamp: ago(1.5), durationMs: 210 },
      { id: 't5c', name: 'Edit', input: 'src/middleware/index.ts', status: 'success', timestamp: ago(1), durationMs: 95 },
    ],
    subagents: [],
    tokenCount: 67_200,
    turnCount: 4,
  },
  {
    sessionId: 'sess_p6q7r8',
    displayTitle: 'migrate user service to grpc',
    projectName: 'hermes-users',
    cwd: '/Users/ash/hermes-users',
    phase: 'waiting_for_input',
    lastActivity: ago(5),
    createdAt: ago(120),
    pid: 46200,
    tty: 'ttys011',
    isInTmux: true,
    lastMessage: 'The proto definitions are ready. Should I generate the Go client stubs now, or do you want to review the proto files first?',
    lastMessageRole: 'assistant',
    toolsInProgress: [],
    recentTools: [
      { id: 't6a', name: 'Write', input: 'proto/user/v1/user.proto', status: 'success', timestamp: ago(7), durationMs: 150 },
      { id: 't6b', name: 'Write', input: 'proto/user/v1/service.proto', status: 'success', timestamp: ago(6), durationMs: 170 },
      { id: 't6c', name: 'Read', input: 'src/handlers/user.go', status: 'success', timestamp: ago(10), durationMs: 110 },
    ],
    subagents: [
      {
        id: 'agent_z3',
        description: 'audit current REST endpoints',
        startTime: ago(25),
        tools: [
          { id: 'st6', name: 'Grep', input: 'router\\.Handle', status: 'success', timestamp: ago(24), durationMs: 380 },
          { id: 'st7', name: 'Read', input: 'src/routes/routes.go', status: 'success', timestamp: ago(23), durationMs: 95 },
          { id: 'st8', name: 'Read', input: 'src/routes/middleware.go', status: 'success', timestamp: ago(22), durationMs: 100 },
          { id: 'st9', name: 'Grep', input: 'func.*Handler', status: 'success', timestamp: ago(21), durationMs: 410 },
        ],
      },
    ],
    tokenCount: 512_900,
    turnCount: 31,
  },
]

export function phaseLabel(phase: Phase): string {
  switch (phase) {
    case 'idle': return 'IDLE'
    case 'processing': return 'PROCESSING'
    case 'waiting_for_input': return 'AWAITING INPUT'
    case 'waiting_for_approval': return 'NEEDS APPROVAL'
    case 'compacting': return 'COMPACTING'
    case 'ended': return 'ENDED'
  }
}

export function phaseColor(phase: Phase): string {
  switch (phase) {
    case 'processing': return 'var(--text-display)'
    case 'waiting_for_approval': return 'var(--accent)'
    case 'waiting_for_input': return 'var(--warning)'
    case 'idle': return 'var(--text-secondary)'
    case 'compacting': return 'var(--interactive)'
    case 'ended': return 'var(--text-disabled)'
  }
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m ago`
}

export function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export function toolStatusColor(status: ToolStatus): string {
  switch (status) {
    case 'running': return 'var(--text-display)'
    case 'success': return 'var(--success)'
    case 'error': return 'var(--accent)'
    case 'interrupted': return 'var(--warning)'
    case 'waiting_for_approval': return 'var(--accent)'
  }
}
