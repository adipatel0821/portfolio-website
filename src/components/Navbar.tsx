'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Menu, MapPin } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import MobileSidebar from './MobileSidebar'

const navLinks = [
  { href: '/',         label: 'Home' },
  { href: '/about',   label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog',    label: 'Blog' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 28)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: -88, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-30"
      >
        <div
          className="mx-3 md:mx-6 mt-3 rounded-2xl transition-all duration-500"
          style={{
            background: scrolled ? 'var(--navbar-bg)' : 'transparent',
            backdropFilter: scrolled ? 'blur(28px) saturate(180%)' : 'none',
            WebkitBackdropFilter: scrolled ? 'blur(28px) saturate(180%)' : 'none',
            border: scrolled ? '1px solid var(--glass-border)' : '1px solid transparent',
            boxShadow: scrolled ? 'var(--glass-shadow)' : 'none',
          }}
        >
          <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.08, rotate: -4 }}
                className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-lg"
                style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))' }}
              >
                AP
              </motion.div>
              <div className="hidden sm:flex flex-col leading-none">
                <span className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Aditya Patel
                </span>
                <span className="text-xs flex items-center gap-0.5" style={{ color: 'var(--text-muted)' }}>
                  <MapPin size={9} />Hoboken, NJ
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="relative px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-200"
                  style={{
                    color: pathname === href ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {pathname === href && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: 'var(--accent-glow)' }}
                      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                    />
                  )}
                  <span className="relative">{label}</span>
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2.5">
              <div className="hidden md:block">
                <ThemeToggle compact />
              </div>

              <Link href="/contact" className="hidden md:block">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  className="liquid-btn px-5 py-2.5 text-sm font-bold shadow-lg"
                >
                  Hire Me
                </motion.button>
              </Link>

              {/* Mobile hamburger */}
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setSidebarOpen(true)}
                className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  backdropFilter: 'blur(12px)',
                  color: 'var(--text-secondary)',
                }}
                aria-label="Open menu"
              >
                <Menu size={20} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile sidebar */}
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  )
}
