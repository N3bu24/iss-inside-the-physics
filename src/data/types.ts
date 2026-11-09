export type Provenienza = 'foto' | 'ia' | 'modello3d' | 'simulazione'
export type TipoTappa = 'panorama' | 'scena3d' | 'documentario'

export interface Media {
  tipo: 'immagine' | 'video'
  src: string
  didascalia?: string
  badge?: Provenienza
}

export interface Hotspot {
  id: string
  /** posizione nel panorama (radianti) */
  yaw?: number
  pitch?: number
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
