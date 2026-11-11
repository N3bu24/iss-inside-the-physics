import type { Provenienza } from '../data/types'

const INFO: Record<Provenienza, { label: string; dot: string }> = {
  foto: { label: 'Foto reale', dot: '#7dd87d' },
  ia: { label: 'Ricostruzione IA', dot: '#b58cff' },
  modello3d: { label: 'Modello 3D', dot: '#35e0ff' },
  simulazione: { label: 'Simulazione concettuale', dot: '#ff8a2a' },
  diretta: { label: 'Ripresa reale in diretta', dot: '#ff4d4d' },
}

export default function Badge({ tipo, className = '' }: { tipo: Provenienza; className?: string }) {
  const { label, dot } = INFO[tipo]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/30 px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-white/80 backdrop-blur ${className}`}
      title="Provenienza del contenuto"
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: dot, boxShadow: `0 0 6px ${dot}` }} />
      {label}
    </span>
  )
}
