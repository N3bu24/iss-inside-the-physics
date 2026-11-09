import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import type { HotspotScheda } from '../data/esempio-hotspot'
import Badge from '../components/Badge'
import Latex from '../components/Latex'
import { CATEGORIE } from './Hotspot'

/** Scheda compatta aperta dal clic su un hotspot: titolo, frase breve, punti, formula facoltativa, provenienza e fonte. */
export default function HotspotCard({ scheda, onClose }: { scheda: HotspotScheda; onClose: () => void }) {
  const [formula, setFormula] = useState(false)
  const { Icon, colore, etichetta } = CATEGORIE[scheda.categoria]
  return (
    <aside
      key={scheda.id}
      className="glass slide-in scroll-sottile absolute bottom-24 right-4 z-30 w-[23rem] max-w-[92vw] overflow-y-auto rounded-2xl p-6"
      style={{ maxHeight: 'calc(100vh - 25rem)', minHeight: '12rem' }}
    >
      <button onClick={onClose} aria-label="Chiudi" className="absolute right-3 top-3 rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white"><X size={18} /></button>
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: colore }}>
        <Icon size={14} /> {etichetta}
      </div>
      <h2 className="mt-2 pr-6 text-2xl font-semibold leading-tight">{scheda.titolo}</h2>
      <p className="mt-2 text-[15px] leading-snug text-white/80">{scheda.breve}</p>
      {scheda.punti.length > 0 && (
        <ul className="mt-4 space-y-2">
          {scheda.punti.map((p, i) => (
            <li key={i} className="flex gap-2.5 text-[14px] leading-snug text-white/85">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: colore }} />{p}
            </li>
          ))}
        </ul>
      )}
      {scheda.formula && (
        <div className="mt-4 rounded-xl border border-cyan-300/20 bg-cyan-300/5">
          <button onClick={() => setFormula(!formula)} className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-cyan-200">
            Formula <ChevronDown size={16} className={`transition-transform ${formula ? 'rotate-180' : ''}`} />
          </button>
          {formula && <div className="fade-in border-t border-cyan-300/15 px-4 py-2"><Latex tex={scheda.formula} /></div>}
        </div>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-2"><Badge tipo={scheda.badge} /></div>
      <p className="mt-3 text-[11px] leading-snug text-white/45">
        {scheda.fonte && <>Fonte: {scheda.fonte}</>}
        {scheda.slide_pptx.length > 0 && <>{scheda.fonte ? ' · ' : ''}Slide {scheda.slide_pptx.join(', ')} del pptx</>}
      </p>
    </aside>
  )
}
