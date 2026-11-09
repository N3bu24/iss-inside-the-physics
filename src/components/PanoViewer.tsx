import { useEffect, useRef } from 'react'
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
  const cb = useRef({ onHotspot, onNavigate })
  cb.current = { onHotspot, onNavigate }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const url = await risolviPanorama(tappa)
      if (cancelled || !el.current) return
      const opts = { yaw: tappa.yawIniziale ?? 0, pitch: 0 }
      if (!viewer.current) {
        const v = new Viewer({
          container: el.current,
          panorama: url,
          navbar: false,
          defaultYaw: opts.yaw,
          defaultPitch: 0,
          defaultZoomLvl: 30,
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
        v.addEventListener('ready', () => mk.setMarkers(markersDi(tappa) as never), { once: true })
      } else {
        const v = viewer.current
        const mk = v.getPlugin(MarkersPlugin) as MarkersPlugin
        mk.clearMarkers()
        await v.setPanorama(url, {
          transition: { effect: 'fade', speed: 1400, rotation: false },
          position: opts,
          showLoader: false,
        })
        if (!cancelled) mk.setMarkers(markersDi(tappa) as never)
      }
    })()
    return () => { cancelled = true }
  }, [tappa])

  useEffect(() => () => { viewer.current?.destroy(); viewer.current = null }, [])

  return <div ref={el} className="absolute inset-0" />
}
