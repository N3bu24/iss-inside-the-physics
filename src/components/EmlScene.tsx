import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber'
import { Html, OrbitControls, useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'
import type { Hotspot } from '../data/types'
import HotspotMarker from '../ui/Hotspot'
import { assetExists } from '../lib/assets'
import { FieldLines, GLB_URL, Placeholder, type Calore } from './EmlPlaceholder'
import { FlaskConical } from 'lucide-react'
import FinestraSequenza from '../simulazioni/FinestraSequenza'
import OffsetVista from '../simulazioni/OffsetVista'
import Stile from '../simulazioni/Stile'
import { PASSI_EML } from '../simulazioni/passi'
import type { Passo } from '../simulazioni/contenuto'

/** Posizioni degli oggetti nel segnaposto (stessi nomi del GLB). */
const ANCORE_SEGNAPOSTO: Record<string, [number, number, number]> = {
  sample: [0, 0, 0], coil_upper: [1.1, 0.45, 0], coil_lower: [1.1, -0.45, 0], chamber_assembly: [1.6, 0, 0.3],
  camera_axial: [0, 1.4, 0], camera_radial: [-1.5, 0, 0.5], pyrometer: [-1.3, -0.3, 0.9], carousel: [0, -1.1, 1.6],
}

type Ancore = Record<string, THREE.Vector3>

/** Grigio -> rosso -> arancione -> bianco. */
const RAMPA = ['#9aa3b2', '#ff2a10', '#ff8a1a', '#ffffff'].map((c) => new THREE.Color(c))
function coloreCalore(h: number, out: THREE.Color) {
  const x = Math.min(1, Math.max(0, h)) * (RAMPA.length - 1)
  const i = Math.min(RAMPA.length - 2, Math.floor(x))
  return out.copy(RAMPA[i]).lerp(RAMPA[i + 1], x - i)
}

/** Oggetti nominati del GLB a cui si possono agganciare gli hotspot (campo `oggetto3d`). */
const NOMI_OGGETTI = ['coil_upper', 'coil_lower', 'sample', 'chamber_assembly', 'camera_axial', 'camera_radial', 'pyrometer', 'carousel']
const DIMENSIONE_SCENA = 3.2 // lato maggiore della camera di processo, in unità scena

interface Geometria { raggioBobine: number; ancore: Ancore; centroCampione: THREE.Vector3 }

/** Anelli di corrente sulla superficie del campione (figli del campione: ne seguono moto e scala). */
function AnelliCorrente({ r, attivi }: { r: number; attivi: boolean }) {
  const gruppo = useRef<THREE.Group>(null)
  const mats = useRef<(THREE.MeshBasicMaterial | null)[]>([])
  const lat = [-0.6, 0, 0.6]
  useFrame(({ clock }, d) => {
    const g = gruppo.current
    if (!g) return
    g.visible = attivi
    g.rotation.y += d * 0.8
    mats.current.forEach((m, i) => m && (m.opacity = 0.55 + 0.4 * Math.sin(clock.elapsedTime * 4 - i * 1.2)))
  })
  return (
    <group ref={gruppo} visible={attivi}>
      {lat.map((l, i) => (
        <mesh key={i} position={[0, l * r, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r * 1.04 * Math.sqrt(1 - l * l), r * 0.05, 8, 64]} />
          <meshBasicMaterial ref={(m) => { mats.current[i] = m }} color="#35e0ff" transparent toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function ModelloGlb({ calore, fenomeno, onPronto }: { calore: Calore; fenomeno: string | null; onPronto: (g: Geometria) => void }) {
  const { scene } = useGLTF(GLB_URL, '/draco/')
  const gruppo = useRef<THREE.Group>(null)
  const [campione, setCampione] = useState<{ mesh: THREE.Object3D; centroLocale: THREE.Vector3; r: number } | null>(null)
  const heat = useRef(0)
  const col = useMemo(() => new THREE.Color(), [])

  // scala (1 unità = 1 cm, Y in alto) e centratura
  const norm = useMemo(() => {
    scene.updateMatrixWorld(true)
    // riferimento = camera di processo (il rack intero è molto più grande e rimpicciolirebbe lo strumento)
    const rif = scene.getObjectByName('chamber_assembly') ?? scene
    const box = new THREE.Box3().setFromObject(rif)
    const size = box.getSize(new THREE.Vector3())
    const s = DIMENSIONE_SCENA / Math.max(size.x, size.y, size.z)
    return { s, pos: box.getCenter(new THREE.Vector3()).multiplyScalar(-s) }
  }, [scene])

  // materiale del campione clonato (è condiviso con i campioni del carosello)
  const mats = useMemo(() => {
    const out: THREE.MeshStandardMaterial[] = []
    scene.getObjectByName('sample')?.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh && !Array.isArray(m.material)) {
        // idempotente (StrictMode esegue due volte useMemo): il materiale si clona una sola volta
        if (!m.userData.matClonato) { m.material = (m.material as THREE.MeshStandardMaterial).clone(); m.userData.matClonato = true }
        out.push(m.material as THREE.MeshStandardMaterial)
      }
    })
    return out
  }, [scene])

  useLayoutEffect(() => {
    const g = gruppo.current
    if (!g) return
    g.updateMatrixWorld(true)
    const ancore: Ancore = {}
    for (const n of NOMI_OGGETTI) {
      const o = scene.getObjectByName(n)
      if (o) ancore[n] = new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3())
    }
    const bobine = new THREE.Box3()
    for (const n of ['coil_upper', 'coil_lower']) {
      const o = scene.getObjectByName(n)
      if (o) bobine.union(new THREE.Box3().setFromObject(o))
    }
    const bs = bobine.getSize(new THREE.Vector3())
    const sm = scene.getObjectByName('sample')
    if (sm) {
      const bc = new THREE.Box3().setFromObject(sm)
      const sz = bc.getSize(new THREE.Vector3())
      setCampione({
        mesh: sm,
        centroLocale: sm.worldToLocal(bc.getCenter(new THREE.Vector3())),
        r: Math.max(sz.x, sz.y, sz.z) / 2 / norm.s,
      })
    }
    onPronto({
      raggioBobine: Math.max(0.5, Math.max(bs.x, bs.z) / 2),
      ancore,
      centroCampione: ancore.sample ?? new THREE.Vector3(),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, norm])

  useFrame(({ clock }, d) => {
    const t = clock.elapsedTime
    const target = calore ?? Math.sin(t * 0.25) * 0.5 + 0.5
    heat.current += (target - heat.current) * Math.min(1, d * 1.5)
    const h = heat.current
    coloreCalore(h, col)
    for (const m of mats) {
      m.color.copy(col)
      m.emissive.copy(col)
      m.emissiveIntensity = h < 0.05 ? 0 : 0.4 + h * 2.2
      m.metalness = 1 - h * 0.4
    }
    if (campione) {
      // levitazione: oscillazione verticale (in unità del modello)
      const base = (campione.mesh.userData.baseY ??= campione.mesh.position.y) as number
      campione.mesh.position.y = base + Math.sin(t * 1.6) * campione.r * 0.12
      // goccia liquida: leggera oscillazione di forma
      const osc = fenomeno === 'oscillazione'
      campione.mesh.scale.setScalar(calore !== null && calore > 0.9 ? 1 + (osc ? 0.1 : 0.05) * Math.sin(t * (osc ? 9 : 7)) : 1)
    }
  })

  return (
    <group ref={gruppo} scale={norm.s} position={norm.pos}>
      <primitive object={scene} />
      {campione &&
        createPortal(
          <group position={campione.centroLocale}>
            <AnelliCorrente r={campione.r} attivi={fenomeno === 'correnti-indotte' || fenomeno === 'joule' || fenomeno === 'posizionamento'} />
          </group>,
          campione.mesh,
        )}
    </group>
  )
}

class ErroreModello extends Component<{ children: ReactNode; fallback: ReactNode }, { errore: boolean }> {
  state = { errore: false }
  static getDerivedStateFromError() { return { errore: true } }
  render() { return this.state.errore ? this.props.fallback : this.props.children }
}

function Hotspot3D({ h, pos, onSelect, active }: { h: Hotspot; pos: THREE.Vector3; onSelect: (id: string) => void; active: boolean }) {
  return (
    <Html position={pos} center zIndexRange={[20, 0]}>
      <HotspotMarker tipo={h.categoria ?? 'eml'} titolo={h.titolo} attivo={active} onClick={() => onSelect(h.id)} />
    </Html>
  )
}

/** Stato della scena (fenomeno, calore) per ogni passo della sequenza "Avvia esperimento". */
const STATO_SCENA: Record<string, { fenomeno: string | null; calore: Calore }> = {
  carico: { fenomeno: null, calore: 0 },
  posizionamento: { fenomeno: 'posizionamento', calore: 0.05 },
  riscaldamento: { fenomeno: 'joule', calore: 0.7 },
  fusione: { fenomeno: 'fusione', calore: 1 },
  misure: { fenomeno: 'oscillazione', calore: 1 },
  raffreddamento: { fenomeno: 'solidificazione', calore: 0.3 },
}
/** Da quale direzione si guarda ciascun componente. */
const DIREZIONE: Record<string, [number, number, number]> = { camera_radial: [-0.9, 0.2, 0.55], pyrometer: [-0.8, -0.1, 0.8], carousel: [0.3, 0.55, 0.8] }

/** Porta la camera sul componente del passo attivo (con easing); poi lascia i comandi all'utente. */
function CameraPasso({ passo, ancore }: { passo: Passo | null; ancore: Ancore | null }) {
  const { camera, controls } = useThree()
  const tw = useRef<{ t: number; p0: THREE.Vector3; t0: THREE.Vector3; p1: THREE.Vector3; t1: THREE.Vector3 } | null>(null)
  useEffect(() => {
    const c = controls as unknown as { target: THREE.Vector3 } | null
    if (!passo || !c || !passo.ancora || !ancore?.[passo.ancora]) { tw.current = null; return }
    const a = ancore[passo.ancora]
    const dir = new THREE.Vector3(...(DIREZIONE[passo.ancora] ?? [0.55, 0.3, 0.78])).normalize()
    tw.current = { t: 0, p0: camera.position.clone(), t0: c.target.clone(), p1: a.clone().addScaledVector(dir, passo.distanza ?? 2.6), t1: a.clone() }
  }, [passo, ancore, camera, controls])
  useFrame((_, dt) => {
    const w = tw.current
    const c = controls as unknown as { target: THREE.Vector3; update: () => void } | null
    if (!w || !c) return
    w.t = Math.min(1, w.t + dt / 1.5)
    const k = w.t * w.t * (3 - 2 * w.t)
    camera.position.lerpVectors(w.p0, w.p1, k)
    c.target.lerpVectors(w.t0, w.t1, k)
    c.update()
    if (w.t >= 1) tw.current = null
  })
  return null
}

interface Props {
  hotspot: Hotspot[]
  attivo: string | null
  /** id del fenomeno selezionato (mostra anelli di corrente, rinforza le linee di campo) */
  fenomeno: string | null
  calore: Calore
  onHotspot: (id: string) => void
}

export default function EmlScene({ hotspot, attivo, fenomeno: fenomenoEsterno, calore: caloreEsterno, onHotspot }: Props) {
  const passi = useMemo(() => PASSI_EML(), [])
  const [seq, setSeq] = useState<number | null>(null)
  const passo = seq !== null ? (passi[seq] ?? null) : null
  const sc = passo?.stato ? STATO_SCENA[passo.stato] : undefined
  const fenomeno = sc ? sc.fenomeno : fenomenoEsterno
  const calore: Calore = sc ? sc.calore : caloreEsterno
  useEffect(() => {
    if (seq === null) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setSeq(null)
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [seq])
  const [glb, setGlb] = useState<boolean | null>(null)
  const [geo, setGeo] = useState<Geometria | null>(null)
  useEffect(() => { assetExists(GLB_URL).then(setGlb) }, [])

  const segnaposto = <Placeholder calore={calore} />
  const usaGlb = glb === true
  const ancore: Ancore | null = useMemo(
    () => usaGlb
      ? geo?.ancore ?? null
      : Object.fromEntries(Object.entries(ANCORE_SEGNAPOSTO).map(([k, v]) => [k, new THREE.Vector3(...v)])),
    [usaGlb, geo],
  )
  const kCampo = usaGlb && geo ? geo.raggioBobine / 1.3 : 1
  const centro = usaGlb && geo ? geo.centroCampione : new THREE.Vector3()

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#05070f] via-[#0a1230] to-[#05070f]">
      <Canvas camera={{ position: [5.6, 2.8, 6.4], fov: 42 }} dpr={[1, 2]}>
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 5, 3]} intensity={1.6} />
        <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#6ab8ff" />
        <Suspense fallback={null}>
          <Environment preset="city" environmentIntensity={0.35} />
          {glb === null ? null : usaGlb ? (
            <ErroreModello fallback={segnaposto}>
              <ModelloGlb calore={calore} fenomeno={fenomeno} onPronto={setGeo} />
            </ErroreModello>
          ) : segnaposto}
        </Suspense>
        {usaGlb && geo && (
          <group position={centro}>
            <FieldLines k={kCampo} forte={fenomeno === 'campo-variabile' || fenomeno === 'posizionamento'} />
          </group>
        )}
        {ancore && hotspot.filter((h) => h.oggetto3d && ancore[h.oggetto3d]).map((h) => {
          const p = ancore[h.oggetto3d!].clone()
          if (h.spostamento3d) p.add(new THREE.Vector3(...h.spostamento3d))
          return <Hotspot3D key={h.id} h={h} pos={p} onSelect={onHotspot} active={attivo === h.id} />
        })}
        <OrbitControls enableDamping minDistance={1.5} maxDistance={14} target={[0, 0, 0]} makeDefault />
        <CameraPasso passo={passo} ancore={ancore} />
        <OffsetVista attivo={seq !== null} sinistraPx={176} />
      </Canvas>
      <Stile />
      {seq === null && (
        <div className="absolute bottom-8 left-1/2 z-[25] -translate-x-1/2">
          <button className="sim-avvia" onClick={() => setSeq(0)}>
            <FlaskConical size={18} /> Avvia esperimento
          </button>
        </div>
      )}
      {seq !== null && passo && (
        <FinestraSequenza titolo="Esperimento EML" passi={passi} indice={seq} onIndice={setSeq} onChiudi={() => setSeq(null)} />
      )}
    </div>
  )
}
