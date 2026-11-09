import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Canvas, createPortal, useFrame } from '@react-three/fiber'
import { Html, OrbitControls, useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'
import type { Hotspot } from '../data/types'
import { assetExists } from '../lib/assets'
import { FieldLines, GLB_URL, Placeholder, type Calore } from './EmlPlaceholder'

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
        m.material = (m.material as THREE.MeshStandardMaterial).clone()
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
      campione.mesh.scale.setScalar(calore !== null && calore > 0.9 ? 1 + 0.05 * Math.sin(t * 7) : 1)
    }
  })

  return (
    <group ref={gruppo} scale={norm.s} position={norm.pos}>
      <primitive object={scene} />
      {campione &&
        createPortal(
          <group position={campione.centroLocale}>
            <AnelliCorrente r={campione.r} attivi={fenomeno === 'correnti-indotte' || fenomeno === 'joule'} />
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
      <button onClick={() => onSelect(h.id)} className="group relative" aria-label={h.titolo}>
        <div className="hs-dot" style={active ? { transform: 'scale(1.4)' } : undefined} />
        <span className="glass pointer-events-none absolute left-7 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1 text-xs opacity-0 transition group-hover:opacity-100">{h.titolo}</span>
      </button>
    </Html>
  )
}

interface Props {
  hotspot: Hotspot[]
  attivo: string | null
  /** id del fenomeno selezionato (mostra anelli di corrente, rinforza le linee di campo) */
  fenomeno: string | null
  calore: Calore
  onHotspot: (id: string) => void
}

export default function EmlScene({ hotspot, attivo, fenomeno, calore, onHotspot }: Props) {
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
            <FieldLines k={kCampo} forte={fenomeno === 'campo-variabile'} />
          </group>
        )}
        {ancore && hotspot.filter((h) => h.oggetto3d && ancore[h.oggetto3d]).map((h) => {
          const p = ancore[h.oggetto3d!].clone()
          if (h.spostamento3d) p.add(new THREE.Vector3(...h.spostamento3d))
          return <Hotspot3D key={h.id} h={h} pos={p} onSelect={onHotspot} active={attivo === h.id} />
        })}
        <OrbitControls enableDamping minDistance={1.5} maxDistance={14} target={[0, 0, 0]} makeDefault />
      </Canvas>
    </div>
  )
}
