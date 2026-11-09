import { lazy, type ComponentType } from 'react'

export type PropsSimulazione = { onClose: () => void }

export type VoceSimulazione = { id: string; titolo: string; load: () => Promise<{ default: ComponentType<PropsSimulazione> }> }

/**
 * Registro delle simulazioni. Per aggiungerne una: crea src/simulazioni/<Nome>.tsx
 * (export default function X({ onClose }), costruita su <SimulazioneShell/>) e aggiungi UNA riga qui sotto.
 */
export const SIMULAZIONI: VoceSimulazione[] = [
  { id: 'campo', titolo: 'La ISS nel campo magnetico terrestre', load: () => import('../ambienti/AmbienteCampo') },
  { id: 'energia', titolo: "L'energia di bordo: alternatore e trasformatore", load: () => import('../ambienti/AmbienteEnergia') },
  { id: 'levitazione', titolo: "Dall'EML al Maglev", load: () => import('../ambienti/AmbienteLevitazione') },
  { id: 'rmn', titolo: 'Risonanza magnetica e medicina spaziale', load: () => import('../ambienti/AmbienteRmn') },
  { id: 'motore', titolo: 'Motori e alternatori: lo stesso principio', load: () => import('./Motore') },
  { id: 'autoinduzione', titolo: 'Autoinduzione: interruttore e bobina', load: () => import('./Autoinduzione') },
  { id: 'aurora', titolo: 'Aurora: la forza di Lorentz', load: () => import('./Aurora') },
]

const cache = new Map<string, ComponentType<PropsSimulazione>>()
/** Componente (lazy) della simulazione con quell'id, oppure null. */
export function componenteSimulazione(id: string): ComponentType<PropsSimulazione> | null {
  const v = SIMULAZIONI.find((s) => s.id === id)
  if (!v) return null
  let c = cache.get(id)
  if (!c) {
    c = lazy(v.load)
    cache.set(id, c)
  }
  return c
}
