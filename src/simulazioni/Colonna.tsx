import { useState, type ReactNode } from 'react'
import { HelpCircle, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { iconaSim } from '../data/iconeSim'
import Stile from './Stile'
import { guidaSimulazione } from './contenuto'

/** Larghezza della colonna di testo e margine sinistro (px): usati anche per centrare la scena nell'area libera. */
export const LARGHEZZA_COLONNA = 380
export const INGOMBRO_COLONNA = LARGHEZZA_COLONNA + 20 + 20

/** Riquadro "Come si usa": come si usa, cosa fa ogni comando, cosa dimostra. */
export function GuidaBox({ id }: { id: string }) {
  const g = guidaSimulazione(id)
  if (!g) return null
  return (
    <section className="rounded-xl border border-cyan-300/25 bg-cyan-300/[0.06] px-3.5 py-3 text-[12.5px] leading-relaxed" aria-label="Come si usa">
      <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">Come si usa</h3>
      <p className="text-white/85">{g.come_si_usa}</p>
      {g.comandi.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {g.comandi.map((c, i) => (
            <li key={i} className="text-white/75">
              {c.nome && <span className="font-medium text-white">{c.nome}. </span>}
              {c.cosa_fa}
            </li>
          ))}
        </ul>
      )}
      {g.cosa_dimostra && (
        <p className="mt-2 border-t border-white/10 pt-2 text-white/75">
          <span className="font-medium text-orange-200">Cosa dimostra: </span>
          {g.cosa_dimostra}
        </p>
      )}
    </section>
  )
}

type Props = {
  id: string
  titolo: string
  ridotta: boolean
  onRidotta: (r: boolean) => void
  /** testo accanto al titolo (es. "Passo 2 di 6") */
  contatore?: string
  /** se presente compaiono il pulsante "?" e la "x" per chiudere la sequenza dei passi */
  onChiudiSequenza?: () => void
  /** distanza dal basso (classe Tailwind), per i contesti con una barra in basso */
  basso?: string
  children: ReactNode
}

/**
 * Colonna sinistra delle simulazioni (larghezza fissa, dalla barra superiore alla barra dei comandi):
 * intestazione con icona e titolo, corpo scorrevole, pulsante per ridurla a linguetta.
 */
export function ColonnaShell({ id, titolo, ridotta, onRidotta, contatore, onChiudiSequenza, basso = 'bottom-4', children }: Props) {
  const ic = iconaSim(id)
  const [guida, setGuida] = useState(false)
  if (ridotta) {
    return (
      <button
        data-sim-ui
        onClick={() => onRidotta(false)}
        aria-label="Riapri il pannello"
        className={`glass pointer-events-auto absolute left-0 top-[108px] z-10 flex flex-col items-center gap-2 rounded-r-2xl px-2.5 py-3 text-white/80 hover:text-white`}
      >
        <ic.Icon size={20} style={{ color: ic.colore }} />
        <PanelLeftOpen size={16} />
      </button>
    )
  }
  return (
    <aside
      data-sim-ui
      className={`glass pointer-events-auto absolute left-5 top-[108px] z-10 flex flex-col overflow-hidden rounded-2xl text-white ${basso}`}
      style={{ width: LARGHEZZA_COLONNA, background: 'rgba(7,12,26,.8)' }}
    >
      <Stile />
      <header className="relative flex shrink-0 items-center gap-3 border-b border-white/10 px-4 py-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border" style={{ color: ic.colore, borderColor: ic.colore + '88', background: ic.colore + '14' }}>
          <ic.Icon size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5 whitespace-nowrap text-[10.5px] font-medium uppercase tracking-[0.14em]" style={{ color: ic.colore }}>
            <span className="truncate">{ic.titolo}</span>
            {contatore ? <span className="shrink-0 text-white/55">· {contatore}</span> : null}
          </div>
          <h2 className="line-clamp-2 text-[15px] font-semibold leading-tight" title={titolo}>
            {titolo}
          </h2>
        </div>
        {onChiudiSequenza && (
          <button onClick={() => setGuida(!guida)} aria-pressed={guida} aria-label="Come si usa" title="Come si usa" className={'grid h-8 w-8 place-items-center rounded-full border ' + (guida ? 'border-cyan-300 text-cyan-200' : 'border-white/25 text-white/70 hover:text-white')}>
            <HelpCircle size={16} />
          </button>
        )}
        <button onClick={() => onRidotta(true)} aria-label="Riduci il pannello e vedi tutta la scena" title="Riduci il pannello" className="grid h-8 w-8 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white">
          <PanelLeftClose size={17} />
        </button>
        {onChiudiSequenza && (
          <button onClick={onChiudiSequenza} aria-label="Chiudi i passi e torna al pannello" title="Chiudi i passi" className="grid h-8 w-8 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white">
            <X size={16} />
          </button>
        )}
      </header>
      {guida && onChiudiSequenza && (
        <div className="sim-scroll absolute inset-x-3 top-[68px] z-20 max-h-[60%] rounded-xl bg-[#070c1a] shadow-2xl">
          <GuidaBox id={id} />
        </div>
      )}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </aside>
  )
}
