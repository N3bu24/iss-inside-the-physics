import { useState } from 'react'
import IntroScreen from './components/IntroScreen'
import Esplora from './explore/Esplora'

type Fase = 'intro' | 'visita'

/**
 * Introduzione + esplorazione. L'esplorazione resta montata sotto l'introduzione, così il primo panorama
 * si carica mentre si legge la schermata iniziale; tornando all'introduzione la visita riparte da capo.
 */
export default function App() {
  const [fase, setFase] = useState<Fase>('intro')
  const [guidata, setGuidata] = useState(true)
  const [audioOn, setAudioOn] = useState(true)
  const [giro, setGiro] = useState(0)

  const avvia = (g: boolean) => { setGuidata(g); setFase('visita') }
  const home = () => { setFase('intro'); setGiro((x) => x + 1) }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Esplora key={giro} attivo={fase === 'visita'} guidataIniziale={guidata} audioOn={audioOn} onAudio={() => setAudioOn(!audioOn)} onHome={home} />
      {fase === 'intro' && (
        <IntroScreen audioOn={audioOn} onAudio={() => setAudioOn(!audioOn)} onGuided={() => avvia(true)} onFree={() => avvia(false)} />
      )}
    </div>
  )
}
