import { Suspense, lazy, useEffect } from 'react'
import { X } from 'lucide-react'

const EmlScene = lazy(() => import('../components/EmlScene'))

/** Simulazione "eml": la scena 3D dell'EML a tutto schermo con la sequenza "Avvia esperimento" già aperta. */
export default function SimulazioneEml({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 bg-[#05070f] text-white" role="dialog" aria-label="Esperimento EML">
      <Suspense fallback={<div className="grid h-full place-items-center text-xs uppercase tracking-[0.35em] text-white/45">Caricamento…</div>}>
        <EmlScene hotspot={[]} attivo={null} fenomeno={null} calore={null} onHotspot={() => {}} avviaSubito />
      </Suspense>
      <button onClick={onClose} className="glass absolute right-5 top-16 z-50 flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs hover:bg-white/15" aria-label="Chiudi (Esc)">
        <X size={14} /> Chiudi · Esc
      </button>
    </div>
  )
}
