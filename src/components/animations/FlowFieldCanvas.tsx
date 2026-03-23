'use client'

import { useEffect, useRef } from 'react'
import { useScrollProgress } from '@/hooks/useScrollProgress'

const MAX_PARTICLES = 520
const MAX_TRAIL = 22

interface Particle {
  x: number; y: number
  trail: Array<{ x: number; y: number }>
  hue: number; speed: number; size: number
}

function spawnParticle(w: number, h: number, i: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    trail: [],
    hue: 190 + (i % 140) - 70,   // cyan → purple → violet range
    speed: 0.7 + (i % 11) * 0.18,
    size: 0.55 + (i % 6) * 0.22,
  }
}

// Multi-octave trig noise → smooth organic flow angle
function flowAngle(x: number, y: number, t: number): number {
  return (
    Math.sin(x * 0.0038 + t * 0.75) * Math.cos(y * 0.0030 + t * 0.55) +
    Math.sin(x * 0.0072 - t * 0.48 + y * 0.0018) * 0.55 +
    Math.cos(x * 0.0021 + y * 0.0052 + t * 0.28) * 0.32
  ) * Math.PI * 2.2
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
        spawnParticle(canvas.width, canvas.height, i)
      )
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const p = progressRef.current
      const w = canvas.width
      const h = canvas.height
      tickRef.current += 0.0055 + p * 0.007
      const t = tickRef.current
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light'

      // Semi-transparent fill instead of clearRect — creates the glowing trail persistence
      ctx.fillStyle = isDark ? 'rgba(5,8,20,0.16)' : 'rgba(238,241,248,0.20)'
      ctx.fillRect(0, 0, w, h)

      // Particle count: start with 160, grow to MAX with scroll
      const visCount = Math.max(160, Math.round(160 + p * (MAX_PARTICLES - 160)))
      const speedMult = 1.0 + p * 2.8
      const trailLen = Math.round(7 + p * (MAX_TRAIL - 7))

      ctx.save()
      if (isDark) ctx.globalCompositeOperation = 'lighter'

      particlesRef.current.slice(0, visCount).forEach(pt => {
        const angle = flowAngle(pt.x, pt.y, t)
        pt.x += Math.cos(angle) * pt.speed * speedMult
        pt.y += Math.sin(angle) * pt.speed * speedMult

        // Wrap edges
        if (pt.x < -2)  pt.x = w + 2
        if (pt.x > w + 2) pt.x = -2
        if (pt.y < -2)  pt.y = h + 2
        if (pt.y > h + 2) pt.y = -2

        pt.trail.unshift({ x: pt.x, y: pt.y })
        if (pt.trail.length > trailLen) pt.trail.pop()
        if (pt.trail.length < 2) return

        // Trail as gradient stroke: opaque head → transparent tail
        const pL = isDark ? '62%' : '25%'
        const headA = isDark ? 0.75 : 0.38
        const tx0 = pt.trail[0].x, ty0 = pt.trail[0].y
        const txN = pt.trail[pt.trail.length - 1].x, tyN = pt.trail[pt.trail.length - 1].y

        // Avoid zero-length gradient (causes warnings)
        if (Math.abs(tx0 - txN) + Math.abs(ty0 - tyN) > 0.5) {
          const grad = ctx.createLinearGradient(tx0, ty0, txN, tyN)
          grad.addColorStop(0, `hsla(${pt.hue},90%,${pL},${headA})`)
          grad.addColorStop(1, `hsla(${pt.hue},90%,${pL},0)`)
          ctx.strokeStyle = grad
        } else {
          ctx.strokeStyle = `hsla(${pt.hue},90%,${pL},${headA})`
        }
        ctx.lineWidth = pt.size * (isDark ? 1.3 : 0.9)
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        ctx.beginPath()
        ctx.moveTo(pt.trail[0].x, pt.trail[0].y)
        for (let i = 1; i < pt.trail.length; i++) {
          ctx.lineTo(pt.trail[i].x, pt.trail[i].y)
        }
        ctx.stroke()

        // Head dot with glow halo (dark) or small solid dot (light)
        if (isDark) {
          const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pt.size * 7)
          g.addColorStop(0, `hsla(${pt.hue},100%,75%,0.55)`)
          g.addColorStop(1, `hsla(${pt.hue},100%,75%,0)`)
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, pt.size * 7, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, pt.size * (isDark ? 1.6 : 1.0), 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${pt.hue},90%,${isDark ? '78%' : '22%'},${isDark ? 0.9 : 0.55})`
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
