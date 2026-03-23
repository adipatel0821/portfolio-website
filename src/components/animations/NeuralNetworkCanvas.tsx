'use client'

import { useEffect, useRef } from 'react'
import { useScrollProgress } from '@/hooks/useScrollProgress'

const MAX_NODES = 90
const STAR_COUNT = 150

interface Node { x: number; y: number; ox: number; oy: number; r: number; pulse: number }
interface Signal { fromIdx: number; toIdx: number; t: number; speed: number; hue: number }
interface Star { x: number; y: number; r: number; base: number; phase: number }

// Halton low-discrepancy sequence — guarantees even 2D coverage with no clustering
function halton(i: number, base: number): number {
  let f = 1, r = 0, n = i
  while (n > 0) { f /= base; r += f * (n % base); n = Math.floor(n / base) }
  return r
}

function buildNodes(w: number, h: number): Node[] {
  return Array.from({ length: MAX_NODES }, (_, i) => {
    const x = (halton(i + 1, 2) * 0.92 + 0.04) * w   // base-2 → x
    const y = (halton(i + 1, 3) * 0.92 + 0.04) * h   // base-3 → y
    return { x, y, ox: x, oy: y, r: 1.8 + (i % 4) * 0.6, pulse: (i * 1.1) % (Math.PI * 2) }
  })
}

function buildStars(w: number, h: number): Star[] {
  return Array.from({ length: STAR_COUNT }, (_, i) => ({
    x: halton(i + 1, 2) * w,
    y: halton(i + 1, 5) * h,
    r: 0.3 + (i % 5) * 0.18,
    base: 0.07 + (i % 9) * 0.05,
    phase: (i * 2.618) % (Math.PI * 2),
  }))
}

export default function NeuralNetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(0)
  const nodesRef = useRef<Node[]>([])
  const starsRef = useRef<Star[]>([])
  const signalsRef = useRef<Signal[]>([])
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
      nodesRef.current = buildNodes(canvas.width, canvas.height)
      starsRef.current = buildStars(canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const p = progressRef.current
      const w = canvas.width
      const h = canvas.height
      tickRef.current += 0.007
      const t = tickRef.current
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light'

      ctx.clearRect(0, 0, w, h)

      // ── Stars + nebula (dark only) ────────────────────────────
      if (isDark) {
        starsRef.current.forEach(s => {
          const a = s.base * (0.5 + 0.5 * Math.sin(s.phase + t * 1.1))
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(180,220,255,${a})`
          ctx.fill()
        })
        const nb = ctx.createRadialGradient(w * 0.5, h * 0.46, 0, w * 0.5, h * 0.46, w * 0.5)
        nb.addColorStop(0, `rgba(0,160,255,${0.020 + p * 0.016})`)
        nb.addColorStop(0.55, `rgba(80,0,200,${0.012 + p * 0.010})`)
        nb.addColorStop(1, 'rgba(0,0,50,0)')
        ctx.fillStyle = nb
        ctx.fillRect(0, 0, w, h)
      }

      const nodeCount = Math.max(28, Math.round(28 + p * (MAX_NODES - 28)))
      const nodes = nodesRef.current.slice(0, nodeCount)

      // Float nodes gently across the full canvas
      nodes.forEach((n, i) => {
        n.x = n.ox + Math.sin(t * 0.85 + i * 0.72) * 15
        n.y = n.oy + Math.cos(t * 0.62 + i * 0.58) * 10
        n.pulse += 0.032
      })

      const threshold = 160 + p * 200

      // ── Connections ───────────────────────────────────────────
      ctx.save()
      if (isDark) ctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < threshold) {
            const str = 1 - d / threshold
            if (isDark) {
              ctx.strokeStyle = `rgba(0,190,255,${str * 0.38})`
              ctx.lineWidth = 0.3 + str * 1.0
            } else {
              // Light mode: very subtle so text stays readable
              ctx.strokeStyle = `rgba(40,70,200,${str * 0.07})`
              ctx.lineWidth = 0.2 + str * 0.4
            }
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }
      ctx.restore()

      // ── Signal spawn ──────────────────────────────────────────
      const spawnChance = 0.05 + p * 0.08
      if (nodes.length > 6 && Math.random() < spawnChance && signalsRef.current.length < 45) {
        const fi = Math.floor(Math.random() * nodes.length)
        const ti = Math.floor(Math.random() * nodes.length)
        if (fi !== ti)
          signalsRef.current.push({ fromIdx: fi, toIdx: ti, t: 0, speed: 0.009 + Math.random() * 0.015, hue: Math.random() < 0.55 ? 195 : 280 })
      }

      // ── Signals with comet trails ─────────────────────────────
      ctx.save()
      if (isDark) ctx.globalCompositeOperation = 'lighter'
      signalsRef.current = signalsRef.current.filter(sig => {
        if (sig.fromIdx >= nodes.length || sig.toIdx >= nodes.length) return false
        sig.t += sig.speed
        const n1 = nodes[sig.fromIdx], n2 = nodes[sig.toIdx]
        for (let trail = 5; trail >= 0; trail--) {
          const tf = Math.max(0, sig.t - trail * 0.04)
          if (tf <= 0) continue
          const tx = n1.x + (n2.x - n1.x) * tf
          const ty = n1.y + (n2.y - n1.y) * tf
          const baseAlpha = isDark ? 0.85 : 0.35
          const a = ((6 - trail) / 6) * baseAlpha * (1 - sig.t * 0.3)
          const r = Math.max(0.5, 6 - trail)
          const sigL = isDark ? '72%' : '35%'
          const g = ctx.createRadialGradient(tx, ty, 0, tx, ty, r)
          g.addColorStop(0, `hsla(${sig.hue},100%,${sigL},${a})`)
          g.addColorStop(1, `hsla(${sig.hue},100%,${sigL},0)`)
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(tx, ty, r, 0, Math.PI * 2)
          ctx.fill()
        }
        return sig.t < 1
      })
      ctx.restore()

      // ── Nodes ─────────────────────────────────────────────────
      ctx.save()
      if (isDark) ctx.globalCompositeOperation = 'lighter'
      nodes.forEach((n, i) => {
        const appear = Math.min(1, Math.max(0, 0.5 + (p * MAX_NODES - i) * 0.04))
        if (appear <= 0) return
        const pulse = 0.65 + 0.35 * Math.sin(n.pulse)

        if (isDark) {
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 9)
          g.addColorStop(0, `hsla(195,90%,80%,${0.42 * appear * pulse})`)
          g.addColorStop(1, `hsla(195,90%,80%,0)`)
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(n.x, n.y, n.r * 9, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = `hsla(195,100%,88%,${appear})`
        } else {
          // Light mode: small filled dots, no massive halos
          ctx.fillStyle = `hsla(220,65%,32%,${appear * 0.50})`
        }
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r * (0.8 + pulse * 0.3), 0, Math.PI * 2)
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
