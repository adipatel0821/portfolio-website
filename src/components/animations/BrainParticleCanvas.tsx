'use client'

import { useEffect, useRef } from 'react'
import { useScrollProgress } from '@/hooks/useScrollProgress'

const MAX_PARTICLES = 220

interface Particle {
  angle: number
  speed: number
  orbitA: number // semi-major
  orbitB: number // semi-minor
  phase: number
  hemisphere: number // -1 left, 1 right
  z: number
  size: number
  hue: number
}

function buildParticles(): Particle[] {
  const parts: Particle[] = []
  for (let i = 0; i < MAX_PARTICLES; i++) {
    const t = i / MAX_PARTICLES
    parts.push({
      angle: t * Math.PI * 2,
      speed: 0.003 + (i % 7) * 0.0008,
      orbitA: 0.18 + (i % 5) * 0.04,
      orbitB: 0.1 + (i % 4) * 0.03,
      phase: (i * 1.618) % (Math.PI * 2),
      hemisphere: i % 2 === 0 ? -1 : 1,
      z: (i % 20) / 20,
      size: 1.2 + (i % 4) * 0.5,
      hue: 270 + (i % 60) - 30,
    })
  }
  return parts
}

const PARTICLES = buildParticles()

export default function BrainParticleCanvas() {
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

    const draw = () => {
      const p = progressRef.current
      const w = canvas.width
      const h = canvas.height
      tickRef.current += 0.006 + p * 0.01

      ctx.clearRect(0, 0, w, h)

      const isDark = document.documentElement.getAttribute('data-theme') !== 'light'

      const cx = w * 0.5
      const cy = h * 0.46
      const baseRX = Math.min(w, h) * 0.28
      const baseRY = Math.min(w, h) * 0.18

      const visCount = Math.round(8 + p * (MAX_PARTICLES - 8))
      const globalRot = tickRef.current * 0.4

      // Central glow
      if (p > 0.05) {
        const glowAlpha = Math.min(0.18, p * 0.18)
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRX * 1.5)
        g.addColorStop(0, isDark ? `rgba(168,85,247,${glowAlpha})` : `rgba(100,0,180,${glowAlpha * 2})`)
        g.addColorStop(1, isDark ? 'rgba(168,85,247,0)' : 'rgba(100,0,180,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(cx, cy, baseRX * 1.5, 0, Math.PI * 2)
        ctx.fill()
      }

      for (let i = 0; i < visCount; i++) {
        const pt = PARTICLES[i]
        const appear = Math.min(1, Math.max(0, (p * MAX_PARTICLES - i) * 0.4))

        // Orbit angle advances with time
        const a = pt.angle + tickRef.current * pt.speed * 60 + pt.phase
        const rx = baseRX * pt.orbitA * (0.6 + p * 0.4) * (1 + pt.z * 0.3)
        const ry = baseRY * pt.orbitB * (0.6 + p * 0.4)

        // Two hemispheres offset left/right
        const hemisphereOffset = pt.hemisphere * baseRX * 0.22
        const x = cx + hemisphereOffset + Math.cos(a + globalRot) * rx
        const y = cy + Math.sin(a + globalRot) * ry

        // Depth perspective
        const depth = 0.5 + pt.z * 0.5
        const r = pt.size * depth * appear

        // Synapse lines between close particles (every 10th)
        if (i > 0 && i % 6 === 0 && p > 0.3) {
          const prev = PARTICLES[i - 1]
          const pa = prev.angle + tickRef.current * prev.speed * 60 + prev.phase
          const prx = baseRX * prev.orbitA * (0.6 + p * 0.4)
          const pry = baseRY * prev.orbitB * (0.6 + p * 0.4)
          const pOffset = prev.hemisphere * baseRX * 0.22
          const px2 = cx + pOffset + Math.cos(pa + globalRot) * prx
          const py2 = cy + Math.sin(pa + globalRot) * pry
          const dist = Math.hypot(x - px2, y - py2)
          if (dist < 80) {
            ctx.strokeStyle = isDark ? `rgba(168,85,247,${0.12 * appear * p})` : `rgba(100,0,180,${0.3 * appear * p})`
            ctx.lineWidth = 0.4
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(px2, py2)
            ctx.stroke()
          }
        }

        if (r < 0.1) continue
        const pL = isDark ? '72%' : '28%'
        const pLCore = isDark ? '85%' : '20%'
        const col = ctx.createRadialGradient(x, y, 0, x, y, r * 4)
        col.addColorStop(0, `hsla(${pt.hue},90%,${pL},${appear * depth})`)
        col.addColorStop(1, `hsla(${pt.hue},90%,${pL},0)`)
        ctx.fillStyle = col
        ctx.beginPath()
        ctx.arc(x, y, r * 4, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = `hsla(${pt.hue},100%,${pLCore},${appear * depth * 0.9})`
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
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
