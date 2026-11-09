import { useState } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'
import { nodi, percorsoGuidato, type NodoId } from '../data/stazione'
import { VIEWBOX, centro, decorazioni, moduliMappa, moduloPerNodo, orientamentoMappa } from '../data/mappa'
import { useVista } from '../explore/vista'

interface Props {
  corrente: NodoId
  visitati: ReadonlySet<NodoId>
  onVaiA: (n: NodoId) => void
  /** disattiva i clic mentre si sta volando */
  occupato?: boolean
}

const RAGGIO_CONO = 30
const APERTURA = 38 // metà apertura del cono in gradi

/** Pianta SVG della ISS: moduli esplorabili evidenziati, cono di sguardo, moduli visitati, percorso guidato tratteggiato. */
export default function MiniMappa({ corrente, visitati, onVaiA, occupato }: Props) {
  const [grande, setGrande] = useState(false)
  const yawDeg = useVista((v) => Math.round((v.yaw * 180) / Math.PI))
  const modCorr = moduloPerNodo(corrente)
  const c = centro(modCorr)
  const base = orientamentoMappa[corrente]
  const angolo = base === undefined ? null : base + yawDeg
  const modVisitati = new Set([...visitati].map((n) => nodi[n].modulo))

  // percorso guidato: sequenza dei centri dei moduli (senza ripetizioni consecutive)
  const punti = percorsoGuidato
    .map((n) => moduloPerNodo(n))
    .filter((m, i, a) => i === 0 || a[i - 1].id !== m.id)
    .map((m) => { const p = centro(m); return `${p.x},${p.y}` })
    .join(' ')

  const a0 = ((-APERTURA) * Math.PI) / 180, a1 = (APERTURA * Math.PI) / 180
  const cono = `M0,0 L${RAGGIO_CONO * Math.cos(a0)},${RAGGIO_CONO * Math.sin(a0)} A${RAGGIO_CONO},${RAGGIO_CONO} 0 0 1 ${RAGGIO_CONO * Math.cos(a1)},${RAGGIO_CONO * Math.sin(a1)} Z`

  return (
    <div className={`glass absolute right-4 top-4 z-30 rounded-2xl p-3 transition-[width] duration-300 ${grande ? 'w-[460px]' : 'w-[240px]'} max-w-[94vw]`}>
      <div className="mb-1 flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] text-white/50">
        <span>La stazione</span>
        <span className="flex-1 truncate text-right text-cyan-200">{nodi[corrente].nome}</span>
        <button onClick={() => setGrande(!grande)} aria-label={grande ? 'Riduci la mappa' : 'Ingrandisci la mappa'} title={grande ? 'Riduci' : 'Ingrandisci'}
          className="rounded-md p-1 text-white/60 hover:bg-white/10 hover:text-white">
          {grande ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>
      <svg viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`} className="w-full select-none">
        <defs>
          <radialGradient id="mm-cono" cx="0" cy="0" r={RAGGIO_CONO} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#35e0ff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#35e0ff" stopOpacity="0" />
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
          const fill = attivo ? 'rgba(53,224,255,.5)' : esplorabile ? (visto ? 'rgba(53,224,255,.2)' : 'rgba(255,255,255,.2)') : 'rgba(255,255,255,.05)'
          const stroke = attivo ? '#35e0ff' : esplorabile ? (visto ? 'rgba(53,224,255,.75)' : 'rgba(255,255,255,.7)') : 'rgba(255,255,255,.18)'
          return (
            <g
              key={m.id}
              onClick={() => esplorabile && !occupato && !attivo && onVaiA(m.nodo!)}
              style={{ cursor: esplorabile && !attivo ? 'pointer' : 'default' }}
            >
              {esplorabile && <title>{attivo ? `Sei qui: ${m.nome}` : `Vola a ${m.nome}`}</title>}
              {m.tondo ? (
                <circle cx={m.x + m.w / 2} cy={m.y + m.h / 2} r={m.w / 2} fill={fill} stroke={stroke} strokeWidth="1.2" />
              ) : (
                <rect x={m.x} y={m.y} width={m.w} height={m.h} rx="4" fill={fill} stroke={stroke} strokeWidth="1.2"
                  style={attivo ? { filter: 'drop-shadow(0 0 5px #35e0ff)' } : undefined} />
              )}
              {/* area di clic più ampia per i moduli piccoli */}
              {esplorabile && <rect x={m.x - 4} y={m.y - 4} width={m.w + 8} height={m.h + 8} fill="transparent" />}
              <text x={m.et.x} y={m.et.y} textAnchor={m.et.ancora} fontSize="8" fill={esplorabile ? (attivo ? '#9ff0ff' : 'rgba(255,255,255,.85)') : 'rgba(255,255,255,.3)'}>
                {m.nome}
              </text>
            </g>
          )
        })}
        {angolo !== null && (
          <g transform={`translate(${c.x} ${c.y}) rotate(${angolo})`} style={{ pointerEvents: 'none' }}>
            <path d={cono} fill="url(#mm-cono)" />
          </g>
        )}
        <circle cx={c.x} cy={c.y} r="3.2" fill="#fff" stroke="#35e0ff" strokeWidth="1.5" style={{ pointerEvents: 'none' }} />
      </svg>
      <div className="mt-1 flex items-center gap-3 text-[10px] text-white/45">
        <span className="flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-sm border border-white/70 bg-white/20" />esplorabile</span>
        <span className="flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-sm border border-cyan-300/80 bg-cyan-300/20" />visitato</span>
        <span className="flex items-center gap-1"><i className="inline-block h-0 w-4 border-t border-dashed border-cyan-300/80" />visita</span>
      </div>
    </div>
  )
}
