import { useState } from 'react'
import { crediti, creditiAltri } from '../data/crediti'

/** Riga di credito discreta (basso a destra) + link "Crediti" che apre l'elenco completo. */
export default function Crediti({ credito }: { credito?: string }) {
  const [aperto, setAperto] = useState(false)
  return (
    <>
      <div className="credito-linea absolute bottom-1 right-4 z-30 flex items-center gap-2">
        {credito && <span key={credito} className="fade-in pointer-events-none">{credito}</span>}
        {credito && <span aria-hidden>·</span>}
        <button onClick={() => setAperto(true)} className="underline decoration-white/30 underline-offset-2 hover:text-white">Crediti</button>
      </div>
      {aperto && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/50 p-6" onClick={() => setAperto(false)}>
          <aside className="glass fade-in relative max-h-[85vh] w-[min(760px,94vw)] overflow-y-auto rounded-2xl p-7" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setAperto(false)} aria-label="Chiudi" className="absolute right-4 top-3 text-xl text-white/60 hover:text-white">×</button>
            <h2 className="text-xl font-semibold">Crediti</h2>
            <p className="mt-1 text-sm text-white/55">Panorami e fotografie</p>
            <ul className="mt-3 space-y-3">
              {crediti.map((c) => (
                <li key={c.file} className="border-t border-white/10 pt-3 text-sm">
                  <div className="font-medium text-white/90">{c.soggetto}</div>
                  <div className="text-white/70">{c.credito}</div>
                  <div className="text-xs text-white/45">{c.fonte} · {c.licenza}</div>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-white/55">Altro</p>
            <ul className="mt-3 space-y-3">
              {creditiAltri.map((c) => (
                <li key={c.titolo} className="border-t border-white/10 pt-3 text-sm">
                  <div className="font-medium text-white/90">{c.titolo}</div>
                  <div className="text-white/70">{c.testo}</div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </>
  )
}
