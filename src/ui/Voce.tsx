import { useEffect, useMemo, useRef, useState } from 'react'
import { Captions, FileText, RotateCcw } from 'lucide-react'
import type { Luogo } from '../data/esempio-hotspot'
import { assetExists } from '../lib/assets'
import AudioToggle from '../components/AudioToggle'

const urlAudio = (id: string) => `/audio/luoghi/${id}.mp3`
const ascoltati = new Set<string>()

interface Cue { start: number; end: number; text: string }
function cuesDi(testo: string, durata: number): Cue[] {
  const frasi = testo.match(/[^.!?…]+[.!?…]+["»”]?\s*|[^.!?…]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [testo]
  const tot = frasi.reduce((n, f) => n + f.length, 0) || 1
  let t = 0
  return frasi.map((f) => { const d = (f.length / tot) * durata; const c = { start: t, end: t + d, text: f }; t += d; return c })
}

/**
 * Una sola clip breve per luogo (public/audio/luoghi/<id>.mp3), riprodotta una volta per visita; se il file non esiste tace.
 * Sottotitoli (dal testo `voce` del luogo) e trascrizione sempre disponibili. Va montato con key={luogo.id}.
 */
export default function Voce({ luogo, audioOn, onAudio }: { luogo: Luogo; audioOn: boolean; onAudio: () => void }) {
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
        <div className="fade-in pointer-events-none absolute bottom-[9.5rem] left-1/2 z-30 w-[min(720px,90vw)] -translate-x-1/2 rounded-lg bg-black/60 px-4 py-2 text-center text-base backdrop-blur">
          {corrente}
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
