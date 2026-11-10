import type { CSSProperties } from 'react'
import { Atom, Cpu, DoorOpen, Globe, Lock, Magnet, Sparkles, User, Zap, type LucideIcon } from 'lucide-react'
import type { Categoria } from '../data/types'

export const CATEGORIE: Record<Categoria, { Icon: LucideIcon; colore: string; etichetta: string }> = {
  fisica: { Icon: Magnet, colore: '#35e0ff', etichetta: 'Fisica' },
  eml: { Icon: Atom, colore: '#8ff4ff', etichetta: 'EML' },
  strumento: { Icon: Cpu, colore: '#ffffff', etichetta: 'Strumento' },
  vita: { Icon: User, colore: '#86d6a0', etichetta: 'Vita a bordo' },
  terra: { Icon: Globe, colore: '#5ea6ff', etichetta: 'Terra' },
  energia: { Icon: Zap, colore: '#ff9a3c', etichetta: 'Energia' },
}

export type TipoMarcatore = Categoria | 'portello' | 'ambiente' | 'chiuso'

const ALTRI: Record<'portello' | 'ambiente' | 'chiuso', { Icon: LucideIcon; colore: string }> = {
  portello: { Icon: DoorOpen, colore: '#e8ecf5' },
  ambiente: { Icon: Sparkles, colore: '#b9a7ff' },
  chiuso: { Icon: Lock, colore: '#9aa3b2' },
}

export function stileTipo(tipo: TipoMarcatore): { Icon: LucideIcon; colore: string } {
  return tipo in CATEGORIE ? CATEGORIE[tipo as Categoria] : ALTRI[tipo as 'portello' | 'ambiente' | 'chiuso']
}

interface Props {
  tipo: TipoMarcatore
  titolo: string
  onClick?: () => void
  /** evidenziato (es. portello inquadrato): anello piu vivace */
  attivo?: boolean
  /** gia visto: bordo attenuato */
  visto?: boolean
  className?: string
}

/** Marcatore HTML (58 px, 64 per le porte degli ambienti): disco scuro pieno, bordo colorato, icona bianca grande, alone, etichetta sempre visibile se c'e spazio. */
export default function HotspotMarker({ tipo, titolo, onClick, attivo, visto, className = '' }: Props) {
  const { Icon, colore } = stileTipo(tipo)
  return (
    <button
      type="button"
      aria-label={titolo}
      onClick={onClick}
      className={`hs2 ${tipo === 'ambiente' ? 'grande' : ''} ${tipo === 'chiuso' ? 'chiuso' : ''} ${attivo ? 'attivo' : ''} ${visto ? 'visto' : ''} ${className}`}
      style={{ '--c': colore } as CSSProperties}
    >
      <Icon size={tipo === 'ambiente' ? 32 : 30} strokeWidth={2.2} color="#fff" />
      <span className="hs2-tip">{titolo}</span>
    </button>
  )
}

/** Indicatore sul bordo dello schermo per un punto fuori dal campo visivo: icona della categoria + freccia verso il punto (--a impostato dal contenitore). */
export function IndicatoreBordo({ tipo, titolo, onClick }: { tipo: TipoMarcatore; titolo: string; onClick: () => void }) {
  const { Icon, colore } = stileTipo(tipo)
  return (
    <button type="button" onClick={onClick} title={`${titolo}: guarda qui`} aria-label={`Guarda verso ${titolo}`} className="ind-bordo" style={{ '--c': colore } as CSSProperties}>
      <Icon size={18} strokeWidth={2.2} color="#fff" />
      <i className="ind-freccia" />
    </button>
  )
}
