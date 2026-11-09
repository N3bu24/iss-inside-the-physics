import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Line, OrbitControls, useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'
import type { Hotspot } from '../data/types'
import { assetExists } from '../lib/assets'

export const GLB_URL = '/models/eml.glb' // Draco; se assente si usa l'apparato segnaposto

/** livello di calore 0..1 (null = ciclo automatico) */
export type Calore = number | null

function Coils() {
  const copper = <meshStandardMaterial color="#c8743a" metalness={1} roughness={0.28} />
  return (
    <group>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={'u' + i} position={[0, 0.25 + i * 0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.1 - Math.abs(i - 3) * 0.04, 0.035, 16, 64]} />
          {copper}
        </mesh>
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={'l' + i} position={[0, -0.25 - i * 0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.1 - Math.abs(i - 3) * 0.04, 0.035, 16, 64]} />
          {copper}
        </mesh>
      ))}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.5, 1.6, 0.12, 64, 1, true]} />
        <meshStandardMaterial color="#1a1f2b" metalness={0.8} roughness={0.5} side={THREE.DoubleSide} transparent opacity={0.35} />
      </mesh>
      <mesh position={[0, -1.1, 0]}>
        <cylinderGeometry args={[1.7, 1.9, 0.2, 64]} />
        <meshStandardMaterial color="#1a1f2b" metalness={0.7} roughness={0.5} />
      </mesh>
    </group>
  )
}

function Sample({ calore }: { calore: Calore }) {
  const mesh = useRef<THREE.Mesh>(null)
  const mat = useRef<THREE.MeshStandardMaterial>(null)
  const heat = useRef(0)
  const grey = useMemo(() => new THREE.Color('#9aa3b2'), [])
  const hot = useMemo(() => new THREE.Color('#ff7a1a'), [])
  useFrame(({ clock }, d) => {
    const t = clock.elapsedTime
    const target = calore ?? (Math.sin(t * 0.25) * 0.5 + 0.5)
    heat.current += (target - heat.current) * Math.min(1, d * 1.5)
    if (mesh.current) {
      mesh.current.position.y = Math.sin(t * 1.6) * 0.03
      mesh.current.scale.setScalar(1 + (calore !== null && calore > 0.9 ? 0.06 * Math.sin(t * 6) : 0))
    }
    if (mat.current) {
      mat.current.color.copy(grey).lerp(hot, heat.current)
      mat.current.emissive.copy(hot).multiplyScalar(heat.current * 0.9)
      mat.current.roughness = 0.35 - heat.current * 0.2
    }
  })
  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[0.2, 48, 48]} />
      <meshStandardMaterial ref={mat} color="#9aa3b2" metalness={1} roughness={0.35} />
      <pointLight color="#ff8a2a" intensity={0.6} distance={2} />
    </mesh>
  )
}

function FieldLines() {
  const group = useRef<THREE.Group>(null)
  const lines = useMemo(() => {
    const out: THREE.Vector3[][] = []
    for (let k = 0; k < 12; k++) {
      const a = (Math.floor(k / 3) / 4) * Math.PI * 2
      const j = k % 3
      const rx = 0.45 + 0.28 * j
      const c = rx + 0.08
      const ry = 0.85 + 0.3 * j
      const pts: THREE.Vector3[] = []
      for (let i = 0; i <= 64; i++) {
        const u = (i / 64) * Math.PI * 2
        const r = c + rx * Math.cos(u)
        pts.push(new THREE.Vector3(Math.cos(a) * r, ry * Math.sin(u), Math.sin(a) * r))
      }
      out.push(pts)
    }
    return out
  }, [])
  const mats = useRef<{ dashOffset: number }[]>([])
  useFrame((_, d) => {
    mats.current.forEach((m) => m && (m.dashOffset -= d * 0.4))
    if (group.current) group.current.rotation.y += d * 0.05
  })
  return (
    <group ref={group}>
      {lines.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color="#35e0ff"
          lineWidth={1.2}
          transparent
          opacity={0.55}
          dashed
          dashSize={0.12}
          gapSize={0.08}
          ref={(l: unknown) => {
            const m = (l as { material?: { dashOffset: number } } | null)?.material
            if (m) mats.current[i] = m
          }}
        />
      ))}
    </group>
  )
}

function Placeholder({ calore }: { calore: Calore }) {
  return (
    <group>
      <Coils />
      <Sample calore={calore} />
      <FieldLines />
    </group>
  )
}

function GlbModel() {
  const { scene } = useGLTF(GLB_URL, true)
  return <primitive object={scene} />
}

function Hotspot3D({ h, onSelect, active }: { h: Hotspot; onSelect: (id: string) => void; active: boolean }) {
  return (
    <Html position={h.pos3d} center zIndexRange={[20, 0]}>
      <button
        onClick={() => onSelect(h.id)}
        className="group relative"
        aria-label={h.titolo}
      >
        <div className="hs-dot" style={active ? { transform: 'scale(1.4)' } : undefined} />
        <span className="glass pointer-events-none absolute left-7 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1 text-xs opacity-0 transition group-hover:opacity-100">{h.titolo}</span>
      </button>
    </Html>
  )
}

interface Props {
  hotspot: Hotspot[]
  attivo: string | null
  calore: Calore
  onHotspot: (id: string) => void
}

export default function EmlScene({ hotspot, attivo, calore, onHotspot }: Props) {
  const [glb, setGlb] = useState(false)
  useEffect(() => { assetExists(GLB_URL).then(setGlb) }, [])
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#05070f] via-[#0a1230] to-[#05070f]">
      <Canvas camera={{ position: [3.2, 1.6, 3.6], fov: 42 }} dpr={[1, 2]}>
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 5, 3]} intensity={1.6} />
        <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#6ab8ff" />
        <Suspense fallback={null}>
          <Environment preset="city" environmentIntensity={0.35} />
          {glb ? <GlbModel /> : <Placeholder calore={calore} />}
        </Suspense>
        {hotspot.filter((h) => h.pos3d).map((h) => (
          <Hotspot3D key={h.id} h={h} onSelect={onHotspot} active={attivo === h.id} />
        ))}
        <OrbitControls enableDamping minDistance={1.5} maxDistance={9} target={[0, 0, 0]} makeDefault />
      </Canvas>
    </div>
  )
}
