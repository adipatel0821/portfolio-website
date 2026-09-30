'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { DOMAINS, type Domain, type Project } from '@/data/projects'
import ProjectGlyph from './ProjectGlyph'
import Reveal from '@/components/ui/Reveal'
import { clsx } from '@/lib/clsx'
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe'

/**
 * Filterable project index.
 *
 * The previous version rendered filter buttons that did nothing and listed
 * categories that did not exist in the data. These filter for real, against the
 * `domains` field, with live counts so an empty result is never a surprise.
 */

type Filter = Domain | 'All'

export default function ProjectIndex({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<Filter>('All')
  const prefersReduced = useReducedMotionSafe()

  const counts = useMemo(() => {
    const map = new Map<Filter, number>([['All', projects.length]])
    for (const d of DOMAINS) {
      map.set(d, projects.filter((p) => p.domains.includes(d)).length)
    }
    return map
  }, [projects])

  /**
   * Order: featured first, then newest.
   *
   * `featured` was previously set on four projects and read by nothing at all,
   * so the index rendered in raw array order and pushed 2022–2024 work above
   * the current builds. Sorting here is what makes the flag mean something;
   * within each tier the tie-break is year descending so the list cannot go
   * stale just because a project was appended to the end of the array.
   */
  const visible = useMemo(() => {
    const matching =
      filter === 'All' ? projects : projects.filter((p) => p.domains.includes(filter))

    return [...matching].sort((a, b) => {
      if (Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1
      return Number(b.year) - Number(a.year)
    })
  }, [filter, projects])

  const filters: Filter[] = ['All', ...DOMAINS]

  return (
    <>
      {/* ── Filters ── */}
      <div
        role="group"
        aria-label="Filter projects by domain"
        className="mb-14 flex flex-wrap items-center gap-2 border-y border-hairline py-5"
      >
        {filters.map((f) => {
          const active = filter === f
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={active}
              className={clsx(
                'type-label flex items-center gap-2 border px-4 py-2 transition-colors duration-300',
                active
                  ? 'border-signal bg-signal text-[#0a0a0a]'
                  : 'border-hairline text-ash hover:border-hairline-hot hover:text-chalk',
              )}
            >
              {f}
              <span className={clsx('tabular-nums', active ? 'opacity-70' : 'text-dust')}>
                {counts.get(f) ?? 0}
              </span>
            </button>
          )
        })}

        <p aria-live="polite" className="type-label ml-auto text-dust">
          {visible.length} {visible.length === 1 ? 'project' : 'projects'}
        </p>
      </div>

      {/* ── Grid ── */}
      <motion.ul layout={!prefersReduced} className="grid gap-px bg-[rgba(255,255,255,0.06)] md:grid-cols-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((project, i) => (
            <motion.li
              key={project.id}
              layout={!prefersReduced}
              initial={prefersReduced ? false : { opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={prefersReduced ? undefined : { opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.35, delay: prefersReduced ? 0 : i * 0.03, ease: [0.16, 1, 0.3, 1] }}
              className="bg-ink"
            >
              <Link
                href={`/projects/${project.id}`}
                data-cursor="hover"
                className="group flex h-full flex-col p-7 transition-colors duration-500 ease-cinema hover:bg-ink-800 md:p-9"
              >
                {/* Glyph */}
                <div className="mb-7 h-32 w-full opacity-70 transition-opacity duration-500 group-hover:opacity-100">
                  <ProjectGlyph id={project.id} domain={project.domains[0]} />
                </div>

                {/* Meta row */}
                <div className="mb-4 flex items-center gap-3">
                  <span className="type-pixel text-xs text-signal">{project.year}</span>
                  <span aria-hidden="true" className="h-px flex-1 bg-hairline" />
                  <span className="type-label text-dust">{project.domains.join(' · ')}</span>
                </div>

                <h2 className="type-display mb-3 text-xl text-chalk transition-colors duration-300 group-hover:text-signal">
                  {project.shortTitle}
                </h2>

                <p className="mb-6 text-spec text-ash">{project.tagline}</p>

                {/* Lead metric. A <dl> may only contain dt/dd pairs (optionally
                    inside a plain <div>), so the label is the <dt> itself
                    rather than a sibling span, and CSS order puts the value
                    first visually. */}
                <dl className="mt-auto flex flex-row-reverse items-baseline justify-end gap-3 border-t border-hairline-soft pt-5">
                  <dt className="type-label text-dust">{project.metrics[0].label}</dt>
                  <dd className="type-pixel text-lg text-chalk">{project.metrics[0].value}</dd>
                </dl>

                <span className="type-label mt-6 inline-flex items-center gap-2 text-ash transition-colors duration-300 group-hover:text-signal">
                  Read case study
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {visible.length === 0 && (
        <Reveal>
          <p className="border border-hairline p-10 text-center text-spec text-ash">
            No projects in this domain yet.
          </p>
        </Reveal>
      )}
    </>
  )
}
