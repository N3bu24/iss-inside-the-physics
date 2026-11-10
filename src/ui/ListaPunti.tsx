import { useState } from 'react'
import { Check, ChevronUp, ListChecks } from 'lucide-react'
import type { Categoria } from '../data/types'
import { iconaSim } from '../data/iconeSim'
import { BollinoSim, stileTipo } from './Hotspot'

export interface VocePunto { id: string; titolo: string; categoria: Categoria; visto: boolean; simulazione?: string }

/** Pannello laterale compatto e comprimibile con i punti di interesse del modulo; il clic ruota la visuale e apre la scheda. */
export default function ListaPunti({ punti, onScegli }: { punti: VocePunto[]; onScegli: (id: string) => void }) {
  const [aperta, setAperta] = useState(true)
  if (!punti.length) return null
  const viste = punti.filter((p) => p.visto).length
  return (
    <div className="glass fade-in w-[21rem] max-w-[92vw] rounded-2xl compatto:w-full compatto:max-w-none compatto:!border-0 compatto:!bg-transparent compatto:!shadow-none compatto:!backdrop-blur-none">
      <button onClick={() => setAperta(!aperta)} aria-expanded={aperta} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left">
        <ListChecks size={16} className="shrink-0 text-cyan-200" />
        <span className="flex-1 text-sm font-medium">Punti di interesse</span>
        <span className="text-xs text-white/50">{viste}/{punti.length}</span>
        <ChevronUp size={16} className={`shrink-0 text-white/60 transition-transform ${aperta ? '' : 'rotate-180'}`} />
      </button>
      {aperta && (
        <ul className="scroll-sottile max-h-[min(40vh,20rem)] space-y-0.5 overflow-y-auto px-2 pb-2 compatto:max-h-none compatto:overflow-visible">
          {punti.map((p) => {
            const { Icon, colore } = stileTipo(p.categoria)
            return (
              <li key={p.id}>
                <button onClick={() => onScegli(p.id)} className="flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left hover:bg-white/10 compatto:min-h-12 compatto:active:bg-white/10">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 bg-[#05080f]" style={{ borderColor: colore }}><Icon size={14} color="#fff" strokeWidth={2.2} /></span>
                  <span className={`min-w-0 flex-1 truncate text-[13.5px] ${p.visto ? 'text-white/55' : 'text-white'}`}>{p.titolo}</span>
                  {p.simulazione && <span title={`Simulazione: ${iconaSim(p.simulazione).titolo}`} className="bollino-in-riga flex shrink-0"><BollinoSim simulazione={p.simulazione} size={22} /></span>}
                  {p.visto ? <Check size={14} className="shrink-0 text-emerald-300" strokeWidth={3} /> : <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_6px_#35e0ff]" aria-label="da vedere" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
