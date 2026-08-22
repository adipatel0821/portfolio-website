'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe'

/**
 * Route transition.
 *
 * Deliberately minimal. The previous version wrapped this in AnimatePresence
 * with mode="wait", which holds the incoming route until the outgoing one has
 * finished a 380ms exit animation. That exit is dead time: the visitor has
 * already clicked, and every millisecond of it is latency they feel. Measured
 * at 330 to 500ms per navigation on a throttled CPU.
 *
 * Now the new route mounts immediately and fades up over 180ms. There is no
 * exit animation and no AnimatePresence, so a click paints the next page on the
 * following frame. The body is near-black, so an instant swap never flashes
 * white, which was the only thing the crossfade was protecting against.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const prefersReduced = useReducedMotionSafe()

  if (prefersReduced) return <>{children}</>

  return (
    // Keyed on pathname so the fade replays per route. No exit state, so React
    // swaps the subtree in the same commit as the navigation.
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
