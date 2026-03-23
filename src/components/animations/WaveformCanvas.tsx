'use client'

import { useEffect, useRef } from 'react'
import { useScrollProgress } from '@/hooks/useScrollProgress'

export default function WaveformCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(0)
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
    }
    resize()
    window.addEventListener('resize', resize)

    // Wave layers: [frequency, amplitude-factor, phase-offset, hue]
    const WAVES = [
      [1.2, 1.0,  0.0,   210],
      [2.5, 0.55, 0.8,   240],
      [4.1, 0.35, 1.6,   190],
      [6.8, 0.22, 2.4,   260],
      [0.6, 0.7,  3.1,   200],
      [9.0, 0.15, 0.5,   280],
    ]

    const draw = () => {
      const p = progressRef.current
      const w = canvas.width
      const h = canvas.height
      tickRef.current += 0.012

      ctx.clearRect(0, 0, w, h)

      const isDark = document.documentElement.getAttribute('data-theme') !== 'light'

      const visLayers = Math.max(1, Math.round(1 + p * (WAVES.length - 1)))
      const cy = h * 0.5

      for (let li = 0; li < visLayers; li++) {
        const [freq, ampFactor, phaseOff, hue] = WAVES[li]
        const layerProgress = Math.min(1, Math.max(0, (p * WAVES.length - li)))
        if (layerProgress <= 0) continue

        const amplitude = h * 0.08 * ampFactor * p * layerProgress
        const alpha = 0.55 * layerProgress

        ctx.beginPath()
        ctx.moveTo(0, cy)

        for (let x = 0; x <= w; x += 2) {
          const t = (x / w) * Math.PI * 2 * freq
          const y = cy + Math.sin(t + tickRef.current + phaseOff) * amplitude
                     + Math.sin(t * 0.5 + tickRef.current * 1.3 + phaseOff) * amplitude * 0.3
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }

        const wL = isDark ? '65%' : '28%'
        ctx.strokeStyle = `hsla(${hue},85%,${wL},${alpha})`
        ctx.lineWidth = 1.5 + layerProgress
        ctx.shadowColor = `hsla(${hue},100%,${wL},${isDark ? 0.6 : 0.4})`
        ctx.shadowBlur = 8 + p * 12
        ctx.stroke()
        ctx.shadowBlur = 0

        // Filled glow under wave
        if (p > 0.3) {
          ctx.lineTo(w, cy)
          ctx.lineTo(0, cy)
          ctx.closePath()
          const fill = ctx.createLinearGradient(0, cy - amplitude, 0, cy + amplitude)
          fill.addColorStop(0, `hsla(${hue},85%,${isDark ? '65%' : '35%'},${0.06 * layerProgress * p})`)
          fill.addColorStop(1, isDark ? 'hsla(0,0%,0%,0)' : 'hsla(0,0%,100%,0)')
          ctx.fillStyle = fill
          ctx.fill()
        }
      }

      // Vertical bars at peaks (data viz feel)
      if (p > 0.5) {
        const barCount = Math.round(p * 60)
        const barAlpha = (p - 0.5) * 0.4
        for (let i = 0; i < barCount; i++) {
          const x = (i / barCount) * w
          const barH = (Math.sin(i * 0.8 + tickRef.current * 2) * 0.5 + 0.5) * h * 0.15 * p
          ctx.fillStyle = isDark ? `rgba(99,102,241,${barAlpha})` : `rgba(30,50,200,${barAlpha * 2})`
          ctx.fillRect(x, cy - barH, 2, barH * 2)
        }
      }

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
