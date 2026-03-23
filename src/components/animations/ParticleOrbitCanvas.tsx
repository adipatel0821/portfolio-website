'use client'

import { useEffect, useRef } from 'react'
import { useScrollProgress } from '@/hooks/useScrollProgress'

const MAX_RINGS = 6
const MAX_PER_RING = 20
const TRAIL_LEN = 8
const STAR_COUNT = 140

interface TrailPoint { x: number; y: number }
interface Star { x: number; y: number; r: number; base: number; phase: number }

export default function ParticleOrbitCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(0)
  const rafRef = useRef<number>()
  const tickRef = useRef(0)
  const starsRef = useRef<Star[]>([])
  const trailsRef = useRef<TrailPoint[][][]>([])
  const raw = useScrollProgress()
  progressRef.current = raw

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      starsRef.current = Array.from({ length: STAR_COUNT }, (_, i) => ({
        x: ((i * 0.618033 * 9001) % 1) * canvas.width,
        y: ((i * 0.618033 * 6271) % 1) * canvas.height,
        r: 0.3 + (i % 5) * 0.22,
        base: 0.10 + (i % 8) * 0.05,
        phase: (i * 1.618) % (Math.PI * 2),
      }))
      trailsRef.current = Array.from({ length: MAX_RINGS }, () =>
        Array.from({ length: MAX_PER_RING }, () => [])
      )
    }
    resize()
    window.addEventListener('resize', resize)

    const RING_COLORS = [
      { h: 38,  s: 95, l: 62 }, // amber
      { h: 200, s: 90, l: 60 }, // cyan
      { h: 280, s: 85, l: 65 }, // purple
      { h: 160, s: 80, l: 55 }, // emerald
      { h: 340, s: 90, l: 65 }, // rose
      { h: 55,  s: 90, l: 58 }, // yellow
    ]

    const draw = () => {
      const p = progressRef.current
      const w = canvas.width
      const h = canvas.height
      tickRef.current += 0.009
      const t = tickRef.current
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light'

      ctx.clearRect(0, 0, w, h)

      // Stars
      starsRef.current.forEach(s => {
        const a = s.base * (0.5 + 0.5 * Math.sin(s.phase + t * 0.8))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = isDark ? `rgba(200,210,255,${a})` : `rgba(40,40,120,${a * 0.28})`
        ctx.fill()
      })

      // Space nebula
      if (isDark) {
        const nb = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.52)
        nb.addColorStop(0, `rgba(80,30,180,${0.045 + p * 0.055})`)
        nb.addColorStop(0.5, `rgba(20,5,60,${0.025 + p * 0.025})`)
        nb.addColorStop(1, 'rgba(0,0,10,0)')
        ctx.fillStyle = nb
        ctx.fillRect(0, 0, w, h)
      }

      const cx = w * 0.5
      const cy = h * 0.5
      const baseR = Math.min(w, h) * 0.08

      // Nucleus — always visible
      const nucSize = baseR * (0.22 + p * 0.28)
      const nucPulse = 0.8 + 0.2 * Math.sin(t * 3.2)
      const nucCol = isDark ? '251,191,36' : '160,80,0'

      ctx.save()
      if (isDark) ctx.globalCompositeOperation = 'lighter'
      const ng = ctx.createRadialGradient(cx, cy, 0, cx, cy, nucSize * 9)
      ng.addColorStop(0, `rgba(${nucCol},0.9)`)
      ng.addColorStop(0.25, `rgba(${nucCol},0.35)`)
      ng.addColorStop(1, `rgba(${nucCol},0)`)
      ctx.fillStyle = ng
      ctx.beginPath()
      ctx.arc(cx, cy, nucSize * 9, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = isDark
        ? `rgba(255,255,200,${Math.min(1, 0.3 + p * 0.7)})`
        : `rgba(160,80,0,${Math.min(1, 0.3 + p * 0.7)})`
      ctx.beginPath()
      ctx.arc(cx, cy, Math.max(2, nucSize * nucPulse), 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // Ring count: 1 at p=0, grow to MAX_RINGS with scroll
      const ringCount = Math.min(MAX_RINGS, Math.max(1, Math.round(1 + p * (MAX_RINGS - 1) * 1.1)))

      for (let ri = 0; ri < ringCount; ri++) {
        const ringProgress = ri === 0
          ? 1
          : Math.min(1, Math.max(0, (p * (MAX_RINGS - 1) - (ri - 1)) * 0.9))
        if (ringProgress <= 0) continue

        const col = RING_COLORS[ri]
        const orbitR = baseR * (1.7 + ri * 1.35) * (0.5 + ringProgress * 0.5)
        const tiltX = Math.sin(t * 0.28 + ri * 1.1) * 0.20
        const tiltY = Math.cos(t * 0.22 + ri * 0.9) * 0.10
        const rotSpeed = (0.45 + ri * 0.18) * (1 + p * 0.35)
        const rl = isDark ? col.l : Math.max(12, col.l - 45)

        // Orbit ellipse
        ctx.strokeStyle = `hsla(${col.h},${col.s}%,${rl}%,${(isDark ? 0.15 : 0.28) * ringProgress})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.ellipse(cx, cy, orbitR, orbitR * (0.22 + ri * 0.04), tiltX, 0, Math.PI * 2)
        ctx.stroke()

        const particleCount = Math.round(ringProgress * MAX_PER_RING)

        ctx.save()
        if (isDark) ctx.globalCompositeOperation = 'lighter'

        for (let pi = 0; pi < particleCount; pi++) {
          const angle = (pi / MAX_PER_RING) * Math.PI * 2 + t * rotSpeed + ri * 0.7
          const ex = cx + Math.cos(angle) * orbitR
          const ey = cy + Math.sin(angle) * (orbitR * (0.24 + ri * 0.04)) + Math.sin(tiltY + angle) * 8
          const depth = (Math.sin(angle) + 1) * 0.5
          const pSize = (1.5 + ri * 0.65) * (0.4 + depth * 0.6) * ringProgress

          // Comet trail
          if (trailsRef.current[ri] && trailsRef.current[ri][pi]) {
            const trail = trailsRef.current[ri][pi]
            trail.unshift({ x: ex, y: ey })
            if (trail.length > TRAIL_LEN) trail.pop()
            trail.forEach((pos, ti) => {
              const tf = 1 - ti / TRAIL_LEN
              const ta = tf * 0.45 * ringProgress * depth
              const tr = pSize * tf * 3.5
              const tg = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, tr)
              tg.addColorStop(0, `hsla(${col.h},${col.s}%,${rl}%,${ta})`)
              tg.addColorStop(1, `hsla(${col.h},${col.s}%,${rl}%,0)`)
              ctx.fillStyle = tg
              ctx.beginPath()
              ctx.arc(pos.x, pos.y, tr, 0, Math.PI * 2)
              ctx.fill()
            })
          }

          // Particle glow
          const pg = ctx.createRadialGradient(ex, ey, 0, ex, ey, pSize * 5)
          pg.addColorStop(0, `hsla(${col.h},${col.s}%,${rl}%,${0.85 * ringProgress * depth})`)
          pg.addColorStop(1, `hsla(${col.h},${col.s}%,${rl}%,0)`)
          ctx.fillStyle = pg
          ctx.beginPath()
          ctx.arc(ex, ey, pSize * 5, 0, Math.PI * 2)
          ctx.fill()

          // Core
          ctx.fillStyle = isDark
            ? `hsla(${col.h},100%,92%,${ringProgress * depth})`
            : `hsla(${col.h},100%,12%,${ringProgress * depth})`
          ctx.beginPath()
          ctx.arc(ex, ey, Math.max(0.5, pSize), 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }

      // Energy arcs between adjacent rings
      if (p > 0.45) {
        const arcAlpha = (p - 0.45) * 0.7
        ctx.save()
        if (isDark) ctx.globalCompositeOperation = 'lighter'
        ctx.setLineDash([5, 7])
        for (let ri = 0; ri < ringCount - 1; ri++) {
          const c1 = RING_COLORS[ri]
          const r1 = baseR * (1.7 + ri * 1.35)
          const r2 = baseR * (1.7 + (ri + 1) * 1.35)
          const a1 = t * (0.45 + ri * 0.18)
          const a2 = t * (0.45 + (ri + 1) * 0.18) + 1.0
          const x1 = cx + Math.cos(a1) * r1, y1 = cy + Math.sin(a1) * (r1 * 0.24)
          const x2 = cx + Math.cos(a2) * r2, y2 = cy + Math.sin(a2) * (r2 * 0.24)
          const rl = isDark ? c1.l : Math.max(12, c1.l - 45)
          ctx.strokeStyle = `hsla(${c1.h},80%,${rl}%,${arcAlpha})`
          ctx.lineWidth = 0.8
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.stroke()
        }
        ctx.setLineDash([])
        ctx.restore()
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
