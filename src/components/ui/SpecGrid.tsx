import { clsx } from '@/lib/clsx'
import Reveal from './Reveal'

export interface SpecRow {
  label: string
  value: string
}

export interface SpecGroup {
  /** Two-digit index, e.g. "01". Rendered in the accent colour. */
  num: string
  title: string
  rows: SpecRow[]
}

interface SpecGridProps {
  groups: SpecGroup[]
  /** Columns at the lg breakpoint. */
  columns?: 1 | 2 | 3
  className?: string
}

/**
 * The reference's "Technical specifications" block: numbered groups of
 * label → value rows separated by hairlines. Semantically a description list,
 * so a screen reader announces each label with its value rather than reading
 * two disconnected columns of text.
 */
export default function SpecGrid({ groups, columns = 2, className }: SpecGridProps) {
  return (
    <div
      className={clsx(
        'grid gap-x-14 gap-y-12',
        columns === 2 && 'md:grid-cols-2',
        columns === 3 && 'md:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {groups.map((group, i) => (
        <Reveal key={group.num} delay={i * 0.06}>
          <section>
            <header className="mb-5 flex items-baseline gap-3 border-b border-hairline pb-3">
              <span className="type-pixel text-sm text-signal">{group.num}</span>
              <h3 className="type-label text-chalk">{group.title}</h3>
            </header>

            <dl>
              {group.rows.map((row) => (
                <div key={row.label} className="spec-row">
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </Reveal>
      ))}
    </div>
  )
}
