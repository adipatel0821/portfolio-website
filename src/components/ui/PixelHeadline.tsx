'use client'

import { motion } from 'framer-motion'
import { clsx } from '@/lib/clsx'
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe'

/**
 * The hero headline: dot-matrix glyphs that converge from scattered positions.
 *
 * The characters are set in Departure Mono, so each one is *already* built from
 * pixels, scattering the glyphs themselves reads as a dot-matrix assembly
 * without the cost of animating thousands of individual dots. A true per-dot
 * reveal at this type size would mean ~2,000 animated nodes in the LCP element,
 * which is the wrong trade for the one thing that must paint fastest.
 *
 * The complete headline is exposed to assistive tech as a single string; the
 * animated spans are aria-hidden.
 */

/** Deterministic scatter, must match between server and client render. */
function seeded(n: number): number {
  const x = Math.sin(n * 78.233) * 43758.5453
  return x - Math.floor(x)
}

interface PixelHeadlineProps {
  /** Each entry is a line. */
  lines: string[]
  /** Zero-based indices of lines painted in the accent colour. */
  accentLines?: number[]
  className?: string
  /** Delay before the first character lands. */
  delay?: number
  id?: string
}

export default function PixelHeadline({
  lines,
  accentLines = [],
  className,
  delay = 0.15,
  id,
}: PixelHeadlineProps) {
  const prefersReduced = useReducedMotionSafe()
  const full = lines.join(' ')

  let charIndex = 0

  return (
    <h1
      id={id}
      className={clsx('type-pixel text-display-xl', className)}
      // The animated glyph spans are aria-hidden, so the heading needs its
      // accessible name supplied here, a screen reader should hear one
      // headline, not 26 separate letters. An sr-only copy of the text as well
      // would be redundant: aria-label already overrides element content.
      aria-label={full}
    >
      {lines.map((line, lineIndex) => (
        <span
          key={lineIndex}
          aria-hidden="true"
          className={clsx(
            'block',
            accentLines.includes(lineIndex) ? 'text-signal' : 'text-chalk',
          )}
        >
          {line.split('').map((char, i) => {
            const seed = charIndex++
            if (char === ' ') return <span key={`${lineIndex}-${i}`}>&nbsp;</span>

            if (prefersReduced) {
              return <span key={`${lineIndex}-${i}`}>{char}</span>
            }

            // Scatter on a random vector; nearer characters land first so the
            // line resolves left-to-right with a little turbulence.
            const angle = seeded(seed) * Math.PI * 2
            const dist = 30 + seeded(seed + 3) * 70

            return (
              <motion.span
                key={`${lineIndex}-${i}`}
                className="inline-block"
                // Opacity stays at 1 throughout. This is the LCP element on
                // every page it appears on, and an element that starts
                // transparent is not a contentful paint, fading it in defers
                // LCP until the animation runs. The scatter reads just as well
                // with the glyphs visible from the first frame, and framer
                // serialises these initial transforms into the server HTML, so
                // there is no jump on hydration.
                initial={{
                  x: Math.cos(angle) * dist,
                  y: Math.sin(angle) * dist,
                  scale: 0.72,
                  filter: 'blur(4px)',
                }}
                animate={{ x: 0, y: 0, scale: 1, filter: 'blur(0px)' }}
                transition={{
                  duration: 0.75,
                  delay: delay + seed * 0.016 + seeded(seed + 11) * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {char}
              </motion.span>
            )
          })}
        </span>
      ))}
    </h1>
  )
}
