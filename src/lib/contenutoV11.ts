// Testi brevi della v1.1.0 (content/v11.json). Ogni lettura ha un ripiego: se il file o il campo mancano il sito funziona uguale.
import { pulisciDati } from './pulisci'

const moduli = import.meta.glob('/content/v11.json', { eager: true, import: 'default' }) as Record<string, unknown>

type Radice = {
  sezioni?: Record<string, string[]>
  valori?: Record<string, Record<string, string>>
  diretta?: Record<string, string>
  musica?: Record<string, string>
}

function radice(): Radice {
  try {
    return (pulisciDati(Object.values(moduli)[0]) as Radice) ?? {}
  } catch {
    return {}
  }
}

const R = radice()

/** Nomi delle sezioni di una simulazione (stesso ordine delle sezioni nel codice). */
export function nomiSezioni(sim: string, ripiego: string[]): string[] {
  const l = R.sezioni?.[sim]
  return Array.isArray(l) && l.length >= ripiego.length ? ripiego.map((r, i) => (typeof l[i] === 'string' && l[i].trim() ? l[i] : r)) : ripiego
}

/** Etichetta di un valore mostrato sulla scena. */
export function etichettaValore(sim: string, chiave: string, ripiego: string): string {
  const s = R.valori?.[sim]?.[chiave]
  return typeof s === 'string' && s.trim() ? s.trim() : ripiego
}

/** Testo della diretta dalla ISS. */
export function testoDiretta(chiave: string, ripiego: string): string {
  const s = R.diretta?.[chiave]
  return typeof s === 'string' && s.trim() ? s.trim() : ripiego
}

export function testoMusica(chiave: string, ripiego: string): string {
  const s = R.musica?.[chiave]
  return typeof s === 'string' && s.trim() ? s.trim() : ripiego
}
