import { useEffect, useRef, useState } from 'react'
import { X, Play, Pause } from 'lucide-react'
import type { HotspotScheda } from '../data/types'
import { assetExists } from '../lib/assets'
import { collegaVoce } from '../lib/ambient'
import { iconaSim } from '../data/iconeSim'
import Badge from '../components/Badge'
import CorpoScheda from '../components/CorpoScheda'
import { CATEGORIE } from './Hotspot'

function Voce({ id, audioOn }: { id: string; audioOn: boolean }) {
  const [esiste, setEsiste] = useState(false)
  const [suona, setSuona] = useState(false)
  const a = useRef<HTMLAudioElement>(null)
  useEffect(() => { let vivo = true; assetExists(`/audio/poi/${id}.mp3`).then((ok) => vivo && setEsiste(ok)); return () => { vivo = false } }, [id])
  if (!esiste) return null
  return (
    <>
      <audio ref={a} src={`/audio/poi/${id}.mp3`} muted={!audioOn} onEnded={() => setSuona(false)} onPause={() => setSuona(false)} preload="none" />
      <button
        onClick={() => {
          if (suona) { a.current?.pause(); return }
          if (a.current) collegaVoce(a.current)
          a.current?.play().catch(() => {}); setSuona(true)
        }}
        className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
      >
        {suona ? <Pause size={12} /> : <Play size={12} />} {suona ? 'Pausa' : 'Ascolta'}
      </button>
    </>
  )
}

/**
 * Scheda del punto di interesse, pannello a destra (30 rem) in tre fasce: testata fissa (categoria, titolo, X),
 * corpo scorrevole (breve, immagini, paragrafi, formule, fonte), piede fisso (Avvia simulazione, Ascolta, badge).
 * Esc chiude la scheda.
 */
export default function HotspotCard({ scheda, audioOn = true, onClose, onSimulazione }: { scheda: HotspotScheda; audioOn?: boolean; onClose: () => void; onSimulazione?: (id: string) => void }) {
  const { Icon, colore, etichetta } = CATEGORIE[scheda.categoria]
  const sim = scheda.simulazione ? iconaSim(scheda.simulazione) : null

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])

  return (
    <aside
      key={scheda.id}
      className="glass slide-in pannello-opaco absolute bottom-24 right-4 top-[15.5rem] z-[31] flex w-[30rem] max-w-[94vw] flex-col overflow-hidden rounded-2xl"
      style={{ background: 'rgba(7,12,26,.95)' }}
    >
      <header className="flex shrink-0 items-start gap-3 border-b border-white/10 px-6 pb-3 pt-5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: colore }}>
            <Icon size={14} /> {etichetta}
          </div>
          <h2 className="mt-1.5 text-2xl font-semibold leading-tight">{scheda.titolo}</h2>
        </div>
        <button onClick={onClose} aria-label="Chiudi la scheda" title="Chiudi (Esc)" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 bg-white/5 text-white/80 hover:bg-white/15 hover:text-white">
          <X size={20} />
        </button>
      </header>

      <div className="scroll-sottile min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-4">
        <CorpoScheda scheda={scheda} colore={colore} />
      </div>

      <footer className="shrink-0 space-y-3 border-t border-white/10 px-6 pb-4 pt-3">
        {sim && scheda.simulazione && onSimulazione && (
          <button onClick={() => onSimulazione(scheda.simulazione!)} className="btn-primary flex w-full items-center justify-center gap-2 !py-2.5 text-[15px]">
            <sim.Icon size={18} /> Avvia simulazione · {sim.titolo}
          </button>
        )}
        <div className="flex flex-wrap items-center gap-2"><Badge tipo={scheda.badge} /><Voce id={scheda.id} audioOn={audioOn} /></div>
      </footer>
    </aside>
  )
}
