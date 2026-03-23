'use client'

import { useEffect, useRef } from 'react'
import { useScrollProgress } from '@/hooks/useScrollProgress'

const CHARS = '01アイウエオカキクケコサシスセソタチツテトABCDEF{}[]<>|/\\#@!?%10110001'
const FONT_SIZE = 15

interface Column {
  x: number; y: number; speed: number; chars: string[]
  glowRow: number; colorType: number // 0=green 1=cyan 2=white
}

function buildColumns(w: number, h: number): Column[] {
  const gap = 20
  const count = Math.ceil(w / gap) + 1
  const rows = Math.floor(h / FONT_SIZE) + 3
  return Array.from({ length: count }, (_, i) => ({
    x: i * gap + gap * 0.5,
    y: Math.random() * -h * 1.5,
    speed: 0.6 + (i % 7) * 0.52,
    chars: Array.from({ length: rows }, () => CHARS[Math.floor(Math.random() * CHARS.length)]),
    glowRow: Math.floor(Math.random() * rows),
    colorType: i % 11 === 0 ? 2 : i % 5 === 0 ? 1 : 0,
  }))
}

export default function DataStreamCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(0)
  const colsRef = useRef<Column[]>([])
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
      colsRef.current = buildColumns(canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const p = progressRef.current
      const w = canvas.width
      const h = canvas.height
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light'

      ctx.clearRect(0, 0, w, h)

      // Show 40% of columns at p=0, full coverage with scroll
      const total = colsRef.current.length
      const visible = Math.max(Math.round(total * 0.40), Math.round(total * (0.40 + p * 0.60)))
      const speedMult = 0.65 + p * 2.1

      ctx.font = `${FONT_SIZE}px 'Courier New', monospace`

      colsRef.current.slice(0, visible).forEach(col => {
        col.y += col.speed * speedMult
        if (Math.random() < 0.044) {
          const ri = Math.floor(Math.random() * col.chars.length)
          col.chars[ri] = CHARS[Math.floor(Math.random() * CHARS.length)]
          col.glowRow = ri
        }
        if (col.y > h + FONT_SIZE * col.chars.length) {
          col.y = -FONT_SIZE * col.chars.length * (0.5 + Math.random() * 0.5)
        }

        col.chars.forEach((ch, row) => {
          const cy = col.y + row * FONT_SIZE
          if (cy < -FONT_SIZE || cy > h + FONT_SIZE) return
          const isGlow = row === col.glowRow
          const fadeTop = Math.min(1, cy / (h * 0.14))
          const fadeBot = Math.min(1, (h - cy) / (h * 0.22))
          const fade = Math.max(0, fadeTop * fadeBot)
          const dist = Math.abs(row - col.glowRow)
          const rowAlpha = Math.max(0, 1 - dist * 0.055) * fade

          if (isGlow) {
            ctx.save()
            if (isDark) ctx.globalCompositeOperation = 'lighter'
            if (col.colorType === 2) {
              ctx.fillStyle = isDark ? `rgba(255,255,255,${fade * 0.95})` : `rgba(10,10,60,${fade * 0.9})`
              ctx.shadowColor = isDark ? '#fff' : '#0a0a3c'
            } else if (col.colorType === 1) {
              ctx.fillStyle = isDark ? `rgba(0,255,240,${fade * 0.95})` : `rgba(0,90,110,${fade * 0.9})`
              ctx.shadowColor = isDark ? '#00fff0' : '#005a6e'
            } else {
              ctx.fillStyle = isDark ? `rgba(180,255,200,${fade * 0.95})` : `rgba(0,80,40,${fade * 0.9})`
              ctx.shadowColor = isDark ? '#10b981' : '#004020'
            }
            ctx.shadowBlur = 14
            ctx.fillText(ch, col.x, cy)
            ctx.restore()
          } else {
            if (col.colorType === 2) {
              ctx.fillStyle = isDark ? `rgba(200,200,255,${rowAlpha * 0.55})` : `rgba(10,10,60,${rowAlpha * 0.45})`
            } else if (col.colorType === 1) {
              ctx.fillStyle = isDark ? `rgba(0,200,220,${rowAlpha * 0.60})` : `rgba(0,80,100,${rowAlpha * 0.50})`
            } else {
              ctx.fillStyle = isDark ? `rgba(16,185,129,${rowAlpha * 0.65})` : `rgba(0,110,55,${rowAlpha * 0.55})`
            }
            ctx.fillText(ch, col.x, cy)
          }
        })
      })
      ctx.shadowBlur = 0

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
