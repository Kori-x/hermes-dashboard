import { type Agent, formatTokens } from '../data'

export function Stats({ agents }: { agents: Agent[] }) {
  const active = agents.filter(a => a.phase === 'processing').length
  const needsAttention = agents.filter(a =>
    a.phase === 'waiting_for_approval' || a.phase === 'waiting_for_input'
  ).length
  const totalTokens = agents.reduce((sum, a) => sum + a.tokenCount, 0)
  const totalTurns = agents.reduce((sum, a) => sum + a.turnCount, 0)

  return (
    <div className="stats">
      <div className="stat">
        <span className="stat-label">ACTIVE</span>
        <span className="stat-value" style={{ color: active > 0 ? 'var(--text-display)' : 'var(--text-disabled)' }}>
          {active}
        </span>
        <span className="stat-sub">of {agents.length} agents</span>
      </div>
      <div className="stat">
        <span className="stat-label">NEEDS ATTENTION</span>
        <span className="stat-value" style={{ color: needsAttention > 0 ? 'var(--accent)' : 'var(--text-disabled)' }}>
          {needsAttention}
        </span>
        <span className="stat-sub">{needsAttention > 0 ? 'action required' : 'all clear'}</span>
      </div>
      <div className="stat">
        <span className="stat-label">TOTAL TOKENS</span>
        <span className="stat-value">{formatTokens(totalTokens)}</span>
        <span className="stat-sub">across all sessions</span>
      </div>
      <div className="stat">
        <span className="stat-label">TOTAL TURNS</span>
        <span className="stat-value">{totalTurns}</span>
        <span className="stat-sub">conversation turns</span>
      </div>
    </div>
  )
}
