'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useReducedMotion, type MotionValue } from 'framer-motion'
import StaticFallback from './StaticFallback'

/**
 * Capability gate for the centerpiece. Decides which of three real
 * implementations to mount, then loads only that one.
 *
 *   webgl   full point cloud, 24k particles, GPU morph
 *   canvas  hand-projected 2D version, ~900 particles
 *   static  CSS only — reduced motion, or no JS
 *
 * Everything below the top tier is a working scene, not a hidden element: the
 * page reads the same on a four-year-old Android as on a desktop GPU.
 */

// three + r3f live entirely in this chunk. `ssr: false` because WebGL has no
// server equivalent, and the loading state is the static fallback so there is
// never an empty box.
const LatentEngineScene = dynamic(() => import('./LatentEngineScene'), {
  ssr: false,
  loading: () => <StaticFallback />,
})

const CanvasFallback = dynamic(() => import('./CanvasFallback'), {
  ssr: false,
  loading: () => <StaticFallback />,
})

type Tier = 'pending' | 'webgl' | 'canvas' | 'static'

/** Perf budget knobs, resolved once per session. */
interface Budget {
  particleCount: number
  pixelRatio: number
}

function detect(): { tier: Exclude<Tier, 'pending'>; budget: Budget } {
  const fallbackBudget: Budget = { particleCount: 9000, pixelRatio: 1.25 }

  // WebGL2 probe. The context is released immediately; holding it would
  // consume one of the browser's limited context slots.
  let hasWebGL2 = false
  try {
    const probe = document.createElement('canvas')
    const gl = probe.getContext('webgl2')
    hasWebGL2 = Boolean(gl)
    // Float textures are the whole mechanism — no point continuing without them.
    if (gl && !gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('OES_texture_float')) {
      // WebGL2 guarantees float *sampling*, so this is informational only.
    }
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    hasWebGL2 = false
  }

  if (!hasWebGL2) return { tier: 'canvas', budget: fallbackBudget }

  const nav = navigator as Navigator & { deviceMemory?: number }
  const memory = nav.deviceMemory ?? 4
  const cores = navigator.hardwareConcurrency ?? 4
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches
  const narrow = window.innerWidth < 768

  // Genuinely weak hardware drops to the 2D path rather than limping along in
  // WebGL at 20fps, which looks worse than the honest fallback.
  if (memory <= 2 || cores <= 2) return { tier: 'canvas', budget: fallbackBudget }

  // Mid-tier and mobile get the real scene at a reduced budget.
  if (coarsePointer || narrow || memory < 4 || cores <= 4) {
    return {
      tier: 'webgl',
      budget: { particleCount: 9000, pixelRatio: Math.min(window.devicePixelRatio || 1, 1.25) },
    }
  }

  return {
    tier: 'webgl',
    budget: { particleCount: 24000, pixelRatio: Math.min(window.devicePixelRatio || 1, 1.75) },
  }
}

interface Props {
  /** 0..4 chapter scrub, driven by the page's scroll progress. */
  chapter: MotionValue<number>
}

export default function CenterpieceStage({ chapter }: Props) {
  const prefersReduced = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)

  const [tier, setTier] = useState<Tier>('pending')
  const [budget, setBudget] = useState<Budget>({ particleCount: 24000, pixelRatio: 1.5 })
  const [active, setActive] = useState(false)

  // Resolve the tier after mount so the server render is always the static
  // fallback — no hydration mismatch, no layout shift when the real scene lands.
  useEffect(() => {
    if (prefersReduced) {
      setTier('static')
      return
    }
    const { tier: t, budget: b } = detect()
    setBudget(b)
    setTier(t)
  }, [prefersReduced])

  // Pause the render loop whenever the stage is off-screen or the tab is
  // hidden. The pinned section is only a fraction of a long page, so this is
  // the difference between a warm phone and a cool one.
  useEffect(() => {
    const el = containerRef.current
    if (!el || tier !== 'webgl') return

    let onScreen = false
    const sync = () => setActive(onScreen && !document.hidden)

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting
        sync()
      },
      { rootMargin: '120px' },
    )
    io.observe(el)

    document.addEventListener('visibilitychange', sync)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [tier])

  return (
    <div ref={containerRef} className="h-full w-full">
      {tier === 'webgl' && (
        <LatentEngineScene
          chapter={chapter}
          particleCount={budget.particleCount}
          pixelRatio={budget.pixelRatio}
          active={active}
        />
      )}
      {tier === 'canvas' && <CanvasFallback chapter={chapter} />}
      {(tier === 'static' || tier === 'pending') && <StaticFallback />}
    </div>
  )
}
