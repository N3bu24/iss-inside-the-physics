import { useSyncExternalStore } from 'react'

/**
 * Stato "veloce" dello sguardo (yaw/pitch in rad) fuori da React: si aggiorna a ogni frame
 * e solo i componenti che lo leggono con `useVista(selettore)` si ridisegnano quando il valore selezionato cambia.
 */
export interface Vista { yaw: number; pitch: number; portello: string | null }

let stato: Vista = { yaw: 0, pitch: 0, portello: null }
const ascoltatori = new Set<() => void>()

export const vista = {
  get: () => stato,
  set(v: Partial<Vista>) {
    const n = { ...stato, ...v }
    if (n.yaw === stato.yaw && n.pitch === stato.pitch && n.portello === stato.portello) return
    stato = n
    ascoltatori.forEach((l) => l())
  },
}

export function useVista<T>(selettore: (v: Vista) => T): T {
  return useSyncExternalStore(
    (cb) => { ascoltatori.add(cb); return () => { ascoltatori.delete(cb) } },
    () => selettore(stato),
  )
}
