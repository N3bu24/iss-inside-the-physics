import { ArrowDown, ArrowUp } from 'lucide-react'
import { nodi, type NodoId } from '../data/stazione'
import { useVista } from './vista'

const testoAvanti = (avanti: NodoId) => (avanti === 'eml' ? 'entra nell\'EML' : avanti === 'cupola' ? 'scendi nella Cupola' : avanti === 'finale' ? 'verso il finale' : `verso ${nodi[avanti].nome}`)

/**
 * Indicatore centrale in basso: "↑ verso Columbus" se un portello è inquadrato, "↓ torna a Harmony" se c'è un luogo da cui si è arrivati.
 * Su telefono e tablet (`compatto`) i due riquadri sono pulsanti da toccare (`onAvanti`, `onIndietro`) e stanno nel flusso della colonna sopra la barra.
 */
export default function Indicatore({ precedente, laterale = false, compatto = false, onAvanti, onIndietro }: { precedente: NodoId | null; laterale?: boolean; compatto?: boolean; onAvanti?: () => void; onIndietro?: () => void }) {
  const avanti = useVista((v) => v.portello) as NodoId | null
  if (!avanti && !precedente) return null
  if (compatto) {
    return (
      <div className={'pointer-events-none flex flex-col gap-1.5 text-sm ' + (laterale ? 'items-start' : 'items-center')}>
        {avanti && (
          <button key={avanti} onClick={onAvanti} className="fade-in pointer-events-auto flex min-h-11 items-center gap-2 rounded-full border border-cyan-300/60 bg-[rgba(4,8,20,.88)] px-4 text-white shadow-lg active:bg-cyan-300/20">
            <ArrowUp size={16} className="text-cyan-200" />{testoAvanti(avanti)}
          </button>
        )}
        {precedente && (
          <button onClick={onIndietro} className="pointer-events-auto flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-[rgba(4,8,20,.72)] px-3.5 text-xs text-white/75 active:bg-white/10">
            <ArrowDown size={14} />torna a {nodi[precedente].nome}
          </button>
        )}
      </div>
    )
  }
  return (
    <div className={'pointer-events-none absolute bottom-5 z-30 flex flex-col gap-1.5 text-sm ' + (laterale ? 'left-[18.5rem] items-start' : 'left-1/2 -translate-x-1/2 items-center')}>
      {avanti && (
        <div key={avanti} className="fade-in flex items-center gap-2 rounded-full border border-white/25 bg-[rgba(4,8,20,.82)] px-4 py-1.5 text-white shadow-lg">
          <span className="kbd"><ArrowUp size={12} /></span>
          {testoAvanti(avanti)}
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
