import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

/**
 * Ordine nei marcatori 3D dell'EML (rendono come elementi HTML sopra il canvas):
 * 1) i marcatori restano dentro l'area libera (sotto l'intestazione, sopra la barra dei comandi);
 * 2) due marcatori non si sovrappongono (si allontanano di pochi pixel, con la proprieta' CSS `translate`);
 * 3) l'etichetta di un marcatore si nasconde (come nei panorami: data-label="0") se coprirebbe un altro marcatore,
 *    un'altra etichetta o uno dei valori (.valore-eml). Priorita' ai marcatori piu' vicini al centro.
 * Si aggiorna ~12 volte al secondo: pochi elementi, nessun costo percepibile.
 */
type R = { x0: number; x1: number; y0: number; y1: number }
const tocca = (a: R, b: R) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0

export default function EmlAnticollisione() {
  const gl = useThree((s) => s.gl)
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt
    if (t.current < 0.08) return
    t.current = 0
    const radice: ParentNode = document // include anche i portelli di Esplora sopra la scena
    const cont = gl.domElement.getBoundingClientRect()
    const els = Array.from(radice.querySelectorAll<HTMLElement>('.hs2')).filter((e) => e.offsetWidth > 0)
    if (!els.length) return
    const compatto = cont.width < 700 || cont.height < 520
    const m = compatto ? { t: 150, b: 270, l: 36, r: 36 } : { t: 100, b: 190, l: 50, r: 50 }
    const R_DISCO = 30
    // posizioni di base (senza la spinta precedente) e centro dei dischi
    const p = els.map((el) => {
      const r = el.getBoundingClientRect()
      const nx = parseFloat(el.dataset.nx ?? '0'), ny = parseFloat(el.dataset.ny ?? '0')
      return { el, x: r.left + r.width / 2 - nx, y: r.top + r.height / 2 - ny }
    })
    const xmin = cont.left + m.l, xmax = cont.right - m.r, ymin = cont.top + m.t, ymax = cont.bottom - m.b
    const clampa = (q: { x: number; y: number }) => {
      if (xmax > xmin) q.x = Math.min(xmax, Math.max(xmin, q.x))
      if (ymax > ymin) q.y = Math.min(ymax, Math.max(ymin, q.y))
    }
    const pos = p.map((q) => ({ x: q.x, y: q.y }))
    pos.forEach(clampa)
    const D = 2 * R_DISCO + 6
    for (let it = 0; it < 6; it++) {
      let mosso = false
      for (let i = 0; i < pos.length; i++) for (let j = i + 1; j < pos.length; j++) {
        let dx = pos[j].x - pos[i].x, dy = pos[j].y - pos[i].y
        let d = Math.hypot(dx, dy)
        if (d >= D) continue
        if (d < 1) { const a = i * 2.4 + j; dx = Math.cos(a); dy = Math.sin(a); d = 1 }
        const s = (D - d) / 2 / d
        pos[i].x -= dx * s; pos[i].y -= dy * s; pos[j].x += dx * s; pos[j].y += dy * s; mosso = true
      }
      pos.forEach(clampa)
      if (!mosso) break
    }
    p.forEach((q, i) => {
      const nx = Math.round(pos[i].x - q.x), ny = Math.round(pos[i].y - q.y)
      q.el.dataset.nx = String(nx); q.el.dataset.ny = String(ny)
      q.el.style.translate = nx || ny ? `${nx}px ${ny}px` : ''
    })
    // etichette
    const dischi: R[] = pos.map((q) => ({ x0: q.x - R_DISCO, x1: q.x + R_DISCO, y0: q.y - R_DISCO, y1: q.y + R_DISCO }))
    const valori: R[] = Array.from(radice.querySelectorAll<HTMLElement>('.valore-eml')).map((e) => {
      const r = e.getBoundingClientRect()
      return { x0: r.left - 2, x1: r.right + 2, y0: r.top - 2, y1: r.bottom + 2 }
    })
    const cx = (cont.left + cont.right) / 2, cy = (cont.top + cont.bottom) / 2
    const ordine = pos.map((_, i) => i).sort((a, b) => Math.hypot(pos[a].x - cx, pos[a].y - cy) - Math.hypot(pos[b].x - cx, pos[b].y - cy))
    const accettate: R[] = []
    for (const i of ordine) {
      const tip = p[i].el.querySelector<HTMLElement>('.hs2-tip')
      if (!tip) continue
      const w = tip.offsetWidth, h = tip.offsetHeight || 28
      const r: R = { x0: pos[i].x - w / 2 - 6, x1: pos[i].x + w / 2 + 6, y0: pos[i].y + R_DISCO + 2, y1: pos[i].y + R_DISCO + 10 + h + 4 }
      const fuori = r.x0 < cont.left + 4 || r.x1 > cont.right - 4
      const libera = !fuori && !dischi.some((o, k) => k !== i && tocca(r, o)) && !valori.some((v) => tocca(r, v)) && !accettate.some((e) => tocca(r, e))
      if (libera) accettate.push(r)
      p[i].el.dataset.label = libera ? '1' : '0'
    }
  })
  return null
}
