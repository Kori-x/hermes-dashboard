import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import type { View, Category } from '../farzapediaTypes'
import {
  articles, getArticle, getBacklinks, getCategories,
  getStats, getAllLinks, searchArticles,
} from '../farzapediaData'

const CAT_LABELS: Record<Category, string> = {
  projects: 'Projects', people: 'People', concepts: 'Concepts',
  inspiration: 'Inspiration', tools: 'Tools', reading: 'Reading', events: 'Events',
}

const CAT_ICONS: Record<Category, string> = {
  projects: '\u25B6', people: '\u2666', concepts: '\u25C6',
  inspiration: '\u2605', tools: '\u2692', reading: '\u25A0', events: '\u25CF',
}

const CAT_COLORS: Record<Category, string> = {
  projects: '#6c9fff', people: '#ff6b9d', concepts: '#00e676',
  inspiration: '#ffab00', tools: '#ba68c8', reading: '#4dd0e1', events: '#ff8a65',
}

// ── Markdown renderer ──────────────────────────────────

function renderArticleHtml(body: string): string {
  const processed = body.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, text, href) => {
      if (href.startsWith('http') || href.startsWith('#')) return `[${text}](${href})`
      const target = href.replace(/\.md$/, '')
      return `<a class="fp-internal-link" data-slug="${target}">${text}</a>`
    }
  )
  const raw = marked.parse(processed, { async: false }) as string
  return DOMPurify.sanitize(raw, { ADD_ATTR: ['data-slug'] })
}

// ── Article Card ───────────────────────────────────────

function ArticleCard({ article, onClick }: { article: typeof articles[0]; onClick: () => void }) {
  const preview = article.body.slice(0, 140).replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') + '...'
  return (
    <div className="fp-card" onClick={onClick}>
      <div className="fp-card-header">
        <span className="fp-card-title">{article.title}</span>
        <span className="fp-card-cat">{article.category}</span>
      </div>
      <div className="fp-card-preview">{preview}</div>
      <div className="fp-card-footer">
        <div className="fp-card-tags">
          {article.tags.slice(0, 3).map(t => <span key={t} className="fp-card-tag">{t}</span>)}
        </div>
        <span className="fp-card-date">{article.updated}</span>
      </div>
    </div>
  )
}

// ── Index View ─────────────────────────────────────────

function IndexContent({ onNav }: { onNav: (v: View) => void }) {
  const stats = getStats()
  const categories = getCategories()
  const recent = [...articles].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 5)

  return (
    <div className="fp-index">
      <div className="fp-hero">
        <div className="fp-hero-number">{stats.articleCount}</div>
        <div className="fp-hero-meta">
          <div className="fp-hero-label">articles in your knowledge base</div>
          <div className="fp-hero-stats">
            <div className="fp-hero-stat">
              <span className="fp-hero-val">{stats.linkCount}</span>
              <span className="fp-hero-lbl">connections</span>
            </div>
            <div className="fp-hero-stat">
              <span className="fp-hero-val">{stats.categoryCount}</span>
              <span className="fp-hero-lbl">categories</span>
            </div>
          </div>
        </div>
      </div>

      <div className="fp-tagline">
        <p>Your scattered knowledge, organized into a living encyclopedia that AI agents can navigate.</p>
        <p className="fp-dim">Start at the index. Follow links. Every article connects to others.</p>
      </div>

      <section className="fp-section">
        <h2 className="fp-section-title"><span className="fp-pulse-dot" /> recently updated</h2>
        <div className="fp-recent-list">
          {recent.map(a => (
            <button key={a.slug} className="fp-recent-item" onClick={() => onNav({ type: 'article', slug: a.slug })}>
              <span className="fp-recent-cat">{a.category}</span>
              <span className="fp-recent-title">{a.title}</span>
              <span className="fp-recent-date">{a.updated}</span>
            </button>
          ))}
        </div>
      </section>

      {categories.map(cat => {
        const catArticles = articles.filter(a => a.category === cat.name)
        return (
          <section key={cat.name} className="fp-section">
            <h2 className="fp-section-title">
              <span className="fp-cat-icon">{CAT_ICONS[cat.name]}</span>
              {CAT_LABELS[cat.name]}
              <span className="fp-section-count">{cat.count}</span>
            </h2>
            <div className="fp-grid">
              {catArticles.map(a => (
                <ArticleCard key={a.slug} article={a} onClick={() => onNav({ type: 'article', slug: a.slug })} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

// ── Article View ───────────────────────────────────────

function ArticleContent({ slug, onNav }: { slug: string; onNav: (v: View) => void }) {
  const article = getArticle(slug)
  const backlinks = getBacklinks(slug)
  const html = useMemo(() => article ? renderArticleHtml(article.body) : '', [article])

  if (!article) return (
    <div className="fp-not-found">
      <h2>article not found</h2>
      <p>No article with slug "{slug}"</p>
      <button className="fp-link-btn" onClick={() => onNav({ type: 'index' })}>back to index</button>
    </div>
  )

  function handleClick(e: React.MouseEvent) {
    const el = e.target as HTMLElement
    if (el.classList.contains('fp-internal-link')) {
      e.preventDefault()
      const s = el.getAttribute('data-slug')
      if (s) onNav({ type: 'article', slug: s })
    }
  }

  const seeAlso = article.seeAlso.map(s => getArticle(s)).filter(Boolean)

  return (
    <div className="fp-article">
      <div className="fp-breadcrumb">
        <button className="fp-link-btn" onClick={() => onNav({ type: 'index' })}>index</button>
        <span className="fp-sep">/</span>
        <button className="fp-link-btn" onClick={() => onNav({ type: 'search', query: article.category })}>
          {CAT_LABELS[article.category]}
        </button>
        <span className="fp-sep">/</span>
        <span className="fp-current">{article.title}</span>
      </div>

      <div className="fp-article-layout">
        <article className="fp-article-main">
          <header className="fp-article-header">
            <h1 className="fp-article-title">{article.title}</h1>
            <div className="fp-article-meta">
              <span className="fp-meta-cat">{CAT_LABELS[article.category]}</span>
              <span className="fp-meta-dot" />
              <span className="fp-meta-date">created {article.created}</span>
              <span className="fp-meta-dot" />
              <span className="fp-meta-date">updated {article.updated}</span>
            </div>
            <div className="fp-article-tags">
              {article.tags.map(t => <span key={t} className="fp-atag">{t}</span>)}
            </div>
          </header>
          <div className="fp-article-body" onClick={handleClick} dangerouslySetInnerHTML={{ __html: html }} />
          {seeAlso.length > 0 && (
            <div className="fp-see-also">
              <h3 className="fp-see-also-title">see also</h3>
              <div className="fp-see-also-list">
                {seeAlso.map(a => a && (
                  <button key={a.slug} className="fp-see-also-link" onClick={() => onNav({ type: 'article', slug: a.slug })}>
                    <span className="fp-sa-name">{a.title}</span>
                    <span className="fp-sa-cat">{a.category}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </article>

        <aside className="fp-aside">
          <div className="fp-aside-section">
            <div className="fp-aside-label">backlinks <span className="fp-aside-count">{backlinks.length}</span></div>
            {backlinks.length === 0 && <div className="fp-aside-dim">no articles link here yet</div>}
            {backlinks.map(a => (
              <button key={a.slug} className="fp-backlink" onClick={() => onNav({ type: 'article', slug: a.slug })}>
                <span className="fp-bl-title">{a.title}</span>
                <span className="fp-bl-cat">{a.category}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}

// ── Search Results ─────────────────────────────────────

function SearchContent({ query, onNav }: { query: string; onNav: (v: View) => void }) {
  const results = searchArticles(query)
  return (
    <div className="fp-search-results">
      <div className="fp-search-header">
        <h2 className="fp-section-title">search results for "{query}"</h2>
        <span className="fp-result-count">{results.length} articles</span>
      </div>
      {results.length === 0 ? (
        <div className="fp-not-found">
          <p>no articles match "{query}"</p>
          <button className="fp-link-btn" onClick={() => onNav({ type: 'index' })}>back to index</button>
        </div>
      ) : (
        <div className="fp-grid">
          {results.map(a => (
            <ArticleCard key={a.slug} article={a} onClick={() => onNav({ type: 'article', slug: a.slug })} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Graph View ─────────────────────────────────────────

interface GNode { slug: string; title: string; category: Category; x: number; y: number; vx: number; vy: number }
interface GEdge { from: number; to: number }

function GraphContent({ onNav }: { onNav: (v: View) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<GNode[]>([])
  const edgesRef = useRef<GEdge[]>([])
  const animRef = useRef(0)
  const [hovered, setHovered] = useState<GNode | null>(null)
  const [dims, setDims] = useState({ w: 900, h: 550 })
  const dragRef = useRef<{ node: GNode; ox: number; oy: number } | null>(null)

  useEffect(() => {
    nodesRef.current = articles.map(a => ({
      slug: a.slug, title: a.title, category: a.category,
      x: dims.w / 2 + (Math.random() - 0.5) * dims.w * 0.6,
      y: dims.h / 2 + (Math.random() - 0.5) * dims.h * 0.6,
      vx: 0, vy: 0,
    }))
    const si = new Map<string, number>()
    articles.forEach((a, i) => si.set(a.slug, i))
    const links = getAllLinks()
    const seen = new Set<string>()
    edgesRef.current = []
    for (const l of links) {
      const fi = si.get(l.from), ti = si.get(l.to)
      if (fi !== undefined && ti !== undefined) {
        const k = `${Math.min(fi, ti)}-${Math.max(fi, ti)}`
        if (!seen.has(k)) { seen.add(k); edgesRef.current.push({ from: fi, to: ti }) }
      }
    }
  }, [dims])

  useEffect(() => {
    function handleResize() {
      const el = canvasRef.current?.parentElement
      if (el) { const r = el.getBoundingClientRect(); setDims({ w: r.width, h: Math.max(450, r.height) }) }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = dims.w * dpr; canvas.height = dims.h * dpr
    canvas.style.width = dims.w + 'px'; canvas.style.height = dims.h + 'px'
    ctx.scale(dpr, dpr)

    function tick() {
      const nodes = nodesRef.current, edges = edgesRef.current
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const f = 800 / (dist * dist)
          const fx = (dx / dist) * f, fy = (dy / dist) * f
          nodes[i].vx -= fx; nodes[i].vy -= fy; nodes[j].vx += fx; nodes[j].vy += fy
        }
      }
      for (const e of edges) {
        const a = nodes[e.from], b = nodes[e.to]
        const dx = b.x - a.x, dy = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const f = (dist - 120) * 0.005
        const fx = (dx / dist) * f, fy = (dy / dist) * f
        a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy
      }
      for (const n of nodes) { n.vx += (dims.w / 2 - n.x) * 0.001; n.vy += (dims.h / 2 - n.y) * 0.001 }
      for (const n of nodes) {
        if (dragRef.current?.node === n) continue
        n.vx *= 0.85; n.vy *= 0.85; n.x += n.vx; n.y += n.vy
        n.x = Math.max(30, Math.min(dims.w - 30, n.x)); n.y = Math.max(30, Math.min(dims.h - 30, n.y))
      }

      ctx!.clearRect(0, 0, dims.w, dims.h)
      ctx!.strokeStyle = 'rgba(108,159,255,0.12)'; ctx!.lineWidth = 1
      for (const e of edges) {
        ctx!.beginPath(); ctx!.moveTo(nodes[e.from].x, nodes[e.from].y); ctx!.lineTo(nodes[e.to].x, nodes[e.to].y); ctx!.stroke()
      }
      if (hovered) {
        const hi = nodes.indexOf(hovered)
        ctx!.strokeStyle = 'rgba(108,159,255,0.4)'; ctx!.lineWidth = 2
        for (const e of edges) {
          if (e.from === hi || e.to === hi) {
            ctx!.beginPath(); ctx!.moveTo(nodes[e.from].x, nodes[e.from].y); ctx!.lineTo(nodes[e.to].x, nodes[e.to].y); ctx!.stroke()
          }
        }
      }
      for (const n of nodes) {
        const color = CAT_COLORS[n.category]
        const isH = n === hovered, r = isH ? 8 : 5
        ctx!.shadowColor = color; ctx!.shadowBlur = isH ? 16 : 6
        ctx!.beginPath(); ctx!.arc(n.x, n.y, r, 0, Math.PI * 2); ctx!.fillStyle = color; ctx!.fill()
        ctx!.shadowBlur = 0
        if (isH) {
          ctx!.font = '12px "Space Mono", monospace'; ctx!.fillStyle = '#f0f0ff'; ctx!.textAlign = 'center'
          ctx!.fillText(n.title, n.x, n.y - 16)
          ctx!.font = '10px "Space Mono", monospace'; ctx!.fillStyle = '#8888a0'
          ctx!.fillText(n.category, n.x, n.y - 30)
        }
      }
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animRef.current)
  }, [dims, hovered])

  const findNode = useCallback((x: number, y: number): GNode | null => {
    for (const n of nodesRef.current) { const dx = n.x - x, dy = n.y - y; if (dx * dx + dy * dy < 200) return n }
    return null
  }, [])

  function onMove(e: React.MouseEvent) {
    const rect = canvasRef.current?.getBoundingClientRect(); if (!rect) return
    const x = e.clientX - rect.left, y = e.clientY - rect.top
    if (dragRef.current) {
      dragRef.current.node.x = x - dragRef.current.ox; dragRef.current.node.y = y - dragRef.current.oy
      dragRef.current.node.vx = 0; dragRef.current.node.vy = 0; return
    }
    const node = findNode(x, y); setHovered(node)
    if (canvasRef.current) canvasRef.current.style.cursor = node ? 'pointer' : 'default'
  }
  function onDown(e: React.MouseEvent) {
    const rect = canvasRef.current?.getBoundingClientRect(); if (!rect) return
    const node = findNode(e.clientX - rect.left, e.clientY - rect.top)
    if (node) dragRef.current = { node, ox: e.clientX - rect.left - node.x, oy: e.clientY - rect.top - node.y }
  }
  function onUp() { dragRef.current = null }
  function onClick(e: React.MouseEvent) {
    if (dragRef.current) return
    const rect = canvasRef.current?.getBoundingClientRect(); if (!rect) return
    const node = findNode(e.clientX - rect.left, e.clientY - rect.top)
    if (node) onNav({ type: 'article', slug: node.slug })
  }

  const usedCats = [...new Set(articles.map(a => a.category))]

  return (
    <div className="fp-graph">
      <div className="fp-graph-header">
        <h2 className="fp-section-title">knowledge graph</h2>
        <div className="fp-graph-legend">
          {usedCats.map(c => (
            <span key={c} className="fp-legend-item">
              <span className="fp-legend-dot" style={{ background: CAT_COLORS[c] }} />
              {c}
            </span>
          ))}
        </div>
      </div>
      <div className="fp-graph-container">
        <canvas ref={canvasRef} onMouseMove={onMove} onMouseDown={onDown} onMouseUp={onUp} onMouseLeave={onUp} onClick={onClick} />
      </div>
    </div>
  )
}

// ── Main Farzapedia Component ──────────────────────────

export function Farzapedia({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<View>({ type: 'index' })
  const [search, setSearch] = useState('')
  const stats = getStats()
  const categories = getCategories()

  function nav(v: View) {
    setView(v)
    if (v.type !== 'search') setSearch('')
    window.scrollTo(0, 0)
  }

  function onSearch(q: string) {
    setSearch(q)
    if (q.length > 0) nav({ type: 'search', query: q })
    else if (view.type === 'search') nav({ type: 'index' })
  }

  return (
    <>
      <header className="header">
        <div className="header-left">
          <h1 className="header-title" style={{ cursor: 'pointer' }} onClick={() => nav({ type: 'index' })}>FARZAPEDIA</h1>
          <span className="header-label">personal knowledge base</span>
        </div>
        <div className="header-right">
          <div className="fp-search-box">
            <input
              className="fp-search-input"
              type="text"
              placeholder="search articles..."
              value={search}
              onChange={e => onSearch(e.target.value)}
            />
          </div>
          <button className={`header-wiki-btn ${view.type === 'graph' ? 'fp-active' : ''}`} onClick={() => nav({ type: 'graph' })}>GRAPH</button>
          <span className="header-label"><span className="header-value">{stats.articleCount}</span> articles</span>
          <span className="header-label"><span className="header-value">{stats.linkCount}</span> links</span>
          <button className="header-wiki-btn" onClick={onBack}>BACK</button>
        </div>
      </header>

      <div className="fp-layout">
        <nav className="fp-sidebar">
          <div className="fp-nav-section">
            <div className="fp-nav-label">navigate</div>
            <button className={`fp-nav-link ${view.type === 'index' ? 'fp-active' : ''}`} onClick={() => nav({ type: 'index' })}>index</button>
            <button className={`fp-nav-link ${view.type === 'graph' ? 'fp-active' : ''}`} onClick={() => nav({ type: 'graph' })}>knowledge graph</button>
          </div>
          <div className="fp-nav-section">
            <div className="fp-nav-label">categories</div>
            {categories.map(c => (
              <button key={c.name} className="fp-nav-link" onClick={() => onSearch(c.name)}>
                {CAT_LABELS[c.name]} <span className="fp-nav-count">{c.count}</span>
              </button>
            ))}
          </div>
          <div className="fp-nav-section">
            <div className="fp-nav-label">status</div>
            <div className="fp-nav-meta"><span className="fp-pulse-dot" /> self-updating</div>
            <div className="fp-nav-meta fp-dim">last sync {stats.lastUpdated}</div>
          </div>
        </nav>

        <main className="fp-content">
          {view.type === 'index' && <IndexContent onNav={nav} />}
          {view.type === 'article' && <ArticleContent slug={view.slug} onNav={nav} />}
          {view.type === 'graph' && <GraphContent onNav={nav} />}
          {view.type === 'search' && <SearchContent query={view.query} onNav={nav} />}
        </main>
      </div>
    </>
  )
}
