// Shared types for the blog syndication pipeline.

export interface SyndicationPost {
  title: string
  slug: string
  excerpt: string
  tags: string[]
  /** Canonical URL on pateladitya.dev, every platform links back here. */
  url: string
}

export type SyndicationStatus = 'posted' | 'skipped' | 'failed'

export interface SyndicationResult {
  platform: 'reddit' | 'linkedin' | 'substack'
  status: SyndicationStatus
  /** Human-readable note (reason skipped, error message, or success detail). */
  detail?: string
  /** Permalink to the created post, when the platform returns one. */
  url?: string
}
