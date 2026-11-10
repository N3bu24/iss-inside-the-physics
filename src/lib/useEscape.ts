import { useEffect, useRef } from 'react'

// Gestore unico del tasto Esc per tutto il sito: un solo ascoltatore sulla finestra (fase di cattura)
// chiama, tra i gestori registrati, quello con priorità più alta (a parità, l'ultimo montato).
// Un gestore restituisce true se ha "consumato" Esc: allora l'evento non arriva agli altri
// ascoltatori dell'app (scheda sottostante, ecc.). Se restituisce false si passa al successivo.
type Voce = { f: () => boolean; priorita: number; ordine: number }
const voci: Voce[] = []
let contatore = 0
let attivo = false

function suTasto(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  const ordinate = [...voci].sort((a, b) => b.priorita - a.priorita || b.ordine - a.ordine)
  for (const v of ordinate) {
    if (v.f()) {
      e.stopImmediatePropagation()
      e.preventDefault()
      return
    }
  }
}

/** Priorità dei pannelli dell'esplorazione (scheda, nota, menu, Indice, Impostazioni): sotto le simulazioni (10),
 *  sopra i passi del nodo EML (5); tra pannelli vince l'ultimo aperto. */
export const PRIORITA_PANNELLO = 6

export function useEscape(gestore: () => boolean, priorita = 0) {
  const rif = useRef(gestore)
  rif.current = gestore
  useEffect(() => {
    const v: Voce = { f: () => rif.current(), priorita, ordine: contatore++ }
    voci.push(v)
    if (!attivo) {
      window.addEventListener('keydown', suTasto, true)
      attivo = true
    }
    return () => {
      voci.splice(voci.indexOf(v), 1)
      if (!voci.length) {
        window.removeEventListener('keydown', suTasto, true)
        attivo = false
      }
    }
  }, [priorita])
}
