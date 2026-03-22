'use client'

import { motion } from 'framer-motion'
import ScrollReveal from './ScrollReveal'

const techStack = [
  { name: 'Python',          color: '#FFD43B' },
  { name: 'C#',              color: '#9B4F96' },
  { name: 'C / C++',         color: '#00599C' },
  { name: 'Apache Airflow',  color: '#017CEE' },
  { name: 'Pandas',          color: '#150458' },
  { name: 'NumPy',           color: '#4DABCF' },
  { name: 'Power BI',        color: '#F2C811' },
  { name: 'Scikit-learn',    color: '#F7931E' },
  { name: 'PyTorch',         color: '#EE4C2C' },
  { name: 'TensorFlow',      color: '#FF6F00' },
  { name: 'GANs',            color: '#a855f7' },
  { name: 'LLMs',            color: '#00d4ff' },
  { name: 'AWS SageMaker',   color: '#FF9900' },
  { name: 'GCP Vertex AI',   color: '#4285F4' },
  { name: 'Docker',          color: '#2496ED' },
  { name: 'PostgreSQL',      color: '#336791' },
  { name: 'DynamoDB',        color: '#FF9900' },
  { name: 'ASP.NET MVC',     color: '#512BD4' },
  { name: 'REST APIs',       color: '#10b981' },
  { name: 'Arduino',         color: '#00979D' },
  { name: 'Raspberry Pi',    color: '#A22846' },
  { name: 'Git / CI·CD',     color: '#F05032' },
]

// Duplicate for seamless loop
const row1 = [...techStack, ...techStack]
const row2 = [...techStack.slice(6), ...techStack.slice(6)]

function TechPill({ name, color }: { name: string; color: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.08, y: -2 }}
      className="flex items-center gap-2 px-5 py-2.5 rounded-full mx-2.5 flex-shrink-0 cursor-default select-none"
      style={{
        background: 'var(--glass-bg)',
        border: `1px solid ${color}30`,
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Glowing dot */}
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{
          background: color,
          boxShadow: `0 0 8px ${color}, 0 0 16px ${color}60`,
        }}
      />
      <span
        className="text-sm font-bold whitespace-nowrap"
        style={{ color: 'var(--text-secondary)' }}
      >
        {name}
      </span>
    </motion.div>
  )
}

export default function TechMarquee() {
  return (
    <section className="page-section" style={{ background: 'var(--bg-primary)' }}>
      <div className="container-xl mb-12">
        <ScrollReveal>
          <div className="text-center">
            <p className="section-label mb-3">Tools of the Trade</p>
            <h2 className="section-heading text-4xl md:text-5xl mb-4">
              My Tech Stack
            </h2>
            <div className="accent-line mx-auto" />
            <p className="mt-4 text-sm max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Technologies I use daily to ship robust, scalable, and beautiful products.
            </p>
          </div>
        </ScrollReveal>
      </div>

      {/* Row 1 — left */}
      <div className="marquee-wrapper mb-4">
        <div className="marquee-track py-2">
          {row1.map((t, i) => (
            <TechPill key={`r1-${i}`} name={t.name} color={t.color} />
          ))}
        </div>
      </div>

      {/* Row 2 — right (reverse) */}
      <div className="marquee-wrapper">
        <div className="marquee-track-reverse py-2">
          {row2.map((t, i) => (
            <TechPill key={`r2-${i}`} name={t.name} color={t.color} />
          ))}
        </div>
      </div>
    </section>
  )
}
