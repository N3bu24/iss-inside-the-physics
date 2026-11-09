import { tappe } from '../data/tour'

interface Props {
  indice: number
  guidata: boolean
  onPrev: () => void
  onNext: () => void
  onFree: () => void
  onResume: () => void
}

export default function TourBar({ indice, guidata, onPrev, onNext, onFree, onResume }: Props) {
  const t = tappe[indice]
  return (
    <div className="glass absolute bottom-5 left-1/2 z-30 w-[min(640px,92vw)] -translate-x-1/2 rounded-2xl px-5 py-3">
      <div className="mb-2 flex gap-1">
        {tappe.map((x, i) => (
          <div key={x.id} className="h-[3px] flex-1 rounded-full" style={{ background: i <= indice ? '#35e0ff' : 'rgba(255,255,255,.18)', opacity: guidata ? 1 : 0.5 }} />
        ))}
      </div>
      <div className="flex items-center justify-between gap-3">
        <button onClick={onPrev} disabled={indice === 0} className="rounded-full px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 disabled:opacity-30">← Indietro</button>
        <div className="min-w-0 flex-1 text-center">
          <div className="truncate text-sm font-medium">{t.titolo}</div>
          <div className="text-[11px] uppercase tracking-widest text-white/45">
            {guidata ? `Visita guidata · ${indice + 1} / ${tappe.length}` : 'Esplorazione libera'}
          </div>
        </div>
        <button onClick={onNext} disabled={indice === tappe.length - 1} className="rounded-full px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 disabled:opacity-30">Avanti →</button>
      </div>
      <div className="mt-2 text-center">
        {guidata ? (
          <button onClick={onFree} className="text-xs text-cyan-200/80 underline-offset-4 hover:underline">Esci in esplorazione libera</button>
        ) : (
          <button onClick={onResume} className="text-xs text-cyan-200/80 underline-offset-4 hover:underline">Riprendi la visita guidata</button>
        )}
      </div>
    </div>
  )
}
