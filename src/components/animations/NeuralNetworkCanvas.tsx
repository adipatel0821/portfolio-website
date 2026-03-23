'use client'

import { useEffect, useRef } from 'react'
import { useScrollProgress } from '@/hooks/useScrollProgress'

const MAX_NODES = 80
const STAR_COUNT = 160

interface Node { x: number; y: number; ox: number; oy: number; r: number; pulse: number }
interface Signal { fromIdx: number; toIdx: number; t: number; speed: number; hue: number }
interface Star { x: number; y: number; r: number; base: number; phase: number }

function buildNodes(w: number, h: number): Node[] {
  const phi = (1 + Math.sqrt(5)) / 2
  return Array.from({ length: MAX_NODES }, (_, i) => {
    const x = ((i * phi * 0.618033) % 1) * w * 0.90 + w * 0.05
    const y = ((i * phi * 1.618033) % 1) * h * 0.90 + h * 0.05
    return { x, y, ox: x, oy: y, r: 2 + (i % 4) * 0.7, pulse: (i * 0.9) % (Math.PI * 2) }
  })
}

function buildStars(w: number, h: number): Star[] {
  return Array.from({ length: STAR_COUNT }, (_, i) => ({
    x: ((i * 0.618033 * 7919) % 1) * w,
    y: ((i * 0.618033 * 3571) % 1) * h,
    r: 0.4 + (i % 5) * 0.22,
    base: 0.1 + (i % 9) * 0.06,
    phase: (i * 1.618) % (Math.PI * 2),
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

      // ── Star field ────────────────────────────────────────────
      starsRef.current.forEach(s => {
        const a = s.base * (0.5 + 0.5 * Math.sin(s.phase + t * 1.1))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = isDark ? `rgba(180,220,255,${a})` : `rgba(30,80,180,${a * 0.4})`
        ctx.fill()
      })

      // ── Nebula center glow ────────────────────────────────────
      if (isDark) {
        const nb = ctx.createRadialGradient(w * 0.5, h * 0.44, 0, w * 0.5, h * 0.44, w * 0.52)
        nb.addColorStop(0, `rgba(0,180,255,${0.028 + p * 0.022})`)
        nb.addColorStop(0.5, `rgba(100,0,255,${0.018 + p * 0.014})`)
        nb.addColorStop(1, 'rgba(0,0,80,0)')
        ctx.fillStyle = nb
        ctx.fillRect(0, 0, w, h)
      }

      // Base 24 nodes at p=0, grow to MAX_NODES with scroll
      const nodeCount = Math.max(24, Math.round(24 + p * (MAX_NODES - 24)))
      const nodes = nodesRef.current.slice(0, nodeCount)

      nodes.forEach((n, i) => {
        n.x = n.ox + Math.sin(t * 0.9 + i * 0.72) * 18
        n.y = n.oy + Math.cos(t * 0.65 + i * 0.58) * 12
        n.pulse += 0.034
      })

      const threshold = 150 + p * 220

      // ── Connections (additive blend) ──────────────────────────
      ctx.save()
      if (isDark) ctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < threshold) {
            const str = 1 - d / threshold
            const a = str * 0.42
            ctx.strokeStyle = isDark ? `rgba(0,190,255,${a})` : `rgba(20,80,200,${a * 1.8})`
            ctx.lineWidth = 0.4 + str * 1.4
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }
      ctx.restore()

      // ── Signal spawn ──────────────────────────────────────────
      const spawnChance = 0.055 + p * 0.09
      if (nodes.length > 6 && Math.random() < spawnChance && signalsRef.current.length < 55) {
        const fi = Math.floor(Math.random() * nodes.length)
        const ti = Math.floor(Math.random() * nodes.length)
        if (fi !== ti)
          signalsRef.current.push({ fromIdx: fi, toIdx: ti, t: 0, speed: 0.008 + Math.random() * 0.016, hue: Math.random() < 0.55 ? 195 : 280 })
      }

      // ── Signals with comet trails ─────────────────────────────
      ctx.save()
      if (isDark) ctx.globalCompositeOperation = 'lighter'
      signalsRef.current = signalsRef.current.filter(sig => {
        if (sig.fromIdx >= nodes.length || sig.toIdx >= nodes.length) return false
        sig.t += sig.speed
        const n1 = nodes[sig.fromIdx], n2 = nodes[sig.toIdx]
        const sigL = isDark ? '72%' : '30%'
        for (let trail = 6; trail >= 0; trail--) {
          const tf = Math.max(0, sig.t - trail * 0.04)
          if (tf <= 0) continue
          const tx = n1.x + (n2.x - n1.x) * tf
          const ty = n1.y + (n2.y - n1.y) * tf
          const a = ((7 - trail) / 7) * 0.85 * (1 - sig.t * 0.25)
          const r = 8 - trail
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

      // ── Nodes (additive blend) ────────────────────────────────
      ctx.save()
      if (isDark) ctx.globalCompositeOperation = 'lighter'
      nodes.forEach((n, i) => {
        const appear = Math.min(1, Math.max(0, 0.5 + (p * MAX_NODES - i) * 0.045))
        if (appear <= 0) return
        const pulse = 0.65 + 0.35 * Math.sin(n.pulse)
        const hue2 = isDark ? 195 : 215
        const lCore = isDark ? 80 : 30

        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 11)
        g.addColorStop(0, `hsla(${hue2},90%,${lCore}%,${0.45 * appear * pulse})`)
        g.addColorStop(1, `hsla(${hue2},90%,${lCore}%,0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r * 11, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = `hsla(${hue2},100%,${isDark ? 88 : 22}%,${appear})`
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r * (0.8 + pulse * 0.4), 0, Math.PI * 2)
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
