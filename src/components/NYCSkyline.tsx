'use client'

export default function NYCSkyline() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base: deep dark teal */}
      <div className="absolute inset-0" style={{ background: '#0a1720' }} />

      {/* Ambient teal glow — left wall */}
      <div
        className="absolute"
        style={{
          left: 0,
          top: '20%',
          width: '45%',
          height: '60%',
          background: 'radial-gradient(ellipse at left center, rgba(10,70,100,0.45) 0%, transparent 70%)',
        }}
      />

      {/* Main doorway glow — warm amber core */}
      <div
        className="absolute"
        style={{
          left: '52%',
          top: '8%',
          width: '22%',
          height: '72%',
          background:
            'radial-gradient(ellipse 55% 80% at 50% 38%, rgba(255,220,140,0.95) 0%, rgba(255,160,50,0.75) 18%, rgba(220,100,15,0.4) 38%, rgba(160,60,5,0.12) 60%, transparent 78%)',
          filter: 'blur(2px)',
        }}
      />

      {/* Doorway halo — wide soft glow */}
      <div
        className="absolute"
        style={{
          left: '38%',
          top: '5%',
          width: '46%',
          height: '78%',
          background:
            'radial-gradient(ellipse 70% 85% at 48% 35%, rgba(255,180,60,0.22) 0%, rgba(200,90,10,0.1) 45%, transparent 70%)',
          filter: 'blur(18px)',
        }}
      />

      {/* Floor light cone — triangular cast */}
      <div
        className="absolute bottom-0"
        style={{
          left: '30%',
          width: '46%',
          height: '55%',
          background:
            'linear-gradient(to bottom, rgba(240,160,40,0.18) 0%, rgba(200,100,15,0.1) 30%, rgba(140,60,5,0.04) 65%, transparent 100%)',
          clipPath: 'polygon(28% 0%, 72% 0%, 100% 100%, 0% 100%)',
        }}
      />

      {/* Floor ambient warmth */}
      <div
        className="absolute bottom-0"
        style={{
          left: '20%',
          width: '60%',
          height: '30%',
          background:
            'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(200,110,20,0.14) 0%, transparent 70%)',
          filter: 'blur(12px)',
        }}
      />

      {/* Person silhouette */}
      <svg
        className="absolute"
        style={{ left: '54%', bottom: '18%', width: '5%', minWidth: 44 }}
        viewBox="0 0 60 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="30" cy="12" rx="10" ry="12" fill="#050e15" />
        <path
          d="M14 32 Q10 55 8 90 Q8 100 12 102 L18 102 L18 90 Q24 75 30 70 Q36 75 42 90 L42 102 L48 102 Q52 100 52 90 Q50 55 46 32 Q40 24 30 24 Q20 24 14 32Z"
          fill="#050e15"
        />
        <path d="M8 90 Q5 115 6 130 L20 130 L22 100 L18 100Z" fill="#060f17" />
        <path d="M52 90 Q55 115 54 130 L40 130 L38 100 L42 100Z" fill="#060f17" />
      </svg>

      {/* Shadow on floor */}
      <div
        className="absolute"
        style={{
          left: '40%',
          bottom: '16%',
          width: '22%',
          height: '6%',
          background: 'radial-gradient(ellipse 80% 100% at 35% 100%, rgba(3,10,18,0.6) 0%, transparent 100%)',
          filter: 'blur(6px)',
          transform: 'skewX(-30deg)',
          transformOrigin: 'left bottom',
        }}
      />

      {/* Top vignette */}
      <div
        className="absolute inset-x-0 top-0"
        style={{ height: '35%', background: 'linear-gradient(to bottom, rgba(5,12,20,0.85) 0%, transparent 100%)' }}
      />

      {/* Bottom vignette */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{ height: '25%', background: 'linear-gradient(to top, rgba(5,12,20,0.9) 0%, transparent 100%)' }}
      />

      {/* Side vignettes */}
      <div
        className="absolute inset-y-0 left-0"
        style={{ width: '25%', background: 'linear-gradient(to right, rgba(5,12,20,0.75) 0%, transparent 100%)' }}
      />
      <div
        className="absolute inset-y-0 right-0"
        style={{ width: '25%', background: 'linear-gradient(to left, rgba(5,12,20,0.75) 0%, transparent 100%)' }}
      />
    </div>
  )
}
