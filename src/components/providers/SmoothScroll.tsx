'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

import { usePathname } from 'next/navigation'
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe'

/**
 * Lenis smooth scroll, the backbone of the premium feel.
 *
 * Two details make this work with the rest of the site:
 *
 * 1. Lenis is driven by its own rAF loop but still writes to the real document
 *    scroll position (it transforms nothing). That means Framer Motion's
 *    `useScroll`, which reads `window.scrollY` / IntersectionObserver, stays
 *    correct for free. No manual `scrollerProxy` wiring is needed.
 *
 * 2. Under `prefers-reduced-motion` we never instantiate Lenis at all. Easing
 *    the scroll is itself motion, and a user who asked for less of it should
 *    get the browser's own 1:1 scrolling.
 */
export default function SmoothScroll() {
  const prefersReduced = useReducedMotionSafe()
  const pathname = usePathname()
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (prefersReduced) return

    const lenis = new Lenis({
      // ~1.05s to settle: long enough to feel weighted, short enough that a
      // fast flick still lands where the user expects.
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Touch devices already have native inertia, doubling it feels laggy.
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    })

    lenisRef.current = lenis

    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    // Anchor links must go through Lenis or they snap past the eased position.
    const onAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest?.('a[href^="#"]')
      if (!anchor) return
      const id = anchor.getAttribute('href')
      if (!id || id === '#') return
      const target = document.querySelector(id)
      if (!target) return
      e.preventDefault()
      lenis.scrollTo(target as HTMLElement, { offset: -80 })
    }
    document.addEventListener('click', onAnchorClick)

    return () => {
      document.removeEventListener('click', onAnchorClick)
      cancelAnimationFrame(frame)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [prefersReduced])

  // Lenis caches its own scroll position independently of the document, so a
  // route change needs an explicit immediate reset, otherwise the next page
  // mounts at the top but Lenis eases it back down to where the last one was.
  useEffect(() => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
  }, [pathname])

  return null
}
