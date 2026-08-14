/**
 * About page content — narrative, timeline, skills, personality.
 * Facts carried over from the previous About page and the subway timeline.
 */

export interface TimelineStop {
  /** Two-digit index for the pixel numeral. */
  num: string
  period: string
  title: string
  org: string
  kind: 'Education' | 'Experience'
  body: string
  /** Short spec rows shown under the entry. */
  detail: { label: string; value: string }[]
}

export const timeline: TimelineStop[] = [
  {
    num: '01',
    period: 'Sep 2021 — May 2025',
    title: 'B.Tech, Computer Science & Engineering',
    org: 'VIT Chennai',
    kind: 'Education',
    body: 'Four years of data structures, algorithms and systems programming, graduating with a GPA of 3.5/4.0. The foundation everything else is built on — and the years I learned that understanding why something works matters more than getting it to run.',
    detail: [
      { label: 'GPA', value: '3.5 / 4.0' },
      { label: 'Focus', value: 'Algorithms · Systems · Applied AI' },
    ],
  },
  {
    num: '02',
    period: 'Jul 2022',
    title: 'Web Development Intern',
    org: 'Appuno IT Solutions',
    kind: 'Experience',
    body: 'Built full-stack features for an investor marketplace in ASP.NET MVC and C# — RESTful APIs, role-based access control, responsive UI. My first encounter with code that other people depend on, which is a different discipline entirely from code that merely works.',
    detail: [
      { label: 'Stack', value: 'ASP.NET MVC · C# · SQL Server' },
      { label: 'Shipped', value: 'Investor Marketplace Platform' },
    ],
  },
  {
    num: '03',
    period: 'Aug 2023',
    title: 'IoT Engineering Intern',
    org: 'Intuz Solution',
    kind: 'Experience',
    body: 'Engineered SHEMS, a smart home energy management system on Arduino and Raspberry Pi: sensor firmware, local data aggregation, and a real-time monitoring dashboard. Hardware teaches you that the data does not simply exist — something physical has to go and measure it.',
    detail: [
      { label: 'Stack', value: 'Arduino · Raspberry Pi · Python' },
      { label: 'Shipped', value: 'SHEMS energy monitor' },
    ],
  },
  {
    num: '04',
    period: 'Feb 2025',
    title: 'Data Engineering Intern',
    org: 'Intellect Design Arena',
    kind: 'Experience',
    body: 'Designed and shipped the AMFI mutual fund ETL pipeline in Apache Airflow and Python — automated regulatory ingestion, quality gates between stages, and Power BI dashboards for stakeholders. A measurable cut in manual preparation time, and my first taste of infrastructure people quietly rely on.',
    detail: [
      { label: 'Stack', value: 'Apache Airflow · Python · PostgreSQL' },
      { label: 'Shipped', value: 'AMFI ETL Pipeline' },
    ],
  },
  {
    num: '05',
    period: 'Sep 2025 — 2027',
    title: 'M.S. Computer Science',
    org: 'Stevens Institute of Technology',
    kind: 'Education',
    body: 'Currently at Stevens in Hoboken, focused on machine learning, AI systems and distributed computing. Most of what is on this site was built alongside coursework rather than for it.',
    detail: [
      { label: 'Location', value: 'Hoboken, NJ' },
      { label: 'Focus', value: 'ML · AI systems · Distributed computing' },
    ],
  },
  {
    num: '06',
    period: 'Jul 2026 — Present',
    title: 'AI Engineer Intern',
    org: 'Licent Solutions LLC',
    kind: 'Experience',
    // The work itself is confidential. This entry deliberately describes the
    // role and nothing else — no systems, no metrics, no domain detail.
    body: 'Currently working as an AI engineer at Licent Solutions. The work is confidential, so there are no details here.',
    detail: [
      { label: 'Role', value: 'AI Engineer · Internship' },
      { label: 'Status', value: 'Ongoing' },
    ],
  },
]

export interface SkillGroup {
  num: string
  domain: string
  skills: string[]
}

export const skillGroups: SkillGroup[] = [
  { num: '01', domain: 'Machine Learning', skills: ['PyTorch', 'TensorFlow', 'Keras', 'Scikit-learn', 'GANs', 'Diffusion / DDPM', 'LLMs', 'PaLM-E'] },
  { num: '02', domain: 'Data Engineering', skills: ['Apache Airflow', 'ETL design', 'Pandas', 'NumPy', 'PostgreSQL', 'DynamoDB', 'DuckDB', 'SQL'] },
  { num: '03', domain: 'Cloud & Infrastructure', skills: ['AWS SageMaker', 'AWS S3', 'GCP Vertex AI', 'Docker', 'RunPod', 'Vercel', 'Git / CI-CD'] },
  { num: '04', domain: 'Web & Systems', skills: ['Next.js', 'TypeScript', 'React', 'ASP.NET MVC', 'C#', 'Fastify', 'REST APIs'] },
  { num: '05', domain: 'Hardware & IoT', skills: ['Arduino', 'Raspberry Pi', 'Sensor firmware', 'Real-time aggregation'] },
  { num: '06', domain: 'Languages', skills: ['Python', 'C#', 'C / C++', 'TypeScript', 'SQL'] },
]

/** The three things I actually believe about doing this work. */
export const principles = [
  {
    num: '01',
    title: 'Research that ships',
    body: "I have deployed GANs to GCP Vertex AI and built ETL pipelines over real patient records. The gap between a paper implementation and production code is where most of the real work lives — and most of the interesting problems.",
  },
  {
    num: '02',
    title: 'Read the paper, then question it',
    body: 'I read ML papers on weekends, not out of obligation but because understanding why an attention mechanism works the way it does is the only way to meaningfully adapt it. Copying an implementation is never enough.',
  },
  {
    num: '03',
    title: 'The boring infrastructure matters most',
    body: "The model is maybe 10% of the work. Data pipelines, monitoring, deployment reliability — that is what separates a demo from a system people trust. I care about both halves, and the second one is where I have spent more hours.",
  },
]

export const interests = [
  'Generative AI',
  'Distributed Systems',
  'Healthcare AI',
  'Cloud Architecture',
  'Open Source',
  'Cricket',
  'Photography',
  'Specialty Coffee',
  'Hiking',
]
