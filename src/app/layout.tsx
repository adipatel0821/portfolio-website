import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import { fontVariables } from '@/lib/fonts'
import { site, socials } from '@/lib/site'
import Navbar from '@/components/chrome/Navbar'
import Footer from '@/components/chrome/Footer'
import SocialRail from '@/components/chrome/SocialRail'
import ScrollProgress from '@/components/chrome/ScrollProgress'
import CustomCursor from '@/components/chrome/CustomCursor'
import PageTransition from '@/components/chrome/PageTransition'
import SmoothScroll from '@/components/providers/SmoothScroll'

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · ML & Data Engineer`,
    template: `%s · ${site.name}`,
  },
  description:
    'Graduate CS student at Stevens Institute of Technology specializing in Machine Learning and Data Engineering. Four industry internships, production AI deployments on AWS SageMaker and GCP Vertex AI.',
  keywords: [
    'machine learning',
    'data engineering',
    'AI',
    'Stevens Institute',
    'Python',
    'PyTorch',
    'TensorFlow',
    'AWS SageMaker',
    'GCP Vertex AI',
  ],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: site.name,
    locale: 'en_US',
    url: site.url,
    title: `${site.name} · ML & Data Engineer`,
    description: site.tagline,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} · ML & Data Engineer`,
    description: site.tagline,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

/**
 * Person structured data. Rendered once in the root layout so every page
 * carries it, this is the record search engines use to associate the site
 * with a real person rather than an anonymous domain.
 */
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: site.name,
  url: site.url,
  email: `mailto:${site.email}`,
  jobTitle: 'Machine Learning & Data Engineer',
  address: { '@type': 'PostalAddress', addressLocality: 'Hoboken', addressRegion: 'NJ', addressCountry: 'US' },
  alumniOf: [
    { '@type': 'CollegeOrUniversity', name: 'Stevens Institute of Technology' },
    { '@type': 'CollegeOrUniversity', name: 'VIT Chennai' },
  ],
  knowsAbout: [
    'Machine Learning',
    'Generative Adversarial Networks',
    'Diffusion Models',
    'Data Engineering',
    'Apache Airflow',
    'AWS SageMaker',
    'GCP Vertex AI',
  ],
  sameAs: socials.map((s) => s.href),
}

export const viewport: Viewport = {
  // The theme is dark-only; tell the browser so form controls and the mobile
  // URL bar match the page instead of flashing a light chrome.
  colorScheme: 'dark',
  themeColor: '#060606',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="bg-ink font-mono text-chalk antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />

        {/* First tab stop, skips the fixed chrome straight to content. */}
        <a href="#main" className="skip-link">
          Skip to content
        </a>

        <SmoothScroll />
        <ScrollProgress />
        <CustomCursor />

        <Navbar />
        <SocialRail />

        <main id="main">
          <PageTransition>{children}</PageTransition>
        </main>

        <Footer />

        {/* Film grain sits above content but below the cursor. */}
        <div className="grain" aria-hidden="true" />

        {/* Both are cookieless and inject nothing until the page is interactive.
            They no-op outside Vercel, so local dev and CI builds stay silent.
            Analytics still needs enabling once per project in the Vercel
            dashboard (Project → Analytics) before data appears. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
