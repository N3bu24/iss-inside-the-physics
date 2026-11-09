import { useEffect, useState } from 'react'
import { fenomeni } from '../data/tour'
import { assetExists } from '../lib/assets'
import Badge from './Badge'
import Latex from './Latex'

const videoUrl = (id: string) => `/video/fenomeni/${id}.mp4` // slot video Blender

/** livello di calore associato a ciascun fenomeno (guida il colore della sfera) */
export const caloreFenomeno: Record<string, number> = {
  'campo-variabile': 0.05, 'correnti-indotte': 0.25, joule: 0.7, fusione: 1, solidificazione: 0.3,
}

export default function FenomeniPanel({ attivo, onSelect }: { attivo: string | null; onSelect: (id: string | null) => void }) {
  const f = fenomeni.find((x) => x.id === attivo)
  const [hasVideo, setHasVideo] = useState(false)
  const [formula, setFormula] = useState(false)
  useEffect(() => {
    setFormula(false)
    setHasVideo(false)
    if (f) assetExists(videoUrl(f.id)).then(setHasVideo)
  }, [f])
  const col = (c: string) => (c === 'heat' ? '#ff8a2a' : '#35e0ff')

  return (
    <aside className="glass slide-in absolute left-4 top-4 bottom-24 z-30 flex w-[22rem] max-w-[90vw] flex-col rounded-2xl p-5">
      <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">Cosa succede nel campione</div>
      <ol className="mt-3 space-y-1">
        {fenomeni.map((x, i) => (
          <li key={x.id}>
            <button
              onClick={() => onSelect(attivo === x.id ? null : x.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${attivo === x.id ? 'bg-white/10 text-white' : 'text-white/65 hover:bg-white/5'}`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold text-black" style={{ background: col(x.colore) }}>{i + 1}</span>
              {x.titolo}
            </button>
          </li>
        ))}
      </ol>
      {f ? (
        <div key={f.id} className="fade-in mt-4 flex-1 overflow-y-auto border-t border-white/10 pt-4">
          <div className="aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/40">
            {hasVideo ? (
              <video src={videoUrl(f.id)} controls autoPlay loop muted playsInline preload="metadata" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-xs text-white/45"
                style={{ background: `radial-gradient(circle at 50% 50%, ${col(f.colore)}22, transparent 70%)` }}>
                Simulazione video in arrivo
                <span className="text-[10px] text-white/30">{videoUrl(f.id)}</span>
              </div>
            )}
          </div>
          <div className="mt-2"><Badge tipo="simulazione" /></div>
          <p className="mt-3 text-sm leading-relaxed text-white/80">{f.testo}</p>
          {(f.approfondimento ?? f.latex) && (
            <div className="mt-3 rounded-xl border border-cyan-300/20 bg-cyan-300/5">
              <button onClick={() => setFormula(!formula)} className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-cyan-200">
                Approfondimento <span className={formula ? 'rotate-180' : ''}>⌄</span>
              </button>
              {formula && <div className="fade-in border-t border-cyan-300/15 px-4 py-2">{f.approfondimento ? <Latex tex={f.approfondimento} misto /> : <Latex tex={f.latex!} />}</div>}
            </div>
          )}
        </div>
      ) : (
        <p className="mt-4 border-t border-white/10 pt-4 text-sm text-white/50">
          Scegli un fenomeno per vederlo nel modello. Trascina per ruotare, scorri per avvicinarti, tocca i punti luminosi per i dettagli.
        </p>
      )}
    </aside>
  )
}
