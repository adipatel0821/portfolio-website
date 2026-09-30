import type { Metadata } from 'next'
import Link from 'next/link'
import { projects } from '@/data/projects'
import ProjectIndex from '@/components/projects/ProjectIndex'
import Eyebrow from '@/components/ui/Eyebrow'
import Reveal from '@/components/ui/Reveal'
import PixelHeadline from '@/components/ui/PixelHeadline'
import { socials } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Case studies in machine learning, data engineering, IoT and full-stack development. Problem, approach, architecture and measured outcome for each.',
}

/** Spelled-out counts so the copy reads as prose, not as a dashboard. */
const WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'] as const

function spell(n: number): string {
  return WORDS[n] ?? String(n)
}

export default function ProjectsPage() {
  const github = socials.find((s) => s.label === 'GitHub')

  // Derived, not hardcoded: the old copy said "Nine builds" as a literal, which
  // silently goes stale the first time a project is added or removed.
  const withRepo = projects.filter((p) => p.github).length

  return (
    <>
      {/* ── Header ── */}
      <header className="border-b border-hairline pb-16 pt-[calc(var(--nav-h)+clamp(4rem,10vh,7rem))]">
        <div className="shell">
          <Reveal priority>
            <Eyebrow label="Aditya Patel" sublabel="Selected Work" className="mb-8" />
          </Reveal>

          <PixelHeadline
            lines={['Things that', 'shipped.']}
            accentLines={[1]}
            className="mb-8 max-w-[14ch] text-display-lg"
            delay={0.1}
          />

          <Reveal delay={0.5} priority>
            <p className="max-w-[54ch] text-body text-ash">
              {spell(projects.length)} builds across machine learning, data engineering, IoT
              and the web. Each one written up properly: the problem, the approach, the
              architecture and what came out the other end.
            </p>
          </Reveal>
        </div>
      </header>

      {/* ── Index ── */}
      <section aria-label="Project index" className="py-16">
        <div className="shell">
          <ProjectIndex projects={projects} />
        </div>
      </section>

      {/* ── Open source ── */}
      <section aria-labelledby="oss-heading" className="border-t border-hairline py-chapter">
        <div className="shell">
          <div className="max-w-[46ch]">
            <Reveal>
              <Eyebrow label="Open Source" sublabel="Build in public" className="mb-6" />
            </Reveal>
            <Reveal delay={0.06}>
              <h2 id="oss-heading" className="type-display mb-5 text-display-sm text-chalk">
                Some of this is public.
              </h2>
            </Reveal>
            {/* This used to read "Most of this is on GitHub", which was not true:
                only the writeups carrying a repo badge have public source. Saying
                so plainly is better than inviting the one click that disproves it. */}
            <Reveal delay={0.12}>
              <p className="mb-8 text-body text-ash">
                {spell(withRepo)} of the writeups above{' '}
                {withRepo === 1 ? 'links' : 'link'} straight to the source. The rest are
                private for now — client work, builds that are still moving, and datasets I
                am not free to redistribute. The profile holds the older projects,
                coursework and experiments.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <a href={github?.href} target="_blank" rel="noopener noreferrer" className="pill">
                <span className="bracket">View GitHub</span>
              </a>
            </Reveal>
          </div>
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
            Get in touch →
          </Link>
        </div>
      </section>
    </>
  )
}
