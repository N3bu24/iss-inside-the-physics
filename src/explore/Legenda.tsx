import { useState } from 'react'
import { ArrowDown, ArrowUp, ChevronDown, Hand, Keyboard, Mouse } from 'lucide-react'

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
      </ul>
    </div>
  )
}
