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
  cwd: string
  phase: Phase
  lastActivity: Date
  createdAt: Date
  pid: number
  tty: string
  tmuxTarget: string
  lastMessage: string
  lastMessageRole: 'user' | 'assistant' | 'tool'
  lastToolName?: string
  toolsInProgress: ToolCall[]
  recentTools: ToolCall[]
  subagents: Subagent[]
  approvalTool?: string
  approvalInput?: string
  tokenCount: number
  maxTokens: number
  turnCount: number
  filesModified: number
  linesChanged: number
  costUsd: number
}

export interface ActivityEvent {
  id: string
  sessionId: string
  agentTitle: string
  type: 'tool' | 'message' | 'approval' | 'phase'
  content: string
  timestamp: Date
  color?: string
}

const now = new Date()
const ago = (min: number) => new Date(now.getTime() - min * 60_000)

export const agents: Agent[] = [
  {
    sessionId: 'sess_7f2a91',
    displayTitle: 'add unit test target to HermesIsland',
    cwd: '/Users/ash/hermes-island',
    phase: 'processing',
    lastActivity: ago(0.3),
    createdAt: ago(18),
    pid: 52140,
    tty: 'ttys003',
    tmuxTarget: 'hermes:0.0',
    lastMessage: 'Writing XCTestCase for ConversationParser. Testing incremental parse with offset tracking...',
    lastMessageRole: 'assistant',
    lastToolName: 'Write',
    toolsInProgress: [
      { id: 't1a', name: 'Write', input: 'HermesIslandTests/ConversationParserTests.swift', status: 'running', timestamp: ago(0.2) },
    ],
    recentTools: [
      { id: 't1b', name: 'Read', input: 'HermesIsland/Services/Session/ConversationParser.swift', status: 'success', timestamp: ago(4), durationMs: 95 },
      { id: 't1c', name: 'Read', input: 'HermesIsland/Models/SessionState.swift', status: 'success', timestamp: ago(3.5), durationMs: 110 },
      { id: 't1d', name: 'Bash', input: 'xcodebuild -scheme HermesIsland -showBuildSettings | grep PRODUCT_BUNDLE', status: 'success', timestamp: ago(3), durationMs: 2800 },
      { id: 't1e', name: 'Edit', input: 'HermesIsland.xcodeproj/project.pbxproj', status: 'success', timestamp: ago(2), durationMs: 340 },
      { id: 't1f', name: 'Write', input: 'HermesIslandTests/TmuxSessionMatcherTests.swift', status: 'success', timestamp: ago(1), durationMs: 190 },
      { id: 't1g', name: 'Write', input: 'HermesIslandTests/MCPToolFormatterTests.swift', status: 'success', timestamp: ago(0.6), durationMs: 160 },
    ],
    subagents: [
      {
        id: 'agent_t1',
        description: 'explore testable services',
        startTime: ago(6),
        tools: [
          { id: 'st1', name: 'Glob', input: 'HermesIsland/Services/**/*.swift', status: 'success', timestamp: ago(5.8), durationMs: 32 },
          { id: 'st2', name: 'Read', input: 'HermesIsland/Services/Tmux/TmuxSessionMatcher.swift', status: 'success', timestamp: ago(5.5), durationMs: 88 },
          { id: 'st3', name: 'Read', input: 'HermesIsland/Utilities/MCPToolFormatter.swift', status: 'success', timestamp: ago(5.2), durationMs: 75 },
        ],
      },
    ],
    tokenCount: 187_600,
    maxTokens: 1_000_000,
    turnCount: 9,
    filesModified: 5,
    linesChanged: 342,
    costUsd: 1.87,
  },
  {
    sessionId: 'sess_3bc4d8',
    displayTitle: 'fix swift concurrency warnings',
    cwd: '/Users/ash/hermes-island',
    phase: 'waiting_for_approval',
    lastActivity: ago(0.8),
    createdAt: ago(11),
    pid: 52388,
    tty: 'ttys005',
    tmuxTarget: 'hermes:0.1',
    lastMessage: 'I need to rebuild to verify the @MainActor annotations resolve the sendability warnings.',
    lastMessageRole: 'assistant',
    approvalTool: 'Bash',
    approvalInput: 'xcodebuild -scheme HermesIsland -configuration Debug build CODE_SIGNING_ALLOWED=NO 2>&1 | tail -20',
    toolsInProgress: [],
    recentTools: [
      { id: 't2a', name: 'Read', input: 'HermesIsland/Services/Shared/ProcessExecutor.swift', status: 'success', timestamp: ago(5), durationMs: 85 },
      { id: 't2b', name: 'Read', input: 'HermesIsland/Services/State/SessionStore.swift', status: 'success', timestamp: ago(4), durationMs: 130 },
      { id: 't2c', name: 'Grep', input: '@Sendable|nonisolated', status: 'success', timestamp: ago(3.5), durationMs: 220 },
      { id: 't2d', name: 'Edit', input: 'HermesIsland/Services/Shared/ProcessExecutor.swift', status: 'success', timestamp: ago(2.5), durationMs: 150 },
      { id: 't2e', name: 'Edit', input: 'HermesIsland/Services/Shared/ProcessTreeBuilder.swift', status: 'success', timestamp: ago(2), durationMs: 120 },
      { id: 't2f', name: 'Edit', input: 'HermesIsland/Services/State/SessionStore.swift', status: 'success', timestamp: ago(1.5), durationMs: 180 },
      { id: 't2g', name: 'Edit', input: 'HermesIsland/UI/Views/NotchView.swift', status: 'success', timestamp: ago(1), durationMs: 140 },
    ],
    subagents: [],
    tokenCount: 124_500,
    maxTokens: 1_000_000,
    turnCount: 6,
    filesModified: 4,
    linesChanged: 47,
    costUsd: 1.24,
  },
  {
    sessionId: 'sess_e9f012',
    displayTitle: 'build hermes dashboard',
    cwd: '/Users/ash/hermes-dashboard',
    phase: 'processing',
    lastActivity: ago(0.1),
    createdAt: ago(35),
    pid: 51900,
    tty: 'ttys007',
    tmuxTarget: 'hermes:1.0',
    lastMessage: 'Redesigning the dashboard with the Nothing design system. Adding context rings, segmented bars, and activity feed...',
    lastMessageRole: 'assistant',
    lastToolName: 'Edit',
    toolsInProgress: [
      { id: 't3a', name: 'Edit', input: 'src/app.css', status: 'running', timestamp: ago(0.1) },
      { id: 't3b', name: 'Write', input: 'src/components/ActivityFeed.tsx', status: 'running', timestamp: ago(0.1) },
    ],
    recentTools: [
      { id: 't3c', name: 'Read', input: 'src/data.ts', status: 'success', timestamp: ago(3), durationMs: 70 },
      { id: 't3d', name: 'Read', input: 'src/App.tsx', status: 'success', timestamp: ago(2.5), durationMs: 55 },
      { id: 't3e', name: 'Write', input: 'src/components/ToolBreakdown.tsx', status: 'success', timestamp: ago(1.5), durationMs: 200 },
      { id: 't3f', name: 'Edit', input: 'src/components/Stats.tsx', status: 'success', timestamp: ago(0.8), durationMs: 170 },
      { id: 't3g', name: 'Edit', input: 'src/components/AgentDetail.tsx', status: 'success', timestamp: ago(0.5), durationMs: 230 },
    ],
    subagents: [],
    tokenCount: 341_200,
    maxTokens: 1_000_000,
    turnCount: 22,
    filesModified: 9,
    linesChanged: 1205,
    costUsd: 3.41,
  },
  {
    sessionId: 'sess_5a6b7c',
    displayTitle: 'set up code signing for local dev',
    cwd: '/Users/ash/hermes-island',
    phase: 'waiting_for_input',
    lastActivity: ago(4),
    createdAt: ago(25),
    pid: 52050,
    tty: 'ttys009',
    tmuxTarget: 'hermes:1.1',
    lastMessage: 'I found two signing identities. Which team should I use?\n\n1. 2DKS5U9LV4 (personal)\n2. 8XJNR2R4HK (company)\n\nOr should I set up automatic signing with Xcode managed profiles?',
    lastMessageRole: 'assistant',
    toolsInProgress: [],
    recentTools: [
      { id: 't4a', name: 'Bash', input: 'security find-identity -v -p codesigning', status: 'success', timestamp: ago(5), durationMs: 1200 },
      { id: 't4b', name: 'Read', input: 'HermesIsland.xcodeproj/project.pbxproj', status: 'success', timestamp: ago(6), durationMs: 150 },
      { id: 't4c', name: 'Grep', input: 'CODE_SIGN_IDENTITY|DEVELOPMENT_TEAM', status: 'success', timestamp: ago(6.5), durationMs: 180 },
    ],
    subagents: [],
    tokenCount: 89_300,
    maxTokens: 1_000_000,
    turnCount: 5,
    filesModified: 0,
    linesChanged: 0,
    costUsd: 0.89,
  },
  {
    sessionId: 'sess_d8e9f0',
    displayTitle: 'implement hook socket reconnection',
    cwd: '/Users/ash/hermes-island',
    phase: 'processing',
    lastActivity: ago(0.5),
    createdAt: ago(42),
    pid: 51700,
    tty: 'ttys011',
    tmuxTarget: 'hermes:2.0',
    lastMessage: 'Adding exponential backoff to the socket reconnection logic. The current implementation drops events if the socket disconnects briefly...',
    lastMessageRole: 'assistant',
    lastToolName: 'Edit',
    toolsInProgress: [
      { id: 't5a', name: 'Edit', input: 'HermesIsland/Services/Hooks/HookSocketServer.swift', status: 'running', timestamp: ago(0.3) },
    ],
    recentTools: [
      { id: 't5b', name: 'Read', input: 'HermesIsland/Services/Hooks/HookSocketServer.swift', status: 'success', timestamp: ago(8), durationMs: 140 },
      { id: 't5c', name: 'Grep', input: 'NWListener|NWConnection', status: 'success', timestamp: ago(7), durationMs: 310 },
      { id: 't5d', name: 'Read', input: 'HermesIsland/Services/Hooks/HookInstaller.swift', status: 'success', timestamp: ago(6), durationMs: 100 },
      { id: 't5e', name: 'Edit', input: 'HermesIsland/Services/Hooks/HookSocketServer.swift', status: 'success', timestamp: ago(3), durationMs: 280 },
      { id: 't5f', name: 'Write', input: 'HermesIsland/Services/Hooks/SocketReconnector.swift', status: 'success', timestamp: ago(1.5), durationMs: 210 },
    ],
    subagents: [
      {
        id: 'agent_s1',
        description: 'check Network.framework reconnection patterns',
        startTime: ago(9),
        tools: [
          { id: 'st4', name: 'WebSearch', input: 'NWListener automatic reconnection swift', status: 'success', timestamp: ago(8.8), durationMs: 1400 },
          { id: 'st5', name: 'Grep', input: 'stateUpdateHandler|connectionState', status: 'success', timestamp: ago(8.2), durationMs: 190 },
        ],
      },
    ],
    tokenCount: 267_800,
    maxTokens: 1_000_000,
    turnCount: 14,
    filesModified: 3,
    linesChanged: 189,
    costUsd: 2.68,
  },
  {
    sessionId: 'sess_1a2b3c',
    displayTitle: 'add dmg notarization to release script',
    cwd: '/Users/ash/hermes-island',
    phase: 'idle',
    lastActivity: ago(15),
    createdAt: ago(60),
    pid: 51200,
    tty: 'ttys013',
    tmuxTarget: 'hermes:2.1',
    lastMessage: 'Done. The release script now submits the DMG to Apple notarization service and staples the ticket on success. Run scripts/create-release.sh to test it.',
    lastMessageRole: 'assistant',
    toolsInProgress: [],
    recentTools: [
      { id: 't6a', name: 'Read', input: 'scripts/create-release.sh', status: 'success', timestamp: ago(30), durationMs: 60 },
      { id: 't6b', name: 'Read', input: 'scripts/build.sh', status: 'success', timestamp: ago(28), durationMs: 55 },
      { id: 't6c', name: 'Edit', input: 'scripts/create-release.sh', status: 'success', timestamp: ago(22), durationMs: 280 },
      { id: 't6d', name: 'Bash', input: 'xcrun notarytool --help', status: 'success', timestamp: ago(20), durationMs: 800 },
      { id: 't6e', name: 'Edit', input: 'scripts/create-release.sh', status: 'success', timestamp: ago(18), durationMs: 190 },
      { id: 't6f', name: 'Bash', input: 'shellcheck scripts/create-release.sh', status: 'success', timestamp: ago(16), durationMs: 450 },
    ],
    subagents: [],
    tokenCount: 198_400,
    maxTokens: 1_000_000,
    turnCount: 11,
    filesModified: 1,
    linesChanged: 67,
    costUsd: 1.98,
  },
  {
    sessionId: 'sess_4d5e6f',
    displayTitle: 'refactor NotchViewModel state machine',
    cwd: '/Users/ash/hermes-island',
    phase: 'processing',
    lastActivity: ago(0.2),
    createdAt: ago(30),
    pid: 51500,
    tty: 'ttys015',
    tmuxTarget: 'hermes:3.0',
    lastMessage: 'Extracting the animation state transitions into a dedicated enum with associated values. This will make the notch open/close/expand states more predictable...',
    lastMessageRole: 'assistant',
    lastToolName: 'Edit',
    toolsInProgress: [
      { id: 't7a', name: 'Edit', input: 'HermesIsland/Core/NotchViewModel.swift', status: 'running', timestamp: ago(0.1) },
    ],
    recentTools: [
      { id: 't7b', name: 'Read', input: 'HermesIsland/Core/NotchViewModel.swift', status: 'success', timestamp: ago(10), durationMs: 160 },
      { id: 't7c', name: 'Read', input: 'HermesIsland/Core/NotchActivityCoordinator.swift', status: 'success', timestamp: ago(8), durationMs: 120 },
      { id: 't7d', name: 'Read', input: 'HermesIsland/UI/Views/NotchView.swift', status: 'success', timestamp: ago(6), durationMs: 200 },
      { id: 't7e', name: 'Grep', input: 'notchState|isExpanded|isOpen', status: 'success', timestamp: ago(5), durationMs: 280 },
      { id: 't7f', name: 'Write', input: 'HermesIsland/Core/NotchAnimationState.swift', status: 'success', timestamp: ago(2), durationMs: 250 },
      { id: 't7g', name: 'Edit', input: 'HermesIsland/Core/NotchActivityCoordinator.swift', status: 'success', timestamp: ago(1), durationMs: 310 },
    ],
    subagents: [
      {
        id: 'agent_n1',
        description: 'map all NotchViewModel consumers',
        startTime: ago(12),
        tools: [
          { id: 'st6', name: 'Grep', input: 'NotchViewModel', status: 'success', timestamp: ago(11.5), durationMs: 150 },
          { id: 'st7', name: 'Grep', input: '@ObservedObject.*notch|@StateObject.*notch', status: 'success', timestamp: ago(11), durationMs: 180 },
          { id: 'st8', name: 'Read', input: 'HermesIsland/UI/Window/NotchWindowController.swift', status: 'success', timestamp: ago(10.5), durationMs: 90 },
        ],
      },
    ],
    tokenCount: 445_600,
    maxTokens: 1_000_000,
    turnCount: 18,
    filesModified: 4,
    linesChanged: 298,
    costUsd: 4.46,
  },
]

export const activityFeed: ActivityEvent[] = [
  { id: 'e1', sessionId: 'sess_4d5e6f', agentTitle: 'refactor NotchViewModel', type: 'tool', content: 'Edit NotchViewModel.swift', timestamp: ago(0.1), color: 'var(--text-display)' },
  { id: 'e2', sessionId: 'sess_7f2a91', agentTitle: 'add unit tests', type: 'tool', content: 'Write ConversationParserTests.swift', timestamp: ago(0.2), color: 'var(--text-display)' },
  { id: 'e3', sessionId: 'sess_e9f012', agentTitle: 'build dashboard', type: 'tool', content: 'Edit app.css', timestamp: ago(0.3), color: 'var(--text-display)' },
  { id: 'e4', sessionId: 'sess_d8e9f0', agentTitle: 'hook reconnection', type: 'tool', content: 'Edit HookSocketServer.swift', timestamp: ago(0.5), color: 'var(--text-display)' },
  { id: 'e5', sessionId: 'sess_3bc4d8', agentTitle: 'fix concurrency warnings', type: 'approval', content: 'Bash: xcodebuild build', timestamp: ago(0.8), color: 'var(--accent)' },
  { id: 'e6', sessionId: 'sess_7f2a91', agentTitle: 'add unit tests', type: 'tool', content: 'Write MCPToolFormatterTests.swift', timestamp: ago(1), color: 'var(--success)' },
  { id: 'e7', sessionId: 'sess_4d5e6f', agentTitle: 'refactor NotchViewModel', type: 'tool', content: 'Edit NotchActivityCoordinator.swift', timestamp: ago(1.5), color: 'var(--success)' },
  { id: 'e8', sessionId: 'sess_d8e9f0', agentTitle: 'hook reconnection', type: 'tool', content: 'Write SocketReconnector.swift', timestamp: ago(2), color: 'var(--success)' },
  { id: 'e9', sessionId: 'sess_5a6b7c', agentTitle: 'code signing', type: 'phase', content: 'Waiting for input', timestamp: ago(4), color: 'var(--warning)' },
  { id: 'e10', sessionId: 'sess_1a2b3c', agentTitle: 'dmg notarization', type: 'phase', content: 'Session idle', timestamp: ago(15), color: 'var(--text-disabled)' },
  { id: 'e11', sessionId: 'sess_e9f012', agentTitle: 'build dashboard', type: 'tool', content: 'Edit AgentDetail.tsx', timestamp: ago(0.5), color: 'var(--success)' },
  { id: 'e12', sessionId: 'sess_7f2a91', agentTitle: 'add unit tests', type: 'tool', content: 'Edit project.pbxproj', timestamp: ago(2), color: 'var(--success)' },
].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

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
    case 'idle': return 'var(--text-disabled)'
    case 'compacting': return 'var(--interactive)'
    case 'ended': return 'var(--text-disabled)'
  }
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ${minutes % 60}m`
  return `${Math.floor(hours / 24)}d`
}

export function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60_000)}m ${Math.floor((ms % 60_000) / 1000)}s`
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

export function sessionDuration(agent: Agent): string {
  const ms = Date.now() - agent.createdAt.getTime()
  const minutes = Math.floor(ms / 60_000)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m`
}

export function getToolBreakdown(agentsList: Agent[]): { name: string; count: number }[] {
  const counts: Record<string, number> = {}
  for (const agent of agentsList) {
    const all = [...agent.recentTools, ...agent.toolsInProgress]
    for (const sub of agent.subagents) all.push(...sub.tools)
    for (const t of all) {
      counts[t.name] = (counts[t.name] || 0) + 1
    }
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}
