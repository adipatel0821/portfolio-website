/**
 * Project case studies.
 *
 * Each project carries the full structure (problem, approach, architecture,
 * stack, outcome) rather than a card blurb.
 *
 * Content rule: every metric here traces back to something that happened.
 * Where a number is an estimate it says so, and nothing is invented to fill
 * a slot.
 */

export const DOMAINS = ['ML', 'Data Eng', 'IoT', 'Web'] as const
export type Domain = (typeof DOMAINS)[number]

export interface ArchitectureStep {
  step: string
  detail: string
}

export interface Metric {
  value: string
  label: string
}

export interface Project {
  /** URL slug. */
  id: string
  title: string
  /** Short name for cards and breadcrumbs. */
  shortTitle: string
  tagline: string
  year: string
  /** Drives the filter chips and the case-study hero glyph. */
  domains: Domain[]
  /** Surfaced first on the index. */
  featured?: boolean

  summary: string
  vision: string

  problem: string
  approach: string
  architecture: ArchitectureStep[]
  outcome: string

  metrics: Metric[]
  stack: { label: string; value: string }[]
  tech: string[]

  /**
   * Set ONLY when a public repo actually contains the work described above.
   * A case study with no `github` is deliberate, not an oversight: linking a
   * repo that turns out to be a report PDF or unrelated code does more damage
   * than showing no link at all.
   *
   * Currently set: multimodal-gan (Capstone-GANs), amfi-etl (Data_Product-IMF).
   * Deliberately unset:
   *   shems                — the public SHEMS repo holds the report, slides and
   *                          result data, but none of the sensor firmware this
   *                          writeup describes.
   *   investor-marketplace — no public repo (SCM-ASP.net is different work).
   *   synmedix, medfusion-diff, global-market-lab,
   *   chaos-arbitrageur, jobpilot — private; publish, then link.
   */
  github?: string
  live?: string
}

export const projects: Project[] = [
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'synmedix',
    title: 'SynMedix AI: Parallel EHR Processing',
    shortTitle: 'SynMedix AI',
    tagline: 'Distributed EHR processing with 50K+ synthetic patient records.',
    year: '2025',
    domains: ['ML', 'Data Eng'],
    featured: true,
    summary:
      'A distributed pipeline that processes roughly 10 GB of electronic health records at 3× the throughput of the serial baseline, with a generative layer on top producing 50,000+ synthetic patient records deployed on AWS SageMaker.',
    vision:
      'The healthcare industry generates enormous amounts of EHR data but processing it at scale remains painfully slow. I built SynMedix to demonstrate that with the right distributed architecture, medical AI teams can iterate 3x faster on realistic, privacy-safe datasets.',
    problem:
      'Electronic health records are abundant and hard to use at the same time. The volume is large, the privacy constraints are absolute, and serial processing is slow enough that iterating on a model means waiting overnight. A team that wants to train on real clinical data runs into all three at once, and the slow loop is usually what stalls the project.',
    approach:
      'Throughput came first. Ingest was restructured around parallel execution with optimised ETL stages, so the corpus can be reprocessed in an afternoon instead of overnight. Privacy came second. A generative model trained on the cleaned corpus learns the joint distribution of the records instead of memorising individual ones, so downstream teams get a dataset they can experiment on freely.',
    architecture: [
      {
        step: 'Ingest',
        detail:
          'Roughly 10 GB of raw EHR pulled into S3, partitioned so downstream stages can be worked in parallel rather than streamed serially.',
      },
      {
        step: 'Parallel ETL',
        detail:
          'Optimised transform stages executing concurrently. This is the change responsible for the 3× throughput improvement over the serial baseline.',
      },
      {
        step: 'Generative layer',
        detail:
          'PyTorch/TensorFlow models trained on the cleaned corpus to learn the joint distribution across clinical fields.',
      },
      {
        step: 'Serving',
        detail:
          'Deployed on AWS SageMaker for scalable inference, with DynamoDB and S3 backing metadata and generated artefacts.',
      },
    ],
    outcome:
      'SynMedix emits synthetic patient records that preserve the statistical structure of the source corpus without carrying any individual through it. Downstream teams get a dataset they can train on and share freely. The throughput gain compounds too: experiments that used to cost a night now cost an afternoon.',
    metrics: [
      { value: '3×', label: 'Throughput over serial baseline' },
      { value: '50K+', label: 'Synthetic records generated' },
      { value: '~10 GB', label: 'EHR corpus processed' },
      { value: '0', label: 'Real records reproduced' },
    ],
    stack: [
      { label: 'Modelling', value: 'PyTorch · TensorFlow · Keras' },
      { label: 'Pipeline', value: 'Python · SQL · parallel ETL' },
      { label: 'Cloud', value: 'AWS SageMaker · S3 · DynamoDB' },
    ],
    tech: ['Python', 'SQL', 'PyTorch', 'TensorFlow', 'Keras', 'ETL', 'AWS SageMaker', 'AWS S3', 'DynamoDB'],
  },

  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'multimodal-gan',
    title: 'Multimodal GAN: Synthetic Patient Data',
    shortTitle: 'Multimodal GAN',
    tagline: 'Generating realistic multimodal patient records with GANs.',
    year: '2024',
    domains: ['ML'],
    featured: true,
    summary:
      'A Generative Adversarial Network synthesising multimodal patient records (clinical text, medical imaging descriptors and time-series vitals) with roughly 40% improvement in training data diversity, deployed on GCP Vertex AI.',
    vision:
      'Healthcare AI is bottlenecked by data scarcity and privacy constraints. I wanted to prove that synthetic, privacy-preserving patient data could unlock the next generation of medical ML models, without compromising a single real patient record.',
    problem:
      'A patient is several kinds of data at once: a narrative, a set of images and a stream of numbers. The correlations between those modalities are what a clinical model needs to learn, and single-modality synthetic data throws them away. Generate the vitals and the notes independently and you get a dataset where nothing agrees with anything else, which is worse than no data at all.',
    approach:
      'Train a GAN across all three modalities jointly, so the generator has to produce records that hold together internally: vitals that match the diagnosis that matches the imaging descriptor. PaLM-E was integrated for multimodal reasoning over the combined representation, and the pipeline was deployed to GCP Vertex AI so inference could scale past a single machine.',
    architecture: [
      {
        step: 'Modality encoders',
        detail:
          'Clinical text, imaging descriptors, and time-series vitals each encoded into a shared representation.',
      },
      {
        step: 'Adversarial training',
        detail:
          'Generator and discriminator trained against the joint distribution, so cross-modal consistency is what the discriminator penalises.',
      },
      {
        step: 'Multimodal reasoning',
        detail: 'PaLM-E integrated to reason over the combined representation.',
      },
      {
        step: 'Deployment',
        detail: 'Full pipeline deployed on GCP Vertex AI for scalable inference.',
      },
    ],
    outcome:
      'Roughly 40% improvement in training data diversity over the baseline, with generated records that hold together across all three modalities. It set the direction for the generative work I have done since.',
    metrics: [
      { value: '~40%', label: 'Training diversity improvement' },
      { value: '3', label: 'Modalities generated jointly' },
      { value: 'Vertex AI', label: 'Production deployment' },
    ],
    stack: [
      { label: 'Architecture', value: 'GAN · PaLM-E' },
      { label: 'Analysis', value: 'NumPy · Pandas · Scikit-learn' },
      { label: 'Cloud', value: 'GCP Vertex AI' },
    ],
    tech: ['Python', 'GANs', 'PaLM-E', 'GCP Vertex AI', 'NumPy', 'Pandas', 'Scikit-learn', 'Matplotlib'],
    // The capstone repo: CUDA_MULTIMODAL_GANs.ipynb and Train_1.ipynb are the
    // real training code behind this writeup.
    github: 'https://github.com/adipatel0821/Capstone-GANs',
  },

  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'medfusion-diff',
    title: 'MedFusion-Diff: Brain MRI Diffusion Model',
    shortTitle: 'MedFusion-Diff',
    tagline: 'Conditional diffusion model synthesising brain tumour MRIs.',
    year: '2026',
    domains: ['ML'],
    featured: true,
    summary:
      'A pixel-space conditional diffusion model (Conditional U-Net with cross-attention, DDPM) synthesising brain tumour MRI slices from BraTS 2023, conditioned on patient metadata including age, gender, diagnosis and WHO grade.',
    vision:
      'Medical imaging research is throttled by scarce, privacy-locked scans. I wanted to prove a conditional diffusion model could generate realistic, metadata-controllable MRI slices that expand training sets without exposing a single real patient.',
    problem:
      'Brain tumour imaging datasets are small, hard to access and unevenly distributed across the conditions that matter. A rare WHO grade may have only a handful of examples. Augmentation does not solve it, because rotating an existing scan does not create a new patient. What helps is generation you can steer, so you can ask for the underrepresented case directly.',
    approach:
      'A DDPM operating directly in pixel space, with a Conditional U-Net whose cross-attention layers consume patient metadata. Conditioning on age, gender, diagnosis and WHO grade makes the model steerable, so you request a slice matching a specific clinical profile instead of sampling blindly.',
    architecture: [
      {
        step: 'Data pipeline',
        detail:
          'Scans pulled directly from Synapse, preprocessed into roughly 9,500 training slices from BraTS 2023.',
      },
      {
        step: 'Conditional U-Net',
        detail:
          'Cross-attention layers inject patient metadata (age, gender, diagnosis, WHO grade) into the denoising path.',
      },
      {
        step: 'DDPM training',
        detail:
          'Pixel-space denoising diffusion, mixed-precision AMP on RunPod RTX 4090 GPUs.',
      },
      {
        step: 'Sampling',
        detail: 'Metadata-conditioned generation. Request a clinical profile, get a matching slice.',
      },
    ],
    outcome:
      'A working conditional DDPM over BraTS 2023 producing metadata-steerable MRI slices. The useful result is control rather than raw fidelity. Being able to ask for a specific clinical profile is what makes synthetic imaging worth using to balance a training set.',
    metrics: [
      { value: '~9.5K', label: 'Training slices' },
      { value: '4', label: 'Conditioning variables' },
      { value: 'RTX 4090', label: 'Mixed-precision training' },
    ],
    stack: [
      { label: 'Architecture', value: 'Conditional U-Net · DDPM · cross-attention' },
      { label: 'Data', value: 'BraTS 2023 via Synapse' },
      { label: 'Compute', value: 'RunPod RTX 4090 · CUDA · AMP' },
    ],
    tech: ['PyTorch', 'DDPM', 'U-Net', 'Cross-Attention', 'BraTS 2023', 'RunPod', 'CUDA', 'AMP', 'NumPy'],
  },

  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'global-market-lab',
    title: 'Global Market Lab: Financial Analytics Platform',
    shortTitle: 'Global Market Lab',
    tagline: 'Bloomberg Terminal-style analytics across 84 global instruments.',
    year: '2026',
    domains: ['Data Eng', 'Web'],
    featured: true,
    summary:
      'A Bloomberg Terminal-inspired analytics platform covering 84 instruments across equities, bonds, forex, metals, energy and macro. Live FRED, ECB and EIA data sits behind a from-scratch forecasting engine, and every chart is native SVG with no charting library.',
    vision:
      'I wanted to see whether one person could rebuild the parts of a professional trading terminal that matter most: the live data, the forecasting maths and the dense information design, without leaning on any UI or charting library.',
    problem:
      'Professional terminals are impressive and effectively unavailable. The price is institutional and the internals are opaque. What makes them useful is the live data plumbing, the forecasting mathematics, and an information density most modern web design has abandoned. I wanted to find out whether one person could rebuild those three things honestly.',
    approach:
      'Build every layer directly. Real connectors to FRED, ECB and EIA instead of a mock feed. A hand-written maths engine implementing ARIMA, Holt-Winters and GARCH instead of importing a stats package. Native SVG for every chart, which turned out to be the only way to get the density right.',
    architecture: [
      {
        step: 'Live connectors',
        detail: 'FRED, ECB and EIA feeds streaming data for 84 instruments across six asset classes.',
      },
      {
        step: 'Forecast engine',
        detail:
          'ARIMA, Holt-Winters and GARCH implemented from scratch and combined into an ensemble.',
      },
      {
        step: 'Risk layer',
        detail: 'Monte Carlo VaR/CVaR simulation plus regime detection across the instrument set.',
      },
      {
        step: 'Render layer',
        detail:
          'Every chart is native SVG, including the correlation network graph. No charting or UI library anywhere.',
      },
    ],
    outcome:
      'A dense, live analytics surface covering 84 instruments, with a forecasting ensemble and risk simulation behind it. The zero-library constraint was the most instructive part of the build. It forced an understanding of both the mathematics and the rendering that importing a package would have hidden.',
    metrics: [
      { value: '84', label: 'Instruments covered' },
      { value: '3', label: 'Live data sources' },
      { value: '3', label: 'Forecast models in the ensemble' },
      { value: '0', label: 'Charting libraries used' },
    ],
    stack: [
      { label: 'Frontend', value: 'Next.js 16 · TypeScript · native SVG' },
      { label: 'Data', value: 'FRED · ECB · EIA' },
      { label: 'Models', value: 'ARIMA · Holt-Winters · GARCH · Monte Carlo' },
    ],
    tech: ['Next.js 16', 'TypeScript', 'FRED API', 'ECB', 'EIA', 'ARIMA', 'GARCH', 'Holt-Winters', 'Monte Carlo', 'SVG'],
  },

  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'chaos-arbitrageur',
    title: 'Chaos Arbitrageur: Event-Driven Alt-Data Platform',
    shortTitle: 'Chaos Arbitrageur',
    tagline: 'Predicting equity impact from physical supply-chain shocks.',
    year: '2026',
    domains: ['ML', 'Data Eng'],
    summary:
      'An event-driven research platform that ingests physical-world alternative data instead of price charts. Live port congestion and global news feed an LLM correlation agent and a vector memory of historical analogues, which together estimate equity impact on the most-exposed public companies.',
    vision:
      'Markets react to physical-world shocks like port collapses and conflict long before the price charts catch up. I wanted to build the pipeline that watches the physical world directly and turns a disruption into a ranked list of exposed tickers.',
    problem:
      'By the time a supply-chain disruption shows up in a price chart, the information is already priced in. The signal exists earlier, in port congestion data, news wire volume and the physical movement of goods, but it arrives as unstructured, geographically scattered noise that no conventional financial data pipeline is built to consume.',
    approach:
      'Ingest the physical world directly. Stream port congestion from IMF PortWatch and global news from GDELT, geolocate the disruptions, then hand the correlation problem to an LLM agent with a vector memory of historical analogues. "What happened last time something like this occurred" is the kind of query a vector store answers well and a regression does not.',
    architecture: [
      {
        step: 'Alt-data ingest',
        detail: 'Live IMF PortWatch congestion data and GDELT global news, geolocated onto an interactive globe.',
      },
      {
        step: 'Correlation agent',
        detail:
          'A LangChain + Claude agent that reasons from a disruption to the public companies most exposed to it.',
      },
      {
        step: 'Analogue memory',
        detail:
          'Pinecone vector store of historical shocks, queried for precedents matching the current event.',
      },
      {
        step: 'Event study',
        detail:
          'Simulator measuring cumulative abnormal returns against SPY, reported with t-statistics.',
      },
    ],
    outcome:
      'A working pipeline from physical disruption to a ranked list of exposed tickers, with an event-study simulator to check whether the ranking would have meant anything historically. Over 200 live alerts surface on the globe, backed by a memory of 12 historical shocks.',
    metrics: [
      { value: '200+', label: 'Live alerts on the globe' },
      { value: '12', label: 'Historical analogues in memory' },
      { value: 'CAR vs SPY', label: 'Event-study validation' },
    ],
    stack: [
      { label: 'Backend', value: 'FastAPI · Python · DuckDB' },
      { label: 'Intelligence', value: 'LangChain · Claude · Pinecone' },
      { label: 'Data', value: 'IMF PortWatch · GDELT' },
    ],
    tech: ['FastAPI', 'Python', 'Next.js', 'LangChain', 'Claude', 'Pinecone', 'IMF PortWatch', 'GDELT', 'DuckDB', 'React-Leaflet'],
  },

  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'jobpilot',
    title: 'JobPilot: Multi-Agent Job-Application Assistant',
    shortTitle: 'JobPilot',
    tagline: 'A 24/7 multi-agent system that finds and tailors job applications.',
    year: '2026',
    domains: ['ML', 'Web'],
    summary:
      'A self-hosted multi-agent job hunter that continuously discovers roles across Greenhouse, Lever and other boards, then uses Claude-powered Matcher and Tailor agents to score fit and draft tailored resumes and cover letters. It never auto-submits.',
    vision:
      'Job hunting is a full-time job on top of your job. I wanted an always-on system that does the discovery and tailoring grunt work overnight, while keeping a human firmly in control of every actual submission.',
    problem:
      'The mechanical part of job hunting takes the hours that should go to preparing for the roles that matter: finding the postings, deduplicating the same role across four boards, rewriting the same resume for the fortieth time. That is work a machine can do. Full automation is still the wrong answer, because mass auto-applying is how you become spam.',
    approach:
      'Split it. Automate discovery and tailoring completely; automate submission not at all. A worker pipeline continuously discovers and deduplicates postings, then Claude-powered Matcher and Tailor agents score fit and draft the materials. Everything lands in a queue for a human to review, and the apply button stays human-operated.',
    architecture: [
      {
        step: 'Discovery workers',
        detail: 'BullMQ + Redis workers polling Greenhouse, Lever and other boards on a schedule.',
      },
      {
        step: 'Three-layer dedup',
        detail:
          'The same role posted across multiple boards collapses to one entry. 4.7K raw postings reduce to 627.',
      },
      {
        step: 'Matcher & Tailor agents',
        detail:
          'Claude agents score role fit, then draft a tailored resume and cover letter for the ones that clear the bar.',
      },
      {
        step: 'Human gate',
        detail: 'Prepared applications surface via Discord alerts. The system never submits anything itself.',
      },
    ],
    outcome:
      'A live discovery pipeline reducing 4,700 raw postings to 627 real roles through three-layer deduplication, with tailored materials waiting for review. A human sends every application, which was the constraint the whole design was built around.',
    metrics: [
      { value: '4.7K → 627', label: 'After three-layer dedup' },
      { value: '2', label: 'Claude agents (Matcher, Tailor)' },
      { value: '0', label: 'Auto-submitted applications' },
    ],
    stack: [
      { label: 'API', value: 'Fastify · Node.js · TypeScript' },
      { label: 'Workers', value: 'BullMQ · Redis' },
      { label: 'Storage', value: 'Prisma · SQLite' },
    ],
    tech: ['Node.js', 'TypeScript', 'Fastify', 'BullMQ', 'Redis', 'Prisma', 'SQLite', 'Claude', 'Docker'],
  },

  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'amfi-etl',
    title: 'AMFI Mutual Fund ETL Pipeline',
    shortTitle: 'AMFI ETL Pipeline',
    tagline: 'Automated data pipeline for Indian mutual fund regulatory data.',
    year: '2025',
    domains: ['Data Eng'],
    summary:
      'An end-to-end ETL pipeline ingesting, transforming and loading AMFI regulatory data into an analytics warehouse, orchestrated with Apache Airflow and surfaced through Power BI dashboards. Built during my Data Engineering internship at Intellect Design Arena.',
    vision:
      'Financial regulators produce vast amounts of structured data that remains trapped in siloed, poorly formatted sources. I wanted to build a pipeline that turns raw AMFI data into a reliable, analysis-ready dataset that financial engineers can actually trust.',
    problem:
      'Regulatory data from the Association of Mutual Funds in India is public, structured and almost unusable in practice: inconsistent formatting, siloed sources, and no guarantee that today\'s file looks like yesterday\'s. Analysts spent their time on manual preparation instead of analysis, and manual preparation is where silent errors enter a dataset nobody questions later.',
    approach:
      'Automate the whole path and make the pipeline assert its own correctness. Airflow orchestrates ingest, transform and load on a schedule; automated data quality checks sit between the stages so a malformed upstream file fails loudly instead of quietly poisoning the warehouse. Power BI dashboards sit on the clean end for stakeholders.',
    architecture: [
      {
        step: 'Ingest',
        detail: 'Scheduled extraction of AMFI regulatory data from its published sources.',
      },
      {
        step: 'Quality gates',
        detail:
          'Automated checks between stages, so a malformed upstream file fails the DAG instead of reaching the warehouse.',
      },
      {
        step: 'Transform & load',
        detail: 'Normalisation into a structured analytics warehouse in PostgreSQL.',
      },
      {
        step: 'Reporting',
        detail: 'Power BI dashboards over the clean dataset for stakeholder consumption.',
      },
    ],
    outcome:
      'Regulatory reporting that runs itself, with a significant reduction in manual data preparation time and quality gates that surface upstream problems instead of hiding them. Shipped as an internship deliverable and used by stakeholders.',
    metrics: [
      { value: 'Automated', label: 'Regulatory reporting cycle' },
      { value: '4', label: 'Pipeline stages with quality gates' },
      { value: 'Power BI', label: 'Stakeholder-facing dashboards' },
    ],
    stack: [
      { label: 'Orchestration', value: 'Apache Airflow' },
      { label: 'Processing', value: 'Python · Pandas · NumPy' },
      { label: 'Warehouse', value: 'PostgreSQL · SQL' },
    ],
    tech: ['Python', 'Apache Airflow', 'ETL', 'SQL', 'PostgreSQL', 'Power BI', 'Pandas', 'NumPy'],
    // Last_5_Years-ETL-1.py, the Airflow/Docker setup and the ERD all live here.
    github: 'https://github.com/adipatel0821/Data_Product-IMF',
  },

  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'shems',
    title: 'SHEMS: Smart Home Energy Management',
    shortTitle: 'SHEMS',
    tagline: 'IoT system for real-time residential energy monitoring.',
    year: '2023',
    domains: ['IoT'],
    summary:
      'A Smart Home Energy Management System built on Arduino and Raspberry Pi, monitoring and controlling residential energy consumption in real time through sensor firmware, a local aggregation layer, and a web dashboard. Built during my IoT Engineering internship at Intuz.',
    vision:
      'Energy waste in homes is invisible. Nobody knows they are leaving devices running until the bill arrives. I wanted to build a low-cost IoT system that makes residential energy use transparent and actionable in real time, not a month later.',
    problem:
      'Household energy waste is hard to see. The feedback loop is a bill that arrives a month after the behaviour that caused it, aggregated into one number that says nothing about which device or which hour was responsible. There is nothing in that to act on.',
    approach:
      'Close the loop to seconds. Sensors on the circuits, firmware on an Arduino, aggregation on a Raspberry Pi in the house, and a dashboard that shows consumption as it happens. Automated alerts fire on anomalous patterns, so the system raises the problem itself.',
    architecture: [
      {
        step: 'Sensing',
        detail: 'Arduino firmware reading power draw from residential circuits.',
      },
      {
        step: 'Local aggregation',
        detail: 'Raspberry Pi collecting and buffering sensor streams on-premises.',
      },
      {
        step: 'Analysis',
        detail: 'Pattern detection over the aggregated series to identify inefficiency and anomalies.',
      },
      {
        step: 'Dashboard & alerts',
        detail: 'Web dashboard for real-time visualisation, with automated alerts on anomalous draw.',
      },
    ],
    outcome:
      'Real-time visibility into residential energy use, with anomaly alerts that identify inefficiency patterns as they happen rather than a month later. The project was recognised as a hackathon winner.',
    metrics: [
      { value: 'Real-time', label: 'Monitoring latency' },
      { value: '2', label: 'Hardware platforms integrated' },
      { value: 'Winner', label: 'Hackathon recognition' },
    ],
    stack: [
      { label: 'Hardware', value: 'Arduino · Raspberry Pi' },
      { label: 'Firmware & analysis', value: 'Python · Pandas · Matplotlib' },
      { label: 'Interface', value: 'REST APIs · web dashboard' },
    ],
    tech: ['Python', 'Arduino', 'Raspberry Pi', 'IoT', 'REST APIs', 'Pandas', 'Matplotlib'],
  },

  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'investor-marketplace',
    title: 'Investor Marketplace Platform',
    shortTitle: 'Investor Marketplace',
    tagline: 'Full-stack marketplace connecting startups with angel investors.',
    year: '2022',
    domains: ['Web'],
    summary:
      'A full-stack investor marketplace built with ASP.NET MVC, C# and SQL Server: RESTful APIs for investor profiles, deal flow and startup onboarding, with role-based access control over a responsive UI. Built during my Web Development internship at Appuno IT Solutions.',
    vision:
      'Early-stage fundraising is unnecessarily opaque. I wanted to build a clean, structured platform where the information asymmetry between founders and angels is reduced, making the matching process feel less like luck and more like informed decision-making.',
    problem:
      'Early-stage fundraising runs on introductions and asymmetry. Founders cannot see which investors are active in their space, and investors cannot see deal flow outside their own network. Both sides decide on partial information, and the matching that results has more to do with who you already know than with fit.',
    approach:
      'Put both sides in one structured system with role-based views. Startups list opportunities against a consistent schema, and investors discover, filter and track deals through the same data instead of through inbox forwarding. A shared schema is what makes the two sides comparable.',
    architecture: [
      {
        step: 'Data layer',
        detail: 'SQL Server schema modelling investor profiles, startups and deal flow.',
      },
      {
        step: 'API layer',
        detail: 'RESTful endpoints in ASP.NET MVC / C# for profiles, onboarding and deal management.',
      },
      {
        step: 'Access control',
        detail: 'Role-based permissions separating founder and investor views over shared data.',
      },
      {
        step: 'Interface',
        detail: 'Responsive UI for discovery, filtering and deal tracking.',
      },
    ],
    outcome:
      'A working two-sided platform where startups list and investors discover, filter and track deals, with the matching grounded in a shared schema rather than in whose inbox a deck happened to reach. It was my first production engineering work.',
    metrics: [
      { value: '2', label: 'User roles with distinct access' },
      { value: 'REST', label: 'API architecture' },
      { value: '2022', label: 'First production deployment' },
    ],
    stack: [
      { label: 'Backend', value: 'ASP.NET MVC · C#' },
      { label: 'Database', value: 'SQL Server' },
      { label: 'Frontend', value: 'JavaScript · Bootstrap' },
    ],
    tech: ['ASP.NET MVC', 'C#', 'SQL Server', 'REST APIs', 'JavaScript', 'Bootstrap'],
  },
]

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id)
}
