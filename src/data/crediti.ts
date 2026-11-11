/** Elenco completo dei crediti (da public/panorami/CREDITI.md + voce narrante + render). */
export interface VoceCredito { file: string; soggetto: string; fonte: string; credito: string; licenza: string }

const ESA = 'ESA Standard Licence, uso educativo non commerciale con credito'
const PD = 'Pubblico dominio (credito NASA)'

export const crediti: VoceCredito[] = [
  { file: 'columbus.jpg', soggetto: 'Modulo Columbus (ESA)', fonte: 'flickr.com/photos/europeanspaceagency/26356247791', credito: 'ESA/NASA – S. Cristoforetti', licenza: ESA },
  { file: 'nodo.jpg', soggetto: 'Harmony (Node 2)', fonte: 'flickr.com/photos/europeanspaceagency/26196096532', credito: 'ESA/NASA – S. Cristoforetti', licenza: ESA },
  { file: 'materiali.jpg', soggetto: 'Kibo (JAXA)', fonte: 'flickr.com/photos/europeanspaceagency/25933880313', credito: 'ESA/NASA – S. Cristoforetti', licenza: ESA },
  { file: 'cupola.jpg', soggetto: 'Tranquility (Node 3), accesso alla Cupola', fonte: 'flickr.com/photos/europeanspaceagency/26599440852', credito: 'ESA/NASA – S. Cristoforetti', licenza: ESA },
  { file: 'destiny.jpg', soggetto: 'Destiny (US Lab)', fonte: 'flickr.com/photos/europeanspaceagency/26121878046', credito: 'ESA/NASA – S. Cristoforetti', licenza: ESA },
  { file: 'unity.jpg', soggetto: 'Unity (Node 1)', fonte: 'flickr.com/photos/europeanspaceagency/25827604346', credito: 'ESA/NASA – S. Cristoforetti', licenza: ESA },
  { file: 'intro.jpg', soggetto: "ISS dall'esterno (Crew Dragon flyaround, 8/11/2021)", fonte: 'images.nasa.gov iss066e080762', credito: 'NASA', licenza: PD },
  { file: 'cupola-foto.jpg', soggetto: 'Vista dalla Cupola', fonte: 'images.nasa.gov iss025e011750', credito: 'NASA', licenza: PD },
  { file: 'ambienti/terra-bluemarble.jpg', soggetto: 'Terra, mosaico Blue Marble (ambiente del campo magnetico)', fonte: 'Wikimedia Commons: Whole world - land and oceans 12000.jpg', credito: 'NASA Earth Observatory', licenza: PD },
  { file: 'ambienti/iss.glb', soggetto: 'Modello 3D della ISS (ambiente del campo magnetico)', fonte: 'science.nasa.gov/3d-resources/international-space-station-iss-b', credito: 'NASA', licenza: 'NASA 3D Resources, uso libero con credito' },
  { file: 'video/terra-cupola.mp4', soggetto: 'La Terra dalla ISS (Cupola)', fonte: 'svs.gsfc.nasa.gov/30771', credito: 'NASA Johnson / NASA SVS', licenza: 'Linee guida NASA, uso educativo con credito' },
]

export const creditiAltri: { titolo: string; testo: string }[] = [
  { titolo: 'Voli tra i moduli', testo: 'Volo: ricostruzione IA generata con Higgsfield (Seedance 2.0 e Kling 3.0) a partire da viste dei panorami ESA. Non sono riprese reali.' },
  { titolo: 'Foto delle schede', testo: 'Fotografie dei punti di interesse (img/poi): NASA, pubblico dominio con credito. La GIF del campione che solidifica: ESA/DLR, ESA Standard Licence (uso educativo con credito).' },
  { titolo: 'Video della Cupola', testo: 'Video: NASA Johnson – ISS View of Planet Earth (NASA SVS).' },
  { titolo: 'Diretta dalla ISS (opzionale)', testo: 'Diretta: NASA, "Live High-Definition Views from the International Space Station" (stream ufficiale NASA su YouTube), attivabile dalle Impostazioni. Posizione della ISS: API pubblica wheretheiss.at. Mappa: NASA Earth Observatory (Blue Marble Next Generation, pubblico dominio).' },
  { titolo: 'Capsula di rientro (finale)', testo: 'Modello 3D: ricostruzione in Blender (panorama dell’interno della capsula). Plasma del rientro: simulazione concettuale animata via shader. Non sono riprese reali.' },
  { titolo: 'Voce narrante', testo: 'Sintesi vocale ElevenLabs (voce maschile generata con intelligenza artificiale, non una persona reale).' },
  { titolo: 'Audio di sottofondo', testo: 'Audio di sottofondo: effetti sonori generati con ElevenLabs (ricostruzione, non registrazione reale della ISS). Il rombo del rientro: ElevenLabs Sound Effects + sintesi.' },
  { titolo: 'Video e animazioni', testo: 'Simulazione concettuale – render Blender. Non sono riprese reali.' },
  { titolo: "Modello 3D dell'EML", testo: 'Modello concettuale realizzato per questo progetto, a scopo didattico.' },
]
