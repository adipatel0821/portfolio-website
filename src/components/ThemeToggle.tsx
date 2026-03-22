'use client'

import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to Upper East Side Light mode' : 'Switch to Midtown Midnight mode'}
      title={isDark ? 'Midtown Midnight → Upper East Side Light' : 'Upper East Side Light → Midtown Midnight'}
      className="relative flex items-center gap-2 rounded-full transition-all duration-300 select-none"
      style={{
        padding: compact ? '0.35rem 0.65rem' : '0.45rem 0.85rem',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Sun icon */}
      <Sun
        size={compact ? 13 : 15}
        style={{
          color: isDark ? 'var(--text-muted)' : 'var(--accent-secondary)',
          transition: 'color 0.3s ease',
        }}
      />

      {/* Track */}
      <div
        className="relative rounded-full flex-shrink-0"
        style={{
          width: compact ? 28 : 34,
          height: compact ? 16 : 20,
          background: isDark ? 'var(--accent-primary)' : 'var(--accent-secondary)',
          transition: 'background 0.4s ease',
          boxShadow: isDark
            ? '0 0 12px var(--accent-glow)'
            : '0 0 8px var(--accent-glow-secondary)',
        }}
      >
        <motion.div
          className="absolute top-0.5 rounded-full bg-white shadow-md"
          style={{ width: compact ? 12 : 16, height: compact ? 12 : 16 }}
          animate={{ x: isDark ? (compact ? 14 : 16) : 2 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        />
      </div>

      {/* Moon icon */}
      <Moon
        size={compact ? 13 : 15}
        style={{
          color: isDark ? 'var(--accent-primary)' : 'var(--text-muted)',
          transition: 'color 0.3s ease',
        }}
      />

      {/* Label (hidden on compact) */}
      {!compact && (
        <span
          className="text-xs font-semibold ml-0.5 hidden sm:block"
          style={{ color: 'var(--text-secondary)' }}
        >
          {isDark ? 'Midnight' : 'Daylight'}
        </span>
      )}
    </button>
  )
}
