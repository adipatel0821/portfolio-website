'use client'

import { useEffect, useRef } from 'react'
import { useScrollProgress } from '@/hooks/useScrollProgress'

/**
 * N-body orbital gravity simulation — 5 gravitational masses orbit a common
 * barycentre in non-repeating paths. ~280 particles are continuously pulled
 * by all 5 masses simultaneously, producing complex, unpredictable orbital
 * patterns: spiral arms, slingshot trajectories, chaotic transfers.
 *
 * Inspired by the gravitational wave / wormhole visuals from Interstellar.
 */

const G = 0.38          // gravitational constant (tuned for visual interest)
const MAX_SPEED = 7.5   // px/frame speed cap
const MIN_DIST = 28     // px minimum distance (prevents infinite force)
const NUM_WELLS = 5
const NUM_PARTICLES = 280
const MAX_TRAIL = 22

interface Well { cx: number; cy: number; r: number; speed: number; angle: number; mass: number; hue: number }
interface GravParticle { x: number; y: number; vx: number; vy: number; trail: Array<{ x: number; y: number }>; hue: number; size: number }

function buildWells(w: number, h: number): Well[] {
  const cx = w * 0.5, cy = h * 0.5
  return [
    { cx, cy, r: Math.min(w, h) * 0.26, speed:  0.007, angle: 0,              mass: 300, hue: 195 },
    { cx, cy, r: Math.min(w, h) * 0.17, speed: -0.011, angle: Math.PI * 0.6,  mass: 220, hue: 280 },
    { cx, cy, r: Math.min(w, h) * 0.35, speed:  0.005, angle: Math.PI * 1.25, mass: 340, hue: 38  },
    { cx, cy, r: Math.min(w, h) * 0.11, speed:  0.019, angle: Math.PI * 0.35, mass: 160, hue: 160 },
    { cx, cy, r: Math.min(w, h) * 0.29, speed: -0.008, angle: Math.PI * 1.8,  mass: 260, hue: 340 },
  ]
}

function spawnNear(wells: Well[], w: number, h: number, idx: number): GravParticle {
  const wl = wells[idx % wells.length]
  const wx = wl.cx + Math.cos(wl.angle) * wl.r
  const wy = wl.cy + Math.sin(wl.angle) * wl.r
  const a = Math.random() * Math.PI * 2
  const r = 30 + Math.random() * 90
  return {
    x: wx + Math.cos(a) * r, y: wy + Math.sin(a) * r,
    vx: (Math.random() - 0.5) * 2.5, vy: (Math.random() - 0.5) * 2.5,
    trail: [],
    hue: wl.hue + (Math.random() - 0.5) * 40,
    size: 0.55 + Math.random() * 0.75,
  }
}

export default function AttractorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(0)
  const wellsRef = useRef<Well[]>([])
  const particlesRef = useRef<GravParticle[]>([])
  const rafRef = useRef<number>()
  const raw = useScrollProgress()
  progressRef.current = raw

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      wellsRef.current = buildWells(canvas.width, canvas.height)
      particlesRef.current = Array.from({ length: NUM_PARTICLES }, (_, i) =>
        spawnNear(wellsRef.current, canvas.width, canvas.height, i)
      )
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const p = progressRef.current
      const w = canvas.width
      const h = canvas.height
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light'

      ctx.clearRect(0, 0, w, h)

      // Advance well orbital angles
      const speedBoost = 1 + p * 0.6
      wellsRef.current.forEach(wl => { wl.angle += wl.speed * speedBoost })

      const wells = wellsRef.current
      const trailLen = Math.round(8 + p * (MAX_TRAIL - 8))
      const gMult = 1 + p * 0.8

      ctx.save()
      if (isDark) ctx.globalCompositeOperation = 'lighter'

      // Draw well position glows
      wells.forEach(wl => {
        const wx = wl.cx + Math.cos(wl.angle) * wl.r
        const wy = wl.cy + Math.sin(wl.angle) * wl.r
        if (isDark) {
          const g = ctx.createRadialGradient(wx, wy, 0, wx, wy, 40)
          g.addColorStop(0, `hsla(${wl.hue},90%,70%,0.22)`)
          g.addColorStop(1, `hsla(${wl.hue},90%,70%,0)`)
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(wx, wy, 40, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.beginPath()
        ctx.arc(wx, wy, isDark ? 2.5 : 3.5, 0, Math.PI * 2)
        ctx.fillStyle = isDark ? `hsla(${wl.hue},100%,85%,0.9)` : `hsla(${wl.hue},80%,25%,0.7)`
        ctx.fill()
      })

      // Update and draw particles
      particlesRef.current.forEach((pt, pi) => {
        let fx = 0, fy = 0
        let nearestHue = pt.hue, minDist = Infinity

        wells.forEach(wl => {
          const wx = wl.cx + Math.cos(wl.angle) * wl.r
          const wy = wl.cy + Math.sin(wl.angle) * wl.r
          const dx = wx - pt.x, dy = wy - pt.y
          const dist = Math.max(MIN_DIST, Math.sqrt(dx * dx + dy * dy))
          const f = (G * gMult * wl.mass) / (dist * dist)
          fx += (dx / dist) * f
          fy += (dy / dist) * f
          if (dist < minDist) { minDist = dist; nearestHue = wl.hue }
        })

        pt.vx = (pt.vx + fx) * 0.988
        pt.vy = (pt.vy + fy) * 0.988
        pt.hue += (nearestHue - pt.hue) * 0.04

        const spd = Math.sqrt(pt.vx * pt.vx + pt.vy * pt.vy)
        if (spd > MAX_SPEED) { pt.vx *= MAX_SPEED / spd; pt.vy *= MAX_SPEED / spd }

        pt.x += pt.vx
        pt.y += pt.vy

        // Respawn if escaped
        if (pt.x < -80 || pt.x > w + 80 || pt.y < -80 || pt.y > h + 80) {
          const np = spawnNear(wells, w, h, pi)
          pt.x = np.x; pt.y = np.y; pt.vx = np.vx; pt.vy = np.vy
          pt.trail = []; pt.hue = np.hue
          return
        }

        pt.trail.unshift({ x: pt.x, y: pt.y })
        if (pt.trail.length > trailLen) pt.trail.pop()
        if (pt.trail.length < 2) return

        const pL = isDark ? '62%' : '22%'
        const headA = isDark ? 0.65 : 0.22
        const t0 = pt.trail[0], tN = pt.trail[pt.trail.length - 1]
        const hasDist = Math.abs(t0.x - tN.x) + Math.abs(t0.y - tN.y) > 0.5

        ctx.lineWidth = pt.size * (isDark ? 1.0 : 0.6)
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        if (hasDist) {
          const g = ctx.createLinearGradient(t0.x, t0.y, tN.x, tN.y)
          g.addColorStop(0, `hsla(${pt.hue},90%,${pL},${headA})`)
          g.addColorStop(1, `hsla(${pt.hue},90%,${pL},0)`)
          ctx.strokeStyle = g
        } else {
          ctx.strokeStyle = `hsla(${pt.hue},90%,${pL},${headA})`
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
          g.addColorStop(0, `hsla(${pt.hue},100%,72%,0.45)`)
          g.addColorStop(1, `hsla(${pt.hue},100%,72%,0)`)
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, pt.size * 7, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, Math.max(0.4, pt.size * (isDark ? 1.4 : 0.8)), 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${pt.hue},95%,${isDark ? '78%' : '18%'},${isDark ? 0.9 : 0.45})`
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
