'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Linkedin, Github, Mail, Copy, Check, MapPin, Clock } from 'lucide-react'

const EMAIL = 'adityapatel280104@gmail.com'

const socials = [
  {
    icon: Linkedin,
    label: 'LinkedIn',
    handle: '/in/adityapatel0821',
    sub: 'Connect professionally',
    href: 'https://linkedin.com/in/adityapatel0821',
    color: '#0A66C2',
  },
  {
    icon: Github,
    label: 'GitHub',
    handle: 'adityapatel0821',
    sub: 'Open source & projects',
    href: 'https://github.com/adityapatel0821',
    color: '#ffffff',
  },
]

export default function ContactInfo() {
  const [copied, setCopied] = useState(false)

  const copyEmail = () => {
    navigator.clipboard.writeText(EMAIL).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    })
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div>
        <p className="section-label mb-2">Direct Line</p>
        <h2 className="section-heading text-4xl md:text-5xl mb-4">
          Let&apos;s Start a<br />
          <span className="gradient-text">Conversation</span>
        </h2>
        <div className="accent-line" />
        <p className="mt-4 text-sm leading-relaxed max-w-sm" style={{ color: 'var(--text-secondary)' }}>
          I read every message personally and respond within 24 hours.
          Prefer direct? Find me anywhere below.
        </p>
      </div>

      {/* Availability */}
      <div
        className="glass flex items-center gap-3 px-5 py-4 rounded-2xl"
        style={{ border: '1px solid rgba(52,211,153,0.3)' }}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse flex-shrink-0" />
        <div>
          <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
            Currently Available
          </p>
          <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <Clock size={10} />
            Replies within 24h · EST timezone
          </p>
        </div>
      </div>

      {/* Location */}
      <div
        className="glass flex items-center gap-3 px-5 py-4 rounded-2xl"
        style={{ border: '1px solid var(--glass-border)' }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--accent-glow)', color: 'var(--accent-primary)' }}
        >
          <MapPin size={17} />
        </div>
        <div>
          <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
            Hoboken, NJ
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Open to remote · hybrid · in-person
          </p>
        </div>
      </div>

      {/* Email copy */}
      <button
        onClick={copyEmail}
        className="glass flex items-center gap-3 px-5 py-4 rounded-2xl text-left transition-all hover:scale-[1.02] group"
        style={{
          border: '1px solid var(--input-border)',
          cursor: 'pointer',
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--accent-glow)', color: 'var(--accent-primary)' }}
        >
          <Mail size={17} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
            {EMAIL}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Click to copy
          </p>
        </div>
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.div
              key="check"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 320 }}
            >
              <Check size={18} className="text-emerald-400 flex-shrink-0" />
            </motion.div>
          ) : (
            <motion.div key="copy" initial={{ scale: 1 }} exit={{ scale: 0 }}>
              <Copy size={16} className="flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-muted)' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Social links */}
      <div className="space-y-3">
        {socials.map(({ icon: Icon, label, handle, sub, href, color }, i) => (
          <motion.a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.02, x: 4 }}
            className="glass flex items-center gap-4 px-5 py-4 rounded-2xl group"
            style={{ border: `1px solid ${color}20` }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
              style={{ background: `${color}18`, color }}
            >
              <Icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                {label}
              </p>
              <p className="font-mono text-xs font-medium" style={{ color }}>
                {handle}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {sub}
              </p>
            </div>
            <motion.div
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color }}
            >
              →
            </motion.div>
          </motion.a>
        ))}
      </div>
    </div>
  )
}
