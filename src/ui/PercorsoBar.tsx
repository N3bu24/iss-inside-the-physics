import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  guidata: boolean
  indice: number
  totale: number
  titolo: string
  occupato: boolean
  onPrev: () => void
  onNext: () => void
  onLibero: () => void
  onRiprendi: () => void
}

/** Barra compatta della visita guidata (che è un percorso nel grafo); in qualunque momento si passa all'esplorazione libera. */
export default function PercorsoBar({ guidata, indice, totale, titolo, occupato, onPrev, onNext, onLibero, onRiprendi }: Props) {
  const btn = 'flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-white/85 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent'
  return (
    <div className="glass absolute bottom-5 left-1/2 z-30 w-[min(520px,52vw)] min-w-[22rem] -translate-x-1/2 rounded-2xl px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        {guidata ? (
          <button onClick={onPrev} disabled={occupato || indice === 0} className={btn}><ChevronLeft size={16} />Indietro</button>
        ) : (
          <span className="w-8" />
        )}
        <div className="min-w-0 flex-1 text-center">
          <div className="truncate text-sm font-medium">{titolo}</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">
            {guidata ? `Visita guidata · ${indice + 1} / ${totale}` : 'Esplorazione libera'}
          </div>
        </div>
        {guidata ? (
          <button onClick={onNext} disabled={occupato || indice >= totale - 1} className={btn}>Avanti<ChevronRight size={16} /></button>
        ) : (
          <button onClick={onRiprendi} disabled={occupato} className={`${btn} text-cyan-200`}>Riprendi la visita</button>
        )}
      </div>
      {guidata && (
        <div className="mt-1 flex items-center justify-center gap-2">
          <div className="flex flex-1 gap-1">
            {Array.from({ length: totale }, (_, i) => (
              <div key={i} className="h-[3px] flex-1 rounded-full" style={{ background: i <= indice ? '#35e0ff' : 'rgba(255,255,255,.18)' }} />
            ))}
          </div>
          <button onClick={onLibero} className="text-[11px] text-cyan-200/80 underline-offset-4 hover:underline">Esplora liberamente</button>
        </div>
      )}
    </div>
  )
}
