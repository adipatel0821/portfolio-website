'use client'

import { useEffect, useRef } from 'react'
import { useScrollProgress } from '@/hooks/useScrollProgress'

interface WaveParticle { x: number; y: number; vy: number; life: number; hue: number }

export default function WaveformCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(0)
  const rafRef = useRef<number>()
  const tickRef = useRef(0)
  const particlesRef = useRef<WaveParticle[]>([])
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

    // [frequency, amp-factor, phase-offset, hue]
    const WAVES = [
      [1.2, 1.00, 0.0, 210],
      [2.5, 0.60, 0.8, 240],
      [4.1, 0.38, 1.6, 190],
      [6.8, 0.24, 2.4, 260],
      [0.6, 0.75, 3.1, 200],
      [9.0, 0.18, 0.5, 280],
    ]

    const draw = () => {
      const p = progressRef.current
      const w = canvas.width
      const h = canvas.height
      tickRef.current += 0.013
      const t = tickRef.current
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light'

      ctx.clearRect(0, 0, w, h)

      // Aurora backdrop (dark mode only)
      if (isDark) {
        const aurora = ctx.createLinearGradient(0, 0, 0, h)
        aurora.addColorStop(0, `rgba(0,40,100,${0.04 + p * 0.04})`)
        aurora.addColorStop(0.5, `rgba(30,0,70,${0.03 + p * 0.03})`)
        aurora.addColorStop(1, 'rgba(0,0,30,0)')
        ctx.fillStyle = aurora
        ctx.fillRect(0, 0, w, h)
      }

      const cy = h * 0.5

      ctx.save()
      if (isDark) ctx.globalCompositeOperation = 'lighter'

      WAVES.forEach(([freq, ampFactor, phaseOff, hue], li) => {
        // Base amplitude always visible; scroll amplifies dramatically
        const baseAmp = h * 0.022 * ampFactor
        const scrollAmp = h * 0.12 * ampFactor * p
        const amplitude = baseAmp + scrollAmp
        const layerProgress = Math.min(1, 0.4 + p * 0.6)
        const alpha = 0.50 * layerProgress

        const wL = isDark ? '65%' : '28%'
        let peakX = 0, peakY = cy

        ctx.beginPath()
        for (let x = 0; x <= w; x += 2) {
          const angle = (x / w) * Math.PI * 2 * freq
          const y = cy
            + Math.sin(angle + t + phaseOff) * amplitude
            + Math.sin(angle * 0.5 + t * 1.3 + phaseOff) * amplitude * 0.3
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
          if (Math.abs(y - cy) > Math.abs(peakY - cy)) { peakX = x; peakY = y }
        }
        ctx.strokeStyle = `hsla(${hue},85%,${wL},${alpha})`
        ctx.lineWidth = 1.5 + layerProgress * 0.8
        ctx.shadowColor = `hsla(${hue},100%,${wL},${isDark ? 0.55 : 0.3})`
        ctx.shadowBlur = 10 + p * 14
        ctx.stroke()
        ctx.shadowBlur = 0

        // Fill under wave at higher scroll
        if (p > 0.2 && amplitude > h * 0.015) {
          ctx.lineTo(w, cy)
          ctx.lineTo(0, cy)
          ctx.closePath()
          const fill = ctx.createLinearGradient(0, cy - amplitude, 0, cy + amplitude)
          fill.addColorStop(0, `hsla(${hue},85%,${isDark ? '65%' : '35%'},${0.07 * layerProgress * p})`)
          fill.addColorStop(1, `hsla(0,0%,${isDark ? '0%' : '100%'},0)`)
          ctx.fillStyle = fill
          ctx.fill()
        }

        // Particle ejection from peaks
        if (p > 0.25 && Math.random() < 0.22 && peakX > 0) {
          particlesRef.current.push({
            x: peakX + (Math.random() - 0.5) * 20,
            y: peakY,
            vy: (peakY < cy ? -1 : 1) * (0.6 + Math.random() * 1.4),
            life: 1,
            hue,
          })
        }

        void li
      })
      ctx.restore()

      // Wave particles
      ctx.save()
      if (isDark) ctx.globalCompositeOperation = 'lighter'
      particlesRef.current = particlesRef.current.filter(pt => {
        pt.y += pt.vy
        pt.life -= 0.032
        if (pt.life <= 0) return false
        const pL = isDark ? '75%' : '30%'
        const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 5)
        g.addColorStop(0, `hsla(${pt.hue},100%,${pL},${pt.life * 0.75})`)
        g.addColorStop(1, `hsla(${pt.hue},100%,${pL},0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2)
        ctx.fill()
        return true
      })
      ctx.restore()

      // EQ spectrum bars at bottom — always visible
      const barCount = Math.max(24, Math.round(24 + p * 48))
      const bw = w / barCount
      for (let i = 0; i < barCount; i++) {
        const x = i * bw
        const barH = (Math.sin(i * 0.85 + t * 2.2) * 0.5 + 0.5) * h * (0.04 + p * 0.1)
        const hue = 200 + (i / barCount) * 80
        const barAlpha = 0.14 + p * 0.22
        ctx.fillStyle = isDark ? `hsla(${hue},80%,60%,${barAlpha})` : `hsla(${hue},80%,28%,${barAlpha * 1.8})`
        ctx.fillRect(x + 1, h - barH, Math.max(1, bw - 2), barH)
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
