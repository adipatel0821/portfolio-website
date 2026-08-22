/**
 * Shaders for the Latent Engine.
 *
 * The entire morph happens here. Positions live in a float texture (five
 * formations stacked vertically); the vertex shader samples the two formations
 * bracketing `uChapter` and interpolates. The CPU writes exactly one uniform
 * per frame, no attribute uploads, no geometry rebuilds, no React renders.
 */

export const vertexShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uPositions;
  uniform float uTexWidth;
  uniform float uTexHeight;
  uniform float uRowsPerFormation;

  uniform float uChapter;      // 0..4, fractional, the scroll scrub
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uPulse;        // travelling activation wavefront, in world x

  attribute float aIndex;
  attribute float aSeed;
  attribute float aRole;       // 0 base · 1 signal · 2 phosphor

  varying float vRole;
  varying float vActivation;
  varying float vDepth;

  // Fetch this particle's position for a given formation index.
  vec3 samplePosition(float formation) {
    float col = mod(aIndex, uTexWidth);
    float rowInFormation = floor(aIndex / uTexWidth);
    float row = formation * uRowsPerFormation + rowInFormation;

    vec2 uv = vec2(
      (col + 0.5) / uTexWidth,
      (row + 0.5) / uTexHeight
    );
    return texture2D(uPositions, uv).xyz;
  }

  void main() {
    float chapter = clamp(uChapter, 0.0, 4.0);
    float from = floor(chapter);
    float to   = min(from + 1.0, 4.0);

    // smoothstep rather than a linear mix: particles ease out of one formation
    // and into the next instead of snapping direction at the midpoint.
    float blend = smoothstep(0.0, 1.0, fract(chapter));

    vec3 a = samplePosition(from);
    vec3 b = samplePosition(to);
    vec3 pos = mix(a, b, blend);

    // Perpetual low-amplitude drift so the cloud never looks frozen between
    // chapters. Phase is offset per particle by its seed.
    float drift = uTime * 0.35 + aSeed * 6.2831;
    pos += vec3(
      sin(drift) * 0.014,
      cos(drift * 1.13) * 0.014,
      sin(drift * 0.79) * 0.014
    );

    // Green activation wavefront sweeping along x. Only meaningful in the
    // network formation, so it is gated on proximity to chapter 1.
    float networkProximity = 1.0 - clamp(abs(chapter - 1.0), 0.0, 1.0);
    vActivation = exp(-pow((pos.x - uPulse) * 2.6, 2.0)) * networkProximity;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    vDepth = -mvPosition.z;
    vRole = aRole;

    // Perspective size attenuation. The 0.55 floor keeps distant particles from
    // collapsing to sub-pixel flicker.
    float sizeVariation = 0.55 + aSeed * 0.85;
    gl_PointSize = uSize * uPixelRatio * sizeVariation * (1.0 / max(vDepth, 0.1));
  }
`

export const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uColorBase;
  uniform vec3 uColorSignal;
  uniform vec3 uColorPhosphor;
  uniform float uOpacity;

  varying float vRole;
  varying float vActivation;
  varying float vDepth;

  void main() {
    // Round soft sprite. Cheaper than MSAA on the whole canvas and gives a
    // nicer falloff than a hard-edged square point.
    vec2 offset = gl_PointCoord - 0.5;
    float dist = length(offset);
    if (dist > 0.5) discard;
    float alpha = smoothstep(0.5, 0.18, dist);

    vec3 color = uColorBase;
    if (vRole > 1.5)      color = uColorPhosphor;
    else if (vRole > 0.5) color = uColorSignal;

    // Activation overrides colour where the wavefront passes.
    color = mix(color, uColorPhosphor, vActivation);

    // Depth fade, far particles recede rather than crowding the near ones.
    float depthFade = smoothstep(7.0, 1.4, vDepth);

    gl_FragColor = vec4(color, alpha * uOpacity * depthFade * (0.35 + vActivation * 0.65 + 0.3));
  }
`
