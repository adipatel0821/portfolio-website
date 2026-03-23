import ProjectCard from '@/components/ProjectCard'
import ScrollReveal from '@/components/ScrollReveal'
import DataStreamCanvas from '@/components/animations/DataStreamCanvas'
import { projects } from '@/data/projects'

export default function ProjectsPage() {
  return (
    <>
      <DataStreamCanvas />
      {/* Header */}
      <div className="pt-36 page-section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container-xl">
          <ScrollReveal>
            <p className="section-label mb-3">My Work</p>
            <h1 className="section-heading mb-6" style={{ fontSize: 'clamp(2.8rem, 7vw, 6rem)' }}>
              Projects that
              <br />
              <span className="gradient-text">ship &amp; scale.</span>
            </h1>
            <div className="accent-line" />
            <p className="mt-6 text-base max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
              A curated selection of products, startups, and experiments I&apos;ve built.
              Click any card to dive into the Founder&apos;s Vision and full story.
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* Grid */}
      <section className="page-section" style={{ background: 'var(--bg-primary)' }}>
        <div className="container-xl">
          {/* Category filters (static UI) */}
          <ScrollReveal>
            <div className="flex flex-wrap items-center gap-2.5 mb-12">
              {['All', 'Startup', 'SaaS', 'AI/ML', 'Mobile', 'Hackathon Winner', 'Marketplace'].map(
                (cat, i) => (
                  <button
                    key={cat}
                    className="text-xs font-bold px-4 py-2 rounded-full transition-all hover:scale-105"
                    style={{
                      background: i === 0 ? 'var(--accent-primary)' : 'var(--glass-bg)',
                      border: i === 0 ? 'none' : '1px solid var(--glass-border)',
                      color: i === 0 ? 'white' : 'var(--text-secondary)',
                    }}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </ScrollReveal>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, i) => (
              <ScrollReveal key={project.id} delay={i * 0.08} direction="up">
                <div className="h-full">
                  <ProjectCard p={project} />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Open source banner */}
      <section className="py-20" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container-xl">
          <ScrollReveal direction="scale">
            <div className="glass-card text-center py-16 px-8" style={{ borderRadius: 28 }}>
              <p className="section-label mb-3">Open Source</p>
              <h2 className="section-heading text-3xl md:text-5xl mb-4">
                I build in public
              </h2>
              <p className="text-base max-w-lg mx-auto mb-8" style={{ color: 'var(--text-secondary)' }}>
                Most of my work is open source. Find me on GitHub where I contribute to projects,
                share experiments, and document everything I learn.
              </p>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="liquid-btn inline-flex items-center gap-2 px-8 py-4 text-base font-bold"
              >
                View GitHub →
              </a>
            </div>
          </ScrollReveal>
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
