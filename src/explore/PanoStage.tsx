import { useEffect, useImperativeHandle, useLayoutEffect, useRef, type ReactNode, type Ref } from 'react'
import { Viewer, type AnimateOptions } from '@photo-sphere-viewer/core'
import { rad } from './geometria'

export interface Marcatore {
  key: string
  /** gradi */
  yaw: number
  pitch: number
  nodo: ReactNode
}

export interface PanoApi {
  /** yaw/pitch correnti in rad */
  posizione(): { yaw: number; pitch: number }
  rotateTo(yaw: number, pitch: number, ms: number): Promise<void>
  zoomTo(livello: number, ms: number, easing?: AnimateOptions['easing']): Promise<void>
  /** Sostituisce il panorama senza transizione e orienta lo sguardo (rad). */
  show(url: string, yaw: number, pitch: number, zoom: number): Promise<void>
  /** elemento su cui applicare filtri CSS (blur) durante il volo */
  elemento(): HTMLElement | null
  zoom(): number
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

  const proietta = () => {
    const v = viewer.current
    if (!v || !v.state.ready) return
    for (const m of lista.current) {
      const el = els.current.get(m.key)
      if (!el) continue
      const pos = { yaw: rad(m.yaw), pitch: rad(m.pitch) }
      if (!v.dataHelper.isPointVisible(pos)) { el.style.display = 'none'; continue }
      const p = v.dataHelper.sphericalCoordsToViewerCoords(pos)
      el.style.display = 'block'
      el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)`
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
    elemento: () => radice.current,
    zoom: () => viewer.current?.getZoomLevel() ?? ZOOM_BASE,
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
      minFov: 24,
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
            style={{ display: 'none', willChange: 'transform', pointerEvents: nascosti ? 'none' : 'auto' }}
          >
            {m.nodo}
          </div>
        ))}
      </div>
    </>
  )
}
