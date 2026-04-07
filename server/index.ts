import { createServer as createNetServer, type Socket } from 'net'
import { WebSocketServer, WebSocket } from 'ws'
import { unlinkSync, existsSync } from 'fs'

const SOCKET_PATH = '/tmp/hermes-dashboard.sock'
const WS_PORT = 3001

// =========================================================================
// Dashboard state
// =========================================================================

interface ToolEntry {
  id: string
  name: string
  input: string
  status: string
  timestamp: Date
  durationMs?: number
}

interface ActivityEntry {
  id: string
  sessionId: string
  agentTitle: string
  type: 'tool' | 'message' | 'approval' | 'phase'
  content: string
  timestamp: Date
  color: string
}

interface Session {
  sessionId: string
  agent: string
  cwd: string
  phase: string
  pid: number
  tty: string
  lastActivity: Date
  createdAt: Date
  lastMessage: string
  lastMessageRole: 'user' | 'assistant' | 'tool'
  lastToolName?: string
  toolsInProgress: Map<string, ToolEntry>
  recentTools: ToolEntry[]
  turnCount: number
  filesModified: Set<string>
  firstUserMessage?: string
}

const sessions = new Map<string, Session>()
const activity: ActivityEntry[] = []
let counter = 0

function getOrCreateSession(sessionId: string, payload: Record<string, unknown>): Session {
  let s = sessions.get(sessionId)
  if (!s) {
    s = {
      sessionId,
      agent: (payload.agent as string) || 'agent',
      cwd: (payload.cwd as string) || '',
      phase: 'waiting_for_input',
      pid: (payload.pid as number) || 0,
      tty: (payload.tty as string) || '',
      lastActivity: new Date(),
      createdAt: new Date(),
      lastMessage: '',
      lastMessageRole: 'assistant',
      toolsInProgress: new Map(),
      recentTools: [],
      turnCount: 0,
      filesModified: new Set(),
    }
    sessions.set(sessionId, s)
  }
  return s
}

function toolInputSummary(tool: string, input: unknown): string {
  if (!input || typeof input !== 'object') return String(input || '')
  const o = input as Record<string, unknown>
  if (o.file_path) return String(o.file_path)
  if (o.command) return String(o.command).slice(0, 80)
  if (o.pattern) return String(o.pattern)
  if (o.query) return String(o.query)
  return JSON.stringify(o).slice(0, 80)
}

function processEvent(payload: Record<string, unknown>) {
  const sessionId = payload.session_id as string
  if (!sessionId) return

  const s = getOrCreateSession(sessionId, payload)
  s.lastActivity = new Date()
  if (payload.cwd) s.cwd = payload.cwd as string
  if (payload.pid) s.pid = payload.pid as number
  if (payload.tty) s.tty = payload.tty as string
  if (payload.agent) s.agent = payload.agent as string

  const event = payload.event as string

  switch (event) {
    case 'SessionStart': {
      s.phase = 'waiting_for_input'
      pushActivity(s, 'phase', 'Session started', 'var(--success)')
      break
    }
    case 'PreToolUse': {
      s.phase = 'processing'
      const tool = payload.tool as string
      const id = (payload.tool_use_id as string) || `t${++counter}`
      const input = toolInputSummary(tool, payload.tool_input)
      const entry: ToolEntry = { id, name: tool, input, status: 'running', timestamp: new Date() }
      s.toolsInProgress.set(id, entry)
      s.lastToolName = tool
      s.lastMessageRole = 'tool'
      pushActivity(s, 'tool', `${tool} ${input}`, 'var(--text-display)')
      break
    }
    case 'PostToolUse': {
      s.phase = 'processing'
      const toolUseId = payload.tool_use_id as string
      const inProg = toolUseId ? s.toolsInProgress.get(toolUseId) : null
      if (inProg) {
        inProg.status = 'success'
        inProg.durationMs = Date.now() - inProg.timestamp.getTime()
        s.recentTools.push(inProg)
        s.toolsInProgress.delete(toolUseId)
        if (s.recentTools.length > 30) s.recentTools = s.recentTools.slice(-30)
      }
      const tool = payload.tool as string
      if (tool === 'Edit' || tool === 'Write') {
        const path = (payload.tool_input as Record<string, unknown>)?.file_path
        if (path) s.filesModified.add(String(path))
      }
      break
    }
    case 'UserPromptSubmit': {
      s.phase = 'processing'
      const msg = (payload.message as string) || ''
      s.lastMessage = msg
      s.lastMessageRole = 'user'
      s.turnCount++
      if (!s.firstUserMessage && msg) s.firstUserMessage = msg
      break
    }
    case 'Notification': {
      const notifType = payload.notification_type as string
      if (notifType === 'assistant_response') {
        s.lastMessage = (payload.message as string) || ''
        s.lastMessageRole = 'assistant'
      }
      if (notifType === 'turn_complete') {
        s.phase = 'waiting_for_input'
        pushActivity(s, 'phase', 'Waiting for input', 'var(--warning)')
      }
      const status = payload.status as string
      if (status === 'waiting_for_input' || status === 'waiting_for_approval') {
        s.phase = status
      }
      break
    }
    case 'SessionEnd': {
      s.phase = 'ended'
      pushActivity(s, 'phase', 'Session ended', 'var(--text-disabled)')
      break
    }
  }

  broadcast()
}

function pushActivity(s: Session, type: ActivityEntry['type'], content: string, color: string) {
  activity.unshift({
    id: `e${++counter}`,
    sessionId: s.sessionId,
    agentTitle: s.firstUserMessage?.slice(0, 40) || s.agent,
    type,
    content,
    timestamp: new Date(),
    color,
  })
  if (activity.length > 100) activity.length = 100
}

function displayTitle(s: Session): string {
  if (s.firstUserMessage) return s.firstUserMessage.slice(0, 60).toLowerCase()
  return s.agent
}

function serializeState(): string {
  const agents = Array.from(sessions.values()).map(s => ({
    sessionId: s.sessionId,
    displayTitle: displayTitle(s),
    cwd: s.cwd,
    phase: s.phase,
    lastActivity: s.lastActivity.toISOString(),
    createdAt: s.createdAt.toISOString(),
    pid: s.pid,
    tty: s.tty || '',
    tmuxTarget: '',
    lastMessage: s.lastMessage,
    lastMessageRole: s.lastMessageRole,
    lastToolName: s.lastToolName,
    toolsInProgress: Array.from(s.toolsInProgress.values()).map(t => ({
      ...t, timestamp: t.timestamp.toISOString(),
    })),
    recentTools: s.recentTools.map(t => ({
      ...t, timestamp: t.timestamp.toISOString(),
    })),
    subagents: [],
    tokenCount: 0,
    maxTokens: 1_000_000,
    turnCount: s.turnCount,
    filesModified: s.filesModified.size,
    linesChanged: 0,
    costUsd: 0,
  }))

  return JSON.stringify({
    type: 'state',
    agents,
    activityFeed: activity.slice(0, 50).map(e => ({
      ...e, timestamp: e.timestamp.toISOString(),
    })),
  })
}

// =========================================================================
// WebSocket server
// =========================================================================

const wss = new WebSocketServer({ port: WS_PORT })

function broadcast() {
  const data = serializeState()
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(data)
  }
}

wss.on('connection', (ws) => {
  console.log('dashboard client connected')
  ws.send(serializeState())
})

// =========================================================================
// Unix socket server
// =========================================================================

if (existsSync(SOCKET_PATH)) unlinkSync(SOCKET_PATH)

const server = createNetServer((conn: Socket) => {
  let buffer = ''
  conn.on('data', (chunk) => { buffer += chunk.toString() })
  conn.on('end', () => {
    for (const line of buffer.split('\n').filter(Boolean)) {
      try { processEvent(JSON.parse(line)) }
      catch { /* skip bad json */ }
    }
  })
})

server.listen(SOCKET_PATH, () => {
  console.log(`listening on ${SOCKET_PATH}`)
  console.log(`websocket on ws://localhost:${WS_PORT}`)
})

process.on('SIGINT', () => {
  if (existsSync(SOCKET_PATH)) unlinkSync(SOCKET_PATH)
  process.exit(0)
})

process.on('SIGTERM', () => {
  if (existsSync(SOCKET_PATH)) unlinkSync(SOCKET_PATH)
  process.exit(0)
})
