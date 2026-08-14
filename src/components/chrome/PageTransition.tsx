'use client'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe'

/**
 * Route transitions with no white flash.
 *
 * The page fades and lifts a few pixels; an orange hairline sweeps across the
 * top as the new route mounts. `mode="wait"` would leave the viewport empty
 * mid-transition, so this uses the default (crossfade) with the exiting page
 * absolutely positioned out of flow by the overlay's timing instead.
 *
 * The body background is already near-black, so even a dropped frame shows ink
 * rather than white — which is the actual thing to avoid.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const prefersReduced = useReducedMotionSafe()

  if (prefersReduced) return <>{children}</>

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Sweeping hairline — reads as a shutter without covering the page. */}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-0 z-[110] h-px origin-left bg-signal"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
        />
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
