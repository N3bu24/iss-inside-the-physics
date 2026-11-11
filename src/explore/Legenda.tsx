import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, ChevronDown, ChevronsUp, Hand, Keyboard, Mouse, Play, X, ZoomIn } from 'lucide-react'

/** Gesti per i dispositivi touch (telefono e tablet): scheda al centro, si chiude con un tocco o da sola dopo qualche secondo. */
export function LegendaGesti({ onChiudi }: { onChiudi: () => void }) {
  useEffect(() => { const id = setTimeout(onChiudi, 12000); return () => clearTimeout(id) }, [onChiudi])
  return (
    <div className="pointer-events-none absolute inset-x-0 z-[33] flex justify-center px-4" style={{ top: 'max(4.6rem, 22%)' }}>
      <div role="note" className="glass fade-in pointer-events-auto relative w-full max-w-[20rem] rounded-2xl px-4 py-3 text-[13.5px] text-white/85">
        <button onClick={onChiudi} aria-label="Chiudi i suggerimenti" className="absolute right-1 top-1 grid h-10 w-10 place-items-center text-white/60"><X size={18} /></button>
        <div className="mb-1.5 pr-8 text-[11px] uppercase tracking-[0.18em] text-cyan-200/80">Come muoversi</div>
        <ul className="space-y-2">
          <li className="flex items-center gap-3"><Hand size={20} className="shrink-0 text-white/65" />Trascina per guardarti attorno</li>
          <li className="flex items-center gap-3"><ZoomIn size={20} className="shrink-0 text-white/65" />Pizzica con due dita per lo zoom</li>
          <li className="flex items-center gap-3"><ChevronsUp size={20} className="shrink-0 text-white/65" />Tocca il rombo con le frecce per cambiare modulo</li>
        </ul>
      </div>
    </div>
  )
}

/** Legenda dei comandi: piccola, semitrasparente, in basso a sinistra; si può comprimere. */
export default function Legenda() {
  const [aperta, setAperta] = useState(true)
  if (!aperta) {
    return (
      <button onClick={() => setAperta(true)} aria-label="Mostra i comandi" title="Comandi"
        className="glass absolute bottom-5 left-4 z-30 rounded-full p-2.5 text-white/60 opacity-70 hover:opacity-100">
        <Keyboard size={16} />
      </button>
    )
  }
  return (
    <div className="glass absolute bottom-5 left-4 z-30 w-[13.5rem] rounded-2xl px-3.5 py-2.5 text-xs text-white/70 opacity-75 transition-opacity hover:opacity-100">
      <button onClick={() => setAperta(false)} aria-label="Comprimi i comandi" className="absolute right-2 top-2 text-white/40 hover:text-white"><ChevronDown size={14} /></button>
      <ul className="space-y-1.5">
        <li className="flex items-center gap-2"><span className="kbd"><ArrowUp size={12} /></span><span className="kbd"><ArrowDown size={12} /></span>Avanti / indietro</li>
        <li className="flex items-center gap-2"><Mouse size={18} className="text-white/60" />Rotella: zoom</li>
        <li className="flex items-center gap-2"><Hand size={18} className="text-white/60" />Trascina: guarda intorno</li>
        <li className="flex items-center gap-2"><span className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border-2 border-cyan-300"><Play size={8} color="#fff" fill="#fff" /></span>Punto con simulazione</li>
      </ul>
    </div>
  )
}
