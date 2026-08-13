/**
 * THE LATENT ENGINE — formation geometry.
 *
 * One particle buffer, five target arrangements. The same points are reused
 * throughout the page: they never reset, they reorganise. Each formation
 * corresponds to a capability chapter.
 *
 *   0  NOISE     raw, unlabelled data — the hero state
 *   1  NETWORK   a layered neural net (01 · Machine Learning & AI)
 *   2  PIPELINE  a DAG of lanes and stage gates (02 · Data Engineering)
 *   3  LATTICE   an isometric structural grid (03 · Full-Stack)
 *   4  MESH      a sparse sensor mesh (04 · IoT & Embedded)
 *
 * Every generator writes into the same Float32Array layout and keeps points
 * within roughly a 3-unit cube centred on the origin, so morphing between any
 * two never causes a jarring change of scale.
 */

export const FORMATION_COUNT = 5

export const FORMATION_NAMES = ['noise', 'network', 'pipeline', 'lattice', 'mesh'] as const
export type FormationName = (typeof FORMATION_NAMES)[number]

/** Deterministic PRNG (mulberry32) so a reload produces the identical cloud. */
function makeRng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Normally distributed sample via Box–Muller. */
function gaussian(rng: () => number): number {
  let u = 0
  let v = 0
  while (u === 0) u = rng()
  while (v === 0) v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

type Vec3 = [number, number, number]

// ─── 0 · NOISE ────────────────────────────────────────────────────────────────
// A drifting gaussian cloud. Deliberately shapeless: this is the "before".

function noise(out: Float32Array, count: number, rng: () => number) {
  for (let i = 0; i < count; i++) {
    out[i * 3] = gaussian(rng) * 0.85
    out[i * 3 + 1] = gaussian(rng) * 0.62
    out[i * 3 + 2] = gaussian(rng) * 0.72
  }
}

// ─── 1 · NETWORK ──────────────────────────────────────────────────────────────
// Four fully-connected layers. Roughly a third of the points sit on the nodes;
// the rest ride the edges, which is what makes the connections legible.

const LAYERS: { x: number; nodes: number }[] = [
  { x: -1.45, nodes: 5 },
  { x: -0.48, nodes: 9 },
  { x: 0.48, nodes: 9 },
  { x: 1.45, nodes: 3 },
]

function layerNodePositions(): Vec3[][] {
  return LAYERS.map(({ x, nodes }) => {
    const span = nodes === 1 ? 0 : 1.5
    return Array.from({ length: nodes }, (_, i): Vec3 => {
      const t = nodes === 1 ? 0.5 : i / (nodes - 1)
      return [x, (t - 0.5) * span, 0]
    })
  })
}

function network(out: Float32Array, count: number, rng: () => number) {
  const layers = layerNodePositions()
  const nodeShare = Math.floor(count * 0.32)

  for (let i = 0; i < count; i++) {
    if (i < nodeShare) {
      // Tight gaussian blob at a node — reads as a solid vertex.
      const l = layers[Math.floor(rng() * layers.length)]
      const n = l[Math.floor(rng() * l.length)]
      out[i * 3] = n[0] + gaussian(rng) * 0.045
      out[i * 3 + 1] = n[1] + gaussian(rng) * 0.045
      out[i * 3 + 2] = n[2] + gaussian(rng) * 0.045
    } else {
      // A point somewhere along a randomly chosen edge.
      const li = Math.floor(rng() * (layers.length - 1))
      const a = layers[li][Math.floor(rng() * layers[li].length)]
      const b = layers[li + 1][Math.floor(rng() * layers[li + 1].length)]
      const t = rng()
      out[i * 3] = a[0] + (b[0] - a[0]) * t + gaussian(rng) * 0.012
      out[i * 3 + 1] = a[1] + (b[1] - a[1]) * t + gaussian(rng) * 0.012
      out[i * 3 + 2] = gaussian(rng) * 0.05
    }
  }
}

// ─── 2 · PIPELINE ─────────────────────────────────────────────────────────────
// Parallel lanes flowing left to right through four stage gates. An Airflow DAG
// made literal.

const LANE_YS = [-0.78, -0.39, 0, 0.39, 0.78]
const GATE_XS = [-1.05, -0.35, 0.35, 1.05]

function pipeline(out: Float32Array, count: number, rng: () => number) {
  const gateShare = Math.floor(count * 0.26)

  for (let i = 0; i < count; i++) {
    if (i < gateShare) {
      // Vertical bars at each gate, spanning the full lane stack.
      const gx = GATE_XS[Math.floor(rng() * GATE_XS.length)]
      out[i * 3] = gx + gaussian(rng) * 0.018
      out[i * 3 + 1] = (rng() - 0.5) * 1.9
      out[i * 3 + 2] = gaussian(rng) * 0.06
    } else {
      // Streaming along a lane. Slight z spread keeps the lanes from reading
      // as flat ribbons when the camera pushes in.
      const y = LANE_YS[Math.floor(rng() * LANE_YS.length)]
      out[i * 3] = (rng() - 0.5) * 3.2
      out[i * 3 + 1] = y + gaussian(rng) * 0.022
      out[i * 3 + 2] = gaussian(rng) * 0.09
    }
  }
}

// ─── 3 · LATTICE ──────────────────────────────────────────────────────────────
// Points along the edges of a 4×4×4 cell grid — a structure being assembled.

function lattice(out: Float32Array, count: number, rng: () => number) {
  const DIV = 4 // cells per axis
  const HALF = 1.15
  const step = (HALF * 2) / DIV
  const gridVal = (i: number) => -HALF + i * step

  for (let i = 0; i < count; i++) {
    // Pick an axis to run along, then snap the other two to grid lines.
    const axis = Math.floor(rng() * 3)
    const b = gridVal(Math.floor(rng() * (DIV + 1)))
    const c = gridVal(Math.floor(rng() * (DIV + 1)))
    const t = -HALF + rng() * HALF * 2
    const j = gaussian(rng) * 0.008

    const p: Vec3 = axis === 0 ? [t, b, c] : axis === 1 ? [b, t, c] : [b, c, t]
    out[i * 3] = p[0] + j
    out[i * 3 + 1] = p[1] + j
    out[i * 3 + 2] = p[2] + j
  }
}

// ─── 4 · MESH ─────────────────────────────────────────────────────────────────
// Sensor nodes on a sphere, wired to their nearest neighbours.

function fibonacciSphere(n: number, radius: number): Vec3[] {
  const pts: Vec3[] = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i
    pts.push([Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius])
  }
  return pts
}

function mesh(out: Float32Array, count: number, rng: () => number) {
  const NODES = 42
  const nodes = fibonacciSphere(NODES, 1.28)

  // Wire each node to its three nearest neighbours; dedupe so shared links
  // don't get double the particle density.
  const links: [number, number][] = []
  const seen = new Set<string>()
  for (let i = 0; i < NODES; i++) {
    const dists = nodes
      .map((p, j) => ({
        j,
        d: (p[0] - nodes[i][0]) ** 2 + (p[1] - nodes[i][1]) ** 2 + (p[2] - nodes[i][2]) ** 2,
      }))
      .filter((e) => e.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 3)
    for (const { j } of dists) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`
      if (seen.has(key)) continue
      seen.add(key)
      links.push([i, j])
    }
  }

  const nodeShare = Math.floor(count * 0.3)
  for (let i = 0; i < count; i++) {
    if (i < nodeShare) {
      const n = nodes[Math.floor(rng() * nodes.length)]
      out[i * 3] = n[0] + gaussian(rng) * 0.035
      out[i * 3 + 1] = n[1] + gaussian(rng) * 0.035
      out[i * 3 + 2] = n[2] + gaussian(rng) * 0.035
    } else {
      const [a, b] = links[Math.floor(rng() * links.length)]
      const t = rng()
      out[i * 3] = nodes[a][0] + (nodes[b][0] - nodes[a][0]) * t + gaussian(rng) * 0.01
      out[i * 3 + 1] = nodes[a][1] + (nodes[b][1] - nodes[a][1]) * t + gaussian(rng) * 0.01
      out[i * 3 + 2] = nodes[a][2] + (nodes[b][2] - nodes[a][2]) * t + gaussian(rng) * 0.01
    }
  }
}

const GENERATORS = [noise, network, pipeline, lattice, mesh] as const

/**
 * Packs every formation into one RGB float texture.
 *
 * Layout: `width` columns, `rowsPerFormation` rows per formation, formations
 * stacked vertically. The vertex shader derives its own UV from gl_VertexID, so
 * morphing costs one texture fetch per formation per vertex and zero CPU work
 * per frame.
 *
 * A flat 1 × N texture would be simpler but blows past MAX_TEXTURE_SIZE at
 * realistic particle counts, hence the tiling.
 */
export function buildFormationTexture(count: number, width = 512) {
  const rowsPerFormation = Math.ceil(count / width)
  const height = rowsPerFormation * FORMATION_COUNT
  const data = new Float32Array(width * height * 4)

  const scratch = new Float32Array(count * 3)

  GENERATORS.forEach((generate, f) => {
    // Distinct seed per formation, stable across reloads.
    generate(scratch, count, makeRng(0x9e37 + f * 7919))

    const rowOffset = f * rowsPerFormation
    for (let i = 0; i < count; i++) {
      const col = i % width
      const row = rowOffset + Math.floor(i / width)
      const o = (row * width + col) * 4
      data[o] = scratch[i * 3]
      data[o + 1] = scratch[i * 3 + 1]
      data[o + 2] = scratch[i * 3 + 2]
      data[o + 3] = 1
    }
  })

  return { data, width, height, rowsPerFormation }
}

/**
 * Per-particle static attributes: a stable random seed and a colour role.
 *
 * Roles: 0 = chalk/ash base (the bulk), 1 = signal orange (~9%),
 * 2 = phosphor green (~4%, concentrated in the terminal motif).
 */
export function buildAttributes(count: number) {
  const rng = makeRng(0x51ed)
  const seeds = new Float32Array(count)
  const roles = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    seeds[i] = rng()
    const r = rng()
    roles[i] = r < 0.09 ? 1 : r < 0.13 ? 2 : 0
  }

  return { seeds, roles }
}
