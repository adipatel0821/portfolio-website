import type { Metadata } from 'next'
import Link from 'next/link'
import { interests, principles, skillGroups } from '@/data/about'
import Timeline from '@/components/about/Timeline'
import Eyebrow from '@/components/ui/Eyebrow'
import Reveal from '@/components/ui/Reveal'
import PixelHeadline from '@/components/ui/PixelHeadline'
import HighlightText from '@/components/ui/HighlightText'
import TerminalType from '@/components/ui/TerminalType'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Aditya Patel, M.S. Computer Science at Stevens Institute of Technology and currently an AI engineer intern at Licent Solutions. Four industry internships across AI, data engineering, IoT and web, plus production ML deployments on AWS SageMaker and GCP Vertex AI.',
}

export default function AboutPage() {
  return (
    <>
      {/* ── Header ── */}
      <header className="border-b border-hairline pb-16 pt-[calc(var(--nav-h)+clamp(4rem,10vh,7rem))]">
        <div className="shell">
          <Reveal priority>
            <Eyebrow label="Aditya Patel" sublabel="About" className="mb-8" />
          </Reveal>

          <PixelHeadline
            lines={['Engineer.', 'Builder.']}
            accentLines={[1]}
            className="mb-8 max-w-[13ch] text-display-lg"
            delay={0.1}
          />

          <Reveal delay={0.45} priority>
            <TerminalType
              prompt=">"
              text="whoami"
              className="type-label text-ash"
            />
          </Reveal>
        </div>
      </header>

      {/* ── Narrative ── */}
      <section aria-labelledby="story-heading" className="py-chapter">
        <div className="shell">
          <div className="grid gap-14 lg:grid-cols-[1fr_auto] lg:gap-20">
            <div className="max-w-prose">
              <Reveal>
                <h2 id="story-heading" className="sr-only">
                  Background
                </h2>
                <p className="mb-7 text-body-lg text-chalk">
                  I&apos;m Aditya Patel, a machine learning and data engineer doing my M.S. in
                  Computer Science at{' '}
                  <HighlightText delay={0.4}>Stevens Institute</HighlightText>, in Hoboken.
                </p>
              </Reveal>

              <Reveal delay={0.08}>
                <p className="mb-6 text-body text-ash">
                  I finished my B.Tech at VIT Chennai in 2025 with a GPA of 3.5/4.0, and
                  spent the years around it doing internships that had almost nothing
                  in common: ETL pipelines at Intellect Design Arena, IoT systems at Intuz,
                  and full-stack web at Appuno. That turned out to be the useful part. Each
                  one covered a different piece of what makes a system work.
                </p>
              </Reveal>

              <Reveal delay={0.14}>
                <p className="mb-6 text-body text-ash">
                  What I care about now is generative models and the distributed data
                  pipelines that feed them. I&apos;ve deployed multimodal GANs to GCP Vertex
                  AI, built SynMedix on AWS SageMaker to generate 50,000+ synthetic patient
                  records, trained a conditional diffusion model on brain MRI slices, and
                  written Airflow pipelines that regulators&apos; data actually flows
                  through.
                </p>
              </Reveal>

              <Reveal delay={0.2}>
                <p className="text-body text-ash">
                  The through-line is healthcare AI and the data-scarcity problem underneath
                  it: the most valuable datasets in medicine are the ones you are least
                  allowed to use. Most of my work is some attempt at that. Right now
                  I&apos;m an AI engineer intern at{' '}
                  <span className="text-chalk">Licent Solutions</span>. That work is
                  confidential, so it is not written up here. I&apos;m looking for ML or
                  data engineering roles alongside it, so if you are building something
                  in that space,{' '}
                  <Link href="/contact" className="text-chalk underline underline-offset-4 hover:text-signal">
                    I want to hear about it
                  </Link>
                  .
                </p>
              </Reveal>
            </div>

            {/* Facts rail */}
            <Reveal delay={0.12} direction="right">
              <dl className="border-t border-hairline lg:w-72">
                {[
                  { label: 'Based', value: site.location },
                  { label: 'Studying', value: 'M.S. CS · Stevens · 2025-2027' },
                  { label: 'Prior', value: 'B.Tech CS&E · VIT Chennai · 3.5/4.0' },
                  { label: 'Currently', value: 'AI Engineer Intern · Licent Solutions' },
                  { label: 'Internships', value: 'AI · Data Eng · IoT · Web' },
                  { label: 'Focus', value: 'Generative models · Data pipelines' },
                  { label: 'Open to', value: 'Remote · Hybrid · On-site' },
                ].map((row) => (
                  <div key={row.label} className="spec-row !grid-cols-1 !gap-1">
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section aria-labelledby="timeline-heading" className="border-t border-hairline py-chapter">
        <div className="shell">
          <div className="mb-14 max-w-[46ch]">
            <Reveal>
              <Eyebrow label="Timeline" sublabel="2021 to Present" className="mb-6" />
            </Reveal>
            <Reveal delay={0.06}>
              <h2 id="timeline-heading" className="type-display text-display-md text-chalk">
                How I got here.
              </h2>
            </Reveal>
          </div>

          <Timeline />
        </div>
      </section>

      {/* ── Skills ── */}
      <section aria-labelledby="skills-heading" className="border-t border-hairline py-chapter">
        <div className="shell">
          <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <Reveal>
                <Eyebrow label="Capabilities" sublabel="By domain" className="mb-6" />
              </Reveal>
              <Reveal delay={0.06}>
                <h2 id="skills-heading" className="type-display text-display-md">
                  <span className="text-chalk">What I </span>
                  <span className="text-signal">work with.</span>
                </h2>
              </Reveal>
            </div>
          </div>

          <div className="grid gap-x-14 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {skillGroups.map((group, i) => (
              <Reveal key={group.num} delay={i * 0.05}>
                <section>
                  <header className="mb-5 flex items-baseline gap-3 border-b border-hairline pb-3">
                    <span className="type-pixel text-sm text-signal">{group.num}</span>
                    <h3 className="type-label text-chalk">{group.domain}</h3>
                  </header>
                  <ul className="flex flex-wrap gap-2">
                    {group.skills.map((skill) => (
                      <li
                        key={skill}
                        className="type-label border border-hairline px-3 py-1.5 text-ash"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Principles ── */}
      <section aria-labelledby="principles-heading" className="border-t border-hairline py-chapter">
        <div className="shell">
          <div className="mb-14 max-w-[46ch]">
            <Reveal>
              <Eyebrow label="How I work" tone="phosphor" className="mb-6" />
            </Reveal>
            <Reveal delay={0.06}>
              <h2 id="principles-heading" className="type-display text-display-md text-chalk">
                Three things I believe.
              </h2>
            </Reveal>
          </div>

          <div className="grid gap-px bg-[rgba(255,255,255,0.06)] md:grid-cols-3">
            {principles.map((p, i) => (
              <article key={p.num} className="bg-ink p-8 md:p-10">
                <Reveal delay={i * 0.07}>
                  <span className="type-pixel mb-6 block text-2xl text-signal">{p.num}</span>
                  <h3 className="type-display mb-4 text-lg text-chalk">{p.title}</h3>
                  <p className="text-spec text-ash">{p.body}</p>
                </Reveal>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Off the clock ── */}
      <section aria-labelledby="interests-heading" className="border-t border-hairline py-chapter">
        <div className="shell">
          <div className="grid gap-10 md:grid-cols-[auto_1fr] md:gap-20">
            <div className="md:w-56">
              <Reveal>
                <h2 id="interests-heading" className="type-label text-ash">
                  Off the clock
                </h2>
              </Reveal>
            </div>
            <div className="max-w-prose">
              <Reveal delay={0.06}>
                <p className="mb-8 text-body text-ash">
                  Cricket, a camera I do not use often enough, and an ongoing and expensive
                  interest in coffee that has produced no measurable improvement in my
                  ability to make it.
                </p>
              </Reveal>
              <Reveal delay={0.12}>
                <ul className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <li
                      key={interest}
                      className="type-label border border-hairline px-3 py-1.5 text-dust"
                    >
                      {interest}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── Next ── */}
      <section className="border-t border-hairline py-16">
        <div className="shell flex flex-wrap items-center justify-between gap-6">
          <p className="type-label text-dust">Next</p>
          <Link
            href="/projects"
            className="type-display text-display-sm text-chalk transition-colors hover:text-signal"
          >
            See the work →
          </Link>
        </div>
      </section>
    </>
  )
}
