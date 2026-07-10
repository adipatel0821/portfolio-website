import type { SyndicationPost } from './types'

/** Base site URL. Override with NEXT_PUBLIC_SITE_URL if the domain ever changes. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://pateladitya.dev'

export function canonicalUrl(slug: string): string {
  return `${SITE_URL}/blog/${slug}`
}

/** Turn Contentful tags into up-to-`max` clean hashtags for social platforms. */
export function hashtags(tags: string[], max = 5): string {
  return tags
    .slice(0, max)
    .map((t) => '#' + t.replace(/[^a-zA-Z0-9]/g, ''))
    .filter((t) => t.length > 1)
    .join(' ')
}

/**
 * The shared teaser body used for LinkedIn (feed commentary) and Reddit
 * (self-post text): title, excerpt hook, canonical link back, hashtags.
 */
export function teaser(post: SyndicationPost): string {
  const parts = [post.title, '', post.excerpt, '', 'Read the full post ↓', post.url]
  const tags = hashtags(post.tags)
  if (tags) parts.push('', tags)
  return parts.join('\n')
}
