import { useState, type ReactNode } from 'react'
import { Activity, Play } from 'lucide-react'
import Badge from '../components/Badge'
import Voce from './Voce'
import FinestraSequenza from './FinestraSequenza'
import PulsanteEsci from './PulsanteEsci'
import Sheet from './Sheet'
import { ColonnaShell } from './Colonna'
import type { InfoLayout } from './compatto'
import type { Passo } from './contenuto'

export interface PropsVistaCompatta {
  id: string
  titolo: string
  info: InfoLayout
  onClose: () => void
  corpoIntro: ReactNode
  passi: Passo[]
  seq: number | null
  vai: (i: number | null) => void
  aperto: boolean
  onAperto: (a: boolean) => void
  altezzaSheet: number
  ridotta: boolean
  onRidotta: (r: boolean) => void
  /** margine occupato dal pannello laterale (px), per posizionare la barra dei comandi */
  ingombroLato: number
  controlli: ReactNode
  scope?: ReactNode
  etichettaAvvia?: string
}

const SICURO_ALTO = 'calc(env(safe-area-inset-top, 0px) + 40px)'

/**
 * Interfaccia delle simulazioni per telefono e tablet (il desktop usa il layout originale in Layout.tsx).
 * Verticale: pannello dal basso con maniglia, barra dei comandi sopra il pannello in una riga scorrevole.
 * Orizzontale: pannello laterale stretto a sinistra, barra dei comandi in basso a destra del pannello.
 */
export default function LayoutCompatto(p: PropsVistaCompatta) {
  const { info, passi, seq } = p
  const [scopeAperto, setScopeAperto] = useState(false)
  const inSequenza = seq !== null && passi[seq] !== undefined
  const sheet = info.modo === 'sheet'
  const telefono = info.dispositivo === 'telefono'
  const mostraScope = !!p.scope && (!telefono || scopeAperto)
  const puoAvviare = passi.length > 0 && seq === null

  const bottoneAvvia = (
    <button className="sim-avvia shrink-0 whitespace-nowrap !px-4 !py-2.5 text-[13.5px] min-h-[44px]" onClick={() => p.vai(0)}>
      <Play size={16} fill="currentColor" />
      {sheet && telefono ? (
        <>
          <span aria-hidden>Avvia</span>
          <span className="sr-only">{p.etichettaAvvia ?? 'Avvia'}</span>
        </>
      ) : (
        (p.etichettaAvvia ?? 'Avvia')
      )}
    </button>
  )

  const corpo = inSequenza ? (
    <FinestraSequenza passi={passi} indice={seq} onIndice={p.vai} onChiudi={() => p.vai(null)} />
  ) : (
    <div className="sim-scroll flex min-h-0 flex-1 flex-col gap-3 p-4 text-[13.5px] leading-relaxed">{p.corpoIntro}</div>
  )

  // barra dei comandi: riga scorrevole in orizzontale, sempre utilizzabile
  const sopraSheet = sheet ? `calc(${p.altezzaSheet}px + env(safe-area-inset-bottom, 0px) + 8px)` : undefined
  const barra = (
    <div
      className="pointer-events-none absolute z-30 flex justify-center"
      style={
        sheet
          ? { left: 8, right: 8, bottom: sopraSheet }
          : { left: p.ridotta ? 8 : p.ingombroLato, right: 8, bottom: 'calc(8px + env(safe-area-inset-bottom, 0px))' }
      }
    >
      <div data-sim-ui className="sim-riga pointer-events-auto flex max-w-full items-center gap-x-6 overflow-x-auto rounded-2xl glass px-4 py-1">
        {!sheet && puoAvviare && bottoneAvvia}
        {p.controlli}
      </div>
    </div>
  )

  return (
    <>
      {/* barra superiore: Esci sempre visibile, sotto l'intestazione dell'autore */}
      <div className="pointer-events-none absolute inset-x-0 z-40 flex items-center justify-end gap-2 pr-[max(12px,env(safe-area-inset-right))]" style={{ top: SICURO_ALTO }}>
        <div data-sim-ui className="flex items-center gap-2">
          {p.scope && telefono && (
            <button
              onClick={() => setScopeAperto(!scopeAperto)}
              aria-pressed={scopeAperto}
              aria-label={scopeAperto ? 'Nascondi il grafico' : 'Mostra il grafico'}
              className={'glass pointer-events-auto grid h-11 w-11 place-items-center rounded-full ' + (scopeAperto ? 'text-cyan-200' : 'text-white')}
            >
              <Activity size={18} />
            </button>
          )}
          <Voce id={p.id} />
          {!telefono && <Badge tipo="simulazione" />}
          <PulsanteEsci onClick={p.onClose} />
        </div>
      </div>

      {sheet ? (
        <Sheet
          id={p.id}
          titolo={p.titolo}
          aperto={p.aperto}
          onAperto={p.onAperto}
          altezza={p.altezzaSheet}
          contatore={inSequenza ? `passo ${seq + 1}/${passi.length}` : undefined}
          onChiudiSequenza={inSequenza ? () => p.vai(null) : undefined}
          azione={puoAvviare ? bottoneAvvia : undefined}
        >
          {corpo}
        </Sheet>
      ) : (
        <ColonnaShell
          id={p.id}
          titolo={p.titolo}
          ridotta={p.ridotta}
          onRidotta={p.onRidotta}
          larghezza={info.larghLato}
          contatore={inSequenza ? `passo ${seq + 1}/${passi.length}` : undefined}
          onChiudiSequenza={inSequenza ? () => p.vai(null) : undefined}
        >
          {corpo}
        </ColonnaShell>
      )}

      {mostraScope && (
        <div
          data-sim-ui
          className="sim-scope absolute right-3 origin-top-right transition-transform duration-300"
          style={{ top: `calc(${SICURO_ALTO} + 52px)`, transform: `scale(${inSequenza ? 0.55 : telefono ? 0.62 : 0.75})` }}
        >
          {p.scope}
        </div>
      )}

      {barra}
    </>
  )
}
