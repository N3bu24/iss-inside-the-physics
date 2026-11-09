// Pagina di prova degli ambienti (solo sviluppo): http://localhost:<porta>/ambienti.html
// Apre direttamente un ambiente con ?a=campo|energia|levitazione|rmn
import { StrictMode, Suspense, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import { AMBIENTI } from './index'

function Demo() {
  const [aperto, setAperto] = useState<string | null>(new URLSearchParams(location.search).get('a'))
  const A = AMBIENTI.find((a) => a.id === aperto)
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-[#05070f] text-white">
      <h1 className="mb-4 text-2xl font-semibold">Ambienti interattivi · prova</h1>
      {AMBIENTI.map((a) => (
        <button key={a.id} className="btn-ghost w-96" onClick={() => setAperto(a.id)}>
          {a.titolo}
        </button>
      ))}
      {A && (
        <Suspense fallback={<div className="fixed inset-0 z-50 grid place-items-center bg-[#05070f]">Caricamento…</div>}>
          <A.Componente onClose={() => setAperto(null)} />
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
