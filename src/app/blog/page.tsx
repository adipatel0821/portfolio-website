import type { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, ArrowRight, BookOpen } from 'lucide-react'
import { getAllPosts } from '@/lib/contentful'
import type { BlogPost } from '@/lib/contentful'
import ScrollReveal from '@/components/ScrollReveal'

export const metadata: Metadata = {
  title: 'Blog | Aditya Patel',
  description:
    'Articles on machine learning, data engineering, and building production AI systems.',
}

export const revalidate = 60

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// ─── Featured card (first post) ───────────────────────────────────────────────

function FeaturedCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <div
        className="glass-card overflow-hidden group"
        style={{ borderRadius: 24 }}
      >
        {/* Cover image */}
        {post.coverImage ? (
          <div className="relative h-64 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage.url}
              alt={post.coverImage.title}
              width={post.coverImage.width}
              height={post.coverImage.height}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to bottom, transparent 40%, var(--bg-primary) 100%)',
              }}
            />
          </div>
        ) : (
          <div
            className="h-2"
            style={{
              background:
                'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
            }}
          />
        )}

        <div className="p-8 md:p-10">
          {/* Date + tags */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <Calendar size={11} />
              {formatDate(post.publishedDate)}
            </span>
            {post.tags.map((tag) => (
              <span key={tag} className="tech-chip">{tag}</span>
            ))}
          </div>

          <h2
            className="font-display font-black text-2xl md:text-3xl leading-snug mb-4 group-hover:text-[var(--accent-primary)] transition-colors"
            style={{ color: 'var(--text-primary)' }}
          >
            {post.title}
          </h2>

          <p
            className="text-base leading-relaxed mb-6 max-w-2xl"
            style={{ color: 'var(--text-secondary)' }}
          >
            {post.excerpt}
          </p>

          <span
            className="inline-flex items-center gap-2 font-bold text-sm"
            style={{ color: 'var(--accent-primary)' }}
          >
            Read Article <ArrowRight size={15} />
          </span>
        </div>
      </div>
    </Link>
  )
}

// ─── Grid card ────────────────────────────────────────────────────────────────

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block h-full">
      <div
        className="glass-card h-full group flex flex-col overflow-hidden"
        style={{ borderRadius: 22 }}
      >
        {/* Cover image thumbnail */}
        {post.coverImage ? (
          <div className="relative h-44 overflow-hidden rounded-t-[22px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage.url}
              alt={post.coverImage.title}
              width={post.coverImage.width}
              height={post.coverImage.height}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ) : (
          <div
            className="h-1.5 rounded-t-[22px]"
            style={{
              background:
                'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
            }}
          />
        )}

        <div className="p-6 flex flex-col flex-1">
          {/* Date */}
          <span
            className="flex items-center gap-1.5 text-xs mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            <Calendar size={11} />
            {formatDate(post.publishedDate)}
          </span>

          {/* Title */}
          <h2
            className="font-display font-bold text-lg leading-snug mb-3 group-hover:text-[var(--accent-primary)] transition-colors"
            style={{ color: 'var(--text-primary)' }}
          >
            {post.title}
          </h2>

          {/* Excerpt */}
          <p
            className="text-sm leading-relaxed mb-5 flex-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            {post.excerpt}
          </p>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-4 border-t mt-auto" style={{ borderColor: 'var(--divider)' }}>
              {post.tags.map((tag) => (
                <span key={tag} className="tech-chip">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="text-center py-24">
      <p className="section-label mb-3">Coming Soon</p>
      <h2 className="section-heading text-3xl mb-4">No posts published yet.</h2>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Check back soon, articles are on the way.
      </p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogPage() {
  let posts: BlogPost[] = []

  try {
    posts = await getAllPosts()
  } catch {
    // Contentful not reachable — render empty state
  }

  const [featured, ...rest] = posts

  return (
    <>
      {/* Header */}
      <div className="pt-36 page-section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container-xl">
          <ScrollReveal>
            <p className="section-label mb-3">Writing</p>
            <h1
              className="section-heading mb-6"
              style={{ fontSize: 'clamp(2.8rem, 7vw, 6rem)' }}
            >
              Blog
            </h1>
            <div className="accent-line" />
            <p className="mt-5 text-base max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
              I write about machine learning research, data engineering, production AI systems,
              and lessons from building real-world projects.
            </p>

            {posts.length > 0 && (
              <div className="mt-8">
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                  style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <BookOpen size={14} style={{ color: 'var(--accent-primary)' }} />
                  {posts.length} {posts.length === 1 ? 'article' : 'articles'} published
                </div>
              </div>
            )}
          </ScrollReveal>
        </div>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <section className="page-section" style={{ background: 'var(--bg-primary)' }}>
          <div className="container-xl">
            <EmptyState />
          </div>
        </section>
      ) : (
        <>
          {/* Featured */}
          <section className="pt-16 pb-8" style={{ background: 'var(--bg-primary)' }}>
            <div className="container-xl">
              <ScrollReveal>
                <p className="section-label mb-4">Featured</p>
              </ScrollReveal>
              <ScrollReveal delay={0.05}>
                <FeaturedCard post={featured} />
              </ScrollReveal>
            </div>
          </section>

          {/* Grid */}
          {rest.length > 0 && (
            <section className="pt-8 pb-24" style={{ background: 'var(--bg-primary)' }}>
              <div className="container-xl">
                <ScrollReveal>
                  <p className="section-label mb-8">All Articles</p>
                </ScrollReveal>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((post, i) => (
                    <ScrollReveal key={post.slug} delay={i * 0.07}>
                      <PostCard post={post} />
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* CTA */}
      <section className="py-20" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container-xl">
          <ScrollReveal>
            <div
              className="glass-card text-center py-14 px-8"
              style={{
                borderRadius: 26,
                background:
                  'linear-gradient(135deg, rgba(0,212,255,0.06) 0%, rgba(168,85,247,0.06) 100%)',
              }}
            >
              <p className="section-label mb-3">Get in Touch</p>
              <h2 className="section-heading text-3xl md:text-4xl mb-4">
                Have a topic in mind?
              </h2>
              <p
                className="text-base max-w-md mx-auto mb-8"
                style={{ color: 'var(--text-secondary)' }}
              >
                Reach out if you want to discuss ML, data engineering, or anything I&apos;ve
                written about. Always happy to go deeper.
              </p>
              <Link href="/contact">
                <button className="liquid-btn px-8 py-4 text-base font-bold">
                  Start a Conversation →
                </button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
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
