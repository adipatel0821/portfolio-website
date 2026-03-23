'use client'

import { useEffect, useRef } from 'react'
import { useScrollProgress } from '@/hooks/useScrollProgress'

/**
 * Halvorsen Strange Attractor — a 3D chaotic dynamical system
 *   dx/dt = -a·x − 4y − 4z − y²
 *   dy/dt = -a·y − 4z − 4x − z²
 *   dz/dt = -a·z − 4x − 4y − x²
 *   a = 1.89
 *
 * 160 particles follow the attractor at different phase offsets,
 * each leaving glowing comet trails. The whole structure rotates
 * slowly in 3D with perspective projection.
 */

const A = 1.89
const DT = 0.0055
const NUM_P = 160
const MAX_TRAIL = 45

interface P3 { x: number; y: number; z: number }
interface Particle { x: number; y: number; z: number; trail: P3[]; hue: number }

function stepH(x: number, y: number, z: number): P3 {
  return {
    x: x + (-A * x - 4 * y - 4 * z - y * y) * DT,
    y: y + (-A * y - 4 * z - 4 * x - z * z) * DT,
    z: z + (-A * z - 4 * x - 4 * y - x * x) * DT,
  }
}

function buildParticles(): Particle[] {
  // Settle onto the attractor
  let { x, y, z } = { x: 0.1, y: 0.1, z: 0.1 }
  for (let i = 0; i < 10000; i++) { ({ x, y, z } = stepH(x, y, z)) }

  // Space 160 particles evenly along the attractor path
  const out: Particle[] = []
  for (let i = 0; i < NUM_P; i++) {
    for (let j = 0; j < 600; j++) { ({ x, y, z } = stepH(x, y, z)) }
    // hue: full spectrum (0→300) mapped across particle index
    out.push({ x, y, z, trail: [], hue: (i / NUM_P) * 300 })
  }
  return out
}

export default function AttractorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(0)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>()
  const rotYRef = useRef(0)
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

    // Build once on mount (runs only on client)
    particlesRef.current = buildParticles()

    const draw = () => {
      const p = progressRef.current
      const w = canvas.width
      const h = canvas.height
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light'

      // Rotate speed grows with scroll
      rotYRef.current += 0.0025 + p * 0.003

      // Semi-transparent overlay instead of clearRect — creates trail glow persistence
      ctx.fillStyle = isDark ? 'rgba(4,6,18,0.14)' : 'rgba(235,238,246,0.18)'
      ctx.fillRect(0, 0, w, h)

      const cx = w * 0.5
      const cy = h * 0.5
      const scale = Math.min(w, h) * 0.037     // attractor ≈ ±10 units → ±37% of screen
      const trailLen = Math.round(10 + p * (MAX_TRAIL - 10))

      const rotY = rotYRef.current
      const tiltX = 0.38                        // fixed X tilt ~22°
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY)
      const cosX = Math.cos(tiltX), sinX = Math.sin(tiltX)
      const fov = 700

      ctx.save()
      if (isDark) ctx.globalCompositeOperation = 'lighter'

      particlesRef.current.forEach(pt => {
        // Advance particle one step
        const n = stepH(pt.x, pt.y, pt.z)
        pt.x = n.x; pt.y = n.y; pt.z = n.z

        pt.trail.unshift({ x: pt.x, y: pt.y, z: pt.z })
        if (pt.trail.length > trailLen) pt.trail.pop()
        if (pt.trail.length < 2) return

        // 3D → 2D projection helper
        const proj = (tp: P3) => {
          // Rotate around Y
          const rx = tp.x * cosY + tp.z * sinY
          const rz0 = -tp.x * sinY + tp.z * cosY
          // Rotate around X (tilt)
          const ry = tp.y * cosX - rz0 * sinX
          const rz = tp.y * sinX + rz0 * cosX
          // Perspective
          const depth = fov / (fov + rz * scale * 0.5 + fov * 0.25)
          return { sx: cx + rx * scale * depth, sy: cy + ry * scale * depth, depth }
        }

        const head = proj(pt.trail[0])
        const tail = proj(pt.trail[pt.trail.length - 1])

        // Trail line
        const hL = isDark ? '62%' : '22%'
        const headA = isDark ? 0.70 : 0.30
        const distX = head.sx - tail.sx, distY = head.sy - tail.sy
        const hasDist = Math.abs(distX) + Math.abs(distY) > 0.5

        ctx.lineWidth = head.depth * (isDark ? 1.1 : 0.7)
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        if (hasDist) {
          const grad = ctx.createLinearGradient(head.sx, head.sy, tail.sx, tail.sy)
          grad.addColorStop(0, `hsla(${pt.hue},88%,${hL},${headA})`)
          grad.addColorStop(1, `hsla(${pt.hue},88%,${hL},0)`)
          ctx.strokeStyle = grad
        } else {
          ctx.strokeStyle = `hsla(${pt.hue},88%,${hL},${headA})`
        }

        ctx.beginPath()
        pt.trail.forEach((tp, ti) => {
          const { sx, sy } = proj(tp)
          if (ti === 0) ctx.moveTo(sx, sy)
          else ctx.lineTo(sx, sy)
        })
        ctx.stroke()

        // Head glow + dot
        if (isDark) {
          const g = ctx.createRadialGradient(head.sx, head.sy, 0, head.sx, head.sy, 6 * head.depth)
          g.addColorStop(0, `hsla(${pt.hue},100%,75%,0.5)`)
          g.addColorStop(1, `hsla(${pt.hue},100%,75%,0)`)
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(head.sx, head.sy, 6 * head.depth, 0, Math.PI * 2)
          ctx.fill()
        }
        const dotR = Math.max(0.4, 1.6 * head.depth)
        ctx.beginPath()
        ctx.arc(head.sx, head.sy, dotR, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${pt.hue},100%,${isDark ? '80%' : '18%'},${isDark ? 0.9 : 0.55})`
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
