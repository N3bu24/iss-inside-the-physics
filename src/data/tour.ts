import type { Tappa, ModuloMappa, Fenomeno } from './types'

/**
 * Ordine del percorso guidato = ordine dell'array.
 * Testi segnaposto: verranno sostituiti da content/hotspot.json e content/copioni.json
 * tramite src/data/loader.ts.
 * Asset: panorami in public/panorami/<id>.jpg, audio in public/audio/<id>.mp3,
 * sottotitoli in public/subs/<id>.vtt. Se un file manca, il sito usa un segnaposto.
 */
const base = (id: string) => ({
  panorama: `/panorami/${id}.jpg`,
  audio: `/audio/${id}.mp3`,
  sottotitoli: `/subs/${id}.vtt`,
})

export const tappe: Tappa[] = [
  {
    id: 'intro', titolo: 'La Stazione Spaziale Internazionale', sottotitolo: 'Un laboratorio a 400 km di quota',
    tipo: 'panorama', ...base('intro'), modulo: 'esterno', tinta: '#0b2a6b', badge: 'ia', yawIniziale: 0,
    hotspot: [
      { id: 'intro-iss', yaw: 0.6, pitch: 0.1, titolo: 'La ISS in orbita', badge: 'ia',
        testo: 'Testo segnaposto: la ISS orbita a circa 400 km di altezza e compie un giro della Terra ogni 90 minuti.' },
    ],
    collegamenti: [{ a: 'nodo', yaw: 3.0, pitch: -0.05, etichetta: 'Entra nella stazione' }],
  },
  {
    id: 'nodo', titolo: 'Nodo di collegamento', sottotitolo: 'Il passaggio verso i laboratori',
    tipo: 'panorama', ...base('nodo'), modulo: 'nodo', tinta: '#1d2a44', badge: 'foto', yawIniziale: 0,
    hotspot: [
      { id: 'nodo-1', yaw: 1.2, pitch: 0.05, titolo: 'Il nodo', badge: 'foto',
        testo: 'Testo segnaposto: i nodi connettono i moduli pressurizzati della stazione.' },
    ],
    collegamenti: [
      { a: 'intro', yaw: 3.14, pitch: -0.05, etichetta: 'Indietro' },
      { a: 'columbus', yaw: 0, pitch: -0.05, etichetta: 'Verso Columbus' },
    ],
  },
  {
    id: 'columbus', titolo: 'Modulo Columbus', sottotitolo: 'Il laboratorio europeo (ESA)',
    tipo: 'panorama', ...base('columbus'), modulo: 'columbus', tinta: '#12324a', badge: 'foto', yawIniziale: 0,
    hotspot: [
      { id: 'col-rack', yaw: 0.9, pitch: 0.0, titolo: 'Rack scientifici', badge: 'foto',
        testo: 'Testo segnaposto: Columbus ospita rack per fisica dei fluidi, scienza dei materiali e biologia.' },
      { id: 'col-eml', yaw: -0.8, pitch: 0.05, titolo: 'Materials Science Laboratory', badge: 'foto',
        testo: 'Testo segnaposto: qui è installato il levitatore elettromagnetico (EML).' },
    ],
    collegamenti: [
      { a: 'nodo', yaw: 3.14, pitch: -0.05, etichetta: 'Indietro' },
      { a: 'eml', yaw: -0.8, pitch: -0.25, etichetta: "Guarda dentro l'EML" },
    ],
  },
  {
    id: 'eml', titolo: 'EML — Electromagnetic Levitator', sottotitolo: 'Levitare, fondere, solidificare',
    tipo: 'scena3d', audio: '/audio/eml.mp3', sottotitoli: '/subs/eml.vtt', modulo: 'columbus', badge: 'modello3d',
    hotspot: [
      { id: 'eml-bobina', pos3d: [1.35, 0.5, 0], titolo: 'Bobine di rame', badge: 'modello3d',
        testo: 'Testo segnaposto: le bobine, percorse da corrente alternata ad alta frequenza, generano un campo magnetico variabile.',
        approfondimentoTitolo: 'Legge di Faraday-Neumann-Lenz',
        approfondimento: '\\varepsilon = -\\dfrac{d\\Phi_B}{dt}' },
      { id: 'eml-campione', pos3d: [0, 0.55, 0], titolo: 'Campione levitante', badge: 'modello3d',
        testo: 'Testo segnaposto: le correnti indotte nel campione producono forza di Lorentz e riscaldamento per effetto Joule.',
        approfondimentoTitolo: 'Potenza dissipata per effetto Joule',
        approfondimento: 'P = R\\,I^2' },
      { id: 'eml-camera', pos3d: [-1.3, -0.2, 0.4], titolo: 'Camera di processo', badge: 'modello3d',
        testo: 'Testo segnaposto: il processo avviene in atmosfera controllata, osservato da videocamere e pirometri.' },
    ],
    collegamenti: [{ a: 'columbus', yaw: 0, pitch: 0, etichetta: 'Torna a Columbus' }],
  },
  {
    id: 'materiali', titolo: 'Materiali dallo spazio', sottotitolo: 'Leghe e proprietà senza gravità',
    tipo: 'panorama', ...base('materiali'), modulo: 'columbus', tinta: '#2a1a12', badge: 'simulazione',
    hotspot: [
      { id: 'mat-1', yaw: 0.5, pitch: 0, titolo: 'Leghe metalliche', badge: 'simulazione',
        testo: 'Testo segnaposto: in microgravità si studia la solidificazione senza contenitore e senza convezione.' },
    ],
    collegamenti: [{ a: 'cupola', yaw: 0, pitch: -0.05, etichetta: 'Verso la Cupola' }],
  },
  {
    id: 'cupola', titolo: 'Cupola', sottotitolo: 'Lo sguardo sulla Terra',
    tipo: 'panorama', ...base('cupola'), modulo: 'cupola', tinta: '#0a3a5a', badge: 'foto', yawIniziale: 0,
    hotspot: [
      { id: 'cup-1', yaw: 0.4, pitch: 0.3, titolo: 'La Terra dalla Cupola', badge: 'foto',
        testo: 'Testo segnaposto: sette finestre per osservare la Terra e guidare il braccio robotico.' },
    ],
    collegamenti: [
      { a: 'materiali', yaw: 3.14, pitch: -0.05, etichetta: 'Indietro' },
      { a: 'finale', yaw: 0, pitch: -0.05, etichetta: 'Dallo spazio alla Terra' },
    ],
  },
  {
    id: 'finale', titolo: 'Dallo spazio alla Terra', sottotitolo: 'Innovazione, infrastrutture, salute',
    tipo: 'panorama', ...base('finale'), modulo: 'cupola', tinta: '#0b3b2e', badge: 'ia', yawIniziale: 0,
    hotspot: [
      { id: 'fin-1', yaw: 0.7, pitch: 0.05, titolo: 'Obiettivo 9 — Agenda 2030', badge: 'ia',
        testo: 'Testo segnaposto: levitazione elettromagnetica, Maglev e innovazione sui materiali.' },
    ],
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

export const fenomeni: Fenomeno[] = [
  { id: 'campo-variabile', titolo: 'Campo magnetico variabile', colore: 'cyan',
    testo: 'Testo segnaposto: la corrente alternata nelle bobine genera un campo magnetico che varia nel tempo.',
    latex: 'B(t)=B_0\\sin(\\omega t)' },
  { id: 'correnti-indotte', titolo: 'Correnti indotte', colore: 'cyan',
    testo: 'Testo segnaposto: il campo variabile induce correnti parassite nel campione conduttore.',
    latex: '\\varepsilon=-\\dfrac{d\\Phi_B}{dt}' },
  { id: 'joule', titolo: 'Riscaldamento per effetto Joule', colore: 'heat',
    testo: 'Testo segnaposto: le correnti indotte dissipano energia e scaldano il campione.',
    latex: 'P=R\\,I^2' },
  { id: 'fusione', titolo: 'Fusione', colore: 'heat',
    testo: 'Testo segnaposto: raggiunta la temperatura di fusione il campione diventa una goccia liquida.' },
  { id: 'solidificazione', titolo: 'Solidificazione', colore: 'cyan',
    testo: 'Testo segnaposto: spegnendo il riscaldamento il campione si raffredda e solidifica senza contatto.' },
]

export const tappaPerId = (id: string) => tappe.find((t) => t.id === id)!
