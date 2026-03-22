'use client'

import { useTheme } from '@/context/ThemeContext'

const GROUND = 480

interface Building {
  x: number
  y: number
  w: number
  type?: 'rect' | 'esb' | 'wtc' | 'chrysler'
}

const buildings: Building[] = [
  // Far left — bridge approach
  { x: 0,    y: 428, w: 44 },
  { x: 49,   y: 408, w: 36 },
  { x: 90,   y: 380, w: 52 },
  { x: 147,  y: 396, w: 40 },
  { x: 192,  y: 362, w: 56 },
  { x: 253,  y: 375, w: 46 },
  { x: 304,  y: 393, w: 40 },
  // Downtown / Financial District
  { x: 349,  y: 290, w: 52 },
  { x: 406,  y: 192, w: 52, type: 'wtc' },
  { x: 463,  y: 260, w: 56 },
  { x: 524,  y: 243, w: 66 },
  { x: 595,  y: 226, w: 56 },
  { x: 656,  y: 268, w: 50 },
  // Midtown approach
  { x: 711,  y: 232, w: 60 },
  { x: 776,  y: 206, w: 56 },
  // Empire State Building
  { x: 837,  y: 145, w: 82, type: 'esb' },
  { x: 924,  y: 203, w: 60 },
  // Chrysler Building
  { x: 989,  y: 186, w: 68, type: 'chrysler' },
  { x: 1062, y: 226, w: 56 },
  { x: 1123, y: 252, w: 62 },
  // Upper midtown / right
  { x: 1190, y: 272, w: 56 },
  { x: 1251, y: 292, w: 50 },
  { x: 1306, y: 312, w: 56 },
  { x: 1367, y: 330, w: 48 },
  { x: 1420, y: 346, w: 40 },
]

// Deterministic star positions
const stars = Array.from({ length: 100 }, (_, i) => ({
  cx: ((i * 137.508) % 1440).toFixed(1),
  cy: ((i * 89.31) % 260).toFixed(1),
  r: (0.6 + (i % 5) * 0.18).toFixed(1),
  opacity: (0.2 + (i % 8) * 0.07).toFixed(2),
  dur: 2 + (i % 5),
  delay: ((i * 0.38) % 4).toFixed(1),
}))

function BuildingShape({ b, fill, winId }: { b: Building; fill: string; winId: string }) {
  const h = GROUND - b.y
  const cx = b.x + b.w / 2

  if (b.type === 'esb') {
    return (
      <g>
        <rect x={b.x}      y={b.y + 68}  width={b.w}      height={h - 68}  fill={fill} />
        <rect x={b.x + 7}  y={b.y + 52}  width={b.w - 14} height={22}      fill={fill} />
        <rect x={b.x + 14} y={b.y + 38}  width={b.w - 28} height={18}      fill={fill} />
        <rect x={b.x + 22} y={b.y + 26}  width={b.w - 44} height={16}      fill={fill} />
        <rect x={b.x + 30} y={b.y + 14}  width={b.w - 60} height={16}      fill={fill} />
        <rect x={cx - 2}   y={b.y}        width={4}         height={18}      fill={fill} />
        <rect x={cx - 1}   y={b.y - 32}   width={2}         height={36}      fill={fill} opacity={0.75} />
        <rect x={b.x}      y={b.y + 68}  width={b.w}      height={h - 68}  fill={`url(#${winId})`} opacity={0.85} />
      </g>
    )
  }

  if (b.type === 'wtc') {
    const taper = 14
    return (
      <g>
        <polygon points={`${b.x},${GROUND} ${b.x+b.w},${GROUND} ${b.x+b.w-taper},${b.y} ${b.x+taper},${b.y}`} fill={fill} />
        <polygon points={`${b.x},${GROUND} ${b.x+b.w},${GROUND} ${b.x+b.w-taper},${b.y} ${b.x+taper},${b.y}`} fill={`url(#${winId})`} opacity={0.55} />
        <rect x={cx - 1.5} y={b.y - 50} width={3} height={54} fill={fill} opacity={0.8} />
      </g>
    )
  }

  if (b.type === 'chrysler') {
    return (
      <g>
        <rect x={b.x}      y={b.y + 84}  width={b.w}      height={h - 84}  fill={fill} />
        <rect x={b.x + 8}  y={b.y + 66}  width={b.w - 16} height={22}      fill={fill} />
        <rect x={b.x + 15} y={b.y + 48}  width={b.w - 30} height={22}      fill={fill} />
        <polygon points={`${b.x+18},${b.y+50} ${b.x+b.w-18},${b.y+50} ${cx},${b.y+2}`} fill={fill} />
        <rect x={cx - 3}   y={b.y - 10}  width={6}         height={16}      fill={fill} opacity={0.72} />
        <rect x={b.x}      y={b.y + 84}  width={b.w}      height={h - 84}  fill={`url(#${winId})`} opacity={0.75} />
      </g>
    )
  }

  return (
    <g>
      <rect x={b.x} y={b.y} width={b.w} height={h} fill={fill} />
      <rect x={b.x} y={b.y} width={b.w} height={h} fill={`url(#${winId})`} opacity={0.78} />
    </g>
  )
}

export default function NYCSkyline() {
  const { isDark } = useTheme()

  const buildingFill = isDark ? '#0a1020' : '#8898b0'
  const winId = isDark ? 'w-dark' : 'w-light'

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <svg
        viewBox="0 0 1440 600"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMax slice"
        className="w-full h-full"
        aria-hidden="true"
      >
        <defs>
          {/* Dark sky */}
          <linearGradient id="sky-d" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#010204" />
            <stop offset="30%"  stopColor="#030810" />
            <stop offset="65%"  stopColor="#061020" />
            <stop offset="100%" stopColor="#0a1830" />
          </linearGradient>
          {/* Light sky (daytime) */}
          <linearGradient id="sky-l" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#a8d4f0" />
            <stop offset="40%"  stopColor="#cce8f8" />
            <stop offset="100%" stopColor="#e8f4fc" />
          </linearGradient>
          {/* Neon horizon glow (dark) */}
          <radialGradient id="neon-glow" cx="50%" cy="100%" r="70%">
            <stop offset="0%"   stopColor="#00d4ff" stopOpacity="0.12" />
            <stop offset="35%"  stopColor="#7b2fff" stopOpacity="0.06" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          {/* Ground dark */}
          <linearGradient id="gnd-d" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#050a14" />
            <stop offset="100%" stopColor="#010206" />
          </linearGradient>
          {/* Ground light */}
          <linearGradient id="gnd-l" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9aabbf" />
            <stop offset="100%" stopColor="#7a8a9a" />
          </linearGradient>
          {/* Windows dark — warm amber */}
          <pattern id="w-dark" x="0" y="0" width="13" height="17" patternUnits="userSpaceOnUse">
            <rect x="1.5" y="2.5" width="4"   height="7.5" fill="#fbbf24" opacity="0.58" rx="0.5" />
            <rect x="7.5" y="2.5" width="4"   height="7.5" fill="#fde68a" opacity="0.35" rx="0.5" />
            <rect x="1.5" y="12"  width="4"   height="4"   fill="#00d4ff" opacity="0.2"  rx="0.5" />
            <rect x="7.5" y="12"  width="4"   height="4"   fill="#fbbf24" opacity="0.15" rx="0.5" />
          </pattern>
          {/* Windows light — blue office */}
          <pattern id="w-light" x="0" y="0" width="13" height="17" patternUnits="userSpaceOnUse">
            <rect x="1.5" y="2.5" width="4" height="7.5" fill="#93c5fd" opacity="0.52" rx="0.5" />
            <rect x="7.5" y="2.5" width="4" height="7.5" fill="#bfdbfe" opacity="0.32" rx="0.5" />
          </pattern>
          {/* Water reflection */}
          <linearGradient id="water" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#0a1830" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#010204" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="1440" height="600" fill={isDark ? 'url(#sky-d)' : 'url(#sky-l)'} />

        {/* Neon horizon (dark only) */}
        {isDark && <rect width="1440" height="600" fill="url(#neon-glow)" />}

        {/* Stars */}
        {isDark && stars.map((s, i) => (
          <circle
            key={i}
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            fill="white"
            opacity={s.opacity}
            style={{ animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite` }}
          />
        ))}

        {/* Moon */}
        {isDark ? (
          <g>
            <circle cx="1220" cy="68" r="26" fill="#f0edd8" opacity="0.88" />
            <circle cx="1230" cy="62" r="22" fill="#030810" />
          </g>
        ) : (
          <g>
            <circle cx="1220" cy="68" r="40" fill="#fbbf24" opacity="0.8" />
            <circle cx="1220" cy="68" r="58" fill="#fde68a" opacity="0.15" />
          </g>
        )}

        {/* Back layer — distant buildings */}
        <g opacity={0.38}>
          {[[60,442,26],[185,435,22],[298,438,30],[448,424,24],[574,416,28],[722,410,30],[882,420,26],[1032,428,26],[1180,432,22],[1325,438,26]].map(([x,y,w],i) => (
            <rect key={i} x={x} y={y} width={w} height={GROUND-y} fill={isDark ? '#070d1c' : '#9aaabb'} />
          ))}
        </g>

        {/* Main buildings */}
        {buildings.map((b, i) => (
          <BuildingShape key={i} b={b} fill={buildingFill} winId={winId} />
        ))}

        {/* Ground */}
        <rect x="0" y={GROUND} width="1440" height={600-GROUND} fill={isDark ? 'url(#gnd-d)' : 'url(#gnd-l)'} />

        {/* Street ambient strip */}
        {isDark && <rect x="0" y={GROUND-3} width="1440" height="5" fill="#00d4ff" opacity="0.14" />}

        {/* Water reflection */}
        {isDark && <rect x="0" y={GROUND+3} width="1440" height="120" fill="url(#water)" />}
      </svg>
    </div>
  )
}
