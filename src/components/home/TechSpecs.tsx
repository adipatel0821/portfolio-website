import Eyebrow from '@/components/ui/Eyebrow'
import Reveal from '@/components/ui/Reveal'
import SpecGrid from '@/components/ui/SpecGrid'
import CountUp from '@/components/ui/CountUp'
import { marqueeItems, stats, techSpecs } from '@/data/home'

/**
 * The reference's "Technical specifications" section: an oversized headline
 * with a right-aligned caption, then a numbered spec grid. Replaces the old
 * chip-cloud marquee as the primary stack presentation; the marquee survives
 * below as a secondary flourish.
 */
export default function TechSpecs() {
  return (
    <section aria-labelledby="stack-heading" className="py-chapter">
      <div className="shell">
        {/* ── Stats ── */}
        <div className="mb-24 grid grid-cols-2 gap-px border border-hairline bg-[rgba(255,255,255,0.06)] lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div key={stat.label} className="bg-ink p-6 md:p-8">
              <Reveal delay={i * 0.07}>
                <p className="type-pixel mb-3 text-3xl text-signal md:text-4xl">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="type-label mb-1 text-chalk">{stat.label}</p>
                <p className="text-[0.6875rem] leading-relaxed text-dust">{stat.sub}</p>
              </Reveal>
            </div>
          ))}
        </div>

        {/* ── Header ── */}
        <div className="mb-16 flex flex-col gap-8 border-b border-hairline pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal>
              <Eyebrow label="Aditya Patel" sublabel="Capabilities" className="mb-6" />
            </Reveal>
            <Reveal delay={0.06}>
              <h2 id="stack-heading" className="type-display text-display-lg">
                <span className="text-chalk">Technical </span>
                <span className="text-signal">stack.</span>
              </h2>
            </Reveal>
          </div>

          <Reveal delay={0.12}>
            <p className="max-w-[34ch] text-spec text-ash md:text-right">
              Everything listed here has shipped in something real — an internship
              deliverable, a deployed model, or a project running today.
            </p>
          </Reveal>
        </div>

        {/* ── Spec grid ── */}
        <SpecGrid groups={techSpecs} columns={3} />
      </div>

      {/* ── Secondary flourish ── */}
      <div className="marquee-wrapper mt-24 border-y border-hairline py-5">
        <div className="marquee-track" aria-hidden="true">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0">
              {marqueeItems.map((item) => (
                <span
                  key={`${dup}-${item}`}
                  className="type-label flex items-center gap-8 whitespace-nowrap px-8 text-dust"
                >
                  {item}
                  <span className="h-1 w-1 rounded-full bg-signal" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
