import { type Agent, phaseLabel, phaseColor, timeAgo, formatTokens } from '../data'

interface Props {
  agents: Agent[]
  selected: Agent | null
  onSelect: (agent: Agent) => void
}

function MiniBar({ agent }: { agent: Agent }) {
  const all = [...agent.recentTools, ...agent.toolsInProgress]
  if (all.length === 0) return null

  return (
    <div className="agent-mini-bar">
      {all.slice(-10).map((tool, i) => {
        const isRunning = tool.status === 'running'
        const bg = isRunning
          ? 'var(--text-display)'
          : tool.status === 'error'
            ? 'var(--accent)'
            : 'var(--success)'

        return (
          <div
            key={i}
            className="agent-mini-seg"
            style={{
              background: bg,
              animation: isRunning ? 'pulse 1s var(--ease) infinite' : undefined,
            }}
          />
        )
      })}
    </div>
  )
}

function PhaseDot({ phase }: { phase: Agent['phase'] }) {
  const cls = phase === 'processing' ? 'processing'
    : phase === 'waiting_for_approval' ? 'approval'
    : phase === 'waiting_for_input' ? 'waiting'
    : 'idle'

  return <span className={`phase-dot ${cls}`} />
}

export function AgentList({ agents, selected, onSelect }: Props) {
  const sorted = [...agents].sort((a, b) => {
    const priority = (phase: string) => {
      if (phase === 'waiting_for_approval') return 0
      if (phase === 'waiting_for_input') return 1
      if (phase === 'processing') return 2
      if (phase === 'compacting') return 3
      if (phase === 'idle') return 4
      return 5
    }
    const diff = priority(a.phase) - priority(b.phase)
    if (diff !== 0) return diff
    return b.lastActivity.getTime() - a.lastActivity.getTime()
  })

  return (
    <div className="agent-list-wrap">
      <div className="section-label">AGENTS ({agents.length})</div>
      <div className="agent-list">
        {sorted.map(agent => {
          const isSelected = selected?.sessionId === agent.sessionId
          const isApproval = agent.phase === 'waiting_for_approval'

          return (
            <div
              key={agent.sessionId}
              className={[
                'agent-card',
                isSelected && 'selected',
                isApproval && 'needs-approval',
              ].filter(Boolean).join(' ')}
              onClick={() => onSelect(agent)}
            >
              <div className="agent-card-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <PhaseDot phase={agent.phase} />
                  <span className="agent-title">{agent.displayTitle}</span>
                </div>
                <span className="agent-phase" style={{ color: phaseColor(agent.phase) }}>
                  {phaseLabel(agent.phase)}
                </span>
              </div>

              {agent.toolsInProgress.length > 0 && (
                <div className="agent-tool-row">
                  <span className="tool-name">{agent.toolsInProgress[0].name}</span>
                  <span className="tool-input">{agent.toolsInProgress[0].input}</span>
                </div>
              )}

              {isApproval && agent.approvalTool && (
                <div className="approval-inline">
                  {agent.approvalTool}: {agent.approvalInput}
                </div>
              )}

              <div className="agent-card-row">
                <div className="agent-card-meta">
                  <span>{agent.projectName}</span>
                  <span>{formatTokens(agent.tokenCount)}</span>
                  <span>{timeAgo(agent.lastActivity)}</span>
                </div>
                <MiniBar agent={agent} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
