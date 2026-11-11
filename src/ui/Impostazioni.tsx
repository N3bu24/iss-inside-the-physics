import { useEffect, useState } from 'react'
import { RotateCcw, X } from 'lucide-react'
import { preferenze, usePreferenza, type Preferenze } from '../lib/preferenze'
import { ContenutoCrediti } from '../components/Crediti'
import { PRIORITA_PANNELLO, useEscape } from '../lib/useEscape'
import { testoDiretta } from '../lib/contenutoV11'

export type SchedaImpostazioni = 'impostazioni' | 'crediti'

function Cursore({ etichetta, chiave }: { etichetta: string; chiave: 'volumeVoce' | 'volumeSottofondo' }) {
  const v = usePreferenza(chiave)
  return (
    <label className="flex items-center gap-4 py-2.5">
      <span className="w-44 shrink-0 text-[14px] text-white/85 tel:w-24 tel:text-[13px]">{etichetta}</span>
      <input
        type="range" min={0} max={1} step={0.05} value={v} onChange={(e) => preferenze.set({ [chiave]: Number(e.target.value) })}
        aria-label={etichetta} className="h-1.5 min-w-0 flex-1 cursor-pointer accent-cyan-300 compatto:h-6"
      />
      <span className="w-10 text-right text-xs tabular-nums text-white/55">{Math.round(v * 100)}%</span>
    </label>
  )
}

function Interruttore({ etichetta, aiuto, chiave }: { etichetta: string; aiuto?: string; chiave: 'sottotitoli' | 'altoContrasto' | 'riduciAnimazioni' | 'saltaVoli' | 'tremolioCapsula' | 'cupolaDiretta' }) {
  const v = usePreferenza(chiave)
  return (
    <div className="flex items-center gap-4 py-2.5">
      <div className="min-w-0 flex-1">
        <div className="text-[14px] text-white/85">{etichetta}</div>
        {aiuto && <div className="text-[12px] leading-snug text-white/50">{aiuto}</div>}
      </div>
      <button
        role="switch" aria-checked={v} aria-label={etichetta} onClick={() => preferenze.set({ [chiave]: !v })}
        className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${v ? 'border-cyan-300/70 bg-cyan-300/35' : 'border-white/25 bg-white/10'}`}
      >
        <span className={`absolute top-0.5 rounded-full bg-white shadow transition-all ${v ? 'left-[1.45rem]' : 'left-0.5'}`} style={{ width: 18, height: 18 }} />
      </button>
    </div>
  )
}

const DIM: { v: Preferenze['dimensioneTesto']; n: string }[] = [{ v: 'normale', n: 'Normale' }, { v: 'grande', n: 'Grande' }, { v: 'molto-grande', n: 'Molto grande' }]

/** Pannello impostazioni + crediti: testata fissa (titolo, schede, X sempre visibile) e corpo scorrevole. Esc chiude. */
export default function Impostazioni({ scheda: iniziale = 'impostazioni', onClose }: { scheda?: SchedaImpostazioni; onClose: () => void }) {
  const [scheda, setScheda] = useState<SchedaImpostazioni>(iniziale)
  const dim = usePreferenza('dimensioneTesto')
  useEscape(() => { onClose(); return true }, PRIORITA_PANNELLO)
  const tab = (id: SchedaImpostazioni, n: string) => (
    <button key={id} role="tab" aria-selected={scheda === id} onClick={() => setScheda(id)}
      className={`rounded-full px-4 py-1.5 text-sm transition-colors compatto:min-h-11 compatto:px-5 ${scheda === id ? 'bg-cyan-300/20 text-cyan-100 ring-1 ring-cyan-300/50' : 'text-white/65 hover:bg-white/10 hover:text-white'}`}>{n}</button>
  )
  return (
    <div className="absolute inset-0 z-[150] flex items-center justify-center bg-black/55 p-6 tel:p-0" onClick={onClose}>
      <aside role="dialog" aria-label="Impostazioni e crediti" onClick={(e) => e.stopPropagation()}
        className="glass pannello-opaco fade-in flex max-h-[85vh] w-[min(720px,94vw)] flex-col overflow-hidden rounded-2xl tel:h-full tel:max-h-full tel:w-full tel:rounded-none" style={{ background: 'rgba(7,12,26,.96)' }}>
        <header className="flex shrink-0 items-center gap-3 border-b border-white/10 px-6 py-3.5 tel:px-4 tel:pt-7">
          <div role="tablist" className="flex flex-1 items-center gap-2">{tab('impostazioni', 'Impostazioni')}{tab('crediti', 'Crediti')}</div>
          <button onClick={onClose} aria-label="Chiudi" title="Chiudi (Esc)" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 bg-white/5 text-white/80 hover:bg-white/15 hover:text-white compatto:h-11 compatto:w-11"><X size={20} /></button>
        </header>
        <div className="scroll-sottile min-h-0 flex-1 overflow-y-auto px-6 py-4 tel:px-4">
          {scheda === 'impostazioni' ? (
            <div className="divide-y divide-white/10 testo-ui">
              <div>
                <div className="pb-1 text-[11px] uppercase tracking-[0.16em] text-white/45">Audio</div>
                <Cursore etichetta="Volume della voce" chiave="volumeVoce" />
                <Cursore etichetta="Volume del sottofondo" chiave="volumeSottofondo" />
                <Interruttore etichetta="Sottotitoli" aiuto="Mostra il testo della voce narrante in basso." chiave="sottotitoli" />
              </div>
              <div className="pt-3">
                <div className="pb-1 text-[11px] uppercase tracking-[0.16em] text-white/45">Lettura e comfort</div>
                <div className="flex items-center gap-4 py-2.5 tel:flex-wrap tel:gap-y-2">
                  <span className="w-44 shrink-0 text-[14px] text-white/85 tel:w-full">Dimensione del testo</span>
                  <div role="radiogroup" aria-label="Dimensione del testo" className="flex flex-1 gap-1.5">
                    {DIM.map((d) => (
                      <button key={d.v} role="radio" aria-checked={dim === d.v} onClick={() => preferenze.set({ dimensioneTesto: d.v })}
                        className={`flex-1 rounded-lg border px-2 py-1.5 text-[13px] compatto:min-h-11 ${dim === d.v ? 'border-cyan-300/60 bg-cyan-300/15 text-cyan-100' : 'border-white/15 text-white/70 hover:bg-white/10'}`}>{d.n}</button>
                    ))}
                  </div>
                </div>
                <Interruttore etichetta="Alto contrasto" aiuto="Pannelli più opachi, testi più chiari, bordi più netti." chiave="altoContrasto" />
                <Interruttore etichetta="Riduci le animazioni" aiuto="Spegne gli zoom lenti e le pulsazioni, accorcia le transizioni." chiave="riduciAnimazioni" />
              </div>
              <div className="pt-3">
                <div className="pb-1 text-[11px] uppercase tracking-[0.16em] text-white/45">Esplorazione</div>
                <Interruttore etichetta="Salta i voli tra i moduli" aiuto="Ogni spostamento è un viaggio rapido: si arriva subito, senza video." chiave="saltaVoli" />
                <Interruttore etichetta="Tremolio nella capsula di rientro" aiuto="Leggera vibrazione della visuale durante la discesa." chiave="tremolioCapsula" />
                <Interruttore
                  etichetta={testoDiretta('impostazioneTitolo', 'Cupola: vista in diretta dalla ISS')}
                  aiuto={testoDiretta('impostazioneDescrizione', 'Nella Cupola, al posto del video registrato, la diretta ufficiale NASA della Terra dalla ISS (serve la connessione). Se non è disponibile, torna al video.')}
                  chiave="cupolaDiretta"
                />
              </div>
              <div className="pt-4">
                <button onClick={() => preferenze.reset()} className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/10"><RotateCcw size={14} /> Ripristina predefinite</button>
                <div className="mt-4 text-[11px] tracking-wider text-white/35">ISS — Inside the Physics · versione {__APP_VERSION__}</div>
              </div>
            </div>
          ) : (
            <ContenutoCrediti />
          )}
        </div>
      </aside>
    </div>
  )
}
