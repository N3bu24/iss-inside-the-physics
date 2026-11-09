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
  /** posizione nella scena 3D */
  pos3d?: [number, number, number]
  titolo: string
  testo: string
  /** LaTeX opzionale, mostrato in un pannello espandibile */
  approfondimento?: string
  approfondimentoTitolo?: string
  media?: Media
  badge: Provenienza
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
  audio?: string
  sottotitoli?: string // URL .vtt
  trascrizione?: string
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
  colore: 'cyan' | 'heat'
}
