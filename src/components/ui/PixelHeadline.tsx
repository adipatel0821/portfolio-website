'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { clsx } from '@/lib/clsx'

/**
 * The hero headline: dot-matrix glyphs that converge from scattered positions.
 *
 * The characters are set in Departure Mono, so each one is *already* built from
 * pixels — scattering the glyphs themselves reads as a dot-matrix assembly
 * without the cost of animating thousands of individual dots. A true per-dot
 * reveal at this type size would mean ~2,000 animated nodes in the LCP element,
 * which is the wrong trade for the one thing that must paint fastest.
 *
 * The complete headline is exposed to assistive tech as a single string; the
 * animated spans are aria-hidden.
 */

/** Deterministic scatter — must match between server and client render. */
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
  const prefersReduced = useReducedMotion()
  const full = lines.join(' ')

  let charIndex = 0

  return (
    <h1
      id={id}
      className={clsx('type-pixel text-display-xl', className)}
      // The LCP element must not wait on JS to be legible, and a screen reader
      // should hear one headline, not 26 letters.
      aria-label={full}
    >
      <span className="sr-only">{full}</span>

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
                initial={{
                  opacity: 0,
                  x: Math.cos(angle) * dist,
                  y: Math.sin(angle) * dist,
                  scale: 0.6,
                  filter: 'blur(3px)',
                }}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' }}
                transition={{
                  duration: 0.9,
                  delay: delay + seed * 0.028 + seeded(seed + 11) * 0.1,
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
