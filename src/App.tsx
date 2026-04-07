import { useState, useEffect } from 'react'
import { type Agent } from './data'
import { useHermes } from './useHermes'
import { Header } from './components/Header'
import { HeroSection, AttentionBanner } from './components/Stats'
import { AgentList } from './components/AgentList'
import { AgentDetail } from './components/AgentDetail'
import { ToolBreakdown } from './components/ToolBreakdown'
import { ActivityFeed } from './components/ActivityFeed'
import { SessionTimeline } from './components/SessionTimeline'
import { Wiki } from './components/Wiki'
import './app.css'

export default function App() {
  const { agents, activityFeed, connected } = useHermes()
  const [selected, setSelected] = useState<Agent | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [view, setView] = useState<'dashboard' | 'wiki'>('dashboard')

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (view === 'wiki') {
    return (
      <div className="app">
        <Wiki onBack={() => setView('dashboard')} />
      </div>
    )
  }

  const selectedAgent = selected
    ? agents.find(a => a.sessionId === selected.sessionId) || null
    : null

  return (
    <div className="app" key={now}>
      <Header agents={agents} connected={connected} onWiki={() => setView('wiki')} />
      <HeroSection agents={agents} />
      <AttentionBanner agents={agents} />

      <div className="main">
        <AgentList agents={agents} selected={selectedAgent} onSelect={setSelected} />
        {selectedAgent ? (
          <AgentDetail agent={selectedAgent} onClose={() => setSelected(null)} />
        ) : (
          <div className="sidebar">
            <ToolBreakdown agents={agents} />
            <ActivityFeed events={activityFeed} />
          </div>
        )}
      </div>

      <SessionTimeline agents={agents} now={now} />
    </div>
  )
}
