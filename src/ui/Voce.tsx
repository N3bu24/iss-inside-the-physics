import { useEffect, useMemo, useRef, useState } from 'react'
import { Captions, FileText, RotateCcw } from 'lucide-react'
import type { Luogo } from '../data/esempio-hotspot'
import { assetExists } from '../lib/assets'
import AudioToggle from '../components/AudioToggle'

const urlAudio = (id: string) => `/audio/luoghi/${id}.mp3`
const ascoltati = new Set<string>()

export interface Cue { start: number; end: number; text: string }
const PAROLE_AL_SEC = 2.8
const MIN_CUE = 2.5
const MAX_PAROLE = 20
const MIN_PAROLE = 12

/** Blocchi da 1-2 righe (circa 12-20 parole), durata nominale ~2,8 parole/s (min 2,5 s), poi scalata sulla durata reale dell'audio. */
export function cuesDi(testo: string, durata: number): Cue[] {
  const frasi = testo.match(/[^.!?…]+[.!?…]+["»”]?\s*|[^.!?…]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [testo]
  // 1) spezza le frasi lunghe in pezzi bilanciati, preferendo le virgole
  const pezzi: string[][] = []
  for (const f of frasi) {
    const w = f.split(/\s+/)
    if (w.length <= MAX_PAROLE) { pezzi.push(w); continue }
    const n = Math.ceil(w.length / MAX_PAROLE), dim = w.length / n
    let da = 0
    for (let k = 1; k <= n; k++) {
      let fine = k === n ? w.length : Math.round(dim * k)
      if (k < n) for (let d = 0; d <= 3; d++) { const c = [fine + d, fine - d].find((i) => i > da + 4 && i < w.length && /[,;:]$/.test(w[i - 1])); if (c) { fine = c; break } }
      pezzi.push(w.slice(da, fine)); da = fine
    }
  }
  // 2) unisce i pezzi troppo corti fino a ~20 parole
  const blocchi: string[][] = []
  for (const p of pezzi) {
    const u = blocchi[blocchi.length - 1]
    if (u && u.length < MIN_PAROLE && u.length + p.length <= MAX_PAROLE) u.push(...p); else blocchi.push([...p])
  }
  // 3) durate proporzionali al testo, adattate all'audio reale
  const nominali = blocchi.map((b) => Math.max(MIN_CUE, b.length / PAROLE_AL_SEC))
  const tot = nominali.reduce((a, b) => a + b, 0) || 1
  const k = durata > 0 ? durata / tot : 1
  let t = 0
  return blocchi.map((b, i) => { const d = nominali[i] * k; const c = { start: t, end: t + d, text: b.join(' ') }; t += d; return c })
}


/**
 * Una sola clip breve per luogo (public/audio/luoghi/<id>.mp3), riprodotta una volta per visita; se il file non esiste tace.
 * Sottotitoli (dal testo `voce` del luogo) e trascrizione sempre disponibili. Va montato con key={luogo.id}.
 */
export default function Voce({ luogo, audioOn, onAudio, schedaAperta = false }: { luogo: Luogo; audioOn: boolean; onAudio: () => void; schedaAperta?: boolean }) {
  const audio = useRef<HTMLAudioElement>(null)
  const [esiste, setEsiste] = useState(false)
  const [suona, setSuona] = useState(false)
  const [t, setT] = useState(0)
  const [dur, setDur] = useState(0)
  const [cc, setCc] = useState(true)
  const [trans, setTrans] = useState(false)
  const [giro, setGiro] = useState(0)

  useEffect(() => {
    let vivo = true
    assetExists(urlAudio(luogo.id)).then((ok) => {
      if (!vivo) return
      setEsiste(ok)
      if (ok && !ascoltati.has(luogo.id)) { ascoltati.add(luogo.id); setSuona(true) }
    })
    return () => { vivo = false }
  }, [luogo.id])

  const cues = useMemo(() => (luogo.voce && dur ? cuesDi(luogo.voce, dur) : []), [luogo.voce, dur])
  const corrente = suona ? (cues.find((c) => t >= c.start && t < c.end)?.text ?? '') : ''

  return (
    <>
      {esiste && suona && (
        <audio
          key={giro} ref={audio} src={urlAudio(luogo.id)} autoPlay muted={!audioOn} preload="auto"
          onLoadedMetadata={() => setDur(audio.current?.duration ?? 0)}
          onTimeUpdate={() => setT(audio.current?.currentTime ?? 0)}
          onEnded={() => setSuona(false)}
        />
      )}
      {cc && corrente && (
        <div className="pointer-events-none absolute bottom-[5.6rem] left-[23rem] z-30 flex justify-center" style={{ right: schedaAperta ? '31.5rem' : '23rem' }}>
          <div className="fade-in max-w-[760px] rounded-lg bg-black/80 px-5 py-2.5 text-center text-[16px] font-medium leading-snug text-white shadow-lg">{corrente}</div>
        </div>
      )}
      {trans && (
        <div className="glass slide-in scroll-sottile absolute bottom-16 right-4 z-30 max-h-64 w-80 overflow-y-auto rounded-2xl p-4 text-sm leading-relaxed text-white/80">
          <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/45">{luogo.nome}</div>
          <p>{luogo.voce ?? 'Per questo luogo non c\'è una voce: leggi la scheda e tocca i punti luminosi.'}</p>
          {esiste && (
            <button onClick={() => { setT(0); setDur(0); setSuona(true); setGiro(giro + 1) }} className="mt-3 flex items-center gap-1.5 text-xs text-cyan-200 hover:underline">
              <RotateCcw size={12} /> Riascolta
            </button>
          )}
        </div>
      )}
      <div className="absolute bottom-5 right-4 z-30 flex items-center gap-2">
        <button onClick={() => setCc(!cc)} aria-pressed={cc} title="Sottotitoli" className={`glass rounded-full p-2.5 ${cc ? 'text-cyan-200' : 'text-white/50'}`}><Captions size={16} /></button>
        <button onClick={() => setTrans(!trans)} aria-pressed={trans} title="Trascrizione" className={`glass rounded-full p-2.5 ${trans ? 'text-cyan-200' : 'text-white/70'}`}><FileText size={16} /></button>
        <AudioToggle on={audioOn} onToggle={onAudio} />
      </div>
    </>
  )
}
