import { ArrowDown, ArrowUp } from 'lucide-react'
import { nodi, type NodoId } from '../data/stazione'
import { useVista } from './vista'

/** Indicatore centrale in basso: "↑ verso Columbus" se un portello è inquadrato, "↓ torna a Harmony" se c'è un luogo da cui si è arrivati. */
export default function Indicatore({ precedente }: { precedente: NodoId | null }) {
  const avanti = useVista((v) => v.portello) as NodoId | null
  if (!avanti && !precedente) return null
  return (
    <div className="pointer-events-none absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-1.5 text-sm">
      {avanti && (
        <div key={avanti} className="fade-in flex items-center gap-2 rounded-full border border-white/25 bg-[rgba(4,8,20,.82)] px-4 py-1.5 text-white shadow-lg">
          <span className="kbd"><ArrowUp size={12} /></span>
          {avanti === 'eml' ? 'entra nell\'EML' : avanti === 'cupola' ? 'scendi nella Cupola' : `verso ${nodi[avanti].nome}`}
        </div>
      )}
      {precedente && (
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[rgba(4,8,20,.6)] px-3 py-1 text-xs text-white/60">
          <span className="kbd !h-[18px] !min-w-[18px]"><ArrowDown size={10} /></span>torna a {nodi[precedente].nome}
        </div>
      )}
    </div>
  )
}
