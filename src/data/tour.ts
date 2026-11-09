import type { Tappa, ModuloMappa, Fenomeno } from './types'

/**
 * Struttura e navigazione del percorso. Ordine del percorso guidato = ordine dell'array.
 * Testi, hotspot e clip di voce vengono da content/*.json (src/data/loader.ts),
 * le posizioni degli hotspot da src/data/posizioni.ts.
 * Asset: panorami in public/panorami/<id>.jpg, audio in public/audio/<id-clip>.mp3.
 * Se un file manca, il sito usa un segnaposto.
 */
const pano = (id: string) => ({ panorama: `/panorami/${id}.jpg` })

export const tappe: Tappa[] = [
  {
    id: 'intro', titolo: 'La Stazione Spaziale Internazionale', sottotitolo: 'Un laboratorio a 400 km di quota',
    tipo: 'panorama', ...pano('intro'), modulo: 'esterno', tinta: '#0b2a6b', badge: 'ia', yawIniziale: 0,
    hotspot: [], clip: [],
    collegamenti: [{ a: 'nodo', yaw: 3.0, pitch: -0.05, etichetta: 'Entra nella stazione' }],
  },
  {
    id: 'nodo', titolo: 'Nodo di collegamento', sottotitolo: 'Il passaggio verso i laboratori',
    tipo: 'panorama', ...pano('nodo'), modulo: 'nodo', tinta: '#1d2a44', badge: 'foto', yawIniziale: 0,
    hotspot: [], clip: [],
    collegamenti: [
      { a: 'intro', yaw: 3.14, pitch: -0.05, etichetta: 'Indietro' },
      { a: 'columbus', yaw: 0, pitch: -0.05, etichetta: 'Verso Columbus' },
    ],
  },
  {
    id: 'columbus', titolo: 'Modulo Columbus', sottotitolo: 'Il laboratorio europeo (ESA)',
    tipo: 'panorama', ...pano('columbus'), modulo: 'columbus', tinta: '#12324a', badge: 'foto', yawIniziale: 0,
    hotspot: [], clip: [],
    collegamenti: [
      { a: 'nodo', yaw: 3.14, pitch: -0.05, etichetta: 'Indietro' },
      { a: 'eml', yaw: -0.8, pitch: -0.25, etichetta: "Guarda dentro l'EML" },
    ],
  },
  {
    id: 'eml', titolo: 'EML — Electromagnetic Levitator', sottotitolo: 'Levitare, fondere, solidificare',
    tipo: 'scena3d', modulo: 'columbus', badge: 'modello3d',
    hotspot: [], clip: [],
    collegamenti: [{ a: 'columbus', yaw: 0, pitch: 0, etichetta: 'Torna a Columbus' }],
  },
  {
    id: 'materiali', titolo: 'Materiali dallo spazio', sottotitolo: 'Leghe e proprietà senza gravità',
    tipo: 'panorama', ...pano('materiali'), modulo: 'columbus', tinta: '#2a1a12', badge: 'simulazione',
    hotspot: [], clip: [],
    collegamenti: [{ a: 'cupola', yaw: 0, pitch: -0.05, etichetta: 'Verso la Cupola' }],
  },
  {
    id: 'cupola', titolo: 'Cupola', sottotitolo: 'Lo sguardo sulla Terra',
    tipo: 'panorama', ...pano('cupola'), modulo: 'cupola', tinta: '#0a3a5a', badge: 'foto', yawIniziale: 0,
    hotspot: [], clip: [],
    collegamenti: [
      { a: 'materiali', yaw: 3.14, pitch: -0.05, etichetta: 'Indietro' },
      { a: 'finale', yaw: 0, pitch: -0.05, etichetta: 'Dallo spazio alla Terra' },
    ],
  },
  {
    id: 'finale', titolo: 'Dallo spazio alla Terra', sottotitolo: 'Innovazione, infrastrutture, salute',
    tipo: 'panorama', ...pano('finale'), modulo: 'cupola', tinta: '#0b3b2e', badge: 'ia', yawIniziale: 0,
    hotspot: [], clip: [],
    collegamenti: [{ a: 'intro', yaw: 3.14, pitch: -0.05, etichetta: 'Ricomincia' }],
  },
]

/** Schema ISS semplificato (viewBox 0 0 240 120). */
export const moduliMappa: ModuloMappa[] = [
  { id: 'esterno', nome: 'Esterno', x: 8, y: 52, w: 44, h: 16 },
  { id: 'nodo', nome: 'Nodo', x: 98, y: 50, w: 22, h: 20 },
  { id: 'columbus', nome: 'Columbus', x: 124, y: 52, w: 44, h: 16 },
  { id: 'cupola', nome: 'Cupola', x: 98, y: 74, w: 22, h: 16 },
]

/**
 * I cinque fenomeni dell'EML. `hotspot` = id dell'hotspot da cui il loader prende testo e approfondimento;
 * `clip` = clip di voce riprodotta quando si sceglie il fenomeno.
 */
export const fenomeni: (Fenomeno & { hotspot: string })[] = [
  { id: 'campo-variabile', titolo: 'Campo magnetico variabile', colore: 'cyan', hotspot: 'eml-campo-variabile', clip: 'eml-02',
    testo: 'La corrente alternata nelle bobine genera un campo magnetico che varia nel tempo.',
    latex: 'B(t)=B_0\\sin(\\omega t)' },
  { id: 'correnti-indotte', titolo: 'Correnti indotte', colore: 'cyan', hotspot: 'eml-correnti-indotte', clip: 'eml-03',
    testo: 'Il campo variabile induce correnti parassite nel campione conduttore.',
    latex: '\\varepsilon=-\\dfrac{d\\Phi_B}{dt}' },
  { id: 'joule', titolo: 'Riscaldamento per effetto Joule', colore: 'heat', hotspot: 'eml-joule', clip: 'eml-04',
    testo: 'Le correnti indotte dissipano energia e scaldano il campione.',
    latex: 'P=R\\,I^2' },
  { id: 'fusione', titolo: 'Fusione', colore: 'heat', hotspot: 'eml-fusione', clip: 'eml-05',
    testo: 'Raggiunta la temperatura di fusione il campione diventa una goccia liquida.' },
  { id: 'solidificazione', titolo: 'Solidificazione', colore: 'cyan', hotspot: 'eml-solidificazione', clip: 'eml-05',
    testo: 'Spegnendo il riscaldamento il campione si raffredda e solidifica senza contatto.' },
]

export const tappaPerId = (id: string) => tappe.find((t) => t.id === id)!
