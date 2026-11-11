// Etichette dei valori mostrati sull'EML: da content/v11.json -> valori.eml, con ripiego nel codice se mancano.
import { pulisciDati } from '../lib/pulisci'

const moduli = import.meta.glob('/content/v11.json', { eager: true, import: 'default' }) as Record<string, unknown>

const RIPIEGO = { temperatura: 'Temperatura campione', frequenza: 'Frequenza bobina' }

export function etichetteEml(): typeof RIPIEGO {
  try {
    const raw = pulisciDati(Object.values(moduli)[0] as unknown) as { valori?: { eml?: Record<string, unknown> } } | undefined
    const v = raw?.valori?.eml ?? {}
    const t = (k: keyof typeof RIPIEGO) => (typeof v[k] === 'string' && (v[k] as string).trim() ? (v[k] as string).trim() : RIPIEGO[k])
    return { temperatura: t('temperatura'), frequenza: t('frequenza') }
  } catch {
    return RIPIEGO
  }
}
