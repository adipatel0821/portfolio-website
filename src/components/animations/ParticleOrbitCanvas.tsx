'use client'

import { useEffect, useRef } from 'react'
import { useScrollProgress } from '@/hooks/useScrollProgress'

const MAX_RINGS = 4
const MAX_PER_RING = 18

export default function ParticleOrbitCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(0)
  const rafRef = useRef<number>()
  const tickRef = useRef(0)
  const raw = useScrollProgress()
  progressRef.current = raw

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const RING_COLORS = [
      { h: 38,  s: 95, l: 62 }, // amber
      { h: 200, s: 90, l: 60 }, // cyan
      { h: 280, s: 85, l: 65 }, // purple
      { h: 160, s: 80, l: 55 }, // emerald
    ]

    const draw = () => {
      const p = progressRef.current
      const w = canvas.width
      const h = canvas.height
      tickRef.current += 0.008

      ctx.clearRect(0, 0, w, h)

      const isDark = document.documentElement.getAttribute('data-theme') !== 'light'

      const cx = w * 0.5
      const cy = h * 0.5
      const baseR = Math.min(w, h) * 0.08

      // Central nucleus
      const nucR = baseR * (0.15 + p * 0.25)
      const nucCol = isDark ? '251,191,36' : '160,80,0'
      const nucG = ctx.createRadialGradient(cx, cy, 0, cx, cy, nucR * 5)
      nucG.addColorStop(0, `rgba(${nucCol},${0.85 * Math.min(1, p * 5)})`)
      nucG.addColorStop(0.3, `rgba(${nucCol},${0.3 * Math.min(1, p * 5)})`)
      nucG.addColorStop(1, `rgba(${nucCol},0)`)
      ctx.fillStyle = nucG
      ctx.beginPath()
      ctx.arc(cx, cy, nucR * 5, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = isDark ? `rgba(255,255,200,${Math.min(1, p * 8)})` : `rgba(160,80,0,${Math.min(1, p * 8)})`
      ctx.beginPath()
      ctx.arc(cx, cy, Math.max(1, nucR), 0, Math.PI * 2)
      ctx.fill()

      // Rings
      const ringCount = Math.min(MAX_RINGS, Math.round(p * MAX_RINGS * 1.1))

      for (let ri = 0; ri < ringCount; ri++) {
        const ringProgress = Math.min(1, Math.max(0, (p * MAX_RINGS - ri) * 0.9))
        if (ringProgress <= 0) continue

        const col = RING_COLORS[ri]
        const orbitR = baseR * (1.8 + ri * 1.5) * (0.4 + ringProgress * 0.6)
        const tiltX = Math.sin(tickRef.current * 0.3 + ri * 1.1) * 0.25
        const tiltY = Math.cos(tickRef.current * 0.25 + ri * 0.9) * 0.15
        const rotSpeed = (0.4 + ri * 0.2) * (1 + p * 0.5)

        // Draw orbit ring (ellipse for 3D feel)
        const rl = isDark ? col.l : Math.max(15, col.l - 45)
        ctx.strokeStyle = `hsla(${col.h},${col.s}%,${rl}%,${(isDark ? 0.12 : 0.25) * ringProgress})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.ellipse(cx, cy, orbitR, orbitR * (0.25 + ri * 0.05), tiltX, 0, Math.PI * 2)
        ctx.stroke()

        // Particles on this ring
        const particleCount = Math.round(ringProgress * MAX_PER_RING)
        for (let pi = 0; pi < particleCount; pi++) {
          const angle = (pi / MAX_PER_RING) * Math.PI * 2 + tickRef.current * rotSpeed + ri * 0.7
          const ex = cx + Math.cos(angle) * orbitR
          const ey = cy + Math.sin(angle) * (orbitR * (0.28 + ri * 0.04)) + Math.sin(tiltY + angle) * 10

          const depth = (Math.sin(angle) + 1) * 0.5
          const pSize = (1.5 + ri * 0.8) * (0.4 + depth * 0.6) * ringProgress

          const pl2 = isDark ? col.l : Math.max(15, col.l - 45)
          const pg = ctx.createRadialGradient(ex, ey, 0, ex, ey, pSize * 5)
          pg.addColorStop(0, `hsla(${col.h},${col.s}%,${pl2}%,${0.7 * ringProgress * depth})`)
          pg.addColorStop(1, `hsla(${col.h},${col.s}%,${pl2}%,0)`)
          ctx.fillStyle = pg
          ctx.beginPath()
          ctx.arc(ex, ey, pSize * 5, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = isDark ? `hsla(${col.h},100%,90%,${ringProgress * depth})` : `hsla(${col.h},100%,15%,${ringProgress * depth})`
          ctx.beginPath()
          ctx.arc(ex, ey, Math.max(0.5, pSize), 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Connection trails between nuclei at high progress
      if (p > 0.7) {
        const trailAlpha = (p - 0.7) * 0.5
        for (let ri = 0; ri < ringCount - 1; ri++) {
          const c1 = RING_COLORS[ri]
          const r1 = baseR * (1.8 + ri * 1.5)
          const r2 = baseR * (1.8 + (ri + 1) * 1.5)
          const a1 = tickRef.current * (0.4 + ri * 0.2)
          const a2 = tickRef.current * (0.4 + (ri + 1) * 0.2) + 1.1
          const x1 = cx + Math.cos(a1) * r1
          const y1 = cy + Math.sin(a1) * (r1 * 0.28)
          const x2 = cx + Math.cos(a2) * r2
          const y2 = cy + Math.sin(a2) * (r2 * 0.28)
          ctx.strokeStyle = isDark ? `hsla(${c1.h},80%,60%,${trailAlpha})` : `hsla(${c1.h},80%,20%,${trailAlpha})`
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.stroke()
        }
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      window.removeEventListener('resize', resize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
}
