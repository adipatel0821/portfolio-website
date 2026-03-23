'use client'

import { useEffect, useRef } from 'react'
import { useScrollProgress } from '@/hooks/useScrollProgress'

const A = 1.89
const DT = 0.0055
const NUM_P = 150
const MAX_TRAIL = 40

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
  let { x, y, z } = { x: 0.1, y: 0.1, z: 0.1 }
  for (let i = 0; i < 8000; i++) { ({ x, y, z } = stepH(x, y, z)) }
  const out: Particle[] = []
  for (let i = 0; i < NUM_P; i++) {
    for (let j = 0; j < 600; j++) { ({ x, y, z } = stepH(x, y, z)) }
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

    // Run on client only — ~20ms, acceptable
    particlesRef.current = buildParticles()

    const draw = () => {
      const p = progressRef.current
      const w = canvas.width
      const h = canvas.height
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light'

      rotYRef.current += 0.0022 + p * 0.003

      // clearRect every frame — no fill accumulation, page content stays visible
      ctx.clearRect(0, 0, w, h)

      const cx = w * 0.5
      const cy = h * 0.5
      const scale = Math.min(w, h) * 0.036
      const trailLen = Math.round(8 + p * (MAX_TRAIL - 8))

      const rotY = rotYRef.current
      const tiltX = 0.38
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY)
      const cosX = Math.cos(tiltX), sinX = Math.sin(tiltX)
      const fov = 700

      const proj = (tp: P3) => {
        const rx = tp.x * cosY + tp.z * sinY
        const rz0 = -tp.x * sinY + tp.z * cosY
        const ry = tp.y * cosX - rz0 * sinX
        const rz = tp.y * sinX + rz0 * cosX
        const depth = fov / (fov + rz * scale * 0.5 + fov * 0.25)
        return { sx: cx + rx * scale * depth, sy: cy + ry * scale * depth, depth }
      }

      ctx.save()
      if (isDark) ctx.globalCompositeOperation = 'lighter'

      particlesRef.current.forEach(pt => {
        const n = stepH(pt.x, pt.y, pt.z)
        pt.x = n.x; pt.y = n.y; pt.z = n.z

        pt.trail.unshift({ x: pt.x, y: pt.y, z: pt.z })
        if (pt.trail.length > trailLen) pt.trail.pop()
        if (pt.trail.length < 2) return

        const head = proj(pt.trail[0])
        const tail = proj(pt.trail[pt.trail.length - 1])
        const hL = isDark ? '62%' : '22%'
        const headA = isDark ? 0.68 : 0.28
        const hasDist = Math.abs(head.sx - tail.sx) + Math.abs(head.sy - tail.sy) > 0.5

        ctx.lineWidth = head.depth * (isDark ? 1.1 : 0.65)
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
          g.addColorStop(0, `hsla(${pt.hue},100%,75%,0.48)`)
          g.addColorStop(1, `hsla(${pt.hue},100%,75%,0)`)
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(head.sx, head.sy, 6 * head.depth, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.beginPath()
        ctx.arc(head.sx, head.sy, Math.max(0.4, 1.5 * head.depth), 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${pt.hue},100%,${isDark ? '80%' : '18%'},${isDark ? 0.9 : 0.5})`
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
