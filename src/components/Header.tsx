export function Header({ agentCount }: { agentCount: number }) {
  return (
    <header className="header">
      <h1 className="header-title">HERMES</h1>
      <div className="header-meta">
        <span className="header-label">
          <span className="header-dot" />
          SYSTEM ONLINE
        </span>
        <span className="header-label">
          AGENTS <span className="header-count">{agentCount}</span>
        </span>
        <span className="header-label">
          {new Date().toLocaleTimeString('en-US', { hour12: false })}
        </span>
      </div>
    </header>
  )
}
