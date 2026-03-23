'use client'

import { useEffect, useRef } from 'react'
import { useScrollProgress } from '@/hooks/useScrollProgress'

const MAX_PARTICLES = 300
const STAR_COUNT = 120

interface Particle {
  angle: number; speed: number; orbitA: number; orbitB: number
  phase: number; hemisphere: number; z: number; size: number; hue: number
}
interface Star { x: number; y: number; r: number; base: number; phase: number }

function buildParticles(): Particle[] {
  return Array.from({ length: MAX_PARTICLES }, (_, i) => ({
    angle: (i / MAX_PARTICLES) * Math.PI * 2,
    speed: 0.003 + (i % 9) * 0.0006,
    orbitA: 0.14 + (i % 6) * 0.04,
    orbitB: 0.08 + (i % 5) * 0.03,
    phase: (i * 1.618) % (Math.PI * 2),
    hemisphere: i % 2 === 0 ? -1 : 1,
    z: (i % 24) / 24,
    size: 1.0 + (i % 5) * 0.5,
    hue: 250 + (i % 80) - 40,
  }))
}

function buildStars(w: number, h: number): Star[] {
  return Array.from({ length: STAR_COUNT }, (_, i) => ({
    x: ((i * 0.618033 * 5003) % 1) * w,
    y: ((i * 0.618033 * 7919) % 1) * h,
    r: 0.3 + (i % 4) * 0.2,
    base: 0.1 + (i % 7) * 0.055,
    phase: (i * 2.618) % (Math.PI * 2),
  }))
}

const PARTICLES = buildParticles()

export default function BrainParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(0)
  const starsRef = useRef<Star[]>([])
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
      starsRef.current = buildStars(canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const p = progressRef.current
      const w = canvas.width
      const h = canvas.height
      tickRef.current += 0.006 + p * 0.007
      const t = tickRef.current
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light'

      ctx.clearRect(0, 0, w, h)

      // Stars
      starsRef.current.forEach(s => {
        const a = s.base * (0.5 + 0.5 * Math.sin(s.phase + t * 0.9))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = isDark ? `rgba(200,180,255,${a})` : `rgba(60,0,160,${a * 0.35})`
        ctx.fill()
      })

      // Nebula clouds
      if (isDark) {
        const clouds = [
          { cx: w * 0.5, cy: h * 0.44, r: w * 0.48, c: 'rgba(80,0,200,0.036)' },
          { cx: w * 0.3, cy: h * 0.56, r: w * 0.36, c: 'rgba(0,80,200,0.026)' },
          { cx: w * 0.7, cy: h * 0.37, r: w * 0.30, c: 'rgba(140,0,180,0.026)' },
        ]
        clouds.forEach(cl => {
          const g = ctx.createRadialGradient(cl.cx, cl.cy, 0, cl.cx, cl.cy, cl.r)
          g.addColorStop(0, cl.c)
          g.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = g
          ctx.fillRect(0, 0, w, h)
        })
      }

      const cx = w * 0.5
      const cy = h * 0.46
      const baseRX = Math.min(w, h) * 0.32
      const baseRY = Math.min(w, h) * 0.20
      // Base 60 particles at p=0, grow to MAX_PARTICLES with scroll
      const visCount = Math.max(60, Math.round(60 + p * (MAX_PARTICLES - 60)))
      const globalRot = t * 0.35

      // Central glow
      const gAlpha = isDark ? 0.24 : 0.12
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRX * 1.3)
      cg.addColorStop(0, isDark ? `rgba(140,60,255,${gAlpha})` : `rgba(80,0,180,${gAlpha})`)
      cg.addColorStop(1, isDark ? 'rgba(40,0,100,0)' : 'rgba(80,0,180,0)')
      ctx.fillStyle = cg
      ctx.beginPath()
      ctx.arc(cx, cy, baseRX * 1.3, 0, Math.PI * 2)
      ctx.fill()

      ctx.save()
      if (isDark) ctx.globalCompositeOperation = 'lighter'

      for (let i = 0; i < visCount; i++) {
        const pt = PARTICLES[i]
        const appear = Math.min(1, Math.max(0, 0.4 + (p * MAX_PARTICLES - i) * 0.003))
        const a = pt.angle + t * pt.speed * 55 + pt.phase
        const rx = baseRX * pt.orbitA * (0.7 + p * 0.3) * (1 + pt.z * 0.28)
        const ry = baseRY * pt.orbitB * (0.7 + p * 0.3)
        const hOff = pt.hemisphere * baseRX * 0.20
        const x = cx + hOff + Math.cos(a + globalRot) * rx
        const y = cy + Math.sin(a + globalRot) * ry
        const depth = 0.4 + pt.z * 0.6
        const r = pt.size * depth * appear

        // Denser synapse lines (every 4th)
        if (i > 0 && i % 4 === 0 && p > 0.08) {
          const prev = PARTICLES[i - 1]
          const pa = prev.angle + t * prev.speed * 55 + prev.phase
          const prx = baseRX * prev.orbitA * (0.7 + p * 0.3)
          const pry = baseRY * prev.orbitB * (0.7 + p * 0.3)
          const px2 = cx + prev.hemisphere * baseRX * 0.20 + Math.cos(pa + globalRot) * prx
          const py2 = cy + Math.sin(pa + globalRot) * pry
          if (Math.hypot(x - px2, y - py2) < 88) {
            ctx.strokeStyle = isDark ? `rgba(140,60,255,${0.20 * appear * p})` : `rgba(80,0,180,${0.38 * appear * p})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(px2, py2)
            ctx.stroke()
          }
        }

        if (r < 0.1) continue
        const pL = isDark ? '70%' : '25%'
        const coreL = isDark ? '88%' : '18%'
        const col = ctx.createRadialGradient(x, y, 0, x, y, r * 5)
        col.addColorStop(0, `hsla(${pt.hue},85%,${pL},${appear * depth})`)
        col.addColorStop(1, `hsla(${pt.hue},85%,${pL},0)`)
        ctx.fillStyle = col
        ctx.beginPath()
        ctx.arc(x, y, r * 5, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = `hsla(${pt.hue},100%,${coreL},${appear * depth * 0.95})`
        ctx.beginPath()
        ctx.arc(x, y, Math.max(0.3, r), 0, Math.PI * 2)
        ctx.fill()
      }

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
