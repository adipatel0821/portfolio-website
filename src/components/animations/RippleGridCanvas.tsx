'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { useScrollProgress } from '@/hooks/useScrollProgress'

/**
 * RippleGridCanvas — a taut mesh of grid points that deform around the cursor.
 * Moving the cursor creates a smooth "dent" in the fabric, like pushing a finger
 * into a magnetic grid or a sheet of liquid metal. Points spring back when the
 * cursor moves away.
 */

const BASE_CELL    = 52   // px between grid points at rest
const REPEL_RADIUS = 190  // cursor influence radius (px)
const REPEL_FORCE  = 14   // max repulsion force
const SPRING       = 0.055
const DAMPING      = 0.76

interface GridPoint {
  gx: number; gy: number   // grid / home position
  x:  number; y:  number   // current displaced position
  vx: number; vy: number
}

export default function RippleGridCanvas() {
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
    let raf  = 0
    let grid: GridPoint[][] = []
    let cols = 0, rows = 0, W = 0, H = 0

    function build() {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
      // Scale cell size so the grid always fills the screen fully
      const cell = BASE_CELL
      cols = Math.ceil(W / cell) + 2
      rows = Math.ceil(H / cell) + 2
      // Centre the grid so it extends slightly beyond edges
      const offX = -((cols * cell - W) / 2)
      const offY = -((rows * cell - H) / 2)
      grid = []
      for (let r = 0; r < rows; r++) {
        grid[r] = []
        for (let c = 0; c < cols; c++) {
          const gx = offX + c * cell
          const gy = offY + r * cell
          grid[r][c] = { gx, gy, x: gx, y: gy, vx: 0, vy: 0 }
        }
      }
    }

    function frame() {
      const dark = darkRef.current
      const prog = pRef.current
      const { x: mx, y: my } = mouseRef.current

      ctx.clearRect(0, 0, W, H)

      // ── Physics update ────────────────────────────────────────────────────
      const repR = REPEL_RADIUS * (1 + prog * 0.25)
      const repF = REPEL_FORCE  * (1 + prog * 0.2)

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const pt = grid[r][c]
          const dx = pt.x - mx, dy = pt.y - my
          const d  = Math.sqrt(dx * dx + dy * dy)

          if (d < repR && d > 0) {
            const f = Math.pow((repR - d) / repR, 1.8) * repF
            pt.vx += (dx / d) * f
            pt.vy += (dy / d) * f
          }
          // Spring back to grid home
          pt.vx += (pt.gx - pt.x) * SPRING
          pt.vy += (pt.gy - pt.y) * SPRING
          pt.vx *= DAMPING; pt.vy *= DAMPING
          pt.x  += pt.vx;   pt.y  += pt.vy
        }
      }

      // ── Draw mesh lines ───────────────────────────────────────────────────
      // Batch horizontal lines
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols - 1; c++) {
          const a   = grid[r][c]
          const b   = grid[r][c + 1]
          const disp = Math.max(
            Math.hypot(a.x - a.gx, a.y - a.gy),
            Math.hypot(b.x - b.gx, b.y - b.gy),
          )
          const t = Math.min(disp / 40, 1)
          const base = dark ? 0.08 : 0.06
          const alpha = base + t * (dark ? 0.30 : 0.18)
          ctx.strokeStyle = dark
            ? `rgba(100,200,255,${alpha.toFixed(3)})`
            : `rgba(50,90,200,${alpha.toFixed(3)})`
          ctx.lineWidth = 0.7 + t * 0.6
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }

      // Batch vertical lines
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows - 1; r++) {
          const a   = grid[r][c]
          const b   = grid[r + 1][c]
          const disp = Math.max(
            Math.hypot(a.x - a.gx, a.y - a.gy),
            Math.hypot(b.x - b.gx, b.y - b.gy),
          )
          const t = Math.min(disp / 40, 1)
          const base = dark ? 0.08 : 0.06
          const alpha = base + t * (dark ? 0.30 : 0.18)
          ctx.strokeStyle = dark
            ? `rgba(100,200,255,${alpha.toFixed(3)})`
            : `rgba(50,90,200,${alpha.toFixed(3)})`
          ctx.lineWidth = 0.7 + t * 0.6
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }

      // ── Draw intersection dots ────────────────────────────────────────────
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const pt  = grid[r][c]
          const disp = Math.hypot(pt.x - pt.gx, pt.y - pt.gy)
          const t    = Math.min(disp / 35, 1)
          const dotR = 1.2 + t * 2.5

          if (dark && t > 0.05) {
            ctx.save()
            ctx.globalCompositeOperation = 'lighter'
            const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, dotR * 3)
            g.addColorStop(0, `rgba(120,210,255,${(t * 0.5).toFixed(3)})`)
            g.addColorStop(1, 'rgba(80,160,255,0)')
            ctx.fillStyle = g
            ctx.beginPath()
            ctx.arc(pt.x, pt.y, dotR * 3, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()
          }

          const alpha = dark
            ? (0.2 + t * 0.6).toFixed(3)
            : (0.12 + t * 0.4).toFixed(3)
          ctx.fillStyle = dark
            ? `rgba(140,220,255,${alpha})`
            : `rgba(40,80,190,${alpha})`
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, dotR, 0, Math.PI * 2)
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
