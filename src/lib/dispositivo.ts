import { useSyncExternalStore } from 'react'

/**
 * Tipo di dispositivo per l'interfaccia responsive. REGOLA DEL PROGETTO: il desktop non cambia mai.
 * - 'desktop': tutto ciò che non rientra sotto (PC e portatili con mouse, finestra ≥ 1024 px): layout originale, invariato.
 * - 'tablet':  schermo touch (hover: none, pointer: coarse) oppure finestra tra 768 e 1023 px.
 * - 'telefono': larghezza < 768 px, oppure telefono in orizzontale (touch con altezza < 500 px).
 * Le STESSE soglie sono definite in CSS come varianti Tailwind in src/index.css:
 *   `compatto:` = tablet + telefono, `tel:` = solo telefono, `tab:` = solo tablet.
 * Ogni modifica responsive va scritta SOLO dentro queste varianti (CSS) o dietro `useDispositivo() !== 'desktop'` (React),
 * così le regole desktop restano identiche.
 */
export type Dispositivo = 'desktop' | 'tablet' | 'telefono'

export const MQ_TELEFONO = '(max-width: 767px), (hover: none) and (pointer: coarse) and (max-height: 500px)'
export const MQ_COMPATTO = '(max-width: 1023px), (hover: none) and (pointer: coarse)'

function calcola(): Dispositivo {
  if (typeof window === 'undefined' || !window.matchMedia) return 'desktop'
  if (window.matchMedia(MQ_TELEFONO).matches) return 'telefono'
  if (window.matchMedia(MQ_COMPATTO).matches) return 'tablet'
  return 'desktop'
}

let stato: Dispositivo = calcola()
const ascoltatori = new Set<() => void>()
if (typeof window !== 'undefined' && window.matchMedia) {
  const aggiorna = () => { const n = calcola(); if (n !== stato) { stato = n; ascoltatori.forEach((l) => l()) } }
  window.matchMedia(MQ_TELEFONO).addEventListener('change', aggiorna)
  window.matchMedia(MQ_COMPATTO).addEventListener('change', aggiorna)
}

export const dispositivo = { get: () => stato }

export function useDispositivo(): Dispositivo {
  return useSyncExternalStore((cb) => { ascoltatori.add(cb); return () => { ascoltatori.delete(cb) } }, () => stato)
}

/** true su telefono e tablet (tutto tranne il desktop). */
export function useCompatto(): boolean { return useDispositivo() !== 'desktop' }
