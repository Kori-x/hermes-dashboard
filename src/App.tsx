import { useState, useEffect } from 'react'
import { agents, type Agent } from './data'
import { Header } from './components/Header'
import { HeroSection, StatusRow, AttentionBanner } from './components/Stats'
import { AgentList } from './components/AgentList'
import { AgentDetail } from './components/AgentDetail'
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
      <Header />
      <HeroSection agents={agents} />
      <StatusRow agents={agents} />
      <AttentionBanner agents={agents} />
      <div className={`main${selected ? '' : ' no-detail'}`}>
        <AgentList
          agents={agents}
          selected={selected}
          onSelect={setSelected}
        />
        {selected && (
          <AgentDetail agent={selected} onClose={() => setSelected(null)} />
        )}
      </div>
    </div>
  )
}
