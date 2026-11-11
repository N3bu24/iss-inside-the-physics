import { useSyncExternalStore } from 'react'
import { impostaAmbientAttivo } from './ambient'

/**
 * Regia audio unica del sito.
 * 1) Interruttore generale (pulsante in basso a destra): `audioGlobale.set()` agisce SUBITO (sottofondo, voci registrate)
 *    senza aspettare il rendering di React (che con i panorami pesanti puo` tardare).
 * 2) UNA sola voce narrante alla volta: ogni voce che parte chiama `annunciaVoce()` e ferma quella in corso con una breve dissolvenza.
 */
let on = true
const ascoltatori = new Set<() => void>()

/** voce attualmente in corso (o appena avviata) e funzione per fermarla */
let corrente: { el: HTMLMediaElement; ferma: () => void } | null = null
/** tutte le voci conosciute, per applicare il muto istantaneo */
const note = new Set<HTMLMediaElement>()

const DISSOLVENZA_MS = 250

export const audioGlobale = {
  get: () => on,
  set(v: boolean) {
    if (v === on) return
    on = v
    impostaAmbientAttivo(v)
    for (const el of note) el.muted = !v
    ascoltatori.forEach((l) => l())
  },
  toggle() { audioGlobale.set(!on) },
  ascolta(cb: () => void) { ascoltatori.add(cb); return () => { ascoltatori.delete(cb) } },
}

export function useAudioGlobale(): boolean {
  return useSyncExternalStore(audioGlobale.ascolta, audioGlobale.get)
}

/** Dissolve il volume dell'elemento e poi lo mette in pausa (il volume originale viene ripristinato). */
function dissolviEFerma(el: HTMLMediaElement, dopo: () => void) {
  const v0 = el.volume
  const t0 = performance.now()
  const passo = () => {
    const k = Math.min(1, (performance.now() - t0) / DISSOLVENZA_MS)
    try { el.volume = v0 * (1 - k) } catch { /* ignora */ }
    if (k < 1 && !el.paused) { setTimeout(passo, 30); return }
    el.pause()
    try { el.volume = v0 } catch { /* ignora */ }
    dopo()
  }
  passo()
}

/**
 * Da chiamare quando una voce parte (evento `play`). Ferma l'eventuale altra voce in corso.
 * `ferma` viene chiamata dopo la dissolvenza se la voce deve cessare perche' ne parte un'altra (aggiorna lo stato).
 * Registra anche l'elemento per il muto istantaneo.
 */
export function annunciaVoce(el: HTMLMediaElement, ferma?: () => void) {
  note.add(el)
  el.muted = !on
  if (corrente && corrente.el !== el) {
    const prec = corrente
    dissolviEFerma(prec.el, prec.ferma)
  }
  corrente = { el, ferma: ferma ?? (() => {}) }
}

/** Da chiamare quando la voce finisce o l'elemento viene eliminato. */
export function congedaVoce(el: HTMLMediaElement) {
  note.delete(el)
  if (corrente?.el === el) corrente = null
}

/** Ferma la voce in corso (es. all'apertura di una simulazione). */
export function fermaVoce() {
  if (!corrente) return
  const prec = corrente
  corrente = null
  dissolviEFerma(prec.el, prec.ferma)
}
