import { tappe, fenomeni } from './tour'
import type { Hotspot } from './types'

/**
 * Punto di integrazione dei contenuti scritti dall'altro agente.
 * Formati attesi (da adattare quando i file esisteranno):
 *  - /content/hotspot.json: { [tappaId]: { [hotspotId]: Partial<Hotspot> }, fenomeni: { [id]: Partial<Fenomeno> } }
 *  - /content/copioni.json: { [tappaId]: { testo | trascrizione: string } }
 * Copiare i file in public/content/. Se mancano, restano i segnaposto.
 */
export async function caricaContenuti(): Promise<void> {
  try {
    const [h, c] = await Promise.all([fetchJson('/content/hotspot.json'), fetchJson('/content/copioni.json')])
    if (h) {
      for (const t of tappe) {
        const ov = h[t.id] as Record<string, Partial<Hotspot>> | undefined
        if (!ov) continue
        t.hotspot = t.hotspot.map((x) => ({ ...x, ...(ov[x.id] ?? {}) }))
      }
      const fen = h['fenomeni'] as Record<string, Partial<(typeof fenomeni)[number]>> | undefined
      if (fen) fenomeni.forEach((f, i) => (fenomeni[i] = { ...f, ...(fen[f.id] ?? {}) }))
    }
    if (c) {
      for (const t of tappe) {
        const s = c[t.id] as { trascrizione?: string; testo?: string } | undefined
        if (s) t.trascrizione = s.trascrizione ?? s.testo
      }
    }
  } catch {
    /* restano i segnaposto */
  }
}

async function fetchJson(url: string): Promise<Record<string, unknown> | null> {
  const r = await fetch(url)
  if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) return null
  return r.json()
}
