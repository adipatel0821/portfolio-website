import type { Project } from '@/components/ProjectCard'

export const projects: Project[] = [
  {
    id: 'global-market-lab',
    title: 'Global Market Lab: Financial Analytics Platform',
    tagline: 'Bloomberg Terminal-style analytics across 80+ global instruments.',
    description:
      'Built a Bloomberg Terminal-inspired analytics platform covering 84 instruments across equities, bonds, forex, metals, energy, and macro. Live data streams in through FRED, ECB, and EIA connectors, while a from-scratch math engine computes ARIMA, Holt-Winters, and GARCH forecasts alongside Monte Carlo VaR/CVaR, regime detection, and SVG correlation networks. Every chart is native SVG with zero external UI or charting libraries.',
    vision:
      'I wanted to see whether one person could rebuild the parts of a professional trading terminal that actually matter, the live data, the forecasting math, and the dense information design, without leaning on any UI or charting library.',
    tech: ['Next.js 16', 'TypeScript', 'FRED API', 'ECB', 'EIA', 'ARIMA', 'GARCH', 'Holt-Winters', 'Monte Carlo', 'SVG'],
    color: '#22d3ee',
    accent: '#6366f1',
    category: 'FinTech',
    year: '2026',
    impact: '84 instruments · Live FRED + ECB + EIA data · ARIMA/Holt-Winters/GARCH ensemble · Monte Carlo VaR/CVaR · zero chart libraries',
  },
  {
    id: 'chaos-arbitrageur',
    title: 'Chaos Arbitrageur: Event-Driven Alt-Data Platform',
    tagline: 'Predicting equity impact from physical supply-chain shocks.',
    description:
      'An event-driven research platform that ingests physical-world alternative data instead of price charts. It streams live port-congestion data from IMF PortWatch and global news from GDELT, geolocates supply-chain disruptions on a dark interactive globe, then uses a LangChain and Claude correlation agent plus a Pinecone vector memory of historical analogues to estimate the equity impact on the most-exposed public companies. An event-study simulator measures cumulative abnormal returns against SPY.',
    vision:
      'Markets react to physical-world shocks like port collapses and conflict long before the price charts catch up. I wanted to build the pipeline that watches the physical world directly and turns a disruption into a ranked list of exposed tickers.',
    tech: ['FastAPI', 'Python', 'Next.js', 'LangChain', 'Claude', 'Pinecone', 'IMF PortWatch', 'GDELT', 'DuckDB', 'React-Leaflet'],
    color: '#ef4444',
    accent: '#f59e0b',
    category: 'AI/ML',
    year: '2026',
    impact: '200+ live alerts on an interactive globe · LLM correlation agent · Pinecone analogue memory (12 historical shocks) · event-study CAR vs SPY with t-stats',
  },
  {
    id: 'medfusion-diff',
    title: 'MedFusion-Diff: Brain MRI Diffusion Model',
    tagline: 'Conditional diffusion model synthesizing brain tumor MRIs.',
    description:
      'A pixel-space conditional diffusion model (Conditional U-Net with cross-attention, DDPM) that synthesizes brain tumor MRI slices from the BraTS 2023 dataset, conditioned on patient metadata such as age, gender, diagnosis, and WHO grade. Trained on RunPod RTX 4090 GPUs with mixed-precision AMP over roughly 9,500 training slices, backed by a data pipeline that pulls scans directly from Synapse.',
    vision:
      'Medical imaging research is throttled by scarce, privacy-locked scans. I wanted to prove a conditional diffusion model could generate realistic, metadata-controllable MRI slices that expand training sets without exposing a single real patient.',
    tech: ['PyTorch', 'DDPM', 'U-Net', 'Cross-Attention', 'BraTS 2023', 'RunPod', 'CUDA', 'AMP', 'NumPy'],
    color: '#8b5cf6',
    accent: '#ec4899',
    category: 'AI/ML',
    year: '2026',
    impact: 'Conditional DDPM on BraTS 2023 · metadata-conditioned generation · ~9.5K training slices · RTX 4090 mixed-precision training',
  },
  {
    id: 'jobpilot',
    title: 'JobPilot: Multi-Agent Job-Application Assistant',
    tagline: 'A 24/7 multi-agent system that finds and tailors job applications.',
    description:
      'A self-hosted, multi-agent job hunter that continuously discovers roles across Greenhouse, Lever, and other boards, then uses Claude-powered Matcher and Tailor agents to score fit and draft tailored resumes and cover letters. Built on a Fastify API with BullMQ and Redis workers and Prisma/SQLite, with a three-layer dedup pipeline and Discord alerts. It never auto-submits, it prepares everything and leaves the final apply to the user.',
    vision:
      'Job hunting is a full-time job on top of your job. I wanted an always-on system that does the discovery and tailoring grunt work overnight, while keeping a human firmly in control of every actual submission.',
    tech: ['Node.js', 'TypeScript', 'Fastify', 'BullMQ', 'Redis', 'Prisma', 'SQLite', 'Claude', 'Docker'],
    color: '#14b8a6',
    accent: '#3b82f6',
    category: 'SaaS',
    year: '2026',
    impact: 'Live multi-board discovery (4.7K to 627 after 3-layer dedup) · Claude Matcher + Tailor agents · never auto-submits · Discord alerts',
  },
  {
    id: 'multimodal-gan',
    title: 'Multimodal GAN: Synthetic Patient Data',
    tagline: 'Generating realistic multimodal patient records with GANs.',
    description:
      'Designed and trained a Generative Adversarial Network to synthesize multimodal patient records (clinical text, medical imaging descriptors, and time-series vitals), achieving approximately 40% improvement in training data diversity. Integrated PaLM-E for multimodal reasoning and deployed the full pipeline on GCP Vertex AI for scalable inference.',
    vision:
      'Healthcare AI is bottlenecked by data scarcity and privacy constraints. I wanted to prove that synthetic, privacy-preserving patient data could unlock the next generation of medical ML models, without compromising a single real patient record.',
    tech: ['Python', 'GANs', 'PaLM-E', 'GCP Vertex AI', 'NumPy', 'Pandas', 'Scikit-learn', 'Matplotlib'],
    color: '#a855f7',
    accent: '#00d4ff',
    github: '#',
    live: '#',
    category: 'AI/ML',
    year: '2024',
    impact: '~40% training diversity improvement · Deployed on GCP Vertex AI · Multimodal (text + imaging + vitals)',
  },
  {
    id: 'synmedix',
    title: 'SynMedix AI: Parallel EHR Processing',
    tagline: 'Distributed EHR processing with 50K+ synthetic patient records.',
    description:
      'Built a distributed pipeline to process and analyze approximately 10 GB of Electronic Health Records, achieving 3x throughput improvement through parallel execution and optimized ETL workflows. Developed SynMedix AI, a platform generating 50,000+ synthetic patient records deployed on AWS SageMaker, enabling safe downstream ML experimentation without real patient data exposure.',
    vision:
      'The healthcare industry generates enormous amounts of EHR data but processing it at scale remains painfully slow. I built SynMedix to demonstrate that with the right distributed architecture, medical AI teams can iterate 3x faster on realistic, privacy-safe datasets.',
    tech: ['Python', 'SQL', 'PyTorch', 'TensorFlow', 'Keras', 'ETL', 'AWS SageMaker', 'AWS S3', 'DynamoDB'],
    color: '#10b981',
    accent: '#06b6d4',
    github: '#',
    live: '#',
    category: 'AI/ML',
    year: '2025',
    impact: '3x throughput · 50K+ synthetic records · 10 GB EHR processing · AWS SageMaker deployment',
  },
  {
    id: 'amfi-etl',
    title: 'AMFI Mutual Fund ETL Pipeline',
    tagline: 'Automated data pipeline for Indian mutual fund regulatory data.',
    description:
      'Designed and implemented an end-to-end ETL pipeline to ingest, transform, and load AMFI (Association of Mutual Funds in India) regulatory data into a structured analytics warehouse. Built automated data quality checks, orchestrated workflows with Apache Airflow, and created Power BI dashboards for stakeholder reporting, significantly reducing manual data preparation time.',
    vision:
      'Financial regulators produce vast amounts of structured data that remains trapped in siloed, poorly formatted sources. I wanted to build a pipeline that turns raw AMFI data into a reliable, analysis-ready dataset that financial engineers can actually trust.',
    tech: ['Python', 'Apache Airflow', 'ETL', 'SQL', 'PostgreSQL', 'Power BI', 'Pandas', 'NumPy'],
    color: '#f59e0b',
    accent: '#ef4444',
    github: '#',
    live: '#',
    category: 'SaaS',
    year: '2025',
    impact: 'Automated regulatory reporting · Reduced manual prep time · Power BI dashboards for stakeholders',
  },
  {
    id: 'investor-marketplace',
    title: 'Investor Marketplace Platform',
    tagline: 'Full-stack marketplace connecting startups with angel investors.',
    description:
      'Developed a full-stack investor marketplace web application using ASP.NET MVC with a C# backend and SQL Server database. Implemented RESTful APIs for investor profiles, deal flow management, and startup onboarding. Built responsive UI with role-based access control, enabling startups to list opportunities and investors to discover, filter, and track deals in one place.',
    vision:
      'Early-stage fundraising is unnecessarily opaque. I wanted to build a clean, structured platform where the information asymmetry between founders and angels is reduced, making the matching process feel less like luck and more like informed decision-making.',
    tech: ['ASP.NET MVC', 'C#', 'SQL Server', 'REST APIs', 'JavaScript', 'Bootstrap'],
    color: '#3b82f6',
    accent: '#8b5cf6',
    github: '#',
    live: '#',
    category: 'SaaS',
    year: '2022',
    impact: 'Full-stack web platform · Role-based access · RESTful API architecture',
  },
  {
    id: 'shems',
    title: 'SHEMS: Smart Home Energy Management',
    tagline: 'IoT system for real-time residential energy monitoring.',
    description:
      'Engineered a Smart Home Energy Management System using Arduino and Raspberry Pi to monitor and control residential energy consumption in real time. Built sensor integration firmware, a local data aggregation layer, and a web dashboard for visualizing power usage patterns and triggering automated alerts. Reduced simulated energy waste by identifying inefficiency patterns.',
    vision:
      'Energy waste in homes is invisible. Nobody knows they are leaving devices running until the bill arrives. I wanted to build a low-cost IoT system that makes residential energy use transparent and actionable in real time, not a month later.',
    tech: ['Python', 'Arduino', 'Raspberry Pi', 'IoT', 'REST APIs', 'Pandas', 'Matplotlib'],
    color: '#06b6d4',
    accent: '#10b981',
    github: '#',
    live: '#',
    category: 'Hackathon Winner',
    year: '2023',
    impact: 'Real-time energy monitoring · Arduino + Raspberry Pi stack · Automated anomaly alerts',
  },
]
