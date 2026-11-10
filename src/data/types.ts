import type { NodoId } from './stazione'
export type Provenienza = 'foto' | 'ia' | 'modello3d' | 'simulazione'
export type TipoTappa = 'panorama' | 'scena3d' | 'documentario' | 'immagine'

export interface Media {
  tipo: 'immagine' | 'video'
  src: string
  didascalia?: string
  badge?: Provenienza
  /** credito mostrato sotto il media (es. "NASA") */
  credito?: string
}

export type Categoria = 'fisica' | 'eml' | 'strumento' | 'vita' | 'terra' | 'energia'

export interface Hotspot {
  categoria?: Categoria
  id: string
  /** posizione nel panorama (radianti) */
  yaw?: number
  pitch?: number
  /** posizione su tappe di tipo 'immagine' (0..1 sull'immagine, origine in alto a sinistra) */
  x?: number
  y?: number
  /** oggetto nominato del modello 3D a cui agganciare il punto (+ spostamento in unità scena) */
  oggetto3d?: string
  spostamento3d?: [number, number, number]
  /** fonte citata nel contenuto */
  fonte?: string
  titolo: string
  testo: string
  /** LaTeX opzionale, mostrato in un pannello espandibile */
  approfondimento?: string
  approfondimentoTitolo?: string
  media?: Media
  badge: Provenienza
  /** id della simulazione collegata (bollino sul marcatore) */
  simulazione?: string
}

export interface Clip {
  id: string
  testo: string
  durata: number // secondi (stima dal copione)
  audio: string
}

export interface Clip {
  id: string
  testo: string
  /** secondi, stimati dal copione */
  durata: number
  audio: string
}

export interface Collegamento {
  a: string // id tappa di destinazione
  yaw: number
  pitch: number
  /** su tappe 'immagine' (0..1) al posto di yaw/pitch */
  x?: number
  y?: number
  etichetta?: string
}

export interface Tappa {
  id: string
  titolo: string
  sottotitolo?: string
  tipo: TipoTappa
  panorama?: string
  /** vista iniziale (rad) */
  yawIniziale?: number
  pitchIniziale?: number
  /** immagine a schermo intero (tipo 'immagine') con lento Ken Burns */
  immagine?: string
  /** larghezza/altezza della parte visibile dell'immagine (ritaglia in basso) */
  aspetto?: number
  /** velo scuro sopra l'immagine, 0..1 */
  velo?: number
  /** credito breve mostrato in basso a destra */
  credito?: string
  hotspot: Hotspot[]
  collegamenti: Collegamento[]
  /** clip di voce in ordine di riproduzione (audio in public/audio/<id-clip>.mp3) */
  clip: Clip[]
  /** id del modulo ISS sulla mini-mappa */
  modulo: string
  /** colore dominante del segnaposto panorama */
  tinta?: string
  badge: Provenienza
}

export interface ModuloMappa {
  id: string
  nome: string
  x: number
  y: number
  w: number
  h: number
}

export interface Fenomeno {
  id: string
  titolo: string
  testo: string
  latex?: string
  /** testo con formule inline $...$, in pannello espandibile */
  approfondimento?: string
  /** id della clip di voce associata */
  clip?: string
  colore: 'cyan' | 'heat'
}

/** Schede dei contenuti (hotspot e luoghi) come le legge il sito da content/*-v3.json. */
export interface FormulaScheda { latex: string; spiegazione?: string }
export interface ImmagineScheda { src: string; didascalia?: string; credito?: string }

export interface HotspotScheda {
  id: string
  luogo: NodoId
  categoria: Categoria
  titolo: string
  breve: string
  punti: string[]
  formula?: string
  /** formato esteso (opzionale, compatibile con i campi sopra) */
  paragrafi?: string[]
  formule?: FormulaScheda[]
  immagini?: ImmagineScheda[]
  /** id di una simulazione da aprire con "Avvia simulazione" */
  simulazione?: string
  /** testo della voce (audio in public/audio/poi/<id>.mp3) */
  voce?: string
  slide_pptx: number[]
  badge: Provenienza
  fonte: string
  yaw?: number; pitch?: number
  x?: number; y?: number
  oggetto3d?: string
  spostamento3d?: [number, number, number]
}

export interface Luogo {
  id: NodoId
  nome: string
  sottotitolo: string
  punti: string[]
  /** testo della voce breve (sottotitoli); l'audio è public/audio/luoghi/<id>.mp3 */
  voce?: string
  badge: Provenienza
  fonte?: string
  slide_pptx?: number[]
  /** seconda provenienza (es. modello 3D + simulazione concettuale) e nota di provenienza */
  badgeExtra?: Provenienza
  nota?: string
}
