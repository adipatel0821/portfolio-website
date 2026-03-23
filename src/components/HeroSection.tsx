'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const springX = useSpring(rawX, { stiffness: 50, damping: 25 })
  const springY = useSpring(rawY, { stiffness: 50, damping: 25 })
  const rotateY = useTransform(springX, [-0.5, 0.5], ['-5deg', '5deg'])
  const rotateX = useTransform(springY, [-0.5, 0.5], ['3deg', '-3deg'])

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const { left, top, width, height } = containerRef.current.getBoundingClientRect()
    rawX.set((e.clientX - left) / width - 0.5)
    rawY.set((e.clientY - top) / height - 0.5)
  }

  const onMouseLeave = () => { rawX.set(0); rawY.set(0) }

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen overflow-hidden"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Centered vignette so text floats on canvas */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 85% 75% at 38% 55%, rgba(6,10,20,0.68) 0%, rgba(6,10,20,0.28) 58%, transparent 100%)',
        }}
      />

      {/* Floating edge labels */}
      <motion.div
        className="absolute left-8 md:left-12 z-10 hidden md:block"
        style={{ top: '44%' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1.2 }}
      >
        <span className="text-[11px] text-white/20 tracking-[0.24em] uppercase">
          Build fast. Deploy smart.
        </span>
      </motion.div>
      <motion.div
        className="absolute right-8 md:right-12 z-10 hidden md:block"
        style={{ top: '44%' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1.2 }}
      >
        <span className="text-[11px] text-white/20 tracking-[0.24em] uppercase">
          Scale with purpose.
        </span>
      </motion.div>

      {/* Main content — vertically centered in viewport */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center px-8 md:px-14 pt-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10 md:gap-12 max-w-7xl mx-auto w-full">

          {/* Left — badge + headline with 3D tilt */}
          <motion.div
            className="flex-1 max-w-[680px]"
            style={{ rotateX, rotateY, perspective: '1200px', transformStyle: 'preserve-3d' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.55 }}
              className="flex items-center gap-2 mb-5"
            >
              <span
                className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
                style={{ boxShadow: '0 0 8px #34d399' }}
              />
              <span className="text-[11px] font-semibold text-white/45 tracking-[0.26em] uppercase">
                Open to Opportunities
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="font-display font-black text-white leading-[0.88] tracking-tight"
              style={{ fontSize: 'clamp(3.4rem, 8.5vw, 8rem)' }}
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
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.65 }}
            className="flex-shrink-0 md:max-w-[300px] lg:max-w-[340px]"
          >
            <p className="text-sm md:text-[15px] text-white/55 leading-relaxed mb-8">
              Machine learning and data engineering, building production AI systems
              from{' '}
              <span className="text-white/90 font-medium">GAN research</span>{' '}
              to{' '}
              <span className="text-white/90 font-medium">cloud-scale deployment</span>.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/projects">
                <motion.button
                  whileHover={{ scale: 1.05 }}
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
                  className="px-6 py-3 text-sm font-semibold text-white/60 hover:text-white/90 transition-colors"
                >
                  About Me
                </motion.button>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
