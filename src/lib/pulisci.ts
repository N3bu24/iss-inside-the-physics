/**
 * Rete di sicurezza sui testi mostrati: toglie le note di lavoro rimaste nei contenuti
 * ([DA VERIFICARE...], [da riscontrare...], [TODO...], ecc.) e i rimandi interni ai file di ricerca.
 */
const NOTA = /\s*\[[^\]]*(?:verificar|riscontr|todo|tbd|fixme|nota interna|non riverificat)[^\]]*\]/gi
const INTERNO = /\s*[(;,-]?\s*(?:URL )?preso da docs\/research[^.;)\]]*(?:non riverificato[^.;)\]]*)?\)?/gi

export function pulisciTesto(s: string): string {
  if (!s || (s.indexOf('[') < 0 && s.indexOf('docs/research') < 0)) return s
  return s
    .replace(NOTA, '')
    .replace(INTERNO, '')
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/ {2,}/g, ' ')
    .trim()
}

/** Applica `pulisciTesto` a ogni stringa di un valore JSON (ricorsivo). */
export function pulisciDati<T>(v: T): T {
  if (typeof v === 'string') return pulisciTesto(v) as unknown as T
  if (Array.isArray(v)) return v.map(pulisciDati) as unknown as T
  if (v && typeof v === 'object') {
    const o: Record<string, unknown> = {}
    for (const [k, x] of Object.entries(v)) o[k] = pulisciDati(x)
    return o as T
  }
  return v
}
