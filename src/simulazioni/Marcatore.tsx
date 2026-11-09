import type { CSSProperties } from 'react'
import { Atom, Cpu, Globe, Magnet, User, Zap, type LucideIcon } from 'lucide-react'

export type CategoriaSim = 'fisica' | 'eml' | 'strumento' | 'terra' | 'energia' | 'vita'

export const CATEGORIE_SIM: Record<CategoriaSim, { Icon: LucideIcon; colore: string }> = {
  fisica: { Icon: Magnet, colore: '#35e0ff' },
  eml: { Icon: Atom, colore: '#8ff4ff' },
  strumento: { Icon: Cpu, colore: '#ffffff' },
  terra: { Icon: Globe, colore: '#5ea6ff' },
  energia: { Icon: Zap, colore: '#ff9a3c' },
  vita: { Icon: User, colore: '#86d6a0' },
}

/** Marcatore da 56 px: disco scuro, bordo colorato, icona per categoria. Lo stile e' in <Stile/>. */
export default function Marcatore({ categoria, titolo, attivo, onClick }: { categoria: CategoriaSim; titolo: string; attivo?: boolean; onClick?: () => void }) {
  const { Icon, colore } = CATEGORIE_SIM[categoria]
  return (
    <button type="button" aria-label={titolo} onClick={onClick} className={'sim-hs' + (attivo ? ' attivo' : '')} style={{ '--c': colore } as CSSProperties}>
      <Icon size={24} strokeWidth={2} />
      <span className="sim-hs-tip">{titolo}</span>
    </button>
  )
}
