import { type Agent } from '../data'

export function Header({ agents, connected, onWiki }: { agents: Agent[]; connected: boolean; onWiki?: () => void }) {
  const time = new Date().toLocaleTimeString('en-US', { hour12: false })
  const totalCost = agents.reduce((s, a) => s + a.costUsd, 0)

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">HERMES</h1>
        <span
          className="header-label"
          style={{ color: connected ? 'var(--success)' : 'var(--text-disabled)' }}
        >
          {connected ? 'LIVE' : 'MOCK'}
        </span>
      </div>
      <div className="header-right">
        {onWiki && <button className="header-wiki-btn" onClick={onWiki}>WIKI</button>}
        <span className="header-label">COST <span className="header-value">${totalCost.toFixed(2)}</span></span>
        <span className="header-label">{time}</span>
      </div>
    </header>
  )
}
