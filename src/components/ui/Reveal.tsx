'use client'

import { useRef, type ReactNode, type ElementType } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

/**
 * Motion components are created once at module scope. Calling `motion(tag)`
 * inside render returns a brand-new component type on every pass, which
 * remounts the subtree and throws away the animation mid-flight.
 */
const MOTION_TAGS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  li: motion.li,
  span: motion.span,
  p: motion.p,
  h2: motion.h2,
  h3: motion.h3,
  figure: motion.figure,
} as const

type RevealTag = keyof typeof MOTION_TAGS

interface RevealProps {
  children: ReactNode
  /** Stagger offset in seconds. */
  delay?: number
  /** Distance travelled, in px. Small by default — this is a lift, not a slide. */
  distance?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  as?: RevealTag
  className?: string
  /** Replay every time it enters the viewport instead of firing once. */
  repeat?: boolean
}

/**
 * The house entrance animation. Everything that enters the viewport uses this
 * so the whole site shares one timing curve.
 *
 * Under `prefers-reduced-motion` the element renders at its final state with
 * no transform and no opacity ramp — not a shortened animation, none at all.
 */
export default function Reveal({
  children,
  delay = 0,
  distance = 24,
  direction = 'up',
  as = 'div',
  className,
  repeat = false,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()

  // -12% bottom margin: fire once the element is genuinely in view rather than
  // the instant its first pixel crosses the fold.
  const inView = useInView(ref, { once: !repeat, margin: '0px 0px -12% 0px' })

  // Widen to one concrete motion type; the union of tags intersects their ref
  // types into something unsatisfiable otherwise.
  const MotionTag = MOTION_TAGS[as] as typeof motion.div

  if (prefersReduced) {
    const Tag = as as ElementType
    return <Tag className={className}>{children}</Tag>
  }

  const offset = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    none: { x: 0, y: 0 },
  }[direction]

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...offset }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...offset }}
      transition={{
        duration: 0.75,
        delay,
        ease: [0.16, 1, 0.3, 1], // the house curve
      }}
    >
      {children}
    </MotionTag>
  )
}
