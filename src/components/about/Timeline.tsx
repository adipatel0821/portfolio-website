'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { timeline } from '@/data/about'
import PixelNumeral from '@/components/ui/PixelNumeral'
import Reveal from '@/components/ui/Reveal'
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe'

/**
 * Career timeline.
 *
 * A single hairline runs the length of the list with an orange progress rule
 * drawn over it, scaled by scroll position, so the accent line literally
 * tracks how far through the history you have read. Each entry's node fills as
 * the rule reaches it.
 *
 * Under reduced motion the rule is drawn at full height immediately and nothing
 * animates; the layout is identical.
 */
export default function Timeline() {
  const ref = useRef<HTMLOListElement>(null)
  const prefersReduced = useReducedMotionSafe()

  const { scrollYProgress } = useScroll({
    target: ref,
    // Start filling when the list reaches the lower third of the viewport and
    // finish when its end passes the middle, otherwise the rule completes
    // long before the last entry is readable.
    offset: ['start 75%', 'end 55%'],
  })

  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <ol ref={ref} className="relative">
      {/* Track */}
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-0 top-0 hidden w-px bg-hairline md:block"
      />
      {/* Progress rule */}
      <motion.span
        aria-hidden="true"
        className="absolute bottom-0 left-0 top-0 hidden w-px origin-top bg-signal md:block"
        style={prefersReduced ? { scaleY: 1 } : { scaleY }}
      />

      {timeline.map((stop, i) => (
        <li key={stop.num} className="relative md:pl-14">
          {/* Node */}
          <span
            aria-hidden="true"
            className="absolute left-0 top-[3.25rem] hidden h-2 w-2 -translate-x-[3.5px] bg-ink ring-1 ring-signal md:block"
          />

          <div className="border-t border-hairline py-12">
            <Reveal delay={i * 0.04}>
              <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:gap-14">
                {/* Left rail */}
                <div className="lg:w-44">
                  <PixelNumeral
                    value={stop.num}
                    tone="signal"
                    className="mb-5"
                    label={`Entry ${stop.num}`}
                  />
                  <p className="type-label mb-1 text-chalk">{stop.period}</p>
                  <p className="type-label text-dust">{stop.kind}</p>
                </div>

                {/* Body */}
                <div className="max-w-prose">
                  <h3 className="type-display mb-2 text-display-sm text-chalk">
                    {stop.title}
                  </h3>
                  <p className="type-label mb-6 text-signal">{stop.org}</p>
                  <p className="mb-7 text-body text-ash">{stop.body}</p>

                  <dl className="border-b border-hairline-soft">
                    {stop.detail.map((d) => (
                      <div key={d.label} className="spec-row">
                        <dt>{d.label}</dt>
                        <dd>{d.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </Reveal>
          </div>
        </li>
      ))}
    </ol>
  )
}
