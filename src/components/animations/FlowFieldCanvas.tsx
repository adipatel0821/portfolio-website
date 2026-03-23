'use client'

import { useEffect, useRef } from 'react'
import { useScrollProgress } from '@/hooks/useScrollProgress'

const MAX_PARTICLES = 420

interface Particle {
  x: number; y: number
  vx: number; vy: number
  trail: Array<{ x: number; y: number }>
  hue: number; speed: number; size: number
}

function spawn(w: number, h: number, i: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: 0, vy: 0,
    trail: [],
    hue: 185 + (i % 150) - 75,
    speed: 0.65 + (i % 10) * 0.15,
    size: 0.5 + (i % 5) * 0.18,
  }
}

// Curl-based flow field — guaranteed no fixed points (no convergence zones)
function flowAngle(x: number, y: number, t: number): number {
  const nx = Math.sin(x * 0.0035 + t * 0.70) * Math.cos(y * 0.0028 - t * 0.55)
  const ny = Math.cos(x * 0.0028 - t * 0.45) * Math.sin(y * 0.0035 + t * 0.65)
  return Math.atan2(ny, nx) + t * 0.018
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
      particlesRef.current = Array.from({ length: MAX_PARTICLES }, (_, i) =>
        spawn(canvas.width, canvas.height, i)
      )
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const p = progressRef.current
      const w = canvas.width
      const h = canvas.height
      tickRef.current += 0.005 + p * 0.005
      const t = tickRef.current
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light'

      // clearRect every frame — no accumulation, no bands
      ctx.clearRect(0, 0, w, h)

      const visCount = Math.max(140, Math.round(140 + p * (MAX_PARTICLES - 140)))
      const speedMult = 0.9 + p * 2.2
      // Trail length: short always (prevents any visible banding)
      const trailLen = Math.round(5 + p * 9)

      ctx.save()
      if (isDark) ctx.globalCompositeOperation = 'lighter'

      particlesRef.current.slice(0, visCount).forEach(pt => {
        const angle = flowAngle(pt.x, pt.y, t)
        // Velocity with slight inertia + tiny noise to prevent exact convergence
        const tx = Math.cos(angle) * pt.speed * speedMult
        const ty = Math.sin(angle) * pt.speed * speedMult
        pt.vx = pt.vx * 0.55 + tx * 0.45 + (Math.random() - 0.5) * 0.25
        pt.vy = pt.vy * 0.55 + ty * 0.45 + (Math.random() - 0.5) * 0.25
        pt.x += pt.vx
        pt.y += pt.vy

        // Edge wrap
        if (pt.x < -4) pt.x = w + 4
        if (pt.x > w + 4) pt.x = -4
        if (pt.y < -4) pt.y = h + 4
        if (pt.y > h + 4) pt.y = -4

        pt.trail.unshift({ x: pt.x, y: pt.y })
        if (pt.trail.length > trailLen) pt.trail.pop()
        if (pt.trail.length < 2) return

        const pL = isDark ? '60%' : '25%'
        // In light mode keep alpha very low so content stays readable
        const headA = isDark ? 0.55 : 0.13
        const t0 = pt.trail[0], tN = pt.trail[pt.trail.length - 1]
        const hasDist = Math.abs(t0.x - tN.x) + Math.abs(t0.y - tN.y) > 0.5

        if (hasDist) {
          const grad = ctx.createLinearGradient(t0.x, t0.y, tN.x, tN.y)
          grad.addColorStop(0, `hsla(${pt.hue},85%,${pL},${headA})`)
          grad.addColorStop(1, `hsla(${pt.hue},85%,${pL},0)`)
          ctx.strokeStyle = grad
        } else {
          ctx.strokeStyle = `hsla(${pt.hue},85%,${pL},${headA})`
        }
        ctx.lineWidth = pt.size * (isDark ? 1.0 : 0.6)
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        ctx.beginPath()
        pt.trail.forEach((pos, i) => {
          if (i === 0) ctx.moveTo(pos.x, pos.y)
          else ctx.lineTo(pos.x, pos.y)
        })
        ctx.stroke()

        // Head dot
        if (isDark) {
          const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pt.size * 6)
          g.addColorStop(0, `hsla(${pt.hue},100%,72%,0.45)`)
          g.addColorStop(1, `hsla(${pt.hue},100%,72%,0)`)
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, pt.size * 6, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, Math.max(0.4, pt.size * (isDark ? 1.4 : 0.8)), 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${pt.hue},88%,${isDark ? '75%' : '28%'},${isDark ? 0.85 : 0.22})`
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
