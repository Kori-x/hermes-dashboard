import { type Agent, getToolBreakdown } from '../data'

const TOOL_COLORS: Record<string, string> = {
  Read: 'var(--text-secondary)',
  Edit: 'var(--text-display)',
  Write: 'var(--interactive)',
  Bash: 'var(--warning)',
  Grep: 'var(--success)',
  Glob: '#7c6fad',
  WebSearch: '#c07840',
}

export function ToolBreakdown({ agents }: { agents: Agent[] }) {
  const breakdown = getToolBreakdown(agents)
  const max = breakdown[0]?.count || 1
  const total = breakdown.reduce((s, b) => s + b.count, 0)

  return (
    <div className="breakdown">
      <div className="breakdown-header">
        <span className="section-label">TOOL USAGE</span>
        <span className="breakdown-total">{total} calls</span>
      </div>
      <div className="breakdown-bars">
        {breakdown.map(({ name, count }) => (
          <div key={name} className="breakdown-row">
            <span className="breakdown-name">{name}</span>
            <div className="breakdown-track">
              <div
                className="breakdown-fill"
                style={{
                  width: `${(count / max) * 100}%`,
                  background: TOOL_COLORS[name] || 'var(--text-disabled)',
                }}
              />
            </div>
            <span className="breakdown-count">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
