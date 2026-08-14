import type { SpecGroup } from '@/components/ui/SpecGrid'

/**
 * Home page copy. Kept out of the components so the wording can be revised
 * without touching layout or motion logic.
 */

export interface Chapter {
  num: string
  eyebrow: string
  /** Split around the highlighted word: [before, highlighted, after] */
  headline: [string, string, string]
  body: string
  specs: { label: string; value: string }[]
}

/**
 * The four capability chapters. Their order is load-bearing: the centerpiece
 * morphs to formation N as chapter N enters the viewport.
 *   01 → network · 02 → pipeline · 03 → lattice · 04 → mesh
 */
export const chapters: Chapter[] = [
  {
    num: '01',
    eyebrow: 'Machine Learning & AI',
    headline: ['Models that survive contact with ', 'production', '.'],
    body: 'GANs, diffusion models, and LLM systems in PyTorch and TensorFlow — taken past the notebook into deployed inference on AWS SageMaker and GCP Vertex AI. The paper is the easy half.',
    specs: [
      { label: 'Generative', value: 'WGAN-GP · Conditional DDPM · PaLM-E' },
      { label: 'Frameworks', value: 'PyTorch · TensorFlow · Keras' },
      { label: 'Serving', value: 'SageMaker · Vertex AI · RunPod' },
    ],
  },
  {
    num: '02',
    eyebrow: 'Data Engineering',
    headline: ['Pipelines built to be ', 'boring', '.'],
    body: 'End-to-end ETL orchestrated in Apache Airflow, with automated quality gates and parallel execution. A pipeline nobody has to think about is a pipeline that works.',
    specs: [
      { label: 'Orchestration', value: 'Apache Airflow · BullMQ' },
      { label: 'Stores', value: 'PostgreSQL · DynamoDB · S3 · DuckDB' },
      { label: 'Scale', value: '~10 GB EHR · 3× throughput' },
    ],
  },
  {
    num: '03',
    eyebrow: 'Full-Stack Development',
    headline: ['The surface that makes it ', 'usable', '.'],
    body: 'Typed Next.js frontends over REST APIs in ASP.NET MVC and Node. A model with no interface is a result nobody can act on.',
    specs: [
      { label: 'Frontend', value: 'Next.js · TypeScript · React' },
      { label: 'Backend', value: 'ASP.NET MVC · C# · Fastify' },
      { label: 'Contracts', value: 'REST · role-based access control' },
    ],
  },
  {
    num: '04',
    eyebrow: 'IoT & Embedded',
    headline: ['Where the data ', 'actually', ' comes from.'],
    body: 'Arduino and Raspberry Pi sensor firmware, local aggregation, and real-time dashboards. Before anything can be modelled, something physical has to measure it.',
    specs: [
      { label: 'Hardware', value: 'Arduino · Raspberry Pi' },
      { label: 'Telemetry', value: 'Real-time aggregation · anomaly alerts' },
      { label: 'Shipped', value: 'SHEMS energy monitor' },
    ],
  },
]

/** Count-up stats. `value` is numeric so CountUp can animate it. */
export const stats = [
  { value: 4, suffix: '', label: 'Industry internships', sub: 'AI · Data Eng · Web · IoT' },
  { value: 9, suffix: '', label: 'Projects shipped', sub: 'ML, ETL, IoT & web' },
  { value: 50, suffix: 'K+', label: 'Synthetic records', sub: 'SynMedix on SageMaker' },
  { value: 84, suffix: '', label: 'Instruments modelled', sub: 'Global Market Lab' },
]

/** The reference's "Technical specifications" block, populated with real stack. */
export const techSpecs: SpecGroup[] = [
  {
    num: '01',
    title: 'Languages',
    rows: [
      { label: 'Primary', value: 'Python' },
      { label: 'Backend', value: 'C# · C / C++' },
      { label: 'Web', value: 'TypeScript · JavaScript' },
      { label: 'Query', value: 'SQL' },
    ],
  },
  {
    num: '02',
    title: 'ML / AI',
    rows: [
      { label: 'Frameworks', value: 'PyTorch · TensorFlow · Keras' },
      { label: 'Generative', value: 'GANs · Diffusion · LLMs' },
      { label: 'Classical', value: 'Scikit-learn' },
      { label: 'Multimodal', value: 'PaLM-E · cross-attention' },
    ],
  },
  {
    num: '03',
    title: 'Data & Cloud',
    rows: [
      { label: 'Orchestration', value: 'Apache Airflow' },
      { label: 'Relational', value: 'PostgreSQL · SQL Server' },
      { label: 'NoSQL', value: 'DynamoDB · Redis' },
      { label: 'Object store', value: 'AWS S3' },
    ],
  },
  {
    num: '04',
    title: 'Web & Systems',
    rows: [
      { label: 'Frontend', value: 'Next.js · React' },
      { label: 'Backend', value: 'ASP.NET MVC · Fastify · Node' },
      { label: 'Interfaces', value: 'REST APIs' },
      { label: 'Embedded', value: 'Arduino · Raspberry Pi' },
    ],
  },
  {
    num: '05',
    title: 'Tooling',
    rows: [
      { label: 'Containers', value: 'Docker' },
      { label: 'CI / CD', value: 'GitHub Actions · Git' },
      { label: 'Analysis', value: 'Pandas · NumPy' },
      { label: 'Reporting', value: 'Power BI' },
    ],
  },
  {
    num: '06',
    title: 'Deployments',
    rows: [
      { label: 'AWS', value: 'SageMaker · S3 · DynamoDB' },
      { label: 'GCP', value: 'Vertex AI' },
      { label: 'GPU', value: 'RunPod RTX 4090' },
      { label: 'Edge', value: 'Vercel' },
    ],
  },
]

/** Marquee strip — a secondary flourish under the spec grid. */
export const marqueeItems = [
  'PyTorch',
  'TensorFlow',
  'Apache Airflow',
  'AWS SageMaker',
  'GCP Vertex AI',
  'Docker',
  'PostgreSQL',
  'DynamoDB',
  'Next.js',
  'ASP.NET MVC',
  'C#',
  'Python',
  'Scikit-learn',
  'Raspberry Pi',
]
