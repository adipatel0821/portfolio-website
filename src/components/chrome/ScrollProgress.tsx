'use client'

import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion'

/**
 * Hairline progress bar pinned to the very top of the viewport.
 *
 * Driven by a MotionValue, so scrolling never triggers a React render. The
 * spring smooths the Lenis easing into something that doesn't jitter at the
 * ends of the document.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const prefersReduced = useReducedMotion()

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 38,
    restDelta: 0.001,
  })

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-px origin-left bg-signal"
      style={{ scaleX: prefersReduced ? scrollYProgress : scaleX }}
    />
  )
}
