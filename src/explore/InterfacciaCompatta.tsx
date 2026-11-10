import { useCallback, useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import type { Luogo } from '../data/types'
import type { HotspotPosizionato } from '../data/contenuti'
import type { NodoId, Nodo } from '../data/stazione'
import HotspotCard from '../ui/HotspotCard'
import SchedaLuogo from '../ui/SchedaLuogo'
import ListaPunti, { type VocePunto } from '../ui/ListaPunti'
import MiniMappa from '../ui/MiniMappa'
import TappeBar from '../ui/TappeBar'
import NotaModulo from '../ui/NotaModulo'
import Voce from '../ui/Voce'
import Foglio from '../ui/Foglio'
import BarraCompatta from '../ui/BarraCompatta'
import Indicatore from './Indicatore'
import { LegendaGesti } from './Legenda'

let gestiMostrati = false

interface Props {
  nodo: Nodo
  nodoId: NodoId
  luogo: Luogo
  voci: VocePunto[]
  scheda: HotspotPosizionato | null
  precedente: NodoId | null
  visitati: Set<NodoId>
  volando: boolean
  occupato: boolean
  saltaVoli: boolean
  nascondi: boolean
  suggerimento: string | null
  nota: string | null
  audioOn: boolean
  onAudio: () => void
  onHome: () => void
  onIndice: () => void
  onImpostazioni: () => void
  onCrediti: () => void
  onNota: (id: string | null) => void
  onVai: (n: NodoId) => void
  onVaiA: (n: NodoId) => void
  onSaltaA: (n: NodoId) => void
  onAvanti: () => void
  onIndietro: () => void
  onScegliPunto: (id: string) => void
  onChiudiScheda: () => void
  onSimulazione: (id: string) => void
}

/**
 * Interfaccia dell'esplorazione per telefono e tablet (il desktop usa il layout originale in Esplora.tsx):
 * il panorama resta protagonista; in basso una barra compatta (Luogo, Mappa, Avanti, Audio, Altro), in alto a destra la miniatura
 * della mappa (si apre a schermo intero), scheda del luogo e scheda del punto come fogli dal basso (pannelli laterali in orizzontale),
 * sottotitoli e indicazioni «↑ verso …» in una colonna sopra la barra, mai sotto altri elementi.
 */
export default function InterfacciaCompatta(p: Props) {
  const [luogoAperto, setLuogoAperto] = useState(false)
  const [mappaPiena, setMappaPiena] = useState(false)
  const [trans, setTrans] = useState(false)
  const [gesti, setGesti] = useState(() => !gestiMostrati)
  const [zonaSott, setZonaSott] = useState<HTMLDivElement | null>(null)
  const chiudiGesti = useCallback(() => { gestiMostrati = true; setGesti(false) }, [])
  const mostraGesti = useCallback(() => setGesti(true), [])

  // la scheda di un punto sostituisce il foglio del luogo
  useEffect(() => { if (p.scheda) setLuogoAperto(false) }, [p.scheda])
  useEffect(() => { setLuogoAperto(false); setTrans(false) }, [p.nodoId])

  const daVedere = p.voci.filter((v) => !v.visto).length
  const eml = p.nodo.tipo === 'eml'
  const nomeBreve = p.nodo.nome.split(/\s*[—,]\s*/)[0]

  return (
    <>
      <div className={`transition-opacity duration-300 ${p.nascondi ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
        {/* etichetta del luogo (tocca per aprire la scheda) */}
        <button onClick={() => setLuogoAperto(true)} aria-label={`Scheda del luogo: ${nomeBreve}`}
          className="glass absolute left-2 top-7 z-30 flex max-w-[calc(100vw-9.5rem)] items-center gap-1.5 rounded-full py-1.5 pl-2.5 pr-3.5 text-[13px] font-medium text-white/90 active:bg-white/10 tab:max-w-[22rem]">
          <MapPin size={15} className="shrink-0 text-cyan-200" /><span className="truncate">{nomeBreve}</span>
        </button>

        {/* colonna sopra la barra: sottotitoli (in basso), indicazioni «verso…», suggerimento */}
        <div className="pointer-events-none absolute inset-x-2 z-30 mx-auto flex max-w-[34rem] flex-col-reverse items-center gap-2" style={{ bottom: 'calc(var(--barra-spazio) + .1rem)' }}>
          <div ref={setZonaSott} className="w-full empty:hidden" />
          <Indicatore precedente={p.precedente} laterale={eml} compatto onAvanti={p.onAvanti} onIndietro={p.onIndietro} />
          {p.nodoId === 'finale' && (
            <button onClick={p.onHome} className="btn-ghost pointer-events-auto min-h-11 !px-5 !py-2 text-sm">Ricomincia dall'inizio</button>
          )}
          {p.suggerimento && (
            <div className="fade-in rounded-full border border-white/20 bg-[rgba(4,8,20,.88)] px-4 py-1.5 text-center text-sm text-white/90">{p.suggerimento}</div>
          )}
        </div>

        {p.scheda && <HotspotCard scheda={p.scheda} audioOn={p.audioOn} onClose={p.onChiudiScheda} onSimulazione={p.onSimulazione} />}
        {gesti && !p.scheda && !luogoAperto && !trans && <LegendaGesti onChiudi={chiudiGesti} />}
        <BarraCompatta
          luogoAperto={luogoAperto} daVedere={daVedere} onLuogo={() => setLuogoAperto(!luogoAperto)} onMappa={() => setMappaPiena(true)} onAvanti={p.onAvanti}
          audioOn={p.audioOn} onAudio={p.onAudio} onIndice={p.onIndice} onImpostazioni={p.onImpostazioni} onHome={p.onHome} onCrediti={p.onCrediti}
          onComandi={mostraGesti} trans={trans} onTrans={() => setTrans(true)}
        />
        {luogoAperto && (
          <Foglio titolo="Questo luogo" onClose={() => setLuogoAperto(false)}>
            <SchedaLuogo key={p.nodo.id} luogo={p.luogo} sempreAperta />
            <div className="mt-2"><ListaPunti key={`l-${p.nodo.id}`} punti={p.voci} onScegli={(id) => { setLuogoAperto(false); p.onScegliPunto(id) }} /></div>
            {p.nodo.credito && <p className="credito-linea mt-3 px-2">{p.nodo.credito}</p>}
          </Foglio>
        )}
      </div>

      <MiniMappa
        corrente={p.nodoId} visitati={p.visitati} onVaiA={p.onVaiA} onSaltaA={p.onSaltaA} onNota={p.onNota} saltaVoli={p.saltaVoli} occupato={p.occupato}
        piena={mappaPiena} onPiena={setMappaPiena}
        tappe={<TappeBar corrente={p.nodoId} visitati={p.visitati} occupato={p.occupato} onVai={(n) => { setMappaPiena(false); p.onVai(n) }} />}
      />
      {p.nota && <NotaModulo key={p.nota} id={p.nota} onClose={() => p.onNota(null)} />}
      <Voce
        key={p.nodo.id} luogo={p.luogo} audioOn={p.audioOn} onAudio={p.onAudio} schedaAperta={!!p.scheda}
        compatto zonaSott={zonaSott} trans={trans} onTrans={setTrans}
      />
    </>
  )
}

