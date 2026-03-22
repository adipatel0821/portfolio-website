import HeroSection from '@/components/HeroSection'
import QuickStats from '@/components/QuickStats'
import TechMarquee from '@/components/TechMarquee'
import ScrollReveal from '@/components/ScrollReveal'
import Link from 'next/link'
import { ArrowRight, Code2, Rocket, Zap, Globe } from 'lucide-react'

const services = [
  {
    icon: Zap,
    title: 'Machine Learning & AI',
    desc: 'GANs, LLMs, PyTorch, TensorFlow — from research prototype to production inference on AWS SageMaker & GCP Vertex AI.',
    color: '#00d4ff',
  },
  {
    icon: Code2,
    title: 'Data Engineering',
    desc: 'End-to-end ETL pipelines with Apache Airflow, SQL/NoSQL databases, and automated data quality workflows.',
    color: '#a855f7',
  },
  {
    icon: Globe,
    title: 'Full-Stack Development',
    desc: 'REST APIs with ASP.NET MVC & C#, responsive web apps, and scalable backend architecture.',
    color: '#f59e0b',
  },
  {
    icon: Rocket,
    title: 'IoT & Embedded Systems',
    desc: 'Arduino, Raspberry Pi sensor integration, real-time data aggregation, and edge computing solutions.',
    color: '#10b981',
  },
]

export default function HomePage() {
  return (
    <>
      {/* Hero — full-screen with Ken Burns + parallax */}
      <HeroSection />

      {/* Quick Stats bar */}
      <QuickStats />

      {/* What I Do */}
      <section className="page-section" style={{ background: 'var(--bg-primary)' }}>
        <div className="container-xl">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="section-label mb-3">What I Do</p>
              <h2 className="section-heading text-4xl md:text-5xl mb-4">
                Where I Create
                <br />
                <span className="gradient-text">Real Impact</span>
              </h2>
              <div className="accent-line mx-auto" />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((s, i) => (
              <ScrollReveal key={s.title} delay={i * 0.09} direction="up">
                <div className="glass-card p-6 h-full" style={{ borderRadius: 20 }}>
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: `${s.color}18`, color: s.color }}
                  >
                    <s.icon size={22} />
                  </div>
                  <h3
                    className="font-display font-bold text-base mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {s.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {s.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Marquee */}
      <TechMarquee />

      {/* Stats row */}
      <section className="page-section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '3',    label: 'Industry Internships', sub: 'Data Eng · Web Dev · IoT' },
              { num: '5+',   label: 'Projects Built',        sub: 'AI, ETL, IoT & Web platforms' },
              { num: '2',    label: 'Cloud Deployments',     sub: 'AWS SageMaker & GCP Vertex AI' },
              { num: '50K+', label: 'Synthetic Records',     sub: 'SynMedix AI platform' },
            ].map((stat, i) => (
              <ScrollReveal key={stat.label} delay={i * 0.1} direction="scale">
                <div className="glass-card p-6 text-center" style={{ borderRadius: 20 }}>
                  <div className="stat-num text-4xl md:text-5xl mb-2">{stat.num}</div>
                  <p
                    className="font-display font-bold text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {stat.label}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {stat.sub}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="page-section" style={{ background: 'var(--bg-primary)' }}>
        <div className="container-xl">
          <ScrollReveal direction="scale">
            <div
              className="glass-card text-center py-20 px-8"
              style={{
                borderRadius: 30,
                background:
                  'linear-gradient(135deg, rgba(0,212,255,0.06) 0%, rgba(168,85,247,0.06) 50%, rgba(0,212,255,0.06) 100%)',
              }}
            >
              <p className="section-label mb-4">Ready to collaborate?</p>
              <h2 className="section-heading text-4xl md:text-6xl mb-6">
                Let&apos;s build something
                <br />
                <span className="gradient-text">extraordinary</span>
              </h2>
              <p
                className="text-base max-w-xl mx-auto mb-10"
                style={{ color: 'var(--text-secondary)' }}
              >
                I&apos;m always open to discussing ambitious projects, creative ideas, or opportunities
                to be part of a world-class team.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Link href="/contact">
                  <button className="liquid-btn flex items-center gap-2 px-8 py-4 text-base font-bold shadow-xl">
                    Get in Touch
                    <ArrowRight size={18} />
                  </button>
                </Link>
                <Link href="/projects">
                  <button
                    className="flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-full transition-all hover:scale-105"
                    style={{
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    View Projects
                    <ArrowRight size={18} />
                  </button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-10 border-t text-center text-xs"
        style={{
          background: 'var(--bg-primary)',
          borderColor: 'var(--divider)',
          color: 'var(--text-muted)',
        }}
      >
        <p>
          Designed &amp; built by{' '}
          <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>
            Aditya Patel
          </span>{' '}
          in Hoboken, NJ · {new Date().getFullYear()}
        </p>
        <p className="mt-1 opacity-60">
          Next.js 14 · Tailwind CSS · Framer Motion · TypeScript
        </p>
      </footer>
    </>
  )
}
