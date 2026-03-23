import SubwayTimeline from '@/components/SubwayTimeline'
import ScrollReveal from '@/components/ScrollReveal'
import BrainParticleCanvas from '@/components/animations/BrainParticleCanvas'
import { GraduationCap, MapPin, Users, Cpu } from 'lucide-react'

const techStack = [
  { category: 'Languages',       skills: ['Python', 'C#', 'C / C++'] },
  { category: 'AI / ML',         skills: ['PyTorch', 'TensorFlow', 'Scikit-learn', 'GANs', 'LLMs'] },
  { category: 'Data Engineering', skills: ['Apache Airflow', 'Pandas', 'NumPy', 'PostgreSQL', 'DynamoDB'] },
  { category: 'Cloud & Infra',   skills: ['AWS SageMaker', 'GCP Vertex AI', 'Docker', 'REST APIs'] },
  { category: 'Visualization',   skills: ['Power BI'] },
  { category: 'Hardware & IoT',  skills: ['Arduino', 'Raspberry Pi'] },
  { category: 'Web',             skills: ['ASP.NET MVC', 'Next.js', 'TypeScript'] },
  { category: 'DevOps',          skills: ['Git / CI-CD'] },
]

const highlights = [
  { icon: GraduationCap, title: 'Stevens Institute',  sub: 'M.S. CS · Hoboken, NJ · 2025–2027',        color: '#00d4ff' },
  { icon: GraduationCap, title: 'VIT Chennai',        sub: 'B.Tech CS&E · GPA 3.2/4.0 · 2021–2025',    color: '#a855f7' },
  { icon: MapPin,        title: 'Hoboken, NJ',        sub: 'Open to remote · hybrid · in-person',       color: '#f59e0b' },
  { icon: Users,         title: '3 Internships',      sub: 'Data Eng · Web Dev · IoT Engineering',      color: '#10b981' },
  { icon: Cpu,           title: 'ML / Data Engineer', sub: 'PyTorch · TensorFlow · AWS SageMaker',      color: '#ef4444' },
]

const interests = [
  'Machine Learning', 'Generative AI', 'Data Engineering', 'Distributed Systems',
  'Cloud Architecture', 'IoT & Embedded Systems', 'Healthcare AI', 'Open Source',
  'Cricket', 'Photography', 'Specialty Coffee', 'Hiking',
]

const values = [
  {
    num: '01',
    title: 'Ship Fast, Iterate Faster',
    desc: 'Perfect is the enemy of shipped. I believe in putting imperfect things into the world, learning from real users, and iterating relentlessly.',
    color: '#00d4ff',
  },
  {
    num: '02',
    title: 'Depth Over Breadth',
    desc: 'Going deep on what matters most. Understanding systems at a fundamental level is the only path to building solutions that last.',
    color: '#a855f7',
  },
  {
    num: '03',
    title: 'Users First, Always',
    desc: 'Technology is a means to an end. The best products make complex things feel effortless, with invisible infrastructure and a delightful surface.',
    color: '#10b981',
  },
]

export default function AboutPage() {
  return (
    <>
      <BrainParticleCanvas />
      {/* Header */}
      <div className="pt-36 pb-18 page-section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container-xl">
          <ScrollReveal>
            <p className="section-label mb-3">About Me</p>
            <h1 className="section-heading mb-6" style={{ fontSize: 'clamp(2.8rem, 7vw, 6rem)' }}>
              Engineer.
              <br />
              Researcher.
              <br />
              <span className="gradient-text">Builder.</span>
            </h1>
            <div className="accent-line" />
          </ScrollReveal>
        </div>
      </div>

      {/* Bio */}
      <section className="page-section" style={{ background: 'var(--bg-primary)' }}>
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
            {/* Left — narrative */}
            <ScrollReveal direction="left">
              <div className="space-y-5">
                <p
                  className="text-lg md:text-xl font-semibold leading-relaxed"
                  style={{ color: 'var(--text-primary)' }}
                >
                  I&apos;m Aditya Patel, a Machine Learning and Data Engineer pursuing my M.S. in
                  Computer Science at Stevens Institute of Technology, Hoboken NJ.
                </p>
                <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  I completed my B.Tech in Computer Science &amp; Engineering at VIT Chennai in 2025,
                  where I built a strong foundation in algorithms, systems, and applied AI. Three industry
                  internships gave me real-world depth, from ETL pipelines at Intellect Design Arena to
                  IoT systems at Intuz and full-stack web development at Appuno IT Solutions.
                </p>
                <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  My core interest is building production-grade AI systems, particularly generative models
                  and distributed data pipelines. I&apos;ve deployed multimodal GANs on GCP Vertex AI,
                  built the SynMedix AI platform (50K+ synthetic patient records) on AWS SageMaker, and
                  engineered automated ETL workflows using Apache Airflow.
                </p>
                <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Currently focused on graduate research and seeking ML engineering or data engineering
                  roles. If you&apos;re building something meaningful with AI or large-scale data, I want to talk.
                </p>
              </div>
            </ScrollReveal>

            {/* Right — highlights + interests */}
            <ScrollReveal direction="right">
              <div className="grid grid-cols-1 gap-3 mb-6">
                {highlights.map((h) => (
                  <div
                    key={h.title}
                    className="glass-card flex items-center gap-4 p-4"
                    style={{ borderRadius: 18, borderColor: `${h.color}22` }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${h.color}16`, color: h.color }}
                    >
                      <h.icon size={19} />
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {h.title}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {h.sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Interests */}
              <div className="glass-card p-6" style={{ borderRadius: 20 }}>
                <p className="section-label mb-4">Interests &amp; Passions</p>
                <div className="flex flex-wrap gap-2">
                  {interests.map((i) => (
                    <span key={i} className="tech-chip">{i}</span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="page-section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container-xl">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="section-label mb-3">Tools of the Trade</p>
              <h2 className="section-heading text-4xl md:text-5xl mb-4">Tech Stack</h2>
              <div className="accent-line mx-auto" />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {techStack.map((group, i) => (
              <ScrollReveal key={group.category} delay={i * 0.07}>
                <div className="glass-card p-5 h-full" style={{ borderRadius: 18 }}>
                  <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--accent-primary)' }}>
                    {group.category}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.skills.map((skill) => (
                      <span key={skill} className="tech-chip">{skill}</span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Subway Timeline */}
      <section className="page-section" style={{ background: 'var(--bg-primary)' }}>
        <div className="container-xl">
          <SubwayTimeline />
        </div>
      </section>

      {/* Values */}
      <section className="page-section" style={{ background: 'var(--bg-primary)' }}>
        <div className="container-xl">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="section-label mb-3">How I Work</p>
              <h2 className="section-heading text-4xl md:text-5xl mb-4">My Values</h2>
              <div className="accent-line mx-auto" />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {values.map((v, i) => (
              <ScrollReveal key={v.num} delay={i * 0.12}>
                <div className="glass-card p-7 h-full" style={{ borderRadius: 22 }}>
                  <span
                    className="font-display font-black text-5xl block mb-4 leading-none"
                    style={{ color: v.color, opacity: 0.18 }}
                  >
                    {v.num}
                  </span>
                  <h3 className="font-display font-bold text-lg mb-3" style={{ color: 'var(--text-primary)' }}>
                    {v.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {v.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-10 border-t text-center text-xs"
        style={{ background: 'var(--bg-primary)', borderColor: 'var(--divider)', color: 'var(--text-muted)' }}
      >
        <p>
          Designed &amp; built by{' '}
          <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>Aditya Patel</span>
          {' '}in Hoboken, NJ · {new Date().getFullYear()}
        </p>
      </footer>
    </>
  )
}
