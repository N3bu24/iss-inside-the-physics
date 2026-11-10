import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import Badge from '../components/Badge'
import type { Passo } from './contenuto'

function Formula({ tex }: { tex: string }) {
  const html = useMemo(() => katex.renderToString(tex, { displayMode: true, throwOnError: false }), [tex])
  return <div className="sim-formula text-white" dangerouslySetInnerHTML={{ __html: html }} />
}

/** Video del fenomeno: si prova a caricarlo direttamente e lo si nasconde solo se il caricamento fallisce davvero. */
function Video({ src }: { src: string }) {
  const [errore, setErrore] = useState(false)
  useEffect(() => setErrore(false), [src])
  if (errore) return null
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/50">
      <video key={src} src={src} autoPlay loop muted playsInline preload="auto" onError={() => setErrore(true)} className="block aspect-video w-full object-cover" />
    </div>
  )
}

/**
 * Contenuto della colonna a passi: testo che scorre in alto, piede fisso con pallini e pulsanti
 * Indietro / Automatico / Avanti. Va messo dentro una colonna (`ColonnaShell`) con altezza definita.
 */
export default function FinestraSequenza(p: { passi: Passo[]; indice: number; onIndice: (i: number) => void; onChiudi: () => void }) {
  const { passi, indice, onIndice } = p
  const passo = passi[indice]
  const [auto, setAuto] = useState(false)
  const ultimo = indice >= passi.length - 1

  useEffect(() => {
    if (!auto || ultimo) return
    const t = setTimeout(() => onIndice(indice + 1), (passo?.durata ?? 14) * 1000)
    return () => clearTimeout(t)
  }, [auto, indice, ultimo, passo, onIndice])

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onIndice(Math.min(passi.length - 1, indice + 1))
      else if (e.key === 'ArrowLeft') onIndice(Math.max(0, indice - 1))
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [indice, passi.length, onIndice])

  if (!passo) return null
  return (
    <>
      <div key={indice} className="fade-in sim-scroll flex min-h-0 flex-1 flex-col gap-3 px-5 py-4">
        <h3 className="text-xl font-semibold leading-tight">
          <span className="mr-2 text-cyan-300">{indice + 1}.</span>
          {passo.titolo}
        </h3>
        {passo.video && <Video src={passo.video} />}
        <p className="text-[14px] leading-relaxed text-white/85">{passo.testo}</p>
        {passo.cosaSiVede && (
          <p className="border-l-2 border-cyan-300/60 pl-3 text-[13px] leading-relaxed text-white/65">
            <span className="text-cyan-200/90">Cosa si vede: </span>
            {passo.cosaSiVede}
          </p>
        )}
        {passo.formula && (
          <div className="rounded-lg bg-white/5 px-3 py-1">
            <Formula tex={passo.formula} />
          </div>
        )}
        <div>
          <Badge tipo="simulazione" />
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-2.5 border-t border-white/10 px-4 py-3">
        <div className="flex justify-center gap-1.5">
          {passi.map((_, i) => (
            <button
              key={i}
              onClick={() => onIndice(i)}
              aria-label={`Passo ${i + 1}`}
              className={'h-2 rounded-full transition-all ' + (i === indice ? 'w-7 bg-cyan-300' : 'w-2 bg-white/25 hover:bg-white/50')}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onIndice(Math.max(0, indice - 1))} disabled={indice === 0} className="btn-ghost flex items-center gap-1 !px-3.5 !py-2 text-sm disabled:opacity-30">
            <ChevronLeft size={16} /> Indietro
          </button>
          <button
            onClick={() => setAuto(!auto)}
            className={'flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs ' + (auto ? 'border-cyan-300/70 text-cyan-200' : 'border-white/20 text-white/60')}
            aria-pressed={auto}
          >
            {auto ? <Pause size={13} /> : <Play size={13} />} Automatico
          </button>
          <span className="flex-1" />
          {ultimo ? (
            <button onClick={p.onChiudi} className="btn-primary flex items-center gap-1 !px-5 !py-2 text-sm">
              Fine
            </button>
          ) : (
            <button onClick={() => onIndice(indice + 1)} className="btn-primary flex items-center gap-1 !px-4 !py-2 text-sm">
              Avanti <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </>
  )
}
