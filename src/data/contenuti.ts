import hotspotJsonGrezzo from '@content/hotspot-v3.json'
import { pulisciDati } from '../lib/pulisci'
import { nodi, type NodoId } from './stazione'
import { posizioni } from './posizioni'
import { type Categoria, type FormulaScheda, type HotspotScheda, type ImmagineScheda, type Luogo } from './esempio-hotspot'
import type { Provenienza } from './types'

/**
 * Loader dei contenuti. Usa content/hotspot-v3.json (e content/luoghi-v3.json, se c'è) solo quando sono nel nuovo formato
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

/**
 * Correzioni di posizione (gradi) per gli hotspot che, nei dati di content/hotspot-v3.json (`yaw_stimato`/`pitch_stimato`),
 * cadono a meno di ~15° da un portello, da un passaggio chiuso o da un altro punto: si sovrapporrebbero sullo schermo.
 * content/ non si modifica da qui: la correzione vive nel codice.
 */
const RIPOSIZIONA: Record<string, { yaw: number; pitch: number }> = {
  'columbus-rack-eml': { yaw: 30, pitch: 3 },     // era sul portello verso l'EML
  'columbus-laptop': { yaw: -48, pitch: 4 },      // troppo vicino a columbus-cavi
  'unity-airlock': { yaw: -89, pitch: 22 },       // era sul portello chiuso della Quest
  'unity-zarya': { yaw: 0, pitch: 22 },           // era sul portello chiuso di Zarya
  'tranquility-eclss': { yaw: -124, pitch: 12 },  // era sul portello verso Unity
  'tranquility-portello-cupola': { yaw: 36, pitch: -52 }, // era sul portello della Cupola
}

type Grezzo = Record<string, unknown>
const comeStringhe = (v: unknown): string[] => (Array.isArray(v) ? v.map(String).filter(Boolean) : [])
const toglidollari = (s: string) => s.replace(/^\s*\$+|\$+\s*$/g, '')
function formuleDa(v: unknown): FormulaScheda[] | undefined {
  if (!Array.isArray(v)) return undefined
  const out = (v as Grezzo[]).map((f) => (typeof f === 'string' ? { latex: toglidollari(f) } : { latex: toglidollari(String(f.latex ?? '')), spiegazione: f.spiegazione ? String(f.spiegazione) : undefined })).filter((f) => f.latex)
  return out.length ? out : undefined
}
function immaginiDa(v: unknown): ImmagineScheda[] | undefined {
  if (!Array.isArray(v)) return undefined
  const out = (v as Grezzo[]).filter((i) => i && typeof i.src === 'string').map((i) => ({ src: String(i.src), didascalia: i.didascalia ? String(i.didascalia) : undefined, credito: i.credito ? String(i.credito) : undefined }))
  return out.length ? out : undefined
}
const comeLista = (v: unknown): Grezzo[] => (Array.isArray(v) ? (v as Grezzo[]) : [])

function normalizzaHotspot(g: Grezzo): HotspotScheda | null {
  const luogo = luogoDa(g.luogo)
  if (!luogo || typeof g.id !== 'string') return null
  const num = (v: unknown) => (typeof v === 'number' ? v : undefined)
  return {
    id: g.id, luogo, categoria: categoriaDa(g.categoria),
    titolo: String(g.titolo ?? ''), breve: String(g.breve ?? ''),
    punti: Array.isArray(g.punti) ? g.punti.map(String) : [],
    formula: typeof g.formula === 'string' && g.formula ? g.formula.replace(/^\s*\$+|\$+\s*$/g, '') : undefined,
    slide_pptx: Array.isArray(g.slide_pptx) ? g.slide_pptx.map(Number).filter((n) => !Number.isNaN(n)) : [],
    badge: badgeDa(g.badge), fonte: String(g.fonte ?? ''),
    paragrafi: comeStringhe(g.paragrafi).length ? comeStringhe(g.paragrafi) : undefined,
    formule: formuleDa(g.formule), immagini: immaginiDa(g.immagini),
    voce: typeof g.voce === 'string' && g.voce ? g.voce : undefined,
    simulazione: typeof g.simulazione === 'string' && g.simulazione ? g.simulazione : undefined,
    yaw: RIPOSIZIONA[g.id]?.yaw ?? num(g.yaw) ?? num(g.yaw_stimato), pitch: RIPOSIZIONA[g.id]?.pitch ?? num(g.pitch) ?? num(g.pitch_stimato), x: num(g.x), y: num(g.y),
    oggetto3d: typeof g.oggetto3d === 'string' ? g.oggetto3d : undefined,
    spostamento3d: Array.isArray(g.spostamento3d) ? (g.spostamento3d as [number, number, number]) : undefined,
  }
}

function normalizzaLuogo(g: Grezzo): Luogo | null {
  const id = luogoDa(g.id)
  if (!id) return null
  const scheda = (g.scheda ?? {}) as Grezzo
  const punti = Array.isArray(g.punti) ? g.punti : Array.isArray(scheda.punti) ? scheda.punti : []
  return {
    id, nome: String(g.nome ?? nodi[id].nome), sottotitolo: String(g.sottotitolo ?? nodi[id].sottotitolo),
    punti: punti.map(String),
    voce: typeof g.voce === 'string' ? g.voce : typeof g.narrazione === 'string' ? g.narrazione : undefined,
    badge: badgeDa(g.badge ?? 'foto'), fonte: typeof g.fonte === 'string' ? g.fonte : undefined,
    slide_pptx: Array.isArray(g.slide_pptx) ? g.slide_pptx.map(Number) : Array.isArray(scheda.slide_pptx) ? scheda.slide_pptx.map(Number) : undefined,
  }
}

const hotspotJson = pulisciDati(hotspotJsonGrezzo)
const hotspotReali = comeLista(hotspotJson)
const nuovoFormato = hotspotReali.some((h) => 'categoria' in h)
const hotspotNuovi = nuovoFormato ? hotspotReali.map(normalizzaHotspot).filter((h): h is HotspotScheda => !!h) : []
// i luoghi senza hotspot reali (es. il finale) ricadono sugli esempi
const listaHotspot: HotspotScheda[] = hotspotNuovi // solo content/hotspot-v3.json (niente testi di esempio/v2)

// luoghi.json è opzionale: la glob non fallisce se il file non esiste ancora
const luoghiFile = import.meta.glob('/content/luoghi-v3.json', { eager: true, import: 'default' })
const luoghiReali = comeLista(pulisciDati(Object.values(luoghiFile)[0]))
const luoghiNuovi = luoghiReali.some((l) => 'punti' in l || 'scheda' in l) ? luoghiReali.map(normalizzaLuogo).filter((l): l is Luogo => !!l) : []
const listaLuoghi: Luogo[] = luoghiNuovi // solo content/luoghi-v3.json

export const luogoDi = (id: NodoId): Luogo =>
  listaLuoghi.find((l) => l.id === id) ?? { id, nome: nodi[id].nome, sottotitolo: nodi[id].sottotitolo, punti: [], badge: nodi[id].badge }

export type Posizione =
  | { tipo: 'sfera'; yaw: number; pitch: number }  // gradi
  | { tipo: 'immagine'; x: number; y: number }
  | { tipo: 'oggetto3d'; oggetto: string; spostamento?: [number, number, number] }

export interface HotspotPosizionato extends HotspotScheda { pos: Posizione | null }

/** oggetti del modello EML, assegnati in ordine agli hotspot senza `oggetto3d` */
const OGGETTI_EML: { oggetto: string; spostamento?: [number, number, number] }[] = [
  { oggetto: 'coil_upper', spostamento: [-0.6, 0.5, 0.4] }, { oggetto: 'sample', spostamento: [1.1, 1.25, 0.4] }, { oggetto: 'sample', spostamento: [-0.55, -0.5, 0.4] },
  { oggetto: 'coil_lower', spostamento: [0.93, -0.55, 0.4] }, { oggetto: 'chamber_assembly', spostamento: [-0.93, -1.5, 0.2] }, { oggetto: 'camera_axial', spostamento: [0.12, 0.5, 0] }, { oggetto: 'pyrometer' }, { oggetto: 'carousel' },
]
/** centri delle finestre della Cupola (frazioni dello schermo 16:9) */
const FINESTRE_CUPOLA: [number, number][] = [[0.69, 0.5], [0.594, 0.68], [0.406, 0.68], [0.31, 0.5], [0.406, 0.21], [0.594, 0.21]]
const GRIGLIA_IMMAGINE: [number, number][] = [[0.2, 0.4], [0.8, 0.4], [0.35, 0.68], [0.65, 0.68], [0.12, 0.6], [0.88, 0.62]]
const deg = (r: number) => (r * 180) / Math.PI

function posizioneDi(h: HotspotScheda, i: number): Posizione | null {
  const tipo = nodi[h.luogo].tipo
  const legacy = posizioni[h.id]
  if (tipo === 'eml') {
    const oggetto = h.oggetto3d ?? legacy?.oggetto3d
    if (oggetto) return { tipo: 'oggetto3d', oggetto, spostamento: h.spostamento3d ?? legacy?.spostamento3d }
    const o = OGGETTI_EML[i % OGGETTI_EML.length]
    return { tipo: 'oggetto3d', oggetto: o.oggetto, spostamento: o.spostamento }
  }
  if (tipo === 'cupola' || tipo === 'finale') {
    const griglia = tipo === 'cupola' ? FINESTRE_CUPOLA : GRIGLIA_IMMAGINE
    const [gx, gy] = griglia[i % griglia.length]
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
export const fonteContenuti = nuovoFormato ? 'content/hotspot-v3.json' : 'esempio-hotspot.ts'
