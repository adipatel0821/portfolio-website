import type { Metadata } from 'next'
import EngineSection from '@/components/home/EngineSection'
import CinematicBand from '@/components/home/CinematicBand'
import TechSpecs from '@/components/home/TechSpecs'
import FeaturedBuild from '@/components/home/FeaturedBuild'
import ContactCta from '@/components/home/ContactCta'

export const metadata: Metadata = {
  title: 'Aditya Patel · ML & Data Engineer',
  description:
    'Machine learning and data engineering — GANs, diffusion models, and ETL pipelines taken from research to production on AWS SageMaker and GCP Vertex AI.',
}

export default function HomePage() {
  return (
    <>
      {/* Hero + capability chapters 01–04, sharing one pinned WebGL centerpiece. */}
      <EngineSection />

      <CinematicBand />
      <TechSpecs />
      <FeaturedBuild />
      <ContactCta />
    </>
  )
}
