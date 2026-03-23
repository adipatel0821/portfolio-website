'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Menu } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import MobileSidebar from './MobileSidebar'

const navLinks = [
  { href: '/about',    label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog',     label: 'Blog' },
  { href: '/contact',  label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const textColor = isHome && !scrolled ? 'rgba(255,255,255,0.75)' : 'var(--text-secondary)'
  const activeColor = isHome && !scrolled ? 'rgba(255,255,255,1)' : 'var(--text-primary)'
  const logoColor = isHome && !scrolled ? 'rgba(255,255,255,0.95)' : 'var(--text-primary)'

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-30 transition-all duration-500"
        style={{
          background: scrolled ? 'var(--navbar-bg)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px) saturate(160%)' : 'none',
          borderBottom: scrolled ? '1px solid var(--divider)' : '1px solid transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-8 md:px-12 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-xs"
              style={{ background: 'linear-gradient(135deg, #00d4ff, #a855f7)' }}
            >
              AP
            </div>
            <span
              className="hidden sm:block font-display font-bold text-sm tracking-wide transition-colors"
              style={{ color: logoColor }}
            >
              Aditya Patel
            </span>
          </Link>

          {/* Desktop nav — centered */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-medium transition-colors duration-200 hover:opacity-100"
                style={{
                  color: pathname === href ? activeColor : textColor,
                  opacity: pathname === href ? 1 : 0.7,
                }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <ThemeToggle compact />
            </div>

            <Link href="/contact" className="hidden md:block">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
                style={
                  isHome && !scrolled
                    ? {
                        background: 'rgba(255,255,255,0.12)',
                        border: '1px solid rgba(255,255,255,0.22)',
                        color: 'white',
                      }
                    : {
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-primary)',
                      }
                }
              >
                Hire Me
              </motion.button>
            </Link>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg"
              style={{ color: isHome && !scrolled ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </motion.button>
          </div>
        </div>
      </motion.header>

      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  )
}
