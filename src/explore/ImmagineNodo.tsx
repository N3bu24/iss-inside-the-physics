import { useState } from 'react'
import type { Nodo, PortaAmbiente, Portello, AmbienteId, NodoId } from '../data/stazione'
import type { HotspotPosizionato } from '../data/contenuti'
import HotspotMarker from '../ui/Hotspot'
import { useVista } from './vista'
import { useCompatto } from '../lib/dispositivo'

const VIDEO_TERRA = '/video/terra-cupola.mp4'


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
  /** dissolvenza in uscita (Cupola -> Tranquility) */
  uscendo?: boolean
}

const Posiz = ({ x, y, children }: { x: number; y: number; children: React.ReactNode }) => {
  const compatto = useCompatto()
  // telefono e tablet: le icone restano sempre dentro lo schermo, lontano dall'intestazione, dalla miniatura e dalla barra inferiore
  const stile = compatto
    ? { left: `clamp(40px, ${x * 100}%, calc(100% - 40px))`, top: `clamp(84px, ${y * 100}%, calc(100% - var(--barra-spazio) - 52px))` }
    : { left: `${x * 100}%`, top: `${y * 100}%` }
  return <div className="absolute z-10" style={{ ...stile, transform: 'translate(-50%,-50%)' }}>{children}</div>
}

function PortelloImmagine({ p, onPortello, nomeNodo }: { p: Portello; onPortello: (p: Portello) => void; nomeNodo: (id: NodoId) => string }) {
  const att = useVista((v) => v.portello === p.verso)
  return (
    <Posiz x={p.x!} y={p.y!}>
      <HotspotMarker tipo="portello" attivo={att} titolo={p.verso === 'finale' ? 'Verso il finale' : `Verso ${nomeNodo(p.verso).split(/\s*[—,]\s*/)[0]}`} onClick={() => onPortello(p)} />
    </Posiz>
  )
}

/** Nodi a immagine/video a schermo intero: Cupola (video NASA della Terra a tutto schermo, in loop, senza cornici, con zoom lentissimo) e finale (foto con Ken Burns). */
export default function ImmagineNodo({ nodo, hotspot, portelli, porte, onHotspot, onPortello, onAmbiente, nomeNodo, uscendo }: Props) {
  const cupola = nodo.tipo === 'cupola'
  const [videoOk, setVideoOk] = useState(true)
  return (
    <div
      className="absolute inset-0 z-20 overflow-hidden bg-[#02030a]"
      style={{ animation: uscendo ? 'esceFade .8s ease both' : cupola ? 'entraFade 1s ease both' : 'entraZoom 1.4s cubic-bezier(.2,.8,.2,1) both', pointerEvents: uscendo ? 'none' : undefined }}
    >
      {cupola && videoOk ? (
        <div className="zoom-lento absolute inset-0">
          <video src={VIDEO_TERRA} poster="/video/terra-cupola-poster.jpg" autoPlay loop muted playsInline onError={() => setVideoOk(false)} className="absolute inset-0 h-full w-full object-cover" />
        </div>
      ) : (
        <div className="kenburns absolute inset-0">
          <img src={nodo.panorama} alt={nodo.nome} className="h-full w-full object-cover object-top" draggable={false} />
        </div>
      )}
      {!cupola && <div className="absolute inset-0 bg-black/45" />}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(2,3,10,.55)_100%)]" />
      {hotspot.map((h) => h.pos?.tipo === 'immagine' && (
        <Posiz key={h.id} x={h.pos.x} y={h.pos.y}><HotspotMarker tipo={h.categoria} titolo={h.titolo} simulazione={h.simulazione} onClick={() => onHotspot(h.id)} /></Posiz>
      ))}
      {porte.filter((p) => p.x !== undefined).map((p) => (
        <Posiz key={p.ambiente} x={p.x!} y={p.y!}><HotspotMarker tipo="ambiente" ambiente={p.ambiente} titolo={p.titolo} onClick={() => onAmbiente(p.ambiente)} /></Posiz>
      ))}
      {portelli.filter((p) => p.x !== undefined).map((p) => <PortelloImmagine key={p.verso} p={p} onPortello={onPortello} nomeNodo={nomeNodo} />)}
    </div>
  )
}
