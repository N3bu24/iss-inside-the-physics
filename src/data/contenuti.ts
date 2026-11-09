import hotspotJson from '@content/hotspot.json'
import { nodi, type NodoId } from './stazione'
import { posizioni } from './posizioni'
import { hotspotEsempio, luoghiEsempio, type Categoria, type HotspotScheda, type Luogo } from './esempio-hotspot'
import type { Provenienza } from './types'

/**
 * Loader dei contenuti. Usa content/hotspot.json (e content/luoghi.json, se c'è) solo quando sono nel nuovo formato
 * (campo `categoria`); altrimenti ricade sui dati di esempio di esempio-hotspot.ts.
 */

const BADGE: Record<string, Provenienza> = {
  'foto reale': 'foto', foto: 'foto',
  'ricostruzione ia': 'ia', ia: 'ia',
  'modello 3d': 'modello3d', modello3d: 'modello3d',
  'simulazione concettuale': 'simulazione', simulazione: 'simulazione',
}
const badgeDa = (s: unknown): Provenienza => BADGE[String(s ?? '').trim().toLowerCase()] ?? 'ia'

/** alias dei vecchi id di tappa */
const ALIAS: Record<string, NodoId> = { nodo: 'harmony', materiali: 'kibo' }
const luogoDa = (s: unknown): NodoId | null => {
  const k = String(s ?? '')
  const id = (ALIAS[k] ?? k) as NodoId
  return id in nodi ? id : null
}

const CATEGORIE: Categoria[] = ['fisica', 'eml', 'strumento', 'vita', 'terra', 'energia']
const categoriaDa = (s: unknown): Categoria => (CATEGORIE.includes(s as Categoria) ? (s as Categoria) : 'fisica')

type Grezzo = Record<string, unknown>
const comeLista = (v: unknown): Grezzo[] => (Array.isArray(v) ? (v as Grezzo[]) : [])

function normalizzaHotspot(g: Grezzo): HotspotScheda | null {
  const luogo = luogoDa(g.luogo)
  if (!luogo || typeof g.id !== 'string') return null
  const num = (v: unknown) => (typeof v === 'number' ? v : undefined)
  return {
    id: g.id, luogo, categoria: categoriaDa(g.categoria),
    titolo: String(g.titolo ?? ''), breve: String(g.breve ?? ''),
    punti: Array.isArray(g.punti) ? g.punti.map(String) : [],
    formula: typeof g.formula === 'string' && g.formula ? g.formula : undefined,
    slide_pptx: Array.isArray(g.slide_pptx) ? g.slide_pptx.map(Number).filter((n) => !Number.isNaN(n)) : [],
    badge: badgeDa(g.badge), fonte: String(g.fonte ?? ''),
    yaw: num(g.yaw), pitch: num(g.pitch), x: num(g.x), y: num(g.y),
    oggetto3d: typeof g.oggetto3d === 'string' ? g.oggetto3d : undefined,
    spostamento3d: Array.isArray(g.spostamento3d) ? (g.spostamento3d as [number, number, number]) : undefined,
  }
}

function normalizzaLuogo(g: Grezzo): Luogo | null {
  const id = luogoDa(g.id)
  if (!id) return null
  return {
    id, nome: String(g.nome ?? nodi[id].nome), sottotitolo: String(g.sottotitolo ?? nodi[id].sottotitolo),
    punti: Array.isArray(g.punti) ? g.punti.map(String) : [],
    voce: typeof g.voce === 'string' ? g.voce : typeof g.narrazione === 'string' ? g.narrazione : undefined,
    badge: badgeDa(g.badge ?? 'foto'), fonte: typeof g.fonte === 'string' ? g.fonte : undefined,
    slide_pptx: Array.isArray(g.slide_pptx) ? g.slide_pptx.map(Number) : undefined,
  }
}

const hotspotReali = comeLista(hotspotJson)
const nuovoFormato = hotspotReali.some((h) => 'categoria' in h)
const listaHotspot: HotspotScheda[] = nuovoFormato
  ? hotspotReali.map(normalizzaHotspot).filter((h): h is HotspotScheda => !!h)
  : hotspotEsempio

// luoghi.json è opzionale: la glob non fallisce se il file non esiste ancora
const luoghiFile = import.meta.glob('/content/luoghi.json', { eager: true, import: 'default' })
const luoghiReali = comeLista(Object.values(luoghiFile)[0])
const luoghiNuovi = luoghiReali.some((l) => 'punti' in l) ? luoghiReali.map(normalizzaLuogo).filter((l): l is Luogo => !!l) : []
const listaLuoghi: Luogo[] = [...luoghiNuovi, ...luoghiEsempio.filter((e) => !luoghiNuovi.some((l) => l.id === e.id))]

export const luogoDi = (id: NodoId): Luogo =>
  listaLuoghi.find((l) => l.id === id) ?? { id, nome: nodi[id].nome, sottotitolo: nodi[id].sottotitolo, punti: [], badge: nodi[id].badge }

export type Posizione =
  | { tipo: 'sfera'; yaw: number; pitch: number }  // gradi
  | { tipo: 'immagine'; x: number; y: number }
  | { tipo: 'oggetto3d'; oggetto: string; spostamento?: [number, number, number] }

export interface HotspotPosizionato extends HotspotScheda { pos: Posizione | null }

const GRIGLIA_IMMAGINE: [number, number][] = [[0.2, 0.4], [0.8, 0.4], [0.35, 0.68], [0.65, 0.68], [0.12, 0.6], [0.88, 0.62]]
const deg = (r: number) => (r * 180) / Math.PI

function posizioneDi(h: HotspotScheda, i: number): Posizione | null {
  const tipo = nodi[h.luogo].tipo
  const legacy = posizioni[h.id]
  if (tipo === 'eml') {
    const oggetto = h.oggetto3d ?? legacy?.oggetto3d
    return oggetto ? { tipo: 'oggetto3d', oggetto, spostamento: h.spostamento3d ?? legacy?.spostamento3d } : null
  }
  if (tipo === 'cupola' || tipo === 'finale') {
    const [gx, gy] = GRIGLIA_IMMAGINE[i % GRIGLIA_IMMAGINE.length]
    return { tipo: 'immagine', x: h.x ?? legacy?.x ?? gx, y: h.y ?? legacy?.y ?? gy }
  }
  if (h.yaw !== undefined && h.pitch !== undefined) return { tipo: 'sfera', yaw: h.yaw, pitch: h.pitch }
  if (legacy?.yaw !== undefined && legacy.pitch !== undefined) return { tipo: 'sfera', yaw: deg(legacy.yaw), pitch: deg(legacy.pitch) }
  const slot = nodi[h.luogo].slot[i]
  return slot ? { tipo: 'sfera', ...slot } : null
}

/** Hotspot di un luogo, con la posizione risolta (esplicita, poi legacy, poi slot libero). */
export function hotspotDi(luogo: NodoId): HotspotPosizionato[] {
  return listaHotspot.filter((h) => h.luogo === luogo).map((h, i) => ({ ...h, pos: posizioneDi(h, i) }))
}

export const schedaPerId = (id: string) => listaHotspot.find((h) => h.id === id) ?? null
export const fonteContenuti = nuovoFormato ? 'content/hotspot.json' : 'esempio-hotspot.ts'
