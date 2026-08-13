import Link from 'next/link'
import { nav, site, socials } from '@/lib/site'

/**
 * Shared site footer. Previously this markup was copy-pasted into all five
 * pages; it now lives once, in the root layout.
 */
export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-hairline bg-ink">
      <div className="shell py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Identity */}
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <span
                className="type-pixel flex h-7 w-7 items-center justify-center bg-signal text-[11px] text-[#0a0a0a]"
                aria-hidden="true"
              >
                {site.initials}
              </span>
              <span className="type-label text-chalk">{site.name}</span>
            </div>
            <p className="max-w-xs text-spec text-ash">{site.tagline}</p>
            <p className="type-label mt-5 text-dust">{site.location}</p>
          </div>

          {/* Routes */}
          <nav aria-label="Footer">
            <h2 className="type-label mb-4 text-dust">Index</h2>
            <ul className="flex flex-col gap-2.5">
              {nav.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="type-label text-ash transition-colors duration-300 hover:text-signal"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Elsewhere */}
          <div>
            <h2 className="type-label mb-4 text-dust">Elsewhere</h2>
            <ul className="flex flex-col gap-2.5">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="type-label text-ash transition-colors duration-300 hover:text-signal"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="type-label text-ash transition-colors duration-300 hover:text-signal"
                >
                  Email
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-hairline-soft pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="type-label text-dust">
            © {year} {site.name}
          </p>
          <p className="type-label text-dust">Next.js · TypeScript · Three.js</p>
        </div>
      </div>
    </footer>
  )
}
