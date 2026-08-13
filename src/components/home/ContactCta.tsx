'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import Eyebrow from '@/components/ui/Eyebrow'
import Reveal from '@/components/ui/Reveal'
import { site } from '@/lib/site'

type Status = 'idle' | 'sending' | 'sent' | 'error'

const FORMSPREE = `https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_ID ?? 'xkopwlee'}`

/**
 * Closing CTA — the reference's mailing-list footer, repurposed as a one-field
 * way in.
 *
 * This posts for real to the same endpoint as the full contact form, so the
 * success state means a message actually arrived. There is no decorative
 * "subscribe" that goes nowhere.
 */
export default function ContactCta() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validate before touching the network — a failed round-trip is a worse
    // way to learn you typed your address wrong.
    const trimmed = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
      setError('Enter a valid email address.')
      setStatus('error')
      return
    }

    setStatus('sending')
    setError('')

    try {
      const res = await fetch(FORMSPREE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          subject: 'Quick contact from pateladitya.dev',
          message: `${trimmed} reached out via the home page CTA.`,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStatus('sent')
      setEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
      setStatus('error')
    }
  }

  return (
    <section
      aria-labelledby="cta-heading"
      className="relative overflow-hidden border-t border-hairline py-chapter"
    >
      {/* Single soft pool behind the headline. */}
      <div
        aria-hidden="true"
        className="glow-signal left-1/2 top-1/2 h-[52vh] w-[52vh] -translate-x-1/2 -translate-y-1/2 rounded-full"
      />

      <div className="shell relative">
        <div className="max-w-[54ch]">
          <Reveal>
            <Eyebrow label={site.name} sublabel="Contact" className="mb-7" />
          </Reveal>

          <Reveal delay={0.06}>
            <h2 id="cta-heading" className="type-display mb-7 text-display-lg">
              <span className="block text-chalk">Let&apos;s build</span>
              <span className="block text-signal">something.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mb-10 text-body text-ash">
              A hard ML problem, a pipeline that won&apos;t scale, or a role where you need
              someone who will actually dig in. Leave an address and I&apos;ll reply within
              24 hours.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            {status === 'sent' ? (
              <p
                role="status"
                className="type-label border border-phosphor/40 px-5 py-4 text-phosphor"
              >
                Received — I&apos;ll be in touch within 24 hours.
              </p>
            ) : (
              <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <label htmlFor="cta-email" className="sr-only">
                    Your email address
                  </label>
                  <input
                    id="cta-email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (status === 'error') setStatus('idle')
                    }}
                    placeholder="you@company.com"
                    autoComplete="email"
                    aria-invalid={status === 'error'}
                    aria-describedby={status === 'error' ? 'cta-error' : undefined}
                    disabled={status === 'sending'}
                    className="w-full flex-1 border border-hairline bg-ink-600 px-4 py-3 font-mono text-sm text-chalk outline-none transition-colors duration-300 placeholder:text-dust focus:border-signal disabled:opacity-60 sm:max-w-sm"
                  />
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="pill pill-signal justify-center disabled:opacity-60"
                  >
                    {status === 'sending' ? 'Sending…' : 'Get in Touch'}
                  </button>
                </div>

                {status === 'error' && (
                  <p id="cta-error" role="alert" className="type-label text-signal-bright">
                    {error} — or email{' '}
                    <a href={`mailto:${site.email}`} className="underline">
                      {site.email}
                    </a>{' '}
                    directly.
                  </p>
                )}
              </form>
            )}
          </Reveal>

          <Reveal delay={0.24}>
            <p className="type-label mt-8 text-dust">
              Prefer the long form?{' '}
              <Link href="/contact" className="text-ash underline hover:text-signal">
                Full contact page
              </Link>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
