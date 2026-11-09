import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, Stars } from '@react-three/drei'
import * as THREE from 'three'
import SimulazioneShell from './SimulazioneShell'
import { Cursore, Pulsante, Scope, Trace } from './controlli'
import { passiSimulazione } from './passi'
import type { Passo } from './contenuto'
import type { HotspotSim } from './SimulazioneShell'
import Etichetta from '../ambienti/Etichetta'

const A = 1.0 // semilarghezza della spira
const H = 1.2 // semialtezza
const OMEGA_MAX = 4 // rad/s a velocita' 1

type Stato = { motore: boolean; vel: number }

/** Spira + collettore: ruotano insieme attorno all'asse y. */
function Spira({ st, trE, trB, lampada }: { st: React.RefObject<Stato>; trE: Trace; trB: Trace; lampada: React.RefObject<THREE.MeshStandardMaterial | null> }) {
  const g = useRef<THREE.Group>(null)
  const th = useRef(0)
  const frecce = useRef<THREE.Group>(null)
  const pts = useMemo(() => [new THREE.Vector3(-A, -H, 0), new THREE.Vector3(A, -H, 0), new THREE.Vector3(A, H, 0), new THREE.Vector3(-A, H, 0), new THREE.Vector3(-A, -H, 0)], [])
  useFrame((_, dt0) => {
    const dt = Math.min(dt0, 0.05)
    const { motore, vel } = st.current
    const w = vel * OMEGA_MAX
    th.current += w * dt
    g.current!.rotation.y = th.current
    const s = Math.sin(th.current)
    if (motore) {
      trE.push(0.8) // tensione della batteria
      trB.push(-0.8 * vel) // fem opposta
    } else {
      trE.push(s * vel * 0.95)
      trB.push(0)
    }
    const m = lampada.current
    if (m) {
      const l = motore ? 0 : Math.abs(s) * vel
      m.emissiveIntensity = 0.1 + 3 * l
    }
    // frecce di forza sui lati (solo motore): F = i l x B, direzioni opposte sui due lati
    const fr = frecce.current
    if (fr) {
      fr.visible = motore
      const c = Math.cos(th.current)
      fr.children[0].position.set(A * c, 0, -A * s)
      fr.children[1].position.set(-A * c, 0, A * s)
      const sgn = Math.sign(Math.cos(th.current)) || 1 // il collettore inverte la corrente a mezzo giro
      fr.children[0].scale.set(1, sgn, 1)
      fr.children[1].scale.set(1, -sgn, 1)
    }
  })
  const rotNorm = [0, 0, 0] as [number, number, number]
  return (
    <>
      <group ref={g}>
        <Line points={pts} color="#e0914f" lineWidth={4} />
        <mesh position={[0, -H - 0.1, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 2 * H + 1, 10]} />
          <meshStandardMaterial color="#9aa3b2" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* collettore: due semianelli */}
        {[0, Math.PI].map((t, i) => (
          <mesh key={i} position={[0, -H - 0.55, 0]}>
            <cylinderGeometry args={[0.24, 0.24, 0.3, 24, 1, false, t + 0.1, Math.PI - 0.2]} />
            <meshStandardMaterial color={i ? '#b87333' : '#d9a066'} metalness={0.9} roughness={0.3} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
      <group ref={frecce} rotation={rotNorm}>
        {[0, 1].map((i) => (
          <group key={i}>
            <mesh position={[0, 0, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
              <meshBasicMaterial color="#5be37a" toneMapped={false} />
            </mesh>
            <mesh position={[0, 0, 0.78]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.12, 0.25, 12]} />
              <meshBasicMaterial color="#5be37a" toneMapped={false} />
            </mesh>
          </group>
        ))}
      </group>
      {/* spazzole */}
      {[-1, 1].map((x) => (
        <mesh key={x} position={[x * 0.34, -H - 0.55, 0]}>
          <boxGeometry args={[0.16, 0.12, 0.12]} />
          <meshStandardMaterial color="#2b2f3a" metalness={0.4} roughness={0.6} />
        </mesh>
      ))}
    </>
  )
}

function Magneti() {
  return (
    <>
      <mesh position={[-2.6, 0, 0]}>
        <boxGeometry args={[1.2, 3.4, 2.2]} />
        <meshStandardMaterial color="#d0342c" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[2.6, 0, 0]}>
        <boxGeometry args={[1.2, 3.4, 2.2]} />
        <meshStandardMaterial color="#2a62d6" metalness={0.3} roughness={0.5} />
      </mesh>
      <Etichetta p={[-2.6, 2.1, 0]}>N</Etichetta>
      <Etichetta p={[2.6, 2.1, 0]}>S</Etichetta>
      {[-0.9, 0, 0.9].map((y) => (
        <group key={y} position={[0, y, 0.0]}>
          <Line points={[[-2, 0, 0.9], [2, 0, 0.9]]} color="#ffffff" lineWidth={1} transparent opacity={0.18} />
        </group>
      ))}
    </>
  )
}

/** Manovella (alternatore) o batteria (motore). */
function Sorgente({ st }: { st: React.RefObject<Stato> }) {
  const manov = useRef<THREE.Group>(null)
  const alt = useRef<THREE.Group>(null)
  const mot = useRef<THREE.Group>(null)
  const a = useRef(0)
  useFrame((_, dt) => {
    const { motore, vel } = st.current
    a.current += vel * OMEGA_MAX * Math.min(dt, 0.05)
    manov.current!.rotation.z = -a.current
    alt.current!.visible = !motore
    mot.current!.visible = motore
  })
  return (
    <>
      <group ref={alt} position={[-5, -0.2, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.5, 20]} />
          <meshStandardMaterial color="#c9a063" metalness={0.8} roughness={0.35} />
        </mesh>
        <group ref={manov} position={[0, 0, 0.35]}>
          <mesh position={[0.5, 0, 0]}>
            <boxGeometry args={[1, 0.12, 0.12]} />
            <meshStandardMaterial color="#e8c26a" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[1, 0, 0.18]}>
            <sphereGeometry args={[0.17, 16, 12]} />
            <meshStandardMaterial color="#e8c26a" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
        <Etichetta p={[0, -0.85, 0]}>Manovella</Etichetta>
      </group>
      <group ref={mot} position={[-5, -0.2, 0]}>
        <mesh>
          <boxGeometry args={[1.2, 1.5, 0.8]} />
          <meshStandardMaterial color="#25303f" metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.3, 12]} />
          <meshStandardMaterial color="#c9a063" metalness={0.8} roughness={0.3} />
        </mesh>
        <Etichetta p={[0, -1.15, 0]}>Batteria</Etichetta>
      </group>
    </>
  )
}

function Lampadina({ mat }: { mat: React.RefObject<THREE.MeshStandardMaterial | null> }) {
  return (
    <group position={[5, 2.2, 0]}>
      <mesh>
        <sphereGeometry args={[0.4, 24, 18]} />
        <meshStandardMaterial ref={mat} color="#fff1c2" emissive="#ffcf5a" emissiveIntensity={0.1} transparent opacity={0.92} />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.25, 12]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.4} />
      </mesh>
      <Etichetta p={[0, -0.95, 0]}>Lampadina</Etichetta>
    </group>
  )
}

/** Piccoli modelli "sulla stazione": ventola e braccio robotico mossi da motori. */
function Applicazioni({ st }: { st: React.RefObject<Stato> }) {
  const ventola = useRef<THREE.Group>(null)
  const braccio = useRef<THREE.Group>(null)
  const gomito = useRef<THREE.Group>(null)
  const t = useRef(0)
  useFrame((_, dt) => {
    const { motore, vel } = st.current
    const v = motore ? vel : 0
    t.current += Math.min(dt, 0.05) * v
    ventola.current!.rotation.z += v * 9 * Math.min(dt, 0.05)
    braccio.current!.rotation.z = -0.5 + Math.sin(t.current * 1.4) * 0.5
    gomito.current!.rotation.z = 0.9 + Math.sin(t.current * 1.4 + 1) * 0.5
  })
  return (
    <>
      <group position={[4.5, -2.6, -2.2]}>
        <group ref={ventola}>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]} position={[0, 0, 0]}>
              <boxGeometry args={[0.2, 1.3, 0.04]} />
              <meshStandardMaterial color="#9fb6d6" metalness={0.4} roughness={0.5} />
            </mesh>
          ))}
        </group>
        <mesh position={[0, 0, -0.1]}>
          <cylinderGeometry args={[0.18, 0.18, 0.2, 14]} />
          <meshStandardMaterial color="#444" />
        </mesh>
        <Etichetta p={[0, -1, 0]}>Ventola (Unity)</Etichetta>
      </group>
      <group position={[-4.5, -3, -2.2]}>
        <group ref={braccio}>
          <mesh position={[0, 0.7, 0]}>
            <boxGeometry args={[0.2, 1.4, 0.2]} />
            <meshStandardMaterial color="#e6e9ef" metalness={0.5} roughness={0.4} />
          </mesh>
          <group ref={gomito} position={[0, 1.4, 0]}>
            <mesh>
              <sphereGeometry args={[0.18, 14, 10]} />
              <meshStandardMaterial color="#c9a063" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.6, 0]}>
              <boxGeometry args={[0.16, 1.2, 0.16]} />
              <meshStandardMaterial color="#e6e9ef" metalness={0.5} roughness={0.4} />
            </mesh>
          </group>
        </group>
        <Etichetta p={[0, -0.5, 0]}>Braccio robotico</Etichetta>
      </group>
    </>
  )
}

const HOTSPOT: HotspotSim[] = [
  { id: 'spira', categoria: 'strumento', titolo: 'Spira in rame', pos: [0, 1.9, 0], testo: 'Il conduttore che ruota nel campo magnetico: il flusso cambia con l\'angolo e nasce una fem.' },
  { id: 'magneti', categoria: 'fisica', titolo: 'Magneti', pos: [-2.6, -2.1, 0], testo: 'Creano il campo B, diretto dal polo nord (rosso) al polo sud (blu).' },
  { id: 'collettore', categoria: 'strumento', titolo: 'Collettore e spazzole', pos: [0.9, -2.1, 0.6], testo: 'I due semianelli invertono il verso della corrente a ogni mezzo giro, così la coppia spinge sempre nello stesso senso.' },
  { id: 'applicazioni', categoria: 'vita', titolo: 'Braccio robotico e ventola', pos: [0, -3.4, -2.2], testo: 'A bordo i giunti del braccio e le ventole di Unity sono mossi da motori elettrici.' },
]

export default function Motore({ onClose }: { onClose: () => void }) {
  const [motore, setMotore] = useState(false)
  const [vel, setVel] = useState(0.5)
  const st = useRef<Stato>({ motore, vel })
  st.current.motore = motore
  st.current.vel = vel
  const trE = useMemo(() => new Trace('#35e0ff', 'tensione / fem'), [])
  const trB = useMemo(() => new Trace('#ff8a2a', 'fem opposta'), [])
  const lampada = useRef<THREE.MeshStandardMaterial>(null)
  const passi = useMemo(() => passiSimulazione('motore'), [])
  const [stato, setStato] = useState('alternatore')

  const onPasso = (i: number | null, p?: Passo) => {
    if (i === null || !p) return
    setStato(p.stato ?? '')
    if (p.stato === 'alternatore') { setMotore(false); setVel(0.5) }
    else if (p.stato === 'motore' || p.stato === 'collettore') { setMotore(true); setVel(0.4) }
    else if (p.stato === 'fem') { setMotore(true); setVel(0.8) }
    else if (p.stato === 'stazione') { setMotore(true); setVel(1) }
  }
  const did = motore
    ? stato === 'fem'
      ? 'Più il motore gira veloce, più la fem opposta (arancione) cresce e la corrente assorbita cala: il motore si autoregola.'
      : 'Con la batteria la corrente nella spira subisce la forza di Lorentz (frecce verdi): le due forze opposte fanno ruotare la spira.'
    : 'Con la manovella la spira ruota nel campo: il flusso varia e nasce una fem alternata che accende la lampadina.'

  return (
    <SimulazioneShell
      id="motore"
      onClose={onClose}
      titolo="Motori e alternatori: lo stesso principio"
      intro="Una spira in un campo magnetico può produrre corrente se la si fa girare (alternatore) oppure girare se le si fornisce corrente (motore). È la stessa macchina usata nei due versi."
      formula={String.raw`\varepsilon(t)=N\,B\,S\,\omega\sin(\omega t)`}
      formulaNota="N: spire, B: campo, S: superficie, ω: velocità angolare. Nel motore la fem indotta si oppone alla corrente della batteria (legge di Lenz)."
      agenda="Agenda 2030, Obiettivo 9 · Costituzione, Art. 9"
      slide="Slide 8 (Faraday-Neumann) e 11 (Lenz)"
      didascalia={did}
      passi={passi}
      onPasso={onPasso}
      hotspot={HOTSPOT}
      camera={{ position: [0, 2.2, 9], fov: 45 }}
      orbit={{ minDistance: 3, maxDistance: 18 }}
      scope={<Scope titolo={motore ? 'tensione e fem opposta' : 'fem della spira'} traces={[trE, trB]} />}
      controlli={
        <>
          <Pulsante onClick={() => setMotore(false)} attivo={!motore}>Alternatore</Pulsante>
          <Pulsante onClick={() => setMotore(true)} attivo={motore}>Motore</Pulsante>
          <Cursore etichetta="Velocità" valore={vel} min={0} max={1} onChange={setVel} testo={vel < 0.03 ? 'ferma' : `${Math.round(vel * OMEGA_MAX * 9.55)} giri/min`} sinistra="ferma" destra="veloce" />
        </>
      }
    >
      <ambientLight intensity={1.2} />
      <directionalLight position={[4, 8, 6]} intensity={2.4} />
      <Stars radius={60} depth={30} count={600} factor={3} fade speed={0} />
      <Magneti />
      <Spira st={st} trE={trE} trB={trB} lampada={lampada} />
      <Sorgente st={st} />
      <Lampadina mat={lampada} />
      <Applicazioni st={st} />
    </SimulazioneShell>
  )
}
