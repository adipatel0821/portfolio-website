'use client'

import { useRef, useMemo } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { clsx } from '@/lib/clsx'

/**
 * 5×7 bitmap digits. Hand-plotted rather than rendered from a pixel font,
 * because each dot has to be an individually animatable element for the
 * scatter-assemble reveal — you cannot address the pixels inside a glyph.
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

/**
 * Deterministic PRNG. The scatter offsets must be identical on the server and
 * the client or React throws a hydration mismatch on every dot — so no
 * Math.random() anywhere in this component.
 */
function seeded(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

interface PixelNumeralProps {
  /** The chapter number, e.g. "01". Digits only. */
  value: string
  /** Dot colour. */
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
 * Under reduced motion the dots are simply present — no scatter, no stagger.
 */
export default function PixelNumeral({
  value,
  tone = 'signal',
  className,
  scatter = 90,
  label,
}: PixelNumeralProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -20% 0px' })
  const prefersReduced = useReducedMotion()

  const digits = useMemo(() => value.split('').filter((c) => c in GLYPHS), [value])

  // Flatten every digit into one dot list so delays can be computed across the
  // whole numeral rather than restarting per glyph.
  const dots = useMemo(() => {
    const out: { key: string; digit: number; row: number; col: number; seed: number }[] = []
    digits.forEach((d, digitIndex) => {
      const glyph = GLYPHS[d]
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          if (glyph[row][col] !== '1') continue
          out.push({
            key: `${digitIndex}-${row}-${col}`,
            digit: digitIndex,
            row,
            col,
            seed: digitIndex * 1000 + row * COLS + col,
          })
        }
      }
    })
    return out
  }, [digits])

  return (
    <div
      ref={ref}
      className={clsx('flex select-none', className)}
      style={{ gap: 'clamp(0.5rem, 1.4vw, 1.2rem)' }}
      role="img"
      aria-label={label ?? `Chapter ${value}`}
    >
      {digits.map((_, digitIndex) => (
        <div
          key={digitIndex}
          className="grid"
          aria-hidden="true"
          style={{
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gridTemplateRows: `repeat(${ROWS}, 1fr)`,
            // Width drives everything; the 5:7 ratio keeps dots square.
            width: 'clamp(2.5rem, 7vw, 6rem)',
            aspectRatio: `${COLS} / ${ROWS}`,
            gap: '14%',
          }}
        >
          {Array.from({ length: ROWS * COLS }, (_, cell) => {
            const row = Math.floor(cell / COLS)
            const col = cell % COLS
            const dot = dots.find(
              (d) => d.digit === digitIndex && d.row === row && d.col === col,
            )
            if (!dot) return <span key={cell} />

            // Seeded scatter: a random direction at a random distance, with the
            // delay weighted by how far the dot sits from the numeral's centre
            // so the shape resolves outside-in.
            const angle = seeded(dot.seed) * Math.PI * 2
            const dist = (0.35 + seeded(dot.seed + 7) * 0.65) * scatter
            const centreDist =
              Math.abs(row - (ROWS - 1) / 2) / ROWS + Math.abs(col - (COLS - 1) / 2) / COLS
            const delay = 0.06 + centreDist * 0.5 + seeded(dot.seed + 13) * 0.12

            if (prefersReduced) {
              return (
                <span
                  key={cell}
                  className={clsx('block h-full w-full', TONE_CLASS[tone])}
                />
              )
            }

            return (
              <motion.span
                key={cell}
                className={clsx('block h-full w-full', TONE_CLASS[tone])}
                initial={{
                  opacity: 0,
                  x: Math.cos(angle) * dist,
                  y: Math.sin(angle) * dist,
                  scale: 0.4,
                }}
                animate={
                  inView
                    ? { opacity: 1, x: 0, y: 0, scale: 1 }
                    : { opacity: 0, x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, scale: 0.4 }
                }
                transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
