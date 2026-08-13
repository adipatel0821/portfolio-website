import { socials } from '@/lib/site'

/**
 * Left-edge vertical FOLLOW rail. Mirrors the reference's chrome.
 *
 * Hidden below xl, where the viewport is too narrow to spare the gutter — the
 * same links live in the footer, so nothing is lost. Marked aria-hidden there
 * would be wrong (it isn't rendered at all), so no duplicate announcement.
 */
export default function SocialRail() {
  return (
    <aside
      aria-label="Social links"
      className="fixed left-0 top-0 z-40 hidden h-screen flex-col items-center justify-center xl:flex"
      style={{ width: 'var(--rail-w)' }}
    >
      {/* Vertical label */}
      <span
        className="type-label mb-6 text-ash"
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
      >
        Follow
      </span>

      {/* Hairline connector */}
      <span aria-hidden="true" className="mb-6 h-16 w-px bg-hairline" />

      <ul className="flex flex-col items-center gap-5">
        {socials.map((s) => (
          <li key={s.label}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${s.label} (opens in a new tab)`}
              data-cursor="hover"
              className="type-label block text-ash transition-colors duration-300 hover:text-signal"
            >
              {s.short}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}
