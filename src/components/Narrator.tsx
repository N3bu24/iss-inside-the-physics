import { useEffect, useMemo, useRef, useState } from 'react'
import type { Clip, Tappa } from '../data/types'
import { assetExists, type Cue } from '../lib/assets'

/** Divide il copione in frasi e distribuisce i tempi in proporzione alla lunghezza. */
function cuesDi(testo: string, durata: number): Cue[] {
  const frasi = testo.match(/[^.!?…]+[.!?…]+["»”]?\s*|[^.!?…]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [testo]
  const tot = frasi.reduce((n, f) => n + f.length, 0) || 1
  let t = 0
  return frasi.map((f) => {
    const d = (f.length / tot) * durata
    const c = { start: t, end: t + d, text: f }
    t += d
    return c
  })
}

interface Props {
  tappa: Tappa
  audioOn: boolean
  /** se presente, riproduce solo questa clip (es. fenomeno scelto nella scena 3D) */
  clipId?: string | null
}

/**
 * Voce narrante a clip (public/audio/<id-clip>.mp3), sottotitoli e trascrizione dal copione.
 * Se l'audio non esiste ancora, i sottotitoli scorrono comunque su una linea temporale simulata
 * (durata stimata del copione). Il pulsante audio silenzia la voce; i sottotitoli restano indipendenti (CC).
 * Va montato con key={tappa.id}.
 */
export default function Narrator({ tappa, audioOn, clipId = null }: Props) {
  const audio = useRef<HTMLAudioElement>(null)
  const clipPrecedente = useRef<string | null>(null)
  const coda: Clip[] = useMemo(() => (clipId ? tappa.clip.filter((c) => c.id === clipId) : tappa.clip), [tappa, clipId])
  const [i, setI] = useState(0)
  const [fine, setFine] = useState(false)
  const [disp, setDisp] = useState<boolean | null>(null)
  const [t, setT] = useState(0)
  const [dur, setDur] = useState(0)
  const [sub, setSub] = useState(true)
  const [trans, setTrans] = useState(false)

  const clip = coda[i]
  const avanti = () => (i < coda.length - 1 ? setI(i + 1) : setFine(true))

  useEffect(() => {
    // tornando dalla clip di un fenomeno non si ripete l'introduzione
    const tornato = clipId === null && clipPrecedente.current !== null
    clipPrecedente.current = clipId
    setI(0)
    setFine(tornato || coda.length === 0)
  }, [coda, clipId])

  useEffect(() => {
    setDisp(null); setT(0); setDur(0)
    if (!clip) return
    let vivo = true
    assetExists(clip.audio).then((ok) => vivo && setDisp(ok))
    return () => { vivo = false }
  }, [clip])

  // linea temporale simulata quando l'audio manca
  useEffect(() => {
    if (disp !== false || !clip || fine) return
    const inizio = Date.now()
    const id = setInterval(() => {
      const s = (Date.now() - inizio) / 1000
      setT(s)
      if (s >= clip.durata) { clearInterval(id); avanti() }
    }, 250)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disp, clip, fine])

  const cues = useMemo(() => (clip ? cuesDi(clip.testo, dur || clip.durata) : []), [clip, dur])
  const corrente = !fine && disp !== null ? (cues.find((c) => t >= c.start && t < c.end)?.text ?? '') : ''

  return (
    <>
      {disp && clip && !fine && (
        <audio
          key={clip.id}
          ref={audio}
          src={clip.audio}
          autoPlay
          muted={!audioOn}
          preload="auto"
          onLoadedMetadata={() => setDur(audio.current?.duration ?? 0)}
          onTimeUpdate={() => setT(audio.current?.currentTime ?? 0)}
          onEnded={avanti}
        />
      )}
      {sub && corrente && (
        <div className="fade-in pointer-events-none absolute bottom-[8.5rem] left-1/2 z-20 w-[min(720px,90vw)] -translate-x-1/2 rounded-lg bg-black/55 px-4 py-2 text-center text-base backdrop-blur">
          {corrente}
        </div>
      )}
      <div className="absolute bottom-5 left-4 z-30 flex gap-2">
        <button onClick={() => setSub(!sub)} className={`glass rounded-full px-3 py-1.5 text-xs ${sub ? 'text-cyan-200' : 'text-white/50'}`} title="Sottotitoli">CC</button>
        <button onClick={() => setTrans(!trans)} className="glass rounded-full px-3 py-1.5 text-xs text-white/70" title="Trascrizione">Trascrizione</button>
      </div>
      {trans && (
        <div className="glass slide-in absolute bottom-16 left-4 z-30 max-h-64 w-80 overflow-y-auto rounded-2xl p-4 text-sm leading-relaxed text-white/75">
          <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/45">{tappa.titolo}</div>
          {tappa.clip.length === 0
            ? 'Per questo ambiente non c’è narrazione: esplora e tocca i punti luminosi.'
            : tappa.clip.map((c) => (
                <p key={c.id} className={`mb-3 ${clip?.id === c.id && !fine ? 'text-white' : ''}`}>{c.testo}</p>
              ))}
        </div>
      )}
    </>
  )
}
