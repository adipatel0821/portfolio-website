'use client'

import { motion } from 'framer-motion'
import { Code2, MapPin, Brain, Rocket, Trophy } from 'lucide-react'
import ScrollReveal from './ScrollReveal'

const stats = [
  { icon: Code2,  value: '4+ Years',      label: 'CS Experience',    color: '#00d4ff' },
  { icon: MapPin, value: 'Hoboken, NJ',   label: 'Stevens Institute', color: '#a855f7' },
  { icon: Brain,  value: 'ML / Data Eng', label: 'Core Focus',        color: '#f59e0b' },
  { icon: Rocket, value: '3 Internships', label: 'Industry Experience',color: '#10b981' },
  { icon: Trophy, value: '5+ Projects',   label: 'Built & Deployed',  color: '#f43f5e' },
]

export default function QuickStats() {
  return (
    <section
      className="py-14 relative overflow-hidden"
      style={{ background: 'var(--bg-secondary)' }}
    >
      {/* Subtle line top */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, var(--glass-border), transparent)' }}
      />

      <div className="container-xl">
        <ScrollReveal>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                whileHover={{ scale: 1.06, y: -3 }}
                className="glass flex items-center gap-3 px-5 py-3.5 rounded-2xl cursor-default"
                style={{ border: `1px solid ${s.color}28` }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${s.color}18`, color: s.color }}
                >
                  <s.icon size={17} />
                </div>
                <div className="text-left leading-tight">
                  <p
                    className="font-display font-black text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {s.value}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {s.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      </div>

      {/* Subtle line bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, var(--glass-border), transparent)' }}
      />
    </section>
  )
}
