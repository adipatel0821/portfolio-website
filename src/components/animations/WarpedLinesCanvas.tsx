'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { useScrollProgress } from '@/hooks/useScrollProgress'

/**
 * WarpedLinesCanvas — a set of taut horizontal threads that arc and bulge
 * around the cursor like elastic bands stretched across a frame. Moving the
 * cursor "pushes" the threads aside; they spring back when cursor moves away.
 *
 * Each thread is drawn as a smooth Catmull-Rom spline through spring-physics
 * control points. Multicolour palette creates a spectral ribbon effect.
 */

const NUM_THREADS  = 26    // lines across height
const CTRL_PTS     = 48    // control points per line (resolution of curve)
const REPEL_R      = 210   // cursor influence radius (px)
const REPEL_F      = 17    // repulsion strength
const SPRING       = 0.060
const DAMPING      = 0.78

// Each thread gets a hue — spectrum from cyan → indigo → violet → amber
const THREAD_HUES  = [
  182, 195, 210, 225, 238, 252, 265, 278,
  292, 308, 325, 340, 355, 15,  32,  48,
  62,  160, 170, 178, 185, 192, 198, 205, 215, 230,
]

interface CtrlPoint {
  gx: number; gy: number
  x:  number; y:  number
  vx: number; vy: number
}

export default function WarpedLinesCanvas() {
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
    let threads: CtrlPoint[][] = []
    let W = 0, H = 0

    function build() {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight

      const margin  = H * 0.04
      const spacing = (H - margin * 2) / (NUM_THREADS - 1)

      threads = []
      for (let ti = 0; ti < NUM_THREADS; ti++) {
        const gy  = margin + ti * spacing
        const pts: CtrlPoint[] = []
        for (let pi = 0; pi < CTRL_PTS; pi++) {
          const gx = (pi / (CTRL_PTS - 1)) * W
          pts.push({ gx, gy, x: gx, y: gy, vx: 0, vy: 0 })
        }
        threads.push(pts)
      }
    }

    /**
     * Catmull-Rom spline through an array of control points.
     * Produces a single smooth path — one ctx.stroke() at the end.
     */
    function spline(pts: CtrlPoint[]) {
      if (pts.length < 2) return
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(i - 1, 0)]
        const p1 = pts[i]
        const p2 = pts[i + 1]
        const p3 = pts[Math.min(i + 2, pts.length - 1)]
        // Catmull-Rom → cubic Bezier control points
        const cp1x = p1.x + (p2.x - p0.x) / 6
        const cp1y = p1.y + (p2.y - p0.y) / 6
        const cp2x = p2.x - (p3.x - p1.x) / 6
        const cp2y = p2.y - (p3.y - p1.y) / 6
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y)
      }
      ctx.stroke()
    }

    function frame() {
      const dark = darkRef.current
      const prog = pRef.current
      const { x: mx, y: my } = mouseRef.current

      ctx.clearRect(0, 0, W, H)

      const repR = REPEL_R * (1 + prog * 0.22)
      const repF = REPEL_F * (1 + prog * 0.18)

      for (let ti = 0; ti < threads.length; ti++) {
        const thread = threads[ti]
        let maxDisp  = 0

        // ── Physics ──────────────────────────────────────────────────────
        for (const pt of thread) {
          const dx = pt.x - mx, dy = pt.y - my
          const d  = Math.sqrt(dx * dx + dy * dy)
          if (d < repR && d > 0) {
            const f = Math.pow((repR - d) / repR, 1.6) * repF
            // Apply full 2D repulsion — thread control points can move in both axes
            pt.vx += (dx / d) * f
            pt.vy += (dy / d) * f
          }
          pt.vx += (pt.gx - pt.x) * SPRING
          pt.vy += (pt.gy - pt.y) * SPRING
          pt.vx *= DAMPING; pt.vy *= DAMPING
          pt.x  += pt.vx;   pt.y  += pt.vy

          const disp = Math.hypot(pt.x - pt.gx, pt.y - pt.gy)
          if (disp > maxDisp) maxDisp = disp
        }

        // ── Draw thread ───────────────────────────────────────────────────
        const hue  = THREAD_HUES[ti % THREAD_HUES.length]
        const t    = Math.min(maxDisp / 45, 1)
        const base = dark ? 0.09 : 0.065
        const a    = base + t * (dark ? 0.42 : 0.22)

        ctx.lineWidth = 0.75 + t * 1.0

        // Bloom pass (dark mode): wider, lower-alpha line for glow
        if (dark && t > 0.08) {
          ctx.strokeStyle = `hsla(${hue},85%,65%,${(t * 0.22).toFixed(3)})`
          ctx.lineWidth   = (0.75 + t * 1.0) * 3.5
          spline(thread)
          ctx.lineWidth = 0.75 + t * 1.0
        }

        ctx.strokeStyle = dark
          ? `hsla(${hue},82%,68%,${Math.min(a, 0.65).toFixed(3)})`
          : `hsla(${hue},62%,40%,${Math.min(a, 0.35).toFixed(3)})`
        spline(thread)
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
