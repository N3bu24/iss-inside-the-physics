import type { Provenienza } from './types'

/**
 * Grafo della stazione (vedi docs/stazione-grafo.md). Si aggiunge un ambiente aggiungendo dati qui:
 * un nodo in `nodi`, un arco in `archi`. Nessun componente va modificato.
 * Angoli in GRADI: yaw 0 = centro del panorama, positivo verso destra; pitch positivo verso l'alto.
 */
export type NodoId = 'harmony' | 'columbus' | 'kibo' | 'destiny' | 'unity' | 'tranquility' | 'eml' | 'cupola' | 'finale'
export type TipoNodo = 'panorama' | 'eml' | 'cupola' | 'finale'
export type AmbienteId = 'campo' | 'energia' | 'levitazione' | 'rmn'

/** Porta d'accesso a un ambiente interattivo a schermo intero (src/ambienti/). */
export interface PortaAmbiente {
  ambiente: AmbienteId
  titolo: string
  breve: string
  /** posizione nel panorama (gradi) oppure sull'immagine (0..1); senza coordinate = pulsante fisso a schermo */
  yaw?: number; pitch?: number
  x?: number; y?: number
}

export interface Nodo {
  id: NodoId
  nome: string
  sottotitolo: string
  tipo: TipoNodo
  panorama?: string
  /** sguardo iniziale se si entra senza provenire da un portello (gradi) */
  yawIniziale: number
  pitchIniziale: number
  /** id del modulo sulla mini-mappa */
  modulo: string
  credito: string
  badge: Provenienza
  tinta: string
  /** posizioni libere (gradi) dove collocare hotspot senza coordinate proprie, lontano dai portelli */
  slot: { yaw: number; pitch: number }[]
  porte?: PortaAmbiente[]
  /** portelli visibili ma non percorribili (es. Quest, Zarya) */
  chiusi?: { yaw: number; pitch: number; etichetta: string }[]
}

const PANO = 'Panorama: ESA/NASA – S. Cristoforetti'
const FOTO = 'Foto: NASA'

export const nodi: Record<NodoId, Nodo> = {
  harmony: {
    id: 'harmony', nome: 'Harmony', sottotitolo: 'Node 2: lo snodo verso i laboratori', tipo: 'panorama', panorama: '/panorami/nodo.jpg',
    yawIniziale: 0, pitchIniziale: 3, modulo: 'harmony', credito: PANO, badge: 'foto', tinta: '#1d2a44',
    slot: [{ yaw: 60, pitch: 8 }, { yaw: -60, pitch: 8 }, { yaw: 95, pitch: 40 }, { yaw: -95, pitch: 40 }, { yaw: 30, pitch: -30 }, { yaw: -30, pitch: -30 }],
  },
  columbus: {
    id: 'columbus', nome: 'Columbus', sottotitolo: 'Il laboratorio europeo (ESA)', tipo: 'panorama', panorama: '/panorami/columbus.jpg',
    yawIniziale: 8, pitchIniziale: 3, modulo: 'columbus', credito: PANO, badge: 'foto', tinta: '#12324a',
    slot: [{ yaw: -90, pitch: 8 }, { yaw: -45, pitch: 15 }, { yaw: 140, pitch: 12 }, { yaw: -140, pitch: 12 }, { yaw: 50, pitch: 38 }, { yaw: -50, pitch: -25 }],
    porte: [{ ambiente: 'rmn', titolo: 'Risonanza magnetica', breve: "Entra nell'ambiente interattivo sulla RMN", yaw: -20, pitch: -10 }],
  },
  kibo: {
    id: 'kibo', nome: 'Kibo', sottotitolo: 'Il laboratorio giapponese (JAXA)', tipo: 'panorama', panorama: '/panorami/materiali.jpg',
    yawIniziale: 0, pitchIniziale: 3, modulo: 'kibo', credito: PANO, badge: 'foto', tinta: '#2a1a12',
    slot: [{ yaw: 0, pitch: 8 }, { yaw: 60, pitch: 12 }, { yaw: -60, pitch: 12 }, { yaw: 120, pitch: 35 }, { yaw: -120, pitch: 35 }, { yaw: 0, pitch: -40 }],
  },
  destiny: {
    id: 'destiny', nome: 'Destiny', sottotitolo: 'Il laboratorio statunitense', tipo: 'panorama', panorama: '/panorami/destiny.jpg',
    yawIniziale: 0, pitchIniziale: 3, modulo: 'destiny', credito: PANO, badge: 'foto', tinta: '#1b2438',
    slot: [{ yaw: 90, pitch: 8 }, { yaw: -90, pitch: 8 }, { yaw: 60, pitch: 35 }, { yaw: -60, pitch: 35 }, { yaw: 130, pitch: -20 }, { yaw: -130, pitch: -20 }],
  },
  unity: {
    id: 'unity', nome: 'Unity', sottotitolo: 'Node 1: il primo modulo americano', tipo: 'panorama', panorama: '/panorami/unity.jpg',
    yawIniziale: 90, pitchIniziale: 3, modulo: 'unity', credito: PANO, badge: 'foto', tinta: '#22283a',
    slot: [{ yaw: -135, pitch: 12 }, { yaw: 45, pitch: 35 }, { yaw: -45, pitch: 35 }, { yaw: 135, pitch: -30 }],
    porte: [{ ambiente: 'energia', titolo: 'Energia dal Sole', breve: "Entra nell'ambiente interattivo sull'energia", yaw: 135, pitch: 15 }],
    chiusi: [{ yaw: -90, pitch: 0, etichetta: 'Quest (camera stagna)' }, { yaw: 0, pitch: 0, etichetta: 'Zarya (segmento russo)' }],
  },
  tranquility: {
    id: 'tranquility', nome: 'Tranquility', sottotitolo: "Node 3: l'accesso alla Cupola", tipo: 'panorama', panorama: '/panorami/cupola.jpg',
    yawIniziale: -92, pitchIniziale: 0, modulo: 'tranquility', credito: PANO, badge: 'foto', tinta: '#0a3a5a',
    slot: [{ yaw: 90, pitch: 10 }, { yaw: 150, pitch: 10 }, { yaw: -30, pitch: 10 }, { yaw: 60, pitch: 45 }, { yaw: -150, pitch: 25 }],
  },
  eml: {
    id: 'eml', nome: 'EML — Electromagnetic Levitator', sottotitolo: 'Levitare, fondere, solidificare', tipo: 'eml',
    yawIniziale: 0, pitchIniziale: 0, modulo: 'columbus', credito: "Modello 3D concettuale dell'EML", badge: 'modello3d', tinta: '#0a1230', slot: [],
    porte: [{ ambiente: 'levitazione', titolo: 'Levitazione magnetica', breve: "Entra nell'ambiente interattivo sulla levitazione" }],
  },
  cupola: {
    id: 'cupola', nome: 'Cupola', sottotitolo: 'Lo sguardo sulla Terra', tipo: 'cupola', panorama: '/video/terra-cupola-poster.jpg',
    yawIniziale: 0, pitchIniziale: 0, modulo: 'cupola', credito: 'Video: NASA Johnson – ISS View of Planet Earth', badge: 'foto', tinta: '#0a3a5a', slot: [],
    porte: [{ ambiente: 'campo', titolo: 'Il campo magnetico terrestre', breve: "Entra nell'ambiente interattivo sul campo magnetico", x: 0.5, y: 0.5 }],
  },
  finale: {
    id: 'finale', nome: 'Dallo spazio alla Terra', sottotitolo: 'Innovazione, infrastrutture, salute', tipo: 'finale', panorama: '/video/terra-cupola-poster.jpg',
    yawIniziale: 0, pitchIniziale: 0, modulo: 'cupola', credito: 'Video: NASA Johnson – ISS View of Planet Earth', badge: 'foto', tinta: '#05070f', slot: [],
  },
}

export interface Estremo { nodo: NodoId; yaw: number; pitch: number }
/**
 * Un arco = un portello visto dai due lati. `voloAvanti` (a -> b) e `voloIndietro` (b -> a) sono i video del volo;
 * se omessi vale la convenzione public/voli/<da>__<a>.mp4 (usato solo se il file esiste).
 */
export interface Arco {
  a: Estremo; b: Estremo; voloAvanti?: string; voloIndietro?: string
  /** sguardo all'arrivo (gradi) se diverso da "di spalle al portello": a->b e b->a */
  arrivoAvanti?: { yaw: number; pitch: number }; arrivoIndietro?: { yaw: number; pitch: number }
}

export const archi: Arco[] = [
  { a: { nodo: 'harmony', yaw: 0, pitch: 0 }, b: { nodo: 'destiny', yaw: 180, pitch: 0 } },
  { a: { nodo: 'harmony', yaw: -150, pitch: 0 }, b: { nodo: 'columbus', yaw: 90, pitch: 0 } },
  { a: { nodo: 'harmony', yaw: 150, pitch: 0 }, b: { nodo: 'kibo', yaw: 180, pitch: 0 } },
  { a: { nodo: 'destiny', yaw: 0, pitch: 0 }, b: { nodo: 'unity', yaw: 180, pitch: 0 } },
  { a: { nodo: 'unity', yaw: 90, pitch: 0 }, b: { nodo: 'tranquility', yaw: -92, pitch: 0 }, arrivoAvanti: { yaw: 180, pitch: 0 } },
  // passaggi verso scene non panoramiche
  { a: { nodo: 'columbus', yaw: 8, pitch: 20 }, b: { nodo: 'eml', yaw: 0, pitch: 0 } },
  // Cupola: nessun video di volo, ma zoom nel panorama verso il nadir e dissolvenza nella Terra (vedi Esplora)
  { a: { nodo: 'tranquility', yaw: 0, pitch: -70 }, b: { nodo: 'cupola', yaw: 0, pitch: 0 } },
  { a: { nodo: 'cupola', yaw: 0, pitch: 0 }, b: { nodo: 'finale', yaw: 0, pitch: 0 } },
]

/** Portello orientato: visto da `da`, porta a `verso`. */
export interface Portello {
  da: NodoId
  verso: NodoId
  yaw: number
  pitch: number
  /** yaw/pitch del portello dal lato di arrivo */
  yawArrivo: number
  pitchArrivo: number
  /** URL del video di volo se dichiarato nell'arco (altrimenti vale la convenzione) */
  video?: string
  /** sguardo all'arrivo (gradi), se dichiarato nell'arco */
  arrivo?: { yaw: number; pitch: number }
  /** posizione sull'immagine (0..1) per i nodi non panoramici */
  x?: number; y?: number
}

export const urlVolo = (da: NodoId, a: NodoId) => `/voli/${da}__${a}.mp4`

export const portelli: Record<NodoId, Portello[]> = (() => {
  const out = Object.fromEntries((Object.keys(nodi) as NodoId[]).map((k) => [k, [] as Portello[]])) as Record<NodoId, Portello[]>
  for (const arco of archi) {
    out[arco.a.nodo].push({ da: arco.a.nodo, verso: arco.b.nodo, yaw: arco.a.yaw, pitch: arco.a.pitch, yawArrivo: arco.b.yaw, pitchArrivo: arco.b.pitch, video: arco.voloAvanti, arrivo: arco.arrivoAvanti })
    out[arco.b.nodo].push({ da: arco.b.nodo, verso: arco.a.nodo, yaw: arco.b.yaw, pitch: arco.b.pitch, yawArrivo: arco.a.yaw, pitchArrivo: arco.a.pitch, video: arco.voloIndietro, arrivo: arco.arrivoIndietro })
  }
  // portelli dei nodi non panoramici: posizione sull'immagine
  for (const p of out.cupola) { if (p.verso === 'finale') { p.x = 0.5; p.y = 0.15 } else { p.x = 0.5; p.y = 0.74 } }
  for (const p of out.finale) { p.x = 0.5; p.y = 0.74 }
  return out
})()

export const portelloVerso = (da: NodoId, a: NodoId) => portelli[da].find((p) => p.verso === a)

/** Percorso più breve (lista di nodi, estremi inclusi) o null. */
export function rotta(da: NodoId, a: NodoId): NodoId[] | null {
  if (da === a) return [da]
  const prec = new Map<NodoId, NodoId>([[da, da]])
  const coda: NodoId[] = [da]
  while (coda.length) {
    const n = coda.shift()!
    for (const p of portelli[n]) {
      if (prec.has(p.verso)) continue
      prec.set(p.verso, n)
      if (p.verso === a) {
        const r: NodoId[] = [a]
        while (r[0] !== da) r.unshift(prec.get(r[0])!)
        return r
      }
      coda.push(p.verso)
    }
  }
  return null
}

/** Visita guidata = cammino nel grafo (ogni coppia consecutiva è un portello). */
export const percorsoGuidato: NodoId[] = [
  'harmony', 'columbus', 'eml', 'columbus', 'harmony', 'kibo', 'harmony', 'destiny', 'unity', 'tranquility', 'cupola', 'finale',
]

/** Tappe suggerite: barra discreta in alto, in sequenza. Il clic vola fin lì passando per i moduli intermedi. */
export const tappeSuggerite: { nodo: NodoId; etichetta: string }[] = [
  { nodo: 'harmony', etichetta: 'Harmony' },
  { nodo: 'columbus', etichetta: 'Columbus' },
  { nodo: 'eml', etichetta: 'EML' },
  { nodo: 'kibo', etichetta: 'Kibo' },
  { nodo: 'destiny', etichetta: 'Destiny' },
  { nodo: 'unity', etichetta: 'Unity' },
  { nodo: 'tranquility', etichetta: 'Tranquility' },
  { nodo: 'cupola', etichetta: 'Cupola' },
  { nodo: 'finale', etichetta: 'Finale' },
]
