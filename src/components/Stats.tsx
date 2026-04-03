import { type Agent, formatTokens } from '../data'

export function HeroSection({ agents }: { agents: Agent[] }) {
  const active = agents.filter(a => a.phase === 'processing').length
  const totalTokens = agents.reduce((sum, a) => sum + a.tokenCount, 0)
  const totalTools = agents.reduce((sum, a) => sum + a.recentTools.length + a.toolsInProgress.length, 0)
  const totalLines = agents.reduce((sum, a) => sum + a.linesChanged, 0)

  return (
    <div className="hero">
      <div className="hero-number">{active}</div>
      <div className="hero-meta">
        <span className="hero-label">AGENTS PROCESSING</span>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-value">{agents.length}</span>
            <span className="hero-stat-label">TOTAL</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">{formatTokens(totalTokens)}</span>
            <span className="hero-stat-label">TOKENS</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">{totalTools}</span>
            <span className="hero-stat-label">TOOL CALLS</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">{totalLines.toLocaleString()}</span>
            <span className="hero-stat-label">LINES CHANGED</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function StatusRow({ agents }: { agents: Agent[] }) {
  const projects = [...new Set(agents.map(a => a.projectName))]

  return (
    <div className="status-row">
      {agents.map(agent => {
        const pct = Math.round((agent.tokenCount / agent.maxTokens) * 100)
        const totalSegments = 12
        const filledSegments = Math.round((agent.tokenCount / agent.maxTokens) * totalSegments)

        const segColor = pct > 80
          ? 'var(--accent)'
          : pct > 50
            ? 'var(--warning)'
            : 'var(--text-display)'

        return (
          <div key={agent.sessionId} className="status-cell">
            <span className="status-label">{agent.projectName}</span>
            <span className="status-value" style={{ color: agent.phase === 'waiting_for_approval' ? 'var(--accent)' : undefined }}>
              {pct}%
            </span>
            <div className="status-bar">
              {Array.from({ length: totalSegments }).map((_, i) => (
                <div
                  key={i}
                  className="status-bar-seg"
                  style={{
                    background: i < filledSegments ? segColor : 'var(--border)',
                  }}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function AttentionBanner({ agents }: { agents: Agent[] }) {
  const needsAttention = agents.filter(a =>
    a.phase === 'waiting_for_approval' || a.phase === 'waiting_for_input'
  )

  if (needsAttention.length === 0) return null

  const approvals = needsAttention.filter(a => a.phase === 'waiting_for_approval')
  const inputs = needsAttention.filter(a => a.phase === 'waiting_for_input')

  const parts: string[] = []
  if (approvals.length > 0) {
    parts.push(`${approvals.length} awaiting approval`)
  }
  if (inputs.length > 0) {
    parts.push(`${inputs.length} awaiting input`)
  }

  return (
    <div className="attention-banner">
      <div className="attention-dot" />
      <span className="attention-text">{parts.join(' / ')}</span>
      <span className="attention-count">{needsAttention.length} AGENT{needsAttention.length > 1 ? 'S' : ''}</span>
    </div>
  )
}
