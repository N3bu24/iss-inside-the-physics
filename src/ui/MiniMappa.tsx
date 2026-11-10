import { useEffect, useRef, useState } from 'react'
import { FastForward, Maximize2, Minimize2, Plane, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useCompatto } from '../lib/dispositivo'
import { nodi, percorsoGuidato, type NodoId } from '../data/stazione'
import { VIEWBOX, centro, decorazioni, moduliMappa, moduloPerNodo, orientamentoMappa } from '../data/mappa'
import { useVista } from '../explore/vista'
import { PRIORITA_PANNELLO, useEscape } from '../lib/useEscape'

interface Props {
  corrente: NodoId
  visitati: ReadonlySet<NodoId>
  /** "Vola fin lì": passa per i moduli intermedi con i video */
  onVaiA: (n: NodoId) => void
  /** "Viaggio rapido": salto diretto, senza voli */
  onSaltaA: (n: NodoId) => void
  /** clic su un modulo non visitabile: apre la nota */
  onNota: (id: string) => void
  /** preferenza "salta i voli": il clic su un modulo salta sempre, senza menu */
  saltaVoli?: boolean
  /** disattiva i clic mentre si sta volando */
  occupato?: boolean
  /** telefono/tablet: le tappe suggerite (TappeBar) si mostrano dentro la mappa a schermo intero */
  tappe?: ReactNode
  /** telefono/tablet: la mappa a schermo intero e' aperta dall'esterno (pulsante Mappa della barra) */
  piena?: boolean
  onPiena?: (aperta: boolean) => void
}

const RAGGIO_CONO = 38
const APERTURA = 38 // metà apertura del cono in gradi

/** Pianta SVG della ISS: moduli esplorabili evidenziati, cono di sguardo, moduli visitati, percorso guidato tratteggiato. */
export default function MiniMappa({ corrente, visitati, onVaiA, onSaltaA, onNota, saltaVoli, occupato, tappe, piena = false, onPiena }: Props) {
  const [grande, setGrande] = useState(false)
  const [menu, setMenu] = useState<{ nodo: NodoId; nome: string } | null>(null)
  const [sopra, setSopra] = useState<string | null>(null)
  const radice = useRef<HTMLDivElement>(null)
  const compatto = useCompatto()
  const yawDeg = useVista((v) => Math.round((v.yaw * 180) / Math.PI))
  const modCorr = moduloPerNodo(corrente)
  const c = centro(modCorr)
  const base = orientamentoMappa[corrente]
  const angolo = base === undefined ? null : base + yawDeg
  const modVisitati = new Set([...visitati].map((n) => nodi[n].modulo))

  // il menu si chiude con Esc, con un clic fuori, e quando si cambia modulo
  useEffect(() => { setMenu(null); onPiena?.(false) }, [corrente]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!menu) return
    const giu = (e: PointerEvent) => { if (radice.current && !radice.current.contains(e.target as Node)) setMenu(null) }
    document.addEventListener('pointerdown', giu)
    return () => { document.removeEventListener('pointerdown', giu) }
  }, [menu])
  useEscape(() => { if (!menu) return false; setMenu(null); return true }, PRIORITA_PANNELLO)

  // percorso guidato: sequenza dei centri dei moduli (senza ripetizioni consecutive)
  const punti = percorsoGuidato
    .map((n) => moduloPerNodo(n))
    .filter((m, i, a) => i === 0 || a[i - 1].id !== m.id)
    .map((m) => { const p = centro(m); return `${p.x},${p.y}` })
    .join(' ')

  const a0 = ((-APERTURA) * Math.PI) / 180, a1 = (APERTURA * Math.PI) / 180
  const p0 = `${RAGGIO_CONO * Math.cos(a0)},${RAGGIO_CONO * Math.sin(a0)}`
  const p1 = `${RAGGIO_CONO * Math.cos(a1)},${RAGGIO_CONO * Math.sin(a1)}`
  const cono = `M0,0 L${p0} A${RAGGIO_CONO},${RAGGIO_CONO} 0 0 1 ${p1} Z`
  const bordiCono = `M${p0} L0,0 L${p1}`

  const clicModulo = (m: (typeof moduliMappa)[number], attivo: boolean) => {
    if (!m.nodo) { onNota(m.id); return }
    if (occupato || attivo) return
    if (saltaVoli) { onPiena?.(false); onSaltaA(m.nodo); return }
    setMenu({ nodo: m.nodo, nome: m.nome })
  }

  const pianta = (cn: string) => (
      <svg viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`} className={cn}>
        <defs>
          <radialGradient id="mm-cono" cx="0" cy="0" r={RAGGIO_CONO} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#6aeaff" stopOpacity="0.95" />
            <stop offset="1" stopColor="#35e0ff" stopOpacity="0.22" />
          </radialGradient>
        </defs>
        {decorazioni.map((d, i) => (
          <rect key={i} {...d} rx="1.5" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.1)" strokeWidth=".6" />
        ))}
        <polyline points={punti} fill="none" stroke="rgba(53,224,255,.6)" strokeWidth="1.4" strokeDasharray="3.5 3" strokeLinecap="round" />
        {moduliMappa.map((m) => {
          const esplorabile = !!m.nodo
          const attivo = m.id === modCorr.id
          const visto = modVisitati.has(m.id)
          const evid = sopra === m.id
          const fill = attivo ? 'rgba(53,224,255,.18)' : esplorabile ? (visto ? 'rgba(53,224,255,.2)' : 'rgba(255,255,255,.2)') : evid ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.05)'
          const stroke = attivo ? '#35e0ff' : esplorabile ? (visto ? 'rgba(53,224,255,.75)' : 'rgba(255,255,255,.7)') : evid ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.18)'
          const cliccabile = !esplorabile || !attivo
          return (
            <g
              key={m.id}
              onClick={() => clicModulo(m, attivo)}
              onPointerEnter={() => setSopra(m.id)}
              onPointerLeave={() => setSopra((s) => (s === m.id ? null : s))}
              style={{ cursor: !cliccabile ? 'default' : esplorabile ? 'pointer' : 'help' }}
            >
              <title>{esplorabile ? (attivo ? `Sei qui: ${m.nome}` : `Vai a ${m.nome}`) : `${m.nome}: non visitabile (clicca per saperne di più)`}</title>
              {m.tondo ? (
                <circle cx={m.x + m.w / 2} cy={m.y + m.h / 2} r={m.w / 2} fill={fill} stroke={stroke} strokeWidth={attivo ? 1.6 : 1.2} />
              ) : (
                <rect x={m.x} y={m.y} width={m.w} height={m.h} rx="4" fill={fill} stroke={stroke} strokeWidth={attivo ? 1.6 : 1.2} strokeDasharray={esplorabile ? undefined : '3 2'} />
              )}
              {/* area di clic più ampia per i moduli piccoli */}
              <rect x={m.x - 4} y={m.y - 4} width={m.w + 8} height={m.h + 8} fill="transparent" />
              <text x={m.et.x} y={m.et.y} textAnchor={m.et.ancora} fontSize="8" fill={esplorabile ? (attivo ? '#9ff0ff' : 'rgba(255,255,255,.85)') : evid ? 'rgba(255,255,255,.75)' : 'rgba(255,255,255,.35)'}>
                {m.nome}
              </text>
            </g>
          )
        })}
        {/* cono di visuale sopra ai moduli: e` la cosa che si legge */}
        {angolo !== null && (
          <g transform={`translate(${c.x} ${c.y}) rotate(${angolo})`} style={{ pointerEvents: 'none' }}>
            <path d={cono} fill="url(#mm-cono)" />
            <path d={bordiCono} fill="none" stroke="rgba(190,245,255,.55)" strokeWidth=".8" strokeLinejoin="round" />
          </g>
        )}
        <circle cx={c.x} cy={c.y} r="2.6" fill="#fff" stroke="#35e0ff" strokeWidth="1.2" style={{ pointerEvents: 'none' }} />
      </svg>
  )

  const legenda = (
      <div className="mt-1 flex items-center gap-3 text-[10px] text-white/45">
        <span className="flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-sm border border-white/70 bg-white/20" />esplorabile</span>
        <span className="flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-sm border border-cyan-300/80 bg-cyan-300/20" />visitato</span>
        <span className="flex items-center gap-1"><i className="inline-block h-0 w-4 border-t border-dashed border-cyan-300/80" />visita</span>
      </div>
  )

  const menuEl = (cn: string) => menu && (
        <div role="menu" aria-label={`Come arrivare a ${menu.nome}`} className={cn} style={{ background: 'rgba(7,12,26,.95)' }}>
          <div className="px-2 pb-1.5 pt-1 text-[11px] uppercase tracking-[0.16em] text-white/45">Vai a {menu.nome}</div>
          <button role="menuitem" onClick={() => { const n = menu.nodo; setMenu(null); onPiena?.(false); onVaiA(n) }} className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13.5px] text-white/90 hover:bg-white/10">
            <Plane size={16} className="shrink-0 text-cyan-200" />
            <span><span className="block font-medium">Vola fin lì</span><span className="block text-[11.5px] text-white/50">attraversa i moduli con i video</span></span>
          </button>
          <button role="menuitem" onClick={() => { const n = menu.nodo; setMenu(null); onPiena?.(false); onSaltaA(n) }} className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13.5px] text-white/90 hover:bg-white/10">
            <FastForward size={16} className="shrink-0 text-cyan-200" />
            <span><span className="block font-medium">Viaggio rapido</span><span className="block text-[11.5px] text-white/50">arrivi subito, senza animazioni</span></span>
          </button>
        </div>
  )

  // telefono e tablet: miniatura in alto a destra che si tocca per aprire la mappa a schermo intero (con viaggio rapido, tappe e legenda)
  if (compatto) {
    return (
      <>
        <div className="glass absolute right-2 top-7 z-30 w-[6.6rem] rounded-xl p-1.5 tab:w-[9rem]">
          {pianta("w-full select-none")}
          <button onClick={() => onPiena?.(true)} aria-label="Apri la mappa della stazione" className="absolute inset-0 rounded-xl" />
        </div>
        {piena && (
          <div ref={radice} className="mappa-piena fade-in" role="dialog" aria-label="Mappa della stazione">
            <header className="flex shrink-0 items-center gap-3 px-4 pb-2 pt-2">
              <div className="min-w-0 flex-1">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/50">La stazione</div>
                <div className="truncate text-lg font-semibold leading-tight">{nodi[corrente].nome.split(/\s*[—,]\s*/)[0]}</div>
              </div>
              <button onClick={() => onPiena?.(false)} aria-label="Chiudi la mappa" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/20 bg-white/5 text-white/80 active:bg-white/15"><X size={22} /></button>
            </header>
            <div className="scroll-sottile flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4 landscape:flex-row landscape:items-start">
              <div className="min-w-0 landscape:w-[55%] landscape:shrink-0">
                {pianta("mx-auto max-h-[52dvh] w-full select-none landscape:max-h-[72dvh]")}
                {legenda}
                <p className="mt-2 text-[12.5px] text-white/60">Tocca un modulo per andarci. I moduli tratteggiati non sono visitabili: tocca per saperne di più.</p>
              </div>
              <div className="min-w-0 flex-1">{tappe}</div>
            </div>
            {menuEl("glass fade-in absolute inset-x-3 bottom-3 z-10 rounded-2xl p-2")}
          </div>
        )}
      </>
    )
  }

  return (
    <div ref={radice} className={`glass absolute right-4 top-4 z-30 rounded-2xl p-3 transition-[width] duration-300 ${grande ? 'w-[460px]' : 'w-[240px]'} max-w-[94vw]`}>
      <div className="mb-1 flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] text-white/50">
        <span>La stazione</span>
        <span className="min-w-0 flex-1 text-right normal-case leading-tight tracking-normal text-[11px] text-cyan-200">{nodi[corrente].nome.split(/\s*[—,]\s*/)[0]}</span>
        <button onClick={() => setGrande(!grande)} aria-label={grande ? 'Riduci la mappa' : 'Ingrandisci la mappa'} title={grande ? 'Riduci' : 'Ingrandisci'}
          className="rounded-md p-1 text-white/60 hover:bg-white/10 hover:text-white">
          {grande ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>
      {pianta("w-full select-none")}
      {legenda}

      {menuEl("glass fade-in absolute inset-x-0 top-full z-10 mt-2 rounded-2xl p-2")}
    </div>
  )
}
