import { useEffect, useState } from 'react'
import { Maximize2, X } from 'lucide-react'
import { CREDITO_MAPPA, IMMAGINE_PLANISFERO, INTERVALLO_POSIZIONE_MS, PUNTI_TRACCIA, URL_POSIZIONE_ISS } from '../data/diretta'
import { testoDiretta } from '../lib/contenutoV11'
import { PRIORITA_PANNELLO, useEscape } from '../lib/useEscape'

type Punto = { lat: number; lon: number }

/** Posizione della ISS ogni ~5 s (si ferma se la scheda e' nascosta o il componente viene smontato) + traccia recente. */
function usePosizioneIss() {
  const [pos, setPos] = useState<Punto | null>(null)
  const [traccia, setTraccia] = useState<Punto[]>([])
  const [errore, setErrore] = useState(false)
  useEffect(() => {
    let vivo = true
    let timer = 0
    let ctrl: AbortController | null = null
    const leggi = async () => {
      if (document.hidden) return
      ctrl = new AbortController()
      try {
        const r = await fetch(URL_POSIZIONE_ISS, { signal: ctrl.signal })
        if (!r.ok) throw new Error(String(r.status))
        const j = (await r.json()) as { latitude?: number; longitude?: number }
        if (!vivo || typeof j.latitude !== 'number' || typeof j.longitude !== 'number') return
        const p = { lat: j.latitude, lon: j.longitude }
        setPos(p)
        setErrore(false)
        setTraccia((t) => [...t.slice(-(PUNTI_TRACCIA - 1)), p])
      } catch {
        if (vivo) setErrore(true)
      }
    }
    leggi()
    timer = window.setInterval(leggi, INTERVALLO_POSIZIONE_MS)
    return () => { vivo = false; window.clearInterval(timer); ctrl?.abort() }
  }, [])
  return { pos, traccia, errore }
}

/** Data e ora locali, aggiornate ogni secondo. */
function useOra() {
  const [ora, setOra] = useState(() => new Date())
  useEffect(() => {
    const t = window.setInterval(() => setOra(new Date()), 1000)
    return () => window.clearInterval(t)
  }, [])
  return ora
}

const x = (lon: number) => lon + 180
const y = (lat: number) => 90 - lat

/** Spezza la traccia dove attraversa l'antimeridiano (nessuna riga che taglia tutta la mappa). */
function segmenti(t: Punto[]): string[] {
  const out: string[] = []
  let cur: string[] = []
  t.forEach((p, i) => {
    if (i > 0 && Math.abs(p.lon - t[i - 1].lon) > 180) { if (cur.length > 1) out.push(cur.join(' ')); cur = [] }
    cur.push(`${x(p.lon).toFixed(2)},${y(p.lat).toFixed(2)}`)
  })
  if (cur.length > 1) out.push(cur.join(' '))
  return out
}

function Planisfero({ pos, traccia }: { pos: Punto | null; traccia: Punto[] }) {
  return (
    <div className="relative aspect-[2/1] w-full overflow-hidden rounded-lg bg-[#06101f]">
      <img src={IMMAGINE_PLANISFERO} alt="Planisfero" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <svg viewBox="0 0 360 180" className="absolute inset-0 h-full w-full" aria-hidden>
        {segmenti(traccia).map((s, i) => <polyline key={i} points={s} fill="none" stroke="#35e0ff" strokeWidth={1.4} strokeOpacity={0.85} strokeLinecap="round" vectorEffect="non-scaling-stroke" />)}
        {pos && (
          <g transform={`translate(${x(pos.lon)} ${y(pos.lat)})`}>
            <circle r={7} fill="#35e0ff" fillOpacity={0.25}><animate attributeName="r" values="4;9;4" dur="2.2s" repeatCount="indefinite" /></circle>
            <circle r={2.6} fill="#fff" stroke="#35e0ff" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
          </g>
        )}
      </svg>
    </div>
  )
}

function Orologio({ pos, errore }: { pos: Punto | null; errore: boolean }) {
  const ora = useOra()
  const d = ora.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
  const h = ora.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const coord = pos ? `${Math.abs(pos.lat).toFixed(1)}° ${pos.lat >= 0 ? 'N' : 'S'} · ${Math.abs(pos.lon).toFixed(1)}° ${pos.lon >= 0 ? 'E' : 'O'}` : errore ? 'posizione non disponibile' : 'posizione in arrivo…'
  return (
    <div className="mt-1.5 flex items-baseline justify-between gap-2 text-[11px] leading-tight text-white/70">
      <span className="tabular-nums">{d} · <span className="text-white/90">{h}</span></span>
      <span className="tabular-nums text-cyan-200/80">{coord}</span>
    </div>
  )
}

function Ingrandita({ pos, traccia, errore, onChiudi }: { pos: Punto | null; traccia: Punto[]; errore: boolean; onChiudi: () => void }) {
  useEscape(() => { onChiudi(); return true }, PRIORITA_PANNELLO)
  return (
    <div className="absolute inset-0 z-[60] grid place-items-center bg-black/60 p-4" onClick={onChiudi}>
      <div className="glass w-[min(900px,94vw)] rounded-2xl p-4" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Dove si trova la ISS">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-[13px] font-medium text-white/90">{testoDiretta('mappaTitolo', 'Dove si trova la ISS adesso')}</div>
          <button onClick={onChiudi} aria-label="Chiudi la mappa" className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/5 text-white/80 hover:bg-white/15"><X size={18} /></button>
        </div>
        <Planisfero pos={pos} traccia={traccia} />
        <Orologio pos={pos} errore={errore} />
        <div className="mt-1 text-[10px] text-white/40">{CREDITO_MAPPA}</div>
      </div>
    </div>
  )
}

/** Mini-mappa del planisfero con la ISS in tempo reale (ingrandibile al clic), data e ora locali sotto. */
export default function MappaIss({ className = '' }: { className?: string }) {
  const { pos, traccia, errore } = usePosizioneIss()
  const [grande, setGrande] = useState(false)
  return (
    <>
      <div className={`glass pointer-events-auto rounded-xl p-2 ${className}`}>
        <button onClick={() => setGrande(true)} className="group relative block w-full text-left" aria-label="Ingrandisci la mappa della ISS" title="Ingrandisci">
          <Planisfero pos={pos} traccia={traccia} />
          <span className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/55 text-white/80 opacity-80 group-hover:opacity-100"><Maximize2 size={12} /></span>
        </button>
        <Orologio pos={pos} errore={errore} />
      </div>
      {grande && <Ingrandita pos={pos} traccia={traccia} errore={errore} onChiudi={() => setGrande(false)} />}
    </>
  )
}
