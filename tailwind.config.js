/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ── Ground: near-black, panels barely lifted ── */
        ink: {
          DEFAULT: '#060606', // page background
          900: '#060606',
          800: '#0C0C0D', // panel
          700: '#101012', // raised panel / hover
          600: '#16161A', // input wells, active states
        },
        /* ── The one hot accent. Use sparingly. ── */
        signal: {
          DEFAULT: '#E86A2B',
          dim: '#B4501C', // pressed / borders
          bright: '#FF8244', // hover
        },
        /* ── Phosphor CRT green — terminal motif only ── */
        phosphor: {
          DEFAULT: '#5CF56A',
          dim: '#2E9B38',
        },
        /* ── Type ── */
        chalk: '#F2F2F2', // primary text
        ash: '#8A8A8A', // labels, secondary
        dust: '#7A7A7A', // tertiary — 4.72:1 on ink, AA at body size
      },
      borderColor: {
        /* Hairlines at 8–12% white — never a visible grey box */
        hairline: 'rgba(255,255,255,0.10)',
        'hairline-soft': 'rgba(255,255,255,0.06)',
        'hairline-hot': 'rgba(255,255,255,0.16)',
      },
      fontFamily: {
        // Dot-matrix display: hero headline + giant chapter numerals only
        pixel: ['var(--font-departure)', 'ui-monospace', 'monospace'],
        // Wide geometric mono: section headlines
        display: ['var(--font-martian)', 'ui-monospace', 'monospace'],
        // Clean mono: body, labels, spec rows — the default
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        sans: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        /* Fluid display scale. Tight tracking is applied per-role in CSS. */
        'display-xl': ['clamp(3rem, 11vw, 9.5rem)', { lineHeight: '0.86', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.5rem, 7.5vw, 6rem)', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(2rem, 5vw, 3.75rem)', { lineHeight: '0.95', letterSpacing: '-0.015em' }],
        'display-sm': ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.05', letterSpacing: '-0.01em' }],
        /* Chapter numerals — deliberately enormous */
        numeral: ['clamp(5rem, 18vw, 16rem)', { lineHeight: '0.78', letterSpacing: '-0.04em' }],
        /* Small mono labels — generous tracking, always uppercase */
        label: ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.22em' }],
        'label-lg': ['0.8125rem', { lineHeight: '1.4', letterSpacing: '0.18em' }],
        spec: ['0.8125rem', { lineHeight: '1.6', letterSpacing: '0.01em' }],
        body: ['0.9375rem', { lineHeight: '1.7' }],
        'body-lg': ['1.0625rem', { lineHeight: '1.65' }],
      },
      spacing: {
        chapter: 'clamp(6rem, 14vh, 11rem)', // vertical rhythm between chapters
        gutter: 'clamp(1.25rem, 4vw, 3.5rem)',
      },
      maxWidth: {
        shell: '1440px',
        prose: '68ch',
      },
      animation: {
        marquee: 'marquee 42s linear infinite',
        'marquee-reverse': 'marqueeReverse 42s linear infinite',
        'cursor-blink': 'cursorBlink 1.05s step-end infinite',
        'dot-pulse': 'dotPulse 2.4s ease-in-out infinite',
        scanline: 'scanline 7s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        marqueeReverse: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        // Terminal caret for the typing effect
        cursorBlink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        // Eyebrow dot — a slow breath, not a strobe
        dotPulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.45', transform: 'scale(0.82)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
      transitionTimingFunction: {
        // The house curve — everything decelerates like this
        cinema: 'cubic-bezier(0.16, 1, 0.3, 1)',
        wipe: 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
    },
  },
  plugins: [],
}
