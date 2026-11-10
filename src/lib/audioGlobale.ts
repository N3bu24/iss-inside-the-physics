import { useSyncExternalStore } from 'react'

/**
 * Stato dell'interruttore audio generale (pulsante in basso a destra), condiviso con chi non riceve le prop
 * (es. la voce delle simulazioni). App.tsx lo aggiorna; si legge con `useAudioGlobale()` o `audioGlobale.get()`.
 */
let on = true
const ascoltatori = new Set<() => void>()

export const audioGlobale = {
  get: () => on,
  set(v: boolean) { if (v === on) return; on = v; ascoltatori.forEach((l) => l()) },
  ascolta(cb: () => void) { ascoltatori.add(cb); return () => { ascoltatori.delete(cb) } },
}

export function useAudioGlobale(): boolean {
  return useSyncExternalStore(audioGlobale.ascolta, audioGlobale.get)
}
