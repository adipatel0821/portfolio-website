'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { usePointerFine } from '@/hooks/usePointerFine'
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe'

/**
 * Two-part custom cursor: a small solid dot that tracks the pointer exactly,
 * and a larger hairline ring that lags behind on a spring.
 *
 * The ring expands and turns orange over anything interactive. Detection is by
 * event delegation on `mouseover` rather than per-element listeners, so it
 * covers dynamically rendered content for free.
 *
 * Rendered only on fine pointers and only when motion is welcome. The native
 * cursor is hidden in the same condition (see the inline style on <html>), so
 * touch and reduced-motion users always keep a real cursor.
 */
const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, [data-cursor="hover"]'

export default function CustomCursor() {
  const pointerFine = usePointerFine()
  const prefersReduced = useReducedMotionSafe()
  const enabled = pointerFine && !prefersReduced

  const [hovering, setHovering] = useState(false)
  const [visible, setVisible] = useState(false)

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  // The dot is 1:1. The ring trails it, that lag is the whole effect.
  const ringX = useSpring(x, { stiffness: 320, damping: 30, mass: 0.35 })
  const ringY = useSpring(y, { stiffness: 320, damping: 30, mass: 0.35 })

  useEffect(() => {
    if (!enabled) return

    // Hide the OS cursor only once we're sure we're replacing it.
    document.documentElement.style.cursor = 'none'

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
    }
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null
      setHovering(Boolean(t?.closest?.(INTERACTIVE)))
    }
    const onLeave = () => setVisible(false)

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseleave', onLeave)

    return () => {
      document.documentElement.style.cursor = ''
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [enabled, x, y])

  if (!enabled) return null

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[120]">
      {/* Ring */}
      <motion.div
        className="absolute rounded-full border transition-[width,height,border-color] duration-300 ease-cinema"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          width: hovering ? 44 : 26,
          height: hovering ? 44 : 26,
          borderColor: hovering ? 'var(--signal)' : 'rgba(255,255,255,0.28)',
          opacity: visible ? 1 : 0,
        }}
      />
      {/* Dot */}
      <motion.div
        className="absolute h-1 w-1 rounded-full"
        style={{
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
          background: hovering ? 'var(--signal)' : 'var(--chalk)',
          opacity: visible ? 1 : 0,
        }}
      />
    </div>
  )
}
