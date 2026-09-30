import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

/**
 * Flat ESLint config.
 *
 * There was no ESLint config in this repo at all. `package.json` declared
 * `"lint": "next lint"` and depended on `eslint-config-next`, but Next 16
 * removed the `next lint` command, so the script failed with "Invalid project
 * directory provided, no such directory: ./lint" and no file was ever linted.
 *
 * That also meant every `// eslint-disable-next-line @typescript-eslint/...`
 * comment in `src/` was decorative — no linter was reading them. They are real
 * suppressions again now, so if one becomes unnecessary ESLint will say so.
 *
 * `core-web-vitals` is the stricter of the two Next presets: it promotes the
 * image/script/font rules that affect Core Web Vitals from warning to error,
 * which is the right default for a site whose whole point is how it performs.
 */
const config = [
  {
    ignores: ['.next/**', '.parity/**', 'node_modules/**', 'next-env.d.ts', 'scripts/**'],
  },

  ...nextCoreWebVitals,
  ...nextTypescript,

  {
    name: 'portfolio/react-hooks-v7-triage',
    rules: {
      /**
       * WARN, NOT OFF — these are real findings, deliberately not silenced.
       *
       * eslint-plugin-react-hooks v7 (pulled in with the Next 16 upgrade) added
       * three rules that this codebase predates. They are warnings only so that
       * `npm run lint` is a usable gate today rather than a wall of 24 errors,
       * but every one of them wants a real look:
       *
       * `refs` (18 hits, all in components/demo/LatentExplorer.tsx) is the one
       * that matters. Line ~90 does `generatorRef.current?.manifest` during
       * render. That works today only because the load effect calls setState
       * right after populating the ref, so a re-render happens to follow. It is
       * not guaranteed under concurrent rendering, and the honest fix is to hold
       * the manifest in state instead of reading a ref during render.
       *
       * `set-state-in-effect` (5 hits) is mostly the deliberate
       * detect-then-mount pattern in CenterpieceStage / LazyMount / Navbar,
       * where after-mount state really is the point. Those are likely fine as
       * they stand; CountUp and TerminalType are worth re-reading.
       *
       * Do not flip these to "off" — that hides the LatentExplorer issue.
       */
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },
]

export default config
