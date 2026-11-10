import { useRef, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronUp, HelpCircle, X } from 'lucide-react'
import { iconaSim } from '../data/iconeSim'
import Stile from './Stile'
import { GuidaBox } from './Colonna'
import { ALTEZZA_STRISCIA } from './compatto'

type Props = {
  id: string
  titolo: string
  aperto: boolean
  onAperto: (a: boolean) => void
  /** altezza (px) del pannello quando è aperto */
  altezza: number
  /** distanza dal bordo inferiore (px), per le schermate con una barra in basso */
  bassoPx?: number
  /** testo accanto al titolo (es. "passo 2/6") */
  contatore?: string
  /** pulsante principale nella striscia (es. «Avvia»): appare solo se non ci sono i passi aperti */
  azione?: ReactNode
  /** se presente compaiono «?» e «x» per chiudere la sequenza dei passi */
  onChiudiSequenza?: () => void
  children: ReactNode
}

/**
 * Pannello dal basso (bottom sheet) per telefono e tablet in verticale. La striscia in alto (maniglia, icona, titolo,
 * pulsante principale) è sempre visibile; toccala o trascinala per aprire e chiudere. Il corpo scorre; il piede dei passi
 * (Indietro / pallini / Avanti) resta fisso in fondo. Non intercetta i gesti sulla scena: copre solo la sua area.
 */
export default function Sheet(p: Props) {
  const ic = iconaSim(p.id)
  const [guida, setGuida] = useState(false)
  const y0 = useRef<number | null>(null)
  const h = p.aperto ? p.altezza : ALTEZZA_STRISCIA

  const giu = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return
    y0.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const su = (e: React.PointerEvent<HTMLDivElement>) => {
    if (y0.current === null) return
    const dy = e.clientY - y0.current
    y0.current = null
    if (Math.abs(dy) < 10) p.onAperto(!p.aperto)
    else p.onAperto(dy < 0)
  }

  return (
    <aside
      data-sim-ui
      className="pointer-events-auto absolute inset-x-0 z-20 flex flex-col overflow-hidden rounded-t-3xl border border-b-0 border-white/10 text-white shadow-[0_-12px_40px_rgba(0,0,0,.5)] transition-[height] duration-300 ease-out"
      style={{
        bottom: p.bassoPx ?? 0,
        height: `calc(${h}px + ${p.bassoPx ? '0px' : 'env(safe-area-inset-bottom, 0px)'})`,
        paddingBottom: p.bassoPx ? 0 : 'env(safe-area-inset-bottom, 0px)',
        background: 'rgba(7,12,26,.93)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
      }}
    >
      <Stile />
      <div
        data-sheet-toggle
        role="button"
        tabIndex={0}
        aria-expanded={p.aperto}
        aria-label={p.aperto ? 'Chiudi il pannello' : 'Apri il pannello'}
        onPointerDown={giu}
        onPointerUp={su}
        onPointerCancel={() => { y0.current = null }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') p.onAperto(!p.aperto) }}
        onClick={(e) => { if (e.detail === 0 && !(e.target as HTMLElement).closest('button')) p.onAperto(!p.aperto) }}
        className="relative shrink-0 cursor-pointer select-none border-b border-white/10 px-3 pb-2 pt-3"
        style={{ touchAction: 'none', minHeight: ALTEZZA_STRISCIA }}
      >
        <span className="absolute left-1/2 top-1.5 h-1 w-10 -translate-x-1/2 rounded-full bg-white/35" />
        <div className="flex items-center gap-2.5 pt-1">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border" style={{ color: ic.colore, borderColor: ic.colore + '88', background: ic.colore + '14' }}>
            <ic.Icon size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.12em]" style={{ color: ic.colore }}>
              <span className="truncate">{ic.titolo}</span>
              {p.contatore ? <span className="shrink-0 text-white/55">· {p.contatore}</span> : null}
            </div>
            <h2 className="line-clamp-2 text-[14px] font-semibold leading-tight">{p.titolo}</h2>
          </div>
          {p.azione}
          {p.onChiudiSequenza && (
            <>
              <button onClick={() => setGuida(!guida)} aria-pressed={guida} aria-label="Come si usa" className={'grid h-11 w-11 shrink-0 place-items-center rounded-full border ' + (guida ? 'border-cyan-300 text-cyan-200' : 'border-white/25 text-white/70')}>
                <HelpCircle size={18} />
              </button>
              <button onClick={p.onChiudiSequenza} aria-label="Chiudi i passi e torna al pannello" className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white/70 active:bg-white/10">
                <X size={18} />
              </button>
            </>
          )}
          <span className="grid h-9 w-7 shrink-0 place-items-center text-white/55" aria-hidden>
            {p.aperto ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </span>
        </div>
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col">
        {guida && p.onChiudiSequenza && (
          <div className="sim-scroll absolute inset-x-2 top-1 z-20 max-h-[85%] rounded-xl bg-[#070c1a] shadow-2xl">
            <GuidaBox id={p.id} />
          </div>
        )}
        {p.children}
      </div>
    </aside>
  )
}
