import { useEffect, useImperativeHandle, useLayoutEffect, useRef, type ReactNode, type Ref } from 'react'
import { Viewer, type AnimateOptions } from '@photo-sphere-viewer/core'
import { rad } from './geometria'

export interface Marcatore {
  key: string
  /** gradi */
  yaw: number
  pitch: number
  nodo: ReactNode
  /** indicatore mostrato sul bordo dello schermo quando il punto e` fuori dal campo visivo (riceve --a = angolo della freccia) */
  bordo?: ReactNode
}

export interface PanoApi {
  /** yaw/pitch correnti in rad */
  posizione(): { yaw: number; pitch: number }
  rotateTo(yaw: number, pitch: number, ms: number): Promise<void>
  zoomTo(livello: number, ms: number, easing?: AnimateOptions['easing']): Promise<void>
  /** Sostituisce il panorama senza transizione e orienta lo sguardo (rad). */
  show(url: string, yaw: number, pitch: number, zoom: number): Promise<void>
  /** Orienta subito lo sguardo (rad) e lo zoom, senza cambiare panorama. */
  orienta(yaw: number, pitch: number, zoom: number): void
  /** elemento su cui applicare filtri CSS (blur) durante il volo */
  elemento(): HTMLElement | null
  zoom(): number
  /** Anima insieme yaw/pitch (rad) e livello di zoom, con easing. */
  anima(o: { yaw: number; pitch: number; zoom?: number; ms: number; easing?: AnimateOptions['easing'] }): Promise<void>
  /** Livello di zoom PSV per cui la parte visibile del viewport coincide con un video 16:9 object-fit cover di FOV orizzontale `hfov` gradi. */
  zoomPerVideo(hfov: number): number
}

interface Props {
  ref?: Ref<PanoApi>
  url: string
  /** gradi */
  yaw: number
  pitch: number
  marcatori: Marcatore[]
  /** nasconde i marcatori (durante il volo) */
  nascosti: boolean
  onPosizione: (yaw: number, pitch: number) => void
  onPronto: () => void
}

export const ZOOM_BASE = 8
export const ZOOM_MAX = 100
/** PSV: lo zoom 0..100 e` lineare nel FOV verticale tra MAX_FOV e MIN_FOV */
const MIN_FOV = 24
const MAX_FOV = 90
export const ASPETTO_VIDEO = 16 / 9
const MARGINE = { sx: 384, dx: 72, su: 112, giu: 150 }
const DIST_MIN = 74

/**
 * Corrispondenza FOV tra video (16:9, FOV orizzontale `hfov`) e viewport con object-fit: cover.
 * Cover scala il video per riempire il viewport: con aspect A >= 16/9 si vede tutta la larghezza (ritaglio verticale),
 * con A < 16/9 si vede tutta l'altezza (ritaglio laterale). Il FOV verticale del viewport e` quindi
 * 2*atan(tan(hfov/2) / max(A, 16/9)), poi convertito nel livello di zoom di PSV.
 */
export function zoomPerVideoFov(hfov: number, aspettoViewport: number) {
  const v = 2 * Math.atan(Math.tan(rad(hfov) / 2) / Math.max(aspettoViewport, ASPETTO_VIDEO))
  const vDeg = (v * 180) / Math.PI
  return ((vDeg - MAX_FOV) / (MIN_FOV - MAX_FOV)) * 100
}

/**
 * Panorama a 360° (Photo Sphere Viewer) con comandi dell'esplorazione: tasto sinistro trascinato = ruota, rotella = zoom,
 * frecce disattivate come rotazione (le gestisce Esplora: ↑ avanti, ↓ indietro).
 * I marcatori sono elementi React proiettati sullo schermo a ogni frame.
 */
export default function PanoStage({ ref, url, yaw, pitch, marcatori, nascosti, onPosizione, onPronto }: Props) {
  const radice = useRef<HTMLDivElement>(null)
  const strato = useRef<HTMLDivElement>(null)
  const viewer = useRef<Viewer | null>(null)
  const els = useRef(new Map<string, HTMLElement>())
  const lista = useRef<Marcatore[]>(marcatori)
  lista.current = marcatori
  const cb = useRef({ onPosizione, onPronto })
  cb.current = { onPosizione, onPronto }

  const indEls = useRef(new Map<string, HTMLElement>())
  const misure = useRef(new WeakMap<HTMLElement, number>())

  /** Proietta i marcatori con la stessa camera di PSV, scosta quelli troppo vicini e posiziona gli indicatori sul bordo. */
  const proietta = () => {
    const v = viewer.current
    if (!v || !v.state.ready) return
    const W = v.state.size.width, H = v.state.size.height
    if (!W || !H) return
    const { yaw: y0, pitch: p0 } = v.getPosition()
    const th = Math.tan(rad(v.state.hFov) / 2), tv = Math.tan(rad(v.state.vFov) / 2)
    const sy0 = Math.sin(y0), cy0 = Math.cos(y0), sp0 = Math.sin(p0), cp0 = Math.cos(p0)
    interface P { m: Marcatore; el: HTMLElement | undefined; x: number; y: number; dentro: boolean; dx: number; dy: number }
    const pts: P[] = []
    for (const m of lista.current) {
      const el = els.current.get(m.key)
      if (!el && !indEls.current.get(m.key)) continue
      const yw = rad(m.yaw), pt = rad(m.pitch)
      const vx = Math.cos(pt) * Math.sin(yw), vy = Math.sin(pt), vz = Math.cos(pt) * Math.cos(yw)
      const dx = vx * cy0 - vz * sy0
      const dy = -vx * sp0 * sy0 + vy * cp0 - vz * sp0 * cy0
      const dz = vx * cp0 * sy0 + vy * sp0 + vz * cp0 * cy0
      const davanti = dz > 0.02
      const x = davanti ? W / 2 + (dx / dz / th) * (W / 2) : NaN
      const y = davanti ? H / 2 - (dy / dz / tv) * (H / 2) : NaN
      const dentro = davanti && x >= 0 && x <= W && y >= 0 && y <= H
      pts.push({ m, el, x, y, dentro, dx: davanti ? x - W / 2 : dx * 1000, dy: davanti ? y - H / 2 : -dy * 1000 })
    }
    // anti-sovrapposizione: i marcatori visibili a meno di DIST_MIN px si scostano radialmente
    const vis = pts.filter((p) => p.dentro && p.el)
    const pos = vis.map((p) => ({ x: p.x, y: p.y }))
    for (let it = 0; it < 8; it++) {
      let mosso = false
      for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) {
        let ddx = pos[j].x - pos[i].x, ddy = pos[j].y - pos[i].y
        let d = Math.hypot(ddx, ddy)
        if (d >= DIST_MIN) continue
        if (d < 1) { const a = i * 2.4 + j; ddx = Math.cos(a); ddy = Math.sin(a); d = 1 }
        const s = (DIST_MIN - d) / 2 / d
        pos[i].x -= ddx * s; pos[i].y -= ddy * s; pos[j].x += ddx * s; pos[j].y += ddy * s; mosso = true
      }
      if (!mosso) break
    }
    // etichette: visibili se non coprono altri marcatori o etichette (priorita` ai piu` vicini al centro)
    type R = { x0: number; x1: number; y0: number; y1: number }
    const ordine = vis.map((_, i) => i).sort((a, b) => Math.hypot(pos[a].x - W / 2, pos[a].y - H / 2) - Math.hypot(pos[b].x - W / 2, pos[b].y - H / 2))
    const dischi: R[] = vis.map((_, i) => ({ x0: pos[i].x - 32, x1: pos[i].x + 32, y0: pos[i].y - 32, y1: pos[i].y + 32 }))
    const etichette: R[] = []
    const tocca = (a: R, b: R) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0
    for (const i of ordine) {
      const el = vis[i].el as HTMLElement
      let w = misure.current.get(el)
      if (w === undefined) { w = el.querySelector<HTMLElement>('.hs2-tip')?.offsetWidth ?? 0; if (w) misure.current.set(el, w) }
      const r: R = { x0: pos[i].x - w / 2 - 4, x1: pos[i].x + w / 2 + 4, y0: pos[i].y + 36, y1: pos[i].y + 68 }
      const libera = w > 0 && !dischi.some((o, k) => k !== i && tocca(r, o)) && !etichette.some((e) => tocca(r, e))
      if (libera) etichette.push(r)
      el.dataset.label = libera ? '1' : '0'
    }
    vis.forEach((p, i) => {
      const el = p.el as HTMLElement
      el.style.opacity = '1'; el.style.visibility = 'visible'
      el.style.transform = `translate(${pos[i].x}px, ${pos[i].y}px) translate(-50%, -50%)`
    })
    // indicatori sul bordo: rettangolo che evita intestazione, colonna a sinistra, minimappa e comandi in basso
    const x0 = Math.min(MARGINE.sx, W * 0.3), x1 = W - MARGINE.dx, y0b = MARGINE.su, y1 = Math.max(y0b + 60, H - MARGINE.giu)
    const cx = (x0 + x1) / 2, cyb = (y0b + y1) / 2, hw = (x1 - x0) / 2, hh = (y1 - y0b) / 2
    const ind: { p: P; el: HTMLElement; x: number; y: number }[] = []
    for (const p of pts) {
      if (p.el && !p.dentro) { p.el.style.opacity = '0'; p.el.style.visibility = 'hidden' }
      const e = indEls.current.get(p.m.key)
      if (!e) continue
      if (p.dentro) { e.style.opacity = '0'; e.style.visibility = 'hidden'; continue }
      let { dx, dy } = p
      if (Math.abs(dx) < 1e-3 && Math.abs(dy) < 1e-3) dx = 1
      const t = Math.min(hw / Math.max(Math.abs(dx), 1e-6), hh / Math.max(Math.abs(dy), 1e-6))
      ind.push({ p, el: e, x: cx + dx * t, y: cyb + dy * t })
    }
    // gli indicatori non si sovrappongono tra loro ne` alla minimappa
    for (let it = 0; it < 8; it++) {
      for (let i = 0; i < ind.length; i++) for (let j = i + 1; j < ind.length; j++) {
        const ddx = ind[j].x - ind[i].x, ddy = ind[j].y - ind[i].y, d = Math.hypot(ddx, ddy) || 1
        if (d >= 50) continue
        const s = (50 - d) / 2 / d
        ind[i].x -= ddx * s; ind[i].y -= ddy * s; ind[j].x += ddx * s; ind[j].y += ddy * s
      }
      for (const q of ind) { q.x = Math.min(x1, Math.max(x0, q.x)); q.y = Math.min(y1, Math.max(y0b, q.y)); if (q.x > W - 290 && q.y < 270) q.y = 270 }
    }
    for (const q of ind) {
      q.el.style.opacity = '1'; q.el.style.visibility = 'visible'
      q.el.style.setProperty('--a', `${(Math.atan2(q.p.dy, q.p.dx) * 180) / Math.PI}deg`)
      q.el.style.transform = `translate(${q.x}px, ${q.y}px) translate(-50%, -50%)`
    }
  }

  useLayoutEffect(proietta, [marcatori])

  useImperativeHandle(ref, () => ({
    posizione: () => {
      const p = viewer.current?.getPosition()
      return { yaw: p?.yaw ?? 0, pitch: p?.pitch ?? 0 }
    },
    rotateTo: async (y, p, ms) => { await viewer.current?.animate({ yaw: y, pitch: p, speed: ms, easing: 'inOutQuad' }) },
    zoomTo: async (livello, ms, easing = 'inOutQuad') => { await viewer.current?.animate({ zoom: livello, speed: ms, easing }) },
    show: async (u, y, p, z) => {
      await viewer.current?.setPanorama(u, { transition: false, showLoader: false, position: { yaw: y, pitch: p }, zoom: z })
      proietta()
    },
    orienta: (y, p, z) => { viewer.current?.rotate({ yaw: y, pitch: p }); viewer.current?.zoom(z); proietta() },
    elemento: () => radice.current,
    zoom: () => viewer.current?.getZoomLevel() ?? ZOOM_BASE,
    anima: async ({ yaw: y, pitch: p, zoom: z, ms, easing = 'inOutQuad' }) => {
      await viewer.current?.animate({ yaw: y, pitch: p, ...(z !== undefined ? { zoom: z } : {}), speed: ms, easing })
    },
    zoomPerVideo: (hfov) => {
      const sz = viewer.current?.state.size
      return zoomPerVideoFov(hfov, sz && sz.height ? sz.width / sz.height : ASPETTO_VIDEO)
    },
  }), [])

  useEffect(() => {
    const dentro = radice.current
    if (!dentro) return
    // host creato a mano: PSV rimuove il proprio container in destroy(), React non deve possederlo
    const host = document.createElement('div')
    host.style.cssText = 'position:absolute;inset:0'
    dentro.appendChild(host)
    const v = new Viewer({
      container: host,
      panorama: url,
      navbar: false,
      keyboard: false, // le frecce non ruotano: ↑ avanti, ↓ indietro
      mousewheelCtrlKey: false,
      touchmoveTwoFingers: false,
      defaultYaw: rad(yaw),
      defaultPitch: rad(pitch),
      defaultZoomLvl: ZOOM_BASE,
      minFov: MIN_FOV,
      maxFov: MAX_FOV,
      loadingTxt: '',
      moveInertia: 0.85,
    })
    viewer.current = v
    v.addEventListener('ready', () => { proietta(); cb.current.onPronto() }, { once: true })
    v.addEventListener('render', proietta)
    v.addEventListener('position-updated', ({ position }) => cb.current.onPosizione(position.yaw, position.pitch))
    v.addEventListener('size-updated', proietta)
    return () => {
      viewer.current = null
      v.destroy()
      host.remove()
    }
    // il viewer si crea una sola volta: i cambi di panorama passano da api.show()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div ref={radice} className="absolute inset-0 bg-[#05070f]" />
      <div ref={strato} className="pointer-events-none absolute inset-0 z-10 overflow-hidden transition-opacity duration-300" style={{ opacity: nascosti ? 0 : 1 }}>
        {marcatori.map((m) => (
          <div
            key={m.key}
            ref={(el) => { if (el) els.current.set(m.key, el); else els.current.delete(m.key) }}
            className="pointer-events-auto absolute left-0 top-0"
            style={{ opacity: 0, visibility: 'hidden', willChange: 'transform', transition: 'opacity .2s', pointerEvents: nascosti ? 'none' : 'auto' }}
          >
            {m.nodo}
          </div>
        ))}
        {marcatori.map((m) => m.bordo && (
          <div
            key={`b:${m.key}`}
            ref={(el) => { if (el) indEls.current.set(m.key, el); else indEls.current.delete(m.key) }}
            className="absolute left-0 top-0"
            style={{ opacity: 0, visibility: 'hidden', willChange: 'transform', transition: 'opacity .2s', pointerEvents: nascosti ? 'none' : 'auto' }}
          >
            {m.bordo}
          </div>
        ))}
      </div>
    </>
  )
}
