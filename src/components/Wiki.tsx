import { useState, useEffect } from 'react'
import { marked } from 'marked'

const API = 'http://localhost:3002/api/wiki'

interface Skill {
  name: string
  category: string
  meta: Record<string, unknown>
  body: string
}

interface Plugin {
  name: string
  manifest: Record<string, unknown>
}

interface Overview {
  hermesHome: string
  skillCount: number
  pluginCount: number
  categories: string[]
  hasSoul: boolean
  hasConfig: boolean
  hasMemory: boolean
}

type WikiPage = 'overview' | 'skills' | 'plugins' | 'config' | 'memory' | 'soul' | { skill: string }

function Markdown({ content }: { content: string }) {
  const html = marked.parse(content, { async: false }) as string
  return <div className="wiki-md" dangerouslySetInnerHTML={{ __html: html }} />
}

function SkillCard({ skill, onClick }: { skill: Skill; onClick: () => void }) {
  const tags = Array.isArray(skill.meta?.tags) ? (skill.meta.tags as string[]) : []
  const platforms = Array.isArray(skill.meta?.platforms) ? (skill.meta.platforms as string[]) : []
  const desc = skill.meta?.description ? String(skill.meta.description) : ''
  return (
    <div className="wiki-skill-card" onClick={onClick}>
      <div className="wiki-skill-header">
        <span className="wiki-skill-name">{skill.name}</span>
        {skill.category && <span className="wiki-skill-category">{skill.category}</span>}
      </div>
      {desc && <div className="wiki-skill-desc">{desc}</div>}
      <div className="wiki-skill-tags">
        {platforms.map(p => <span key={p} className="wiki-tag platform">{p}</span>)}
        {tags.slice(0, 4).map(t => <span key={t} className="wiki-tag">{t}</span>)}
      </div>
    </div>
  )
}

function SkillDetail({ name }: { name: string }) {
  const [skill, setSkill] = useState<Skill | null>(null)

  useEffect(() => {
    fetch(`${API}/skills/${encodeURIComponent(name)}`)
      .then(r => r.json())
      .then(setSkill)
      .catch(() => setSkill(null))
  }, [name])

  if (!skill) return <div className="wiki-loading">Loading...</div>

  const m = skill.meta
  const version = m.version ? String(m.version) : ''
  const desc = m.description ? String(m.description) : ''
  const author = m.author ? String(m.author) : ''
  const license = m.license ? String(m.license) : ''
  const platforms = m.platforms ? String(m.platforms) : ''

  return (
    <div className="wiki-detail">
      <div className="wiki-detail-header">
        <h2>{skill.name}</h2>
        {skill.category && <span className="wiki-skill-category">{skill.category}</span>}
        {version && <span className="wiki-version">v{version}</span>}
      </div>
      {desc && <p className="wiki-detail-desc">{desc}</p>}
      <div className="wiki-meta-grid">
        {author && <div className="wiki-meta-item"><span className="wiki-meta-label">AUTHOR</span><span>{author}</span></div>}
        {license && <div className="wiki-meta-item"><span className="wiki-meta-label">LICENSE</span><span>{license}</span></div>}
        {platforms && <div className="wiki-meta-item"><span className="wiki-meta-label">PLATFORMS</span><span>{platforms}</span></div>}
      </div>
      <Markdown content={skill.body} />
    </div>
  )
}

export function Wiki({ onBack }: { onBack: () => void }) {
  const [page, setPage] = useState<WikiPage>('overview')
  const [overview, setOverview] = useState<Overview | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [config, setConfig] = useState('')
  const [memory, setMemory] = useState<{ memory: string; user: string }>({ memory: '', user: '' })
  const [soul, setSoul] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch(API).then(r => r.json()).then(setOverview).catch(() => {})
    fetch(`${API}/skills`).then(r => r.json()).then(setSkills).catch(() => {})
    fetch(`${API}/plugins`).then(r => r.json()).then(setPlugins).catch(() => {})
    fetch(`${API}/config`).then(r => r.json()).then(d => setConfig(d.content)).catch(() => {})
    fetch(`${API}/memory`).then(r => r.json()).then(setMemory).catch(() => {})
    fetch(`${API}/soul`).then(r => r.json()).then(d => setSoul(d.content)).catch(() => {})
  }, [])

  const filteredSkills = search
    ? skills.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase()) ||
        String(s.meta?.description || '').toLowerCase().includes(search.toLowerCase())
      )
    : skills

  const categories = [...new Set(skills.map(s => s.category).filter(Boolean))]

  const activePage = typeof page === 'object' ? 'skill-detail' : page

  return (
    <div className="wiki">
      <div className="wiki-sidebar">
        <button className="wiki-back" onClick={onBack}>DASHBOARD</button>
        <div className="wiki-nav-label">WIKI</div>
        <button className={`wiki-nav-item ${activePage === 'overview' ? 'active' : ''}`} onClick={() => setPage('overview')}>Overview</button>
        <button className={`wiki-nav-item ${activePage === 'skills' || activePage === 'skill-detail' ? 'active' : ''}`} onClick={() => setPage('skills')}>
          Skills <span className="wiki-nav-count">{skills.length}</span>
        </button>
        <button className={`wiki-nav-item ${activePage === 'plugins' ? 'active' : ''}`} onClick={() => setPage('plugins')}>
          Plugins <span className="wiki-nav-count">{plugins.length}</span>
        </button>
        <button className={`wiki-nav-item ${activePage === 'config' ? 'active' : ''}`} onClick={() => setPage('config')}>Config</button>
        <button className={`wiki-nav-item ${activePage === 'memory' ? 'active' : ''}`} onClick={() => setPage('memory')}>Memory</button>
        <button className={`wiki-nav-item ${activePage === 'soul' ? 'active' : ''}`} onClick={() => setPage('soul')}>Soul</button>

        {activePage === 'skills' && (
          <>
            <div className="wiki-nav-label" style={{ marginTop: 16 }}>CATEGORIES</div>
            {categories.map(c => (
              <button key={c} className="wiki-nav-sub" onClick={() => setSearch(c)}>{c}</button>
            ))}
          </>
        )}
      </div>

      <div className="wiki-content">
        {page === 'overview' && overview && (
          <div className="wiki-overview">
            <h1>Hermes Agent Wiki</h1>
            <p className="wiki-overview-sub">Auto-generated knowledge base from your Hermes installation</p>
            <div className="wiki-overview-path">{overview.hermesHome}</div>
            <div className="wiki-stat-grid">
              <div className="wiki-stat-card" onClick={() => setPage('skills')}>
                <span className="wiki-stat-num">{overview.skillCount}</span>
                <span className="wiki-stat-label">SKILLS</span>
              </div>
              <div className="wiki-stat-card" onClick={() => setPage('plugins')}>
                <span className="wiki-stat-num">{overview.pluginCount}</span>
                <span className="wiki-stat-label">PLUGINS</span>
              </div>
              <div className="wiki-stat-card" onClick={() => setPage('memory')}>
                <span className="wiki-stat-num">{overview.hasMemory ? 'YES' : 'NO'}</span>
                <span className="wiki-stat-label">MEMORY</span>
              </div>
              <div className="wiki-stat-card" onClick={() => setPage('soul')}>
                <span className="wiki-stat-num">{overview.hasSoul ? 'YES' : 'NO'}</span>
                <span className="wiki-stat-label">SOUL</span>
              </div>
            </div>
            {overview.categories.length > 0 && (
              <>
                <h2>Skill Categories</h2>
                <div className="wiki-cat-grid">
                  {overview.categories.map(c => {
                    const count = skills.filter(s => s.category === c).length
                    return (
                      <div key={c} className="wiki-cat-card" onClick={() => { setSearch(c); setPage('skills') }}>
                        <span className="wiki-cat-name">{c}</span>
                        <span className="wiki-cat-count">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {page === 'skills' && (
          <div>
            <div className="wiki-page-header">
              <h1>Skills</h1>
              <input
                className="wiki-search"
                placeholder="Search skills..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {search && <div className="wiki-search-info">Showing {filteredSkills.length} of {skills.length} skills</div>}
            <div className="wiki-skill-grid">
              {filteredSkills.map(s => (
                <SkillCard key={`${s.category}/${s.name}`} skill={s} onClick={() => setPage({ skill: s.name })} />
              ))}
            </div>
          </div>
        )}

        {typeof page === 'object' && 'skill' in page && (
          <div>
            <button className="wiki-breadcrumb" onClick={() => setPage('skills')}>Skills /</button>
            <SkillDetail name={page.skill} />
          </div>
        )}

        {page === 'plugins' && (
          <div>
            <h1>Plugins</h1>
            <div className="wiki-plugin-list">
              {plugins.map(p => (
                <div key={p.name} className="wiki-plugin-card">
                  <div className="wiki-plugin-name">{p.name}</div>
                  {p.manifest.description ? <div className="wiki-plugin-desc">{String(p.manifest.description)}</div> : null}
                  <div className="wiki-plugin-meta">
                    {p.manifest.version ? <span>v{String(p.manifest.version)}</span> : null}
                    {p.manifest.provides_tools ? <span>tools: {String(p.manifest.provides_tools)}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {page === 'config' && (
          <div>
            <h1>Configuration</h1>
            <pre className="wiki-code">{config}</pre>
          </div>
        )}

        {page === 'memory' && (
          <div>
            <h1>Memory</h1>
            <h2>Agent Memory</h2>
            <Markdown content={memory.memory} />
            <h2 style={{ marginTop: 32 }}>User Profile</h2>
            <Markdown content={memory.user} />
          </div>
        )}

        {page === 'soul' && (
          <div>
            <h1>Soul</h1>
            <Markdown content={soul} />
          </div>
        )}
      </div>
    </div>
  )
}
