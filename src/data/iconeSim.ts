import { Atom, Brain, Cog, Compass, FlaskConical, Sparkles, ToggleRight, TrainFront, Zap, type LucideIcon } from 'lucide-react'

/**
 * UNICA fonte di verità per l'icona di ogni simulazione (id identici a src/simulazioni/index.ts).
 * Regola: stessa simulazione = stessa icona ovunque (bollino sul punto di interesse, porta dell'ambiente,
 * scheda, indice, intestazione della simulazione); simulazioni diverse = icone diverse.
 * `titolo` è il titolo generico breve da mostrare accanto all'icona.
 */
export interface IconaSim { Icon: LucideIcon; titolo: string; colore: string }

export const ICONE_SIM: Record<string, IconaSim> = {
  eml: { Icon: Atom, titolo: 'Esperimento EML', colore: '#8ff4ff' },
  campo: { Icon: Compass, titolo: 'Campo magnetico', colore: '#5ea6ff' },
  energia: { Icon: Zap, titolo: 'Energia', colore: '#ff9a3c' },
  levitazione: { Icon: TrainFront, titolo: 'Levitazione', colore: '#35e0ff' },
  rmn: { Icon: Brain, titolo: 'Risonanza', colore: '#86d6a0' },
  motore: { Icon: Cog, titolo: 'Motore', colore: '#ffd166' },
  autoinduzione: { Icon: ToggleRight, titolo: 'Autoinduzione', colore: '#b9a7ff' },
  aurora: { Icon: Sparkles, titolo: 'Aurora', colore: '#7dffb0' },
}

const GENERICA: IconaSim = { Icon: FlaskConical, titolo: 'Simulazione', colore: '#35e0ff' }

/** Icona della simulazione con quell'id (mai null: ripiego generico). */
export function iconaSim(id: string | null | undefined): IconaSim {
  return (id && ICONE_SIM[id]) || GENERICA
}
