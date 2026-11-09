import type { CSSProperties } from 'react'
import { Atom, Cpu, DoorOpen, Globe, Lock, Magnet, Sparkles, User, Zap, type LucideIcon } from 'lucide-react'
import type { Categoria } from '../data/esempio-hotspot'

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

interface Props {
  tipo: TipoMarcatore
  titolo: string
  onClick?: () => void
  /** evidenziato (es. portello inquadrato): etichetta sempre visibile e anello più vivace */
  attivo?: boolean
  className?: string
}

/** Marcatore HTML da 48 px (64 per le porte degli ambienti): icona per categoria, anello pulsante, etichetta all'hover. */
export default function HotspotMarker({ tipo, titolo, onClick, attivo, className = '' }: Props) {
  const { Icon, colore } = tipo in CATEGORIE ? CATEGORIE[tipo as Categoria] : ALTRI[tipo as 'portello' | 'ambiente' | 'chiuso']
  return (
    <button
      type="button"
      aria-label={titolo}
      onClick={onClick}
      className={`hs2 ${tipo === 'ambiente' ? 'grande' : ''} ${tipo === 'chiuso' ? 'chiuso' : ''} ${attivo ? 'attivo' : ''} ${className}`}
      style={{ '--c': colore } as CSSProperties}
    >
      <Icon size={tipo === 'ambiente' ? 30 : 22} strokeWidth={2} />
      <span className="hs2-tip">{titolo}</span>
    </button>
  )
}
