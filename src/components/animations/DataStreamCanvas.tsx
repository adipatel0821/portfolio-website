'use client'

import { useEffect, useRef } from 'react'
import { useScrollProgress } from '@/hooks/useScrollProgress'

const CHARS = '01アイウエオカキクケコABCDEF{}[]<>|/\\#@!?%01101'
const MAX_COLS = 28

interface Column {
  x: number
  y: number
  speed: number
  chars: string[]
  glowRow: number
}

function buildCols(w: number, h: number, count: number): Column[] {
  const cols: Column[] = []
  const gap = w / MAX_COLS
  for (let i = 0; i < count; i++) {
    const rows = Math.floor(h / 18) + 2
    cols.push({
      x: gap * i + gap * 0.5,
      y: Math.random() * -h,
      speed: 0.8 + (i % 5) * 0.5,
      chars: Array.from({ length: rows }, () => CHARS[Math.floor(Math.random() * CHARS.length)]),
      glowRow: Math.floor(Math.random() * rows),
    })
  }
  return cols
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
      colsRef.current = buildCols(canvas.width, canvas.height, MAX_COLS)
    }
    resize()
    window.addEventListener('resize', resize)

    const FONT_SIZE = 14

    const draw = () => {
      const p = progressRef.current
      const w = canvas.width
      const h = canvas.height

      ctx.clearRect(0, 0, w, h)

      const isDark = document.documentElement.getAttribute('data-theme') !== 'light'

      const colCount = Math.max(2, Math.round(2 + p * (MAX_COLS - 2)))
      const speedMult = 0.5 + p * 2.5
      const cols = colsRef.current.slice(0, colCount)

      ctx.font = `${FONT_SIZE}px monospace`

      cols.forEach((col, ci) => {
        col.y += col.speed * speedMult

        // Randomly mutate chars
        if (Math.random() < 0.04) {
          const ri = Math.floor(Math.random() * col.chars.length)
          col.chars[ri] = CHARS[Math.floor(Math.random() * CHARS.length)]
          col.glowRow = ri
        }

        // Reset when off screen
        if (col.y > h + 40) {
          col.y = -FONT_SIZE * col.chars.length
        }

        // Draw each character
        col.chars.forEach((ch, row) => {
          const cy = col.y + row * FONT_SIZE
          if (cy < -FONT_SIZE || cy > h + FONT_SIZE) return

          const isGlow = row === col.glowRow
          const fadeTop = Math.max(0, Math.min(1, (cy) / (h * 0.2)))
          const fadeBot = Math.max(0, Math.min(1, (h - cy) / (h * 0.3)))
          const fade = fadeTop * fadeBot

          if (isGlow) {
            ctx.fillStyle = isDark ? `rgba(200,255,230,${fade * 0.95})` : `rgba(0,80,40,${fade * 0.95})`
            ctx.shadowColor = isDark ? '#10b981' : '#004020'
            ctx.shadowBlur = 12
          } else {
            const rowAlpha = Math.max(0, 1 - (row - col.glowRow) * 0.07) * fade
            ctx.fillStyle = isDark ? `rgba(16,185,129,${rowAlpha * 0.75})` : `rgba(0,120,60,${rowAlpha * 0.85})`
            ctx.shadowBlur = 0
          }
          ctx.fillText(ch, col.x, cy)
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
