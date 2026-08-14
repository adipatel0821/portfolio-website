'use client'

import { useRef, type ReactNode } from 'react'
import { motion, useInView } from 'framer-motion'
import { clsx } from '@/lib/clsx'
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe'

interface HighlightTextProps {
  children: ReactNode
  /** Delay before the bar wipes, in seconds. */
  delay?: number
  /** Bar colour. Orange by default; green for the terminal motif. */
  tone?: 'signal' | 'phosphor'
  /** Wipe direction. */
  from?: 'left' | 'right'
  className?: string
}

/**
 * A solid accent block that wipes in behind a key word, with the text sitting
 * on top of it. The reference does this on "Not a Toy."
 *
 * The bar is a separate absolutely-positioned layer rather than a background on
 * the text, so it can scale independently without the glyphs stretching. It's
 * inset slightly beyond the text box so it reads as a highlighter stroke rather
 * than a tight label chip.
 *
 * Under reduced motion the bar is simply already there.
 */
export default function HighlightText({
  children,
  delay = 0.15,
  tone = 'signal',
  from = 'left',
  className,
}: HighlightTextProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  const prefersReduced = useReducedMotionSafe()

  const barColor = tone === 'signal' ? 'bg-signal' : 'bg-phosphor'
  // Orange and green are both light enough that near-black type is the only
  // WCAG-AA-safe choice on top of them.
  const textColor = 'text-[#0a0a0a]'

  return (
    <span ref={ref} className={clsx('relative inline-block isolate', className)}>
      <motion.span
        aria-hidden="true"
        className={clsx('absolute -inset-x-[0.14em] -inset-y-[0.04em] -z-10 block', barColor)}
        style={{ transformOrigin: from }}
        initial={prefersReduced ? { scaleX: 1 } : { scaleX: 0 }}
        animate={inView || prefersReduced ? { scaleX: 1 } : { scaleX: 0 }}
        transition={
          prefersReduced
            ? { duration: 0 }
            : { duration: 0.55, delay, ease: [0.65, 0, 0.35, 1] } // wipe curve
        }
      />
      <span className={clsx('relative', textColor)}>{children}</span>
    </span>
  )
}
