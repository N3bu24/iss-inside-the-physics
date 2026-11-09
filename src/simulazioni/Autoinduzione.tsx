import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import SimulazioneShell from './SimulazioneShell'
import { Cursore, Pulsante } from './controlli'
import { passiSimulazione } from './passi'
import { metaSimulazione, type Passo } from './contenuto'
import type { HotspotSim } from './SimulazioneShell'
import Etichetta from '../ambienti/Etichetta'
import { helixGeometry } from '../ambienti/geo'

const EPS = 10 // V
const DT = 0.04 // passo di registrazione, s
const FINESTRA = 8 // s mostrati nel grafico

type Sim = {
  closed: boolean
  L: number
  R: number
  i: number
  t: number // tempo trascorso dall'ultima chiusura
  acc: number
  hist: number[]
  spark: number
  pending: 'reset' | 'steady' | null
}

/** Fisica del circuito RL (integrazione per passi fissi). */
function Fisica({ sim }: { sim: React.RefObject<Sim> }) {
  useFrame((_, dt0) => {
    const s = sim.current
    if (s.pending === 'reset') { s.i = 0; s.t = 0; s.hist = []; s.pending = null }
    if (s.pending === 'steady') { s.i = EPS / s.R; s.t = 0; s.hist = [s.i]; s.pending = null }
    s.acc += Math.min(dt0, 0.1)
    while (s.acc >= DT) {
      s.acc -= DT
      const h = DT / 10
      for (let k = 0; k < 10; k++) {
        if (s.closed) s.i += ((EPS - s.R * s.i) / s.L) * h
        else s.i -= (s.i / 0.04) * h // apertura: la corrente crolla in pochi ms (scala didattica)
      }
      if (!s.closed && s.i < 0.001) s.i = 0
      s.t += DT
      s.hist.push(s.i)
      if (s.hist.length > 4000) s.hist.splice(0, 1000)
      s.spark = Math.max(0, s.spark - DT * 2.2)
    }
  })
  return null
}

/** Grafico i(t): curva, valore finale tratteggiato, tau e 63%, area = energia. */
function Grafico({ sim }: { sim: React.RefObject<Sim> }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!
    const g = c.getContext('2d')!
    let raf = 0
    const draw = () => {
      raf = requestAnimationFrame(draw)
      const s = sim.current
      const W = c.width, H = c.height
      const pad = { l: 36, r: 10, t: 14, b: 22 }
      const pw = W - pad.l - pad.r, ph = H - pad.t - pad.b
      g.clearRect(0, 0, W, H)
      const inf = EPS / s.R
      const ymax = Math.max(inf, ...s.hist.slice(-300)) * 1.15
      const n = s.hist.length
      const nWin = Math.round(FINESTRA / DT)
      const i0 = Math.max(0, n - nWin)
      const X = (k: number) => pad.l + ((k - i0) / nWin) * pw
      const Y = (v: number) => pad.t + ph - (v / ymax) * ph
      // assi
      g.strokeStyle = 'rgba(255,255,255,.25)'
      g.lineWidth = 1
      g.beginPath(); g.moveTo(pad.l, pad.t); g.lineTo(pad.l, pad.t + ph); g.lineTo(pad.l + pw, pad.t + ph); g.stroke()
      g.fillStyle = 'rgba(255,255,255,.55)'
      g.font = '10px Inter, sans-serif'
      g.fillText('i (A)', 4, 10)
      g.fillText('t', W - 12, H - 6)
      g.fillText(inf.toFixed(1), 6, Y(inf) + 3)
      // valore finale
      g.setLineDash([4, 4]); g.strokeStyle = 'rgba(255,255,255,.5)'
      g.beginPath(); g.moveTo(pad.l, Y(inf)); g.lineTo(pad.l + pw, Y(inf)); g.stroke(); g.setLineDash([])
      g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText('ε/R', pad.l + pw - 26, Y(inf) - 4)
      if (n < 2) return
      // area (energia)
      g.beginPath(); g.moveTo(X(i0), Y(0))
      for (let k = i0; k < n; k++) g.lineTo(X(k), Y(s.hist[k]))
      g.lineTo(X(n - 1), Y(0)); g.closePath()
      g.fillStyle = 'rgba(255,138,42,.22)'; g.fill()
      // curva
      g.beginPath()
      for (let k = i0; k < n; k++) (k === i0 ? g.moveTo(X(k), Y(s.hist[k])) : g.lineTo(X(k), Y(s.hist[k])))
      g.strokeStyle = '#35e0ff'; g.lineWidth = 2.2; g.shadowColor = '#35e0ff'; g.shadowBlur = 6; g.stroke(); g.shadowBlur = 0
      // tau e 63% (solo in chiusura, a partire dall'inizio della salita)
      if (s.closed) {
        const kTau = n - 1 - Math.round(s.t / DT) + Math.round(s.L / s.R / DT)
        if (kTau >= i0 && kTau < n) {
          g.setLineDash([3, 3]); g.strokeStyle = 'rgba(255,255,255,.4)'
          g.beginPath(); g.moveTo(X(kTau), Y(0)); g.lineTo(X(kTau), Y(inf * 0.632)); g.lineTo(pad.l, Y(inf * 0.632)); g.stroke(); g.setLineDash([])
          g.fillStyle = '#ffd9a8'; g.fillText('τ = L/R · 63%', X(kTau) + 4, Y(inf * 0.632) + 14)
        }
      }
      // energia
      g.fillStyle = '#ffb36b'; g.font = '600 12px Inter, sans-serif'
      g.fillText(`E = ½Li² = ${(0.5 * s.L * s.i * s.i).toFixed(1)} J`, pad.l + 8, pad.t + 12)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [sim])
  return (
    <div className="glass rounded-xl p-2.5 pb-2">
      <div className="mb-1 text-[10px] uppercase tracking-wider text-white/55">corrente nel circuito i(t) · area = energia</div>
      <canvas ref={ref} width={380} height={190} className="block h-[190px] w-[380px]" />
    </div>
  )
}

const RAME = '#d98a4a'

function Circuito({ sim, onToggle }: { sim: React.RefObject<Sim>; onToggle: () => void }) {
  const leva = useRef<THREE.Group>(null)
  const anelli = useRef<THREE.Group>(null)
  const lamp = useRef<THREE.MeshStandardMaterial>(null)
  const scintilla = useRef<THREE.Mesh>(null)
  const luce = useRef<THREE.PointLight>(null)
  const geo = useMemo(() => helixGeometry(0.55, 2.6, 8, 0.045), [])
  useFrame(() => {
    const s = sim.current
    const target = s.closed ? 0 : 0.7
    leva.current!.rotation.z += (target - leva.current!.rotation.z) * 0.25
    const k = Math.min(1.6, s.i / (EPS / 1))
    anelli.current!.children.forEach((c, idx) => {
      const m = c as THREE.Mesh
      m.scale.setScalar(0.5 + k * 1.6 + idx * 0.25)
      ;(m.material as THREE.MeshBasicMaterial).opacity = Math.min(0.8, 0.05 + s.i / 6)
    })
    lamp.current!.emissiveIntensity = 0.1 + 4 * s.spark
    scintilla.current!.visible = s.spark > 0.3
    luce.current!.intensity = s.spark * 3
  })
  const filo = (pts: [number, number, number][]) => <Line points={pts} color={RAME} lineWidth={2.5} />
  return (
    <group position={[-0.5, 0, 0]}>
      {/* pannello */}
      <mesh position={[0.8, 0.8, -0.4]}>
        <boxGeometry args={[11, 7.2, 0.2]} />
        <meshStandardMaterial color="#0b0f18" metalness={0.5} roughness={0.7} />
      </mesh>
      {/* fili */}
      {filo([[-4, 0.7, 0], [-4, 2, 0], [-2.4, 2, 0]])}
      {filo([[-0.9, 2, 0], [1.2, 2, 0]])}
      {filo([[3.8, 2, 0], [5, 2, 0], [5, -2, 0], [2.7, -2, 0]])}
      {filo([[0.5, -2, 0], [-4, -2, 0], [-4, -0.7, 0]])}
      {filo([[1.2, 2, 0], [1.2, 3.7, 0], [2.1, 3.7, 0]])}
      {filo([[3.9, 3.7, 0], [3.8, 3.7, 0], [3.8, 2, 0]])}
      {/* batteria */}
      <mesh position={[-4, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 1.4, 20]} />
        <meshStandardMaterial color="#2a62d6" metalness={0.5} roughness={0.4} />
      </mesh>
      <Etichetta p={[-4, -1.1, 0.3]}>Generatore 10 V</Etichetta>
      {/* resistore */}
      <mesh position={[-1.65, 2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 1.5, 16]} />
        <meshStandardMaterial color="#c9b79c" roughness={0.7} />
      </mesh>
      {[-0.35, -0.05, 0.25].map((x, i) => (
        <mesh key={i} position={[-1.65 + x, 2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.31, 0.31, 0.1, 16]} />
          <meshStandardMaterial color={['#a3342c', '#222', '#d9a431'][i]} />
        </mesh>
      ))}
      <Etichetta p={[-1.65, 2.6, 0.3]}>Resistore R</Etichetta>
      {/* bobina con campo */}
      <group position={[2.5, 2, 0]}>
        <mesh geometry={geo} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color={RAME} metalness={0.85} roughness={0.3} />
        </mesh>
        <group ref={anelli}>
          {[-0.7, 0, 0.7].map((x, i) => (
            <mesh key={i} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[1.0, 0.025, 8, 48]} />
              <meshBasicMaterial color="#35e0ff" transparent opacity={0.1} toneMapped={false} depthWrite={false} />
            </mesh>
          ))}
        </group>
      </group>
      <Etichetta p={[2.5, 0.9, 0.3]}>Bobina L</Etichetta>
      {/* lampadina in parallelo alla bobina */}
      <group position={[3, 3.7, 0]}>
        <mesh>
          <sphereGeometry args={[0.35, 20, 14]} />
          <meshStandardMaterial ref={lamp} color="#fff1c2" emissive="#ffcf5a" emissiveIntensity={0.1} transparent opacity={0.92} />
        </mesh>
        <pointLight ref={luce} color="#ffcf5a" intensity={0} distance={6} />
      </group>
      {/* interruttore a leva */}
      <group position={[0.5, -2, 0]}>
        <mesh position={[0, -0.12, 0]}>
          <boxGeometry args={[0.5, 0.2, 0.5]} />
          <meshStandardMaterial color="#444b5a" metalness={0.6} roughness={0.4} />
        </mesh>
        <group ref={leva} onClick={onToggle} onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = '')}>
          <mesh position={[1.1, 0, 0]}>
            <boxGeometry args={[2.2, 0.16, 0.16]} />
            <meshStandardMaterial color="#e8c26a" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[2.15, 0.15, 0]}>
            <sphereGeometry args={[0.17, 14, 10]} />
            <meshStandardMaterial color="#d0342c" />
          </mesh>
        </group>
        <mesh position={[2.2, -0.12, 0]}>
          <boxGeometry args={[0.5, 0.2, 0.5]} />
          <meshStandardMaterial color="#444b5a" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh ref={scintilla} position={[2.2, 0.1, 0]} visible={false}>
          <sphereGeometry args={[0.25, 10, 8]} />
          <meshBasicMaterial color="#9fe9ff" toneMapped={false} transparent opacity={0.85} />
        </mesh>
      </group>
      <Etichetta p={[1.6, -2.7, 0.3]}>Interruttore (clicca la leva)</Etichetta>
    </group>
  )
}

const HOTSPOT: HotspotSim[] = [
  { id: 'interruttore', categoria: 'fisica', titolo: 'Interruttore', pos: [-1.5, -2, 0.6], testo: 'Alla chiusura la corrente non sale subito: la bobina si oppone con una fem autoindotta.' },
  { id: 'bobina', categoria: 'fisica', titolo: 'Bobina', pos: [2, 2.9, 0.6], testo: 'Induttore con L = μ₀N²S/l: la fem autoindotta si oppone alla variazione di corrente.' },
  { id: 'resistore', categoria: 'energia', titolo: 'Resistore', pos: [-2.2, 3, 0.6], testo: 'Fissa il valore finale ε/R e la costante di tempo τ = L/R.' },
]

export default function Autoinduzione({ onClose }: { onClose: () => void }) {
  const [L, setL] = useState(3)
  const [R, setR] = useState(2)
  const [closed, setClosed] = useState(false)
  const [stato, setStato] = useState('chiudi')
  const sim = useRef<Sim>({ closed: false, L: 3, R: 2, i: 0, t: 0, acc: 0, hist: [0], spark: 0, pending: null })
  sim.current.L = L
  sim.current.R = R
  const passi = useMemo(() => passiSimulazione('autoinduzione'), [])

  const apri = () => {
    const s = sim.current
    if (s.closed && s.i > 0.2) s.spark = 1
    s.closed = false
    setClosed(false)
  }
  const chiudi = (reset = true) => {
    const s = sim.current
    if (reset && s.i < 0.05) s.pending = 'reset'
    s.closed = true
    setClosed(true)
  }
  const onPasso = (i: number | null, p?: Passo) => {
    if (i === null || !p) return
    setStato(p.stato ?? '')
    const s = sim.current
    switch (p.stato) {
      case 'chiudi': s.closed = false; s.i = 0; s.pending = 'reset'; setL(3); setR(2); setTimeout(() => chiudi(), 400); break
      case 'sale': setL(3); setR(2); if (!s.closed) { s.pending = 'reset'; chiudi() } break
      case 'L': setL(5); setR(2); if (!s.closed) { s.pending = 'reset'; chiudi() } break
      case 'energia': setL(3); setR(2); s.pending = 'steady'; s.closed = true; setClosed(true); break
      case 'apri': if (s.i < 1) s.pending = 'steady'; s.closed = true; setClosed(true); setTimeout(apri, 700); break
    }
  }
  const tau = L / R
  const did =
    stato === 'apri' || (!closed && sim.current.i > 0.05)
      ? 'Aprendo l\'interruttore la corrente crolla: di/dt è enorme e la fem autoindotta fa scoccare una scintilla sui contatti e lampeggiare la lampadina.'
      : closed
        ? `La corrente sale in modo esponenziale verso ε/R = ${(EPS / R).toFixed(1).replace('.', ',')} A. Costante di tempo τ = L/R = ${tau.toFixed(2).replace('.', ',')} s.`
        : 'L\'interruttore è aperto: nel circuito non passa corrente. Chiudilo con il pulsante o cliccando la leva.'

  return (
    <SimulazioneShell
      id="autoinduzione"
      onClose={onClose}
      titolo="Autoinduzione: interruttore e bobina"
      intro="Una bobina si oppone alle variazioni di corrente: chiudendo o aprendo un circuito, la corrente non cambia all'istante. L'energia ½Li² resta immagazzinata nel campo magnetico."
      formula={String.raw`\varepsilon=-L\frac{di}{dt}\qquad E=\tfrac12 L i^{2}`}
      formulaNota="L: induttanza in henry. Nella chiusura i(t) = (ε/R)(1 − e^{−Rt/L}), con costante di tempo τ = L/R."
      agenda={metaSimulazione('autoinduzione').agenda}
      slide={metaSimulazione('autoinduzione').slide}
      didascalia={did}
      passi={passi}
      onPasso={onPasso}
      hotspot={HOTSPOT}
      camera={{ position: [0.5, 1.2, 15], fov: 45 }}
      orbit={{ target: [0.5, 0.8, 0], minDistance: 6, maxDistance: 24, maxPolarAngle: Math.PI * 0.62 }}
      scope={<Grafico sim={sim} />}
      controlli={
        <>
          <Pulsante onClick={() => (closed ? apri() : chiudi())} attivo={closed}>{closed ? 'Apri l\'interruttore' : 'Chiudi l\'interruttore'}</Pulsante>
          <Cursore etichetta="Induttanza L" valore={L} min={1} max={5} step={0.1} onChange={setL} testo={`${L.toFixed(1).replace('.', ',')} H`} sinistra="salita rapida" destra="lenta" />
          <Cursore etichetta="Resistenza R" valore={R} min={1} max={5} step={0.1} calore onChange={setR} testo={`${R.toFixed(1).replace('.', ',')} Ω`} sinistra="corrente alta" destra="bassa" />
        </>
      }
    >
      <ambientLight intensity={1.3} />
      <directionalLight position={[3, 6, 8]} intensity={2.2} />
      <Fisica sim={sim} />
      <Circuito sim={sim} onToggle={() => (sim.current.closed ? apri() : chiudi())} />
    </SimulazioneShell>
  )
}
