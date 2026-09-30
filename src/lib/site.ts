/**
 * Single source of truth for identity, navigation and outbound links.
 * Every piece of chrome reads from here so there is exactly one place to
 * change a handle or add a route.
 */

export const site = {
  name: 'Aditya Patel',
  initials: 'AP',
  role: 'ML / Data Eng',
  location: 'Hoboken, NJ',
  email: 'apatel100@stevens.edu',
  url: 'https://pateladitya.dev',
  tagline: 'Machine learning and data engineering, from research to production.',
} as const

export const nav = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
] as const

/**
 * Outbound profiles. Every entry here must be a link that resolves, the rail
 * and the footer render whatever is in this list.
 *
 * X is omitted deliberately: the handle guessed from the GitHub name
 * (x.com/adipatel0821) returns 404, and pointing visitors at a dead URL, or
 * worse, at whoever registers it later, is worse than showing two profiles.
 * Add it back here once the real handle is known.
 */
export const socials = [
  { label: 'GitHub', short: 'GH', href: 'https://github.com/adipatel0821' },
  { label: 'LinkedIn', short: 'IN', href: 'https://linkedin.com/in/adityapatel0821' },
] as const

/** Served from /public. */
export const RESUME_PATH = '/Aditya-Patel-Resume.pdf'

/**
 * TO ENABLE THE RESUME LINKS: drop the PDF at
 * `public/Aditya-Patel-Resume.pdf` and flip this to `true`.
 *
 * Gated rather than always-on because the file is not in the repo yet, and a
 * prominent nav button that 404s is worse than one that is briefly absent.
 *
 * ── Why this is still false (checked 2026-09-29) ──
 * Two candidate PDFs exist in ~/Downloads and NEITHER is publishable as-is:
 *
 *   Aditya_Patel_Resume (2).pdf  — Sep 2026, current (includes Licent), but the
 *     summary is written for a specific hackathon: "At HackPrinceton I want to
 *     pair up with people who care about health or fintech problems." That is a
 *     targeted resume, not the one to hang off a permanent nav button.
 *
 *   Aditya_Patel_Resume.pdf      — Mar 2026, correctly general-purpose, but
 *     predates the Licent Solutions role entirely, so it contradicts both the
 *     About page and the timeline.
 *
 * BOTH also print `github.com/adityapatel0821`, the handle that 404s. The live
 * handle is `adipatel0821` (see `socials` above) — that link was already fixed
 * on the site in July, so shipping either PDF would reintroduce the dead link
 * in the one document a recruiter downloads and keeps.
 *
 * ── What the replacement PDF needs (agreed 2026-09-29) ──
 * Aditya is exporting a corrected version. It should carry:
 *   - a general-purpose summary, NOT the hackathon-specific opening
 *   - the current Licent Solutions role, so it agrees with the About timeline
 *   - `github.com/adipatel0821` — the handle that resolves
 *   - phone number: keep
 *   - both addresses: apatel100@stevens.edu and adityapatel280104@gmail.com
 *     (the Stevens address stops working after graduation in 2027, so the
 *     personal one is what keeps the resume reachable long-term)
 *
 * Then: save to `public/Aditya-Patel-Resume.pdf`, flip this to `true`, and check
 * all three CTAs — navbar (desktop + mobile), hero, and the contact page.
 */
export const RESUME_AVAILABLE = false
