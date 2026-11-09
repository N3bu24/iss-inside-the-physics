import { useMemo, useState } from 'react'
import type { Nodo, PortaAmbiente, Portello, AmbienteId, NodoId } from '../data/stazione'
import type { HotspotPosizionato } from '../data/contenuti'
import HotspotMarker from '../ui/Hotspot'
import { useVista } from './vista'

const VIDEO_TERRA = '/video/terra-cupola.mp4'

/** Cornice della Cupola vista dall'interno: oculo centrale e sei finestre trapezoidali (SVG, evenodd). */
function cornice() {
  const R1 = 21, R2 = 46, A = 25
  const pt = (r: number, deg: number) => `${50 + r * Math.cos((deg * Math.PI) / 180)},${50 + r * Math.sin((deg * Math.PI) / 180)}`
  let d = 'M-400,-400 H500 V500 H-400 Z '
  d += `M${50 + 17},50 A17,17 0 1,0 ${50 - 17},50 A17,17 0 1,0 ${50 + 17},50 Z `
  for (let k = 0; k < 6; k++) {
    const c = k * 60
    d += `M${pt(R1, c - A)} L${pt(R2, c - A + 2)} L${pt(R2, c + A - 2)} L${pt(R1, c + A)} Z `
  }
  return d
}

interface Props {
  nodo: Nodo
  hotspot: HotspotPosizionato[]
  portelli: Portello[]
  porte: PortaAmbiente[]
  onHotspot: (id: string) => void
  onPortello: (p: Portello) => void
  onAmbiente: (id: AmbienteId) => void
  /** da dove si è arrivati (il portello di ritorno è etichettato di conseguenza) */
  nomeNodo: (id: NodoId) => string
}

const Posiz = ({ x, y, children }: { x: number; y: number; children: React.ReactNode }) => (
  <div className="absolute z-10" style={{ left: `${x * 100}%`, top: `${y * 100}%`, transform: 'translate(-50%,-50%)' }}>{children}</div>
)

function PortelloImmagine({ p, onPortello, nomeNodo }: { p: Portello; onPortello: (p: Portello) => void; nomeNodo: (id: NodoId) => string }) {
  const att = useVista((v) => v.portello === p.verso)
  return (
    <Posiz x={p.x!} y={p.y!}>
      <HotspotMarker tipo="portello" attivo={att} titolo={`Verso ${nomeNodo(p.verso)}`} onClick={() => onPortello(p)} />
    </Posiz>
  )
}

/** Nodi a immagine/video a schermo intero: Cupola (video in loop dentro la cornice delle finestre) e finale (foto con Ken Burns). */
export default function ImmagineNodo({ nodo, hotspot, portelli, porte, onHotspot, onPortello, onAmbiente, nomeNodo }: Props) {
  const cupola = nodo.tipo === 'cupola'
  const [videoOk, setVideoOk] = useState(true)
  const d = useMemo(cornice, [])
  return (
    <div className="absolute inset-0 z-20 overflow-hidden bg-[#02030a]" style={{ animation: 'entraZoom 1.4s cubic-bezier(.2,.8,.2,1) both' }}>
      {cupola && videoOk ? (
        <video src={VIDEO_TERRA} poster="/video/terra-cupola-poster.jpg" autoPlay loop muted playsInline onError={() => setVideoOk(false)} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="kenburns absolute inset-0">
          <img src={nodo.panorama} alt={nodo.nome} className="h-full w-full object-cover object-top" draggable={false} />
        </div>
      )}
      {!cupola && <div className="absolute inset-0 bg-black/45" />}
      {cupola && (
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="pointer-events-none absolute inset-0 h-full w-full" style={{ overflow: 'visible' }}>
          <path d={d} fillRule="evenodd" fill="rgba(5,7,14,.96)" />
          <path d={d} fillRule="evenodd" fill="none" stroke="rgba(180,200,230,.35)" strokeWidth=".25" />
        </svg>
      )}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(2,3,10,.55)_100%)]" />
      {hotspot.map((h) => h.pos?.tipo === 'immagine' && (
        <Posiz key={h.id} x={h.pos.x} y={h.pos.y}><HotspotMarker tipo={h.categoria} titolo={h.titolo} onClick={() => onHotspot(h.id)} /></Posiz>
      ))}
      {porte.filter((p) => p.x !== undefined).map((p) => (
        <Posiz key={p.ambiente} x={p.x!} y={p.y!}><HotspotMarker tipo="ambiente" titolo={p.titolo} onClick={() => onAmbiente(p.ambiente)} /></Posiz>
      ))}
      {portelli.filter((p) => p.x !== undefined).map((p) => <PortelloImmagine key={p.verso} p={p} onPortello={onPortello} nomeNodo={nomeNodo} />)}
    </div>
  )
}
