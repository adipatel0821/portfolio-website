import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

/**
 * Contentful webhook endpoint — called whenever a blog post is published or
 * unpublished. Revalidates both the blog index and all individual post pages
 * so changes go live immediately without waiting for the 60-second ISR window.
 *
 * Contentful webhook URL:
 *   https://<your-domain>/api/revalidate?secret=<REVALIDATE_SECRET>
 *
 * Events to enable in Contentful:
 *   Entry → Publish
 *   Entry → Unpublish
 */
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')

  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  revalidatePath('/blog')
  revalidatePath('/blog/[slug]', 'page')

  return NextResponse.json({ revalidated: true, at: new Date().toISOString() })
}
