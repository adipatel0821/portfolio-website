'use client'

import { useRef } from 'react'
import Link from 'next/link'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import { ArrowRight, Sparkles, ChevronDown } from 'lucide-react'
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

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-24">
        {/* Available badge */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.65 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-10"
          style={{
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
          <span className="text-xs font-bold text-white/80 tracking-widest uppercase">
            Open to Opportunities · Hoboken, NJ
          </span>
        </motion.div>

        {/* 3D interactive headline */}
        <motion.div
          style={{ rotateX, rotateY, perspective: '1100px', transformStyle: 'preserve-3d' }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 44 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-black text-white leading-[0.93] tracking-tight"
            style={{ fontSize: 'clamp(3rem, 8.5vw, 7.5rem)' }}
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
            Systems
          </motion.h1>
        </motion.div>

        {/* Animated underline */}
        <motion.div
          className="flex justify-center mt-5 mb-8"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 1.15, duration: 0.75, ease: 'easeOut' }}
        >
          <div
            className="h-1 w-44 rounded-full"
            style={{ background: 'linear-gradient(90deg, #00d4ff, #a855f7, #ff6b6b)' }}
          />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.78, duration: 0.65 }}
          className="text-base md:text-xl text-white/70 max-w-2xl mx-auto mb-10 font-light leading-relaxed"
        >
          M.S. CS at Stevens Institute · Machine Learning &amp; Data Engineering —
          building production AI systems from{' '}
          <span style={{ color: '#00d4ff' }} className="font-medium">GAN research</span>{' '}
          to{' '}
          <span style={{ color: '#a855f7' }} className="font-medium">cloud-scale deployment</span>.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.98, duration: 0.65 }}
          className="flex items-center justify-center gap-4 flex-wrap"
        >
          <Link href="/projects">
            <motion.button
              whileHover={{ scale: 1.06, boxShadow: '0 0 50px rgba(0,212,255,0.4)' }}
              whileTap={{ scale: 0.97 }}
              className="liquid-btn flex items-center gap-2.5 px-8 py-4 text-base md:text-lg shadow-2xl"
            >
              <Sparkles size={18} />
              Let&apos;s Build
              <ArrowRight size={18} />
            </motion.button>
          </Link>

          <Link href="/about">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-8 py-4 rounded-full text-base md:text-lg font-bold text-white transition-all"
              style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              My Story
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <span className="text-[10px] font-bold text-white/35 tracking-[0.25em] uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 9, 0] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={20} className="text-white/35" />
        </motion.div>
      </motion.div>
    </section>
  )
}
