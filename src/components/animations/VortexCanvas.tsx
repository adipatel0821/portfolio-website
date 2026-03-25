'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { useScrollProgress } from '@/hooks/useScrollProgress'

/**
 * VortexCanvas — particles that drift lazily until your cursor arrives.
 * Within the cursor's influence zone they spiral inward and orbit, creating
 * a galaxy/vortex effect. Move your cursor across the screen and watch
 * spiral arms form and dissolve in real time.
 *
 * Physics: tangential force (orbit) + mild radial attraction + Brownian rest.
 * Trail history stored per-particle — no semi-transparent fill (no accumulation).
 */

const MAX_PARTICLES   = 220
const ATTRACT_RADIUS  = 240   // px — orbit zone
const ORBIT_FORCE     = 0.75  // tangential (creates spin)
const ATTRACT_FORCE   = 0.10  // radial pull toward cursor
const DRIFT_SPEED     = 0.30  // Brownian motion amplitude (when far)
const DAMPING         = 0.94  // higher than other canvases = floatier feel
const MAX_TRAIL       = 10

const HUES = [185, 220, 265, 300, 40, 155, 330]

interface Particle {
  x: number; y: number
  vx: number; vy: number
  r: number; hue: number
  trail: { x: number; y: number }[]
}

export default function VortexCanvas() {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const { isDark } = useTheme()
  const p          = useScrollProgress()
  const mouseRef   = useRef({ x: -9999, y: -9999 })
  const darkRef    = useRef(isDark)
  const pRef       = useRef(p)

  useEffect(() => { darkRef.current = isDark }, [isDark])
  useEffect(() => { pRef.current = p }, [p])

  useEffect(() => {
    const onMove  = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY } }
    const onLeave = () => { mouseRef.current = { x: -9999, y: -9999 } }
    window.addEventListener('mousemove',  onMove)
    window.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove',  onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!
    let raf = 0
    let pts: Particle[] = []
    let W = 0, H = 0

    function build() {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
      const n = Math.min(MAX_PARTICLES, Math.floor(W * H / 6800) + 90)
      pts = Array.from({ length: n }, (_, i) => ({
        x:    Math.random() * W,
        y:    Math.random() * H,
        vx:   (Math.random() - 0.5) * 1.5,
        vy:   (Math.random() - 0.5) * 1.5,
        r:    1.6 + Math.random() * 3.0,
        hue:  HUES[i % HUES.length] + (Math.random() - 0.5) * 28,
        trail: [],
      }))
    }

    function frame() {
      const dark  = darkRef.current
      const prog  = pRef.current
      const { x: mx, y: my } = mouseRef.current
      const hasMouse = mx > -999

      ctx.clearRect(0, 0, W, H)

      const orbitR = ATTRACT_RADIUS * (1 + prog * 0.3)

      for (const pt of pts) {
        const dx = pt.x - mx, dy = pt.y - my
        const d  = Math.sqrt(dx * dx + dy * dy)

        if (hasMouse && d < orbitR && d > 4) {
          const factor = (1 - d / orbitR)
          // Tangential force — perpendicular to radial vector → orbit
          const tx = -dy / d, ty = dx / d
          pt.vx += tx * ORBIT_FORCE   * factor
          pt.vy += ty * ORBIT_FORCE   * factor
          // Radial attraction toward cursor
          pt.vx -= (dx / d) * ATTRACT_FORCE * factor
          pt.vy -= (dy / d) * ATTRACT_FORCE * factor
        } else {
          // Gentle Brownian drift when away from cursor
          pt.vx += (Math.random() - 0.5) * DRIFT_SPEED
          pt.vy += (Math.random() - 0.5) * DRIFT_SPEED
        }

        pt.vx *= DAMPING; pt.vy *= DAMPING
        pt.x  += pt.vx;   pt.y  += pt.vy

        // Soft wrap-around
        if (pt.x < -30) { pt.x = W + 30; pt.trail = [] }
        if (pt.x > W+30) { pt.x = -30;   pt.trail = [] }
        if (pt.y < -30) { pt.y = H + 30; pt.trail = [] }
        if (pt.y > H+30) { pt.y = -30;   pt.trail = [] }

        // Store trail
        pt.trail.push({ x: pt.x, y: pt.y })
        if (pt.trail.length > MAX_TRAIL) pt.trail.shift()

        // ── Draw trail ───────────────────────────────────────────────────
        if (pt.trail.length > 1) {
          for (let i = 1; i < pt.trail.length; i++) {
            const t  = i / pt.trail.length
            const a  = t * (dark ? 0.35 : 0.18)
            const lw = t * pt.r * 0.9
            ctx.strokeStyle = dark
              ? `hsla(${pt.hue},90%,70%,${a.toFixed(3)})`
              : `hsla(${pt.hue},70%,38%,${a.toFixed(3)})`
            ctx.lineWidth = lw
            ctx.beginPath()
            ctx.moveTo(pt.trail[i - 1].x, pt.trail[i - 1].y)
            ctx.lineTo(pt.trail[i].x,     pt.trail[i].y)
            ctx.stroke()
          }
        }

        // ── Draw particle head ────────────────────────────────────────────
        const r = pt.r * (1 + prog * 0.3)
        if (dark) {
          ctx.save()
          ctx.globalCompositeOperation = 'lighter'
          const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r * 5)
          g.addColorStop(0, `hsla(${pt.hue},92%,75%,0.60)`)
          g.addColorStop(1, `hsla(${pt.hue},92%,50%,0)`)
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, r * 5, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
          ctx.fillStyle = `hsla(${pt.hue},90%,90%,0.75)`
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, r * 0.55, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillStyle = `hsla(${pt.hue},68%,40%,0.52)`
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      raf = requestAnimationFrame(frame)
    }

    const ro = new ResizeObserver(build)
    ro.observe(document.body)
    build()
    frame()
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  )
}
