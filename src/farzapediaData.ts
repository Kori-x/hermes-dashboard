import { articles } from './farzapediaArticles'
import type { Article, Link, Category } from './farzapediaTypes'

export { articles }

const bySlug = new Map<string, Article>()
for (const a of articles) bySlug.set(a.slug, a)

export function getArticle(slug: string): Article | undefined {
  return bySlug.get(slug)
}

// extract all internal links from article bodies
// matches [text](slug) where slug doesn't start with http
function extractLinks(body: string): string[] {
  const re = /\[([^\]]+)\]\(([^)]+)\)/g
  const links: string[] = []
  let m
  while ((m = re.exec(body))) {
    const target = m[2]
    if (!target.startsWith('http') && !target.startsWith('#')) {
      links.push(target.replace(/\.md$/, ''))
    }
  }
  return links
}

// all directional links
export function getAllLinks(): Link[] {
  const links: Link[] = []
  for (const a of articles) {
    for (const target of extractLinks(a.body)) {
      if (bySlug.has(target)) {
        links.push({ from: a.slug, to: target })
      }
    }
    for (const target of a.seeAlso) {
      if (bySlug.has(target) && !extractLinks(a.body).includes(target)) {
        links.push({ from: a.slug, to: target })
      }
    }
  }
  return links
}

// articles that link TO this slug
export function getBacklinks(slug: string): Article[] {
  const linkers = new Set<string>()
  for (const a of articles) {
    if (a.slug === slug) continue
    const targets = [...extractLinks(a.body), ...a.seeAlso]
    if (targets.includes(slug)) linkers.add(a.slug)
  }
  return articles.filter(a => linkers.has(a.slug))
}

// unique categories with counts
export function getCategories(): { name: Category; count: number }[] {
  const map = new Map<Category, number>()
  for (const a of articles) {
    map.set(a.category, (map.get(a.category) || 0) + 1)
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

// search articles by query
export function searchArticles(query: string): Article[] {
  const q = query.toLowerCase()
  return articles.filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.body.toLowerCase().includes(q) ||
    a.category.includes(q) ||
    a.tags.some(t => t.includes(q))
  )
}

// stats
export function getStats() {
  const links = getAllLinks()
  const categories = getCategories()
  const newest = articles.reduce((a, b) => a.updated > b.updated ? a : b)
  return {
    articleCount: articles.length,
    linkCount: links.length,
    categoryCount: categories.length,
    lastUpdated: newest.updated,
  }
}
