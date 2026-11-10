import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useProgress } from '@react-three/drei'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { Play } from 'lucide-react'
import Badge from '../components/Badge'
import Stile from './Stile'
import Voce from './Voce'
import FinestraSequenza from './FinestraSequenza'
import PulsanteEsci from './PulsanteEsci'
import { ColonnaShell, GuidaBox, INGOMBRO_COLONNA } from './Colonna'
import { useEscape } from './useEscape'
import type { Passo } from './contenuto'

export type ContestoLayout = {
  seq: number | null
  passo: Passo | null
  /** spostamento orizzontale (px) da dare all'inquadratura per centrare la scena nell'area libera */
  sinistraPx: number
  vai: (i: number | null) => void
}

export type PropsLayout = {
  id: string
  titolo: string
  intro: string
  formula?: string
  formulaNota?: string
  agenda?: string
  slide?: string
  /** contenuto aggiuntivo del pannello introduttivo (didascalia, dettaglio dell'hotspot) */
  extra?: ReactNode
  passi?: Passo[]
  /** chiamata a ogni cambio di passo (null = sequenza chiusa) */
  onPasso?: (i: number | null, passo?: Passo) => void
  onClose: () => void
  controlli: ReactNode
  /** testo del pulsante che apre i passi */
  etichettaAvvia?: string
  scope?: ReactNode
  /** la scena (Canvas e overlay): riempie tutto lo schermo sotto i pannelli */
  scena: (c: ContestoLayout) => ReactNode
}

/**
 * Struttura comune delle simulazioni. Una sola colonna di testo a sinistra: il pannello introduttivo
 * (con "Come si usa") prima di "Avvia", poi la finestra dei passi. La scena occupa tutto il resto;
 * in alto a destra il pulsante "Esci"; in basso, a destra della colonna, la barra dei comandi.
 */
export default function LayoutSimulazione(p: PropsLayout) {
  const [seq, setSeq] = useState<number | null>(null)
  const [ridotta, setRidotta] = useState(false)
  const { active: inCaricamento } = useProgress()
  const seqRef = useRef(seq)
  seqRef.current = seq
  const passi = p.passi ?? []
  const passo = seq !== null ? (passi[seq] ?? null) : null
  const { onPasso, onClose } = p

  const vai = useCallback(
    (i: number | null) => {
      setSeq(i)
      onPasso?.(i, i === null ? undefined : passi[i])
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onPasso, p.passi],
  )

  // Esc: prima chiude la sequenza dei passi, poi la simulazione (un solo gestore per livello)
  useEscape(() => {
    if (seqRef.current !== null) vai(null)
    else onClose()
    return true
  }, 10)

  // solo in sviluppo: ?passo=N apre subito la sequenza al passo N (utile per i controlli visivi)
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const n = Number(new URLSearchParams(location.search).get('passo'))
    if (Number.isInteger(n) && n > 0 && n <= passi.length) vai(n - 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const formulaHtml = p.formula ? katex.renderToString(p.formula, { displayMode: true, throwOnError: false }) : ''
  const sinistraPx = ridotta ? 0 : INGOMBRO_COLONNA / 2
  const inSequenza = seq !== null && passo !== null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#05070f] text-white" role="dialog" aria-label={p.titolo}>
      <Stile />
      {p.scena({ seq, passo, sinistraPx, vai })}

      {inCaricamento && (
        <div className="pointer-events-none absolute inset-0 z-[6] grid place-items-center text-xs uppercase tracking-[0.35em] text-white/45">Caricamento della simulazione…</div>
      )}

      {/* barra superiore (sotto l'intestazione dell'autore) */}
      <div className="pointer-events-none absolute inset-x-0 top-[52px] z-40 flex items-center justify-end gap-3 px-5">
        <div data-sim-ui className="flex items-center gap-3">
          <Voce id={p.id} />
          <Badge tipo="simulazione" />
          <PulsanteEsci onClick={onClose} />
        </div>
      </div>

      {/* colonna di sinistra: o l'introduzione o i passi, mai due */}
      <ColonnaShell
        id={p.id}
        titolo={p.titolo}
        ridotta={ridotta}
        onRidotta={setRidotta}
        contatore={inSequenza ? `passo ${seq + 1}/${passi.length}` : undefined}
        onChiudiSequenza={inSequenza ? () => vai(null) : undefined}
      >
        {inSequenza ? (
          <FinestraSequenza passi={passi} indice={seq} onIndice={vai} onChiudi={() => vai(null)} />
        ) : (
          <div className="sim-scroll flex min-h-0 flex-1 flex-col gap-3 p-4 text-[13px] leading-relaxed">
            <p className="text-white/80">{p.intro}</p>
            {p.extra}
            <GuidaBox id={p.id} />
            {p.formula && (
              <details className="rounded-lg bg-white/5 px-3 py-2">
                <summary className="cursor-pointer select-none text-xs uppercase tracking-wider text-cyan-200/80">La formula</summary>
                <div className="sim-formula py-1 text-white" dangerouslySetInnerHTML={{ __html: formulaHtml }} />
                {p.formulaNota && <p className="text-xs text-white/60">{p.formulaNota}</p>}
              </details>
            )}
            <div className="mt-auto space-y-1 border-t border-white/10 pt-3 text-[11px] text-white/55">
              {p.agenda && <p>{p.agenda}</p>}
              {p.slide && <p>Teoria: {p.slide}</p>}
            </div>
          </div>
        )}
      </ColonnaShell>

      {p.scope && (
        <div data-sim-ui className="sim-scope absolute right-5 top-[108px] origin-top-right transition-transform duration-300" style={{ transform: inSequenza ? 'scale(.62)' : undefined }}>
          {p.scope}
        </div>
      )}

      {/* barra dei comandi: sottile, in basso, a destra della colonna; sempre utilizzabile */}
      <div className="pointer-events-none absolute bottom-4 right-5 z-30 flex justify-center transition-[left] duration-300" style={{ left: ridotta ? 20 : INGOMBRO_COLONNA }}>
        <div data-sim-ui className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-x-7 gap-y-1 rounded-2xl glass px-5 py-2">
          {p.controlli}
          {passi.length > 0 && seq === null && (
            <button className="sim-avvia" onClick={() => vai(0)}>
              <Play size={18} fill="currentColor" /> {p.etichettaAvvia ?? 'Avvia'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
