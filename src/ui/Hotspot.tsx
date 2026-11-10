import type { CSSProperties } from 'react'
import { Atom, ChevronsUp, Cpu, Globe, Lock, Magnet, User, Zap, type LucideIcon } from 'lucide-react'
import type { Categoria } from '../data/types'
import { iconaSim } from '../data/iconeSim'

export const CATEGORIE: Record<Categoria, { Icon: LucideIcon; colore: string; etichetta: string }> = {
  fisica: { Icon: Magnet, colore: '#35e0ff', etichetta: 'Fisica' },
  eml: { Icon: Atom, colore: '#8ff4ff', etichetta: 'EML' },
  strumento: { Icon: Cpu, colore: '#ffffff', etichetta: 'Strumento' },
  vita: { Icon: User, colore: '#86d6a0', etichetta: 'Vita a bordo' },
  terra: { Icon: Globe, colore: '#5ea6ff', etichetta: 'Terra' },
  energia: { Icon: Zap, colore: '#ff9a3c', etichetta: 'Energia' },
}

export type TipoMarcatore = Categoria | 'portello' | 'ambiente' | 'chiuso'

const ALTRI: Record<'portello' | 'chiuso', { Icon: LucideIcon; colore: string }> = {
  portello: { Icon: ChevronsUp, colore: '#e8ecf5' },
  chiuso: { Icon: Lock, colore: '#9aa3b2' },
}

/** Icona e colore di un marcatore. Le porte degli ambienti (`ambiente`) prendono icona e colore della simulazione omonima (`idAmbiente`). */
export function stileTipo(tipo: TipoMarcatore, idAmbiente?: string): { Icon: LucideIcon; colore: string } {
  if (tipo === 'ambiente') { const s = iconaSim(idAmbiente); return { Icon: s.Icon, colore: s.colore } }
  return tipo in CATEGORIE ? CATEGORIE[tipo as Categoria] : ALTRI[tipo as 'portello' | 'chiuso']
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
  /** id della simulazione collegata al punto: mostra il bollino con la sua icona */
  simulazione?: string
  /** solo per tipo="ambiente": id dell'ambiente (= id della simulazione omonima) */
  ambiente?: string
}

/** Bollino tondo con l'icona della simulazione (stessa icona ovunque, vedi data/iconeSim.ts). */
export function BollinoSim({ simulazione, size = 22 }: { simulazione: string; size?: number }) {
  const { Icon, colore } = iconaSim(simulazione)
  return (
    <span className="bollino-sim" style={{ '--c': colore, width: size, height: size } as CSSProperties} aria-hidden>
      <Icon size={Math.round(size * 0.55)} strokeWidth={2.4} color="#fff" />
    </span>
  )
}

/**
 * Marcatore HTML. Forme diverse per funzioni diverse:
 * - tondo (58 px) = contenuto da leggere; con bollino in alto a destra se ha una simulazione;
 * - tondo grande (64 px, icona della simulazione) = porta di un ambiente interattivo;
 * - rombo solo contorno con doppia freccia = portello per muoversi tra i moduli (tratteggiato e col lucchetto se chiuso).
 */
export default function HotspotMarker({ tipo, titolo, onClick, attivo, visto, className = '', simulazione, ambiente }: Props) {
  const { Icon, colore } = stileTipo(tipo, ambiente)
  if (tipo === 'portello' || tipo === 'chiuso') {
    const chiuso = tipo === 'chiuso'
    return (
      <button
        type="button"
        aria-label={titolo}
        title={chiuso ? `${titolo} (non visitabile)` : titolo}
        onClick={onClick}
        className={`hs-rombo ${chiuso ? 'chiuso' : ''} ${attivo ? 'attivo' : ''} ${className}`}
        style={{ '--c': colore } as CSSProperties}
      >
        <span className="hs-rombo-forma"><Icon size={chiuso ? 18 : 22} strokeWidth={2.4} color="#fff" className="hs-rombo-icona" /></span>
        <span className="hs-rombo-et">{titolo}</span>
      </button>
    )
  }
  const sim = tipo === 'ambiente' ? iconaSim(ambiente) : simulazione ? iconaSim(simulazione) : null
  const suggerimento = tipo === 'ambiente' ? `Simulazione: ${sim?.titolo}` : sim ? `Simulazione: ${sim.titolo}` : ''
  return (
    <button
      type="button"
      aria-label={suggerimento ? `${titolo} (${suggerimento})` : titolo}
      title={suggerimento ? `${titolo} · ${suggerimento}` : undefined}
      onClick={onClick}
      className={`hs2 ${tipo === 'ambiente' ? 'grande' : ''} ${attivo ? 'attivo' : ''} ${visto ? 'visto' : ''} ${className}`}
      style={{ '--c': colore } as CSSProperties}
    >
      <Icon size={tipo === 'ambiente' ? 32 : 30} strokeWidth={2.2} color="#fff" />
      {tipo !== 'ambiente' && simulazione && <BollinoSim simulazione={simulazione} />}
      <span className="hs2-tip">{titolo}{suggerimento && <i className="hs2-tip-sim"> · {suggerimento}</i>}</span>
    </button>
  )
}

/** Indicatore sul bordo dello schermo per un punto fuori dal campo visivo: icona della categoria + freccia verso il punto (--a impostato dal contenitore). */
export function IndicatoreBordo({ tipo, titolo, onClick, simulazione }: { tipo: TipoMarcatore; titolo: string; onClick: () => void; simulazione?: string }) {
  const { Icon, colore } = stileTipo(tipo)
  return (
    <button type="button" onClick={onClick} title={`${titolo}: guarda qui`} aria-label={`Guarda verso ${titolo}`} className="ind-bordo" style={{ '--c': colore } as CSSProperties}>
      <Icon size={18} strokeWidth={2.2} color="#fff" />
      {simulazione && <span className="bollino-in-riga absolute -right-1.5 -top-1.5 flex"><BollinoSim simulazione={simulazione} size={16} /></span>}
      <i className="ind-freccia" />
    </button>
  )
}
