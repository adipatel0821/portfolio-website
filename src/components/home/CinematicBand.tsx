'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import Eyebrow from '@/components/ui/Eyebrow'

/**
 * Full-bleed cinematic moment — the reference's lifestyle band, translated to a
 * data surface. Bottom-left overlay headline, second line in the accent colour.
 *
 * The backdrop is a generated data-viz field rather than a photograph: there is
 * no real workspace shot in the repo yet, and a stock image would be the one
 * dishonest thing on the page. Swap in a portrait here when one exists — the
 * layout is already sized for it.
 *
 * The field parallaxes slowly against the scroll, which is what sells "band"
 * rather than "section with a background".
 */
export default function CinematicBand() {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Subtle: 8% travel over the full pass. More than this and it reads as a bug.
  const y = useTransform(scrollYProgress, [0, 1], ['-4%', '4%'])

  return (
    <section
      ref={ref}
      aria-labelledby="band-heading"
      className="relative h-[78svh] min-h-[520px] w-full overflow-hidden border-y border-hairline bg-ink-800"
    >
      {/* Parallax field */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 -top-[8%] h-[116%]"
        style={prefersReduced ? undefined : { y }}
      >
        {/* Hairline measurement grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        {/* A plotted signal — pure SVG, no asset request. */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1200 600"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="band-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E86A2B" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#E86A2B" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Deterministic ridgeline: a sum of sines, sampled. */}
          {(() => {
            const pts: string[] = []
            for (let x = 0; x <= 1200; x += 8) {
              const t = x / 1200
              const yv =
                330 +
                Math.sin(t * 9.1) * 62 +
                Math.sin(t * 21.7 + 1.3) * 26 +
                Math.sin(t * 41.3 + 2.1) * 11
              pts.push(`${x},${yv.toFixed(1)}`)
            }
            const line = pts.join(' ')
            return (
              <>
                <polygon points={`0,600 ${line} 1200,600`} fill="url(#band-fill)" />
                <polyline
                  points={line}
                  fill="none"
                  stroke="#E86A2B"
                  strokeWidth="1.5"
                  strokeOpacity="0.75"
                />
              </>
            )
          })()}
          {/* Phosphor secondary trace, offset and quieter. */}
          {(() => {
            const pts: string[] = []
            for (let x = 0; x <= 1200; x += 8) {
              const t = x / 1200
              const yv = 402 + Math.sin(t * 13.4 + 0.7) * 34 + Math.sin(t * 31.1) * 14
              pts.push(`${x},${yv.toFixed(1)}`)
            }
            return (
              <polyline
                points={pts.join(' ')}
                fill="none"
                stroke="#5CF56A"
                strokeWidth="1"
                strokeOpacity="0.42"
              />
            )
          })()}
        </svg>
      </motion.div>

      {/* Legibility scrim — heaviest at the bottom-left where the type sits. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(6,6,6,0.94) 0%, rgba(6,6,6,0.55) 42%, rgba(6,6,6,0.15) 100%)',
        }}
      />

      {/* Overlay headline, bottom-left. */}
      <div className="shell absolute inset-x-0 bottom-0 pb-14">
        <Eyebrow label="Aditya Patel" sublabel="Practice" className="mb-6" />
        <h2 id="band-heading" className="type-display text-display-lg">
          <span className="block text-chalk">From research</span>
          <span className="block text-signal">to production.</span>
        </h2>
        <p className="mt-6 max-w-[44ch] text-body text-ash">
          The interesting problems are never in the model file. They are in the data you
          cannot trust, the pipeline that has to run at 4am, and the deployment nobody
          wants to be paged about.
        </p>
      </div>
    </section>
  )
}
