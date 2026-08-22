import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { documentToHtmlString } from '@contentful/rich-text-html-renderer'
import { getAllPosts, getPostBySlug } from '@/lib/contentful'
import { readingMinutes, wordCount } from '@/lib/readingTime'
import Eyebrow from '@/components/ui/Eyebrow'
import Reveal from '@/components/ui/Reveal'
import { site } from '@/lib/site'

export const revalidate = 60
export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const posts = await getAllPosts()
    return posts.map((p) => ({ slug: p.slug }))
  } catch {
    // Content type not yet created in Contentful, skip pre-rendering.
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedDate,
      authors: [site.name],
      ...(post.coverImage && { images: [{ url: post.coverImage.url }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      ...(post.coverImage && { images: [post.coverImage.url] }),
    },
  }
}

function formatDate(iso: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const bodyHtml = post.body ? documentToHtmlString(post.body) : ''
  const minutes = readingMinutes(post.body)
  const words = wordCount(post.body)

  const allPosts = await getAllPosts()
  const related = allPosts.filter((p) => p.slug !== post.slug).slice(0, 2)

  // Article structured data, helps the post surface correctly in search.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedDate,
    wordCount: words,
    author: { '@type': 'Person', name: site.name, url: site.url },
    ...(post.coverImage && { image: post.coverImage.url }),
    mainEntityOfPage: `${site.url}/blog/${post.slug}`,
  }

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Header ── */}
      <header className="border-b border-hairline pb-14 pt-[calc(var(--nav-h)+clamp(3rem,8vh,5.5rem))]">
        <div className="shell">
          <div className="max-w-prose">
            <Reveal>
              <Link
                href="/blog"
                className="type-label mb-10 inline-flex items-center gap-2 text-dust transition-colors hover:text-signal"
              >
                <span aria-hidden="true">←</span> All writing
              </Link>
            </Reveal>

            {post.tags.length > 0 && (
              <Reveal delay={0.04}>
                <Eyebrow label={post.tags[0]} sublabel={`${minutes} min read`} className="mb-7" />
              </Reveal>
            )}

            <Reveal delay={0.08}>
              <h1 className="type-display mb-7 text-display-md text-chalk">{post.title}</h1>
            </Reveal>

            <Reveal delay={0.14}>
              <p className="mb-9 text-body-lg text-ash">{post.excerpt}</p>
            </Reveal>

            <Reveal delay={0.18}>
              <dl className="flex flex-wrap gap-x-10 gap-y-3 border-t border-hairline pt-6">
                <div>
                  <dt className="type-label mb-1 text-dust">Published</dt>
                  <dd className="type-label text-chalk">
                    <time dateTime={post.publishedDate}>{formatDate(post.publishedDate)}</time>
                  </dd>
                </div>
                <div>
                  <dt className="type-label mb-1 text-dust">Author</dt>
                  <dd className="type-label text-chalk">{site.name}</dd>
                </div>
                <div>
                  <dt className="type-label mb-1 text-dust">Length</dt>
                  <dd className="type-label text-chalk">
                    {words.toLocaleString('en-US')} words
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </div>
      </header>

      {/* ── Cover ── */}
      {post.coverImage && (
        <div className="border-b border-hairline">
          <div className="shell py-10">
            <figure className="max-w-prose border border-hairline">
              <Image
                src={post.coverImage.url}
                alt={post.coverImage.title || post.title}
                width={post.coverImage.width}
                height={post.coverImage.height}
                sizes="(max-width: 900px) 100vw, 68ch"
                className="h-auto w-full object-cover"
                priority
              />
            </figure>
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div className="shell py-16">
        <div
          className="article-prose max-w-prose"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      </div>

      {/* ── Related ── */}
      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="border-t border-hairline py-chapter">
          <div className="shell">
            <Reveal>
              <Eyebrow label="Continue reading" className="mb-10" />
            </Reveal>
            <h2 id="related-heading" className="sr-only">
              More articles
            </h2>

            <ul className="grid gap-px bg-[rgba(255,255,255,0.06)] md:grid-cols-2">
              {related.map((rel, i) => (
                <li key={rel.slug} className="bg-ink">
                  <Reveal delay={i * 0.06}>
                    <Link
                      href={`/blog/${rel.slug}`}
                      data-cursor="hover"
                      className="group block h-full p-8 transition-colors duration-500 ease-cinema hover:bg-ink-800"
                    >
                      <p className="type-label mb-4 text-dust">
                        {formatDate(rel.publishedDate)} · {readingMinutes(rel.body)} min
                      </p>
                      <h3 className="type-display mb-3 text-lg text-chalk transition-colors duration-300 group-hover:text-signal">
                        {rel.title}
                      </h3>
                      <p className="text-spec text-ash">{rel.excerpt}</p>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  )
}
