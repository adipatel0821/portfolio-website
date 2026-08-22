import type { Domain } from '@/data/projects'
import { clsx } from '@/lib/clsx'

/**
 * Per-project signature visual.
 *
 * Rather than a screenshot or a stock image, each project gets a point-and-line
 * glyph in the same visual language as the centerpiece, the formation that
 * matches its primary domain:
 *
 *   ML → network · Data Eng → pipeline · Web → lattice · IoT → mesh
 *
 * The layout is seeded from the project id, so every project's glyph is stable
 * across renders but distinct from its neighbours'. Rendered on the server as
 * plain SVG: no request, no JS, no layout shift.
 */

function makeRng(seedText: string) {
  let h = 2166136261
  for (let i = 0; i < seedText.length; i++) {
    h ^= seedText.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h ^= h << 13
    h ^= h >>> 17
    h ^= h << 5
    return ((h >>> 0) % 100000) / 100000
  }
}

const W = 320
const H = 200

interface Node {
  x: number
  y: number
  r: number
  accent: boolean
}

interface Edge {
  a: number
  b: number
}

/** Builds nodes + edges for the formation matching a domain. */
function build(domain: Domain, rng: () => number): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []

  if (domain === 'ML') {
    // Layered network: 4 columns, fully connected between neighbours.
    const cols = [3, 5, 5, 2]
    const idx: number[][] = []
    cols.forEach((count, c) => {
      const layer: number[] = []
      for (let i = 0; i < count; i++) {
        layer.push(nodes.length)
        nodes.push({
          x: 40 + (c * (W - 80)) / (cols.length - 1),
          y: H / 2 + ((i - (count - 1) / 2) * (H - 70)) / Math.max(count, 4),
          r: 2.6,
          accent: rng() < 0.2,
        })
      }
      idx.push(layer)
    })
    for (let c = 0; c < idx.length - 1; c++) {
      for (const a of idx[c]) for (const b of idx[c + 1]) edges.push({ a, b })
    }
  } else if (domain === 'Data Eng') {
    // Lanes flowing through gates.
    const lanes = 4
    const gates = 4
    const grid: number[][] = []
    for (let l = 0; l < lanes; l++) {
      const row: number[] = []
      for (let g = 0; g < gates; g++) {
        row.push(nodes.length)
        nodes.push({
          x: 44 + (g * (W - 88)) / (gates - 1),
          y: 40 + (l * (H - 80)) / (lanes - 1),
          r: 2.4,
          accent: g === gates - 1 && rng() < 0.6,
        })
      }
      grid.push(row)
    }
    // Horizontal flow, plus vertical gate bars.
    for (let l = 0; l < lanes; l++)
      for (let g = 0; g < gates - 1; g++) edges.push({ a: grid[l][g], b: grid[l][g + 1] })
    for (let g = 0; g < gates; g++)
      for (let l = 0; l < lanes - 1; l++) edges.push({ a: grid[l][g], b: grid[l + 1][g] })
  } else if (domain === 'Web') {
    // Isometric-ish lattice cell.
    const pts: [number, number][] = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ]
    const depth = 34
    const sx = W / 2 - 60
    const sy = H / 2 - 40
    pts.forEach(([px, py]) => {
      nodes.push({ x: sx + px * 120, y: sy + py * 80, r: 2.6, accent: false })
    })
    pts.forEach(([px, py]) => {
      nodes.push({ x: sx + px * 120 + depth, y: sy + py * 80 - depth, r: 2.6, accent: rng() < 0.3 })
    })
    for (let i = 0; i < 4; i++) {
      edges.push({ a: i, b: (i + 1) % 4 })
      edges.push({ a: i + 4, b: ((i + 1) % 4) + 4 })
      edges.push({ a: i, b: i + 4 })
    }
  } else {
    // IoT mesh: scattered sensors wired to near neighbours.
    const count = 11
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: 40 + rng() * (W - 80),
        y: 34 + rng() * (H - 68),
        r: 2.6,
        accent: rng() < 0.25,
      })
    }
    nodes.forEach((n, i) => {
      const near = nodes
        .map((m, j) => ({ j, d: (m.x - n.x) ** 2 + (m.y - n.y) ** 2 }))
        .filter((e) => e.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2)
      for (const { j } of near) if (i < j) edges.push({ a: i, b: j })
    })
  }

  return { nodes, edges }
}

interface ProjectGlyphProps {
  id: string
  domain: Domain
  className?: string
  /** Larger stroke and node radius for the case-study hero. */
  scale?: 'card' | 'hero'
}

export default function ProjectGlyph({ id, domain, className, scale = 'card' }: ProjectGlyphProps) {
  const { nodes, edges } = build(domain, makeRng(id))
  const hero = scale === 'hero'

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={clsx('h-full w-full', className)}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <g stroke="rgba(242,242,242,0.16)" strokeWidth={hero ? 0.9 : 0.7}>
        {edges.map((e, i) => (
          <line
            key={i}
            x1={nodes[e.a].x}
            y1={nodes[e.a].y}
            x2={nodes[e.b].x}
            y2={nodes[e.b].y}
          />
        ))}
      </g>
      <g>
        {nodes.map((n, i) => (
          <circle
            key={i}
            cx={n.x}
            cy={n.y}
            r={hero ? n.r * 1.4 : n.r}
            fill={n.accent ? 'var(--signal)' : 'rgba(242,242,242,0.7)'}
          />
        ))}
      </g>
    </svg>
  )
}
