import { useState } from 'react'
import { marked } from 'marked'
import {
  overview, skills, plugins, tools, commands,
  architecture, changelog, mockConfig, mockMemory, mockSoul,
  type WikiSkill, type WikiTool,
} from '../wikiData'

type Page =
  | 'overview' | 'skills' | 'plugins' | 'tools'
  | 'commands' | 'architecture' | 'changelog'
  | 'config' | 'memory' | 'soul'
  | { skill: string }

function Md({ content }: { content: string }) {
  const html = marked.parse(content, { async: false }) as string
  return <div className="wiki-md" dangerouslySetInnerHTML={{ __html: html }} />
}

function SkillCard({ skill, onClick }: { skill: WikiSkill; onClick: () => void }) {
  return (
    <div className="wiki-skill-card" onClick={onClick}>
      <div className="wiki-skill-header">
        <span className="wiki-skill-name">{skill.name}</span>
        {skill.category && <span className="wiki-skill-category">{skill.category}</span>}
      </div>
      {skill.description && <div className="wiki-skill-desc">{skill.description}</div>}
      <div className="wiki-skill-tags">
        {skill.platforms.map(p => <span key={p} className="wiki-tag platform">{p}</span>)}
        {skill.tags.slice(0, 4).map(t => <span key={t} className="wiki-tag">{t}</span>)}
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

export function Wiki({ onBack }: { onBack: () => void }) {
  const [page, setPage] = useState<Page>('overview')
  const [search, setSearch] = useState('')

  const activePage = typeof page === 'object' ? 'skill-detail' : page

  const filteredSkills = search
    ? skills.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase())
      )
    : skills

  const categories = [...new Set(skills.map(s => s.category).filter(Boolean))]
  const toolCategories = [...new Set(tools.map(t => t.category))]

  return (
    <div className="wiki">
      <div className="wiki-sidebar">
        <button className="wiki-back" onClick={onBack}>DASHBOARD</button>

        <div className="wiki-nav-label">GENERAL</div>
        <button className={`wiki-nav-item ${activePage === 'overview' ? 'active' : ''}`} onClick={() => setPage('overview')}>Overview</button>
        <button className={`wiki-nav-item ${activePage === 'architecture' ? 'active' : ''}`} onClick={() => setPage('architecture')}>Architecture</button>
        <button className={`wiki-nav-item ${activePage === 'changelog' ? 'active' : ''}`} onClick={() => setPage('changelog')}>Changelog</button>

        <div className="wiki-nav-label">REFERENCE</div>
        <button className={`wiki-nav-item ${activePage === 'skills' || activePage === 'skill-detail' ? 'active' : ''}`} onClick={() => setPage('skills')}>
          Skills <span className="wiki-nav-count">{skills.length}</span>
        </button>
        <button className={`wiki-nav-item ${activePage === 'tools' ? 'active' : ''}`} onClick={() => setPage('tools')}>
          Tools <span className="wiki-nav-count">{tools.length}</span>
        </button>
        <button className={`wiki-nav-item ${activePage === 'plugins' ? 'active' : ''}`} onClick={() => setPage('plugins')}>
          Plugins <span className="wiki-nav-count">{plugins.length}</span>
        </button>
        <button className={`wiki-nav-item ${activePage === 'commands' ? 'active' : ''}`} onClick={() => setPage('commands')}>
          CLI <span className="wiki-nav-count">{commands.length}</span>
        </button>

        <div className="wiki-nav-label">AGENT STATE</div>
        <button className={`wiki-nav-item ${activePage === 'config' ? 'active' : ''}`} onClick={() => setPage('config')}>Config</button>
        <button className={`wiki-nav-item ${activePage === 'memory' ? 'active' : ''}`} onClick={() => setPage('memory')}>Memory</button>
        <button className={`wiki-nav-item ${activePage === 'soul' ? 'active' : ''}`} onClick={() => setPage('soul')}>Soul</button>

        {(activePage === 'skills' || activePage === 'skill-detail') && (
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
        {/* OVERVIEW */}
        {page === 'overview' && (
          <div className="wiki-overview">
            <h1>Hermes Agent Wiki</h1>
            <p className="wiki-overview-sub">Complete reference for the Hermes Agent framework v{overview.version}</p>
            <div className="wiki-stat-grid">
              <div className="wiki-stat-card" onClick={() => setPage('skills')}>
                <span className="wiki-stat-num">{overview.skillCount}</span>
                <span className="wiki-stat-label">SKILLS</span>
              </div>
              <div className="wiki-stat-card" onClick={() => setPage('plugins')}>
                <span className="wiki-stat-num">{overview.pluginCount}</span>
                <span className="wiki-stat-label">PLUGINS</span>
              </div>
              <div className="wiki-stat-card" onClick={() => setPage('tools')}>
                <span className="wiki-stat-num">{overview.toolCount}</span>
                <span className="wiki-stat-label">TOOLS</span>
              </div>
              <div className="wiki-stat-card">
                <span className="wiki-stat-num">{overview.sessionCount.toLocaleString()}</span>
                <span className="wiki-stat-label">SESSIONS</span>
              </div>
            </div>

            <h2>Skill Categories</h2>
            <div className="wiki-cat-grid">
              {overview.categories.map(c => {
                const count = skills.filter(s => s.category === c).length
                return (
                  <div key={c} className="wiki-cat-card" onClick={() => { setSearch(c); setPage('skills') }}>
                    <span className="wiki-cat-name">{c}</span>
                    <span className="wiki-cat-count">{count || '...'}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* SKILLS */}
        {page === 'skills' && (
          <div>
            <div className="wiki-page-header">
              <h1>Skills</h1>
              <input className="wiki-search" placeholder="Search skills..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {search && <div className="wiki-search-info">{filteredSkills.length} of {skills.length} skills</div>}
            <div className="wiki-skill-grid">
              {filteredSkills.map(s => (
                <SkillCard key={`${s.category}/${s.name}`} skill={s} onClick={() => setPage({ skill: s.name })} />
              ))}
            </div>
          </div>
        )}

        {/* SKILL DETAIL */}
        {typeof page === 'object' && 'skill' in page && (() => {
          const s = skills.find(sk => sk.name === page.skill)
          if (!s) return null
          return (
            <div>
              <button className="wiki-breadcrumb" onClick={() => setPage('skills')}>Skills /</button>
              <div className="wiki-detail">
                <div className="wiki-detail-header">
                  <h2>{s.name}</h2>
                  {s.category && <span className="wiki-skill-category">{s.category}</span>}
                  <span className="wiki-version">v{s.version}</span>
                </div>
                <p className="wiki-detail-desc">{s.description}</p>
                <div className="wiki-meta-grid">
                  <div className="wiki-meta-item"><span className="wiki-meta-label">PLATFORMS</span><span>{s.platforms.join(', ')}</span></div>
                  <div className="wiki-meta-item"><span className="wiki-meta-label">TAGS</span><span>{s.tags.join(', ')}</span></div>
                </div>
                <Md content={s.body} />
              </div>
            </div>
          )
        })()}

        {/* TOOLS */}
        {page === 'tools' && (
          <div>
            <h1>Tool Reference</h1>
            {toolCategories.map(cat => (
              <div key={cat}>
                <h2>{cat}</h2>
                <div className="wiki-tool-list">
                  {tools.filter(t => t.category === cat).map(t => <ToolRef key={t.name} tool={t} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PLUGINS */}
        {page === 'plugins' && (
          <div>
            <h1>Plugins</h1>
            <div className="wiki-plugin-list">
              {plugins.map(p => (
                <div key={p.name} className="wiki-plugin-card">
                  <div className="wiki-plugin-name">{p.name}</div>
                  <div className="wiki-plugin-desc">{p.description}</div>
                  <div className="wiki-plugin-meta">
                    <span>v{p.version}</span>
                    {p.tools.length > 0 && <span>tools: {p.tools.join(', ')}</span>}
                    {p.hooks.length > 0 && <span>hooks: {p.hooks.length}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CLI */}
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

        {/* ARCHITECTURE */}
        {page === 'architecture' && <Md content={architecture} />}

        {/* CHANGELOG */}
        {page === 'changelog' && <Md content={changelog} />}

        {/* CONFIG */}
        {page === 'config' && (
          <div>
            <h1>Configuration</h1>
            <pre className="wiki-code">{mockConfig}</pre>
          </div>
        )}

        {/* MEMORY */}
        {page === 'memory' && (
          <div>
            <h1>Memory</h1>
            <h2>Agent Memory</h2>
            <Md content={mockMemory.memory} />
            <h2 style={{ marginTop: 32 }}>User Profile</h2>
            <Md content={mockMemory.user} />
          </div>
        )}

        {/* SOUL */}
        {page === 'soul' && (
          <div>
            <h1>Soul</h1>
            <Md content={mockSoul} />
          </div>
        )}
      </div>
    </div>
  )
}
