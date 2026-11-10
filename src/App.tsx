import { lazy, Suspense, useEffect, useState } from 'react'
import IntroScreen from './components/IntroScreen'
import IntestazioneAutore from './ui/IntestazioneAutore'
import { avviaAmbient, impostaAmbientAttivo } from './lib/ambient'

/** L'esplorazione (Photo Sphere Viewer, contenuti, hotspot) si carica in un chunk a parte, subito dopo l'intro. */
const Esplora = lazy(() => import('./explore/Esplora'))

type Fase = 'intro' | 'visita'

/**
 * Introduzione + esplorazione. L'esplorazione resta montata sotto l'introduzione, così il primo panorama
 * si carica mentre si legge la schermata iniziale; tornando all'introduzione la visita riparte da capo.
 * L'intestazione con il nome dell'autore sta qui, sopra a tutto: la vedono intro, esplorazione, EML, ambienti, simulazioni e Cupola.
 */
export default function App() {
  const [fase, setFase] = useState<Fase>('intro')
  const [audioOn, setAudioOn] = useState(true)
  const [giro, setGiro] = useState(0)

  // il sottofondo segue il pulsante audio (parte solo dopo "Inizia l'esplorazione", per le regole di autoplay)
  useEffect(() => { impostaAmbientAttivo(audioOn) }, [audioOn])

  const home = () => { setFase('intro'); setGiro((x) => x + 1) }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Suspense fallback={null}>
        <Esplora key={giro} attivo={fase === 'visita'} audioOn={audioOn} onAudio={() => setAudioOn(!audioOn)} onHome={home} />
      </Suspense>
      {fase === 'intro' && <IntroScreen audioOn={audioOn} onAudio={() => setAudioOn(!audioOn)} onStart={() => { avviaAmbient(); setFase('visita') }} />}
      <IntestazioneAutore />
    </div>
  )
}
