import { assetExists } from './assets'
import type { Tappa } from '../data/types'

const cache = new Map<string, string>()

/** Panorama equirettangolare segnaposto generato in canvas (2:1). */
export function generaPanoramaSegnaposto(t: Tappa): string {
  const hit = cache.get(t.id)
  if (hit) return hit
  const W = 2048, H = 1024
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const g = c.getContext('2d')!
  const tinta = t.tinta ?? '#12324a'
  const grad = g.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, '#02030a'); grad.addColorStop(0.5, tinta); grad.addColorStop(1, '#05070f')
  g.fillStyle = grad; g.fillRect(0, 0, W, H)
  // stelle / particelle
  let s = t.id.length * 7919
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < 700; i++) {
    g.fillStyle = `rgba(255,255,255,${0.2 + rnd() * 0.7})`
    g.fillRect(rnd() * W, rnd() * H * 0.9, 1 + rnd() * 1.5, 1 + rnd() * 1.5)
  }
  // griglia leggera per percepire il movimento
  g.strokeStyle = 'rgba(120,200,255,0.12)'; g.lineWidth = 1
  for (let x = 0; x <= W; x += W / 24) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke() }
  for (let y = 0; y <= H; y += H / 12) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke() }
  g.fillStyle = 'rgba(255,255,255,0.55)'; g.textAlign = 'center'; g.font = '300 56px Inter, sans-serif'
  for (let k = 0; k < 4; k++) {
    g.fillText(t.titolo, (W / 4) * k + W / 8, H / 2 - 10)
    g.font = '300 26px Inter, sans-serif'
    g.fillText('panorama segnaposto', (W / 4) * k + W / 8, H / 2 + 36)
    g.font = '300 56px Inter, sans-serif'
  }
  const url = c.toDataURL('image/jpeg', 0.85)
  cache.set(t.id, url)
  return url
}

/** Restituisce il panorama reale se esiste in public/, altrimenti il segnaposto. */
export async function risolviPanorama(t: Tappa): Promise<string> {
  if (t.panorama && (await assetExists(t.panorama))) return t.panorama
  return generaPanoramaSegnaposto(t)
}
