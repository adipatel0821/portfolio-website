import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'
import { site } from '@/lib/site'

/**
 * Generated OG card, rendered at build time by next/og, no design file to
 * keep in sync and no image asset in the repo.
 *
 * Constraints worth knowing: next/og runs a subset of CSS through Satori. No
 * CSS variables, no Tailwind classes, no `background-image` gradients, and
 * fonts must be handed over as buffers. Everything here is inline styles with
 * literal colours.
 *
 * Satori cannot parse woff2, so the OTF cut of Departure Mono is read from
 * src/assets rather than reusing the webfont in public/fonts. That file is
 * build-time only and never ships to the browser.
 */

export const alt = `${site.name}, Machine Learning and Data Engineer`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const INK = '#060606'
const SIGNAL = '#E86A2B'
const CHALK = '#F2F2F2'
const ASH = '#8A8A8A'

export default async function OpenGraphImage() {
  const departure = await readFile(
    path.join(process.cwd(), 'src/assets/DepartureMono-Regular.otf'),
  )

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: INK,
          fontFamily: 'Departure Mono',
          padding: '72px 80px',
          // Hairline dot grid, echoing the site's dot-matrix motif.
          backgroundImage:
            'radial-gradient(rgba(242,242,242,0.10) 1.5px, transparent 1.5px)',
          backgroundSize: '32px 32px',
        }}
      >
        {/* Top rule + eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: SIGNAL }} />
          <div
            style={{
              fontSize: 22,
              letterSpacing: 6,
              color: CHALK,
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            {site.name}
          </div>
          <div style={{ fontSize: 22, letterSpacing: 6, color: ASH }}>·</div>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 6,
              color: ASH,
              textTransform: 'uppercase',
            }}
          >
            ML / Data Eng
          </div>
        </div>

        {/* Headline, mirrors the site's hero */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 118,
              lineHeight: 1,
              color: CHALK,
              fontWeight: 800,
              letterSpacing: -3,
            }}
          >
            Systems that
          </div>
          <div
            style={{
              fontSize: 118,
              lineHeight: 1.05,
              color: SIGNAL,
              fontWeight: 800,
              letterSpacing: -3,
            }}
          >
            learn.
          </div>
        </div>

        {/* Footer spec row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: '1px solid rgba(255,255,255,0.14)',
            paddingTop: 28,
          }}
        >
          <div style={{ fontSize: 24, color: ASH, maxWidth: 620 }}>
            GANs, diffusion models and ETL pipelines, from research to production.
          </div>
          <div style={{ fontSize: 24, color: CHALK, letterSpacing: 3 }}>
            pateladitya.dev
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Departure Mono',
          data: departure as unknown as ArrayBuffer,
          style: 'normal',
          weight: 400,
        },
      ],
    },
  )
}
