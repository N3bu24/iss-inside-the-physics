import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import IntroScreen from './components/IntroScreen'
import IntestazioneAutore from './ui/IntestazioneAutore'
import { avviaAmbient } from './lib/ambient'
import { audioGlobale } from './lib/audioGlobale'
import { useApplicaPreferenze } from './lib/applicaPreferenze'
import type { Richiesta } from './explore/Esplora'
import type { NodoId } from './data/stazione'
import type { SchedaImpostazioni } from './ui/Impostazioni'

/** L'esplorazione (Photo Sphere Viewer, contenuti, hotspot) si carica in un chunk a parte, subito dopo l'intro. */
const Esplora = lazy(() => import('./explore/Esplora'))
/** Indice e impostazioni si caricano solo quando servono. */
const Indice = lazy(() => import('./ui/Indice'))
const Impostazioni = lazy(() => import('./ui/Impostazioni'))
const SimulazioneOverlay = lazy(() => import('./ui/Simulazioni'))

type Fase = 'intro' | 'visita'
type Pannello = { tipo: 'indice' } | { tipo: 'impostazioni'; scheda: SchedaImpostazioni } | null

/**
 * Introduzione + esplorazione. L'esplorazione resta montata sotto l'introduzione, così il primo panorama
 * si carica mentre si legge la schermata iniziale; tornando all'introduzione la visita riparte da capo.
 * L'intestazione con il nome dell'autore sta qui, sopra a tutto: la vedono intro, esplorazione, EML, ambienti, simulazioni e Cupola.
 * Anche l'Indice e le Impostazioni stanno qui: si aprono dall'introduzione e dall'esplorazione.
 */
export default function App() {
  const [fase, setFase] = useState<Fase>('intro')
  const [audioOn, setAudioOn] = useState(true)
  const [giro, setGiro] = useState(0)
  const [pannello, setPannello] = useState<Pannello>(null)
  const [richiesta, setRichiesta] = useState<Richiesta | null>(null)
  const [simulazione, setSimulazione] = useState<string | null>(null)
  useApplicaPreferenze()

  // il sottofondo segue il pulsante audio (parte solo dopo "Inizia l'esplorazione", per le regole di autoplay)
  // (il muto e` applicato subito da audioGlobale.set, senza attendere il rendering: qui si aggiorna solo l'interfaccia)
  useEffect(() => audioGlobale.ascolta(() => setAudioOn(audioGlobale.get())), [])

  const home = () => { setFase('intro'); setGiro((x) => x + 1); setRichiesta(null) }
  const apriIndice = useCallback(() => setPannello({ tipo: 'indice' }), [])
  const apriImpostazioni = useCallback(() => setPannello({ tipo: 'impostazioni', scheda: 'impostazioni' }), [])
  const apriCrediti = useCallback(() => setPannello({ tipo: 'impostazioni', scheda: 'crediti' }), [])
  const chiudi = useCallback(() => setPannello(null), [])

  /** "Vai" dell'Indice: chiude l'indice, avvia la visita se si e` ancora all'introduzione e chiede il viaggio rapido. */
  const vaiDaIndice = (nodo: NodoId, scheda?: string) => {
    setPannello(null)
    if (fase === 'intro') { avviaAmbient(); setFase('visita') }
    setRichiesta({ nodo, scheda, n: Date.now() })
  }

  // aggancio per le prove automatiche a più risoluzioni (solo in sviluppo)
  if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__app = { apriIndice, apriImpostazioni, chiudi, avvia: () => { avviaAmbient(); setFase('visita') } }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Suspense fallback={null}>
        <Esplora
          key={giro} attivo={fase === 'visita'} audioOn={audioOn} onAudio={audioGlobale.toggle} onHome={home}
          onIndice={apriIndice} onImpostazioni={apriImpostazioni} onCrediti={apriCrediti}
          bloccato={!!pannello} richiesta={richiesta} onRichiestaFatta={(n) => setRichiesta((r) => (r && r.n === n ? null : r))}
        />
      </Suspense>
      {fase === 'intro' && <IntroScreen audioOn={audioOn} onAudio={audioGlobale.toggle} onStart={() => { avviaAmbient(); setFase('visita') }} onIndice={apriIndice} onImpostazioni={apriImpostazioni} />}
      <Suspense fallback={null}>
        {pannello?.tipo === 'indice' && <Indice onClose={chiudi} onVai={vaiDaIndice} onSimulazione={setSimulazione} sospeso={!!simulazione} />}
        {pannello?.tipo === 'impostazioni' && <Impostazioni scheda={pannello.scheda} onClose={chiudi} />}
        {simulazione && <div className="absolute inset-0 z-[160]"><SimulazioneOverlay id={simulazione} onClose={() => setSimulazione(null)} /></div>}
      </Suspense>
      <IntestazioneAutore />
      <div aria-hidden className="pointer-events-none absolute bottom-[3px] left-1/2 z-[300] -translate-x-1/2 select-none text-[10px] tracking-wider text-white/35">v{__APP_VERSION__}</div>
    </div>
  )
}
