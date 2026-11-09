import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import StarField from './StarField'
import AudioToggle from './AudioToggle'
import { assetExists } from '../lib/assets'

const VIDEO_SFONDO = '/video/intro-bg.mp4' // segnaposto: se esiste viene usato come sfondo

interface Props { audioOn: boolean; onAudio: () => void; onGuided: () => void; onFree: () => void }

export default function IntroScreen({ audioOn, onAudio, onGuided, onFree }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const [video, setVideo] = useState(false)
  const [foto, setFoto] = useState(false)

  useEffect(() => { assetExists(VIDEO_SFONDO).then(setVideo) }, [])
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.intro-a', { opacity: 0, y: 24, duration: 1.4, ease: 'power3.out', stagger: 0.35, delay: 0.4 })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={root} className="absolute inset-0 z-40 overflow-hidden bg-gradient-to-b from-[#02030a] via-[#0a1230] to-[#05070f]">
      <div className="absolute inset-0"><StarField /></div>
      {video ? (
        <video src={VIDEO_SFONDO} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover opacity-60" />
      ) : (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/panorami/intro.jpg" alt="" onLoad={() => setFoto(true)}
            className={`kenburns h-full w-full object-cover transition-opacity duration-[2500ms] ${foto ? 'opacity-55' : 'opacity-0'}`}
          />
        </div>
      )}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(2,3,10,.85)_100%)]" />
      <span className="credito-linea absolute bottom-1 right-4">Foto: NASA</span>
      <AudioToggle on={audioOn} onToggle={onAudio} className="absolute right-5 top-5" />
      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="intro-a mb-5 text-xs uppercase tracking-[0.45em] text-cyan-200/80">Un'esperienza immersiva</p>
        <h1 className="intro-a text-5xl font-light tracking-tight md:text-7xl">
          ISS <span className="text-white/40">—</span> <span className="font-semibold">Inside the Physics</span>
        </h1>
        <p className="intro-a mt-6 max-w-xl text-lg font-light leading-relaxed text-white/65">
          Dentro la Stazione Spaziale Internazionale, fino all'EML: il levitatore elettromagnetico dove l'induzione fa fondere un metallo nel vuoto.
        </p>
        <div className="intro-a mt-12 flex flex-wrap justify-center gap-4">
          <button className="btn-primary" onClick={onGuided}>Inizia la visita guidata</button>
          <button className="btn-ghost" onClick={onFree}>Esplora liberamente</button>
        </div>
        <p className="intro-a absolute bottom-6 text-xs text-white/35">Consigliato su desktop o tablet · con audio per la voce narrante</p>
      </div>
    </div>
  )
}
