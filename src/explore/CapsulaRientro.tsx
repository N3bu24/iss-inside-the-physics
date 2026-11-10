import { Component, Suspense, useEffect, useImperativeHandle, useMemo, useRef, useState, type ReactNode, type Ref } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { BackSide, ClampToEdgeWrapping, LinearFilter, LinearMipmapLinearFilter, NoColorSpace, RepeatWrapping, SRGBColorSpace, TextureLoader, Vector3, type ShaderMaterial } from 'three'
import type { HotspotPosizionato } from '../data/contenuti'
import type { NodoId, Portello } from '../data/stazione'
import HotspotMarker from '../ui/Hotspot'
import info from '../data/capsula-info.json'
import { usePreferenza } from '../lib/preferenze'
import { vista } from './vista'
import { fragment, vertex } from './capsulaShader'

const URL_PANORAMA = '/panorami/capsula.jpg'
const URL_MASCHERA = '/panorami/capsula-maschera.png'

/** Quanta luminosita' di base resta nell'interno (1 = render originale). Il render e' troppo chiaro: 0,62 = -38%. */
const SCURO_BASE = 0.62
/** FOV verticale (gradi): base e limiti dello zoom con la rotella */
const FOV_BASE = 70, FOV_MIN = 45, FOV_MAX = 85
const PITCH_MAX = 70
/** sguardo iniziale: verso l'oblo' di destra, con il pannello strumenti ancora in vista */
const INIZIO = { lon: 42, lat: 4 }
/** ampiezza base del tremolio (gradi) e dei scossoni occasionali */
const TREMOLIO = 0.4
const SCOSSONE = 1.1

const rad = (d: number) => (d * Math.PI) / 180

/**
 * Direzione (versore) per longitudine e latitudine in gradi, nella convenzione di capsula-info.json:
 * lon 0 = centro dell'immagine = davanti (pannello strumenti), positivo verso destra; lat positivo verso l'alto.
 * Camera three.js: guarda lungo -Z, +X a destra. E' la stessa formula che lo shader usa per campionare la texture
 * (lon = atan(x, -z), lat = asin(y)): oblo', icone e immagine restano coerenti per costruzione.
 */
export function direzione(lon: number, lat: number, out = new Vector3()): Vector3 {
  const lo = rad(lon), la = rad(lat)
  return out.set(Math.cos(la) * Math.sin(lo), Math.sin(la), -Math.cos(la) * Math.cos(lo))
}

export interface CapsulaApi {
  /** ruota dolcemente lo sguardo fino al punto di interesse `id` (id dell'hotspot) */
  rotateToPunto(id: string, ms: number): Promise<void>
  /** direzione di ogni punto: per le prove automatiche */
  posizioneScreen(key: string): { x: number; y: number } | null
}

interface Punto { key: string; lon: number; lat: number; nodo: ReactNode; bordo?: boolean }

interface Props {
  ref?: Ref<CapsulaApi>
  hotspot: HotspotPosizionato[]
  portelli: Portello[]
  /** rendering in pausa (nodo non attivo, schede a tutto schermo aperte) */
  pausa: boolean
  visti: ReadonlySet<string>
  onHotspot: (id: string) => void
  onPortello: (p: Portello) => void
  nomeNodo: (id: NodoId) => string
}

class Riparo extends Component<{ fallback: ReactNode; children: ReactNode }, { errore: boolean }> {
  state = { errore: false }
  static getDerivedStateFromError() { return { errore: true } }
  componentDidCatch(e: unknown) { console.warn('Capsula: ripiego sull\'immagine statica', e) }
  render() { return this.state.errore ? this.props.fallback : this.props.children }
}

// ---------------------------------------------------------------- stato della visuale (fuori da React)

interface Camera {
  yaw: number; pitch: number          // rad
  vyaw: number; vpitch: number        // rad/s (inerzia)
  fov: number; fovBersaglio: number   // gradi
  trascina: boolean
  anim: null | { y0: number; p0: number; dy: number; p1: number; t0: number; ms: number; ok: () => void }
}

const nuovaCamera = (): Camera => ({ yaw: rad(INIZIO.lon), pitch: rad(INIZIO.lat), vyaw: 0, vpitch: 0, fov: FOV_BASE, fovBersaglio: FOV_BASE, trascina: false, anim: null })

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

// ---------------------------------------------------------------- scena

interface ScenaProps {
  cam: React.RefObject<Camera>
  punti: React.RefObject<Punto[]>
  els: React.RefObject<Map<string, HTMLElement>>
  opz: React.RefObject<{ tremolio: boolean; riduci: boolean }>
  onPronto: () => void
}

function Scena({ cam, punti, els, opz, onPronto }: ScenaProps) {
  const [tex, mask] = useLoader(TextureLoader, [URL_PANORAMA, URL_MASCHERA])
  const mat = useRef<ShaderMaterial>(null)
  const tempo = useRef(0)
  const pronto = useRef(false)
  const jolt = useRef({ t0: -10, prossimo: 2.5, asse: [1, 0.4, 0.3] })
  const tmp = useMemo(() => new Vector3(), [])

  const uniforms = useMemo(() => {
    tex.colorSpace = SRGBColorSpace
    tex.wrapS = RepeatWrapping; tex.wrapT = ClampToEdgeWrapping
    tex.minFilter = LinearMipmapLinearFilter; tex.magFilter = LinearFilter; tex.anisotropy = 4
    tex.needsUpdate = true
    mask.colorSpace = NoColorSpace
    mask.wrapS = RepeatWrapping; mask.wrapT = ClampToEdgeWrapping
    mask.minFilter = LinearMipmapLinearFilter; mask.magFilter = LinearFilter
    mask.needsUpdate = true
    const oblo = info.oblo.map((o) => direzione(o.lon, o.lat))
    const off = info.oblo.map((o) => new Vector3(Math.cos(rad(o.raggio)), rad(o.raggio), 0))
    return { uTex: { value: tex }, uMask: { value: mask }, uTime: { value: 0 }, uScuro: { value: SCURO_BASE }, uOblo: { value: oblo }, uOffo: { value: off } }
  }, [tex, mask])

  useFrame((state, dtGrezzo) => {
    const dt = Math.min(dtGrezzo, 0.05)
    const c = cam.current
    const { tremolio, riduci } = opz.current
    tempo.current += dt
    const t = tempo.current

    // -- animazione verso un punto
    if (c.anim) {
      const a = c.anim
      const k = Math.min(1, (performance.now() - a.t0) / a.ms)
      const e = easeInOut(k)
      c.yaw = a.y0 + a.dy * e
      c.pitch = a.p0 + (a.p1 - a.p0) * e
      c.vyaw = c.vpitch = 0
      if (k >= 1) { c.anim = null; a.ok() }
    } else if (!c.trascina) {
      // -- inerzia morbida
      c.yaw += c.vyaw * dt
      c.pitch += c.vpitch * dt
      const f = Math.exp(-dt * 4.2)
      c.vyaw *= f; c.vpitch *= f
      if (Math.abs(c.vyaw) < 1e-4) c.vyaw = 0
      if (Math.abs(c.vpitch) < 1e-4) c.vpitch = 0
    }
    const pm = rad(PITCH_MAX)
    c.pitch = Math.max(-pm, Math.min(pm, c.pitch))
    c.yaw = ((c.yaw + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI
    c.fov += (c.fovBersaglio - c.fov) * (1 - Math.exp(-dt * 9))

    // -- tremolio (si somma alla visuale, non la sposta): rumore a piu' frequenze + scossoni occasionali
    let sx = 0, sy = 0, sz = 0
    if (tremolio && !riduci) {
      const A = rad(TREMOLIO)
      sx = A * (0.55 * Math.sin(t * 17.3) + 0.3 * Math.sin(t * 29.1 + 1.3) + 0.25 * Math.sin(t * 7.1 + 0.4))
      sy = A * (0.55 * Math.sin(t * 19.7 + 2.1) + 0.3 * Math.sin(t * 31.3 + 0.7) + 0.25 * Math.sin(t * 6.3 + 1.9))
      sz = A * 0.6 * (0.6 * Math.sin(t * 13.9 + 0.2) + 0.4 * Math.sin(t * 23.3 + 2.6))
      const j = jolt.current
      if (t > j.prossimo) { j.t0 = t; j.prossimo = t + 2.2 + Math.random() * 4.5; j.asse = [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5] }
      const env = Math.exp(-(t - j.t0) * 3.2) * Math.sin((t - j.t0) * 26)
      sx += rad(SCOSSONE) * env * j.asse[0] * 2
      sy += rad(SCOSSONE) * env * j.asse[1] * 2
      sz += rad(SCOSSONE) * env * j.asse[2]
    }

    const camera = state.camera as import('three').PerspectiveCamera
    if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__capsulaState = state
    camera.rotation.set(c.pitch + sx, -c.yaw + sy, sz, 'YXZ')
    if (Math.abs(camera.fov - c.fov) > 1e-3) { camera.fov = c.fov; camera.updateProjectionMatrix() }
    camera.updateMatrixWorld()

    if (mat.current) mat.current.uniforms.uTime.value = t * (riduci ? 0.3 : 1)
    vista.set({ yaw: c.yaw, pitch: c.pitch })

    // -- proiezione dei punti sullo schermo (stessa camera, tremolio compreso)
    const W = state.size.width, H = state.size.height
    for (const p of punti.current) {
      const el = els.current.get(p.key)
      if (!el) continue
      direzione(p.lon, p.lat, tmp).multiplyScalar(10)
      const zv = tmp.clone().applyMatrix4(camera.matrixWorldInverse).z
      if (zv > -0.5) { el.style.visibility = 'hidden'; el.style.opacity = '0'; continue }
      tmp.project(camera)
      const x = (tmp.x * 0.5 + 0.5) * W, y = (-tmp.y * 0.5 + 0.5) * H
      const dentro = x > -40 && x < W + 40 && y > -40 && y < H + 40
      el.style.visibility = dentro ? 'visible' : 'hidden'; el.style.opacity = dentro ? '1' : '0'
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`
      el.dataset.label = Math.hypot(x - W / 2, y - H / 2) < W * 0.4 ? '1' : '0'
    }
    if (!pronto.current) { pronto.current = true; onPronto() }
  })

  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <sphereGeometry args={[50, 64, 40]} />
      <shaderMaterial ref={mat} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} side={BackSide} depthTest={false} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

// ---------------------------------------------------------------- ripiego statico

function Statica({ punti }: { punti: Punto[] }) {
  // immagine equirettangolare 2:1 a tutta altezza, centrata sull'oblo' di destra; icone alle loro coordinate
  const L = 'max(100vw, 200vh)'
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#02030a]">
      <div className="absolute top-1/2" style={{ width: L, aspectRatio: '2 / 1', left: `calc(50% - ${L} * ${0.5 + INIZIO.lon / 360})`, transform: 'translateY(-50%)' }}>
        <img src={URL_PANORAMA} alt="Interno della capsula di rientro" className="h-full w-full object-cover brightness-[.6]" draggable={false} />
        {punti.map((p) => (
          <div key={p.key} className="absolute" style={{ left: `${(p.lon / 360 + 0.5) * 100}%`, top: `${(0.5 - p.lat / 180) * 100}%`, transform: 'translate(-50%,-50%)' }} data-label="1">{p.nodo}</div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- componente

/**
 * Interno di una capsula di rientro: panorama a 360° con fiamme animate fuori dagli oblo', luce che pulsa e visuale che trema.
 * I punti di interesse e il portello di ritorno stanno sulle direzioni `icone` di data/capsula-info.json (zone libere di parete).
 */
export default function CapsulaRientro({ ref, hotspot, portelli, pausa, visti, onHotspot, onPortello, nomeNodo }: Props) {
  const cam = useRef<Camera>(nuovaCamera())
  const els = useRef(new Map<string, HTMLElement>())
  const superficie = useRef<HTMLDivElement>(null)
  const tremolioPref = usePreferenza('tremolioCapsula')
  const riduciPref = usePreferenza('riduciAnimazioni')
  const [nascosta, setNascosta] = useState(typeof document !== 'undefined' && document.hidden)
  const [pronta, setPronta] = useState(false)
  const [afferra, setAfferra] = useState(false)
  const riduciSistema = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const opz = useRef({ tremolio: true, riduci: false })
  opz.current = { tremolio: tremolioPref, riduci: riduciPref || !!riduciSistema }

  // punti: i contenuti sulle zone libere (icone 1..), il portello di ritorno sulla prima (in alto, sopra il pannello strumenti)
  const punti: Punto[] = useMemo(() => {
    const ic = info.icone
    const out: Punto[] = []
    hotspot.forEach((h, i) => {
      const s = ic[1 + (i % Math.max(1, ic.length - 1))]
      out.push({ key: `h:${h.id}`, lon: s.lon, lat: s.lat, nodo: <HotspotMarker tipo={h.categoria} titolo={h.titolo} simulazione={h.simulazione} visto={visti.has(h.id)} onClick={() => onHotspot(h.id)} /> })
    })
    portelli.forEach((p, i) => {
      const s = ic[i % ic.length]
      out.push({ key: `p:${p.verso}`, lon: s.lon, lat: s.lat, nodo: <HotspotMarker tipo="portello" titolo={`Torna a ${nomeNodo(p.verso).split(/\s*[—,]\s*/)[0]}`} onClick={() => onPortello(p)} /> })
    })
    return out
  }, [hotspot, portelli, visti, onHotspot, onPortello, nomeNodo])
  const puntiRef = useRef(punti)
  puntiRef.current = punti
  if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__capsula = { cam }

  useImperativeHandle(ref, () => ({
    rotateToPunto: (id, ms) => new Promise<void>((ok) => {
      const p = puntiRef.current.find((x) => x.key === `h:${id}`)
      if (!p) { ok(); return }
      const lon = p.lon, lat = p.lat
      const c = cam.current
      c.anim?.ok()
      let dy = rad(lon) - c.yaw
      dy = ((dy + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI
      c.anim = { y0: c.yaw, p0: c.pitch, dy, p1: Math.max(-rad(PITCH_MAX), Math.min(rad(PITCH_MAX), rad(lat))), t0: performance.now(), ms, ok }
    }),
    posizioneScreen: (key) => {
      const el = els.current.get(key)
      if (!el || el.style.visibility === 'hidden') return null
      const r = el.getBoundingClientRect()
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    },
  }), [])

  useEffect(() => {
    const f = () => setNascosta(document.hidden)
    document.addEventListener('visibilitychange', f)
    return () => document.removeEventListener('visibilitychange', f)
  }, [])

  // rotella = zoom del FOV (listener non passivo: la pagina non scorre)
  useEffect(() => {
    const el = superficie.current
    if (!el) return
    const w = (e: WheelEvent) => {
      e.preventDefault()
      const c = cam.current
      c.fovBersaglio = Math.max(FOV_MIN, Math.min(FOV_MAX, c.fovBersaglio + Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 120) * 0.045))
    }
    el.addEventListener('wheel', w, { passive: false })
    return () => el.removeEventListener('wheel', w)
  }, [])

  // trascinamento (mouse e touch) con inerzia: stessi gesti dei panorami
  const giu = useRef<{ id: number; x: number; y: number; t: number } | null>(null)
  // pizzico a due dita (solo touch): zoom del campo visivo come la rotella
  const tocchi = useRef(new Map<number, { x: number; y: number }>())
  const pizzico = useRef<{ d0: number; fov0: number } | null>(null)
  const distanzaTocchi = () => { const [a, b] = [...tocchi.current.values()]; return Math.hypot(a.x - b.x, a.y - b.y) || 1 }
  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') {
      tocchi.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      e.currentTarget.setPointerCapture(e.pointerId)
      if (tocchi.current.size === 2) {
        pizzico.current = { d0: distanzaTocchi(), fov0: cam.current.fovBersaglio }
        giu.current = null; cam.current.trascina = false; cam.current.vyaw = cam.current.vpitch = 0
        return
      }
      if (tocchi.current.size > 2) return
    }
    if (e.button !== 0 && e.pointerType === 'mouse') return
    const c = cam.current
    c.anim?.ok(); c.anim = null
    c.trascina = true; c.vyaw = c.vpitch = 0
    giu.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() }
    e.currentTarget.setPointerCapture(e.pointerId)
    setAfferra(true)
  }
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' && tocchi.current.has(e.pointerId)) {
      tocchi.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pizzico.current && tocchi.current.size === 2) {
        cam.current.fovBersaglio = Math.max(FOV_MIN, Math.min(FOV_MAX, pizzico.current.fov0 * pizzico.current.d0 / distanzaTocchi()))
        return
      }
    }
    const g = giu.current
    if (!g || g.id !== e.pointerId) return
    const c = cam.current
    const h = e.currentTarget.clientHeight || 1
    const gradPx = rad(c.fov) / h // radianti per pixel (verticale)
    const dx = e.clientX - g.x, dy = e.clientY - g.y
    const ora = performance.now(), dt = Math.max(0.008, (ora - g.t) / 1000)
    c.yaw -= dx * gradPx; c.pitch += dy * gradPx
    // velocita' per l'inerzia (media mobile)
    c.vyaw = c.vyaw * 0.6 + (-dx * gradPx / dt) * 0.4
    c.vpitch = c.vpitch * 0.6 + (dy * gradPx / dt) * 0.4
    g.x = e.clientX; g.y = e.clientY; g.t = ora
  }
  const onUp = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') {
      tocchi.current.delete(e.pointerId)
      if (pizzico.current) { if (tocchi.current.size < 2) pizzico.current = null; if (giu.current?.id !== e.pointerId) return }
    }
    if (giu.current?.id !== e.pointerId) return
    giu.current = null
    cam.current.trascina = false
    setAfferra(false)
  }

  const fermo = pausa || nascosta
  const ripiego = <Statica punti={punti} />

  return (
    <div className="absolute inset-0 z-20 overflow-hidden bg-[#02030a]" style={{ animation: 'entraFade .9s ease both' }}>
      <Riparo fallback={ripiego}>
        <div
          ref={superficie}
          className="absolute inset-0 touch-none select-none"
          style={{ cursor: afferra ? 'grabbing' : 'grab' }}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        >
          <Canvas
            dpr={[1, 1.5]} frameloop={fermo ? 'never' : 'always'} flat
            camera={{ fov: FOV_BASE, near: 0.1, far: 200, position: [0, 0, 0] }}
            gl={{ antialias: false, powerPreference: 'high-performance' }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <Suspense fallback={null}>
              <Scena cam={cam} punti={puntiRef} els={els} opz={opz} onPronto={() => setPronta(true)} />
            </Suspense>
          </Canvas>
        </div>
        {/* vignettatura leggera */}
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 52%, rgba(2,3,8,.5) 100%)' }} />
        {/* icone proiettate a ogni frame */}
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          {punti.map((p) => (
            <div
              key={p.key}
              ref={(el) => { if (el) els.current.set(p.key, el); else els.current.delete(p.key) }}
              className="pointer-events-auto absolute left-0 top-0"
              style={{ opacity: 0, visibility: 'hidden', willChange: 'transform' }}
            >
              {p.nodo}
            </div>
          ))}
        </div>
        {!pronta && <div className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-[0.35em] text-white/40">Rientro in corso…</div>}
      </Riparo>
    </div>
  )
}

