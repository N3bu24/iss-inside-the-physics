import { useEffect, useRef, useState } from 'react'
import { Viewer } from '@photo-sphere-viewer/core'
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin'
import type { Tappa } from '../data/types'
import { risolviPanorama } from '../lib/placeholderPano'

interface Props {
  tappa: Tappa
  onHotspot: (id: string) => void
  onNavigate: (id: string) => void
}

function markersDi(t: Tappa) {
  const hs = t.hotspot
    .filter((h) => h.yaw !== undefined && h.pitch !== undefined)
    .map((h) => ({
      id: `hs:${h.id}`,
      position: { yaw: h.yaw!, pitch: h.pitch! },
      html: '<div class="hs-dot"></div>',
      size: { width: 28, height: 28 },
      anchor: 'center center',
      tooltip: { content: h.titolo, position: 'top center' },
    }))
  const links = t.collegamenti.map((c) => ({
    id: `go:${c.a}`,
    position: { yaw: c.yaw, pitch: c.pitch },
    html: '<div class="hs-link">➜</div>',
    size: { width: 36, height: 36 },
    anchor: 'center center',
    tooltip: { content: c.etichetta ?? c.a, position: 'top center' },
  }))
  return [...hs, ...links]
}

export default function PanoViewer({ tappa, onHotspot, onNavigate }: Props) {
  const el = useRef<HTMLDivElement>(null)
  const viewer = useRef<Viewer | null>(null)
  const [carica, setCarica] = useState(true)
  const cb = useRef({ onHotspot, onNavigate })
  cb.current = { onHotspot, onNavigate }

  useEffect(() => {
    let cancelled = false
    setCarica(true)
    ;(async () => {
      const url = await risolviPanorama(tappa)
      if (cancelled || !el.current) return
      const opts = { yaw: tappa.yawIniziale ?? 0, pitch: tappa.pitchIniziale ?? 0 }
      if (!viewer.current) {
        // host creato a mano: PSV rimuove il proprio container in destroy(), React non deve possederlo
        const host = document.createElement('div')
        host.style.cssText = 'position:absolute;inset:0'
        el.current.appendChild(host)
        const v = new Viewer({
          container: host,
          panorama: url,
          navbar: false,
          defaultYaw: opts.yaw,
          defaultPitch: opts.pitch,
          defaultZoomLvl: 8,
          mousewheelCtrlKey: false,
          loadingTxt: '',
          plugins: [[MarkersPlugin, {}]],
        })
        viewer.current = v
        const mk = v.getPlugin(MarkersPlugin) as MarkersPlugin
        mk.addEventListener('select-marker', ({ marker }) => {
          const id = marker.id
          if (id.startsWith('hs:')) cb.current.onHotspot(id.slice(3))
          else if (id.startsWith('go:')) cb.current.onNavigate(id.slice(3))
        })
        v.addEventListener('ready', () => { mk.setMarkers(markersDi(tappa) as never); if (!cancelled) setCarica(false) }, { once: true })
      } else {
        const v = viewer.current
        const mk = v.getPlugin(MarkersPlugin) as MarkersPlugin
        mk.clearMarkers()
        await v.setPanorama(url, {
          transition: { effect: 'fade', speed: 1400, rotation: false },
          position: opts,
          showLoader: false,
        })
        if (!cancelled) { mk.setMarkers(markersDi(tappa) as never); setCarica(false) }
      }
    })()
    return () => { cancelled = true }
  }, [tappa])

  useEffect(() => () => {
    const v = viewer.current
    viewer.current = null
    if (!v) return
    const host = v.container.parentElement
    v.destroy()
    host?.remove()
  }, [])

  return (
    <>
      <div ref={el} className="absolute inset-0" />
      <div
        className={`pointer-events-none absolute inset-0 z-10 flex items-end justify-center pb-40 backdrop-blur-2xl transition-opacity duration-1000 ${carica ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: `linear-gradient(180deg, #02030a, ${tappa.tinta ?? '#12324a'} 60%, #05070f)` }}
      >
        <span className="text-xs uppercase tracking-[0.35em] text-white/45">Caricamento del modulo…</span>
      </div>
    </>
  )
}
