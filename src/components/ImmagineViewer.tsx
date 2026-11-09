import { useEffect, useState } from 'react'
import type { Tappa } from '../data/types'

interface Props {
  tappa: Tappa
  onHotspot: (id: string) => void
  onNavigate: (id: string) => void
}

/** Foto a schermo intero con lento Ken Burns; hotspot e collegamenti posizionati in coordinate 0..1 sull'immagine. */
export default function ImmagineViewer({ tappa, onHotspot, onNavigate }: Props) {
  const [pronta, setPronta] = useState(false)
  const ar = tappa.aspetto ?? 1.5
  useEffect(() => {
    setPronta(false)
    const i = new Image()
    i.onload = () => setPronta(true)
    i.src = tappa.immagine!
    return () => { i.onload = null }
  }, [tappa.immagine])

  return (
    <div key={tappa.id} className="absolute inset-0 overflow-hidden bg-[#02030a]">
      <div
        className={`img-reveal absolute left-1/2 top-1/2 overflow-hidden ${pronta ? 'opacity-100' : 'opacity-0'}`}
        style={{ width: `max(100vw, calc(100vh * ${ar}))`, aspectRatio: String(ar), transform: 'translate(-50%, -50%)', filter: pronta ? 'none' : 'blur(24px)' }}
      >
        <div className="kenburns absolute inset-0">
          <img src={tappa.immagine} alt={tappa.titolo} className="h-full w-full object-cover object-top" draggable={false} />
          <div className="absolute inset-0 bg-black" style={{ opacity: tappa.velo ?? 0 }} />
          {tappa.hotspot.filter((h) => h.x !== undefined && h.y !== undefined).map((h) => (
            <button key={h.id} className="hs-btn" style={{ left: `${h.x! * 100}%`, top: `${h.y! * 100}%` }} onClick={() => onHotspot(h.id)} aria-label={h.titolo}>
              <div className="hs-dot" /><span className="tip">{h.titolo}</span>
            </button>
          ))}
          {tappa.collegamenti.filter((c) => c.x !== undefined && c.y !== undefined).map((c) => (
            <button key={c.a} className="hs-btn" style={{ left: `${c.x! * 100}%`, top: `${c.y! * 100}%` }} onClick={() => onNavigate(c.a)} aria-label={c.etichetta ?? c.a}>
              <div className="hs-link">➜</div><span className="tip">{c.etichetta ?? c.a}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(2,3,10,.65)_100%)]" />
    </div>
  )
}
