import type { Hotspot } from './types'

/**
 * Posizione di ogni hotspot (per id, come in content/hotspot.json).
 * Panorami: yaw/pitch in radianti. Scena 3D: nome dell'oggetto del GLB (+ spostamento opzionale in unità scena).
 * Un hotspot senza posizione qui non compare nel mondo (resta nei dati).
 * Gli yaw evitano quelli dei collegamenti tra tappe (vedi tour.ts).
 */
export const posizioni: Record<string, Pick<Hotspot, 'yaw' | 'pitch' | 'oggetto3d' | 'spostamento3d'>> = {
  // intro
  'intro-iss': { yaw: 0.6, pitch: 0.1 },
  'intro-microgravita': { yaw: -0.9, pitch: 0.2 },
  'intro-pannelli': { yaw: 1.8, pitch: 0.15 },
  // nodo
  'nodo-vita': { yaw: 1.2, pitch: 0.05 },
  'nodo-moduli': { yaw: -1.2, pitch: 0.1 },
  'nodo-ricerca': { yaw: 2.2, pitch: 0.2 },
  // columbus (il rack dell'EML è vicino al collegamento verso la tappa eml)
  'columbus-lab': { yaw: 1.0, pitch: 0.1 },
  'columbus-rack': { yaw: -0.8, pitch: 0.12 },
  'columbus-controllo': { yaw: 2.0, pitch: 0.3 },
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
  'materiali-convezione': { yaw: 0.8, pitch: 0.05 },
  'materiali-leghe': { yaw: -0.8, pitch: 0.1 },
  // cupola
  'cupola-finestre': { yaw: 1.0, pitch: 0.35 },
  'cupola-terra': { yaw: -0.7, pitch: 0.2 },
  // finale
  'finale-maglev': { yaw: 0.7, pitch: 0.05 },
  'finale-correnti-parassite': { yaw: 1.5, pitch: 0.1 },
  'finale-motori': { yaw: -0.7, pitch: 0.1 },
  'finale-trasformatore': { yaw: 2.3, pitch: 0.1 },
  'finale-obiettivo9': { yaw: -1.5, pitch: 0.15 },
  'finale-art32': { yaw: -2.3, pitch: 0.1 },
}
