import Link from 'next/link'
import Eyebrow from '@/components/ui/Eyebrow'
import Reveal from '@/components/ui/Reveal'
import HighlightText from '@/components/ui/HighlightText'
import IsoDiagram, { type IsoVariant } from '@/components/ui/IsoDiagram'

/**
 * Condensed walkthrough of the flagship project, three steps with isometric
 * diagrams. The full version lives at /projects/synmedix.
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
    body: 'Large volume, absolute privacy constraints, and serial processing slow enough that iterating on a model means waiting overnight.',
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
    body: 'Ingest restructured around parallel execution, cutting turnaround to a third. A generative layer on the cleaned corpus learns the joint distribution rather than copying any single record.',
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
    body: 'Deployed on SageMaker, emitting records that keep the statistical structure of the source corpus without carrying any individual through it.',
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
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[46ch]">
            <Reveal>
              <Eyebrow label="Featured Build" sublabel="SynMedix AI" className="mb-6" />
            </Reveal>
            <Reveal delay={0.06}>
              <h2 id="featured-heading" className="type-display text-display-md text-chalk">
                Synthetic patient data, <HighlightText delay={0.4}>at scale</HighlightText>.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.12}>
            <p className="max-w-[38ch] text-spec text-ash md:text-right">
              A distributed EHR processing platform and the generative model on top of it.
              Three steps from raw records to a dataset a research team can train on.
            </p>
          </Reveal>
        </div>

        {/* ── Three steps, side by side ──
            Previously three full-width alternating rows, which ran to nearly
            three screens and retold the whole case study on the home page. The
            case study at /projects/synmedix is the long version; this is the
            summary that links to it. */}
        <ol className="grid gap-px bg-[rgba(255,255,255,0.06)] md:grid-cols-3">
          {rows.map((row, i) => (
            <li key={row.num} className="bg-ink">
              <Reveal delay={i * 0.07} className="flex h-full flex-col p-7">
                <div className="mb-5 flex items-baseline gap-3">
                  <span className="type-pixel text-base text-signal">{row.num}</span>
                  <span className="type-label text-ash">{row.kicker}</span>
                </div>

                <div className="relative mb-6 h-28">
                  <div className="glow-signal inset-[22%] rounded-full" aria-hidden="true" />
                  <IsoDiagram
                    variant={row.diagram}
                    title={`${row.kicker}: ${row.title}`}
                    className="relative h-full"
                  />
                </div>

                <h3 className="type-display mb-3 text-base text-chalk">{row.title}</h3>
                <p className="mb-6 text-spec text-ash">{row.body}</p>

                <dl className="mt-auto border-t border-hairline-soft pt-1">
                  {row.specs.slice(0, 2).map((spec) => (
                    <div key={spec.label} className="spec-row !py-2">
                      <dt>{spec.label}</dt>
                      <dd>{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-hairline pt-8">
            <Link href="/projects/synmedix" className="pill pill-signal">
              <span className="bracket">Read the case study</span>
            </Link>
            <Link href="/projects" className="pill">
              All projects
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
