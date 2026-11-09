import { useState } from 'react'
import type { Hotspot } from '../data/types'
import Badge from './Badge'
import Latex from './Latex'

export default function HotspotPanel({ hotspot, onClose }: { hotspot: Hotspot; onClose: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <aside
      key={hotspot.id}
      className="glass slide-in absolute right-4 top-[200px] bottom-24 z-30 w-[22rem] max-w-[90vw] overflow-y-auto rounded-2xl p-6"
    >
      <button onClick={onClose} aria-label="Chiudi" className="absolute right-4 top-3 text-xl text-white/60 hover:text-white">×</button>
      <Badge tipo={hotspot.badge} />
      <h2 className="mt-3 text-xl font-semibold leading-tight">{hotspot.titolo}</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-white/80">{hotspot.testo}</p>

      {hotspot.media && (
        <figure className="mt-4 overflow-hidden rounded-xl border border-white/10">
          {hotspot.media.tipo === 'video' ? (
            <video src={hotspot.media.src} controls preload="metadata" className="w-full" />
          ) : (
            <img src={hotspot.media.src} alt={hotspot.media.didascalia ?? hotspot.titolo} className="w-full" loading="lazy" />
          )}
          {hotspot.media.didascalia && (
            <figcaption className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-white/60">
              {hotspot.media.didascalia}
              {hotspot.media.badge && <Badge tipo={hotspot.media.badge} />}
            </figcaption>
          )}
        </figure>
      )}

      {hotspot.approfondimento && (
        <div className="mt-5 rounded-xl border border-cyan-300/20 bg-cyan-300/5">
          <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-cyan-200">
            {hotspot.approfondimentoTitolo ?? 'Approfondimento'}
            <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
          </button>
          {open && (
            <div className="fade-in border-t border-cyan-300/15 px-4 py-3 text-lg">
              <Latex tex={hotspot.approfondimento} />
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
