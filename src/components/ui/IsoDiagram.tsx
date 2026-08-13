import { clsx } from '@/lib/clsx'

/**
 * Isometric line diagrams for the "how it works" rows.
 *
 * Drawn as real isometric projection rather than eyeballed parallelograms —
 * every vertex goes through `iso()`, so the boxes actually line up and the
 * shared edges meet. White/hairline strokes only; no fills beyond a 4% wash.
 */

/** True isometric projection: 30° axes. */
function iso(x: number, y: number, z: number): [number, number] {
  const COS30 = 0.8660254
  return [(x - z) * COS30, (x + z) * 0.5 - y]
}

function pt(p: [number, number]): string {
  return `${p[0].toFixed(2)},${p[1].toFixed(2)}`
}

/**
 * The three visible faces of an axis-aligned cuboid whose near-bottom corner
 * sits at (x, y, z), sized (w, h, d).
 */
function isoBox(x: number, y: number, z: number, w: number, h: number, d: number) {
  const v = {
    // bottom
    b0: iso(x, y, z),
    b1: iso(x + w, y, z),
    b3: iso(x, y, z + d),
    // top
    t0: iso(x, y + h, z),
    t1: iso(x + w, y + h, z),
    t2: iso(x + w, y + h, z + d),
    t3: iso(x, y + h, z + d),
  }
  return {
    top: [v.t0, v.t1, v.t2, v.t3].map(pt).join(' '),
    left: [v.b0, v.t0, v.t3, v.b3].map(pt).join(' '),
    right: [v.b0, v.b1, v.t1, v.t0].map(pt).join(' '),
  }
}

function Box({
  x,
  y,
  z,
  w,
  h,
  d,
  accent = false,
}: {
  x: number
  y: number
  z: number
  w: number
  h: number
  d: number
  accent?: boolean
}) {
  const f = isoBox(x, y, z, w, h, d)
  const stroke = accent ? 'var(--signal)' : 'rgba(242,242,242,0.55)'
  const wash = accent ? 'rgba(232,106,43,0.10)' : 'rgba(242,242,242,0.04)'
  return (
    <g strokeWidth={0.9} strokeLinejoin="round" vectorEffect="non-scaling-stroke">
      <polygon points={f.left} fill={wash} stroke={stroke} />
      <polygon points={f.right} fill="rgba(0,0,0,0.25)" stroke={stroke} />
      <polygon points={f.top} fill={wash} stroke={stroke} />
    </g>
  )
}

/** A dashed connector between two 3-space points. */
function Link({
  from,
  to,
  accent = false,
}: {
  from: [number, number, number]
  to: [number, number, number]
  accent?: boolean
}) {
  const a = iso(...from)
  const b = iso(...to)
  return (
    <line
      x1={a[0]}
      y1={a[1]}
      x2={b[0]}
      y2={b[1]}
      stroke={accent ? 'var(--signal)' : 'rgba(242,242,242,0.32)'}
      strokeWidth={0.8}
      strokeDasharray="2.5 2.5"
      vectorEffect="non-scaling-stroke"
    />
  )
}

export type IsoVariant = 'ingest' | 'parallel' | 'generate'

interface IsoDiagramProps {
  variant: IsoVariant
  className?: string
  /** Describes the diagram for assistive tech. */
  title: string
}

export default function IsoDiagram({ variant, className, title }: IsoDiagramProps) {
  return (
    <svg
      viewBox="-60 -46 120 92"
      className={clsx('h-auto w-full', className)}
      role="img"
      aria-label={title}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* ── Ingest: three scattered sources feeding one consolidated store ── */}
      {variant === 'ingest' && (
        <g>
          <Link from={[-26, 2, -14]} to={[6, 2, 6]} />
          <Link from={[-26, 2, 10]} to={[6, 2, 6]} />
          <Link from={[-26, 2, 26]} to={[6, 2, 6]} />
          <Box x={-34} y={0} z={-18} w={9} h={5} d={9} />
          <Box x={-34} y={0} z={6} w={9} h={7} d={9} />
          <Box x={-34} y={0} z={22} w={9} h={4} d={9} />
          <Box x={4} y={0} z={2} w={16} h={18} d={16} accent />
        </g>
      )}

      {/* ── Parallel: one input fanned across worker cells, then rejoined ── */}
      {variant === 'parallel' && (
        <g>
          <Box x={-38} y={0} z={4} w={11} h={13} d={11} />
          {[-16, 0, 16].map((z, i) => (
            <g key={z}>
              <Link from={[-26, 4, 9]} to={[-6, 3, z + 5]} />
              <Box x={-8} y={0} z={z} w={10} h={6 + i * 2} d={10} />
              <Link from={[4, 3, z + 5]} to={[22, 4, 9]} />
            </g>
          ))}
          <Box x={20} y={0} z={4} w={11} h={13} d={11} accent />
        </g>
      )}

      {/* ── Generate: a model block emitting a field of synthetic points ── */}
      {variant === 'generate' && (
        <g>
          <Box x={-34} y={0} z={0} w={18} h={16} d={18} accent />
          {Array.from({ length: 26 }, (_, i) => {
            // Deterministic scatter — this renders on the server.
            const r = (Math.sin(i * 12.9898) * 43758.5453) % 1
            const s = (Math.sin(i * 78.233) * 43758.5453) % 1
            const x = 2 + Math.abs(r) * 34
            const z = Math.abs(s) * 34
            const y = 2 + Math.abs(r * s) * 16
            const [sx, sy] = iso(x, y, z)
            return (
              <rect
                key={i}
                x={sx}
                y={sy}
                width={1.6}
                height={1.6}
                fill={i % 7 === 0 ? 'var(--phosphor)' : 'rgba(242,242,242,0.6)'}
              />
            )
          })}
          <Link from={[-14, 8, 9]} to={[4, 8, 9]} accent />
        </g>
      )}
    </svg>
  )
}
