import {
  type Agent,
  type ToolCall,
  phaseLabel,
  phaseColor,
  timeAgo,
  formatTokens,
  toolStatusColor,
} from '../data'

interface Props {
  agent: Agent
  onClose: () => void
}

function ToolRow({ tool }: { tool: ToolCall }) {
  return (
    <div className="tool-row">
      <div className="tool-row-left">
        <span
          className="tool-status-dot"
          style={{ background: toolStatusColor(tool.status) }}
        />
        <span className="tool-name">{tool.name}</span>
        <span className="tool-input">{tool.input}</span>
      </div>
      <div className="tool-row-right">
        {tool.durationMs != null && (
          <span className="tool-duration">
            {tool.durationMs < 1000
              ? `${tool.durationMs}ms`
              : `${(tool.durationMs / 1000).toFixed(1)}s`}
          </span>
        )}
        {tool.status === 'running' && (
          <span className="tool-duration" style={{ color: 'var(--text-secondary)' }}>
            running
          </span>
        )}
      </div>
    </div>
  )
}

function SegmentedBar({ agent }: { agent: Agent }) {
  const total = agent.recentTools.length + agent.toolsInProgress.length
  if (total === 0) return null

  const all = [...agent.recentTools, ...agent.toolsInProgress]
  const maxSegments = 16

  return (
    <div className="tool-bar">
      <div className="tool-bar-label">
        TOOL EXECUTION ({total} calls)
      </div>
      <div className="segments">
        {Array.from({ length: maxSegments }).map((_, i) => {
          const tool = all[i]
          if (!tool) return <div key={i} className="segment empty" />

          const isRunning = tool.status === 'running'
          const isError = tool.status === 'error'
          const bg = isError
            ? 'var(--accent)'
            : isRunning
              ? 'var(--text-display)'
              : 'var(--success)'

          return (
            <div
              key={i}
              className={`segment filled${isRunning ? ' active' : ''}`}
              style={{ background: bg }}
              title={`${tool.name} ${tool.input}`}
            />
          )
        })}
      </div>
    </div>
  )
}

export function AgentDetail({ agent, onClose }: Props) {
  return (
    <div className="detail">
      <div className="detail-header">
        <div>
          <div className="detail-title">{agent.displayTitle}</div>
          <span
            className="agent-phase"
            style={{ color: phaseColor(agent.phase), marginTop: 4, display: 'inline-block' }}
          >
            {phaseLabel(agent.phase)}
          </span>
        </div>
        <button className="detail-close" onClick={onClose}>ESC</button>
      </div>

      <div className="detail-meta">
        <div className="meta-item">
          <span className="meta-label">PROJECT</span>
          <span className="meta-value">{agent.projectName}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">SESSION</span>
          <span className="meta-value">{agent.sessionId}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">PID</span>
          <span className="meta-value">{agent.pid}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">TTY</span>
          <span className="meta-value">{agent.tty}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">TOKENS</span>
          <span className="meta-value">{formatTokens(agent.tokenCount)}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">TURNS</span>
          <span className="meta-value">{agent.turnCount}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">STARTED</span>
          <span className="meta-value">{timeAgo(agent.createdAt)}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">LAST ACTIVE</span>
          <span className="meta-value">{timeAgo(agent.lastActivity)}</span>
        </div>
      </div>

      {agent.phase === 'waiting_for_approval' && agent.approvalTool && (
        <div className="tool-section">
          <div className="tool-section-title" style={{ color: 'var(--accent)' }}>
            PENDING APPROVAL
          </div>
          <div className="approval-badge">
            {agent.approvalTool}: {agent.approvalInput}
          </div>
        </div>
      )}

      <div className="last-message">
        <div className="last-message-role">{agent.lastMessageRole}</div>
        <div className="last-message-text">{agent.lastMessage}</div>
      </div>

      <SegmentedBar agent={agent} />

      {agent.toolsInProgress.length > 0 && (
        <div className="tool-section">
          <div className="tool-section-title">IN PROGRESS</div>
          {agent.toolsInProgress.map(t => <ToolRow key={t.id} tool={t} />)}
        </div>
      )}

      {agent.subagents.length > 0 && agent.subagents.map(sub => (
        <div key={sub.id} className="subagent-block">
          <div className="subagent-header">
            <span className="subagent-label">SUBAGENT</span>
            <span className="subagent-desc">{sub.description}</span>
          </div>
          <div className="subagent-tools">
            {sub.tools.map(t => <ToolRow key={t.id} tool={t} />)}
          </div>
        </div>
      ))}

      {agent.recentTools.length > 0 && (
        <div className="tool-section">
          <div className="tool-section-title">RECENT TOOLS</div>
          {agent.recentTools.map(t => <ToolRow key={t.id} tool={t} />)}
        </div>
      )}
    </div>
  )
}
