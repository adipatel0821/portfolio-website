import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts, type BlogPost } from '@/lib/contentful'
import { readingMinutes, wordCount } from '@/lib/readingTime'
import Eyebrow from '@/components/ui/Eyebrow'
import Reveal from '@/components/ui/Reveal'
import PixelHeadline from '@/components/ui/PixelHeadline'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Writing on machine learning research, data engineering, and what happens between a paper implementation and a production system.',
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
    // Contentful unreachable, render the empty state rather than a 500.
  }

  // The newest post leads; the rest run as a list underneath.
  const [lead, ...rest] = posts

  // Topics and totals are derived from the posts themselves, so this section
  // grows with real writing instead of being padded with placeholder copy.
  const topics = Array.from(new Set(posts.flatMap((p) => p.tags))).sort()
  const totalWords = posts.reduce((sum, p) => sum + wordCount(p.body), 0)

  return (
    <>
      {/* ── Header ── */}
      <header className="border-b border-hairline pb-14 pt-[calc(var(--nav-h)+clamp(4rem,10vh,7rem))]">
        <div className="shell">
          <Reveal priority>
            <Eyebrow label="Aditya Patel" sublabel="Writing" className="mb-8" />
          </Reveal>

          <PixelHeadline
            lines={['Notes from', 'the build.']}
            accentLines={[1]}
            className="mb-8 max-w-[15ch] text-display-lg"
            delay={0.1}
          />

          <Reveal delay={0.45} priority>
            <p className="max-w-[52ch] text-body text-ash">
              Machine learning research, data engineering, and what happens in the gap
              between a paper implementation and a system people depend on.
            </p>
          </Reveal>
        </div>
      </header>

      {posts.length === 0 ? (
        <section aria-label="Articles" className="py-chapter">
          <div className="shell">
            <Reveal>
              <div className="border border-hairline p-14 text-center">
                <p className="type-label mb-4 text-signal">Coming soon</p>
                <p className="text-body text-ash">
                  No posts published yet. Articles are on the way.
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      ) : (
        <>
          {/* ── Counts ── */}
          <section aria-label="At a glance" className="border-b border-hairline">
            <div className="shell">
              <dl className="grid grid-cols-3 gap-px bg-[rgba(255,255,255,0.06)]">
                {[
                  { label: posts.length === 1 ? 'Article' : 'Articles', value: String(posts.length) },
                  { label: 'Words written', value: totalWords.toLocaleString('en-US') },
                  { label: 'Topics', value: String(topics.length) },
                ].map((stat, i) => (
                  <Reveal key={stat.label} delay={i * 0.06} className="flex flex-col bg-ink py-7">
                    <dt className="type-label order-2 text-ash">{stat.label}</dt>
                    <dd className="type-pixel order-1 mb-1.5 text-2xl text-signal">
                      {stat.value}
                    </dd>
                  </Reveal>
                ))}
              </dl>
            </div>
          </section>

          {/* ── Lead article ── */}
          <section aria-label="Latest article" className="py-chapter">
            <div className="shell">
              <Reveal>
                <Eyebrow label="Latest" sublabel={formatDate(lead.publishedDate)} className="mb-8" />
              </Reveal>

              <Reveal delay={0.06}>
                <Link
                  href={`/blog/${lead.slug}`}
                  data-cursor="hover"
                  className="group block border border-hairline p-8 transition-colors duration-500 ease-cinema hover:bg-ink-800 md:p-12"
                >
                  <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-start md:gap-14">
                    <div className="max-w-prose">
                      <h2 className="type-display mb-5 text-display-sm text-chalk transition-colors duration-300 group-hover:text-signal">
                        {lead.title}
                      </h2>
                      <p className="mb-6 text-body text-ash">{lead.excerpt}</p>
                      <span className="type-label inline-flex items-center gap-2 text-ash transition-colors duration-300 group-hover:text-signal">
                        Read article
                        <span
                          aria-hidden="true"
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        >
                          →
                        </span>
                      </span>
                    </div>

                    <dl className="flex gap-10 md:w-40 md:flex-col md:gap-5">
                      <div>
                        <dt className="type-label mb-1 text-dust">Reading time</dt>
                        <dd className="type-label text-chalk">
                          {readingMinutes(lead.body)} min
                        </dd>
                      </div>
                      {lead.tags.length > 0 && (
                        <div>
                          <dt className="type-label mb-1 text-dust">Topic</dt>
                          <dd className="type-label text-chalk">{lead.tags[0]}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </Link>
              </Reveal>
            </div>
          </section>

          {/* ── Everything else ── */}
          {rest.length > 0 && (
            <section aria-label="All articles" className="border-t border-hairline py-chapter">
              <div className="shell">
                <Reveal>
                  <h2 className="type-label mb-8 text-ash">Earlier writing</h2>
                </Reveal>

                <ol className="border-t border-hairline">
                  {rest.map((post, i) => (
                    <li key={post.slug}>
                      <Reveal delay={i * 0.05}>
                        <Link
                          href={`/blog/${post.slug}`}
                          data-cursor="hover"
                          className="group grid gap-5 border-b border-hairline py-9 transition-colors duration-500 ease-cinema hover:bg-ink-800 md:grid-cols-[auto_1fr_auto] md:items-baseline md:gap-12 md:px-6"
                        >
                          <div className="md:w-36">
                            <span className="type-pixel mb-2 block text-sm text-signal">
                              {String(i + 2).padStart(2, '0')}
                            </span>
                            <time
                              dateTime={post.publishedDate}
                              className="type-label block text-dust"
                            >
                              {formatDate(post.publishedDate)}
                            </time>
                          </div>

                          <div className="max-w-prose">
                            <h3 className="type-display mb-3 text-display-sm text-chalk transition-colors duration-300 group-hover:text-signal">
                              {post.title}
                            </h3>
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

                          <span className="type-label whitespace-nowrap text-dust md:text-right">
                            {readingMinutes(post.body)} min read
                          </span>
                        </Link>
                      </Reveal>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          )}

          {/* ── Topics ── */}
          {topics.length > 0 && (
            <section aria-labelledby="topics-heading" className="border-t border-hairline py-chapter">
              <div className="shell">
                <div className="grid gap-8 md:grid-cols-[auto_1fr] md:gap-20">
                  <h2 id="topics-heading" className="type-label text-ash md:w-40">
                    What I write about
                  </h2>
                  <Reveal>
                    <ul className="flex flex-wrap gap-2">
                      {topics.map((topic) => (
                        <li
                          key={topic}
                          className="type-label border border-hairline px-3 py-1.5 text-ash"
                        >
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* ── Next ── */}
      <section className="border-t border-hairline py-14">
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
