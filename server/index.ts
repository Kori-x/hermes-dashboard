import { createServer as createNetServer, type Socket } from 'net'
import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import { unlinkSync, existsSync, readFileSync, readdirSync, statSync, realpathSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const SOCKET_PATH = '/tmp/hermes-dashboard.sock'
const WS_PORT = 3001
const HTTP_PORT = 3002
const HERMES_HOME = process.env.HERMES_HOME || join(homedir(), '.hermes')

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
    case 'SessionStart': { s.phase = 'waiting_for_input'; pushActivity(s, 'phase', 'Session started', 'var(--success)'); break }
    case 'PreToolUse': {
      s.phase = 'processing'
      const tool = payload.tool as string
      const id = (payload.tool_use_id as string) || `t${++counter}`
      const input = toolInputSummary(tool, payload.tool_input)
      s.toolsInProgress.set(id, { id, name: tool, input, status: 'running', timestamp: new Date() })
      s.lastToolName = tool; s.lastMessageRole = 'tool'
      pushActivity(s, 'tool', `${tool} ${input}`, 'var(--text-display)')
      break
    }
    case 'PostToolUse': {
      s.phase = 'processing'
      const toolUseId = payload.tool_use_id as string
      const inProg = toolUseId ? s.toolsInProgress.get(toolUseId) : null
      if (inProg) {
        inProg.status = 'success'; inProg.durationMs = Date.now() - inProg.timestamp.getTime()
        s.recentTools.push(inProg); s.toolsInProgress.delete(toolUseId)
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
      s.phase = 'processing'; const msg = (payload.message as string) || ''
      s.lastMessage = msg; s.lastMessageRole = 'user'; s.turnCount++
      if (!s.firstUserMessage && msg) s.firstUserMessage = msg
      break
    }
    case 'Notification': {
      const notifType = payload.notification_type as string
      if (notifType === 'assistant_response') { s.lastMessage = (payload.message as string) || ''; s.lastMessageRole = 'assistant' }
      if (notifType === 'turn_complete') { s.phase = 'waiting_for_input'; pushActivity(s, 'phase', 'Waiting for input', 'var(--warning)') }
      const status = payload.status as string
      if (status === 'waiting_for_input' || status === 'waiting_for_approval') s.phase = status
      break
    }
    case 'SessionEnd': { s.phase = 'ended'; pushActivity(s, 'phase', 'Session ended', 'var(--text-disabled)'); break }
  }
  broadcast()
}

function pushActivity(s: Session, type: ActivityEntry['type'], content: string, color: string) {
  activity.unshift({ id: `e${++counter}`, sessionId: s.sessionId, agentTitle: s.firstUserMessage?.slice(0, 40) || s.agent, type, content, timestamp: new Date(), color })
  if (activity.length > 100) activity.length = 100
}

function displayTitle(s: Session): string {
  return s.firstUserMessage ? s.firstUserMessage.slice(0, 60).toLowerCase() : s.agent
}

function serializeState(): string {
  const agents = Array.from(sessions.values()).map(s => ({
    sessionId: s.sessionId, displayTitle: displayTitle(s), cwd: s.cwd, phase: s.phase,
    lastActivity: s.lastActivity.toISOString(), createdAt: s.createdAt.toISOString(),
    pid: s.pid, tty: s.tty || '', tmuxTarget: '', lastMessage: s.lastMessage,
    lastMessageRole: s.lastMessageRole, lastToolName: s.lastToolName,
    toolsInProgress: Array.from(s.toolsInProgress.values()).map(t => ({ ...t, timestamp: t.timestamp.toISOString() })),
    recentTools: s.recentTools.map(t => ({ ...t, timestamp: t.timestamp.toISOString() })),
    subagents: [], tokenCount: 0, maxTokens: 1_000_000, turnCount: s.turnCount,
    filesModified: s.filesModified.size, linesChanged: 0, costUsd: 0,
  }))
  return JSON.stringify({ type: 'state', agents, activityFeed: activity.slice(0, 50).map(e => ({ ...e, timestamp: e.timestamp.toISOString() })) })
}

// =========================================================================
// Wiki API -- reads from HERMES_HOME dynamically
// =========================================================================

function readSafe(path: string): string {
  try {
    // resolve symlinks and verify the real path is within HERMES_HOME
    const real = realpathSync(path)
    const hermesReal = realpathSync(HERMES_HOME)
    if (!real.startsWith(hermesReal)) return ''
    return readFileSync(real, 'utf-8')
  } catch { return '' }
}

function parseFrontmatter(content: string) {
  const m = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) return { meta: {} as Record<string, string>, body: content }
  const meta: Record<string, string> = {}
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':')
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  return { meta, body: m[2] }
}

function scanSkills() {
  const dir = join(HERMES_HOME, 'skills')
  if (!existsSync(dir)) return []
  const results: Record<string, unknown>[] = []
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (!statSync(p).isDirectory()) continue
    const skillMd = join(p, 'SKILL.md')
    if (existsSync(skillMd)) {
      const { meta, body } = parseFrontmatter(readSafe(skillMd))
      results.push({ name: meta.name || entry, category: '', ...meta, body })
      continue
    }
    // category dir
    for (const sub of readdirSync(p)) {
      const sp = join(p, sub)
      if (!statSync(sp).isDirectory()) continue
      const sm = join(sp, 'SKILL.md')
      if (existsSync(sm)) {
        const { meta, body } = parseFrontmatter(readSafe(sm))
        results.push({ name: meta.name || sub, category: entry, ...meta, body })
      }
    }
  }
  return results.sort((a, b) => String(a.name).localeCompare(String(b.name)))
}

function scanPlugins() {
  const dir = join(HERMES_HOME, 'plugins')
  if (!existsSync(dir)) return []
  const results: Record<string, unknown>[] = []
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (!statSync(p).isDirectory() || entry.endsWith('.disabled')) continue
    const yaml = join(p, 'plugin.yaml')
    const manifest = existsSync(yaml) ? parseFrontmatter('---\n' + readSafe(yaml) + '\n---\n').meta : {}
    results.push({ name: entry, ...manifest })
  }
  return results
}

function wikiHandler(url: string): unknown {
  if (url === '/api/wiki') {
    const skills = scanSkills()
    const plugins = scanPlugins()
    const categories = [...new Set(skills.map(s => String(s.category)).filter(Boolean))]
    return {
      skillCount: skills.length,
      pluginCount: plugins.length,
      categories,
      hasConfig: existsSync(join(HERMES_HOME, 'config.yaml')),
      hasMemory: existsSync(join(HERMES_HOME, 'memories', 'MEMORY.md')),
      hasSoul: existsSync(join(HERMES_HOME, 'SOUL.md')),
    }
  }
  if (url === '/api/wiki/skills') return scanSkills()
  if (url.startsWith('/api/wiki/skills/')) {
    const name = decodeURIComponent(url.slice('/api/wiki/skills/'.length))
    return scanSkills().find(s => s.name === name) || null
  }
  if (url === '/api/wiki/plugins') return scanPlugins()
  if (url === '/api/wiki/config') {
    let cfg = readSafe(join(HERMES_HOME, 'config.yaml')) || '# No config found'
    // redact anything that looks like a secret
    cfg = cfg.replace(/(key|token|secret|password|credential|auth)([^:\n]*:\s*).+/gi, '$1$2[REDACTED]')
    return { content: cfg }
  }
  if (url === '/api/wiki/memory') return {
    memory: readSafe(join(HERMES_HOME, 'memories', 'MEMORY.md')) || '# No agent memory yet',
    user: readSafe(join(HERMES_HOME, 'memories', 'USER.md')) || '# No user profile yet',
  }
  if (url === '/api/wiki/soul') return { content: readSafe(join(HERMES_HOME, 'SOUL.md')) || '# No soul file found' }
  return null
}

// =========================================================================
// HTTP server
// =========================================================================

const ALLOWED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']

const httpServer = createHttpServer((req: IncomingMessage, res: ServerResponse) => {
  const origin = req.headers.origin || ''
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Content-Type', 'application/json')
  if (req.method === 'OPTIONS') { res.end(); return }
  const data = wikiHandler(req.url || '/')
  if (data === null) { res.statusCode = 404; res.end(JSON.stringify({ error: 'not found' })); return }
  res.end(JSON.stringify(data))
})

httpServer.listen(HTTP_PORT, () => console.log(`wiki API on http://localhost:${HTTP_PORT}`))

// =========================================================================
// WebSocket + Unix socket servers
// =========================================================================

const wss = new WebSocketServer({
  port: WS_PORT,
  verifyClient: ({ origin }) => !origin || ALLOWED_ORIGINS.includes(origin),
})
function broadcast() {
  const data = serializeState()
  for (const client of wss.clients) { if (client.readyState === WebSocket.OPEN) client.send(data) }
}
wss.on('connection', (ws) => { console.log('dashboard client connected'); ws.send(serializeState()) })

if (existsSync(SOCKET_PATH)) unlinkSync(SOCKET_PATH)
const server = createNetServer((conn: Socket) => {
  let buffer = ''
  conn.on('data', (chunk) => { buffer += chunk.toString() })
  conn.on('end', () => {
    for (const line of buffer.split('\n').filter(Boolean)) {
      try { processEvent(JSON.parse(line)) } catch { /* skip */ }
    }
  })
})
server.listen(SOCKET_PATH, () => { console.log(`listening on ${SOCKET_PATH}`); console.log(`websocket on ws://localhost:${WS_PORT}`) })

process.on('SIGINT', () => { if (existsSync(SOCKET_PATH)) unlinkSync(SOCKET_PATH); process.exit(0) })
process.on('SIGTERM', () => { if (existsSync(SOCKET_PATH)) unlinkSync(SOCKET_PATH); process.exit(0) })
