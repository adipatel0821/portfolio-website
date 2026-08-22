import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProject, projects } from '@/data/projects'
import ProjectGlyph from '@/components/projects/ProjectGlyph'
import Eyebrow from '@/components/ui/Eyebrow'
import Reveal from '@/components/ui/Reveal'
import HighlightText from '@/components/ui/HighlightText'
import PixelNumeral from '@/components/ui/PixelNumeral'
import LazyMount from '@/components/ui/LazyMount'

/**
 * Only the SynMedix case study carries a live demo, and the weights are only
 * fetched once it mounts, so every other case study pays nothing for it.
 */
const LatentExplorer = dynamic(() => import('@/components/demo/LatentExplorer'))

/** All nine case studies are static, there is no dynamic project source. */
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.id }))
}

export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) return {}

  return {
    title: project.shortTitle,
    description: project.tagline,
    openGraph: {
      title: `${project.shortTitle} · Aditya Patel`,
      description: project.tagline,
      type: 'article',
    },
  }
}

/** Numbered section wrapper, the spec-sheet rhythm used across the case study. */
function Chapter({
  num,
  label,
  children,
}: {
  num: string
  label: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={`sec-${num}`} className="border-t border-hairline py-14">
      <div className="grid gap-8 md:grid-cols-[auto_1fr] md:gap-14">
        <div className="md:w-40">
          <PixelNumeral value={num} tone="signal" className="mb-4" label={`Section ${num}`} />
          <h2 id={`sec-${num}`} className="type-label text-ash">
            {label}
          </h2>
        </div>
        <div className="max-w-prose">{children}</div>
      </div>
    </section>
  )
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) notFound()

  // Wrap-around so the last case study links back to the first.
  const index = projects.findIndex((p) => p.id === project.id)
  const next = projects[(index + 1) % projects.length]

  return (
    <article>
      {/* ── Hero ── */}
      <header className="border-b border-hairline pb-14 pt-[calc(var(--nav-h)+clamp(3rem,8vh,5.5rem))]">
        <div className="shell">
          <Reveal>
            <Link
              href="/projects"
              className="type-label mb-10 inline-flex items-center gap-2 text-dust transition-colors hover:text-signal"
            >
              <span aria-hidden="true">←</span> All projects
            </Link>
          </Reveal>

          <div className="grid items-center gap-12 lg:grid-cols-[1.35fr_1fr]">
            <div>
              <Reveal delay={0.05}>
                <Eyebrow
                  label={project.domains.join(' · ')}
                  sublabel={project.year}
                  className="mb-7"
                />
              </Reveal>

              <Reveal delay={0.1}>
                <h1 className="type-display mb-6 text-display-md text-chalk">
                  {project.shortTitle}
                </h1>
              </Reveal>

              <Reveal delay={0.16}>
                <p className="max-w-[52ch] text-body-lg text-ash">{project.summary}</p>
              </Reveal>

              {(project.github || project.live) && (
                <Reveal delay={0.22}>
                  <div className="mt-9 flex flex-wrap gap-3">
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pill"
                      >
                        Source
                      </a>
                    )}
                    {project.live && (
                      <a
                        href={project.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pill pill-signal"
                      >
                        Live
                      </a>
                    )}
                  </div>
                </Reveal>
              )}
            </div>

            {/* Signature glyph, the centerpiece formation for this domain. */}
            <Reveal delay={0.14} direction="right">
              <div className="relative border border-hairline bg-ink-800 p-8">
                <div className="glow-signal inset-[22%] rounded-full" aria-hidden="true" />
                <div className="relative h-52">
                  <ProjectGlyph id={project.id} domain={project.domains[0]} scale="hero" />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </header>

      {/* ── Metrics strip ── */}
      <section aria-label="Key metrics" className="border-b border-hairline">
        <div className="shell">
          <dl className="grid grid-cols-2 gap-px bg-[rgba(255,255,255,0.06)] lg:grid-cols-4">
            {/* Reveal supplies the wrapping <div> itself, nesting another one
                inside it would put a non-dt/dd grandchild in the <dl>. */}
            {project.metrics.map((metric, i) => (
              <Reveal
                key={metric.label}
                delay={i * 0.06}
                className="flex flex-col bg-ink px-2 py-9"
              >
                <dt className="type-label order-2 text-ash">{metric.label}</dt>
                <dd className="type-pixel order-1 mb-2 text-2xl text-signal md:text-3xl">
                  {metric.value}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="shell">
        <Chapter num="01" label="The problem">
          <Reveal>
            <p className="text-body-lg text-chalk">{project.problem}</p>
          </Reveal>
        </Chapter>

        <Chapter num="02" label="The approach">
          <Reveal>
            <p className="mb-8 text-body-lg text-chalk">{project.approach}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <blockquote className="border-l-2 border-signal pl-6">
              <p className="text-body italic text-ash">{project.vision}</p>
              <footer className="type-label mt-4 text-dust">Why I built it</footer>
            </blockquote>
          </Reveal>
        </Chapter>

        <Chapter num="03" label="Architecture">
          <ol className="flex flex-col">
            {project.architecture.map((step, i) => (
              <li key={step.step}>
                <Reveal delay={i * 0.06}>
                  <div className="grid gap-3 border-t border-hairline-soft py-6 sm:grid-cols-[auto_1fr] sm:gap-7">
                    <div className="flex items-baseline gap-3 sm:w-44">
                      <span className="type-pixel text-xs text-signal">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="type-label text-chalk">{step.step}</h3>
                    </div>
                    <p className="text-spec text-ash">{step.detail}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </Chapter>

        <Chapter num="04" label="Stack">
          <Reveal>
            <dl className="mb-9 border-b border-hairline-soft">
              {project.stack.map((row) => (
                <div key={row.label} className="spec-row">
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal delay={0.08}>
            <ul className="flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <li
                  key={t}
                  className="type-label border border-hairline px-3 py-1.5 text-ash"
                >
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </Chapter>

        <Chapter num="05" label="Outcome">
          <Reveal>
            <p className="text-body-lg text-chalk">{project.outcome}</p>
          </Reveal>
        </Chapter>
      </div>

      {/* ── Live demo (SynMedix only) ── */}
      {project.id === 'synmedix' && (
        <section
          aria-labelledby="demo-heading"
          className="border-t border-hairline py-chapter"
        >
          <div className="shell">
            <div className="mb-10 max-w-[52ch]">
              <Reveal>
                <Eyebrow label="Live demo" sublabel="Runs in your browser" className="mb-6" />
              </Reveal>
              <Reveal delay={0.06}>
                <h2 id="demo-heading" className="type-display mb-5 text-display-sm text-chalk">
                  Explore the latent space.
                </h2>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="text-body text-ash">
                  The generator described above, trained and exported to run in the
                  browser. Move a latent dimension or change the conditioning and the
                  record regenerates locally, with no call to a server.
                </p>
              </Reveal>
            </div>

            {/* Mounted on approach: the explorer fetches 70kb of weights and
                runs inference on mount, which is pure LCP cost while it is
                still four screens below the fold. */}
            <LazyMount
              minHeight={520}
              placeholder={
                <div className="border border-hairline bg-ink-800 p-8">
                  <p className="type-label text-ash">Generator loads as you reach it…</p>
                </div>
              }
            >
              <LatentExplorer />
            </LazyMount>
          </div>
        </section>
      )}

      {/* ── Next project ── */}
      <section
        aria-labelledby="next-heading"
        className="border-t border-hairline py-chapter"
      >
        <div className="shell">
          <Reveal>
            <Eyebrow label="Next" sublabel={next.domains.join(' · ')} className="mb-7" />
          </Reveal>
          <Reveal delay={0.06}>
            <h2 id="next-heading" className="type-display text-display-md">
              <Link href={`/projects/${next.id}`} className="group inline-block text-chalk">
                <HighlightText delay={0.35}>{next.shortTitle}</HighlightText>
                <span
                  aria-hidden="true"
                  className="ml-4 inline-block text-signal transition-transform duration-300 group-hover:translate-x-2"
                >
                  →
                </span>
              </Link>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-[48ch] text-body text-ash">{next.tagline}</p>
          </Reveal>
        </div>
      </section>
    </article>
  )
}
