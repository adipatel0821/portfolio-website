'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Github, ExternalLink, X, Eye, Lightbulb } from 'lucide-react'

export interface Project {
  id: string
  title: string
  tagline: string
  description: string
  vision: string
  tech: string[]
  color: string
  accent: string
  github?: string
  live?: string
  category: string
  year: string
  impact?: string
}

export default function ProjectCard({ p }: { p: Project }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      {/* ── Card ── */}
      <motion.div
        layoutId={`card-${p.id}`}
        onClick={() => setExpanded(true)}
        whileHover={{
          y: -7,
          boxShadow: `0 0 50px ${p.color}28, 0 24px 60px rgba(0,0,0,0.35)`,
          borderColor: p.color,
        }}
        className="glass-card cursor-pointer overflow-hidden h-full flex flex-col select-none"
        style={{ borderRadius: 22 }}
      >
        {/* Color bar */}
        <motion.div
          layoutId={`bar-${p.id}`}
          className="h-1.5"
          style={{ background: `linear-gradient(90deg, ${p.color}, ${p.accent})` }}
        />

        <div className="p-6 flex flex-col flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <span className="tech-chip mb-2 inline-block">{p.category}</span>
              <motion.h3
                layoutId={`title-${p.id}`}
                className="font-display font-bold text-xl leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {p.title}
              </motion.h3>
            </div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ml-3 transition-transform group-hover:rotate-12"
              style={{ background: `${p.color}18`, color: p.color }}
            >
              <Eye size={17} />
            </div>
          </div>

          {/* Tagline */}
          <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: 'var(--text-secondary)' }}>
            {p.tagline}
          </p>

          {/* Founder's Vision teaser — slides in on hover */}
          <AnimatePresence>
            <motion.div
              initial={false}
              animate={{ height: 'auto' }}
              className="overflow-hidden"
            >
              <div
                className="pt-3 pb-2 border-t mb-3"
                style={{ borderColor: `${p.color}28` }}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Lightbulb size={11} style={{ color: p.color }} />
                  <span
                    className="text-[10px] font-black uppercase tracking-widest"
                    style={{ color: p.color }}
                  >
                    Vision
                  </span>
                </div>
                <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                  {p.vision}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Tech chips */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {p.tech.map((t) => (
              <span key={t} className="tech-chip">{t}</span>
            ))}
          </div>

          {/* Links + year */}
          <div className="flex items-center gap-3 mt-auto">
            {p.github && (
              <a
                href={p.github}
                onClick={(e) => e.stopPropagation()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold transition-colors hover:opacity-80"
                style={{ color: 'var(--text-muted)' }}
              >
                <Github size={13} />Code
              </a>
            )}
            {p.live && (
              <a
                href={p.live}
                onClick={(e) => e.stopPropagation()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold transition-colors hover:opacity-80"
                style={{ color: 'var(--text-muted)' }}
              >
                <ExternalLink size={13} />Live
              </a>
            )}
            <span className="ml-auto text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              {p.year}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Expanded Modal ── */}
      <AnimatePresence>
        {expanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpanded(false)}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
              <motion.div
                layoutId={`card-${p.id}`}
                className="w-full max-w-2xl overflow-hidden"
                style={{
                  background: 'var(--glass-bg-heavy)',
                  backdropFilter: 'blur(36px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(36px) saturate(200%)',
                  border: `1px solid ${p.color}35`,
                  borderRadius: 26,
                  boxShadow: `0 40px 100px rgba(0,0,0,0.55), 0 0 60px ${p.color}18`,
                }}
              >
                {/* Bar */}
                <motion.div
                  layoutId={`bar-${p.id}`}
                  className="h-2"
                  style={{ background: `linear-gradient(90deg, ${p.color}, ${p.accent})` }}
                />

                <div className="p-8">
                  {/* Title row */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <span className="tech-chip mb-2 inline-block">{p.category}</span>
                      <motion.h2
                        layoutId={`title-${p.id}`}
                        className="font-display font-black text-3xl"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {p.title}
                      </motion.h2>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={() => setExpanded(false)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center ml-4 flex-shrink-0"
                      style={{ background: 'var(--glass-bg)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)' }}
                    >
                      <X size={17} />
                    </motion.button>
                  </div>

                  <p className="text-base font-semibold mb-3" style={{ color: p.color }}>
                    {p.tagline}
                  </p>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
                    {p.description}
                  </p>

                  {/* Vision full */}
                  <div
                    className="rounded-2xl p-5 mb-6"
                    style={{ background: `${p.color}0e`, border: `1px solid ${p.color}22` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb size={15} style={{ color: p.color }} />
                      <span className="text-xs font-black uppercase tracking-widest" style={{ color: p.color }}>
                        Vision
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text-secondary)' }}>
                      &ldquo;{p.vision}&rdquo;
                    </p>
                  </div>

                  {p.impact && (
                    <p className="text-xs font-semibold mb-5" style={{ color: 'var(--text-muted)' }}>
                      📈 {p.impact}
                    </p>
                  )}

                  {/* Tech chips */}
                  <div className="flex flex-wrap gap-2 mb-7">
                    {p.tech.map((t) => (
                      <span
                        key={t}
                        className="tech-chip"
                        style={{ color: p.color, borderColor: `${p.color}40` }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    {p.github && (
                      <a
                        href={p.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
                        style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }}
                      >
                        <Github size={16} />View Code
                      </a>
                    )}
                    {p.live && (
                      <a
                        href={p.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="liquid-btn flex items-center gap-2 px-5 py-3 text-sm font-bold"
                      >
                        <ExternalLink size={16} />Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
