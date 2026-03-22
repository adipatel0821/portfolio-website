'use client'

import { useRef } from 'react'
import Link from 'next/link'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import NYCSkyline from './NYCSkyline'

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  // Mouse tracking values
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  // Smooth springs
  const springX = useSpring(rawX, { stiffness: 50, damping: 25 })
  const springY = useSpring(rawY, { stiffness: 50, damping: 25 })

  // 3D tilt for headline (follows cursor)
  const rotateY = useTransform(springX, [-0.5, 0.5], ['-8deg', '8deg'])
  const rotateX = useTransform(springY, [-0.5, 0.5], ['6deg', '-6deg'])

  // Parallax for skyline (opposite direction, larger scale)
  const parallaxX = useTransform(springX, [-0.5, 0.5], [20, -20])
  const parallaxY = useTransform(springY, [-0.5, 0.5], [12, -12])

  // Smooth parallax
  const px = useSpring(parallaxX, { stiffness: 28, damping: 22 })
  const py = useSpring(parallaxY, { stiffness: 28, damping: 22 })

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const { left, top, width, height } = containerRef.current.getBoundingClientRect()
    rawX.set((e.clientX - left) / width - 0.5)
    rawY.set((e.clientY - top) / height - 0.5)
  }

  const onMouseLeave = () => {
    rawX.set(0)
    rawY.set(0)
  }

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Skyline with Ken Burns + Parallax mouse effect */}
      <motion.div
        className="absolute inset-0"
        style={{ x: px, y: py }}
      >
        {/* Ken Burns scale wrapper — slightly oversized so parallax doesn't show edges */}
        <motion.div
          className="absolute"
          style={{ inset: '-5%' }}
          initial={{ scale: 1 }}
          animate={{ scale: 1.1 }}
          transition={{
            duration: 26,
            ease: 'linear',
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          <div className="w-full h-full" style={{ position: 'relative' }}>
            <NYCSkyline />
          </div>
        </motion.div>
      </motion.div>

      {/* Gradient overlays — ensure text legibility */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.28) 40%, rgba(0,0,0,0.72) 100%)',
        }}
      />
      {/* Side fades */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(to right, rgba(0,0,0,0.35) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.35) 100%)',
        }}
      />

      {/* Top corner labels */}
      <motion.div
        className="absolute top-28 left-8 z-10 hidden md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        <span className="text-xs text-white/35 tracking-[0.2em] uppercase">M.S. Computer Science</span>
      </motion.div>
      <motion.div
        className="absolute top-28 right-8 z-10 hidden md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        <span className="text-xs text-white/35 tracking-[0.2em] uppercase">Stevens Institute · Hoboken, NJ</span>
      </motion.div>

      {/* Bottom split content — Verta-style */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-8 md:px-12 pb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-10">

        {/* Left — headline */}
        <motion.div
          style={{ rotateX, rotateY, perspective: '1100px', transformStyle: 'preserve-3d' }}
          className="flex-1 max-w-2xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.55 }}
            className="flex items-center gap-2 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            <span className="text-xs font-bold text-white/60 tracking-widest uppercase">
              Open to Opportunities
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 44 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-black text-white leading-[0.9] tracking-tight"
            style={{ fontSize: 'clamp(2.8rem, 7vw, 6.5rem)' }}
          >
            Engineering
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #00d4ff 0%, #a855f7 55%, #ff6b6b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'inline-block',
              }}
            >
              Intelligent
            </span>
            <br />
            Systems.
          </motion.h1>
        </motion.div>

        {/* Right — description + CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.65 }}
          className="flex-shrink-0 max-w-sm"
        >
          <p className="text-sm md:text-base text-white/65 leading-relaxed mb-7">
            Machine Learning and Data Engineering, building production AI systems from
            {' '}<span style={{ color: '#00d4ff' }} className="font-medium">GAN research</span>{' '}
            to{' '}
            <span style={{ color: '#a855f7' }} className="font-medium">cloud-scale deployment</span>.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/projects">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="liquid-btn flex items-center gap-2 px-6 py-3 text-sm font-bold"
              >
                View Projects
                <ArrowRight size={16} />
              </motion.button>
            </Link>

            <Link href="/about">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-all"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.18)',
                }}
              >
                About Me
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>

    </section>
  )
}
