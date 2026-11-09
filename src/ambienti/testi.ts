// Testi degli ambienti interattivi (campo, energia, levitazione, rmn).
// Vengono da content/ambienti.json (testi approvati). Qui restano solo la mappa tra gli stati della scena
// e le chiavi delle didascalie del file, e il formato per il guscio comune delle simulazioni.
import ambientiGrezzo from '@content/ambienti.json'
import { pulisciDati } from '../lib/pulisci'
import { slideTesto, pulisciFormula } from '../simulazioni/contenuto'

export type TestoAmbiente = {
  titolo: string
  intro: string
  formula: string // LaTeX
  formulaNota: string
  agenda: string
  slide: string
  didascalie: Record<string, string>
}

type VoceAmbiente = {
  id: string
  titolo: string
  intro: string
  formula?: string
  collegamento_agenda?: string
  slide_pptx?: number[]
  didascalie_dinamiche: Record<string, string>
}

const file = pulisciDati(ambientiGrezzo) as unknown as VoceAmbiente[]

/** Chiave interna della scena -> una o più chiavi di `didascalie_dinamiche` (unite con uno spazio). */
const MAPPA: Record<string, Record<string, string[]>> = {
  campo: { ferma: ['velocita_zero'], reale: ['valore_predefinito'], esagerata: ['velocita_alta'] },
  energia: {
    abbassa: ['trasformatore_step_down', 'linea_10kv'],
    pari: ['vista_iss'],
    eleva: ['trasformatore_step_up', 'linea_380kv'],
  },
  levitazione: { fermo: ['magnete_fermo'], medio: ['magnete_veloce'], veloce: ['maglev_levita'], eml: ['eml_orbita'] },
  rmn: { riposo: ['campo_alto'], impulso: ['impulso'], fid: ['segnale'], rilassa: ['tessuto'] },
}

function costruisci<K extends string>(id: string): TestoAmbiente & { didascalie: Record<K, string> } {
  const v = file.find((x) => x.id === `amb-${id}`)
  const d = v?.didascalie_dinamiche ?? {}
  const didascalie: Record<string, string> = {}
  for (const [k, chiavi] of Object.entries(MAPPA[id])) didascalie[k] = chiavi.map((c) => d[c] ?? '').join(' ').trim()
  return {
    titolo: v?.titolo ?? id,
    intro: v?.intro ?? '',
    formula: pulisciFormula(v?.formula) ?? '',
    formulaNota: '',
    agenda: v?.collegamento_agenda ?? '',
    slide: slideTesto(v?.slide_pptx),
    didascalie: didascalie as Record<K, string>,
  }
}

export const TESTI = {
  campo: costruisci<'ferma' | 'reale' | 'esagerata'>('campo'),
  energia: costruisci<'abbassa' | 'pari' | 'eleva'>('energia'),
  levitazione: costruisci<'fermo' | 'medio' | 'veloce' | 'eml'>('levitazione'),
  rmn: costruisci<'riposo' | 'impulso' | 'fid' | 'rilassa'>('rmn'),
}

export type IdAmbiente = keyof typeof TESTI
