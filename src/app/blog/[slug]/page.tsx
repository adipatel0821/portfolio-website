import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar } from 'lucide-react'
import { documentToHtmlString } from '@contentful/rich-text-html-renderer'
import { getAllPosts, getPostBySlug } from '@/lib/contentful'

export const revalidate = 60
export const dynamicParams = true

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const posts = await getAllPosts()
    return posts.map((p) => ({ slug: p.slug }))
  } catch {
    // Content type not yet created in Contentful — skip pre-rendering
    return []
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  if (!post) return {}
  return {
    title: `${post.title} | Aditya Patel`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedDate,
      ...(post.coverImage && { images: [{ url: post.coverImage.url }] }),
    },
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()

  const bodyHtml = post.body ? documentToHtmlString(post.body) : ''

  // Related posts — fetch all, exclude current, take first two
  const allPosts = await getAllPosts()
  const related = allPosts.filter((p) => p.slug !== post.slug).slice(0, 2)

  return (
    <>
      {/* ── Header ── */}
      <div
        className="pt-36 pb-14 relative overflow-hidden"
        style={{ background: 'var(--bg-secondary)' }}
      >
        {/* Top accent stripe */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background:
              'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
          }}
        />

        <div className="container-xl max-w-[720px]">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold mb-10 transition-opacity hover:opacity-60"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft size={15} />
            Back to Blog
          </Link>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {post.tags.map((tag) => (
                <span key={tag} className="tech-chip">{tag}</span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1
            className="section-heading leading-tight mb-5"
            style={{
              fontSize: 'clamp(1.9rem, 4.5vw, 3rem)',
              color: 'var(--text-primary)',
            }}
          >
            {post.title}
          </h1>

          {/* Accent line */}
          <div className="accent-line mb-6" />

          {/* Excerpt */}
          <p
            className="text-base leading-relaxed mb-8 max-w-prose"
            style={{ color: 'var(--text-secondary)' }}
          >
            {post.excerpt}
          </p>

          {/* Meta */}
          <div
            className="flex items-center justify-between text-xs font-medium"
            style={{ color: 'var(--text-muted)' }}
          >
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              {formatDate(post.publishedDate)}
            </span>
            <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>
              Aditya Patel
            </span>
          </div>
        </div>
      </div>

      {/* ── Cover image ── */}
      {post.coverImage && (
        <div style={{ background: 'var(--bg-secondary)' }}>
          <div className="container-xl max-w-[720px] pb-0">
            <div className="rounded-2xl overflow-hidden">
              <Image
                src={post.coverImage.url}
                alt={post.coverImage.title}
                width={post.coverImage.width}
                height={post.coverImage.height}
                className="w-full object-cover"
                style={{ maxHeight: 420, objectFit: 'cover' }}
                priority
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <article
        className="py-16"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div className="container-xl max-w-[720px]">
          <div
            className="prose-custom"
            style={{ color: 'var(--text-secondary)' }}
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        </div>
      </article>

      {/* ── Related posts ── */}
      {related.length > 0 && (
        <section className="py-20" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container-xl max-w-[720px]">
            <p className="section-label mb-3">Continue Reading</p>
            <h2 className="section-heading text-2xl mb-8">More Articles</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((rel) => (
                <Link key={rel.slug} href={`/blog/${rel.slug}`}>
                  <div
                    className="glass-card p-5 h-full group"
                    style={{ borderRadius: 18 }}
                  >
                    <div className="accent-line mb-4" style={{ width: 32, height: 2 }} />

                    {rel.tags.length > 0 && (
                      <span className="tech-chip mb-2 inline-block">
                        {rel.tags[0]}
                      </span>
                    )}

                    <h3
                      className="font-bold text-sm leading-snug mb-2 group-hover:text-[var(--accent-primary)] transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {rel.title}
                    </h3>

                    <p
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {formatDate(rel.publishedDate)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link href="/blog">
                <button className="liquid-btn px-8 py-3.5 text-sm font-bold">
                  View All Articles
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer
        className="py-10 border-t text-center text-xs"
        style={{
          background: 'var(--bg-primary)',
          borderColor: 'var(--divider)',
          color: 'var(--text-muted)',
        }}
      >
        <p>
          Designed &amp; built by{' '}
          <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>
            Aditya Patel
          </span>{' '}
          in Hoboken, NJ · {new Date().getFullYear()}
        </p>
      </footer>
    </>
  )
}
