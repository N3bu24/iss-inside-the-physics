import moduliChiusiGrezzo from '@content/moduli-chiusi.json'
import strumentiGrezzo from '@content/strumenti.json'
import simulazioniGrezzo from '@content/simulazioni.json'

/** Moduli della stazione non visitabili: note brevi (content/moduli-chiusi.json). Campi mancanti = stringhe vuote, mai errori. */
export interface ModuloChiuso { id: string; nome: string; ruolo: string; nota: string; fonte: string }
const testo = (v: unknown) => (typeof v === 'string' ? v : '')

export const moduliChiusi: ModuloChiuso[] = (Array.isArray(moduliChiusiGrezzo) ? (moduliChiusiGrezzo as Record<string, unknown>[]) : [])
  .filter((m) => m && typeof m.id === 'string')
  .map((m) => ({ id: String(m.id), nome: testo(m.nome), ruolo: testo(m.ruolo), nota: testo(m.nota), fonte: testo(m.fonte) }))

/** Nota del modulo non visitabile con quell'id (es. "zvezda", "quest") oppure null. */
export const moduloChiusoPerId = (id: string): ModuloChiuso | null => moduliChiusi.find((m) => m.id === id) ?? null

/** Cerca la nota a partire da un'etichetta libera (es. "Quest (camera stagna)"): il primo id contenuto nel testo. */
export function moduloChiusoPerEtichetta(etichetta: string): ModuloChiuso | null {
  const e = etichetta.toLowerCase()
  return moduliChiusi.find((m) => e.includes(m.id.toLowerCase()) || (m.nome && e.includes(m.nome.toLowerCase()))) ?? null
}

/** Strumenti usati per il sito (content/strumenti.json). */
export interface StrumentoUsato { nome: string; categoria: string; uso: string }
export const strumenti: StrumentoUsato[] = (Array.isArray(strumentiGrezzo) ? (strumentiGrezzo as Record<string, unknown>[]) : [])
  .filter((s) => s && typeof s.nome === 'string' && s.nome)
  .map((s) => ({ nome: String(s.nome), categoria: testo(s.categoria) || 'Altro', uso: testo(s.uso) }))

/** Guida all'uso di una simulazione (campo opzionale `guida` di content/simulazioni.json). */
export interface GuidaSim { come_si_usa: string; comandi: { nome: string; cosa_fa: string }[]; cosa_dimostra: string }
export function guidaSimulazione(id: string): GuidaSim | null {
  try {
    const lista = Array.isArray(simulazioniGrezzo) ? (simulazioniGrezzo as Record<string, unknown>[]) : []
    const g = lista.find((s) => s?.id === id)?.guida as Record<string, unknown> | undefined
    if (!g) return null
    const comandi = Array.isArray(g.comandi) ? (g.comandi as Record<string, unknown>[]).map((c) => ({ nome: testo(c.nome), cosa_fa: testo(c.cosa_fa) })).filter((c) => c.nome || c.cosa_fa) : []
    const out = { come_si_usa: testo(g.come_si_usa), comandi, cosa_dimostra: testo(g.cosa_dimostra) }
    return out.come_si_usa || out.comandi.length || out.cosa_dimostra ? out : null
  } catch {
    return null
  }
}

/** Intro e titolo di una simulazione da content/simulazioni.json (campi opzionali). */
export function introSimulazione(id: string): { titolo: string; intro: string } {
  const lista = Array.isArray(simulazioniGrezzo) ? (simulazioniGrezzo as Record<string, unknown>[]) : []
  const s = lista.find((x) => x?.id === id)
  const intro = testo(s?.intro) || testo(s?.voce)
  return { titolo: testo(s?.titolo), intro }
}
