'use client'

import { useEffect, useRef } from 'react'
import { useScrollProgress } from '@/hooks/useScrollProgress'

const MAX_NODES = 48

interface Node {
  x: number; y: number; ox: number; oy: number; r: number
}

interface Signal {
  fromIdx: number; toIdx: number; t: number; speed: number; hue: number
}

function buildNodes(w: number, h: number): Node[] {
  const nodes: Node[] = []
  const phi = (1 + Math.sqrt(5)) / 2
  for (let i = 0; i < MAX_NODES; i++) {
    const x = ((i * phi * 0.618033) % 1) * w * 0.88 + w * 0.06
    const y = ((i * phi * 1.618033) % 1) * h * 0.88 + h * 0.06
    nodes.push({ x, y, ox: x, oy: y, r: 2.5 + (i % 3) * 0.8 })
  }
  return nodes
}

export default function NeuralNetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(0)
  const nodesRef = useRef<Node[]>([])
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
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const p = progressRef.current
      const w = canvas.width
      const h = canvas.height
      tickRef.current += 0.008

      ctx.clearRect(0, 0, w, h)

      // Background
      const bg = ctx.createLinearGradient(0, 0, w, h)
      bg.addColorStop(0, '#060c18')
      bg.addColorStop(1, '#090f1e')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      const nodeCount = Math.max(3, Math.round(3 + p * (MAX_NODES - 3)))
      const nodes = nodesRef.current.slice(0, nodeCount)
      const t = tickRef.current

      // Float nodes gently
      nodes.forEach((n, i) => {
        n.x = n.ox + Math.sin(t + i * 0.8) * 14
        n.y = n.oy + Math.cos(t * 0.7 + i * 0.6) * 10
      })

      // Connection distance grows with scroll
      const threshold = 80 + p * 260

      // Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < threshold) {
            const alpha = (1 - d / threshold) * 0.4 * Math.min(1, p * 3)
            ctx.strokeStyle = `rgba(0,212,255,${alpha})`
            ctx.lineWidth = 0.5 + (1 - d / threshold) * 0.5
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      // Spawn signals
      const spawnChance = 0.05 * p
      if (nodes.length > 3 && Math.random() < spawnChance && signalsRef.current.length < 30) {
        const fi = Math.floor(Math.random() * nodes.length)
        const ti = Math.floor(Math.random() * nodes.length)
        if (fi !== ti) {
          signalsRef.current.push({
            fromIdx: fi, toIdx: ti,
            t: 0,
            speed: 0.006 + Math.random() * 0.014,
            hue: Math.random() < 0.6 ? 195 : 280,
          })
        }
      }

      // Draw signals
      signalsRef.current = signalsRef.current.filter(sig => {
        if (sig.fromIdx >= nodes.length || sig.toIdx >= nodes.length) return false
        sig.t += sig.speed
        const n1 = nodes[sig.fromIdx]
        const n2 = nodes[sig.toIdx]
        const sx = n1.x + (n2.x - n1.x) * sig.t
        const sy = n1.y + (n2.y - n1.y) * sig.t
        const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, 9)
        grd.addColorStop(0, `hsla(${sig.hue},100%,70%,0.9)`)
        grd.addColorStop(1, `hsla(${sig.hue},100%,70%,0)`)
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(sx, sy, 9, 0, Math.PI * 2)
        ctx.fill()
        return sig.t < 1
      })

      // Nodes
      nodes.forEach((n, i) => {
        const appear = Math.min(1, Math.max(0, (p * MAX_NODES - i) * 0.6))
        if (appear <= 0) return
        // Outer glow
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 7)
        g.addColorStop(0, `rgba(0,212,255,${0.35 * appear})`)
        g.addColorStop(1, 'rgba(0,212,255,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r * 7, 0, Math.PI * 2)
        ctx.fill()
        // Core dot
        ctx.fillStyle = `rgba(180,240,255,${appear})`
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fill()
      })

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
