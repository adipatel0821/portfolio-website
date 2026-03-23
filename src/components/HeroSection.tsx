'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import NYCSkyline from './NYCSkyline'

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const springX = useSpring(rawX, { stiffness: 50, damping: 25 })
  const springY = useSpring(rawY, { stiffness: 50, damping: 25 })
  const rotateY = useTransform(springX, [-0.5, 0.5], ['-6deg', '6deg'])
  const rotateX = useTransform(springY, [-0.5, 0.5], ['4deg', '-4deg'])
  const parallaxX = useTransform(springX, [-0.5, 0.5], [16, -16])
  const parallaxY = useTransform(springY, [-0.5, 0.5], [10, -10])
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
      className="relative min-h-screen overflow-hidden"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Background with parallax */}
      <motion.div className="absolute inset-0" style={{ x: px, y: py }}>
        <motion.div
          className="absolute"
          style={{ inset: '-5%' }}
          initial={{ scale: 1 }}
          animate={{ scale: 1.08 }}
          transition={{ duration: 28, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
        >
          <div className="w-full h-full relative">
            <NYCSkyline />
          </div>
        </motion.div>
      </motion.div>

      {/* Gradient overlays for text legibility */}
      <div
        className="absolute inset-0 z-[1]"
        style={{ background: 'linear-gradient(to bottom, rgba(8,18,28,0.5) 0%, rgba(8,18,28,0.1) 45%, rgba(8,18,28,0.7) 100%)' }}
      />

      {/* Mid-screen floating labels — Verta style */}
      <motion.div
        className="absolute left-8 md:left-12 z-10 hidden md:block"
        style={{ top: '42%' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
      >
        <span className="text-[11px] text-white/30 tracking-[0.22em] uppercase">
          Build fast. Deploy smart.
        </span>
      </motion.div>
      <motion.div
        className="absolute right-8 md:right-12 z-10 hidden md:block"
        style={{ top: '42%' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
      >
        <span className="text-[11px] text-white/30 tracking-[0.22em] uppercase">
          Scale with purpose.
        </span>
      </motion.div>

      {/* Bottom split — headline left, description right */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-8 md:px-14 pb-14 md:pb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8">

        {/* Left — big headline */}
        <motion.div
          className="flex-1 max-w-2xl"
          style={{ rotateX, rotateY, perspective: '1200px', transformStyle: 'preserve-3d' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="flex items-center gap-2 mb-5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: '0 0 6px #34d399' }} />
            <span className="text-[11px] font-semibold text-white/50 tracking-[0.25em] uppercase">
              Open to Opportunities
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-black text-white leading-[0.88] tracking-tight"
            style={{ fontSize: 'clamp(3rem, 7.5vw, 7rem)' }}
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
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.65 }}
          className="flex-shrink-0 md:max-w-xs lg:max-w-sm"
        >
          <p className="text-sm md:text-[15px] text-white/60 leading-relaxed mb-7">
            Machine learning gets research done. Intelligence at scale moves careers forward.
            I build production AI systems from{' '}
            <span className="text-white/90 font-medium">GAN research</span>{' '}
            to{' '}
            <span className="text-white/90 font-medium">cloud deployment</span>.
          </p>

          <div className="flex items-center gap-3">
            <Link href="/projects">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="liquid-btn flex items-center gap-2 px-6 py-3 text-sm font-bold"
              >
                View Projects
                <ArrowRight size={15} />
              </motion.button>
            </Link>

            <Link href="/about">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 text-sm font-semibold text-white/70 hover:text-white transition-colors"
              >
                See my story
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
