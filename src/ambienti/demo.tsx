// Pagina di prova delle simulazioni (solo sviluppo): http://localhost:<porta>/ambienti.html
// Apre direttamente una simulazione con ?a=<id> (id nel registro src/simulazioni/index.ts) oppure ?a=eml per la scena EML.
import { StrictMode, Suspense, lazy, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import { SIMULAZIONI, componenteSimulazione } from '../simulazioni'

const EmlScene = lazy(() => import('../components/EmlScene'))

function Demo() {
  const [aperto, setAperto] = useState<string | null>(new URLSearchParams(location.search).get('a'))
  const A = aperto && aperto !== 'eml-nodo' ? componenteSimulazione(aperto) : null
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-[#05070f] text-white">
      <h1 className="mb-4 text-2xl font-semibold">Simulazioni · prova</h1>
      {SIMULAZIONI.map((a) => (
        <button key={a.id} className="btn-ghost w-96" onClick={() => setAperto(a.id)}>
          {a.titolo}
        </button>
      ))}
      <button className="btn-ghost w-96" onClick={() => setAperto('eml-nodo')}>
        Scena EML (Avvia esperimento)
      </button>
      {aperto === 'eml-nodo' && (
        <div className="fixed inset-0 z-50 bg-[#05070f]">
          <Suspense fallback={<div className="grid h-full place-items-center">Caricamento…</div>}>
            <EmlScene hotspot={[]} attivo={null} fenomeno={new URLSearchParams(location.search).get('f')} calore={Number(new URLSearchParams(location.search).get('h') ?? 'NaN') || null} onHotspot={() => {}} />
          </Suspense>
          <button className="btn-ghost absolute right-4 top-4 z-50 !py-1.5" onClick={() => setAperto(null)}>Chiudi</button>
        </div>
      )}
      {A && (
        <Suspense fallback={<div className="fixed inset-0 z-50 grid place-items-center bg-[#05070f]">Caricamento…</div>}>
          <A onClose={() => setAperto(null)} />
        </Suspense>
      )}
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Demo />
  </StrictMode>,
)
