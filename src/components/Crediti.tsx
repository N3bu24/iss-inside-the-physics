import { crediti, creditiAltri } from '../data/crediti'
import { strumenti } from '../data/extra'

/** Riga di credito discreta (basso a destra) + link "Crediti" che apre il pannello Impostazioni sulla scheda Crediti. */
export default function Crediti({ credito, onApri }: { credito?: string; onApri: () => void }) {
  return (
    <div className="credito-linea absolute bottom-1 right-4 z-30 flex items-center gap-2">
      {credito && <span key={credito} className="fade-in pointer-events-none">{credito}</span>}
      {credito && <span aria-hidden>·</span>}
      <button onClick={onApri} className="underline decoration-white/30 underline-offset-2 hover:text-white">Crediti</button>
    </div>
  )
}

/** Contenuto della scheda "Crediti" del pannello Impostazioni: panorami e foto, altro, strumenti usati (raggruppati per categoria). */
export function ContenutoCrediti() {
  const gruppi = new Map<string, typeof strumenti>()
  for (const s of strumenti) gruppi.set(s.categoria, [...(gruppi.get(s.categoria) ?? []), s])
  return (
    <div className="testo-corpo">
      <p className="text-sm text-white/55">Panorami e fotografie</p>
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
      {gruppi.size > 0 && (
        <>
          <p className="mt-6 text-sm text-white/55">Strumenti usati</p>
          {[...gruppi.entries()].map(([cat, lista]) => (
            <div key={cat} className="mt-3">
              <div className="text-[11px] uppercase tracking-[0.16em] text-cyan-200/80">{cat}</div>
              <ul className="mt-1.5 space-y-2">
                {lista.map((s) => (
                  <li key={s.nome} className="border-t border-white/10 pt-2 text-sm">
                    <span className="font-medium text-white/90">{s.nome}</span>
                    {s.uso && <span className="text-white/65"> — {s.uso}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
