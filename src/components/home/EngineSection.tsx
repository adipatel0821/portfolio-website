'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import CenterpieceStage from '@/components/centerpiece/CenterpieceStage'
import PixelHeadline from '@/components/ui/PixelHeadline'
import PixelNumeral from '@/components/ui/PixelNumeral'
import HighlightText from '@/components/ui/HighlightText'
import Eyebrow from '@/components/ui/Eyebrow'
import Reveal from '@/components/ui/Reveal'
import MagneticButton from '@/components/ui/MagneticButton'
import TerminalType from '@/components/ui/TerminalType'
import { chapters } from '@/data/home'
import { RESUME_AVAILABLE, RESUME_PATH, site } from '@/lib/site'
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe'

/**
 * The signature moment: hero and the four capability chapters share one pinned
 * WebGL centerpiece that morphs as you scroll through them.
 *
 * Layout mechanics
 * ────────────────
 * The visual is `sticky top-0 h-screen` with `-mb-[100svh]`, which pins it for
 * the length of the section while removing it from the flow so the copy scrolls
 * over the top. That avoids a scroll-jacking pin library entirely, no
 * ScrollTrigger, no transform on the body, and native scrollbar behaviour is
 * preserved.
 *
 * Scrub mechanics
 * ───────────────
 * `useScroll` over the section yields 0..1; that maps to a 0..4 chapter float
 * handed to the centerpiece as a MotionValue. The value is read inside the
 * render loop's `useFrame`, so scrubbing the entire scene costs zero React
 * renders, the component tree never updates while you scroll.
 *
 * Reduced motion
 * ──────────────
 * No pin and no scrub. The section becomes ordinary stacked blocks, the
 * centerpiece renders its still CSS fallback, and chapters simply appear.
 */
export default function EngineSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotionSafe()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  // Five blocks (hero + 4 chapters) → the scrub travels 0..4.
  const rawChapter = useTransform(scrollYProgress, [0, 1], [0, 4])

  // A gentle spring absorbs Lenis's easing so the morph never judders at the
  // moment the wheel stops. restDelta keeps it from idling with tiny updates.
  const chapter = useSpring(rawChapter, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.0008,
  })

  // The hero copy lifts and fades as the first chapter takes over.
  const heroOpacity = useTransform(scrollYProgress, [0, 0.13], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.13], [0, -60])

  return (
    <div ref={sectionRef} className="relative">
      {/* ── Pinned visual ──
          -mb-[100svh] pulls the following content up over the sticky layer so
          it occupies no height in the flow. svh, not vh, so mobile browser
          chrome collapsing doesn't shift the pin. */}
      <div
        className="pointer-events-none sticky top-0 z-0 -mb-[100svh] h-[100svh] w-full"
        aria-hidden="true"
      >
        <CenterpieceStage chapter={chapter} />
        {/* Vignette: keeps the cloud from competing with type at the edges. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 78% 62% at 50% 50%, transparent 20%, rgba(6,6,6,0.55) 68%, rgba(6,6,6,0.92) 100%)',
          }}
        />
      </div>

      {/* ── Flowing content ── */}
      <div className="relative z-10">
        {/* ═══ HERO ═══ */}
        <motion.section
          aria-labelledby="hero-heading"
          // Explicitly positioned: the scroll hint below is absolute, and
          // without this it only has a containing block because Framer's
          // transform creates one, which does not exist under reduced motion.
          className="relative flex h-[100svh] flex-col justify-center"
          style={prefersReduced ? undefined : { opacity: heroOpacity, y: heroY }}
        >
          <div className="shell w-full">
            <Reveal delay={0.05} distance={14} priority>
              <Eyebrow label={site.name} sublabel="ML / DATA ENG" className="mb-7" />
            </Reveal>

            <PixelHeadline
              id="hero-heading"
              lines={['Systems that', 'learn.']}
              accentLines={[1]}
              delay={0.25}
              className="mb-8 max-w-[16ch]"
            />

            <Reveal delay={0.95} distance={16} priority>
              <p className="mb-10 max-w-[46ch] text-body-lg text-ash">
                Machine learning and data engineering, from{' '}
                <span className="text-chalk">GAN research</span> to{' '}
                <span className="text-chalk">cloud-scale deployment</span>.
              </p>
            </Reveal>

            <Reveal delay={1.1} distance={16} priority>
              <div className="flex flex-wrap items-center gap-3">
                <MagneticButton href="/projects" className="pill pill-signal">
                  <span className="bracket">View Work</span>
                </MagneticButton>
                {RESUME_AVAILABLE ? (
                  <MagneticButton href={RESUME_PATH} external className="pill">
                    Resume
                  </MagneticButton>
                ) : (
                  <MagneticButton href="/about" className="pill">
                    About Me
                  </MagneticButton>
                )}
              </div>
            </Reveal>

            <Reveal delay={1.3} distance={12} priority>
              <p className="badge-dashed mt-12">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-signal motion-safe:animate-dot-pulse"
                />
                Open to Opportunities
              </p>
            </Reveal>
          </div>

          {/* Scroll hint, terminal typing, bottom of the fold. */}
          <div className="shell absolute inset-x-0 bottom-8 hidden md:block">
            <TerminalType
              prompt="$"
              text={['scroll to load capabilities', 'four chapters', 'one point cloud']}
              className="text-label tracking-[0.22em] text-ash"
            />
          </div>
        </motion.section>

        {/* ═══ CHAPTERS 01–04 ═══ */}
        {chapters.map((chapterData, i) => {
          const [before, highlighted, after] = chapterData.headline
          // Alternate sides so the cloud is never permanently obscured.
          const alignRight = i % 2 === 1

          return (
            <section
              key={chapterData.num}
              aria-labelledby={`chapter-${chapterData.num}`}
              // 78svh rather than a full screen. The chapter still owns the
              // viewport when centred, but four of them at 100svh made the page
              // five screens tall before any real content began.
              className="flex h-[78svh] min-h-[30rem] items-center"
            >
              <div className="shell w-full">
                <div
                  className={
                    alignRight
                      ? 'ml-auto max-w-[54ch] text-left md:pl-12'
                      : 'max-w-[54ch] md:pr-12'
                  }
                >
                  <PixelNumeral
                    value={chapterData.num}
                    tone="signal"
                    className="mb-6"
                    label={`Chapter ${chapterData.num}: ${chapterData.eyebrow}`}
                  />

                  <Reveal delay={0.1}>
                    <Eyebrow
                      label={chapterData.eyebrow}
                      tone="phosphor"
                      className="mb-5"
                    />
                  </Reveal>

                  <Reveal delay={0.16}>
                    <h2
                      id={`chapter-${chapterData.num}`}
                      className="type-display mb-6 text-display-md text-chalk"
                    >
                      {before}
                      <HighlightText delay={0.45}>{highlighted}</HighlightText>
                      {after}
                    </h2>
                  </Reveal>

                  <Reveal delay={0.24}>
                    <p className="mb-8 text-body text-ash">{chapterData.body}</p>
                  </Reveal>

                  <Reveal delay={0.3}>
                    <dl className="border-b border-hairline-soft">
                      {chapterData.specs.map((spec) => (
                        <div key={spec.label} className="spec-row">
                          <dt>{spec.label}</dt>
                          <dd>{spec.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </Reveal>
                </div>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
