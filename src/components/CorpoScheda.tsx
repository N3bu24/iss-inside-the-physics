import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { HotspotScheda } from '../data/types'
import Latex from './Latex'

function Immagine({ src, didascalia, credito }: { src: string; didascalia?: string; credito?: string }) {
  const [ok, setOk] = useState(true)
  if (!ok) return null
  return (
    <figure className="overflow-hidden rounded-xl border border-white/10 bg-black/30">
      <img src={src} alt={didascalia ?? ''} loading="lazy" onError={() => setOk(false)} className="max-h-60 w-full object-cover" />
      {(didascalia || credito) && (
        <figcaption className="px-3 py-2 text-[12px] leading-snug text-white/65">
          {didascalia}{credito && <span className="text-white/40"> · {credito}</span>}
        </figcaption>
      )}
    </figure>
  )
}

export function formuleDi(s: HotspotScheda) {
  return s.formule?.length ? s.formule : s.formula ? [{ latex: s.formula, spiegazione: undefined as string | undefined }] : []
}

/** Riga con la fonte e le slide della teoria. */
export function FonteScheda({ scheda, className = '' }: { scheda: HotspotScheda; className?: string }) {
  if (!scheda.fonte && scheda.slide_pptx.length === 0) return null
  return (
    <p className={`text-[11px] leading-snug text-white/45 ${className}`}>
      {scheda.fonte && <>Fonte: {scheda.fonte}</>}
      {scheda.slide_pptx.length > 0 && <>{scheda.fonte ? ' · ' : ''}Teoria: L'induzione elettromagnetica, slide {scheda.slide_pptx.join(', ')}</>}
    </p>
  )
}

/**
 * Corpo della scheda di un punto di interesse (breve, immagini, paragrafi o punti, formule, fonte).
 * Condiviso tra HotspotCard (pannello a destra) e Indice (testo completo).
 */
export default function CorpoScheda({ scheda, colore, conBreve = true, conFonte = true, formuleAperte: aperteIniziale = true }: { scheda: HotspotScheda; colore: string; conBreve?: boolean; conFonte?: boolean; formuleAperte?: boolean }) {
  const formule = formuleDi(scheda)
  const [formuleAperte, setFormuleAperte] = useState(aperteIniziale)
  const paragrafi = scheda.paragrafi?.length ? scheda.paragrafi : []
  return (
    <>
      {conBreve && scheda.breve && <p className="testo-corpo text-[15px] font-medium leading-snug text-white/85">{scheda.breve}</p>}

      {scheda.immagini && scheda.immagini.length > 0 && (
        <div className="mt-4 space-y-3">{scheda.immagini.map((im) => <Immagine key={im.src} {...im} />)}</div>
      )}

      {paragrafi.length > 0 ? (
        <div className="mt-4 space-y-3">
          {paragrafi.map((p, i) => <p key={i} className="testo-corpo text-[14.5px] leading-relaxed text-white/80">{p}</p>)}
        </div>
      ) : scheda.punti.length > 0 && (
        <ul className="mt-4 space-y-2">
          {scheda.punti.map((p, i) => (
            <li key={i} className="testo-corpo flex gap-2.5 text-[14px] leading-snug text-white/85">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: colore }} />{p}
            </li>
          ))}
        </ul>
      )}

      {formule.length > 0 && (
        <div className="mt-5 rounded-xl border border-cyan-300/20 bg-cyan-300/5">
          <button onClick={() => setFormuleAperte(!formuleAperte)} aria-expanded={formuleAperte} className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-cyan-200">
            {formule.length > 1 ? 'Formule' : 'Formula'} <ChevronDown size={16} className={`transition-transform ${formuleAperte ? 'rotate-180' : ''}`} />
          </button>
          {formuleAperte && (
            <div className="fade-in space-y-4 border-t border-cyan-300/15 px-4 py-3">
              {formule.map((f, i) => (
                <div key={i}>
                  <Latex tex={f.latex} />
                  {f.spiegazione && <p className="mt-1 text-[13px] leading-snug text-white/60">{f.spiegazione}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {conFonte && <FonteScheda scheda={scheda} className="mt-4" />}
    </>
  )
}
