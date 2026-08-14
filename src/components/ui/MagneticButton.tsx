'use client'

import { useRef, type ReactNode, type MouseEvent } from 'react'
import Link from 'next/link'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { usePointerFine } from '@/hooks/usePointerFine'
import { clsx } from '@/lib/clsx'
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe'

interface MagneticProps {
  children: ReactNode
  href?: string
  onClick?: () => void
  className?: string
  /** How far the element is allowed to drift toward the cursor, in px. */
  strength?: number
  /** External links open in a new tab. */
  external?: boolean
  ariaLabel?: string
  type?: 'button' | 'submit'
}

/**
 * An element that leans toward the cursor while hovered and springs back on
 * exit. Applied to CTAs, nav items and project cards.
 *
 * Disabled entirely on touch devices (a magnetic offset makes tap targets miss)
 * and under reduced motion. In both cases it renders as an ordinary link or
 * button with identical markup, so keyboard and screen-reader behaviour never
 * depends on the effect being active.
 */
export default function MagneticButton({
  children,
  href,
  onClick,
  className,
  strength = 14,
  external = false,
  ariaLabel,
  type = 'button',
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const pointerFine = usePointerFine()
  const prefersReduced = useReducedMotionSafe()
  const enabled = pointerFine && !prefersReduced

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  // Low stiffness + high damping: it should feel weighted, not springy.
  const springX = useSpring(x, { stiffness: 150, damping: 18, mass: 0.6 })
  const springY = useSpring(y, { stiffness: 150, damping: 18, mass: 0.6 })

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!enabled || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    // Offset from the element's centre, normalised to -1..1, then scaled.
    const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
    const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
    x.set(dx * strength)
    y.set(dy * strength)
  }

  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  const inner = href ? (
    external ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    ) : (
      <Link href={href} className={className} aria-label={ariaLabel}>
        {children}
      </Link>
    )
  ) : (
    <button type={type} onClick={onClick} className={className} aria-label={ariaLabel}>
      {children}
    </button>
  )

  if (!enabled) return inner

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: springX, y: springY }}
      className={clsx('inline-flex')}
      data-cursor="hover"
    >
      {inner}
    </motion.div>
  )
}
