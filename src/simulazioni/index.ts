import { lazy, type ComponentType } from 'react'

export type PropsSimulazione = { onClose: () => void }

type Carica = () => Promise<{ default: ComponentType<PropsSimulazione> }>

/** Voce di registro: l'interfaccia (src/ui/Simulazioni.tsx) cerca `{ id, Componente }`. */
export type VoceSimulazione = { id: string; titolo: string; load: Carica; Componente: ComponentType<PropsSimulazione> }

/**
 * Registro delle simulazioni (id identici a content/simulazioni.json).
 * Nuova simulazione: crea src/simulazioni/<Nome>.tsx (export default function X({ onClose }), costruita su
 * <SimulazioneShell/>), scrivi i passi provvisori in passi.ts e aggiungi UNA riga in `DEFINIZIONI`.
 */
const DEFINIZIONI: { id: string; titolo: string; load: Carica }[] = [
  { id: 'campo', titolo: 'La ISS nel campo magnetico terrestre', load: () => import('../ambienti/AmbienteCampo') },
  { id: 'energia', titolo: "L'energia di bordo: alternatore e trasformatore", load: () => import('../ambienti/AmbienteEnergia') },
  { id: 'levitazione', titolo: "Dall'EML al Maglev", load: () => import('../ambienti/AmbienteLevitazione') },
  { id: 'rmn', titolo: 'Risonanza magnetica e medicina spaziale', load: () => import('../ambienti/AmbienteRmn') },
  { id: 'motore', titolo: 'Motori e alternatori: lo stesso principio', load: () => import('./Motore') },
  { id: 'autoinduzione', titolo: 'Autoinduzione: interruttore e bobina', load: () => import('./Autoinduzione') },
  { id: 'aurora', titolo: 'Aurora: la forza di Lorentz', load: () => import('./Aurora') },
]

export const SIMULAZIONI: VoceSimulazione[] = DEFINIZIONI.map((d) => ({ ...d, Componente: lazy(d.load) }))

/** Componente (lazy) della simulazione con quell'id, oppure null. */
export function componenteSimulazione(id: string): ComponentType<PropsSimulazione> | null {
  return SIMULAZIONI.find((s) => s.id === id)?.Componente ?? null
}
