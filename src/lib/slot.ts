import { useEffect, useState } from 'react'

/**
 * Zona comune sopra i sottotitoli nell'interfaccia compatta (telefono/tablet), creata da src/explore/InterfacciaCompatta.tsx.
 * Chi deve mettere un comando in basso (es. «Avvia esperimento», fenomeni dell'EML) lo inserisce lì con createPortal:
 * così tutto si impila in una colonna sola e niente si sovrappone. Sul desktop la zona non esiste (null).
 */
export const ID_SLOT_SOPRA = 'slot-sopra-sottotitoli'

export function useSlotSopra(attivo = true): HTMLElement | null {
  const [el, setEl] = useState<HTMLElement | null>(null)
  useEffect(() => {
    if (!attivo) { setEl(null); return }
    let raf = 0
    const cerca = () => { const t = document.getElementById(ID_SLOT_SOPRA); if (t) setEl(t); else raf = requestAnimationFrame(cerca) }
    cerca()
    return () => cancelAnimationFrame(raf)
  }, [attivo])
  return el
}
