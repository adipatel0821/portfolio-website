'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  SynMedixGenerator,
  randomLatent,
  type FeatureSpec,
} from '@/lib/synmedix/inference'
import { clsx } from '@/lib/clsx'

/**
 * Interactive latent-space explorer for the SynMedix generator.
 *
 * This is not a mock. It loads real weights from a real WGAN-GP training run
 * and runs the forward pass in the browser on every input change — inference is
 * ~17.6k multiply-accumulates, so it completes in well under a millisecond and
 * can be driven synchronously from a slider's onChange.
 *
 * Each generated value is plotted against the real cohort's distribution for
 * that feature, so you can see whether the model is producing something
 * plausible rather than just believing a number.
 */

/** How many latent dimensions get their own slider. The rest are resampled. */
const EXPOSED_LATENTS = 6

const GENDERS = [
  { value: 0, label: 'Male' },
  { value: 1, label: 'Female' },
  { value: 2, label: 'Other' },
]

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

/** One feature row: value, unit, and its position within the cohort range. */
function FeatureRow({ spec, value }: { spec: FeatureSpec; value: number }) {
  const span = spec.max - spec.min || 1
  const pct = (v: number) => Math.min(100, Math.max(0, ((v - spec.min) / span) * 100))

  const position = pct(value)
  const iqrStart = pct(spec.p25)
  const iqrWidth = Math.max(0.5, pct(spec.p75) - iqrStart)

  // Flag values outside the observed range of the training cohort — a generator
  // can extrapolate, and pretending otherwise would be the dishonest choice.
  const outside = value < spec.p25 - span * 0.35 || value > spec.p75 + span * 0.35

  const decimals = spec.max > 100 ? 0 : spec.max > 10 ? 1 : 2

  return (
    <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-2 border-t border-hairline-soft py-3">
      <span className="type-label text-ash">{spec.label}</span>
      <span className="font-mono text-sm tabular-nums text-chalk">
        {value.toFixed(decimals)}
        <span className="ml-1.5 text-[0.6875rem] text-dust">{spec.unit}</span>
      </span>

      {/* Distribution track: full observed range, with the interquartile band
          shaded and the generated value marked. */}
      <div className="col-span-2 relative h-1.5 w-full bg-ink-600">
        <span
          aria-hidden="true"
          className="absolute inset-y-0 bg-[rgba(255,255,255,0.10)]"
          style={{ left: `${iqrStart}%`, width: `${iqrWidth}%` }}
        />
        <span
          aria-hidden="true"
          className={clsx(
            'absolute -top-0.5 h-2.5 w-[3px] transition-[left] duration-200 ease-cinema motion-reduce:transition-none',
            outside ? 'bg-signal' : 'bg-phosphor',
          )}
          style={{ left: `calc(${position}% - 1.5px)` }}
        />
      </div>
    </div>
  )
}

export default function LatentExplorer() {
  const generatorRef = useRef<SynMedixGenerator | null>(null)
  const [state, setState] = useState<LoadState>('idle')
  const [error, setError] = useState('')

  const [latent, setLatent] = useState<number[]>([])
  const [age, setAge] = useState(54)
  const [gender, setGender] = useState(1)
  const [diagnosis, setDiagnosis] = useState<boolean[]>([])
  const [values, setValues] = useState<number[]>([])

  const manifest = generatorRef.current?.manifest

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setState('loading')

    SynMedixGenerator.load()
      .then((generator) => {
        if (cancelled) return
        generatorRef.current = generator
        const z = Array.from(randomLatent(generator.manifest.latentDim))
        setLatent(z)
        setDiagnosis(new Array(generator.manifest.diagnosisDim).fill(false))
        setState('ready')
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load model')
        setState('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  // ── Inference ─────────────────────────────────────────────────────────────
  // Runs synchronously on every change. At this size that is the simplest
  // correct thing: no worker, no debounce, no stale-render race.
  const run = useCallback(
    (z: number[], ageValue: number, genderValue: number, diag: boolean[]) => {
      const generator = generatorRef.current
      if (!generator) return
      setValues(
        generator.generate({
          z,
          ageBucket: Math.floor(ageValue / 10),
          gender: genderValue,
          diagnosis: diag.map((d) => (d ? 1 : 0)),
        }),
      )
    },
    [],
  )

  useEffect(() => {
    if (state === 'ready') run(latent, age, gender, diagnosis)
  }, [state, latent, age, gender, diagnosis, run])

  const resample = () => {
    if (!manifest) return
    setLatent(Array.from(randomLatent(manifest.latentDim)))
  }

  const setLatentAt = (index: number, value: number) => {
    setLatent((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const features = manifest?.features ?? []
  const fit = manifest?.marginalFit

  const stats = useMemo(
    () =>
      manifest
        ? [
            { label: 'Parameters', value: manifest.parameterCount.toLocaleString('en-US') },
            { label: 'Latent dims', value: String(manifest.latentDim) },
            { label: 'Training epochs', value: String(manifest.epochs) },
            {
              label: 'Marginal error',
              value: fit ? `${(fit.meanAbsErr * 100).toFixed(1)}%` : '—',
            },
          ]
        : [],
    [manifest, fit],
  )

  // ── States ────────────────────────────────────────────────────────────────
  if (state === 'error') {
    return (
      <div role="alert" className="border border-signal/50 bg-ink-800 p-8">
        <p className="type-label mb-2 text-signal">Model failed to load</p>
        <p className="text-spec text-ash">
          {error}. The explorer needs two static files from <code>/models</code>.
        </p>
      </div>
    )
  }

  if (state !== 'ready' || !manifest) {
    return (
      <div className="border border-hairline bg-ink-800 p-8" aria-busy="true">
        <p className="type-label text-ash">Loading generator weights…</p>
      </div>
    )
  }

  return (
    <div className="border border-hairline bg-ink-800">
      {/* ── Provenance ── */}
      <div className="border-b border-hairline p-6 md:p-8">
        <p className="type-label mb-3 text-phosphor">Live model · runs in your browser</p>
        <p className="max-w-prose text-spec text-ash">
          A conditional WGAN-GP generator using the SynMedix architecture, trained on the
          project&apos;s {manifest.trainedOn}. The forward pass is hand-written TypeScript —
          no inference runtime — and matches the PyTorch original to within 2.5×10⁻⁵.
          Move anything below and every value regenerates.
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="type-label mb-1 text-dust">{s.label}</dt>
              <dd className="type-pixel text-base text-signal">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,320px)_1fr]">
        {/* ── Controls ── */}
        <div className="border-b border-hairline p-6 md:p-8 lg:border-b-0 lg:border-r">
          <h3 className="type-label mb-6 text-chalk">Conditioning</h3>

          <div className="mb-6">
            <label htmlFor="lx-age" className="type-label mb-2 block text-ash">
              Age <span className="text-chalk">{age}</span>
            </label>
            <input
              id="lx-age"
              type="range"
              min={10}
              max={99}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="lx-range"
            />
          </div>

          <fieldset className="mb-7">
            <legend className="type-label mb-2 text-ash">Gender</legend>
            <div className="flex gap-2">
              {GENDERS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGender(g.value)}
                  aria-pressed={gender === g.value}
                  className={clsx(
                    'type-label border px-3 py-1.5 transition-colors duration-300',
                    gender === g.value
                      ? 'border-signal bg-signal text-[#0a0a0a]'
                      : 'border-hairline text-ash hover:text-chalk',
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mb-8">
            <legend className="type-label mb-2 text-ash">Diagnosis codes</legend>
            <div className="flex flex-wrap gap-1.5">
              {manifest.diagnosisCodes.map((code, i) => (
                <button
                  key={code}
                  type="button"
                  onClick={() =>
                    setDiagnosis((prev) => prev.map((d, j) => (j === i ? !d : d)))
                  }
                  aria-pressed={diagnosis[i] ?? false}
                  className={clsx(
                    'border px-2 py-1 font-mono text-[0.6875rem] transition-colors duration-300',
                    diagnosis[i]
                      ? 'border-phosphor text-phosphor'
                      : 'border-hairline text-dust hover:text-ash',
                  )}
                >
                  {code}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mb-4 flex items-center justify-between">
            <h3 className="type-label text-chalk">Latent vector</h3>
            <button type="button" onClick={resample} className="type-label text-signal underline">
              Resample
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {Array.from({ length: EXPOSED_LATENTS }, (_, i) => (
              <div key={i}>
                <label htmlFor={`lx-z${i}`} className="type-label mb-1 flex justify-between text-dust">
                  <span>z{i}</span>
                  <span className="tabular-nums text-ash">{(latent[i] ?? 0).toFixed(2)}</span>
                </label>
                <input
                  id={`lx-z${i}`}
                  type="range"
                  min={-3}
                  max={3}
                  step={0.05}
                  value={latent[i] ?? 0}
                  onChange={(e) => setLatentAt(i, Number(e.target.value))}
                  className="lx-range"
                />
              </div>
            ))}
            <p className="type-label mt-1 text-dust">
              {manifest.latentDim - EXPOSED_LATENTS} further dimensions are resampled
            </p>
          </div>
        </div>

        {/* ── Output ── */}
        <div className="p-6 md:p-8">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="type-label text-chalk">Generated patient record</h3>
            <p className="type-label flex items-center gap-4 text-dust">
              <span className="flex items-center gap-1.5">
                <span aria-hidden="true" className="inline-block h-2 w-[3px] bg-phosphor" />
                value
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="inline-block h-1.5 w-4 bg-[rgba(255,255,255,0.10)]"
                />
                cohort IQR
              </span>
            </p>
          </div>

          <div className="grid gap-x-10 sm:grid-cols-2">
            {features.map((spec, i) => (
              <FeatureRow key={spec.key} spec={spec} value={values[i] ?? spec.mean} />
            ))}
          </div>

          <p className="mt-7 border-t border-hairline pt-5 text-[0.6875rem] leading-relaxed text-dust">
            Synthetic output for demonstration. Trained on the SynMedix sample cohort, not
            on clinical data — these are not real patients and carry no diagnostic meaning.
          </p>
        </div>
      </div>
    </div>
  )
}
