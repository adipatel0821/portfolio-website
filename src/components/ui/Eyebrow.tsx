import { clsx } from '@/lib/clsx'

interface EyebrowProps {
  /** Primary label, e.g. "ADITYA PATEL" */
  label: string
  /** Optional second segment shown after a middot, e.g. "ML / DATA ENG" */
  sublabel?: string
  /** Dot colour. Orange is the default; green marks the terminal/code motif. */
  tone?: 'signal' | 'phosphor'
  className?: string
  as?: 'p' | 'span' | 'div'
}

/**
 * ● LABEL · SUBLABEL
 *
 * The system's most-repeated device: a small accent dot followed by widely
 * tracked mono caps. Appears above every section headline.
 */
export default function Eyebrow({
  label,
  sublabel,
  tone = 'signal',
  className,
  as: Tag = 'p',
}: EyebrowProps) {
  return (
    <Tag className={clsx('type-label flex items-center gap-2.5 text-ash', className)}>
      <span
        aria-hidden="true"
        className={clsx(
          'inline-block h-1.5 w-1.5 shrink-0 rounded-full motion-safe:animate-dot-pulse',
          tone === 'signal' ? 'bg-signal' : 'bg-phosphor',
        )}
      />
      <span className="text-chalk">{label}</span>
      {sublabel && (
        <>
          <span aria-hidden="true" className="text-dust">
            ·
          </span>
          <span>{sublabel}</span>
        </>
      )}
    </Tag>
  )
}
