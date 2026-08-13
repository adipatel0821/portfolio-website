import Link from 'next/link'
import Eyebrow from '@/components/ui/Eyebrow'
import Reveal from '@/components/ui/Reveal'
import HighlightText from '@/components/ui/HighlightText'
import IsoDiagram, { type IsoVariant } from '@/components/ui/IsoDiagram'
import { clsx } from '@/lib/clsx'

/**
 * Flagship deep-dive — the reference's "MonoOS" section, walking through one
 * project in alternating rows with isometric diagrams.
 */

interface Row {
  num: string
  kicker: string
  title: string
  body: string
  diagram: IsoVariant
  specs: { label: string; value: string }[]
}

const rows: Row[] = [
  {
    num: '01',
    kicker: 'The problem',
    title: 'Ten gigabytes of records nobody could touch',
    body: 'Electronic health records are simultaneously abundant and unusable: the volume is enormous, the privacy constraints are absolute, and the processing is slow enough that iterating on a model means waiting overnight. Any team wanting to train on real clinical data hits all three walls at once.',
    diagram: 'ingest',
    specs: [
      { label: 'Input', value: '~10 GB electronic health records' },
      { label: 'Constraint', value: 'No real patient data downstream' },
      { label: 'Bottleneck', value: 'Serial ETL, overnight turnaround' },
    ],
  },
  {
    num: '02',
    kicker: 'The pipeline',
    title: 'Parallel execution, then a generative layer on top',
    body: 'The ingest path was restructured around parallel execution with optimised ETL stages, cutting turnaround to a third. On top of the cleaned corpus sits the generative layer — the model that learns the joint distribution of the records rather than copying any single one of them.',
    diagram: 'parallel',
    specs: [
      { label: 'Throughput', value: '3× over the serial baseline' },
      { label: 'Stack', value: 'Python · SQL · PyTorch · TensorFlow' },
      { label: 'Storage', value: 'AWS S3 · DynamoDB' },
    ],
  },
  {
    num: '03',
    kicker: 'The outcome',
    title: '50,000+ synthetic records, zero real patients exposed',
    body: 'SynMedix deploys on AWS SageMaker and emits synthetic patient records that preserve the statistical structure of the source corpus without carrying any individual through. Downstream teams get a dataset they can experiment on freely — which is the entire point.',
    diagram: 'generate',
    specs: [
      { label: 'Generated', value: '50,000+ synthetic patient records' },
      { label: 'Deployment', value: 'AWS SageMaker' },
      { label: 'Privacy', value: 'No real record reproduced' },
    ],
  },
]

export default function FeaturedBuild() {
  return (
    <section aria-labelledby="featured-heading" className="border-t border-hairline py-chapter">
      <div className="shell">
        {/* ── Header ── */}
        <div className="mb-20 max-w-[52ch]">
          <Reveal>
            <Eyebrow label="Featured Build" sublabel="SynMedix AI" className="mb-6" />
          </Reveal>
          <Reveal delay={0.06}>
            <h2 id="featured-heading" className="type-display mb-6 text-display-md text-chalk">
              Synthetic patient data, <HighlightText delay={0.4}>at scale</HighlightText>.
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="text-body text-ash">
              A distributed EHR processing platform and the generative model that sits on
              top of it. Three steps from unusable raw records to a dataset a research team
              can actually train on.
            </p>
          </Reveal>
        </div>

        {/* ── Alternating rows ── */}
        <div className="flex flex-col gap-24">
          {rows.map((row, i) => {
            const flip = i % 2 === 1
            return (
              <article
                key={row.num}
                className="grid items-center gap-12 border-t border-hairline pt-12 md:grid-cols-2 md:gap-16"
              >
                {/* Copy */}
                <div className={clsx(flip && 'md:order-2')}>
                  <Reveal>
                    <div className="mb-5 flex items-baseline gap-3">
                      <span className="type-pixel text-base text-signal">{row.num}</span>
                      <span className="type-label text-ash">{row.kicker}</span>
                    </div>
                  </Reveal>
                  <Reveal delay={0.06}>
                    <h3 className="type-display mb-5 text-display-sm text-chalk">
                      {row.title}
                    </h3>
                  </Reveal>
                  <Reveal delay={0.12}>
                    <p className="mb-8 text-body text-ash">{row.body}</p>
                  </Reveal>
                  <Reveal delay={0.18}>
                    <dl className="border-b border-hairline-soft">
                      {row.specs.map((spec) => (
                        <div key={spec.label} className="spec-row">
                          <dt>{spec.label}</dt>
                          <dd>{spec.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </Reveal>
                </div>

                {/* Diagram */}
                <Reveal
                  delay={0.1}
                  direction={flip ? 'right' : 'left'}
                  className={clsx(flip && 'md:order-1')}
                >
                  <div className="relative border border-hairline bg-ink-800 p-10">
                    {/* Soft pool behind the line art. */}
                    <div className="glow-signal inset-[18%] rounded-full" aria-hidden="true" />
                    <IsoDiagram
                      variant={row.diagram}
                      title={`${row.kicker}: ${row.title}`}
                      className="relative"
                    />
                  </div>
                </Reveal>
              </article>
            )
          })}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-16 border-t border-hairline pt-10">
            <Link href="/projects" className="pill">
              <span className="bracket">All Case Studies</span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
