import { useSyncExternalStore } from 'react'

/**
 * Preferenze dell'utente (pannello Impostazioni). Store fuori da React, salvato in localStorage.
 * Lettura nei componenti: `const v = usePreferenza('volumeVoce')`. Fuori da React: `preferenze.get()`.
 * Scrittura: `preferenze.set({ saltaVoli: true })`. Ripristino: `preferenze.reset()`.
 */
export interface Preferenze {
  /** volume della voce narrante, 0-1 */
  volumeVoce: number
  /** volume del sottofondo (stazione / rientro), 0-1 */
  volumeSottofondo: number
  /** sottotitoli visibili */
  sottotitoli: boolean
  /** scala del testo dei pannelli */
  dimensioneTesto: 'normale' | 'grande' | 'molto-grande'
  /** contrasto più alto per pannelli e testi */
  altoContrasto: boolean
  /** riduce zoom lenti, pulsazioni e transizioni */
  riduciAnimazioni: boolean
  /** viaggio rapido sempre: niente voli tra i moduli */
  saltaVoli: boolean
  /** tremolio della visuale nella capsula di rientro */
  tremolioCapsula: boolean
}

export const PREDEFINITE: Preferenze = {
  volumeVoce: 1,
  volumeSottofondo: 1,
  sottotitoli: true,
  dimensioneTesto: 'normale',
  altoContrasto: false,
  riduciAnimazioni: false,
  saltaVoli: false,
  tremolioCapsula: true,
}

const CHIAVE = 'iss-preferenze-v1'

function carica(): Preferenze {
  try {
    const grezzo = localStorage.getItem(CHIAVE)
    if (!grezzo) return PREDEFINITE
    return { ...PREDEFINITE, ...(JSON.parse(grezzo) as Partial<Preferenze>) }
  } catch {
    return PREDEFINITE
  }
}

let stato: Preferenze = carica()
const ascoltatori = new Set<() => void>()

function salva() {
  try { localStorage.setItem(CHIAVE, JSON.stringify(stato)) } catch { /* archivio non disponibile: resta in memoria */ }
  ascoltatori.forEach((l) => l())
}

export const preferenze = {
  get: (): Preferenze => stato,
  set(p: Partial<Preferenze>) { stato = { ...stato, ...p }; salva() },
  reset() { stato = PREDEFINITE; salva() },
  /** Per chi non è un componente React (es. lib/ambient.ts). Ritorna la funzione per annullare. */
  ascolta(cb: () => void): () => void { ascoltatori.add(cb); return () => { ascoltatori.delete(cb) } },
}

export function usePreferenza<K extends keyof Preferenze>(chiave: K): Preferenze[K] {
  return useSyncExternalStore(preferenze.ascolta, () => stato[chiave])
}
