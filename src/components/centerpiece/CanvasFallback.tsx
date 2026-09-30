'use client'

import { useEffect, useRef } from 'react'
import type { MotionValue } from 'framer-motion'

/**
 * 2D-canvas fallback for devices without WebGL2 or with too little headroom to
 * hold the frame budget.
 *
 * This is a real, working reduced version of the centerpiece, the same five
 * formations, projected by hand, not a static placeholder. It runs ~900
 * particles with no shaders, no textures and no depth buffer, which any device
 * that can render the rest of the page can also render.
 */

interface Props {
  chapter: MotionValue<number>
}

const COUNT = 900

type Vec3 = [number, number, number]

function rand(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453
  return x - Math.floor(x)
}

/** Cheap analogues of the five WebGL formations. */
function formationPoint(f: number, i: number): Vec3 {
  const a = rand(i + f * 991)
  const b = rand(i * 1.7 + f * 331)
  const c = rand(i * 2.3 + f * 577)

  switch (f) {
    case 1: {
      // network, four columns wired together
      const layer = Math.floor(a * 4)
      const x = -1.4 + layer * 0.93
      const t = b
      const nextX = x + 0.93
      const y1 = (Math.floor(b * 7) / 6 - 0.5) * 1.4
      const y2 = (Math.floor(c * 7) / 6 - 0.5) * 1.4
      return layer === 3
        ? [x, y1, (c - 0.5) * 0.1]
        : [x + (nextX - x) * t, y1 + (y2 - y1) * t, (c - 0.5) * 0.1]
    }
    case 2: {
      // pipeline, five lanes
      const lane = (Math.floor(a * 5) / 4 - 0.5) * 1.5
      return [(b - 0.5) * 3, lane, (c - 0.5) * 0.16]
    }
    case 3: {
      // lattice, grid edges
      const g = (v: number) => Math.round(v * 4) / 4
      const axis = Math.floor(a * 3)
      const t = (b - 0.5) * 2.2
      const u = (g(c) - 0.5) * 2.2
      const v = (g(rand(i * 3.1 + f)) - 0.5) * 2.2
      return axis === 0 ? [t, u, v] : axis === 1 ? [u, t, v] : [u, v, t]
    }
    case 4: {
      // mesh, sphere shell
      const theta = a * Math.PI * 2
      const phi = Math.acos(2 * b - 1)
      const r = 1.25
      return [r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)]
    }
    default:
      // noise
      return [(a - 0.5) * 2.4, (b - 0.5) * 1.8, (c - 0.5) * 2]
  }
}

export default function CanvasFallback({ chapter }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    // DPR capped at 1.5: this path exists for weak devices, so the pixel budget
    // matters more than crispness.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    let width = 0
    let height = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    let raf = 0
    let running = true
    let t0 = performance.now()

    const draw = (now: number) => {
      if (!running) return
      const time = (now - t0) / 1000

      ctx.clearRect(0, 0, width, height)

      const c = Math.max(0, Math.min(4, chapter.get()))
      const from = Math.floor(c)
      const to = Math.min(from + 1, 4)
      const raw = c - from
      const blend = raw * raw * (3 - 2 * raw) // smoothstep

      const cx = width / 2
      const cy = height / 2
      const scale = Math.min(width, height) * 0.32
      const camZ = 4.35 - c * 0.3
      const yaw = time * 0.045

      for (let i = 0; i < COUNT; i++) {
        const p0 = formationPoint(from, i)
        const p1 = formationPoint(to, i)

        let x = p0[0] + (p1[0] - p0[0]) * blend
        const y = p0[1] + (p1[1] - p0[1]) * blend
        let z = p0[2] + (p1[2] - p0[2]) * blend

        // Yaw about the Y axis, then a simple perspective divide.
        const cos = Math.cos(yaw)
        const sin = Math.sin(yaw)
        const rx = x * cos - z * sin
        const rz = x * sin + z * cos
        x = rx
        z = rz

        const depth = camZ - z
        if (depth < 0.2) continue
        const k = scale / depth

        const sx = cx + x * k
        const sy = cy - y * k
        const size = Math.max(0.6, 1.5 * (scale / 250) * (3 / depth))

        const role = rand(i * 5.7)
        const alpha = Math.max(0, Math.min(0.85, 1.4 / depth - 0.1))
        ctx.fillStyle =
          role < 0.09
            ? `rgba(232,106,43,${alpha})`
            : role < 0.13
              ? `rgba(92,245,106,${alpha})`
              : `rgba(200,200,204,${alpha * 0.75})`

        ctx.fillRect(sx, sy, size, size)
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    // Stop entirely when the tab is backgrounded.
    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(raf)
      } else if (!running) {
        running = true
        t0 = performance.now() - 1
        raf = requestAnimationFrame(draw)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [chapter])

  return <canvas ref={canvasRef} aria-hidden="true" className="h-full w-full" />
}
