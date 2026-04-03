import { type Agent, phaseColor, sessionDuration } from '../data'

export function SessionTimeline({ agents }: { agents: Agent[] }) {
  const sorted = [...agents].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  const earliest = sorted[0]?.createdAt.getTime() || Date.now()
  const span = Date.now() - earliest

  return (
    <div className="timeline">
      <div className="section-label">SESSION TIMELINE</div>
      <div className="timeline-rows">
        {sorted.map(agent => {
          const startPct = ((agent.createdAt.getTime() - earliest) / span) * 100
          const widthPct = Math.max(((Date.now() - agent.createdAt.getTime()) / span) * 100, 2)

          return (
            <div key={agent.sessionId} className="timeline-row">
              <span className="timeline-label">{agent.displayTitle}</span>
              <div className="timeline-track">
                <div
                  className="timeline-bar"
                  style={{
                    left: `${startPct}%`,
                    width: `${widthPct}%`,
                    background: phaseColor(agent.phase),
                    opacity: agent.phase === 'idle' || agent.phase === 'ended' ? 0.3 : 0.8,
                    animation: agent.phase === 'processing' ? 'pulse 2s var(--ease) infinite' : undefined,
                  }}
                />
              </div>
              <span className="timeline-duration">{sessionDuration(agent)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
