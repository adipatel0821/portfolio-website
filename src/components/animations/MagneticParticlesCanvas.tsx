'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { useScrollProgress } from '@/hooks/useScrollProgress'

// Low-discrepancy sequence for uniform home-position distribution
function halton(index: number, base: number): number {
  let f = 1, r = 0
  while (index > 0) { f /= base; r += f * (index % base); index = Math.floor(index / base) }
  return r
}

interface Particle {
  ox: number; oy: number   // home position (Halton)
  x: number;  y: number   // current position
  vx: number; vy: number  // velocity
  r: number               // dot radius
  hue: number             // HSL hue
}

// Physics constants — tuned to feel like Google Antigravity
const REPEL_RADIUS   = 170   // px — influence zone of cursor
const REPEL_STRENGTH = 11    // force multiplier
const SPRING         = 0.052 // pull-back toward home
const DAMPING        = 0.81  // velocity decay (lower = floatier)
const MAX_PARTICLES  = 260

// Colour palette: cyan / indigo / violet / amber / teal
const HUES = [190, 215, 265, 290, 42, 158, 320]

export default function MagneticParticlesCanvas() {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const { isDark } = useTheme()
  const p          = useScrollProgress()
  const mouseRef   = useRef({ x: -9999, y: -9999 })
  const darkRef    = useRef(isDark)
  const pRef       = useRef(p)

  useEffect(() => { darkRef.current = isDark }, [isDark])
  useEffect(() => { pRef.current = p }, [p])

  // Global mouse tracker — canvas is fixed/full-screen so clientX == canvasX
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
    let particles: Particle[] = []
    let W = 0, H = 0

    function build() {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
      const n = Math.min(MAX_PARTICLES, Math.floor(W * H / 5200) + 110)
      particles = Array.from({ length: n }, (_, i) => {
        const ox = (halton(i + 1, 2) * 0.90 + 0.05) * W
        const oy = (halton(i + 1, 3) * 0.90 + 0.05) * H
        return {
          ox, oy, x: ox, y: oy,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          r:  1.8 + Math.random() * 3.2,
          hue: HUES[i % HUES.length] + (Math.random() - 0.5) * 22,
        }
      })
    }

    function frame() {
      const dark = darkRef.current
      const prog = pRef.current
      const { x: mx, y: my } = mouseRef.current

      ctx.clearRect(0, 0, W, H)

      // ── Draw subtle web between nearby particles ───────────────────────────
      const linkDist = 90 + prog * 30
      ctx.lineWidth = 0.5
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b   = particles[j]
          const dx  = a.x - b.x, dy = a.y - b.y
          const d   = Math.sqrt(dx * dx + dy * dy)
          if (d >= linkDist) continue
          const t = 1 - d / linkDist
          ctx.strokeStyle = dark
            ? `rgba(120,200,255,${(t * 0.18).toFixed(3)})`
            : `rgba(60,100,200,${(t * 0.09).toFixed(3)})`
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }

      // ── Update physics + draw particles ───────────────────────────────────
      for (const pt of particles) {
        // Cursor repulsion
        const dx = pt.x - mx, dy = pt.y - my
        const d  = Math.sqrt(dx * dx + dy * dy)
        if (d < REPEL_RADIUS && d > 0) {
          const f = Math.pow((REPEL_RADIUS - d) / REPEL_RADIUS, 1.6) * REPEL_STRENGTH
          pt.vx += (dx / d) * f
          pt.vy += (dy / d) * f
        }

        // Spring back to home
        pt.vx += (pt.ox - pt.x) * SPRING
        pt.vy += (pt.oy - pt.y) * SPRING

        // Damping + integrate
        pt.vx *= DAMPING; pt.vy *= DAMPING
        pt.x  += pt.vx;   pt.y  += pt.vy

        const r = pt.r * (1 + prog * 0.35)

        if (dark) {
          // Additive glow — particles light up against dark background
          ctx.save()
          ctx.globalCompositeOperation = 'lighter'
          const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r * 4.5)
          g.addColorStop(0, `hsla(${pt.hue},92%,72%,0.55)`)
          g.addColorStop(1, `hsla(${pt.hue},92%,50%,0)`)
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, r * 4.5, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
          // Hard core
          ctx.fillStyle = `hsla(${pt.hue},90%,85%,0.7)`
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, r * 0.6, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillStyle = `hsla(${pt.hue},65%,42%,0.48)`
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
