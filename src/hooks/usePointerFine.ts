'use client'

import { useEffect, useState } from 'react'

/**
 * True only on devices with a precise pointer (mouse/trackpad).
 *
 * Gates the custom cursor and magnetic hover: both are meaningless on touch and
 * actively harmful there, magnetic offsets make tap targets miss.
 *
 * Starts false so the server render and the first client render agree; the real
 * value lands in an effect. Anything gated on this must degrade to plain
 * behaviour, never to nothing.
 */
export function usePointerFine(): boolean {
  const [fine, setFine] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine) and (hover: hover)')
    const update = () => setFine(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return fine
}
