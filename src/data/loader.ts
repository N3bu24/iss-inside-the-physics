import hotspotJson from '@content/hotspot.json'
import copioniJson from '@content/copioni.json'
import { tappe, fenomeni } from './tour'
import { posizioni } from './posizioni'
import type { Provenienza } from './types'

/**
 * Integra a build time i contenuti reali:
 *  - content/hotspot.json: [{ id, tappa, titolo, testo, approfondimento?, badge, fonte }]
 *  - content/copioni.json: [{ id, tappa, testo, durata_stimata_s }]   (un id per clip, audio = public/audio/<id>.mp3)
 * Si applica una volta sola all'import (effetto collaterale voluto: i dati sono pronti prima del render).
 */

const BADGE: Record<string, Provenienza> = {
  'foto reale': 'foto',
  'ricostruzione ia': 'ia',
  'modello 3d': 'modello3d',
  'simulazione concettuale': 'simulazione',
}
const badgeDa = (s: string): Provenienza => BADGE[s.trim().toLowerCase()] ?? 'ia'

interface HotspotJson { id: string; tappa: string; titolo: string; testo: string; approfondimento?: string; badge: string; fonte?: string }
interface ClipJson { id: string; tappa: string; testo: string; durata_stimata_s?: number }

function applica() {
  const hs = hotspotJson as HotspotJson[]
  const clip = copioniJson as ClipJson[]
  for (const t of tappe) {
    t.hotspot = hs
      .filter((h) => h.tappa === t.id)
      .map((h) => ({
        id: h.id,
        titolo: h.titolo,
        testo: h.testo,
        approfondimento: h.approfondimento,
        badge: badgeDa(h.badge),
        fonte: h.fonte,
        ...posizioni[h.id],
      }))
    t.clip = clip
      .filter((c) => c.tappa === t.id)
      .map((c) => ({ id: c.id, testo: c.testo, durata: c.durata_stimata_s ?? Math.max(8, c.testo.length / 14), audio: `/audio/${c.id}.mp3` }))
  }
  // i fenomeni riprendono testo e approfondimento dal rispettivo hotspot
  for (const f of fenomeni) {
    const h = hs.find((x) => x.id === f.hotspot)
    if (!h) continue
    f.testo = h.testo
    f.approfondimento = h.approfondimento
  }
}
applica()
