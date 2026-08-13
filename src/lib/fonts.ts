import { JetBrains_Mono, Martian_Mono } from 'next/font/google'
import localFont from 'next/font/local'

/**
 * Monospace top to bottom. Three roles, three cuts:
 *   pixel   → hero headline + giant chapter numerals (dot-matrix)
 *   display → section headlines (wide geometric mono)
 *   mono    → body, labels, spec rows (the default)
 *
 * All self-hosted through next/font, so there is no render-blocking network
 * request and no layout shift from a swap.
 */

// Departure Mono — Helena Zhang & Tobias Fried, MIT.
// Single weight by design; the face has no bold cut, so display type never
// varies weight — only size and tracking.
export const departureMono = localFont({
  src: '../../public/fonts/DepartureMono-Regular.woff2',
  variable: '--font-departure',
  display: 'swap',
  weight: '400',
  style: 'normal',
  // Departure Mono's glyphs sit slightly small on the em; nudge the fallback
  // metrics so the swap-in doesn't visibly reflow the headline.
  adjustFontFallback: false,
  fallback: ['ui-monospace', 'monospace'],
})

export const martianMono = Martian_Mono({
  subsets: ['latin'],
  variable: '--font-martian',
  display: 'swap',
  // Variable font — only ship the weights the design actually uses.
  weight: ['400', '600', '700'],
})

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const fontVariables = [
  departureMono.variable,
  martianMono.variable,
  jetbrainsMono.variable,
].join(' ')
