import { useState, useEffect } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import {
  overview as mockOverview, skills as mockSkills, plugins as mockPlugins,
  tools as defaultTools, commands, architecture, changelog,
  mockConfig, mockMemory, mockSoul,
  type WikiTool,
} from '../wikiData'

const API = 'http://localhost:3002/api/wiki'

type Page =
  | 'overview' | 'skills' | 'plugins' | 'tools'
  | 'commands' | 'architecture' | 'changelog'
  | 'config' | 'memory' | 'soul'
  | { skill: string }

function Md({ content }: { content: string }) {
  const raw = marked.parse(content, { async: false }) as string
  const html = DOMPurify.sanitize(raw)
  return <div className="wiki-md" dangerouslySetInnerHTML={{ __html: html }} />
}

function SkillCard({ skill, onClick }: { skill: Record<string, unknown>; onClick: () => void }) {
  const name = String(skill.name || '')
  const category = String(skill.category || '')
  const description = String(skill.description || '')
  const platforms = String(skill.platforms || '').replace(/[[\]]/g, '').split(',').map(s => s.trim()).filter(Boolean)
  const tags = String(skill.tags || skill.metadata || '').replace(/[[\]]/g, '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 4)

  return (
    <div className="wiki-skill-card" onClick={onClick}>
      <div className="wiki-skill-header">
        <span className="wiki-skill-name">{name}</span>
        {category && <span className="wiki-skill-category">{category}</span>}
      </div>
      {description && <div className="wiki-skill-desc">{description}</div>}
      <div className="wiki-skill-tags">
        {platforms.map(p => <span key={p} className="wiki-tag platform">{p}</span>)}
        {tags.map(t => <span key={t} className="wiki-tag">{t}</span>)}
      </div>
    </div>
  )
}

function ToolRef({ tool }: { tool: WikiTool }) {
  return (
    <div className="wiki-tool-card">
      <div className="wiki-tool-header">
        <span className="wiki-tool-name">{tool.name}</span>
        <span className="wiki-tool-cat">{tool.category}</span>
      </div>
      <div className="wiki-tool-desc">{tool.description}</div>
      <div className="wiki-tool-params">
        {tool.params.map(p => (
          <div key={p.name} className="wiki-param">
            <span className="wiki-param-name">{p.name}</span>
            <span className="wiki-param-type">{p.type}</span>
            {p.required && <span className="wiki-param-req">required</span>}
            <span className="wiki-param-desc">{p.description}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function useLiveData() {
  const [live, setLive] = useState(false)
  const [overview, setOverview] = useState<Record<string, unknown> | null>(null)
  const [skills, setSkills] = useState<Record<string, unknown>[]>([])
  const [plugins, setPlugins] = useState<Record<string, unknown>[]>([])
  const [config, setConfig] = useState('')
  const [memory, setMemory] = useState({ memory: '', user: '' })
  const [soul, setSoul] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch(API).then(r => r.json()).then(data => {
      if (cancelled) return
      setLive(true)
      setOverview(data)
      fetch(`${API}/skills`).then(r => r.json()).then(d => { if (!cancelled) setSkills(d) }).catch(() => {})
      fetch(`${API}/plugins`).then(r => r.json()).then(d => { if (!cancelled) setPlugins(d) }).catch(() => {})
      fetch(`${API}/config`).then(r => r.json()).then(d => { if (!cancelled) setConfig(d.content) }).catch(() => {})
      fetch(`${API}/memory`).then(r => r.json()).then(d => { if (!cancelled) setMemory(d) }).catch(() => {})
      fetch(`${API}/soul`).then(r => r.json()).then(d => { if (!cancelled) setSoul(d.content) }).catch(() => {})
    }).catch(() => { if (!cancelled) setLive(false) })
    return () => { cancelled = true }
  }, [])

  return { live, overview, skills, plugins, config, memory, soul }
}

export function Wiki({ onBack }: { onBack: () => void }) {
  const [page, setPage] = useState<Page>('overview')
  const [search, setSearch] = useState('')
  const data = useLiveData()

  // resolve live vs mock
  const isLive = data.live
  const skills = isLive && data.skills.length > 0 ? data.skills : mockSkills.map(s => ({ ...s, body: s.body } as Record<string, unknown>))
  const pluginList = isLive && data.plugins.length > 0 ? data.plugins : mockPlugins.map(p => ({ ...p } as Record<string, unknown>))
  const configContent = isLive && data.config ? data.config : mockConfig
  const memoryContent = isLive && data.memory.memory ? data.memory : mockMemory
  const soulContent = isLive && data.soul ? data.soul : mockSoul
  const ov = (isLive && data.overview ? data.overview : mockOverview) as Record<string, unknown>

  const activePage = typeof page === 'object' ? 'skill-detail' : page

  const filteredSkills = search
    ? skills.filter(s =>
        String(s.name || '').toLowerCase().includes(search.toLowerCase()) ||
        String(s.category || '').toLowerCase().includes(search.toLowerCase()) ||
        String(s.description || '').toLowerCase().includes(search.toLowerCase())
      )
    : skills

  const categories = [...new Set(skills.map(s => String(s.category || '')).filter(Boolean))]
  const toolCategories = [...new Set(defaultTools.map(t => t.category))]

  return (
    <div className="wiki">
      <div className="wiki-sidebar">
        <button className="wiki-back" onClick={onBack}>DASHBOARD</button>

        <div className="wiki-nav-label">
          WIKI {isLive ? <span style={{ color: 'var(--success)', fontSize: 9 }}>LIVE</span> : <span style={{ color: 'var(--text-disabled)', fontSize: 9 }}>STATIC</span>}
        </div>
        <button className={`wiki-nav-item ${activePage === 'overview' ? 'active' : ''}`} onClick={() => setPage('overview')}>Overview</button>
        <button className={`wiki-nav-item ${activePage === 'architecture' ? 'active' : ''}`} onClick={() => setPage('architecture')}>Architecture</button>
        <button className={`wiki-nav-item ${activePage === 'changelog' ? 'active' : ''}`} onClick={() => setPage('changelog')}>Changelog</button>

        <div className="wiki-nav-label">REFERENCE</div>
        <button className={`wiki-nav-item ${activePage === 'skills' || activePage === 'skill-detail' ? 'active' : ''}`} onClick={() => setPage('skills')}>
          Skills <span className="wiki-nav-count">{skills.length}</span>
        </button>
        <button className={`wiki-nav-item ${activePage === 'tools' ? 'active' : ''}`} onClick={() => setPage('tools')}>
          Tools <span className="wiki-nav-count">{defaultTools.length}</span>
        </button>
        <button className={`wiki-nav-item ${activePage === 'plugins' ? 'active' : ''}`} onClick={() => setPage('plugins')}>
          Plugins <span className="wiki-nav-count">{pluginList.length}</span>
        </button>
        <button className={`wiki-nav-item ${activePage === 'commands' ? 'active' : ''}`} onClick={() => setPage('commands')}>
          CLI <span className="wiki-nav-count">{commands.length}</span>
        </button>

        <div className="wiki-nav-label">AGENT STATE</div>
        <button className={`wiki-nav-item ${activePage === 'config' ? 'active' : ''}`} onClick={() => setPage('config')}>Config</button>
        <button className={`wiki-nav-item ${activePage === 'memory' ? 'active' : ''}`} onClick={() => setPage('memory')}>Memory</button>
        <button className={`wiki-nav-item ${activePage === 'soul' ? 'active' : ''}`} onClick={() => setPage('soul')}>Soul</button>

        {(activePage === 'skills' || activePage === 'skill-detail') && categories.length > 0 && (
          <>
            <div className="wiki-nav-label" style={{ marginTop: 16 }}>CATEGORIES</div>
            <button className={`wiki-nav-sub ${search === '' ? 'active' : ''}`} onClick={() => setSearch('')}>All</button>
            {categories.map(c => (
              <button key={c} className={`wiki-nav-sub ${search === c ? 'active' : ''}`} onClick={() => setSearch(c)}>{c}</button>
            ))}
          </>
        )}
      </div>

      <div className="wiki-content">
        {page === 'overview' && (
          <div className="wiki-overview">
            <h1>Hermes Agent Wiki</h1>
            <p className="wiki-overview-sub">
              {isLive
                ? 'Live knowledge base from your Hermes installation'
                : 'Reference documentation for the Hermes Agent framework'
              }
            </p>
            <div className="wiki-stat-grid">
              <div className="wiki-stat-card" onClick={() => setPage('skills')}>
                <span className="wiki-stat-num">{Number(ov.skillCount || skills.length)}</span>
                <span className="wiki-stat-label">SKILLS</span>
              </div>
              <div className="wiki-stat-card" onClick={() => setPage('plugins')}>
                <span className="wiki-stat-num">{Number(ov.pluginCount || pluginList.length)}</span>
                <span className="wiki-stat-label">PLUGINS</span>
              </div>
              <div className="wiki-stat-card" onClick={() => setPage('tools')}>
                <span className="wiki-stat-num">{defaultTools.length}</span>
                <span className="wiki-stat-label">TOOLS</span>
              </div>
              <div className="wiki-stat-card">
                <span className="wiki-stat-num">{isLive ? 'YES' : String((ov as Record<string, unknown>).sessionCount || 0)}</span>
                <span className="wiki-stat-label">{isLive ? 'CONNECTED' : 'SESSIONS'}</span>
              </div>
            </div>
            {categories.length > 0 && (
              <>
                <h2>Skill Categories</h2>
                <div className="wiki-cat-grid">
                  {categories.map(c => {
                    const count = skills.filter(s => String(s.category) === c).length
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
              <input className="wiki-search" placeholder="Search skills..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {search && <div className="wiki-search-info">{filteredSkills.length} of {skills.length} skills</div>}
            <div className="wiki-skill-grid">
              {filteredSkills.map((s, i) => (
                <SkillCard key={`${s.category}/${s.name}-${i}`} skill={s} onClick={() => setPage({ skill: String(s.name) })} />
              ))}
            </div>
          </div>
        )}

        {typeof page === 'object' && 'skill' in page && (() => {
          const s = skills.find(sk => String(sk.name) === page.skill)
          if (!s) return null
          const sName = String(s.name || '')
          const sCat = s.category ? String(s.category) : ''
          const sVer = s.version ? String(s.version) : ''
          const sDesc = s.description ? String(s.description) : ''
          const sPlat = s.platforms ? String(s.platforms) : ''
          const sAuth = s.author ? String(s.author) : ''
          const sLic = s.license ? String(s.license) : ''
          const sBody = s.body ? String(s.body) : ''
          return (
            <div>
              <button className="wiki-breadcrumb" onClick={() => setPage('skills')}>Skills /</button>
              <div className="wiki-detail">
                <div className="wiki-detail-header">
                  <h2>{sName}</h2>
                  {sCat && <span className="wiki-skill-category">{sCat}</span>}
                  {sVer && <span className="wiki-version">v{sVer}</span>}
                </div>
                {sDesc && <p className="wiki-detail-desc">{sDesc}</p>}
                <div className="wiki-meta-grid">
                  {sPlat && <div className="wiki-meta-item"><span className="wiki-meta-label">PLATFORMS</span><span>{sPlat}</span></div>}
                  {sAuth && <div className="wiki-meta-item"><span className="wiki-meta-label">AUTHOR</span><span>{sAuth}</span></div>}
                  {sLic && <div className="wiki-meta-item"><span className="wiki-meta-label">LICENSE</span><span>{sLic}</span></div>}
                </div>
                {sBody && <Md content={sBody} />}
              </div>
            </div>
          )
        })()}

        {page === 'tools' && (
          <div>
            <h1>Tool Reference</h1>
            {toolCategories.map(cat => (
              <div key={cat}>
                <h2>{cat}</h2>
                <div className="wiki-tool-list">
                  {defaultTools.filter(t => t.category === cat).map(t => <ToolRef key={t.name} tool={t} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {page === 'plugins' && (
          <div>
            <h1>Plugins</h1>
            <div className="wiki-plugin-list">
              {pluginList.map((p, i) => (
                (() => {
                const name = String(p.name || '')
                const desc = p.description ? String(p.description) : ''
                const ver = p.version ? String(p.version) : ''
                const pt = p.provides_tools ? String(p.provides_tools) : ''
                const t = p.tools ? String(p.tools) : ''
                return (
                  <div key={`${name}-${i}`} className="wiki-plugin-card">
                    <div className="wiki-plugin-name">{name}</div>
                    {desc && <div className="wiki-plugin-desc">{desc}</div>}
                    <div className="wiki-plugin-meta">
                      {ver && <span>v{ver}</span>}
                      {pt && <span>tools: {pt}</span>}
                      {t && <span>tools: {t}</span>}
                    </div>
                  </div>
                )
              })()
              ))}
            </div>
          </div>
        )}

        {page === 'commands' && (
          <div>
            <h1>CLI Reference</h1>
            <div className="wiki-cmd-list">
              {commands.map(c => (
                <div key={c.command} className="wiki-cmd-card">
                  <div className="wiki-cmd-name">{c.command}</div>
                  <div className="wiki-cmd-desc">{c.description}</div>
                  <div className="wiki-cmd-flags">
                    {c.flags.map(f => <code key={f} className="wiki-cmd-flag">{f}</code>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {page === 'architecture' && <Md content={architecture} />}
        {page === 'changelog' && <Md content={changelog} />}
        {page === 'config' && <div><h1>Configuration</h1><pre className="wiki-code">{configContent}</pre></div>}
        {page === 'memory' && <div><h1>Memory</h1><h2>Agent Memory</h2><Md content={memoryContent.memory} /><h2 style={{ marginTop: 32 }}>User Profile</h2><Md content={memoryContent.user} /></div>}
        {page === 'soul' && <div><h1>Soul</h1><Md content={soulContent} /></div>}
      </div>
    </div>
  )
}
