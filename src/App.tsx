import { useState, useEffect } from 'react'
import { agents, type Agent } from './data'
import { Header } from './components/Header'
import { AgentList } from './components/AgentList'
import { AgentDetail } from './components/AgentDetail'
import { Stats } from './components/Stats'
import './app.css'

export default function App() {
  const [selected, setSelected] = useState<Agent | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="app" key={tick}>
      <Header agentCount={agents.length} />
      <Stats agents={agents} />
      <div className="main">
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
