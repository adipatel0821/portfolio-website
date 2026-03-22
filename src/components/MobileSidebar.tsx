'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Home, User, Briefcase, BookOpen, Mail, MapPin } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const navLinks = [
  { href: '/',         label: 'Home',     icon: Home },
  { href: '/about',   label: 'About',    icon: User },
  { href: '/projects', label: 'Projects', icon: Briefcase },
  { href: '/blog',    label: 'Blog',     icon: BookOpen },
  { href: '/contact', label: 'Contact',  icon: Mail },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function MobileSidebar({ open, onClose }: Props) {
  const pathname = usePathname()

  // Close on route change
  useEffect(() => { onClose() }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Blurred backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          />

          {/* Sidebar panel */}
          <motion.aside
            key="sidebar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="fixed top-0 right-0 h-full z-50 w-72 flex flex-col"
            style={{
              background: 'var(--glass-bg-heavy)',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              borderLeft: '1px solid var(--glass-border)',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.4)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-5 border-b"
              style={{ borderColor: 'var(--divider)' }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-xs"
                  style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))' }}
                >
                  AP
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    Aditya Patel
                  </span>
                  <span className="text-xs flex items-center gap-0.5" style={{ color: 'var(--text-muted)' }}>
                    <MapPin size={9} />Hoboken, NJ
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-secondary)',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-4 py-6 space-y-1">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname === href
                return (
                  <Link key={href} href={href}>
                    <div
                      className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 cursor-pointer"
                      style={{
                        background: active ? 'var(--accent-glow)' : 'transparent',
                        color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        border: active ? '1px solid var(--glass-border)' : '1px solid transparent',
                      }}
                    >
                      <Icon size={18} />
                      <span className="font-semibold text-sm">{label}</span>
                      {active && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="ml-auto w-1.5 h-1.5 rounded-full"
                          style={{ background: 'var(--accent-primary)' }}
                        />
                      )}
                    </div>
                  </Link>
                )
              })}
            </nav>

            {/* Footer */}
            <div
              className="px-6 py-5 border-t space-y-4"
              style={{ borderColor: 'var(--divider)' }}
            >
              <ThemeToggle />
              <Link href="/contact" onClick={onClose}>
                <button className="liquid-btn w-full py-3 text-sm font-bold">
                  Hire Me
                </button>
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
