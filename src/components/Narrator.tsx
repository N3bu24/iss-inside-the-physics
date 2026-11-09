import { useEffect, useRef, useState } from 'react'
import type { Tappa } from '../data/types'
import { assetExists, parseVtt, type Cue } from '../lib/assets'

/** Voce narrante per tappa + sottotitoli (.vtt) + trascrizione. Silenziosa se l'audio non esiste. */
export default function Narrator({ tappa, audioOn }: { tappa: Tappa; audioOn: boolean }) {
  const audio = useRef<HTMLAudioElement>(null)
  const [disponibile, setDisponibile] = useState(false)
  const [cues, setCues] = useState<Cue[]>([])
  const [corrente, setCorrente] = useState('')
  const [sub, setSub] = useState(true)
  const [trans, setTrans] = useState(false)

  useEffect(() => {
    setDisponibile(false); setCues([]); setCorrente('')
    if (tappa.audio) assetExists(tappa.audio).then(setDisponibile)
    if (tappa.sottotitoli) {
      assetExists(tappa.sottotitoli).then((ok) => { if (ok) fetch(tappa.sottotitoli!).then((r) => r.text()).then((s) => setCues(parseVtt(s))) })
    }
  }, [tappa])

  useEffect(() => {
    const a = audio.current
    if (!a) return
    if (audioOn && disponibile) { a.currentTime = 0; a.play().catch(() => {}) } else a.pause()
  }, [audioOn, disponibile, tappa])

  const onTime = () => {
    const t = audio.current?.currentTime ?? 0
    setCorrente(cues.find((c) => t >= c.start && t <= c.end)?.text ?? '')
  }
  const testoTrascrizione = tappa.trascrizione ?? (cues.length ? cues.map((c) => c.text).join(' ') : '')

  return (
    <>
      {disponibile && <audio ref={audio} src={tappa.audio} preload="auto" onTimeUpdate={onTime} onEnded={() => setCorrente('')} />}
      {sub && audioOn && corrente && (
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
          {testoTrascrizione || 'La narrazione di questo ambiente sarà disponibile a breve.'}
        </div>
      )}
    </>
  )
}
