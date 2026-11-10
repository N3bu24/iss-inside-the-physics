import { useEffect } from 'react'
import { preferenze } from './preferenze'

/** Riflette le preferenze sugli attributi di <html> (data-testo, data-contrasto, data-riduci) letti da src/esplora.css. */
function applica() {
  const p = preferenze.get()
  const r = document.documentElement
  r.dataset.testo = p.dimensioneTesto
  if (p.altoContrasto) r.dataset.contrasto = 'alto'; else delete r.dataset.contrasto
  if (p.riduciAnimazioni) r.dataset.riduci = '1'; else delete r.dataset.riduci
}

/** Da usare una volta in App: applica subito e a ogni cambio. */
export function useApplicaPreferenze() {
  useEffect(() => {
    applica()
    return preferenze.ascolta(applica)
  }, [])
}
