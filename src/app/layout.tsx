import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/context/ThemeContext'
import Navbar from '@/components/Navbar'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Aditya Patel · ML & Data Engineer · Stevens Institute of Technology',
  description:
    'Graduate CS student at Stevens Institute of Technology specializing in Machine Learning and Data Engineering. 3 industry internships, production AI deployments on AWS SageMaker and GCP Vertex AI.',
  keywords: ['machine learning', 'data engineering', 'AI', 'Stevens Institute', 'Python', 'PyTorch', 'TensorFlow', 'AWS SageMaker', 'GCP Vertex AI'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Runs before paint — sets theme from localStorage or system preference to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('pf-theme');var d=t||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',d);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})()` }} />
      </head>
      <body className={`${inter.variable} ${montserrat.variable} font-sans`} suppressHydrationWarning>
        <ThemeProvider>
          <Navbar />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
