import { moduliMappa, tappe } from '../data/tour'

export default function MiniMap({ moduloCorrente, onSelect }: { moduloCorrente: string; onSelect: (tappaId: string) => void }) {
  const esplorabili = new Set(tappe.map((t) => t.modulo))
  const mod = (id: string) => moduliMappa.find((m) => m.id === id)!
  // percorso principale = sequenza dei moduli nelle tappe
  const punti = tappe
    .map((t) => mod(t.modulo))
    .filter((m, i, a) => i === 0 || a[i - 1].id !== m.id)
    .map((m) => `${m.x + m.w / 2},${m.y + m.h / 2}`)
    .join(' ')
  return (
    <div className="glass absolute right-4 top-4 z-30 w-[220px] rounded-2xl p-3">
      <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-white/50">
        <span>Posizione</span>
        <span className="text-cyan-200">{mod(moduloCorrente)?.nome}</span>
      </div>
      <svg viewBox="0 0 240 110" className="w-full">
        {/* struttura / tralicci */}
        <line x1="10" y1="60" x2="230" y2="60" stroke="rgba(255,255,255,.18)" strokeWidth="2" />
        <rect x="176" y="20" width="10" height="80" rx="2" fill="rgba(255,255,255,.07)" />
        <rect x="196" y="20" width="10" height="80" rx="2" fill="rgba(255,255,255,.07)" />
        <polyline points={punti} fill="none" stroke="rgba(53,224,255,.35)" strokeWidth="1.5" strokeDasharray="3 3" />
        {moduliMappa.map((m) => {
          const attivo = m.id === moduloCorrente
          const ok = esplorabili.has(m.id)
          return (
            <g
              key={m.id}
              onClick={() => ok && onSelect(tappe.find((t) => t.modulo === m.id)!.id)}
              style={{ cursor: ok ? 'pointer' : 'default' }}
            >
              <rect
                x={m.x} y={m.y} width={m.w} height={m.h} rx="4"
                fill={attivo ? 'rgba(53,224,255,.45)' : 'rgba(255,255,255,.12)'}
                stroke={attivo ? '#35e0ff' : 'rgba(255,255,255,.3)'}
                style={attivo ? { filter: 'drop-shadow(0 0 6px #35e0ff)' } : undefined}
              />
              <text x={m.x + m.w / 2} y={m.y + m.h + 11} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,.55)">{m.nome}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
