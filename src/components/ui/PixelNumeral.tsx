'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { clsx } from '@/lib/clsx'

/**
 * 5×7 bitmap digits. Hand-plotted rather than rendered from a pixel font,
 * because each dot has to be individually positioned for the scatter-assemble
 * reveal — you cannot address the pixels inside a glyph.
 */
const GLYPHS: Record<string, string[]> = {
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
}

const ROWS = 7
const COLS = 5

/** Deterministic PRNG — identical on server and client, so no hydration drift. */
function seeded(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

interface PixelNumeralProps {
  /** The chapter number, e.g. "01". Digits only. */
  value: string
  tone?: 'signal' | 'chalk' | 'ash' | 'phosphor'
  className?: string
  /** Scatter radius in px before the dots settle. */
  scatter?: number
  /** Accessible label; defaults to "Chapter {value}". */
  label?: string
}

const TONE_CLASS = {
  signal: 'bg-signal',
  chalk: 'bg-chalk',
  ash: 'bg-ash',
  phosphor: 'bg-phosphor',
} as const

/**
 * Giant dot-matrix chapter numeral that assembles from scattered pixels as it
 * scrolls into view. Each dot flies in from a seeded random offset with a
 * distance-weighted delay, so the numeral resolves from the outside in.
 *
 * The animation is pure CSS (see `.pixel-dot` in globals.css) — this component
 * only flips one attribute when the numeral enters the viewport. Driving each
 * dot through the animation library was measurably worse for hydration cost on
 * a page carrying several numerals, and the effect is identical.
 *
 * Only lit dots are rendered; unlit cells contribute no DOM.
 */
export default function PixelNumeral({
  value,
  tone = 'signal',
  className,
  scatter = 90,
  label,
}: PixelNumeralProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [assembled, setAssembled] = useState(false)

  const digits = useMemo(() => value.split('').filter((c) => c in GLYPHS), [value])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Fires once — the numeral does not re-scatter on the way back up.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setAssembled(true)
        io.disconnect()
      },
      { rootMargin: '0px 0px -20% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      data-assembled={assembled}
      className={clsx('flex select-none', className)}
      style={{ gap: 'clamp(0.5rem, 1.4vw, 1.2rem)' }}
      role="img"
      aria-label={label ?? `Chapter ${value}`}
    >
      {digits.map((digit, digitIndex) => (
        <div
          key={digitIndex}
          className="grid"
          aria-hidden="true"
          style={{
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gridTemplateRows: `repeat(${ROWS}, 1fr)`,
            // Width drives everything; the 5:7 ratio keeps the dots square.
            width: 'clamp(2.5rem, 7vw, 6rem)',
            aspectRatio: `${COLS} / ${ROWS}`,
            gap: '14%',
          }}
        >
          {GLYPHS[digit].flatMap((rowBits, row) =>
            rowBits.split('').map((bit, col) => {
              if (bit !== '1') return null

              const seed = digitIndex * 1000 + row * COLS + col

              // Seeded scatter: a random direction at a random distance, with
              // the delay weighted by distance from the numeral's centre so the
              // shape resolves outside-in.
              const angle = seeded(seed) * Math.PI * 2
              const dist = (0.35 + seeded(seed + 7) * 0.65) * scatter
              const centreDist =
                Math.abs(row - (ROWS - 1) / 2) / ROWS + Math.abs(col - (COLS - 1) / 2) / COLS
              const delay = 0.06 + centreDist * 0.5 + seeded(seed + 13) * 0.12

              return (
                <span
                  key={`${row}-${col}`}
                  className={clsx('pixel-dot', TONE_CLASS[tone])}
                  style={
                    {
                      // Explicit placement, so unlit cells need no filler node.
                      gridColumn: col + 1,
                      gridRow: row + 1,
                      '--tx': `${(Math.cos(angle) * dist).toFixed(1)}px`,
                      '--ty': `${(Math.sin(angle) * dist).toFixed(1)}px`,
                      '--delay': `${delay.toFixed(3)}s`,
                    } as CSSProperties
                  }
                />
              )
            }),
          )}
        </div>
      ))}
    </div>
  )
}
