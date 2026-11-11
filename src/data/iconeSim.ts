import { Play, type LucideIcon } from 'lucide-react'

/**
 * UNICA fonte di verita` per l'aspetto delle simulazioni (id identici a src/simulazioni/index.ts).
 * Regola: UN solo simbolo per "punto con simulazione" (il triangolo Play, mai usato dai punti normali);
 * le simulazioni si distinguono per COLORE. Stesso colore ovunque: marcatore nel panorama, indicatore al bordo,
 * lista dei punti, Indice, scheda e intestazione della simulazione.
 * `titolo` e` il titolo generico breve da mostrare accanto al simbolo.
 */
export interface IconaSim { Icon: LucideIcon; titolo: string; colore: string }

/** simbolo unico delle simulazioni */
export const SIMBOLO_SIM: LucideIcon = Play

export const ICONE_SIM: Record<string, IconaSim> = {
  eml: { Icon: SIMBOLO_SIM, titolo: 'Esperimento EML', colore: '#8ff4ff' },
  campo: { Icon: SIMBOLO_SIM, titolo: 'Campo magnetico', colore: '#5ea6ff' },
  energia: { Icon: SIMBOLO_SIM, titolo: 'Energia', colore: '#ff9a3c' },
  levitazione: { Icon: SIMBOLO_SIM, titolo: 'Levitazione', colore: '#f472b6' },
  rmn: { Icon: SIMBOLO_SIM, titolo: 'Risonanza', colore: '#fb7185' },
  motore: { Icon: SIMBOLO_SIM, titolo: 'Motore', colore: '#ffd166' },
  autoinduzione: { Icon: SIMBOLO_SIM, titolo: 'Autoinduzione', colore: '#b9a7ff' },
  aurora: { Icon: SIMBOLO_SIM, titolo: 'Aurora', colore: '#7dffb0' },
}

const GENERICA: IconaSim = { Icon: SIMBOLO_SIM, titolo: 'Simulazione', colore: '#35e0ff' }

/** Icona/colore della simulazione con quell'id (mai null: ripiego generico). */
export function iconaSim(id: string | null | undefined): IconaSim {
  return (id && ICONE_SIM[id]) || GENERICA
}
