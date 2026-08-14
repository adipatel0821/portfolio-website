'use client'

import { useId, useRef, useState, type FormEvent } from 'react'
import { clsx } from '@/lib/clsx'
import { site } from '@/lib/site'

/**
 * Contact form with real per-field validation and honest status states.
 *
 * Validation runs on submit and then live per-field once a field has been
 * touched — validating on every keystroke before the user has finished typing
 * is how you tell someone their half-entered email is wrong.
 *
 * Accessibility: every field has a real <label>, errors are wired through
 * aria-describedby with aria-invalid, and the status region is a live region so
 * a screen reader hears the outcome without moving focus. On failure, focus
 * moves to the first invalid field.
 */

const FORMSPREE = `https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_ID ?? 'xkopwlee'}`

const SUBJECTS = [
  { value: 'role', label: 'Full-time / contract role' },
  { value: 'collab', label: 'Project collaboration' },
  { value: 'research', label: 'Research collaboration' },
  { value: 'speaking', label: 'Speaking / media' },
  { value: 'other', label: 'Something else' },
] as const

type Field = 'name' | 'email' | 'subject' | 'message'
type Errors = Partial<Record<Field, string>>
type Status = 'idle' | 'sending' | 'sent' | 'error'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate(values: Record<Field, string>): Errors {
  const errors: Errors = {}
  if (!values.name.trim()) errors.name = 'Please enter your name.'
  if (!values.email.trim()) errors.email = 'Please enter an email address.'
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'That does not look like a valid email address.'
  if (!values.subject) errors.subject = 'Please pick a topic.'
  if (!values.message.trim()) errors.message = 'Please write a message.'
  else if (values.message.trim().length < 20)
    errors.message = 'A little more detail would help — at least 20 characters.'
  return errors
}

const EMPTY: Record<Field, string> = { name: '', email: '', subject: '', message: '' }

export default function ContactForm() {
  const uid = useId()
  const formRef = useRef<HTMLFormElement>(null)

  const [values, setValues] = useState<Record<Field, string>>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [submitError, setSubmitError] = useState('')
  // Bots fill hidden fields; humans cannot see this one.
  const [honeypot, setHoneypot] = useState('')

  const fieldId = (f: Field) => `${uid}-${f}`
  const errorId = (f: Field) => `${uid}-${f}-error`

  const setField = (field: Field, value: string) => {
    const next = { ...values, [field]: value }
    setValues(next)
    // Re-validate live only once the field has been left at least once.
    if (touched[field]) setErrors(validate(next))
  }

  const onBlur = (field: Field) => {
    setTouched((t) => ({ ...t, [field]: true }))
    setErrors(validate(values))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const found = validate(values)
    setErrors(found)
    setTouched({ name: true, email: true, subject: true, message: true })

    if (Object.keys(found).length > 0) {
      // Move focus to the first problem so keyboard users are not hunting.
      const first = (['name', 'email', 'subject', 'message'] as Field[]).find((f) => found[f])
      if (first) formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(fieldId(first))}`)?.focus()
      return
    }

    // Silently succeed for bots — telling them they were caught only helps them.
    if (honeypot) {
      setStatus('sent')
      return
    }

    setStatus('sending')
    setSubmitError('')

    try {
      const res = await fetch(FORMSPREE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          subject: SUBJECTS.find((s) => s.value === values.subject)?.label ?? values.subject,
          message: values.message.trim(),
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.errors?.[0]?.message ?? body?.error ?? `HTTP ${res.status}`)
      }

      setStatus('sent')
      setValues(EMPTY)
      setTouched({})
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Network error')
      setStatus('error')
    }
  }

  const inputClass = (field: Field) =>
    clsx(
      'w-full border bg-ink-600 px-4 py-3 font-mono text-sm text-chalk outline-none transition-colors duration-300 placeholder:text-dust',
      errors[field] && touched[field]
        ? 'border-signal'
        : 'border-hairline focus:border-signal',
    )

  if (status === 'sent') {
    return (
      <div
        role="status"
        className="border border-phosphor/40 bg-ink-800 p-10"
      >
        <p className="type-pixel mb-4 text-2xl text-phosphor">Message sent</p>
        <p className="mb-8 text-body text-ash">
          Thanks for reaching out — I read everything personally and reply within 24 hours.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="pill"
        >
          Send another
        </button>
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-7">
      {/* Honeypot — off-screen, not display:none, so bots still see it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${uid}-company`}>Company (leave blank)</label>
        <input
          id={`${uid}-company`}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="grid gap-7 sm:grid-cols-2">
        {/* Name */}
        <div>
          <label htmlFor={fieldId('name')} className="type-label mb-2.5 block text-ash">
            Name <span className="text-signal">*</span>
          </label>
          <input
            id={fieldId('name')}
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => setField('name', e.target.value)}
            onBlur={() => onBlur('name')}
            aria-invalid={Boolean(errors.name && touched.name)}
            aria-describedby={errors.name && touched.name ? errorId('name') : undefined}
            placeholder="Jane Smith"
            className={inputClass('name')}
          />
          {errors.name && touched.name && (
            <p id={errorId('name')} className="type-label mt-2 text-signal-bright">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor={fieldId('email')} className="type-label mb-2.5 block text-ash">
            Email <span className="text-signal">*</span>
          </label>
          <input
            id={fieldId('email')}
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => setField('email', e.target.value)}
            onBlur={() => onBlur('email')}
            aria-invalid={Boolean(errors.email && touched.email)}
            aria-describedby={errors.email && touched.email ? errorId('email') : undefined}
            placeholder="jane@company.com"
            className={inputClass('email')}
          />
          {errors.email && touched.email && (
            <p id={errorId('email')} className="type-label mt-2 text-signal-bright">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      {/* Subject */}
      <div>
        <label htmlFor={fieldId('subject')} className="type-label mb-2.5 block text-ash">
          Topic <span className="text-signal">*</span>
        </label>
        <select
          id={fieldId('subject')}
          name="subject"
          value={values.subject}
          onChange={(e) => setField('subject', e.target.value)}
          onBlur={() => onBlur('subject')}
          aria-invalid={Boolean(errors.subject && touched.subject)}
          aria-describedby={errors.subject && touched.subject ? errorId('subject') : undefined}
          className={clsx(inputClass('subject'), 'appearance-none')}
        >
          <option value="">Select a topic…</option>
          {SUBJECTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        {errors.subject && touched.subject && (
          <p id={errorId('subject')} className="type-label mt-2 text-signal-bright">
            {errors.subject}
          </p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor={fieldId('message')} className="type-label mb-2.5 block text-ash">
          Message <span className="text-signal">*</span>
        </label>
        <textarea
          id={fieldId('message')}
          name="message"
          rows={7}
          value={values.message}
          onChange={(e) => setField('message', e.target.value)}
          onBlur={() => onBlur('message')}
          aria-invalid={Boolean(errors.message && touched.message)}
          aria-describedby={errors.message && touched.message ? errorId('message') : undefined}
          placeholder="What are you building, and where do I fit?"
          className={clsx(inputClass('message'), 'resize-y')}
        />
        {errors.message && touched.message && (
          <p id={errorId('message')} className="type-label mt-2 text-signal-bright">
            {errors.message}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-5 border-t border-hairline pt-7">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="pill pill-signal disabled:opacity-60"
        >
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>
        <p className="type-label text-dust">Replies within 24 hours</p>
      </div>

      {/* Submit failure — announced, with a working way out. */}
      {status === 'error' && (
        <p role="alert" className="type-label border border-signal/50 px-4 py-3 text-signal-bright">
          Could not send ({submitError}). Please email{' '}
          <a href={`mailto:${site.email}`} className="underline">
            {site.email}
          </a>{' '}
          directly.
        </p>
      )}
    </form>
  )
}
