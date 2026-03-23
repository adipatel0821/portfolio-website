import ContactForm from '@/components/ContactForm'
import ContactInfo from '@/components/ContactInfo'
import ScrollReveal from '@/components/ScrollReveal'
import ParticleOrbitCanvas from '@/components/animations/ParticleOrbitCanvas'

const faqs = [
  {
    q: 'Are you open to internship or full-time roles?',
    a: "Yes, actively seeking ML Engineering, Data Engineering, or SWE roles. Excited about companies building with AI, large-scale data, or cloud infrastructure.",
  },
  {
    q: 'What is your availability?',
    a: "Currently a full-time M.S. student at Stevens (2025–2027). Available for part-time remote roles, research collaborations, and summer internships.",
  },
  {
    q: 'What areas do you specialize in?',
    a: "Machine Learning (GANs, LLMs, PyTorch, TensorFlow), Data Engineering (ETL, Apache Airflow, SQL), cloud deployment (AWS SageMaker, GCP Vertex AI), and full-stack web development.",
  },
  {
    q: "What's your response time?",
    a: 'I check messages daily and reply within 24 hours. Best reached at apatel100@stevens.edu or via LinkedIn.',
  },
]

export default function ContactPage() {
  return (
    <>
      <ParticleOrbitCanvas />
      {/* Header */}
      <div
        className="pt-36 page-section"
        style={{ background: 'var(--bg-secondary)' }}
      >
        <div className="container-xl">
          <ScrollReveal>
            <p className="section-label mb-3">Get In Touch</p>
            <h1 className="section-heading mb-6" style={{ fontSize: 'clamp(2.6rem, 6.5vw, 5.5rem)' }}>
              Let&apos;s create
              <br />
              something
              <br />
              <span className="gradient-text">remarkable.</span>
            </h1>
            <div className="accent-line" />
            <p className="mt-5 text-base max-w-md" style={{ color: 'var(--text-secondary)' }}>
              Currently accepting select projects and collaborations.
              I read every message personally.
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* Main contact layout — side by side */}
      <section className="page-section" style={{ background: 'var(--bg-primary)' }}>
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-start">
            {/* Left — contact info */}
            <ScrollReveal direction="left">
              <ContactInfo />
            </ScrollReveal>

            {/* Right — glass form */}
            <ScrollReveal direction="right">
              <ContactForm />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container-xl">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="section-label mb-3">Common Questions</p>
              <h2 className="section-heading text-3xl md:text-4xl mb-4">FAQs</h2>
              <div className="accent-line mx-auto" />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {faqs.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <div className="glass-card p-6 h-full" style={{ borderRadius: 18 }}>
                  <h3 className="font-bold text-sm mb-2.5" style={{ color: 'var(--text-primary)' }}>
                    {faq.q}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {faq.a}
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
