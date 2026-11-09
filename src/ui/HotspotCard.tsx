import { useEffect, useRef, useState } from 'react'
import { X, ChevronDown, Play, Pause, FlaskConical } from 'lucide-react'
import type { HotspotScheda } from '../data/esempio-hotspot'
import { assetExists } from '../lib/assets'
import Badge from '../components/Badge'
import Latex from '../components/Latex'
import { CATEGORIE } from './Hotspot'

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

function Voce({ id, audioOn }: { id: string; audioOn: boolean }) {
  const [esiste, setEsiste] = useState(false)
  const [suona, setSuona] = useState(false)
  const a = useRef<HTMLAudioElement>(null)
  useEffect(() => { let vivo = true; assetExists(`/audio/poi/${id}.mp3`).then((ok) => vivo && setEsiste(ok)); return () => { vivo = false } }, [id])
  if (!esiste) return null
  return (
    <>
      <audio ref={a} src={`/audio/poi/${id}.mp3`} muted={!audioOn} onEnded={() => setSuona(false)} preload="none" />
      <button
        onClick={() => { if (suona) a.current?.pause(); else a.current?.play().catch(() => {}); setSuona(!suona) }}
        className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1 text-xs text-white/80 hover:bg-white/10"
      >
        {suona ? <Pause size={12} /> : <Play size={12} />} {suona ? 'Pausa' : 'Ascolta'}
      </button>
    </>
  )
}

/**
 * Scheda del punto di interesse, pannello a destra (30 rem). Formato esteso: paragrafi, immagini con didascalia, formule KaTeX in display
 * (pannello espandibile), pulsante "Avvia simulazione". Compatibile col formato breve (breve + punti + formula).
 */
export default function HotspotCard({ scheda, audioOn = true, onClose, onSimulazione }: { scheda: HotspotScheda; audioOn?: boolean; onClose: () => void; onSimulazione?: (id: string) => void }) {
  const formule = scheda.formule?.length ? scheda.formule : scheda.formula ? [{ latex: scheda.formula, spiegazione: undefined as string | undefined }] : []
  const [formuleAperte, setFormuleAperte] = useState(true)
  const { Icon, colore, etichetta } = CATEGORIE[scheda.categoria]
  const paragrafi = scheda.paragrafi?.length ? scheda.paragrafi : []
  return (
    <aside
      key={scheda.id}
      className="glass slide-in scroll-sottile absolute bottom-24 right-4 top-[15.5rem] z-[31] w-[30rem] max-w-[94vw] overflow-y-auto overflow-x-hidden rounded-2xl p-6"
    >
      <button onClick={onClose} aria-label="Chiudi" className="absolute right-3 top-3 rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white"><X size={18} /></button>
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: colore }}>
        <Icon size={14} /> {etichetta}
      </div>
      <h2 className="mt-2 pr-6 text-2xl font-semibold leading-tight">{scheda.titolo}</h2>
      <p className="mt-2 text-[15px] font-medium leading-snug text-white/85">{scheda.breve}</p>

      {scheda.immagini && scheda.immagini.length > 0 && (
        <div className="mt-4 space-y-3">{scheda.immagini.map((im) => <Immagine key={im.src} {...im} />)}</div>
      )}

      {paragrafi.length > 0 ? (
        <div className="mt-4 space-y-3">
          {paragrafi.map((p, i) => <p key={i} className="text-[14.5px] leading-relaxed text-white/80">{p}</p>)}
        </div>
      ) : scheda.punti.length > 0 && (
        <ul className="mt-4 space-y-2">
          {scheda.punti.map((p, i) => (
            <li key={i} className="flex gap-2.5 text-[14px] leading-snug text-white/85">
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

      {scheda.simulazione && onSimulazione && (
        <button onClick={() => onSimulazione(scheda.simulazione!)} className="btn-primary mt-5 flex w-full items-center justify-center gap-2 !py-3 text-[15px]">
          <FlaskConical size={18} /> Avvia simulazione
        </button>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2"><Badge tipo={scheda.badge} /><Voce id={scheda.id} audioOn={audioOn} /></div>
      <p className="mt-3 text-[11px] leading-snug text-white/45">
        {scheda.fonte && <>Fonte: {scheda.fonte}</>}
        {scheda.slide_pptx.length > 0 && <>{scheda.fonte ? ' · ' : ''}Slide {scheda.slide_pptx.join(', ')} del pptx</>}
      </p>
    </aside>
  )
}
