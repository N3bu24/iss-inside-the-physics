import { useCallback, useEffect, useRef, useState } from 'react'
import { tappe } from './data/tour'
import { caricaContenuti } from './data/loader'
import IntroScreen from './components/IntroScreen'
import PanoViewer from './components/PanoViewer'
import EmlScene from './components/EmlScene'
import FenomeniPanel, { caloreFenomeno } from './components/FenomeniPanel'
import HotspotPanel from './components/HotspotPanel'
import MiniMap from './components/MiniMap'
import TourBar from './components/TourBar'
import AudioToggle from './components/AudioToggle'
import Narrator from './components/Narrator'
import { assetExists } from './lib/assets'

type Fase = 'intro' | 'visita'

export default function App() {
  const [fase, setFase] = useState<Fase>('intro')
  const [guidata, setGuidata] = useState(true)
  const [indice, setIndice] = useState(0)
  const [hotspotId, setHotspotId] = useState<string | null>(null)
  const [fenomeno, setFenomeno] = useState<string | null>(null)
  const [audioOn, setAudioOn] = useState(true)
  const [dissolvenza, setDissolvenza] = useState(false)
  const [, setTick] = useState(0)
  const ambient = useRef<HTMLAudioElement | null>(null)

  useEffect(() => { caricaContenuti().then(() => setTick((n) => n + 1)) }, [])

  // ambient: public/audio/ambient.mp3 (opzionale)
  useEffect(() => {
    assetExists('/audio/ambient.mp3').then((ok) => {
      if (!ok) return
      const a = new Audio('/audio/ambient.mp3'); a.loop = true; a.volume = 0.25
      ambient.current = a
    })
  }, [])
  useEffect(() => {
    const a = ambient.current
    if (!a) return
    if (audioOn && fase === 'visita') a.play().catch(() => {}); else a.pause()
  }, [audioOn, fase])

  const tappa = tappe[indice]

  const vaiA = useCallback((i: number) => {
    if (i < 0 || i >= tappe.length || i === indice) return
    setHotspotId(null)
    const cambioTipo = (tappe[i].tipo === 'scena3d') !== (tappe[indice].tipo === 'scena3d')
    if (cambioTipo) {
      setDissolvenza(true)
      setTimeout(() => { setIndice(i); setFenomeno(null); setTimeout(() => setDissolvenza(false), 150) }, 600)
    } else {
      setIndice(i)
    }
  }, [indice])

  const vaiAId = (id: string) => vaiA(tappe.findIndex((t) => t.id === id))
  const hotspot = tappa.hotspot.find((h) => h.id === hotspotId) ?? null
  const is3d = tappa.tipo === 'scena3d'

  const avvia = (g: boolean) => { setGuidata(g); setFase('visita') }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {fase === 'visita' && (
        <>
          {is3d ? (
            <EmlScene
              hotspot={tappa.hotspot}
              attivo={hotspotId}
              calore={fenomeno ? caloreFenomeno[fenomeno] : null}
              onHotspot={setHotspotId}
            />
          ) : (
            <PanoViewer tappa={tappa} onHotspot={setHotspotId} onNavigate={vaiAId} />
          )}

          {is3d && <FenomeniPanel attivo={fenomeno} onSelect={setFenomeno} />}
          <MiniMap moduloCorrente={tappa.modulo} onSelect={(id) => { setGuidata(false); vaiAId(id) }} />
          {hotspot && <HotspotPanel hotspot={hotspot} onClose={() => setHotspotId(null)} />}

          <div key={tappa.id} className="fade-in pointer-events-none absolute left-1/2 top-6 z-20 -translate-x-1/2 text-center" style={{ marginLeft: is3d ? '10rem' : 0 }}>
            <h2 className="text-2xl font-light tracking-tight drop-shadow">{tappa.titolo}</h2>
            {tappa.sottotitolo && <p className="mt-1 text-sm text-white/55">{tappa.sottotitolo}</p>}
          </div>

          <Narrator tappa={tappa} audioOn={audioOn} />
          <TourBar
            indice={indice}
            guidata={guidata}
            onPrev={() => vaiA(indice - 1)}
            onNext={() => vaiA(indice + 1)}
            onFree={() => setGuidata(false)}
            onResume={() => setGuidata(true)}
          />
          <div className="absolute bottom-5 right-4 z-30">
            <AudioToggle on={audioOn} onToggle={() => setAudioOn(!audioOn)} />
          </div>
          <button
            onClick={() => setFase('intro')}
            className="glass absolute left-4 top-4 z-20 rounded-full px-3 py-1.5 text-xs text-white/60 hover:text-white"
            style={{ display: is3d ? 'none' : undefined }}
          >
            ISS — Inside the Physics
          </button>
        </>
      )}

      <div className={`pointer-events-none absolute inset-0 z-50 bg-black transition-opacity duration-500 ${dissolvenza ? 'opacity-100' : 'opacity-0'}`} />

      {fase === 'intro' && (
        <IntroScreen audioOn={audioOn} onAudio={() => setAudioOn(!audioOn)} onGuided={() => avvia(true)} onFree={() => avvia(false)} />
      )}
    </div>
  )
}
