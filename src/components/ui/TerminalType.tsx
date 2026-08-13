'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import { clsx } from '@/lib/clsx'

interface TerminalTypeProps {
  /** One string, or several that cycle. */
  text: string | string[]
  className?: string
  /** ms per character. */
  speed?: number
  /** ms to hold a finished string before deleting (multi-string mode only). */
  hold?: number
  /** Show the blinking phosphor caret. */
  caret?: boolean
  /** Prefix rendered in green before the text, e.g. "$" or ">". */
  prompt?: string
}

/**
 * Terminal-style typing effect for select labels.
 *
 * Accessibility: the full text is always present in the DOM for screen readers
 * via a visually-hidden node, and the animated glyphs are aria-hidden. A screen
 * reader therefore reads the label once, correctly, instead of announcing every
 * intermediate character.
 *
 * Under reduced motion it renders the finished string with no caret animation.
 */
export default function TerminalType({
  text,
  className,
  speed = 45,
  hold = 2200,
  caret = true,
  prompt,
}: TerminalTypeProps) {
  const strings = Array.isArray(text) ? text : [text]
  const fullText = strings.join(', ')

  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: false, margin: '0px 0px -10% 0px' })
  const prefersReduced = useReducedMotion()

  const [display, setDisplay] = useState('')
  const [index, setIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    // Don't burn timers while off-screen or when motion is unwanted.
    if (prefersReduced || !inView) return

    const current = strings[index % strings.length]
    const done = !deleting && display === current
    const cleared = deleting && display === ''

    // Single string: type once and stop. Never delete.
    if (done && strings.length === 1) return

    if (done) {
      const t = setTimeout(() => setDeleting(true), hold)
      return () => clearTimeout(t)
    }
    if (cleared) {
      setDeleting(false)
      setIndex((i) => i + 1)
      return
    }

    const t = setTimeout(
      () => {
        setDisplay((d) =>
          deleting ? current.slice(0, d.length - 1) : current.slice(0, d.length + 1),
        )
      },
      // Deleting reads better at roughly double speed.
      deleting ? speed / 2 : speed,
    )
    return () => clearTimeout(t)
  }, [display, deleting, index, inView, prefersReduced, speed, hold, strings])

  if (prefersReduced) {
    return (
      <span className={clsx('font-mono', className)}>
        {prompt && <span className="mr-1.5 text-phosphor">{prompt}</span>}
        {strings[0]}
      </span>
    )
  }

  return (
    <span ref={ref} className={clsx('font-mono', className)}>
      {prompt && (
        <span aria-hidden="true" className="mr-1.5 text-phosphor">
          {prompt}
        </span>
      )}
      {/* Announced once, in full. */}
      <span className="sr-only">{fullText}</span>
      <span aria-hidden="true">{display}</span>
      {caret && <span aria-hidden="true" className="caret" />}
    </span>
  )
}
