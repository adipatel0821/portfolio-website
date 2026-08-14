import type { Metadata } from 'next'
import ContactForm from '@/components/contact/ContactForm'
import Eyebrow from '@/components/ui/Eyebrow'
import Reveal from '@/components/ui/Reveal'
import PixelHeadline from '@/components/ui/PixelHeadline'
import { RESUME_AVAILABLE, RESUME_PATH, site, socials } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Aditya Patel about machine learning and data engineering roles, research collaborations, or anything else worth building.',
}

const faqs = [
  {
    q: 'Are you open to roles right now?',
    a: 'Yes — actively looking for ML engineering, data engineering or SWE roles. Most interested in teams working on generative models, large-scale data, or cloud infrastructure.',
  },
  {
    q: 'What is your availability?',
    a: 'Full-time M.S. student at Stevens through 2027. Available for part-time remote work, research collaborations, and summer internships.',
  },
  {
    q: 'What do you specialise in?',
    a: 'Generative models (GANs, diffusion), LLM systems, ETL and orchestration with Airflow, and cloud deployment on AWS SageMaker and GCP Vertex AI.',
  },
  {
    q: 'How fast do you reply?',
    a: 'Within 24 hours. I read every message myself — there is no filter and no assistant.',
  },
]

export default function ContactPage() {
  return (
    <>
      {/* ── Header ── */}
      <header className="border-b border-hairline pb-16 pt-[calc(var(--nav-h)+clamp(4rem,10vh,7rem))]">
        <div className="shell">
          <Reveal priority>
            <Eyebrow label="Aditya Patel" sublabel="Contact" className="mb-8" />
          </Reveal>

          <PixelHeadline
            lines={['Say', 'hello.']}
            accentLines={[1]}
            className="mb-8 max-w-[10ch] text-display-lg"
            delay={0.1}
          />

          <Reveal delay={0.4} priority>
            <p className="max-w-[48ch] text-body text-ash">
              A hard problem, an open role, or a project that needs someone who will
              actually dig in. I read every message personally.
            </p>
          </Reveal>
        </div>
      </header>

      {/* ── Form + details ── */}
      <section aria-labelledby="form-heading" className="py-chapter">
        <div className="shell">
          <div className="grid gap-16 lg:grid-cols-[1.4fr_1fr] lg:gap-24">
            {/* Form */}
            <div>
              <h2 id="form-heading" className="type-label mb-9 border-b border-hairline pb-4 text-ash">
                Send a message
              </h2>
              <ContactForm />
            </div>

            {/* Direct details */}
            <aside>
              <h2 className="type-label mb-9 border-b border-hairline pb-4 text-ash">
                Or reach me directly
              </h2>

              <Reveal>
                <dl className="mb-12">
                  <div className="spec-row !grid-cols-1 !gap-1">
                    <dt>Email</dt>
                    <dd>
                      <a
                        href={`mailto:${site.email}`}
                        className="text-chalk underline underline-offset-4 transition-colors hover:text-signal"
                      >
                        {site.email}
                      </a>
                    </dd>
                  </div>
                  <div className="spec-row !grid-cols-1 !gap-1">
                    <dt>Location</dt>
                    <dd>{site.location}</dd>
                  </div>
                  <div className="spec-row !grid-cols-1 !gap-1">
                    <dt>Status</dt>
                    <dd className="text-phosphor">Open to opportunities</dd>
                  </div>
                  <div className="spec-row !grid-cols-1 !gap-1">
                    <dt>Response time</dt>
                    <dd>Within 24 hours</dd>
                  </div>
                </dl>
              </Reveal>

              <Reveal delay={0.08}>
                <h3 className="type-label mb-4 text-dust">Elsewhere</h3>
                <ul className="mb-10 flex flex-col gap-3">
                  {socials.map((s) => (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="type-label inline-flex items-center gap-3 text-ash transition-colors hover:text-signal"
                      >
                        <span aria-hidden="true" className="text-dust">
                          {s.short}
                        </span>
                        {s.label}
                        <span aria-hidden="true">↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </Reveal>

              {RESUME_AVAILABLE && (
                <Reveal delay={0.14}>
                  <a
                    href={RESUME_PATH}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pill"
                  >
                    <span className="bracket">Resume</span>
                  </a>
                </Reveal>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section aria-labelledby="faq-heading" className="border-t border-hairline py-chapter">
        <div className="shell">
          <div className="mb-14 max-w-[42ch]">
            <Reveal>
              <Eyebrow label="Common questions" tone="phosphor" className="mb-6" />
            </Reveal>
            <Reveal delay={0.06}>
              <h2 id="faq-heading" className="type-display text-display-md text-chalk">
                Before you ask.
              </h2>
            </Reveal>
          </div>

          <dl className="border-t border-hairline">
            {/* Reveal renders the wrapping <div>, so dt/dd stay direct
                children of it — a <dl> allows dt/dd or a plain div containing
                them, but not a div inside a div. */}
            {faqs.map((faq, i) => (
              <Reveal
                key={faq.q}
                delay={i * 0.05}
                className="grid gap-4 border-b border-hairline py-9 md:grid-cols-[1fr_1.3fr] md:gap-14"
              >
                <dt className="type-display text-base text-chalk">{faq.q}</dt>
                <dd className="text-spec text-ash">{faq.a}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>
    </>
  )
}
