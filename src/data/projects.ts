import type { Project } from '@/components/ProjectCard'

export const projects: Project[] = [
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
