export type Category =
  | 'projects'
  | 'people'
  | 'concepts'
  | 'inspiration'
  | 'tools'
  | 'reading'
  | 'events'

export interface Article {
  slug: string
  title: string
  category: Category
  body: string
  seeAlso: string[] // slugs
  created: string   // ISO date
  updated: string   // ISO date
  tags: string[]
}

export interface Link {
  from: string // slug
  to: string   // slug
}

export type View =
  | { type: 'index' }
  | { type: 'article'; slug: string }
  | { type: 'graph' }
  | { type: 'search'; query: string }
