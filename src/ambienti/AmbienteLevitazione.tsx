import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, Stars } from '@react-three/drei'
import * as THREE from 'three'
import SimulazioneShell from '../simulazioni/SimulazioneShell'
import { Cursore, Pulsante } from '../simulazioni/controlli'
import { passiSimulazione } from '../simulazioni/passi'
import type { Passo } from '../simulazioni/contenuto'
import { TESTI } from './testi'
import Etichetta from './Etichetta'
import { helixGeometry } from './geo'

const CYAN = '#35e0ff'
const HEAT = '#ff8a2a'
const H_REST = 0.12 // quota del carrello appoggiato
const H_MAX = 0.75

type Stato = { v: number; eml: boolean }

/** Intensita effetti: satura con la velocita */
const effetto = (v: number) => 1 - Math.exp(-v * 4.5)
const quota = (v: number) => H_MAX * ((v * v) / (v * v + 0.06))

const NR = 12
const NS = 22
function Maglev({ st }: { st: React.RefObject<Stato> }) {
  const root = useRef<THREE.Group>(null)
  const cart = useRef<THREE.Group>(null)
  const sleepers = useRef<THREE.InstancedMesh>(null)
  const dashes = useRef<THREE.InstancedMesh>(null)
  const dots = useRef<THREE.InstancedMesh>(null)
  const sparks = useRef<THREE.InstancedMesh>(null)
  const rings = useRef<THREE.Group>(null)
  const lenz = useRef<THREE.Group>(null)
  const arcs = useRef<THREE.Group>(null)
  const off = useRef(0)
  const t = useRef(0)
  const d = useMemo(() => new THREE.Object3D(), [])
  const arc = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * Math.PI
      pts.push(new THREE.Vector3(Math.cos(a) * 0.7, -0.42 - Math.sin(a) * 0.45, 0))
    }
    return pts
  }, [])
  useFrame((_, dt0) => {
    const dt = Math.min(dt0, 0.05)
    t.current += dt
    const v = st.current.v
    const e = effetto(v)
    const h = quota(v)
    off.current = (off.current + v * 7 * dt) % 1.5
    root.current!.position.x += ((st.current.eml ? -3.6 : 0) - root.current!.position.x) * Math.min(1, dt * 3)
    cart.current!.position.y = 0.5 + H_REST + h + Math.sin(t.current * 2.3) * 0.015 * (h / H_MAX)
    // traversine e tacche che scorrono
    for (let i = 0; i < NS; i++) {
      const x = ((((i * 1.5 - off.current + 16.5) % 33) + 33) % 33) - 16.5
      d.position.set(x, -0.25, 0)
      d.scale.set(1, 1, 1)
      d.updateMatrix()
      sleepers.current!.setMatrixAt(i, d.matrix)
    }
    sleepers.current!.instanceMatrix.needsUpdate = true
    for (let i = 0; i < NS * 2; i++) {
      const x = ((((Math.floor(i / 2) * 1.5 - off.current + 16.5) % 33) + 33) % 33) - 16.5
      d.position.set(x, 0.105, i % 2 ? 0.95 : -0.95)
      d.updateMatrix()
      dashes.current!.setMatrixAt(i, d.matrix)
    }
    dashes.current!.instanceMatrix.needsUpdate = true
    // vortici di corrente: due anelli controrotanti sotto i poli
    rings.current!.visible = e > 0.01
    rings.current!.children.forEach((c) => {
      const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial
      m.opacity = 0.15 + 0.7 * e
    })
    for (let k = 0; k < 2 * 2 * NR; k++) {
      const ring = Math.floor(k / NR) // 0,1 esterno/interno polo1; 2,3 polo2
      const pole = ring < 2 ? -1 : 1
      const rad = ring % 2 ? 0.32 : 0.6
      const a = (k % NR) / NR * Math.PI * 2 + t.current * (0.4 + 5 * v) * -pole * (ring % 2 ? 1.5 : 1)
      d.position.set(pole * 0.75 + Math.cos(a) * rad, 0.14, Math.sin(a) * rad)
      d.scale.setScalar(e < 0.01 ? 0.0001 : 0.35 + 0.5 * e)
      d.updateMatrix()
      dots.current!.setMatrixAt(k, d.matrix)
    }
    dots.current!.instanceMatrix.needsUpdate = true
    // campo opposto (Lenz)
    lenz.current!.visible = e > 0.05
    lenz.current!.children.forEach((c, i) => {
      c.scale.y = 0.4 + 1.2 * e + 0.15 * Math.sin(t.current * 5 + i)
    })
    arcs.current!.children.forEach((c) => (((c as THREE.Mesh).material as THREE.Material).opacity = 0.45 - 0.2 * e))
    // scintille d'attrito
    const fr = (1 - Math.min(1, h / 0.15)) * Math.min(1, v * 6)
    for (let i = 0; i < 12; i++) {
      const life = (t.current * 3 + i * 0.37) % 1
      d.position.set((i % 2 ? 0.9 : -0.9) - life * 0.5 * Math.sign(v + 0.0001) * -1 - 0.1, 0.12 + life * 0.3, i % 3 === 0 ? 0.75 : -0.75)
      d.scale.setScalar(fr * (1 - life) + 0.0001)
      d.updateMatrix()
      sparks.current!.setMatrixAt(i, d.matrix)
    }
    sparks.current!.instanceMatrix.needsUpdate = true
  })
  return (
    <group ref={root}>
      {/* guida in alluminio */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[33, 0.2, 2.5]} />
        <meshStandardMaterial color="#b9c4d4" metalness={0.5} roughness={0.35} />
      </mesh>
      <instancedMesh ref={sleepers} args={[undefined, undefined, NS]}>
        <boxGeometry args={[0.35, 0.2, 3.5]} />
        <meshStandardMaterial color="#3a4254" />
      </instancedMesh>
      <instancedMesh ref={dashes} args={[undefined, undefined, NS * 2]}>
        <boxGeometry args={[0.5, 0.01, 0.06]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.5} />
      </instancedMesh>
      {/* vortici */}
      <group ref={rings}>
        {[
          [-0.75, 0.6],
          [-0.75, 0.32],
          [0.75, 0.6],
          [0.75, 0.32],
        ].map(([x, r], i) => (
          <mesh key={i} position={[x, 0.125, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r, 0.018, 6, 40]} />
            <meshBasicMaterial color={HEAT} transparent opacity={0.3} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <instancedMesh ref={dots} args={[undefined, undefined, 4 * NR]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshBasicMaterial color="#ffb066" toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={sparks} args={[undefined, undefined, 12]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshBasicMaterial color="#ffcf8a" toneMapped={false} />
      </instancedMesh>
      {/* carrello */}
      <group ref={cart} position={[0, 0.7, 0]}>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[2.8, 0.5, 1.5]} />
          <meshStandardMaterial color="#34405e" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.2, 0.76]}>
          <boxGeometry args={[2.4, 0.06, 0.02]} />
          <meshBasicMaterial color={CYAN} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.65, 0]}>
          <boxGeometry args={[1.8, 0.4, 1.2]} />
          <meshStandardMaterial color="#46557c" metalness={0.5} roughness={0.35} />
        </mesh>
        {[-0.75, 0.75].map((x, i) => (
          <mesh key={x} position={[x, -0.2, 0]}>
            <boxGeometry args={[0.7, 0.2, 1.1]} />
            <meshStandardMaterial color={i ? '#2a3142' : '#12337a'} emissive={i ? '#000' : '#0a2a66'} metalness={0.6} roughness={0.35} />
          </mesh>
        ))}
        <Etichetta p={[-0.75, -0.2, 0.9]}>N</Etichetta>
        <Etichetta p={[0.75, -0.2, 0.9]}>S</Etichetta>
        {/* ruote */}
        {[-1, 1].map((sx) =>
          [-1, 1].map((sz) => (
            <mesh key={`${sx}${sz}`} position={[sx * 1.0, -0.12 - 0.03, sz * 0.8]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.1, 14]} />
              <meshStandardMaterial color="#555d70" metalness={0.8} roughness={0.4} />
            </mesh>
          )),
        )}
        <group ref={arcs}>
          <Line points={arc} color={CYAN} lineWidth={1.2} transparent opacity={0.4} />
          <Line points={arc.map((p) => new THREE.Vector3(p.x * 0.55, p.y * 0.9, 0.35))} color={CYAN} lineWidth={1} transparent opacity={0.4} />
          <Line points={arc.map((p) => new THREE.Vector3(p.x * 0.55, p.y * 0.9, -0.35))} color={CYAN} lineWidth={1} transparent opacity={0.4} />
        </group>
        {/* campo opposto (Lenz): frecce verso l'alto, dal basso */}
        <group ref={lenz}>
          {[-0.75, 0.75].map((x) => (
            <group key={x} position={[x, -0.78, 0]} scale={[1, 1, 1]}>
              <mesh position={[0, 0.25, 0]}>
                <coneGeometry args={[0.1, 0.3, 10]} />
                <meshBasicMaterial color="#9ff2ff" toneMapped={false} transparent opacity={0.9} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
      <Etichetta size={0.26} p={[-5, 1.2, 0]}>Guida in alluminio</Etichetta>
    </group>
  )
}

const NE = 10
function EML({ st }: { st: React.RefObject<Stato> }) {
  const root = useRef<THREE.Group>(null)
  const sfera = useRef<THREE.Group>(null)
  const rings = useRef<THREE.Group>(null)
  const campo = useRef<THREE.Group>(null)
  const t = useRef(0)
  const coil = useMemo(() => helixGeometry(1.0, 2.0, 7, 0.05), [])
  const loops = useMemo(() => {
    return [0.5, 0.85, 1.15].map((s) =>
      Array.from({ length: 41 }, (_, i) => {
        const a = (i / 40) * Math.PI * 2
        return new THREE.Vector3(Math.cos(a) * 1.25 * s, (s - 0.85) * 1.4 - 0.9 + 0.9, Math.sin(a) * 1.25 * s)
      }),
    )
  }, [])
  void NE
  useFrame((_, dt0) => {
    const dt = Math.min(dt0, 0.05)
    t.current += dt
    const e = effetto(st.current.v)
    root.current!.position.x += ((st.current.eml ? 4.2 : 14) - root.current!.position.x) * Math.min(1, dt * 3)
    sfera.current!.position.y = 0.55 + 0.75 * (e * e) / (e * e + 0.1) * 1.0 + Math.sin(t.current * 2) * 0.02 * e
    const pulse = 0.5 + 0.5 * Math.sin(t.current * (2 + 14 * st.current.v))
    rings.current!.children.forEach((c, i) => {
      const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial
      m.opacity = (0.2 + 0.7 * e) * (0.6 + 0.4 * Math.sin(t.current * 6 + i))
    })
    campo.current!.children.forEach((c, i) => {
      const m = (c as unknown as { material: THREE.Material }).material
      if (m) m.opacity = (0.1 + 0.6 * e) * (0.4 + 0.6 * pulse) * (1 - i * 0.12)
    })
  })
  return (
    <group ref={root} position={[14, 0, -3.8]}>
      <mesh position={[0, 0.0, 0]}>
        <cylinderGeometry args={[1.5, 1.7, 0.3, 32]} />
        <meshStandardMaterial color="#1a1f2b" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.7, 8]} />
        <meshStandardMaterial color="#555d70" />
      </mesh>
      <mesh geometry={coil} position={[0, 1.3, 0]}>
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.55} metalness={0.6} roughness={0.3} />
      </mesh>
      <group ref={campo} position={[0, 1.3, 0]}>
        {loops.map((p, i) => (
          <Line key={i} points={p} color={CYAN} lineWidth={1.2} transparent opacity={0.3} />
        ))}
      </group>
      <group ref={sfera} position={[0, 0.6, 0]}>
        <mesh>
          <sphereGeometry args={[0.62, 32, 24]} />
          <meshStandardMaterial color="#b7c0cf" metalness={0.85} roughness={0.25} />
        </mesh>
        <group ref={rings}>
          {[
            [0, 0.67],
            [0.36, 0.55],
            [-0.36, 0.55],
          ].map(([y, r], i) => (
            <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[r, 0.02, 6, 36]} />
              <meshBasicMaterial color={HEAT} transparent opacity={0.4} toneMapped={false} />
            </mesh>
          ))}
        </group>
      </group>
      <Etichetta p={[0, 3.0, 0]}>Campione nell'EML</Etichetta>
    </group>
  )
}

export default function AmbienteLevitazione({ onClose }: { onClose: () => void }) {
  const [v, setV] = useState(0)
  const [eml, setEml] = useState(false)
  const st = useRef<Stato>({ v: 0, eml: false })
  st.current.v = v
  st.current.eml = eml
  const T = TESTI.levitazione.didascalie
  const did = eml && v > 0.1 ? T.eml : v < 0.04 ? T.fermo : quota(v) < 0.5 * H_MAX ? T.medio : T.veloce
  const kmh = Math.round((v * 480) / 10) * 10
  const passi = useMemo(() => passiSimulazione('levitazione'), [])
  const onPasso = (i: number | null, p?: Passo) => {
    if (i === null || !p) return
    if (p.stato === 'fermo') { setV(0); setEml(false) }
    else if (p.stato === 'medio') { setV(0.45); setEml(false) }
    else if (p.stato === 'veloce') { setV(1); setEml(false) }
    else if (p.stato === 'eml') { setV(0.9); setEml(true) }
  }
  return (
    <SimulazioneShell
      id="levitazione"
      onClose={onClose}
      titolo={TESTI.levitazione.titolo}
      intro={TESTI.levitazione.intro}
      formula={TESTI.levitazione.formula}
      formulaNota={TESTI.levitazione.formulaNota}
      agenda={TESTI.levitazione.agenda}
      slide={TESTI.levitazione.slide}
      passi={passi}
      onPasso={onPasso}
      orbit={{ target: [0, 0.8, 0], maxPolarAngle: Math.PI * 0.55, minDistance: 5, maxDistance: 20 }}
      didascalia={did}
      camera={{ position: [0, 3.6, 9.5], fov: 45 }}
      controlli={
        <>
          <Cursore
            etichetta="Velocità del carrello"
            valore={v}
            min={0}
            max={1}
            calore
            onChange={setV}
            testo={v < 0.02 ? 'fermo' : `${kmh} km/h`}
            sinistra="fermo"
            destra="Maglev"
          />
          <Pulsante onClick={() => setEml(!eml)} attivo={eml}>
            {eml ? "Nascondi l'EML" : "Confronta con l'EML"}
          </Pulsante>
        </>
      }
    >
      <ambientLight intensity={1.3} />
      <directionalLight position={[3, 8, 6]} intensity={2.6} />
      <Stars radius={60} depth={30} count={800} factor={3} fade speed={0} />
      <Maglev st={st} />
      <EML st={st} />
    </SimulazioneShell>
  )
}
