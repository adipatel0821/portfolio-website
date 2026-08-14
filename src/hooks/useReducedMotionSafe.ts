'use client'

import { useEffect, useState } from 'react'

/**
 * Hydration-safe `prefers-reduced-motion`.
 *
 * Framer's `useReducedMotion` reads matchMedia synchronously, so on a machine
 * with the setting enabled it returns `true` on the very first client render
 * while the server rendered with `false`. Every component that branches on it —
 * choosing a plain element over a motion one, or omitting a style prop —
 * therefore produces a different tree on the client and React throws a
 * hydration error (#418) on load.
 *
 * This returns `false` for the first render, matching the server, and flips
 * after mount. The cost is one frame in the motion-enabled state for users who
 * asked for less of it; the alternative is a hydration failure on every page
 * load, which discards the server HTML and re-renders the whole tree.
 */
export function useReducedMotionSafe(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return reduced
}
