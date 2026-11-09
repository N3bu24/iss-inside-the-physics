import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { Shell, Cursore, Scope, Trace } from './ui'
import { TESTI } from './testi'
import { hash2 } from './geo'

const R_E = 2
const R_ORB = 3.3
const W0 = 0.55 // rad/s alla "velocita reale" (scala didattica)
const TILT = (11 * Math.PI) / 180
const M = new THREE.Vector3(Math.sin(TILT), Math.cos(TILT), 0) // asse dipolo

function dipole(p: THREE.Vector3, out: THREE.Vector3) {
  const r = p.length()
  const rh = p.clone().divideScalar(r)
  const k = Math.pow(R_E / r, 3)
  return out.copy(rh).multiplyScalar(3 * M.dot(rh)).sub(M).multiplyScalar(k)
}

function terraTexture() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 256
  const g = c.getContext('2d')!
  const img = g.createImageData(512, 256)
  const noise = (x: number, y: number) => {
    const xi = Math.floor(x),
      yi = Math.floor(y)
    const xf = x - xi,
      yf = y - yi
    const u = xf * xf * (3 - 2 * xf),
      v = yf * yf * (3 - 2 * yf)
    const a = hash2(xi, yi),
      b = hash2(xi + 1, yi),
      c2 = hash2(xi, yi + 1),
      d = hash2(xi + 1, yi + 1)
    return a + (b - a) * u + (c2 - a) * v + (a - b - c2 + d) * u * v
  }
  for (let y = 0; y < 256; y++)
    for (let x = 0; x < 512; x++) {
      let n = 0,
        amp = 0.5,
        f = 3
      for (let o = 0; o < 5; o++) {
        const th = (x / 512) * Math.PI * 2 // periodico in longitudine
        n += amp * noise(Math.cos(th) * f + 20 + o * 7, Math.sin(th) * f + (y / 256) * f * 0.5 + o * 3)
        amp *= 0.5
        f *= 2
      }
      const lat = Math.abs(y / 256 - 0.5) * 2
      const i = (y * 512 + x) * 4
      let r: number, gg: number, b: number
      if (lat > 0.88) [r, gg, b] = [235, 242, 250]
      else if (n > 0.55) {
        const h = Math.min(1, (n - 0.55) * 4)
        ;[r, gg, b] = lat < 0.35 && n > 0.64 ? [150 - h * 30, 120, 70] : [40 + h * 60, 95 + h * 30, 55 + h * 20]
      } else {
        const d = Math.max(0, 1 - (0.55 - n) * 3)
        ;[r, gg, b] = [8 + d * 10, 40 + d * 40, 95 + d * 70]
      }
      img.data[i] = r
      img.data[i + 1] = gg
      img.data[i + 2] = b
      img.data[i + 3] = 255
    }
  g.putImageData(img, 0, 0)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function Terra() {
  const tex = useMemo(terraTexture, [])
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => ref.current && (ref.current.rotation.y += dt * 0.05))
  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[R_E, 64, 48]} />
        <meshStandardMaterial map={tex} roughness={0.85} />
      </mesh>
      <mesh scale={1.045}>
        <sphereGeometry args={[R_E, 48, 32]} />
        <meshBasicMaterial color="#4aa8ff" transparent opacity={0.13} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  )
}

function LineeCampo() {
  const linee = useMemo(() => {
    const out: THREE.Vector3[][] = []
    for (const L of [2.7, 3.4, 4.4, 5.8])
      for (let k = 0; k < 8; k++) {
        const ph = (k / 8) * Math.PI * 2
        const th0 = Math.asin(Math.sqrt(R_E / L))
        const pts: THREE.Vector3[] = []
        for (let i = 0; i <= 56; i++) {
          const th = th0 + ((Math.PI - 2 * th0) * i) / 56
          const r = L * Math.sin(th) ** 2
          pts.push(new THREE.Vector3(r * Math.sin(th) * Math.cos(ph), r * Math.cos(th), r * Math.sin(th) * Math.sin(ph)))
        }
        out.push(pts)
      }
    return out
  }, [])
  return (
    <group rotation={[0, 0, -TILT]}>
      {linee.map((p, i) => (
        <Line key={i} points={p} color="#35e0ff" lineWidth={1.3} transparent opacity={0.55} />
      ))}
    </group>
  )
}

const NP = 16
const TRUSS = 0.9

function ISS({ vel, incl, tr }: { vel: number; incl: number; tr: Trace }) {
  const g = useRef<THREE.Group>(null)
  const trussMat = useRef<THREE.MeshStandardMaterial>(null)
  const inst = useRef<THREE.InstancedMesh>(null)
  const u = useRef(0)
  const fase = useRef(Array.from({ length: NP }, (_, i) => i / NP))
  const tmp = useMemo(
    () => ({
      p: new THREE.Vector3(),
      q: new THREE.Vector3(),
      v: new THREE.Vector3(),
      B: new THREE.Vector3(),
      c: new THREE.Color(),
      d: new THREE.Object3D(),
      m: new THREE.Matrix4(),
      cross: new THREE.Vector3(),
    }),
    [],
  )
  useFrame((_, dt0) => {
    const dt = Math.min(dt0, 0.05)
    const w = W0 * vel
    u.current += w * dt
    const i = (incl * Math.PI) / 180
    const ex = new THREE.Vector3(1, 0, 0),
      e2 = new THREE.Vector3(0, Math.sin(i), Math.cos(i))
    const rh = ex.clone().multiplyScalar(Math.cos(u.current)).addScaledVector(e2, Math.sin(u.current))
    const vh = ex.clone().multiplyScalar(-Math.sin(u.current)).addScaledVector(e2, Math.cos(u.current))
    const zh = new THREE.Vector3().crossVectors(vh, rh) // direzione del traliccio
    const { p, q, v, B, c, d, cross } = tmp
    p.copy(rh).multiplyScalar(R_ORB)
    v.copy(vh).multiplyScalar(w * R_ORB)
    const g0 = g.current!
    g0.position.copy(p)
    tmp.m.makeBasis(vh, rh, zh)
    g0.quaternion.setFromRotationMatrix(tmp.m)
    dipole(p, B)
    const eps0 = cross.crossVectors(v, B).dot(zh)
    const lv0 = Math.min(1, Math.abs(eps0) * 1.3)
    tr.push(Math.max(-1, Math.min(1, eps0 * 1.1)))
    trussMat.current!.emissiveIntensity = 0.2 + 2.2 * lv0
    const im = inst.current!
    for (let k = 0; k < NP; k++) {
      const s = fase.current[k]
      const x = (s - 0.5) * TRUSS * 2
      q.copy(p).addScaledVector(zh, x * 0.3)
      dipole(q, B)
      const e = cross.crossVectors(v, B).dot(zh)
      const lv = Math.min(1, Math.abs(e) * 1.3)
      fase.current[k] = (s + Math.sign(e) * dt * (0.25 + 0.9 * lv) + 1) % 1
      d.position.set(0, 0.03, x)
      d.scale.setScalar(lv < 0.01 ? 0.0001 : 0.35 + 1.0 * lv)
      d.updateMatrix()
      im.setMatrixAt(k, d.matrix)
      c.set(e > 0 ? '#35e0ff' : '#b8f3ff')
      im.setColorAt(k, c)
    }
    im.instanceMatrix.needsUpdate = true
    if (im.instanceColor) im.instanceColor.needsUpdate = true
  })
  const pann = [-0.55, -0.2, 0.2, 0.55]
  return (
    <group ref={g} scale={0.42}>
      <mesh>
        <boxGeometry args={[0.06, 0.06, TRUSS * 2.1]} />
        <meshStandardMaterial ref={trussMat} color="#c8d2e0" emissive="#35e0ff" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 1.3, 14]} />
        <meshStandardMaterial color="#dfe5ee" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.13, 0.13, 0.4, 14]} />
        <meshStandardMaterial color="#aab4c4" metalness={0.5} roughness={0.4} />
      </mesh>
      {[-1, 1].map((sgn) =>
        pann.map((x, i) => (
          <mesh key={`${sgn}-${i}`} position={[x * 0.45, 0, sgn * (TRUSS - 0.34)]}>
            <boxGeometry args={[0.22, 0.015, 0.66]} />
            <meshStandardMaterial color="#12337a" emissive="#0a2a66" emissiveIntensity={0.6} metalness={0.7} roughness={0.3} />
          </mesh>
        )),
      )}
      <instancedMesh ref={inst} args={[undefined, undefined, NP]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  )
}

function Orbita({ incl }: { incl: number }) {
  const pts = useMemo(
    () =>
      Array.from(
        { length: 129 },
        (_, k) => new THREE.Vector3(Math.cos((k / 128) * Math.PI * 2) * R_ORB, 0, Math.sin((k / 128) * Math.PI * 2) * R_ORB),
      ),
    [],
  )
  // piano orbitale: contiene x; inclinato di i verso y (e2 = (0, sin i, cos i))
  return (
    <group rotation={[-(incl * Math.PI) / 180, 0, 0]}>
      <Line points={pts} color="#ffffff" lineWidth={0.8} transparent opacity={0.22} dashed dashSize={0.1} gapSize={0.1} />
    </group>
  )
}

export default function AmbienteCampo({ onClose }: { onClose: () => void }) {
  const [vel, setVel] = useState(1)
  const [incl, setIncl] = useState(51.6)
  const tr = useMemo(() => new Trace('#35e0ff', 'fem'), [])
  const T = TESTI.campo.didascalie
  const did = vel < 0.02 ? T.ferma : vel > 1.6 ? T.esagerata : T.reale
  const km =
    vel < 0.02 ? 'ferma' : vel > 1.6 ? 'esagerata' : Math.abs(vel - 1) < 0.06 ? '7,7 km/s' : `${(vel * 7.7).toFixed(1).replace('.', ',')} km/s`
  return (
    <Shell
      id="campo"
      onClose={onClose}
      didascalia={did}
      camera={{ position: [0, 3.5, 9.5], fov: 45 }}
      scope={<Scope titolo="fem lungo il traliccio" traces={[tr]} />}
      controlli={
        <>
          <Cursore
            etichetta="Velocità orbitale"
            valore={vel}
            min={0}
            max={3}
            onChange={(v) => setVel(Math.abs(v - 1) < 0.06 ? 1 : v)}
            testo={km}
            sinistra="ferma"
            destra="esagerata"
          />
          <Cursore
            etichetta="Inclinazione orbita"
            valore={incl}
            min={0}
            max={90}
            step={0.5}
            onChange={(v) => setIncl(Math.abs(v - 51.6) < 1.5 ? 51.6 : v)}
            testo={`${incl.toFixed(1).replace('.', ',')}°`}
            sinistra="equatoriale"
            destra="polare"
          />
        </>
      }
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[8, 4, 6]} intensity={2.2} />
      <Stars radius={60} depth={30} count={1200} factor={3} fade speed={0} />
      <Terra />
      <LineeCampo />
      <Orbita incl={incl} />
      <ISS vel={vel} incl={incl} tr={tr} />
      <OrbitControls enablePan={false} minDistance={5} maxDistance={16} />
    </Shell>
  )
}
