import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts, type BlogPost } from '@/lib/contentful'
import { readingMinutes } from '@/lib/readingTime'
import Eyebrow from '@/components/ui/Eyebrow'
import Reveal from '@/components/ui/Reveal'
import PixelHeadline from '@/components/ui/PixelHeadline'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Writing on machine learning research, data engineering, and what actually happens between a paper implementation and a production system.',
}

export const revalidate = 60

function formatDate(iso: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function BlogPage() {
  let posts: BlogPost[] = []
  try {
    posts = await getAllPosts()
  } catch {
    // Contentful unreachable — render the empty state rather than a 500.
  }

  return (
    <>
      {/* ── Header ── */}
      <header className="border-b border-hairline pb-16 pt-[calc(var(--nav-h)+clamp(4rem,10vh,7rem))]">
        <div className="shell">
          <Reveal priority>
            <Eyebrow
              label="Aditya Patel"
              sublabel={`Writing · ${posts.length} ${posts.length === 1 ? 'article' : 'articles'}`}
              className="mb-8"
            />
          </Reveal>

          <PixelHeadline
            lines={['Notes from', 'the build.']}
            accentLines={[1]}
            className="mb-8 max-w-[15ch] text-display-lg"
            delay={0.1}
          />

          <Reveal delay={0.45} priority>
            <p className="max-w-[52ch] text-body text-ash">
              Machine learning research, data engineering, and what actually happens in the
              gap between a paper implementation and a system people depend on.
            </p>
          </Reveal>
        </div>
      </header>

      {/* ── Index ── */}
      <section aria-label="Articles" className="py-16">
        <div className="shell">
          {posts.length === 0 ? (
            <Reveal>
              <div className="border border-hairline p-14 text-center">
                <p className="type-label mb-4 text-signal">Coming soon</p>
                <p className="text-body text-ash">
                  No posts published yet. Articles are on the way.
                </p>
              </div>
            </Reveal>
          ) : (
            <ol className="border-t border-hairline">
              {posts.map((post, i) => (
                <li key={post.slug}>
                  <Reveal delay={i * 0.05}>
                    <Link
                      href={`/blog/${post.slug}`}
                      data-cursor="hover"
                      className="group grid gap-5 border-b border-hairline py-10 transition-colors duration-500 ease-cinema hover:bg-ink-800 md:grid-cols-[auto_1fr_auto] md:items-baseline md:gap-12 md:px-6"
                    >
                      {/* Index + date */}
                      <div className="md:w-36">
                        <span className="type-pixel mb-2 block text-sm text-signal">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <time
                          dateTime={post.publishedDate}
                          className="type-label block text-dust"
                        >
                          {formatDate(post.publishedDate)}
                        </time>
                      </div>

                      {/* Title + excerpt */}
                      <div className="max-w-prose">
                        <h2 className="type-display mb-3 text-display-sm text-chalk transition-colors duration-300 group-hover:text-signal">
                          {post.title}
                        </h2>
                        <p className="mb-4 text-spec text-ash">{post.excerpt}</p>
                        {post.tags.length > 0 && (
                          <ul className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                              <li
                                key={tag}
                                className="type-label border border-hairline px-2.5 py-1 text-dust"
                              >
                                {tag}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Reading time */}
                      <span className="type-label whitespace-nowrap text-dust md:text-right">
                        {readingMinutes(post.body)} min read
                      </span>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      {/* ── Next ── */}
      <section className="border-t border-hairline py-16">
        <div className="shell flex flex-wrap items-center justify-between gap-6">
          <p className="type-label text-dust">Next</p>
          <Link
            href="/contact"
            className="type-display text-display-sm text-chalk transition-colors hover:text-signal"
          >
            Start a conversation →
          </Link>
        </div>
      </section>
    </>
  )
}
