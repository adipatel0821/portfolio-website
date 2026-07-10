import type { SyndicationPost, SyndicationResult } from './types'
import { teaser } from './format'
import { postToReddit } from './reddit'
import { postToLinkedIn } from './linkedin'
import { assistSubstack } from './substack'

const PLATFORMS = ['reddit', 'linkedin', 'substack'] as const

/**
 * Fan out one published post to every platform in parallel. Each platform
 * fails/skips independently — a broken token on one never blocks the others.
 */
export async function syndicatePost(post: SyndicationPost): Promise<SyndicationResult[]> {
  const commentary = teaser(post)
  const settled = await Promise.allSettled([
    postToReddit(post),
    postToLinkedIn(post, commentary),
    assistSubstack(post),
  ])
  return settled.map((s, i) =>
    s.status === 'fulfilled'
      ? s.value
      : { platform: PLATFORMS[i], status: 'failed' as const, detail: String(s.reason) },
  )
}

export type { SyndicationPost, SyndicationResult } from './types'
