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
import './app.css'

export default function App() {
  const { agents, activityFeed, connected } = useHermes()
  const [selected, setSelected] = useState<Agent | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // keep selection in sync with live data
  const selectedAgent = selected
    ? agents.find(a => a.sessionId === selected.sessionId) || null
    : null

  return (
    <div className="app" key={tick}>
      <Header agents={agents} connected={connected} />
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

      <SessionTimeline agents={agents} />
    </div>
  )
}
