'use client'

import { useRef, ReactNode } from 'react'
import { motion, useInView } from 'framer-motion'

interface Props {
  children: ReactNode
  delay?: number
  direction?: string
  className?: string
  once?: boolean
  amount?: number
}

export default function ScrollReveal({
  children,
  delay = 0,
  className = '',
  once = true,
  amount = 0.1,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once, amount })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
