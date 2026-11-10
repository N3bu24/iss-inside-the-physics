import { useEffect, useState } from 'react'
import { ChevronUp, MapPin } from 'lucide-react'
import type { Luogo } from '../data/types'
import Badge from '../components/Badge'

const viste = new Set<string>()

/** Scheda del luogo mostrata all'arrivo: aperta alla prima visita, compressa nelle successive; sempre comprimibile. */
export default function SchedaLuogo({ luogo, iniziaChiusa = false, sempreAperta = false }: { luogo: Luogo; iniziaChiusa?: boolean; sempreAperta?: boolean }) {
  const [aperta, setAperta] = useState(() => sempreAperta || (!iniziaChiusa && !viste.has(luogo.id)))
  useEffect(() => { viste.add(luogo.id) }, [luogo.id])
  return (
    <div key={luogo.id} className="fade-in glass w-[21rem] max-w-[92vw] rounded-2xl compatto:w-full compatto:max-w-none compatto:!border-0 compatto:!bg-transparent compatto:!shadow-none compatto:!backdrop-blur-none">
      <button onClick={() => setAperta(!aperta)} className="flex w-full items-center gap-3 px-5 py-3 text-left" aria-expanded={aperta}>
        <MapPin size={16} className="shrink-0 text-cyan-200" />
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-semibold leading-tight">{luogo.nome}</span>
          {!aperta && <span className="block truncate text-xs text-white/50">{luogo.sottotitolo}</span>}
        </span>
        <ChevronUp size={18} className={`shrink-0 text-white/60 transition-transform ${aperta ? '' : 'rotate-180'}`} />
      </button>
      {aperta && (
        <div className="scroll-sottile max-h-[34vh] overflow-y-auto px-5 pb-5 compatto:max-h-none compatto:overflow-visible">
          <p className="text-sm text-white/65">{luogo.sottotitolo}</p>
          <ul className="mt-3 space-y-2">
            {luogo.punti.map((p, i) => (
              <li key={i} className="testo-corpo flex gap-2.5 text-[14px] leading-snug text-white/85">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />{p}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <span className="flex flex-wrap gap-1.5"><Badge tipo={luogo.badge} />{luogo.badgeExtra && <Badge tipo={luogo.badgeExtra} />}</span>
            {luogo.fonte && <span className="truncate text-[11px] text-white/40">Fonte: {luogo.fonte}</span>}
          </div>
          {luogo.nota && <p className="mt-2 text-[11px] leading-snug text-white/45">{luogo.nota}</p>}
        </div>
      )}
    </div>
  )
}
