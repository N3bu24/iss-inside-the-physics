// Compatibilita': il registro vero e' in src/simulazioni/index.ts.
import type { ComponentType } from 'react'
import { SIMULAZIONI, componenteSimulazione, type PropsSimulazione } from '../simulazioni'

export type PropsAmbiente = PropsSimulazione

export const AMBIENTI: { id: string; titolo: string; Componente: ComponentType<PropsAmbiente> }[] = SIMULAZIONI.map((s) => ({
  id: s.id,
  titolo: s.titolo,
  Componente: componenteSimulazione(s.id)!,
}))

const per = (id: string) => AMBIENTI.find((a) => a.id === id)!.Componente
export const AmbienteCampo = per('campo')
export const AmbienteEnergia = per('energia')
export const AmbienteLevitazione = per('levitazione')
export const AmbienteRmn = per('rmn')
export const SimMotore = per('motore')
export const SimAutoinduzione = per('autoinduzione')
export const SimAurora = per('aurora')
