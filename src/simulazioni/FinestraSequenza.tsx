import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Minus, Pause, Play, X, Maximize2 } from 'lucide-react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { assetExists } from '../lib/assets'
import Badge from '../components/Badge'
import Stile from './Stile'
import type { Passo } from './contenuto'

function Formula({ tex }: { tex: string }) {
  const html = useMemo(() => katex.renderToString(tex, { displayMode: true, throwOnError: false }), [tex])
  return <div className="sim-formula text-white" dangerouslySetInnerHTML={{ __html: html }} />
}

function Video({ src }: { src: string }) {
  const [ok, setOk] = useState(false)
  useEffect(() => {
    setOk(false)
    let vivo = true
    assetExists(src).then((e) => vivo && setOk(e))
    return () => {
      vivo = false
    }
  }, [src])
  if (!ok) return null
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/50">
      <video key={src} src={src} autoPlay loop muted playsInline preload="metadata" className="block h-[22vh] max-h-[260px] w-full object-cover" />
    </div>
  )
}

/**
 * Finestra centrale della sequenza a passi: titolo, 2-4 righe, formula facoltativa, video del fenomeno,
 * Avanti/Indietro e avanzamento automatico. La scena 3D resta visibile intorno.
 */
export default function FinestraSequenza(p: {
  titolo: string
  passi: Passo[]
  indice: number
  onIndice: (i: number) => void
  onChiudi: () => void
}) {
  const { passi, indice, onIndice } = p
  const passo = passi[indice]
  const [auto, setAuto] = useState(false)
  const [ridotta, setRidotta] = useState(false)
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
    <div
      className="sim-win glass absolute bottom-5 left-1/2 z-40 flex w-[46%] min-w-[500px] max-w-[760px] flex-col overflow-hidden rounded-2xl text-white"
      role="dialog"
      aria-label={p.titolo}
    >
      <Stile />
      <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.04] px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="min-w-0 flex-1 truncate text-center text-xs font-medium uppercase tracking-[0.16em] text-white/70">
          {p.titolo} · passo {indice + 1} di {passi.length}
        </span>
        <button onClick={() => setRidotta(!ridotta)} className="text-white/60 hover:text-white" aria-label={ridotta ? 'Ingrandisci' : 'Riduci'}>
          {ridotta ? <Maximize2 size={15} /> : <Minus size={16} />}
        </button>
        <button onClick={p.onChiudi} className="text-white/60 hover:text-white" aria-label="Chiudi la sequenza">
          <X size={16} />
        </button>
      </div>
      {!ridotta && (
        <>
          <div key={indice} className="fade-in sim-scroll flex max-h-[48vh] flex-col gap-3 px-6 py-5">
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
          <div className="flex items-center gap-3 border-t border-white/10 px-4 py-3">
            <button
              onClick={() => onIndice(Math.max(0, indice - 1))}
              disabled={indice === 0}
              className="btn-ghost flex items-center gap-1 !px-4 !py-2 text-sm disabled:opacity-30"
            >
              <ChevronLeft size={16} /> Indietro
            </button>
            <button
              onClick={() => setAuto(!auto)}
              className={'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ' + (auto ? 'border-cyan-300/70 text-cyan-200' : 'border-white/20 text-white/60')}
              aria-pressed={auto}
            >
              {auto ? <Pause size={13} /> : <Play size={13} />} Automatico
            </button>
            <div className="flex flex-1 justify-center gap-1.5">
              {passi.map((_, i) => (
                <button
                  key={i}
                  onClick={() => onIndice(i)}
                  aria-label={`Passo ${i + 1}`}
                  className={'h-1.5 rounded-full transition-all ' + (i === indice ? 'w-6 bg-cyan-300' : 'w-1.5 bg-white/25 hover:bg-white/50')}
                />
              ))}
            </div>
            {ultimo ? (
              <button onClick={p.onChiudi} className="btn-primary flex items-center gap-1 !px-5 !py-2 text-sm">
                Fine
              </button>
            ) : (
              <button onClick={() => onIndice(indice + 1)} className="btn-primary flex items-center gap-1 !px-5 !py-2 text-sm">
                Avanti <ChevronRight size={16} />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
