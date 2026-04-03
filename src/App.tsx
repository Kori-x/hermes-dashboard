import { useState, useEffect } from 'react'
import { agents, activityFeed, type Agent } from './data'
import { Header } from './components/Header'
import { HeroSection, AttentionBanner } from './components/Stats'
import { AgentList } from './components/AgentList'
import { AgentDetail } from './components/AgentDetail'
import { ToolBreakdown } from './components/ToolBreakdown'
import { ActivityFeed } from './components/ActivityFeed'
import { SessionTimeline } from './components/SessionTimeline'
import './app.css'

export default function App() {
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

  return (
    <div className="app" key={tick}>
      <Header agents={agents} />
      <HeroSection agents={agents} />
      <AttentionBanner agents={agents} />

      <div className="main">
        <AgentList agents={agents} selected={selected} onSelect={setSelected} />
        {selected ? (
          <AgentDetail agent={selected} onClose={() => setSelected(null)} />
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
