'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { useScrollProgress } from '@/hooks/useScrollProgress'

/**
 * HexGridCanvas — a full-screen honeycomb grid that deforms around the cursor.
 * Same spring-physics concept as RippleGridCanvas but using a pointy-top hex
 * lattice instead of squares, giving a completely different visual texture.
 * Purple/violet palette distinguishes it from the blue RippleGrid on projects.
 */

const HEX_SIZE   = 38    // circumradius of each hex (px)
const REPEL_R    = 185   // cursor influence radius
const REPEL_F    = 13    // repulsion strength
const SPRING     = 0.052
const DAMPING    = 0.77

interface HexNode {
  gx: number; gy: number   // grid home
  x:  number; y:  number   // displaced
  vx: number; vy: number
}

export default function HexGridCanvas() {
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
    let nodes: HexNode[] = []
    let W = 0, H = 0

    function build() {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
      nodes = []

      // Pointy-top hex grid
      // Width of hex  = sqrt(3) * size
      // Height of hex = 2 * size
      // Col step = sqrt(3) * size
      // Row step = 1.5 * size
      const s   = HEX_SIZE
      const cw  = Math.sqrt(3) * s      // column width
      const rh  = 1.5 * s              // row height

      const cols = Math.ceil(W / cw) + 3
      const rows = Math.ceil(H / rh) + 3
      const ox   = -cw                  // bleed left
      const oy   = -s * 2              // bleed top

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const gx = ox + c * cw + (r % 2 === 1 ? cw / 2 : 0)
          const gy = oy + r * rh
          nodes.push({ gx, gy, x: gx, y: gy, vx: 0, vy: 0 })
        }
      }
    }

    /** Draw a pointy-top hexagon outline centred at (cx, cy) with radius s. */
    function hexStroke(cx: number, cy: number, s: number) {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6   // pointy-top: -30° start
        const x = cx + s * Math.cos(a)
        const y = cy + s * Math.sin(a)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.stroke()
    }

    function frame() {
      const dark = darkRef.current
      const prog = pRef.current
      const { x: mx, y: my } = mouseRef.current

      ctx.clearRect(0, 0, W, H)

      const repR = REPEL_R * (1 + prog * 0.2)
      const repF = REPEL_F * (1 + prog * 0.15)

      // Use additive blend in dark mode so displaced hexes glow brighter
      if (dark) ctx.globalCompositeOperation = 'lighter'

      for (const nd of nodes) {
        // Physics
        const dx = nd.x - mx, dy = nd.y - my
        const d  = Math.sqrt(dx * dx + dy * dy)
        if (d < repR && d > 0) {
          const f = Math.pow((repR - d) / repR, 1.7) * repF
          nd.vx += (dx / d) * f
          nd.vy += (dy / d) * f
        }
        nd.vx += (nd.gx - nd.x) * SPRING
        nd.vy += (nd.gy - nd.y) * SPRING
        nd.vx *= DAMPING; nd.vy *= DAMPING
        nd.x  += nd.vx;   nd.y  += nd.vy

        // Skip fully off-screen
        const pad = HEX_SIZE * 2
        if (nd.x < -pad || nd.x > W + pad || nd.y < -pad || nd.y > H + pad) continue

        const disp = Math.hypot(nd.x - nd.gx, nd.y - nd.gy)
        const t    = Math.min(disp / 32, 1)

        // ── Draw hex outline ─────────────────────────────────────────────
        const baseA = dark ? 0.07 : 0.055
        const alpha = baseA + t * (dark ? 0.38 : 0.20)

        ctx.strokeStyle = dark
          ? `rgba(190,130,255,${Math.min(alpha, 0.55).toFixed(3)})`
          : `rgba(110,60,210,${Math.min(alpha, 0.30).toFixed(3)})`
        ctx.lineWidth = 0.65 + t * 1.0

        // Slight inner fill on displaced hexes (dark mode only)
        if (dark && t > 0.08) {
          ctx.fillStyle = `rgba(160,90,255,${(t * 0.045).toFixed(3)})`
          hexStroke(nd.x, nd.y, HEX_SIZE - 1.5)
          ctx.fill()
        }
        hexStroke(nd.x, nd.y, HEX_SIZE - 1.5)

        // ── Bright centre dot grows with displacement ─────────────────────
        if (t > 0.06) {
          const dotR = 1.1 + t * 2.8
          ctx.fillStyle = dark
            ? `rgba(215,170,255,${(0.25 + t * 0.55).toFixed(3)})`
            : `rgba(110,50,200,${(0.12 + t * 0.38).toFixed(3)})`
          ctx.beginPath()
          ctx.arc(nd.x, nd.y, dotR, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      if (dark) ctx.globalCompositeOperation = 'source-over'

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
