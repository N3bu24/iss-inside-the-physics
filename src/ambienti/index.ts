import { lazy, type ComponentType } from 'react'
import { TESTI, type IdAmbiente } from './testi'

export type PropsAmbiente = { onClose: () => void }

/** Registro degli ambienti: per aggiungerne uno basta una riga (file + testi). */
export const AMBIENTI: { id: IdAmbiente; titolo: string; Componente: ComponentType<PropsAmbiente> }[] = [
  { id: 'campo', titolo: TESTI.campo.titolo, Componente: lazy(() => import('./AmbienteCampo')) },
  { id: 'energia', titolo: TESTI.energia.titolo, Componente: lazy(() => import('./AmbienteEnergia')) },
  { id: 'levitazione', titolo: TESTI.levitazione.titolo, Componente: lazy(() => import('./AmbienteLevitazione')) },
  { id: 'rmn', titolo: TESTI.rmn.titolo, Componente: lazy(() => import('./AmbienteRmn')) },
]

export const AmbienteCampo = AMBIENTI[0].Componente
export const AmbienteEnergia = AMBIENTI[1].Componente
export const AmbienteLevitazione = AMBIENTI[2].Componente
export const AmbienteRmn = AMBIENTI[3].Componente
