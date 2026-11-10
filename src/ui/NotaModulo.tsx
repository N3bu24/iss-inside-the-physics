import { useEffect } from 'react'
import { Lock, X } from 'lucide-react'
import { moduloChiusoPerId } from '../data/extra'
import { moduliMappa } from '../data/mappa'

/** Nota breve su un modulo non percorribile (mappa o lucchetto nel panorama). Testi da content/moduli-chiusi.json; se mancano resta il solo nome. */
export default function NotaModulo({ id, onClose }: { id: string; onClose: () => void }) {
  const m = moduloChiusoPerId(id)
  const nome = m?.nome || moduliMappa.find((x) => x.id === id)?.nome || id
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <aside role="dialog" aria-label={`Nota su ${nome}`} className="glass pannello-opaco fade-in absolute right-[17.5rem] top-4 z-[32] flex max-h-[60vh] w-[22rem] max-w-[60vw] flex-col overflow-hidden rounded-2xl" style={{ background: 'rgba(7,12,26,.95)' }}>
      <header className="flex shrink-0 items-start gap-3 border-b border-white/10 px-5 pb-3 pt-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-white/50"><Lock size={12} /> Non visitabile in questa esperienza</div>
          <h2 className="mt-1 text-xl font-semibold leading-tight">{nome}</h2>
          {m?.ruolo && <p className="mt-0.5 text-[13px] text-cyan-200">{m.ruolo}</p>}
        </div>
        <button onClick={onClose} aria-label="Chiudi la nota" title="Chiudi (Esc)" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/20 bg-white/5 text-white/80 hover:bg-white/15 hover:text-white"><X size={18} /></button>
      </header>
      {(m?.nota || m?.fonte) && (
        <div className="scroll-sottile min-h-0 flex-1 overflow-y-auto px-5 py-3">
          {m.nota && <p className="testo-corpo text-[14px] leading-relaxed text-white/80">{m.nota}</p>}
          {m.fonte && <p className="mt-3 text-[11px] leading-snug text-white/45">Fonte: {m.fonte}</p>}
        </div>
      )}
    </aside>
  )
}
