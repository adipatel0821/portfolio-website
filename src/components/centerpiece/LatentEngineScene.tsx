'use client'

import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { MotionValue } from 'framer-motion'
import { buildAttributes, buildFormationTexture } from './formations'
import { fragmentShader, vertexShader } from './shaders'

interface SceneProps {
  /** 0..4 scrub across the capability chapters. Read in useFrame, never in React. */
  chapter: MotionValue<number>
  particleCount: number
  pixelRatio: number
  /** Paused when the section is off-screen or the tab is hidden. */
  active: boolean
}

const COLOR_BASE = new THREE.Color('#C8C8CC')
const COLOR_SIGNAL = new THREE.Color('#E86A2B')
const COLOR_PHOSPHOR = new THREE.Color('#5CF56A')

function Particles({ chapter, particleCount, pixelRatio }: Omit<SceneProps, 'active'>) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const pointsRef = useRef<THREE.Points>(null)
  const { camera } = useThree()

  // Damped pointer parallax. Kept in a ref so pointer motion never re-renders.
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 })

  // The pinned wrapper is `pointer-events-none` so the copy above stays
  // clickable, which means r3f's own `state.pointer` never updates, the canvas
  // receives no events at all. Track the pointer on the window instead.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.tx = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.ty = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  const { geometry, uniforms } = useMemo(() => {
    const { data, width, height, rowsPerFormation } = buildFormationTexture(particleCount)
    const { seeds, roles } = buildAttributes(particleCount)

    const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.FloatType)
    // Nearest: each texel is one particle's exact position. Any filtering here
    // would blend neighbouring particles' coordinates into nonsense.
    texture.minFilter = THREE.NearestFilter
    texture.magFilter = THREE.NearestFilter
    texture.needsUpdate = true

    const geo = new THREE.BufferGeometry()
    const indices = new Float32Array(particleCount)
    for (let i = 0; i < particleCount; i++) indices[i] = i

    // A dummy position attribute is still required for the draw call; the real
    // positions come from the texture.
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(particleCount * 3), 3))
    geo.setAttribute('aIndex', new THREE.BufferAttribute(indices, 1))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    geo.setAttribute('aRole', new THREE.BufferAttribute(roles, 1))
    // Frustum culling uses the (empty) position attribute's bounds, so it would
    // cull the whole cloud instantly. Set a generous manual sphere instead.
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 4)

    return {
      geometry: geo,
      uniforms: {
        uPositions: { value: texture },
        uTexWidth: { value: width },
        uTexHeight: { value: height },
        uRowsPerFormation: { value: rowsPerFormation },
        uChapter: { value: 0 },
        uTime: { value: 0 },
        uSize: { value: 3.4 },
        uPixelRatio: { value: pixelRatio },
        uPulse: { value: -2 },
        uColorBase: { value: COLOR_BASE },
        uColorSignal: { value: COLOR_SIGNAL },
        uColorPhosphor: { value: COLOR_PHOSPHOR },
        uOpacity: { value: 1 },
      },
    }
  }, [particleCount, pixelRatio])

  useFrame((state, delta) => {
    const mat = materialRef.current
    if (!mat) return

    // Clamp delta: after a tab regains focus the first frame can be seconds
    // long, which would teleport every time-driven value.
    const dt = Math.min(delta, 0.05)

    const c = chapter.get()
    mat.uniforms.uChapter.value = c
    mat.uniforms.uTime.value = state.clock.elapsedTime

    // Activation wavefront sweeps left to right on a ~3.4s loop.
    mat.uniforms.uPulse.value = ((state.clock.elapsedTime * 0.85) % 3.4) - 1.7

    // Pointer parallax, damped toward the target set by the window listener.
    const p = pointer.current
    p.x += (p.tx - p.x) * Math.min(1, dt * 3)
    p.y += (p.ty - p.y) * Math.min(1, dt * 3)

    if (pointsRef.current) {
      // Slow ambient yaw plus a small pointer-driven tilt.
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.045 + p.x * 0.22
      pointsRef.current.rotation.x = -p.y * 0.14
    }

    // Camera dollies in per chapter, the reference's push into the lens.
    const targetZ = 4.35 - c * 0.3
    camera.position.z += (targetZ - camera.position.z) * Math.min(1, dt * 2.4)
    camera.position.x += (p.x * 0.16 - camera.position.x) * Math.min(1, dt * 2.4)
    camera.position.y += (p.y * 0.1 - camera.position.y) * Math.min(1, dt * 2.4)
    camera.lookAt(0, 0, 0)
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        // Additive keeps overlapping particles reading as density rather than
        // flat occlusion, essential for the edges to look like connections.
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/**
 * The WebGL centerpiece. Dynamically imported by CenterpieceStage, so three.js
 * and r3f never enter the main bundle.
 *
 * Perf shape: one THREE.Points, one draw call, zero triangles, no
 * post-processing, no lights, no shadows. Per-frame CPU work is a handful of
 * uniform writes.
 */
export default function LatentEngineScene({
  chapter,
  particleCount,
  pixelRatio,
  active,
}: SceneProps) {
  return (
    <Canvas
      // Halting the render loop when off-screen is the single biggest win on
      // battery devices, the section is pinned but the page is long.
      frameloop={active ? 'always' : 'never'}
      dpr={pixelRatio}
      gl={{
        antialias: false, // points are soft-edged in the shader; MSAA is wasted
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
      }}
      camera={{ position: [0, 0, 4.35], fov: 45, near: 0.1, far: 20 }}
      style={{ width: '100%', height: '100%' }}
    >
      <Particles chapter={chapter} particleCount={particleCount} pixelRatio={pixelRatio} />
    </Canvas>
  )
}
