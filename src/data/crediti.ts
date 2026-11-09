/** Elenco completo dei crediti (da public/panorami/CREDITI.md + voce narrante + render). */
export interface VoceCredito { file: string; soggetto: string; fonte: string; credito: string; licenza: string }

const ESA = 'ESA Standard Licence, uso educativo non commerciale con credito'
const PD = 'Pubblico dominio (credito NASA)'

export const crediti: VoceCredito[] = [
  { file: 'columbus.jpg', soggetto: 'Modulo Columbus (ESA)', fonte: 'flickr.com/photos/europeanspaceagency/26356247791', credito: 'ESA/NASA – S. Cristoforetti', licenza: ESA },
  { file: 'nodo.jpg', soggetto: 'Harmony (Node 2)', fonte: 'flickr.com/photos/europeanspaceagency/26196096532', credito: 'ESA/NASA – S. Cristoforetti', licenza: ESA },
  { file: 'materiali.jpg', soggetto: 'Kibo (JAXA)', fonte: 'flickr.com/photos/europeanspaceagency/25933880313', credito: 'ESA/NASA – S. Cristoforetti', licenza: ESA },
  { file: 'cupola.jpg', soggetto: 'Tranquility (Node 3), accesso alla Cupola', fonte: 'flickr.com/photos/europeanspaceagency/26599440852', credito: 'ESA/NASA – S. Cristoforetti', licenza: ESA },
  { file: 'intro.jpg', soggetto: "ISS dall'esterno (Crew Dragon flyaround, 8/11/2021)", fonte: 'images.nasa.gov iss066e080762', credito: 'NASA', licenza: PD },
  { file: 'cupola-foto.jpg', soggetto: 'Vista dalla Cupola', fonte: 'images.nasa.gov iss025e011750', credito: 'NASA', licenza: PD },
]

export const creditiAltri: { titolo: string; testo: string }[] = [
  { titolo: 'Voce narrante', testo: 'Sintesi vocale ElevenLabs (voce generata con intelligenza artificiale).' },
  { titolo: 'Video e animazioni', testo: 'Simulazione concettuale – render Blender. Non sono riprese reali.' },
  { titolo: "Modello 3D dell'EML", testo: 'Modello concettuale realizzato per questo progetto, a scopo didattico.' },
]
