/**
 * The calm floor of the degradation ladder.
 *
 * Rendered for `prefers-reduced-motion`, and as the server-rendered state
 * before any capability check has run. Pure CSS: two radial pools and a fixed
 * dot grid, no animation of any kind, no JavaScript.
 *
 * It is deliberately still, a slowed-down version of the centerpiece would
 * still be motion, which is exactly what the user asked not to have.
 */
export default function StaticFallback() {
  return (
    <div aria-hidden="true" className="relative h-full w-full overflow-hidden">
      {/* Signal pool, offset left of centre where the cloud's mass sits. */}
      <div
        className="absolute left-[38%] top-1/2 h-[46vh] w-[46vh] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(232,106,43,0.16) 0%, rgba(232,106,43,0.05) 45%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      {/* Phosphor pool, smaller and further right. */}
      <div
        className="absolute left-[62%] top-[44%] h-[26vh] w-[26vh] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(92,245,106,0.10) 0%, transparent 68%)',
          filter: 'blur(56px)',
        }}
      />
      {/* Dot grid, the dot-matrix motif, held still. Masked to a soft ellipse
          so it reads as a cloud rather than wallpaper. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(242,242,242,0.22) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          maskImage: 'radial-gradient(ellipse 52% 46% at 47% 50%, black 0%, transparent 72%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 52% 46% at 47% 50%, black 0%, transparent 72%)',
        }}
      />
    </div>
  )
}
