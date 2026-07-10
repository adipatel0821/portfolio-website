import { NextRequest, NextResponse } from 'next/server'
import { syndicatePost } from '@/lib/syndication'
import { canonicalUrl } from '@/lib/syndication/format'
import type { SyndicationPost } from '@/lib/syndication/types'

// Uses Buffer + outbound fetch to several APIs — run on the Node runtime.
export const runtime = 'nodejs'

/**
 * Contentful webhook endpoint — fires when a blog post is published and
 * cross-posts it to LinkedIn, Reddit, and (assisted) Substack.
 *
 * Contentful webhook setup:
 *   URL:     https://pateladitya.dev/api/syndicate?secret=<SYNDICATE_SECRET>
 *   Trigger: Entry → Publish  (content type: blogPost)
 *   Header:  keep the default "X-Contentful-Topic"
 *
 * Idempotent: only the FIRST publish syndicates (Contentful bumps
 * sys.publishedCounter on every publish), so later edits never re-post.
 */

const SECRET = process.env.SYNDICATE_SECRET || process.env.REVALIDATE_SECRET

// Contentful management payloads localise every field: { 'en-US': value }.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loc(field: any): any {
  if (field == null || typeof field !== 'object') return field
  const locales = Object.keys(field)
  return locales.length ? field[locales[0]] : undefined
}

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (!SECRET || secret !== SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  // Only act on publish events (ignore unpublish/archive/etc).
  const topic = req.headers.get('x-contentful-topic') || ''
  if (topic && !topic.endsWith('Entry.publish')) {
    return NextResponse.json({ skipped: 'not a publish event', topic })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let payload: any
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  const contentType = payload?.sys?.contentType?.sys?.id
  if (contentType && contentType !== 'blogPost') {
    return NextResponse.json({ skipped: 'not a blogPost', contentType })
  }

  // Idempotency guard — only the first publish should syndicate.
  const publishedCounter = payload?.sys?.publishedCounter
  if (typeof publishedCounter === 'number' && publishedCounter > 1) {
    return NextResponse.json({ skipped: 'republish — already syndicated', publishedCounter })
  }

  const fields = payload?.fields ?? {}
  const slug = loc(fields.slug)
  const title = loc(fields.title)
  if (!slug || !title) {
    return NextResponse.json({ error: 'missing slug/title in payload' }, { status: 422 })
  }

  const tags = loc(fields.tags)
  const post: SyndicationPost = {
    title,
    slug,
    excerpt: loc(fields.excerpt) ?? '',
    tags: Array.isArray(tags) ? tags : [],
    url: canonicalUrl(slug),
  }

  const results = await syndicatePost(post)
  return NextResponse.json({ syndicated: true, post: post.slug, results })
}
