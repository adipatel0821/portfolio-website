'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { nav, site, RESUME_AVAILABLE, RESUME_PATH } from '@/lib/site'
import { clsx } from '@/lib/clsx'
import MagneticButton from '@/components/ui/MagneticButton'

/**
 * Fixed top chrome: AP mark left, routes centre, HIRE ME + RESUME pills right.
 *
 * The bar is transparent over the hero and fades to an opaque hairline-bottomed
 * panel past 40px, so the pixel headline never competes with a background plate.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile sheet on navigation, and lock body scroll while it's open.
  useEffect(() => setMenuOpen(false), [pathname])
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  // Escape closes the sheet — required for keyboard users.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <>
      <header
        className={clsx(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-500 ease-cinema',
          scrolled ? 'border-b border-hairline bg-ink/92 backdrop-blur-sm' : 'border-b border-transparent bg-transparent',
        )}
        style={{ height: 'var(--nav-h)' }}
      >
        <div className="mx-auto flex h-full max-w-shell items-center justify-between px-gutter">
          {/* ── Mark ── */}
          <Link
            href="/"
            className="group flex items-center gap-2.5"
            // Must contain the visible text. Below the sm breakpoint the only
            // visible content is the "AP" mark, so a name of just "Aditya Patel"
            // fails the accessible-name-contains-visible-label rule there.
            aria-label={`${site.initials} · ${site.name} — home`}
          >
            <span
              className="type-pixel flex h-7 w-7 items-center justify-center bg-signal text-[11px] text-[#0a0a0a]"
              aria-hidden="true"
            >
              {site.initials}
            </span>
            <span className="type-label hidden text-chalk sm:block">{site.name}</span>
          </Link>

          {/* ── Routes ── */}
          <nav
            aria-label="Primary"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 md:flex"
          >
            {nav.map(({ href, label }) => {
              const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={clsx(
                    'type-label relative py-1 transition-colors duration-300',
                    active ? 'text-chalk' : 'text-ash hover:text-chalk',
                  )}
                >
                  {label}
                  {/* Shared-layout underline slides between routes. */}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-0.5 left-0 right-0 h-px bg-signal"
                      transition={
                        prefersReduced
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 380, damping: 32 }
                      }
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* ── Actions ── */}
          <div className="flex items-center gap-2.5">
            {RESUME_AVAILABLE && (
              <a
                href={RESUME_PATH}
                target="_blank"
                rel="noopener noreferrer"
                className="pill hidden lg:inline-flex"
              >
                Resume
              </a>
            )}

            <MagneticButton href="/contact" className="pill pill-signal hidden md:inline-flex">
              Hire Me
            </MagneticButton>

            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="flex h-9 w-9 items-center justify-center md:hidden"
            >
              {/* Two rules that cross into an X — cheaper and calmer than an icon swap. */}
              <span className="relative block h-3 w-5">
                <span
                  className={clsx(
                    'absolute left-0 block h-px w-full bg-chalk transition-transform duration-300 ease-cinema',
                    menuOpen ? 'top-1.5 rotate-45' : 'top-0',
                  )}
                />
                <span
                  className={clsx(
                    'absolute left-0 block h-px w-full bg-chalk transition-transform duration-300 ease-cinema',
                    menuOpen ? 'top-1.5 -rotate-45' : 'top-3',
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile sheet ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.3 }}
            className="fixed inset-0 z-40 bg-ink md:hidden"
          >
            <nav
              aria-label="Mobile"
              className="flex h-full flex-col justify-center gap-1 px-gutter"
            >
              {nav.map(({ href, label }, i) => (
                <motion.div
                  key={href}
                  initial={prefersReduced ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: prefersReduced ? 0 : 0.06 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={href}
                    className="type-display block border-b border-hairline-soft py-5 text-3xl text-chalk"
                  >
                    <span className="mr-4 text-sm text-signal">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {label}
                  </Link>
                </motion.div>
              ))}

              <div className="mt-10 flex gap-3">
                <Link href="/contact" className="pill pill-signal">
                  Hire Me
                </Link>
                {RESUME_AVAILABLE && (
                  <a
                    href={RESUME_PATH}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pill"
                  >
                    Resume
                  </a>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
