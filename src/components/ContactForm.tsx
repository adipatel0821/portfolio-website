'use client'

import { useState, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, CheckCircle, RotateCcw, AlertCircle } from 'lucide-react'

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch(
        `https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_ID}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(form),
        },
      )
      if (res.ok) {
        setStatus('success')
        setForm({ name: '', email: '', subject: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const reset = () => {
    setStatus('idle')
    setForm({ name: '', email: '', subject: '', message: '' })
  }

  const retryOnError = () => setStatus('idle')

  return (
    <div
      className="glass-card h-full"
      style={{ borderRadius: 26, padding: '2.5rem' }}
    >
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center gap-5 h-full"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14 }}
              style={{ color: '#10b981' }}
            >
              <CheckCircle size={72} />
            </motion.div>
            <div>
              <h3 className="font-display font-black text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
                Message Received!
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Thanks for reaching out. I&apos;ll reply within 24 hours.
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={reset}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold"
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--accent-primary)' }}
            >
              <RotateCcw size={15} />Send Another
            </motion.button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-5"
          >
            {/* Form header */}
            <div className="mb-1">
              <p className="section-label mb-1">Send a Message</p>
              <h3 className="font-display font-black text-2xl" style={{ color: 'var(--text-primary)' }}>
                Drop Me a Line
              </h3>
            </div>

            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Full Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  required
                  placeholder="Jane Smith"
                  className="glass-input"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  required
                  placeholder="jane@company.com"
                  className="glass-input"
                />
              </div>
            </div>

            {/* Subject */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Subject
              </label>
              <select
                name="subject"
                value={form.subject}
                onChange={onChange}
                required
                className="glass-input"
                style={{ appearance: 'none' }}
              >
                <option value="" disabled>Select a topic...</option>
                <option value="job">Full-time / Contract Role</option>
                <option value="collab">Project Collaboration</option>
                <option value="startup">Co-founding Opportunity</option>
                <option value="invest">Investor Inquiry</option>
                <option value="speaking">Speaking / Media</option>
                <option value="other">Just Saying Hello 👋</option>
              </select>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Message
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={onChange}
                required
                rows={5}
                placeholder="Tell me about your project, idea, or opportunity. The more detail, the better."
                className="glass-input resize-none"
              />
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={status === 'sending'}
              whileHover={status === 'idle' ? { scale: 1.02, boxShadow: '0 0 40px var(--accent-glow)' } : {}}
              whileTap={status === 'idle' ? { scale: 0.97 } : {}}
              className="liquid-btn w-full flex items-center justify-center gap-2.5 py-4 text-base font-bold shadow-xl"
              style={{ opacity: status === 'sending' ? 0.82 : 1 }}
            >
              {status === 'sending' ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Sending your message...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Message
                </>
              )}
            </motion.button>

            {/* Error message */}
            {status === 'error' && (
              <div className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                <AlertCircle size={16} />
                Something went wrong — please try again or email me directly.
              </div>
            )}

            {/* Privacy note */}
            <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              🔒 Your message is private. I never share contact details.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
