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
 * Outbound profiles. Every entry here must be a link that resolves — the rail
 * and the footer render whatever is in this list.
 *
 * X is omitted deliberately: the handle guessed from the GitHub name
 * (x.com/adipatel0821) returns 404, and pointing visitors at a dead URL — or
 * worse, at whoever registers it later — is worse than showing two profiles.
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
 */
export const RESUME_AVAILABLE = false
