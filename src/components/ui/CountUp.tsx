'use client'

import { useRef, useEffect, useState } from 'react'
import { useInView, animate } from 'framer-motion'
import { clsx } from '@/lib/clsx'
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe'

interface CountUpProps {
  /** Target number. */
  value: number
  /** Rendered before the number, e.g. "$". */
  prefix?: string
  /** Rendered after the number, e.g. "+" or "K+". */
  suffix?: string
  /** Decimal places. */
  decimals?: number
  duration?: number
  className?: string
}

/**
 * Counts from zero to `value` when scrolled into view.
 *
 * The visible digits are aria-hidden and the final value is exposed once as
 * text, so assistive tech reads "50K+" rather than every intermediate number.
 * `tabular-nums` stops the element from reflowing as digit widths change.
 */
export default function CountUp({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1.6,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  const prefersReduced = useReducedMotionSafe()
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (prefersReduced) {
      setDisplay(value)
      return
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    })
    return () => controls.stop()
  }, [inView, value, duration, prefersReduced])

  const formatted = display.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <span ref={ref} className={clsx('tabular-nums', className)}>
      <span className="sr-only">{`${prefix}${value.toLocaleString('en-US')}${suffix}`}</span>
      <span aria-hidden="true">
        {prefix}
        {formatted}
        {suffix}
      </span>
    </span>
  )
}
