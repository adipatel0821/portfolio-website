/**
 * Hand-written forward pass for the SynMedix conditional generator.
 *
 * No TensorFlow.js, no ONNX runtime, no WASM blob. The network is four matrix
 * multiplies, two batch-norm applications and two activations — roughly 17,600
 * parameters — so a runtime would cost several hundred kilobytes to do
 * arithmetic that fits in this file.
 *
 * Everything here mirrors torch semantics exactly:
 *   nn.Linear         y = xW^T + b   (torch stores weight as [out, in])
 *   nn.BatchNorm1d    eval mode — running stats, never batch stats
 *   nn.LeakyReLU(0.2)
 *   tanh              on the continuous head
 *   nn.Embedding      a row lookup
 *
 * Dropout is absent by design: it is the identity at inference.
 */

export interface FeatureSpec {
  key: string
  label: string
  unit: string
  min: number
  max: number
  mean: number
  std: number
  p25: number
  p75: number
}

interface TensorSpec {
  name: string
  shape: number[]
  offset: number
  size: number
}

export interface Manifest {
  architecture: string
  trainedOn: string
  latentDim: number
  hiddenDims: number[]
  conditionDim: number
  diagnosisDim: number
  numAgeBuckets: number
  numGenders: number
  numContinuous: number
  epochs: number
  parameterCount: number
  imputedCellFraction: number
  fullyCompleteRows: number
  marginalFit: { meanAbsErr: number; stdAbsErr: number }
  diagnosisCodes: string[]
  features: FeatureSpec[]
  tensors: TensorSpec[]
}

/** A view onto one tensor inside the flat weight blob — no copying. */
type Weights = Map<string, { data: Float32Array; shape: number[] }>

export interface GeneratorInput {
  /** Latent vector, length = latentDim. */
  z: Float32Array | number[]
  /** Age bucket index (age / 10, clamped to numAgeBuckets - 1). */
  ageBucket: number
  /** 0 = male, 1 = female, 2 = other/unknown. */
  gender: number
  /** Multi-hot over manifest.diagnosisCodes, length = diagnosisDim. */
  diagnosis: Float32Array | number[]
}

export class SynMedixGenerator {
  readonly manifest: Manifest
  private readonly w: Weights

  private constructor(manifest: Manifest, buffer: ArrayBuffer) {
    this.manifest = manifest
    const all = new Float32Array(buffer)
    this.w = new Map()
    for (const t of manifest.tensors) {
      this.w.set(t.name, {
        data: all.subarray(t.offset, t.offset + t.size),
        shape: t.shape,
      })
    }
  }

  /** Fetches the manifest and weights. Both are static assets under /models. */
  static async load(base = '/models/synmedix-generator'): Promise<SynMedixGenerator> {
    const [manifest, buffer] = await Promise.all([
      fetch(`${base}.json`).then((r) => {
        if (!r.ok) throw new Error(`manifest ${r.status}`)
        return r.json() as Promise<Manifest>
      }),
      fetch(`${base}.bin`).then((r) => {
        if (!r.ok) throw new Error(`weights ${r.status}`)
        return r.arrayBuffer()
      }),
    ])
    return new SynMedixGenerator(manifest, buffer)
  }

  private get(name: string) {
    const t = this.w.get(name)
    if (!t) throw new Error(`missing tensor: ${name}`)
    return t
  }

  /** y = xW^T + b, with torch's [out, in] weight layout. */
  private linear(x: Float32Array, weightName: string, biasName: string): Float32Array {
    const { data: W, shape } = this.get(weightName)
    const [outDim, inDim] = shape
    const b = this.w.get(biasName)?.data
    const y = new Float32Array(outDim)

    for (let o = 0; o < outDim; o++) {
      let sum = b ? b[o] : 0
      const row = o * inDim
      for (let i = 0; i < inDim; i++) sum += W[row + i] * x[i]
      y[o] = sum
    }
    return y
  }

  /**
   * BatchNorm1d in eval mode. Uses the running statistics captured during
   * training — using the current activations here would make a single-sample
   * forward pass produce zeros.
   */
  private batchNorm(x: Float32Array, prefix: string, eps = 1e-5): Float32Array {
    const gamma = this.get(`${prefix}.weight`).data
    const beta = this.get(`${prefix}.bias`).data
    const mean = this.get(`${prefix}.running_mean`).data
    const variance = this.get(`${prefix}.running_var`).data

    const y = new Float32Array(x.length)
    for (let i = 0; i < x.length; i++) {
      y[i] = ((x[i] - mean[i]) / Math.sqrt(variance[i] + eps)) * gamma[i] + beta[i]
    }
    return y
  }

  private static leakyRelu(x: Float32Array, slope = 0.2): Float32Array {
    const y = new Float32Array(x.length)
    for (let i = 0; i < x.length; i++) y[i] = x[i] > 0 ? x[i] : x[i] * slope
    return y
  }

  /** ConditionEmbedding: age ⊕ gender ⊕ projected diagnosis → LeakyReLU(fc). */
  private condition(ageBucket: number, gender: number, diagnosis: ArrayLike<number>): Float32Array {
    const { numAgeBuckets, numGenders, diagnosisDim } = this.manifest

    const ageW = this.get('cond.age_embed.weight')
    const genW = this.get('cond.gender_embed.weight')
    const ageEmbDim = ageW.shape[1]
    const genEmbDim = genW.shape[1]

    const a = Math.min(Math.max(Math.round(ageBucket), 0), numAgeBuckets - 1)
    const g = Math.min(Math.max(Math.round(gender), 0), numGenders - 1)

    const diag = new Float32Array(diagnosisDim)
    for (let i = 0; i < diagnosisDim; i++) diag[i] = diagnosis[i] ?? 0
    const projected = this.linear(diag, 'cond.diag_proj.weight', 'cond.diag_proj.bias')

    // Concatenation order must match the torch module: [age, gender, diag].
    const cat = new Float32Array(ageEmbDim + genEmbDim + projected.length)
    cat.set(ageW.data.subarray(a * ageEmbDim, (a + 1) * ageEmbDim), 0)
    cat.set(genW.data.subarray(g * genEmbDim, (g + 1) * genEmbDim), ageEmbDim)
    cat.set(projected, ageEmbDim + genEmbDim)

    return SynMedixGenerator.leakyRelu(
      this.linear(cat, 'cond.fc.0.weight', 'cond.fc.0.bias'),
    )
  }

  /**
   * Runs the generator and returns continuous features in real clinical units.
   *
   * The tanh head emits [-1, 1]; training scaled each feature to that range
   * from its 1st–99th percentile, so denormalising inverts exactly that.
   */
  generate(input: GeneratorInput): number[] {
    const { latentDim, hiddenDims, features } = this.manifest

    const cond = this.condition(input.ageBucket, input.gender, input.diagnosis)

    // Trunk input is [z, condition].
    const x = new Float32Array(latentDim + cond.length)
    for (let i = 0; i < latentDim; i++) x[i] = input.z[i] ?? 0
    x.set(cond, latentDim)

    // Each hidden block is Linear → BatchNorm → LeakyReLU → Dropout(identity),
    // which is why the torch module indices advance by four.
    let h: Float32Array = x
    for (let layer = 0; layer < hiddenDims.length; layer++) {
      const base = layer * 4
      h = this.linear(h, `gen.trunk.${base}.weight`, `gen.trunk.${base}.bias`)
      h = this.batchNorm(h, `gen.trunk.${base + 1}`)
      h = SynMedixGenerator.leakyRelu(h)
    }

    const raw = this.linear(h, 'gen.continuous_head.weight', 'gen.continuous_head.bias')

    return features.map((f, i) => {
      const activated = Math.tanh(raw[i])
      return ((activated + 1) / 2) * (f.max - f.min) + f.min
    })
  }
}

/** Box–Muller standard normal — the latent prior the model was trained under. */
export function randomLatent(dim: number): Float32Array {
  const z = new Float32Array(dim)
  for (let i = 0; i < dim; i++) {
    let u = 0
    let v = 0
    while (u === 0) u = Math.random()
    while (v === 0) v = Math.random()
    z[i] = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
  return z
}
