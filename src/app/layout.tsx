import type { Metadata, Viewport } from 'next'
import './globals.css'
import { fontVariables } from '@/lib/fonts'
import { site } from '@/lib/site'
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
    'Graduate CS student at Stevens Institute of Technology specializing in Machine Learning and Data Engineering. 3 industry internships, production AI deployments on AWS SageMaker and GCP Vertex AI.',
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
        {/* First tab stop — skips the fixed chrome straight to content. */}
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
      </body>
    </html>
  )
}
