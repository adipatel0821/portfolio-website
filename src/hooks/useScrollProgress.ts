'use client'

import { useState, useEffect } from 'react'

export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      setProgress(Math.min(1, window.scrollY / max))
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  return progress
}
