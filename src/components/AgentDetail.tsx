import {
  type Agent,
  type ToolCall,
  phaseLabel,
  phaseColor,
  timeAgo,
  formatTokens,
  formatDuration,
  toolStatusColor,
  sessionDuration,
} from '../data'

interface Props {
  agent: Agent
  onClose: () => void
}

function ContextRing({ used, max }: { used: number; max: number }) {
  const pct = Math.min(used / max, 1)
  const r = 32
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - pct)
  const color = pct > 0.8 ? 'var(--accent)' : pct > 0.5 ? 'var(--warning)' : 'var(--text-display)'

  return (
    <div className="context-ring-wrap">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--border)" strokeWidth="3" />
        <circle
          cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="butt" transform="rotate(-90 40 40)"
          style={{ transition: 'stroke-dashoffset 300ms var(--ease)' }}
        />
      </svg>
      <span className="context-ring-label" style={{ color }}>{Math.round(pct * 100)}%</span>
    </div>
  )
}

function ContextBar({ agent }: { agent: Agent }) {
  const pct = agent.tokenCount / agent.maxTokens
  const totalSegments = 24
  const filled = Math.round(pct * totalSegments)
  const color = pct > 0.8 ? 'var(--accent)' : pct > 0.5 ? 'var(--warning)' : 'var(--text-display)'

  return (
    <div className="context-bar">
      <div className="context-bar-header">
        <span className="context-bar-label">CONTEXT WINDOW</span>
        <span className="context-bar-value">{formatTokens(agent.tokenCount)} / {formatTokens(agent.maxTokens)}</span>
      </div>
      <div className="context-segments">
        {Array.from({ length: totalSegments }).map((_, i) => (
          <div key={i} className="context-seg" style={{
            background: i < filled ? color : 'var(--border)',
            animation: i === filled - 1 && agent.phase === 'processing' ? 'pulse 1.5s var(--ease) infinite' : undefined,
          }} />
        ))}
      </div>
    </div>
  )
}

function ToolSegments({ agent }: { agent: Agent }) {
  const all = [...agent.recentTools, ...agent.toolsInProgress]
  if (all.length === 0) return null
  const maxSegments = 20

  return (
    <div className="tool-bar">
      <div className="tool-bar-header">
        <span className="tool-bar-label">TOOL EXECUTION</span>
        <span className="tool-bar-count">{all.length} calls</span>
      </div>
      <div className="segments">
        {Array.from({ length: maxSegments }).map((_, i) => {
          const tool = all[i]
          if (!tool) return <div key={i} className="segment" style={{ background: 'var(--border)' }} />
          const isRunning = tool.status === 'running'
          const bg = tool.status === 'error' ? 'var(--accent)' : isRunning ? 'var(--text-display)' : 'var(--success)'
          return (
            <div key={i} className={`segment${isRunning ? ' active' : ''}`}
              style={{ background: bg }} title={`${tool.name} ${tool.input}`} />
          )
        })}
      </div>
    </div>
  )
}

function ToolRow({ tool }: { tool: ToolCall }) {
  return (
    <div className="tool-row">
      <div className="tool-row-left">
        <span className="tool-status-dot" style={{ background: toolStatusColor(tool.status) }} />
        <span className="tool-name">{tool.name}</span>
        <span className="tool-input">{tool.input}</span>
      </div>
      <div className="tool-row-right">
        {tool.durationMs != null && <span className="tool-duration">{formatDuration(tool.durationMs)}</span>}
        {tool.status === 'running' && <span className="tool-running">running</span>}
      </div>
    </div>
  )
}

export function AgentDetail({ agent, onClose }: Props) {
  return (
    <div className="detail">
      <div className="detail-hero">
        <div className="detail-hero-left">
          <div className="detail-title">{agent.displayTitle}</div>
          <div className="detail-phase-row">
            <span className="phase-dot" style={{ background: phaseColor(agent.phase) }} />
            <span className="agent-phase" style={{ color: phaseColor(agent.phase) }}>{phaseLabel(agent.phase)}</span>
          </div>
        </div>
        <ContextRing used={agent.tokenCount} max={agent.maxTokens} />
        <button className="detail-close" onClick={onClose}>ESC</button>
      </div>

      <div className="detail-metrics">
        <div className="detail-metric">
          <span className="detail-metric-label">TOKENS</span>
          <span className="detail-metric-value">{formatTokens(agent.tokenCount)}</span>
        </div>
        <div className="detail-metric">
          <span className="detail-metric-label">TURNS</span>
          <span className="detail-metric-value">{agent.turnCount}</span>
        </div>
        <div className="detail-metric">
          <span className="detail-metric-label">FILES</span>
          <span className="detail-metric-value">{agent.filesModified}</span>
        </div>
        <div className="detail-metric">
          <span className="detail-metric-label">LINES</span>
          <span className="detail-metric-value">{agent.linesChanged}</span>
        </div>
        <div className="detail-metric">
          <span className="detail-metric-label">COST</span>
          <span className="detail-metric-value">${agent.costUsd.toFixed(2)}</span>
        </div>
        <div className="detail-metric">
          <span className="detail-metric-label">UPTIME</span>
          <span className="detail-metric-value">{sessionDuration(agent)}</span>
        </div>
        <div className="detail-metric">
          <span className="detail-metric-label">PID</span>
          <span className="detail-metric-value">{agent.pid}</span>
        </div>
        <div className="detail-metric">
          <span className="detail-metric-label">TMUX</span>
          <span className="detail-metric-value">{agent.tmuxTarget}</span>
        </div>
      </div>

      <ContextBar agent={agent} />

      {agent.phase === 'waiting_for_approval' && agent.approvalTool && (
        <div className="approval-block">
          <div className="approval-block-label">
            <span className="attention-dot" />
            PENDING APPROVAL
          </div>
          <div className="approval-block-cmd">{agent.approvalTool}: {agent.approvalInput}</div>
          <div className="approval-actions">
            <button className="btn-approve">APPROVE</button>
            <button className="btn-deny">DENY</button>
          </div>
        </div>
      )}

      <div className="last-message">
        <div className="last-message-label">LAST MESSAGE / {agent.lastMessageRole.toUpperCase()}</div>
        <div className="last-message-text">{agent.lastMessage}</div>
      </div>

      <ToolSegments agent={agent} />

      {agent.toolsInProgress.length > 0 && (
        <div className="tool-section">
          <div className="tool-section-header">IN PROGRESS</div>
          {agent.toolsInProgress.map(t => <ToolRow key={t.id} tool={t} />)}
        </div>
      )}

      {agent.subagents.map(sub => (
        <div key={sub.id} className="subagent-section">
          <div className="subagent-header">
            <span className="subagent-tag">SUBAGENT</span>
            <span className="subagent-desc">{sub.description}</span>
          </div>
          <div className="subagent-tools">
            {sub.tools.map(t => <ToolRow key={t.id} tool={t} />)}
          </div>
        </div>
      ))}

      {agent.recentTools.length > 0 && (
        <div className="tool-section">
          <div className="tool-section-header">RECENT TOOLS</div>
          {agent.recentTools.map(t => <ToolRow key={t.id} tool={t} />)}
        </div>
      )}

      <div className="detail-info">
        <div className="detail-info-item">
          <span className="detail-info-label">SESSION</span>
          <span className="detail-info-value">{agent.sessionId}</span>
        </div>
        <div className="detail-info-item">
          <span className="detail-info-label">CWD</span>
          <span className="detail-info-value">{agent.cwd}</span>
        </div>
        <div className="detail-info-item">
          <span className="detail-info-label">TTY</span>
          <span className="detail-info-value">{agent.tty}</span>
        </div>
        <div className="detail-info-item">
          <span className="detail-info-label">LAST ACTIVE</span>
          <span className="detail-info-value">{timeAgo(agent.lastActivity)}</span>
        </div>
      </div>
    </div>
  )
}
