'use client'

import { useEffect, useRef } from 'react'
import { useScrollProgress } from '@/hooks/useScrollProgress'

/**
 * Spring-walk canvas — each particle has a Halton-distributed home position
 * and wanders via random Brownian motion with a gentle spring force pulling
 * it back. Because every particle's home is unique and spatially spread,
 * concentration is mathematically impossible regardless of field dynamics.
 */

const MAX_PARTICLES = 380
const MAX_TRAIL = 16

interface Particle {
  x: number; y: number; vx: number; vy: number
  ox: number; oy: number   // home position
  trail: Array<{ x: number; y: number }>
  hue: number; size: number
}

function halton(i: number, b: number): number {
  let f = 1, r = 0, n = i
  while (n > 0) { f /= b; r += f * (n % b); n = Math.floor(n / b) }
  return r
}

function build(w: number, h: number): Particle[] {
  return Array.from({ length: MAX_PARTICLES }, (_, i) => {
    const ox = (halton(i + 1, 2) * 0.90 + 0.05) * w
    const oy = (halton(i + 1, 3) * 0.90 + 0.05) * h
    return {
      x: ox + (Math.random() - 0.5) * 60,
      y: oy + (Math.random() - 0.5) * 60,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      ox, oy, trail: [],
      hue: 180 + (i % 160) - 80,
      size: 0.5 + (i % 6) * 0.18,
    }
  })
}

export default function FlowFieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(0)
  const particlesRef = useRef<Particle[]>([])
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
      particlesRef.current = build(canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const p = progressRef.current
      const w = canvas.width
      const h = canvas.height
      tickRef.current += 0.004
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light'

      ctx.clearRect(0, 0, w, h)

      const visCount = Math.max(120, Math.round(120 + p * (MAX_PARTICLES - 120)))
      const speedMult = 1.0 + p * 2.0
      const trailLen = Math.round(5 + p * (MAX_TRAIL - 5))
      // Spring constant — stronger spring at high scroll keeps particles near home
      const spring = 0.0035 + p * 0.002
      // Random noise magnitude
      const noise = 0.55 + p * 0.6

      ctx.save()
      if (isDark) ctx.globalCompositeOperation = 'lighter'

      particlesRef.current.slice(0, visCount).forEach(pt => {
        // Spring force toward home
        const fx = (pt.ox - pt.x) * spring
        const fy = (pt.oy - pt.y) * spring
        // Brownian noise
        const nx = (Math.random() - 0.5) * noise
        const ny = (Math.random() - 0.5) * noise

        pt.vx = (pt.vx + fx + nx) * 0.92
        pt.vy = (pt.vy + fy + ny) * 0.92

        // Speed cap
        const spd = Math.sqrt(pt.vx * pt.vx + pt.vy * pt.vy)
        const cap = 2.8 * speedMult
        if (spd > cap) { pt.vx *= cap / spd; pt.vy *= cap / spd }

        pt.x += pt.vx * speedMult
        pt.y += pt.vy * speedMult

        pt.trail.unshift({ x: pt.x, y: pt.y })
        if (pt.trail.length > trailLen) pt.trail.pop()
        if (pt.trail.length < 2) return

        const pL = isDark ? '62%' : '26%'
        const headA = isDark ? 0.60 : 0.16
        const t0 = pt.trail[0], tN = pt.trail[pt.trail.length - 1]
        const hasDist = Math.abs(t0.x - tN.x) + Math.abs(t0.y - tN.y) > 0.5

        ctx.lineWidth = pt.size * (isDark ? 1.1 : 0.65)
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        if (hasDist) {
          const g = ctx.createLinearGradient(t0.x, t0.y, tN.x, tN.y)
          g.addColorStop(0, `hsla(${pt.hue},85%,${pL},${headA})`)
          g.addColorStop(1, `hsla(${pt.hue},85%,${pL},0)`)
          ctx.strokeStyle = g
        } else {
          ctx.strokeStyle = `hsla(${pt.hue},85%,${pL},${headA})`
        }

        ctx.beginPath()
        pt.trail.forEach((pos, i) => {
          if (i === 0) ctx.moveTo(pos.x, pos.y)
          else ctx.lineTo(pos.x, pos.y)
        })
        ctx.stroke()

        // Head glow
        if (isDark) {
          const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pt.size * 7)
          g.addColorStop(0, `hsla(${pt.hue},100%,70%,0.40)`)
          g.addColorStop(1, `hsla(${pt.hue},100%,70%,0)`)
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, pt.size * 7, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, Math.max(0.4, pt.size * (isDark ? 1.3 : 0.8)), 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${pt.hue},88%,${isDark ? '75%' : '25%'},${isDark ? 0.85 : 0.25})`
        ctx.fill()
      })

      ctx.restore()
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
