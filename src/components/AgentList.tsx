import { type Agent, phaseLabel, phaseColor, timeAgo } from '../data'

interface Props {
  agents: Agent[]
  selected: Agent | null
  onSelect: (agent: Agent) => void
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
    <div className="agent-list">
      {sorted.map(agent => (
        <div
          key={agent.sessionId}
          className={`agent-card${selected?.sessionId === agent.sessionId ? ' selected' : ''}`}
          onClick={() => onSelect(agent)}
        >
          <div className="agent-card-top">
            <span className="agent-title">{agent.displayTitle}</span>
            <span className="agent-phase" style={{ color: phaseColor(agent.phase) }}>
              {phaseLabel(agent.phase)}
            </span>
          </div>

          {agent.phase === 'waiting_for_approval' && agent.approvalTool && (
            <div className="approval-badge">
              {agent.approvalTool}: {agent.approvalInput}
            </div>
          )}

          {agent.toolsInProgress.length > 0 && (
            <div className="agent-tool-active">
              <span className={`tool-dot ${agent.phase === 'waiting_for_approval' ? 'approval' : 'running'}`} />
              {agent.toolsInProgress[0].name}
              <span className="tool-input">{agent.toolsInProgress[0].input}</span>
            </div>
          )}

          <div className="agent-card-bottom">
            <span className="agent-project">{agent.projectName}</span>
            <span className="agent-time">{timeAgo(agent.lastActivity)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
