import { Check } from 'lucide-react'
import { tappeSuggerite, type NodoId } from '../data/stazione'

interface Props {
  corrente: NodoId
  visitati: Set<NodoId>
  occupato: boolean
  onVai: (n: NodoId) => void
}

/** "Tappe suggerite": barra discreta in alto, sotto l'intestazione. Tappa attuale evidenziata, viste spuntate; il clic vola fin lì passando per i moduli intermedi. */
export default function TappeBar({ corrente, visitati, occupato, onVai }: Props) {
  return (
    <nav aria-label="Tappe suggerite" className="glass absolute left-1/2 top-8 z-30 flex max-w-[calc(100vw-40rem)] -translate-x-1/2 items-center gap-0.5 rounded-full px-2 py-1">
      <span className="hidden px-2 text-[10px] uppercase tracking-[0.18em] text-white/40 2xl:block">Tappe suggerite</span>
      {tappeSuggerite.map((t, i) => {
        const att = t.nodo === corrente
        const visto = visitati.has(t.nodo) && !att
        return (
          <div key={t.nodo} className="flex items-center">
            {i > 0 && <span className="h-px w-2 bg-white/20" />}
            <button
              onClick={() => onVai(t.nodo)} disabled={occupato || att} aria-current={att ? 'step' : undefined}
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11.5px] leading-none transition-colors ${att ? 'bg-cyan-300/20 font-semibold text-cyan-100 ring-1 ring-cyan-300/60' : 'text-white/70 hover:bg-white/10 hover:text-white'} disabled:cursor-default`}
            >
              {visto && <Check size={12} className="text-emerald-300" strokeWidth={3} />}
              {t.etichetta}
            </button>
          </div>
        )
      })}
    </nav>
  )
}
