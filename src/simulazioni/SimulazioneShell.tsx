import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { Play, X } from 'lucide-react'
import Badge from '../components/Badge'
import Stile from './Stile'
import Intestazione from './Intestazione'
import Marcatore, { type CategoriaSim } from './Marcatore'
import FinestraSequenza from './FinestraSequenza'
import Voce from './Voce'
import type { Passo } from './contenuto'

export type HotspotSim = { id: string; categoria: CategoriaSim; titolo: string; testo: string; pos: [number, number, number] }

export type OrbitaSim = { target?: [number, number, number]; minDistance?: number; maxDistance?: number; maxPolarAngle?: number }

/** Sposta la camera (con easing) quando il passo attivo ha una `camera`; poi lascia i comandi all'utente. */
function CameraRig({ passo }: { passo: Passo | null }) {
  const { camera, controls } = useThree()
  const tween = useRef<{ t: number; p0: THREE.Vector3; t0: THREE.Vector3; p1: THREE.Vector3; t1: THREE.Vector3 } | null>(null)
  useEffect(() => {
    const c = controls as unknown as { target: THREE.Vector3 } | null
    if (!passo?.camera || !c) {
      tween.current = null
      return
    }
    tween.current = {
      t: 0,
      p0: camera.position.clone(),
      t0: c.target.clone(),
      p1: new THREE.Vector3(...passo.camera.pos),
      t1: new THREE.Vector3(...passo.camera.target),
    }
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
  children: ReactNode
}

/**
 * Guscio comune delle simulazioni: scena 3D a tutto schermo, pannello di spiegazione, hotspot 3D,
 * pulsante "Avvia" con finestra a passi, controlli, badge, chiudi (Esc), voce narrante, intestazione.
 */
export default function SimulazioneShell(p: PropsShell) {
  const [seq, setSeq] = useState<number | null>(null)
  const [hs, setHs] = useState<string | null>(null)
  const seqRef = useRef(seq)
  seqRef.current = seq
  const passi = p.passi ?? []
  const passo = seq !== null ? (passi[seq] ?? null) : null
  const { onPasso, onClose } = p

  const vai = useCallback(
    (i: number | null) => {
      setSeq(i)
      onPasso?.(i, i === null ? undefined : passi[i])
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onPasso, p.passi],
  )

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (seqRef.current !== null) vai(null)
      else onClose()
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose, vai])

  const o = p.orbit ?? {}
  const hsAttivo = p.hotspot?.find((h) => h.id === hs)
  const formulaHtml = p.formula ? katex.renderToString(p.formula, { displayMode: true, throwOnError: false }) : ''

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#05070f] text-white" role="dialog" aria-label={p.titolo}>
      <Stile />
      <div className="absolute inset-0">
        <Canvas camera={{ position: p.camera?.position ?? [0, 3, 12], fov: p.camera?.fov ?? 45 }} dpr={[1, 1.5]}>
          <color attach="background" args={['#05070f']} />
          <Suspense fallback={null}>{p.children}</Suspense>
          {p.hotspot?.map((h) => (
            <Html key={h.id} position={h.pos} center zIndexRange={[20, 0]}>
              <Marcatore categoria={h.categoria} titolo={h.titolo} attivo={hs === h.id} onClick={() => setHs(hs === h.id ? null : h.id)} />
            </Html>
          ))}
          <OrbitControls makeDefault enablePan={false} target={o.target ?? [0, 0, 0]} minDistance={o.minDistance} maxDistance={o.maxDistance} maxPolarAngle={o.maxPolarAngle} />
          <CameraRig passo={passo} />
        </Canvas>
      </div>

      {/* barra superiore */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-5 py-4">
        <Intestazione />
        <div className="flex items-center gap-3">
          <Voce id={p.id} />
          <Badge tipo="simulazione" />
          <button onClick={p.onClose} className="glass pointer-events-auto flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs text-white hover:bg-white/15" aria-label="Chiudi (Esc)">
            <X size={14} /> Chiudi · Esc
          </button>
        </div>
      </div>

      {/* pannello di spiegazione */}
      <aside className="glass sim-scroll absolute bottom-28 left-5 top-16 flex w-[360px] flex-col gap-3 rounded-2xl p-5 text-[13px] leading-relaxed">
        <h2 className="text-xl font-semibold leading-tight">{p.titolo}</h2>
        <p className="text-white/75">{p.intro}</p>
        {hsAttivo ? (
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
        )}
        {p.formula && (
          <details className="rounded-lg bg-white/5 px-3 py-2">
            <summary className="cursor-pointer select-none text-xs uppercase tracking-wider text-cyan-200/80">La formula</summary>
            <div className="sim-formula py-1 text-white" dangerouslySetInnerHTML={{ __html: formulaHtml }} />
            {p.formulaNota && <p className="text-xs text-white/60">{p.formulaNota}</p>}
          </details>
        )}
        <div className="mt-auto space-y-1 border-t border-white/10 pt-3 text-[11px] text-white/55">
          {p.agenda && <p>{p.agenda}</p>}
          {p.slide && <p>Teoria: {p.slide}</p>}
        </div>
      </aside>

      {p.scope && <div className="absolute right-5 top-16">{p.scope}</div>}

      {/* controlli */}
      <div className="glass absolute bottom-5 flex max-w-[calc(100%-420px)] items-center gap-8 rounded-2xl px-6 py-3" style={{ left: 'calc(50% + 190px)', transform: 'translateX(-50%)' }}>
        {p.controlli}
      </div>

      {passi.length > 0 && seq === null && (
        <div className="absolute bottom-6 right-6">
          <button className="sim-avvia" onClick={() => vai(0)}>
            <Play size={18} fill="currentColor" /> Avvia
          </button>
        </div>
      )}
      {seq !== null && passo && <FinestraSequenza titolo={p.titolo} passi={passi} indice={seq} onIndice={vai} onChiudi={() => vai(null)} />}
    </div>
  )
}
