import { nodi, portelli, type NodoId } from './stazione'

/**
 * Pianta della ISS vista dall'alto (zenit in su, prua a destra, babordo in alto).
 * Coordinate nel viewBox 0 0 280 220. Un modulo è esplorabile se c'è un nodo del grafo con `nodo` uguale al suo id.
 */
export interface ModuloMappa {
  id: string
  nome: string
  x: number; y: number; w: number; h: number
  /** nodo del grafo se esplorabile */
  nodo?: NodoId
  tondo?: boolean
  /** posizione dell'etichetta */
  et: { x: number; y: number; ancora: 'start' | 'middle' | 'end' }
}

export const VIEWBOX = { w: 280, h: 220 }

export const moduliMappa: ModuloMappa[] = [
  { id: 'zvezda', nome: 'Zvezda', x: 12, y: 98, w: 56, h: 24, et: { x: 40, y: 138, ancora: 'middle' } },
  { id: 'zarya', nome: 'Zarya', x: 72, y: 100, w: 50, h: 20, et: { x: 97, y: 138, ancora: 'middle' } },
  { id: 'pma1', nome: 'PMA-1', x: 122, y: 104, w: 11, h: 12, et: { x: 127, y: 98, ancora: 'middle' } },
  { id: 'unity', nome: 'Unity', x: 134, y: 96, w: 28, h: 28, nodo: 'unity', et: { x: 148, y: 193, ancora: 'middle' } },
  { id: 'destiny', nome: 'Destiny', x: 164, y: 100, w: 52, h: 20, nodo: 'destiny', et: { x: 190, y: 134, ancora: 'middle' } },
  { id: 'harmony', nome: 'Harmony', x: 218, y: 96, w: 28, h: 28, nodo: 'harmony', et: { x: 254, y: 90, ancora: 'start' } },
  { id: 'pma2', nome: 'PMA-2', x: 247, y: 104, w: 11, h: 12, et: { x: 258, y: 124, ancora: 'middle' } },
  { id: 'columbus', nome: 'Columbus', x: 222, y: 126, w: 20, h: 38, nodo: 'columbus', et: { x: 232, y: 176, ancora: 'middle' } },
  { id: 'kibo', nome: 'Kibo', x: 218, y: 48, w: 28, h: 46, nodo: 'kibo', et: { x: 232, y: 40, ancora: 'middle' } },
  { id: 'tranquility', nome: 'Tranquility', x: 138, y: 68, w: 20, h: 26, nodo: 'tranquility', et: { x: 148, y: 44, ancora: 'middle' } },
  { id: 'cupola', nome: 'Cupola', x: 140, y: 52, w: 16, h: 16, nodo: 'cupola', tondo: true, et: { x: 130, y: 58, ancora: 'end' } },
  { id: 'quest', nome: 'Quest', x: 141, y: 126, w: 14, h: 26, et: { x: 148, y: 164, ancora: 'middle' } },
]

/** Elementi decorativi: traliccio e pannelli solari (sempre grigi). */
export const decorazioni: { x: number; y: number; w: number; h: number }[] = [
  { x: 188, y: 8, w: 4, h: 204 },
  { x: 166, y: 10, w: 20, h: 36 }, { x: 194, y: 10, w: 20, h: 36 },
  { x: 166, y: 174, w: 20, h: 36 }, { x: 194, y: 174, w: 20, h: 36 },
  { x: 24, y: 56, w: 40, h: 28 }, { x: 24, y: 136, w: 40, h: 28 },
]

export const moduloPerNodo = (n: NodoId) => moduliMappa.find((m) => m.id === nodi[n].modulo)!
export const centro = (m: ModuloMappa) => ({ x: m.x + m.w / 2, y: m.y + m.h / 2 })

/**
 * Orientamento della mappa: per ogni nodo panoramico, angolo (gradi, 0 = destra, orario) corrispondente a yaw 0.
 * Si ricava dal grafo: media circolare, sui portelli, di (direzione del modulo vicino sulla mappa - yaw del portello).
 */
export const orientamentoMappa: Partial<Record<NodoId, number>> = (() => {
  const out: Partial<Record<NodoId, number>> = {}
  for (const n of Object.values(nodi)) {
    if (n.tipo !== 'panorama') continue
    const c0 = centro(moduloPerNodo(n.id))
    let sx = 0, sy = 0
    for (const p of portelli[n.id]) {
      const dest = nodi[p.verso]
      if (dest.tipo !== 'panorama') continue
      const c1 = centro(moduloPerNodo(p.verso))
      const bearing = (Math.atan2(c1.y - c0.y, c1.x - c0.x) * 180) / Math.PI
      const off = ((bearing - p.yaw) * Math.PI) / 180
      sx += Math.cos(off); sy += Math.sin(off)
    }
    out[n.id] = (Math.atan2(sy, sx) * 180) / Math.PI
  }
  return out
})()
