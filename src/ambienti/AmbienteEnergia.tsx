import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { Shell, Cursore, Pulsante, Scope, Trace } from './ui'
import { TESTI } from './testi'
import Etichetta from './Etichetta'
import { helixGeometry } from './geo'

const OMEGA = 2.4 // rad/s rotazione spira
const CYAN = '#35e0ff'
const HEAT = '#ff8a2a'

type Stato = { ratio: number; ruota: boolean }

function Alternatore({ st, trE, trF }: { st: React.RefObject<Stato>; trE: Trace; trF: Trace }) {
  const loop = useRef<THREE.Group>(null)
  const piano = useRef<THREE.MeshBasicMaterial>(null)
  const lamp = useRef<THREE.MeshStandardMaterial>(null)
  const th = useRef(0.3)
  const rect = useMemo(
    () => [new THREE.Vector3(-0.9, -0.8, 0), new THREE.Vector3(0.9, -0.8, 0), new THREE.Vector3(0.9, 0.8, 0), new THREE.Vector3(-0.9, 0.8, 0), new THREE.Vector3(-0.9, -0.8, 0)],
    [],
  )
  useFrame((_, dt0) => {
    const dt = Math.min(dt0, 0.05)
    if (st.current.ruota) th.current += OMEGA * dt
    loop.current!.rotation.y = th.current
    const flux = Math.sin(th.current) // normale n=(sin,0,cos); B lungo x
    const emf = st.current.ruota ? -Math.cos(th.current) : 0 // -dPhi/dt (omega costante)
    piano.current!.opacity = 0.05 + 0.4 * Math.abs(flux)
    lamp.current!.emissiveIntensity = 0.1 + 2.6 * Math.abs(emf)
    trE.push(emf)
    trF.push(flux * 0.55)
  })
  return (
    <group position={[-6.2, 0.4, 0]}>
      {/* poli */}
      <mesh position={[-2.2, 0, 0]}>
        <boxGeometry args={[1.1, 2.2, 2]} />
        <meshStandardMaterial color="#2a5fd0" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[2.2, 0, 0]}>
        <boxGeometry args={[1.1, 2.2, 2]} />
        <meshStandardMaterial color="#58627c" metalness={0.3} roughness={0.5} />
      </mesh>
      <Etichetta p={[-2.2, 1.45, 0]}>N</Etichetta>
      <Etichetta p={[2.2, 1.45, 0]}>S</Etichetta>
      {[-0.7, 0, 0.7].map((z) =>
        [-0.5, 0, 0.5].map((y) => <Line key={`${z}${y}`} points={[[-1.65, y, z], [1.65, y, z]]} color={CYAN} lineWidth={1} transparent opacity={0.35} />),
      )}
      {/* asse e spira */}
      <mesh>
        <cylinderGeometry args={[0.04, 0.04, 2.1, 8]} />
        <meshStandardMaterial color="#8892a6" metalness={0.8} roughness={0.3} />
      </mesh>
      <group ref={loop}>
        <Line points={rect} color="#ffffff" lineWidth={3} />
        <mesh>
          <planeGeometry args={[1.8, 1.6]} />
          <meshBasicMaterial ref={piano} color={CYAN} transparent opacity={0.2} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>
      {/* lampadina */}
      <mesh position={[0, 2.05, 0]}>
        <sphereGeometry args={[0.32, 20, 16]} />
        <meshStandardMaterial ref={lamp} color="#223" emissive={CYAN} emissiveIntensity={0.1} />
      </mesh>
      <Line points={[[0, 1.05, 0], [0, 1.7, 0]]} color="#8892a6" lineWidth={1.5} />
      <Etichetta p={[0, -1.9, 0]}>Alternatore</Etichetta>
    </group>
  )
}

const PERC = 2.6 // semi-lato percorso flusso
function pathPos(s: number, out: THREE.Vector3, w = 1.3, h = 1.2) {
  // percorso rettangolare chiuso, s in [0,1)
  const per = 2 * (2 * w + 2 * h)
  let d = (((s % 1) + 1) % 1) * per
  if (d < 2 * w) return out.set(-w + d, -h, 0)
  d -= 2 * w
  if (d < 2 * h) return out.set(w, -h + d, 0)
  d -= 2 * h
  if (d < 2 * w) return out.set(w - d, h, 0)
  d -= 2 * w
  return out.set(-w, h - d, 0)
}

const NF = 28
function Trasformatore({ st }: { st: React.RefObject<Stato> }) {
  const [n2, setN2] = useState(6)
  const ratioRef = st
  const secGeo = useMemo(() => helixGeometry(0.55, 1.5, n2, 0.045), [n2])
  const priGeo = useMemo(() => helixGeometry(0.55, 1.5, 6, 0.045), [])
  const inst = useRef<THREE.InstancedMesh>(null)
  const ph = useRef(0)
  const t = useRef(0)
  const lastN = useRef(6)
  const d = useMemo(() => new THREE.Object3D(), [])
  const v = useMemo(() => new THREE.Vector3(), [])
  useFrame((_, dt0) => {
    const dt = Math.min(dt0, 0.05)
    t.current += dt
    const n = Math.max(1, Math.round(6 * ratioRef.current.ratio))
    if (n !== lastN.current) {
      lastN.current = n
      setN2(n)
    }
    const f = Math.sin(OMEGA * t.current)
    ph.current += f * dt * 0.12
    for (let i = 0; i < NF; i++) {
      pathPos(i / NF + ph.current, v)
      d.position.copy(v)
      d.scale.setScalar(0.5 + 0.9 * Math.abs(f))
      d.updateMatrix()
      inst.current!.setMatrixAt(i, d.matrix)
    }
    inst.current!.instanceMatrix.needsUpdate = true
  })
  return (
    <group position={[-0.6, 0.4, 0]}>
      {/* nucleo */}
      {[
        [0, 1.2, 3.2, 0.6],
        [0, -1.2, 3.2, 0.6],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0]}>
          <boxGeometry args={[w, h, 0.7]} />
          <meshStandardMaterial color="#6a7592" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
      {[-1.3, 1.3].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.6, 2.4, 0.7]} />
          <meshStandardMaterial color="#6a7592" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[-1.3, 0, 0]} geometry={priGeo}>
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.5} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[1.3, 0, 0]} geometry={secGeo}>
        <meshStandardMaterial color="#9fe9ff" emissive={CYAN} emissiveIntensity={0.4} metalness={0.6} roughness={0.3} />
      </mesh>
      <instancedMesh ref={inst} args={[undefined, undefined, NF]} position={[0, 0, 0.4]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshBasicMaterial color="#bff6ff" toneMapped={false} />
      </instancedMesh>
      <Etichetta p={[0, -2.2, 0]}>Trasformatore</Etichetta>
      <Etichetta p={[-1.3, 1.9, 0]}>N₁</Etichetta>
      <Etichetta p={[1.3, 1.9, 0]}>N₂</Etichetta>
    </group>
  )
}

const NL = 40
function Linea({ st }: { st: React.RefObject<Stato> }) {
  const cavo = useRef<THREE.MeshStandardMaterial>(null)
  const dots = useRef<THREE.InstancedMesh>(null)
  const hot = useRef<THREE.InstancedMesh>(null)
  const t = useRef(0)
  const d = useMemo(() => new THREE.Object3D(), [])
  const c1 = useMemo(() => new THREE.Color('#5c6a80'), [])
  const c2 = useMemo(() => new THREE.Color('#ff4a14'), [])
  const X0 = 2.0,
    X1 = 9.2,
    Y = 0.4
  useFrame((_, dt0) => {
    const dt = Math.min(dt0, 0.05)
    t.current += dt
    const r = st.current.ratio
    const heat = Math.min(1, Math.max(0, (2 - Math.log2(r)) / 4)) // 1 a r=0,25 ; 0 a r=4
    const I = Math.min(1.6, 0.9 / Math.max(0.35, r)) // corrente in linea ~ 1/V2
    cavo.current!.color.copy(c1).lerp(c2, heat)
    cavo.current!.emissive.copy(c2)
    cavo.current!.emissiveIntensity = heat * 1.0
    for (let i = 0; i < NL; i++) {
      const s = (i / NL + t.current * 0.12) % 1
      d.position.set(X0 + s * (X1 - X0), Y + 0.12, 0.08)
      d.scale.setScalar(0.3 + 0.9 * I * (0.6 + 0.4 * Math.sin(i + t.current * 6)))
      d.updateMatrix()
      dots.current!.setMatrixAt(i, d.matrix)
    }
    dots.current!.instanceMatrix.needsUpdate = true
    for (let i = 0; i < NL; i++) {
      const life = (t.current * 0.5 + i * 0.137) % 1
      d.position.set(X0 + ((i * 0.618) % 1) * (X1 - X0), Y + 0.15 + life * 1.6, 0)
      d.scale.setScalar(heat * heat * (1 - life) * 1.2 + 0.0001)
      d.updateMatrix()
      hot.current!.setMatrixAt(i, d.matrix)
    }
    hot.current!.instanceMatrix.needsUpdate = true
  })
  const piloni = [3.4, 5.6, 7.8]
  return (
    <group>
      <mesh position={[(X0 + X1) / 2, 0.4, 0]}>
        <boxGeometry args={[X1 - X0, 0.09, 0.09]} />
        <meshStandardMaterial ref={cavo} color="#5c6a80" emissive={HEAT} emissiveIntensity={0} roughness={0.5} />
      </mesh>
      {piloni.map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, -0.9, 0]}>
            <boxGeometry args={[0.1, 2.6, 0.1]} />
            <meshStandardMaterial color="#4a5470" />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[0.1, 0.1, 0.9]} />
            <meshStandardMaterial color="#4a5470" />
          </mesh>
        </group>
      ))}
      <instancedMesh ref={dots} args={[undefined, undefined, NL]}>
        <sphereGeometry args={[0.045, 6, 6]} />
        <meshBasicMaterial color="#8be9ff" toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={hot} args={[undefined, undefined, NL]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshBasicMaterial color={HEAT} toneMapped={false} transparent opacity={0.8} />
      </instancedMesh>
      <Etichetta p={[5.6, 2.6, 0]}>Linea di trasmissione</Etichetta>
      {/* citta */}
      <group position={[9.9, -0.9, 0]}>
        {[
          [0, 1.0, 0.8, 2.0],
          [0.9, 0.7, 0.8, 1.4],
          [-0.2, 0.5, 0.7, 1.0],
          [1.7, 0.45, 0.7, 0.9],
        ].map(([x, y, w, h], i) => (
          <mesh key={i} position={[x, y - 1.0 + h / 2 - 0.05 + 0.5 - 0.5, i % 2 ? 0.5 : -0.4]}>
            <boxGeometry args={[w, h, 0.7]} />
            <meshStandardMaterial color="#2a3550" emissive="#ffd27a" emissiveIntensity={0.35} />
          </mesh>
        ))}
      </group>
      <Etichetta p={[10.8, 1.6, 0]}>Utenze</Etichetta>
    </group>
  )
}

export default function AmbienteEnergia({ onClose }: { onClose: () => void }) {
  const [ratio, setRatio] = useState(1)
  const [ruota, setRuota] = useState(true)
  const st = useRef<Stato>({ ratio: 1, ruota: true })
  st.current.ratio = ratio
  st.current.ruota = ruota
  const trE = useMemo(() => new Trace(CYAN, 'fem alternatore'), [])
  const trF = useMemo(() => new Trace('#ffffff55', 'flusso'), [])
  const T = TESTI.energia.didascalie
  const did = ratio < 0.8 ? T.abbassa : ratio > 1.6 ? T.eleva : T.pari
  const testo = Math.abs(ratio - 1) < 0.02 ? 'N₂ / N₁ = 1' : ratio > 1 ? `N₂ / N₁ = ${ratio.toFixed(1).replace('.', ',')} (eleva)` : `N₂ / N₁ = ${ratio.toFixed(2).replace('.', ',')} (abbassa)`
  return (
    <Shell
      id="energia"
      onClose={onClose}
      didascalia={did}
      camera={{ position: [2.2, 3.2, 23], fov: 45 }}
      scope={<Scope titolo="corrente alternata" traces={[trF, trE]} />}
      controlli={
        <>
          <Cursore
            etichetta="Rapporto spire"
            valore={Math.log2(ratio)}
            min={-2}
            max={2}
            step={0.02}
            calore
            onChange={(l) => setRatio(Math.abs(l) < 0.08 ? 1 : Math.pow(2, l))}
            testo={testo}
            sinistra="abbassa la tensione"
            destra="la alza"
          />
          <Pulsante onClick={() => setRuota(!ruota)} attivo={!ruota}>
            {ruota ? 'Ferma la rotazione' : 'Riavvia'}
          </Pulsante>
        </>
      }
    >
      <ambientLight intensity={1.4} />
      <directionalLight position={[4, 8, 8]} intensity={2.6} />
      <Stars radius={60} depth={30} count={800} factor={3} fade speed={0} />
      <mesh position={[1.9, -2.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[26, 8]} />
        <meshStandardMaterial color="#0a1230" roughness={1} />
      </mesh>
      <Alternatore st={st} trE={trE} trF={trF} />
      <Line points={[[-5.4, -0.9, 0.6], [-5.4, -2.2, 0.6], [-2.5, -2.2, 0.6], [-1.9, -0.4, 0.6]]} color={CYAN} lineWidth={1.5} transparent opacity={0.6} />
      <Trasformatore st={st} />
      <Linea st={st} />
      <OrbitControls enablePan={false} target={[2.2, 0, 0]} maxPolarAngle={Math.PI * 0.62} minDistance={8} maxDistance={24} />
    </Shell>
  )
}
