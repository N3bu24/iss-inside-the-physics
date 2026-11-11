import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { X } from 'lucide-react'
import Marcatore, { type CategoriaSim } from './Marcatore'
import LayoutSimulazione from './Layout'
import OffsetVista from './OffsetVista'
import CameraCompatta from './CameraCompatta'
import { fattoreCamera, useLayoutSim } from './compatto'
import type { Passo } from './contenuto'

export type SezioneSim = { id: string; nome: string }

export type HotspotSim = { id: string; categoria: CategoriaSim; titolo: string; testo: string; pos: [number, number, number] }

export type OrbitaSim = { target?: [number, number, number]; minDistance?: number; maxDistance?: number; maxPolarAngle?: number }

/** Proietta gli hotspot 3D sullo schermo ad ogni frame. */
function Proietta({ hs, els }: { hs: HotspotSim[]; els: React.RefObject<Record<string, HTMLElement | null>> }) {
  const { camera, size } = useThree()
  const v = useMemo(() => new THREE.Vector3(), [])
  const rects = useRef<DOMRect[]>([])
  const n = useRef(0)
  useFrame(() => {
    // i pannelli (data-sim-ui) non devono mai coprire un marcatore: se il punto cade sotto un pannello il marcatore si nasconde
    if (n.current++ % 6 === 0) rects.current = [...document.querySelectorAll('[data-sim-ui]')].map((e) => e.getBoundingClientRect())
    for (const h of hs) {
      const el = els.current[h.id]
      if (!el) continue
      v.set(...h.pos).project(camera)
      const visibile = v.z > -1 && v.z < 1
      el.style.display = visibile ? '' : 'none'
      if (visibile) {
        const x = (v.x * 0.5 + 0.5) * size.width, y = (-v.y * 0.5 + 0.5) * size.height
        const coperto = rects.current.some((r) => x > r.left - 30 && x < r.right + 30 && y > r.top - 30 && y < r.bottom + 30)
        el.style.opacity = coperto ? '0' : ''
        el.style.pointerEvents = coperto ? 'none' : ''
      }
      if (visibile) el.style.transform = `translate(${(v.x * 0.5 + 0.5) * size.width}px,${(-v.y * 0.5 + 0.5) * size.height}px) translate(-50%,-50%)`
    }
  })
  return null
}

/** Sposta la camera (con easing) quando il passo attivo ha una `camera`; poi lascia i comandi all'utente. */
function CameraRig({ passo, fattore = 1 }: { passo: Passo | null; fattore?: number }) {
  const { camera, controls } = useThree()
  const tween = useRef<{ t: number; p0: THREE.Vector3; t0: THREE.Vector3; p1: THREE.Vector3; t1: THREE.Vector3 } | null>(null)
  useEffect(() => {
    const c = controls as unknown as { target: THREE.Vector3 } | null
    if (!passo?.camera || !c) {
      tween.current = null
      return
    }
    const t1 = new THREE.Vector3(...passo.camera.target)
    const p1 = new THREE.Vector3(...passo.camera.pos)
    // telefono/tablet: la camera del passo si allontana dal bersaglio del fattore (sul desktop fattore = 1: invariato)
    if (fattore !== 1) p1.sub(t1).multiplyScalar(fattore).add(t1)
    tween.current = { t: 0, p0: camera.position.clone(), t0: c.target.clone(), p1, t1 }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passo, camera, controls])
  useFrame((_, dt) => {
    const tw = tween.current
    const c = controls as unknown as { target: THREE.Vector3; update: () => void } | null
    if (!tw || !c) return
    tw.t = Math.min(1, tw.t + dt / 1.6)
    const k = tw.t * tw.t * (3 - 2 * tw.t)
    camera.position.lerpVectors(tw.p0, tw.p1, k)
    c.target.lerpVectors(tw.t0, tw.t1, k)
    c.update()
    if (tw.t >= 1) tween.current = null
  })
  return null
}

export type PropsShell = {
  id: string
  titolo: string
  intro: string
  formula?: string
  formulaNota?: string
  agenda?: string
  slide?: string
  didascalia: string
  passi?: Passo[]
  /** chiamata a ogni cambio di passo (null = sequenza chiusa) */
  onPasso?: (i: number | null, passo?: Passo) => void
  onClose: () => void
  controlli: ReactNode
  scope?: ReactNode
  hotspot?: HotspotSim[]
  camera?: { position: [number, number, number]; fov?: number }
  orbit?: OrbitaSim
  /** scene diverse della stessa simulazione: pillole discrete per passare da una all'altra senza avviare i passi */
  sezioni?: SezioneSim[]
  sezione?: string
  onSezione?: (id: string) => void
  /** se i passi sono in corso: indice del primo passo della sezione (il cambio resta coerente con i passi) */
  passoDiSezione?: (id: string) => number | undefined
  children: ReactNode
}

/**
 * Guscio comune delle simulazioni a scena 3D: Canvas a tutto schermo, hotspot 3D e la struttura
 * comune (colonna di testo, barra dei comandi, Esci, voce, badge) di `LayoutSimulazione`.
 */
export default function SimulazioneShell(p: PropsShell) {
  const [hs, setHs] = useState<string | null>(null)
  const els = useRef<Record<string, HTMLElement | null>>({})
  const o = p.orbit ?? {}
  const info = useLayoutSim()
  const hsAttivo = p.hotspot?.find((h) => h.id === hs)

  const extra = hsAttivo ? (
    <div className="slide-in rounded-lg border-l-2 border-orange-300/70 bg-white/5 px-3 py-2 text-white/90">
      <div className="mb-1 flex items-center justify-between font-medium text-white">
        {hsAttivo.titolo}
        <button onClick={() => setHs(null)} aria-label="Chiudi il dettaglio" className="text-white/50 hover:text-white">
          <X size={14} />
        </button>
      </div>
      {hsAttivo.testo}
    </div>
  ) : (
    <p key={p.didascalia} className="slide-in rounded-lg border-l-2 border-cyan-300/70 bg-white/5 px-3 py-2 text-white/90">
      {p.didascalia}
    </p>
  )

  return (
    <LayoutSimulazione
      id={p.id}
      titolo={p.titolo}
      intro={p.intro}
      formula={p.formula}
      formulaNota={p.formulaNota}
      agenda={p.agenda}
      slide={p.slide}
      extra={extra}
      passi={p.passi}
      onPasso={p.onPasso}
      onClose={p.onClose}
      controlli={p.controlli}
      scope={p.scope}
      scena={({ seq, passo, sinistraPx, sopraPx, compatto, vai }) => {
        const k = compatto ? fattoreCamera(info, sinistraPx, sopraPx) : 1
        return (
        <>
          <div className="absolute inset-0">
            <Canvas camera={{ position: p.camera?.position ?? [0, 3, 12], fov: p.camera?.fov ?? 45 }} dpr={[1, 1.5]}>
              <color attach="background" args={['#05070f']} />
              <Suspense fallback={null}>{p.children}</Suspense>
              <Proietta hs={p.hotspot ?? []} els={els} />
              <OrbitControls makeDefault enablePan={false} target={o.target ?? [0, 0, 0]} minDistance={o.minDistance} maxDistance={o.maxDistance} maxPolarAngle={o.maxPolarAngle} />
              <CameraRig passo={passo} fattore={k} />
              {compatto && <CameraCompatta fattore={k} />}
              <OffsetVista sinistraPx={sinistraPx} sopraPx={sopraPx} />
            </Canvas>
          </div>
          {p.sezioni && p.sezioni.length > 1 && (
            <div
              data-sim-ui
              className="pointer-events-none absolute inset-x-0 z-[41] flex justify-center"
              style={{ top: compatto ? 'calc(env(safe-area-inset-top, 0px) + 92px)' : 112, paddingLeft: sinistraPx * 2 }}
            >
              <div role="tablist" aria-label="Scene della simulazione" className="glass pointer-events-auto flex gap-1 rounded-full p-1">
                {p.sezioni.map((z) => {
                  const att = p.sezione === z.id
                  return (
                    <button
                      key={z.id}
                      role="tab"
                      aria-selected={att}
                      onClick={() => {
                        if (att) return
                        const i = seq !== null ? p.passoDiSezione?.(z.id) : undefined
                        if (i !== undefined) vai(i)
                        else p.onSezione?.(z.id)
                      }}
                      className={'min-h-[32px] rounded-full px-3.5 text-[12px] font-medium transition ' + (att ? 'bg-cyan-300/20 text-cyan-100 ring-1 ring-cyan-300/50' : 'text-white/65 hover:text-white')}
                    >
                      {z.nome}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          {/* hotspot: elementi DOM posizionati proiettando il punto 3D (nascosti durante i passi: la colonna racconta già) */}
          <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden" style={{ display: seq !== null ? 'none' : undefined }}>
            {p.hotspot?.map((h) => (
              <div key={h.id} ref={(e) => { els.current[h.id] = e }} className="pointer-events-auto absolute left-0 top-0" style={{ display: 'none' }}>
                <Marcatore categoria={h.categoria} titolo={h.titolo} attivo={hs === h.id} onClick={() => setHs(hs === h.id ? null : h.id)} />
              </div>
            ))}
          </div>
        </>
        )
      }}
    />
  )
}
