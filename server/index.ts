import { createServer as createNetServer, type Socket } from 'net'
import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import { unlinkSync, existsSync, readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const SOCKET_PATH = '/tmp/hermes-dashboard.sock'
const WS_PORT = 3001
const HTTP_PORT = 3002
const HERMES_HOME = process.env.HERMES_HOME || join(homedir(), '.hermes')

// =========================================================================
// Dashboard state (unchanged)
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
// Wiki API -- reads ~/.hermes/ and serves as JSON
// =========================================================================

function readFileOr(path: string, fallback: string): string {
  try { return readFileSync(path, 'utf-8') } catch { return fallback }
}

function parseSkillFrontmatter(content: string): { meta: Record<string, unknown>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { meta: {}, body: content }
  const lines = match[1].split('\n')
  const meta: Record<string, unknown> = {}
  for (const line of lines) {
    const idx = line.indexOf(':')
    if (idx > 0) {
      const key = line.slice(0, idx).trim()
      let val: unknown = line.slice(idx + 1).trim()
      if (typeof val === 'string' && val.startsWith('[') && val.endsWith(']')) {
        val = val.slice(1, -1).split(',').map(s => s.trim())
      }
      meta[key] = val
    }
  }
  return { meta, body: match[2] }
}

function getSkills(): { name: string; category: string; meta: Record<string, unknown>; body: string }[] {
  const skillsDir = join(HERMES_HOME, 'skills')
  if (!existsSync(skillsDir)) return []

  const results: { name: string; category: string; meta: Record<string, unknown>; body: string }[] = []

  for (const entry of readdirSync(skillsDir)) {
    const entryPath = join(skillsDir, entry)
    if (!statSync(entryPath).isDirectory()) continue

    // could be a category dir or a direct skill dir
    const skillMd = join(entryPath, 'SKILL.md')
    if (existsSync(skillMd)) {
      const { meta, body } = parseSkillFrontmatter(readFileOr(skillMd, ''))
      results.push({ name: (meta.name as string) || entry, category: '', meta, body })
      continue
    }

    // category dir containing skill subdirs
    for (const sub of readdirSync(entryPath)) {
      const subPath = join(entryPath, sub)
      if (!statSync(subPath).isDirectory()) continue
      const subSkillMd = join(subPath, 'SKILL.md')
      if (existsSync(subSkillMd)) {
        const { meta, body } = parseSkillFrontmatter(readFileOr(subSkillMd, ''))
        results.push({ name: (meta.name as string) || sub, category: entry, meta, body })
      }
    }
  }

  return results.sort((a, b) => a.name.localeCompare(b.name))
}

function getPlugins(): { name: string; manifest: Record<string, unknown> }[] {
  const pluginsDir = join(HERMES_HOME, 'plugins')
  if (!existsSync(pluginsDir)) return []
  const results: { name: string; manifest: Record<string, unknown> }[] = []

  for (const entry of readdirSync(pluginsDir)) {
    const entryPath = join(pluginsDir, entry)
    if (!statSync(entryPath).isDirectory()) continue
    if (entry.endsWith('.disabled')) continue
    const yamlPath = join(entryPath, 'plugin.yaml')
    if (existsSync(yamlPath)) {
      const { meta } = parseSkillFrontmatter('---\n' + readFileOr(yamlPath, '') + '\n---\n')
      results.push({ name: entry, manifest: meta })
    } else {
      results.push({ name: entry, manifest: {} })
    }
  }
  return results
}

function getConfig(): string {
  return readFileOr(join(HERMES_HOME, 'config.yaml'), '# No config found')
}

function getMemory(): { memory: string; user: string } {
  return {
    memory: readFileOr(join(HERMES_HOME, 'memories', 'MEMORY.md'), '# No agent memory yet'),
    user: readFileOr(join(HERMES_HOME, 'memories', 'USER.md'), '# No user profile yet'),
  }
}

function getSoul(): string {
  return readFileOr(join(HERMES_HOME, 'SOUL.md'), '# No soul file found')
}

function getOverview(): Record<string, unknown> {
  const skills = getSkills()
  const plugins = getPlugins()
  const categories = [...new Set(skills.map(s => s.category).filter(Boolean))]
  return {
    hermesHome: HERMES_HOME,
    skillCount: skills.length,
    pluginCount: plugins.length,
    categories,
    hasSoul: existsSync(join(HERMES_HOME, 'SOUL.md')),
    hasConfig: existsSync(join(HERMES_HOME, 'config.yaml')),
    hasMemory: existsSync(join(HERMES_HOME, 'memories', 'MEMORY.md')),
  }
}

// =========================================================================
// HTTP server for wiki API
// =========================================================================

function cors(res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Content-Type', 'application/json')
}

function json(res: ServerResponse, data: unknown) {
  cors(res)
  res.end(JSON.stringify(data))
}

const httpServer = createHttpServer((req: IncomingMessage, res: ServerResponse) => {
  if (req.method === 'OPTIONS') { cors(res); res.end(); return }

  const url = req.url || '/'

  if (url === '/api/wiki') {
    json(res, getOverview())
  } else if (url === '/api/wiki/skills') {
    json(res, getSkills())
  } else if (url.startsWith('/api/wiki/skills/')) {
    const name = decodeURIComponent(url.slice('/api/wiki/skills/'.length))
    const skills = getSkills()
    const skill = skills.find(s => s.name === name)
    if (skill) json(res, skill)
    else { res.statusCode = 404; json(res, { error: 'not found' }) }
  } else if (url === '/api/wiki/plugins') {
    json(res, getPlugins())
  } else if (url === '/api/wiki/config') {
    json(res, { content: getConfig() })
  } else if (url === '/api/wiki/memory') {
    json(res, getMemory())
  } else if (url === '/api/wiki/soul') {
    json(res, { content: getSoul() })
  } else {
    res.statusCode = 404
    json(res, { error: 'not found' })
  }
})

httpServer.listen(HTTP_PORT, () => {
  console.log(`wiki API on http://localhost:${HTTP_PORT}`)
})

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
