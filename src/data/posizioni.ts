import type { Hotspot } from './types'

/**
 * Posizione di ogni hotspot (per id, come in content/hotspot.json).
 * Panorami: yaw/pitch in radianti. Scena 3D: nome dell'oggetto del GLB (+ spostamento opzionale in unità scena).
 * Un hotspot senza posizione qui non compare nel mondo (resta nei dati).
 * Tappe 'immagine' (intro, finale): x/y in 0..1 sull'immagine. Panorami reali ESA/NASA: yaw 0 = centro immagine,
 * yaw +90 = a destra di 90 gradi; le posizioni sono state scelte guardando i panorami.
 * Gli yaw evitano quelli dei collegamenti tra tappe (vedi tour.ts).
 */
export const posizioni: Record<string, Pick<Hotspot, 'yaw' | 'pitch' | 'x' | 'y' | 'media' | 'oggetto3d' | 'spostamento3d'>> = {
  // intro
  'intro-iss': { x: 0.63, y: 0.37 },
  'intro-microgravita': { x: 0.5, y: 0.82 },
  'intro-pannelli': { x: 0.88, y: 0.6 },
  // nodo
  'nodo-vita': { yaw: -1.6, pitch: 0.1 },
  'nodo-moduli': { yaw: 0, pitch: 0.12 },
  'nodo-ricerca': { yaw: 2.3, pitch: 0.65 },
  // columbus (il rack dell'EML è vicino al collegamento verso la tappa eml)
  'columbus-lab': { yaw: -1.57, pitch: 0.05 },
  'columbus-rack': { yaw: 0.15, pitch: 0.4 },
  'columbus-controllo': { yaw: -0.73, pitch: 0.12 },
  // eml (oggetti del GLB)
  'eml-modello': { oggetto3d: 'chamber_assembly', spostamento3d: [0.9, 0.6, 0] },
  'eml-campo-variabile': { oggetto3d: 'coil_upper' },
  'eml-correnti-indotte': { oggetto3d: 'sample', spostamento3d: [0.35, 0.25, 0] },
  'eml-joule': { oggetto3d: 'sample', spostamento3d: [-0.35, 0.25, 0] },
  'eml-fusione': { oggetto3d: 'camera_axial' },
  'eml-solidificazione': { oggetto3d: 'pyrometer' },
  'eml-autoinduzione': { oggetto3d: 'coil_lower' },
  'eml-quattro-esperimenti': { oggetto3d: 'carousel' },
  // materiali
  'materiali-convezione': { yaw: 1.95, pitch: 0.38 },
  'materiali-leghe': { yaw: -1.8, pitch: 0.3 },
  // cupola
  'cupola-finestre': {
    yaw: -0.5, pitch: -1.2,
    media: { tipo: 'immagine', src: '/panorami/cupola-foto.jpg', didascalia: 'Vista dalla Cupola: la Terra di notte', badge: 'foto', credito: 'Foto: NASA' },
  },
  'cupola-terra': { yaw: -2.18, pitch: -0.78 },
  // finale
  'finale-maglev': { x: 0.45, y: 0.47 },
  'finale-correnti-parassite': { x: 0.27, y: 0.4 },
  'finale-motori': { x: 0.17, y: 0.62 },
  'finale-trasformatore': { x: 0.72, y: 0.4 },
  'finale-obiettivo9': { x: 0.55, y: 0.68 },
  'finale-art32': { x: 0.37, y: 0.58 },
}
