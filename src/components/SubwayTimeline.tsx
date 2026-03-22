'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface Stop {
  year: string
  title: string
  description: string
  badge: string
  color: string
  type: 'education' | 'work' | 'startup' | 'award'
}

const stops: Stop[] = [
  {
    year: 'Sep 2021',
    title: 'B.Tech CS&E · VIT Chennai',
    description:
      'Began B.Tech in Computer Science & Engineering at Vellore Institute of Technology, Chennai. Deep-dived into data structures, algorithms, and systems programming. The foundation that made everything else possible.',
    badge: 'V',
    color: '#00933C',
    type: 'education',
  },
  {
    year: 'Jul 2022',
    title: 'Web Dev Intern · Appuno IT Solutions',
    description:
      'Built full-stack features for the investor marketplace platform using ASP.NET MVC and C#. Designed RESTful APIs, implemented role-based access control, and shipped responsive UI — first real taste of production-grade engineering.',
    badge: 'A',
    color: '#0039A6',
    type: 'work',
  },
  {
    year: 'Aug 2023',
    title: 'IoT Engineering Intern · Intuz Solution',
    description:
      'Engineered SHEMS — a Smart Home Energy Management System using Arduino and Raspberry Pi. Built sensor firmware, local data aggregation, and a real-time monitoring dashboard. Hardware meets software.',
    badge: 'I',
    color: '#B933AD',
    type: 'work',
  },
  {
    year: 'Feb 2025',
    title: 'Data Engineering Intern · Intellect Design Arena',
    description:
      'Designed and shipped the AMFI Mutual Fund ETL pipeline using Apache Airflow and Python. Automated regulatory data ingestion, built Power BI dashboards for stakeholders, and drove measurable reduction in manual data preparation time.',
    badge: 'D',
    color: '#FCCC0A',
    type: 'work',
  },
  {
    year: 'May 2025',
    title: 'Graduated B.Tech · VIT Chennai',
    description:
      'Completed B.Tech in Computer Science & Engineering with a GPA of 3.5/4.0. Four years of systems, algorithms, AI, and building things. Moved to the United States to pursue graduate studies.',
    badge: 'G',
    color: '#A7A9AC',
    type: 'education',
  },
  {
    year: 'May 2025',
    title: 'M.S. Computer Science · Stevens',
    description:
      'Currently pursuing M.S. in Computer Science at Stevens Institute of Technology, Hoboken NJ. Focused on Machine Learning, AI systems, and distributed computing. Building toward production AI at scale.',
    badge: 'S',
    color: '#EE352E',
    type: 'education',
  },
]

const typeLabels: Record<Stop['type'], string> = {
  education: 'Education',
  work:      'Experience',
  startup:   'Startup',
  award:     'Achievement',
}

function Stop({ s, index }: { s: Stop; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px 0px' })
  const isRight = index % 2 === 0

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isRight ? -36 : 36 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.65, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex items-start gap-0"
    >
      {/* Desktop year — left column */}
      <div className="hidden md:flex w-32 items-start justify-end pr-5 pt-1 flex-shrink-0">
        <span className="font-display font-black text-sm tracking-wider" style={{ color: s.color }}>
          {s.year}
        </span>
      </div>

      {/* Station dot + line */}
      <div className="flex flex-col items-center flex-shrink-0">
        {/* Outer glow ring */}
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ delay: index * 0.1 + 0.25, type: 'spring', stiffness: 280, damping: 18 }}
          className="relative z-10"
          style={{ width: 38, height: 38 }}
        >
          {/* Pulsing glow */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ scale: [1, 1.55, 1], opacity: [0.35, 0, 0.35] }}
            transition={{ duration: 2.8, repeat: Infinity, delay: index * 0.4 }}
            style={{ background: s.color }}
          />
          {/* Badge */}
          <div
            className="relative w-full h-full rounded-full flex items-center justify-center font-black text-sm text-white shadow-xl"
            style={{ background: s.color }}
          >
            {s.badge}
          </div>
        </motion.div>

        {/* Connector line */}
        {index < stops.length - 1 && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ delay: index * 0.1 + 0.4, duration: 0.55 }}
            className="w-0.5 flex-1 origin-top"
            style={{ background: s.color, minHeight: 44, opacity: 0.4 }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-12 pl-5 md:pl-6">
        {/* Mobile year */}
        <span className="md:hidden text-xs font-black tracking-widest block mb-1" style={{ color: s.color }}>
          {s.year}
        </span>

        <div
          className="glass-card p-5 hover:border-opacity-100 group"
          style={{ borderColor: `${s.color}22` }}
        >
          {/* Type badge */}
          <span
            className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mb-2"
            style={{ background: `${s.color}18`, color: s.color }}
          >
            {typeLabels[s.type]}
          </span>

          <h3
            className="font-display font-bold text-lg mb-2 leading-snug"
            style={{ color: 'var(--text-primary)' }}
          >
            {s.title}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {s.description}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default function SubwayTimeline() {
  return (
    <div>
      {/* Header */}
      <div className="text-center mb-16">
        <p className="section-label mb-3">Career Journey</p>
        <h2 className="section-heading text-4xl md:text-5xl mb-4">
          My Journey
        </h2>
        <div className="accent-line mx-auto" />
        <p className="mt-4 text-sm max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
          From Chennai to Hoboken — every stop shaped the engineer I am today.
        </p>
      </div>

      {/* Stops */}
      <div className="max-w-2xl mx-auto">
        {stops.map((s, i) => (
          <Stop key={`${s.year}-${i}`} s={s} index={i} />
        ))}
      </div>
    </div>
  )
}
