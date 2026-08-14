'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

interface LazyMountProps {
  children: ReactNode
  /** How far ahead of the viewport to mount. */
  rootMargin?: string
  /** Reserves height before mount so nothing shifts when children appear. */
  minHeight?: number
  /** Shown until the children mount. */
  placeholder?: ReactNode
}

/**
 * Mounts children only once they are close to the viewport.
 *
 * `next/dynamic` splits the code but still fetches and executes it on page
 * load. For something heavy and far below the fold — the latent explorer pulls
 * 70kb of weights and runs inference on mount — that competes with the
 * above-the-fold paint for no benefit. Measured cost of mounting it eagerly on
 * the SynMedix case study was ~0.9s of LCP.
 *
 * `minHeight` reserves the space up front, so mounting never causes a shift.
 */
export default function LazyMount({
  children,
  rootMargin = '400px',
  minHeight = 420,
  placeholder,
}: LazyMountProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // No IntersectionObserver (very old browsers): mount immediately rather
    // than never showing the content.
    if (typeof IntersectionObserver === 'undefined') {
      setMounted(true)
      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setMounted(true)
        io.disconnect()
      },
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin])

  return (
    <div ref={ref} style={{ minHeight: mounted ? undefined : minHeight }}>
      {mounted ? children : placeholder}
    </div>
  )
}
