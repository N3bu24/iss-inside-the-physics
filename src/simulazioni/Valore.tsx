import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { etichettaValore } from '../lib/contenutoV11'

const W = 400
const H = 52
const COLORI = { cyan: '#7be9ff', orange: '#ffb36b' }

/**
 * Piccola etichetta con UN valore che segue lo stato della scena (sprite a dimensione fissa sullo schermo,
 * aggiornato ~5 volte al secondo solo se il testo cambia). Etichetta da content/v11.json -> valori[sim][chiave].
 */
export default function Valore({ sim, chiave, ripiego, p, valore, colore = 'cyan', sotto }: {
  sim: string
  chiave: string
  ripiego: string
  p: [number, number, number]
  /** restituisce il testo del valore (es. "3,2 A") */
  valore: () => string
  colore?: 'cyan' | 'orange'
  sotto?: boolean
}) {
  const etichetta = etichettaValore(sim, chiave, ripiego)
  const { canvas, tex } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return { canvas, tex }
  }, [])
  const ultimo = useRef('')
  const t = useRef(1)
  useEffect(() => { ultimo.current = '' }, [etichetta])
  useEffect(() => () => tex.dispose(), [tex])
  useFrame((_, dt) => {
    t.current += dt
    if (t.current < 0.2) return
    t.current = 0
    const v = valore()
    if (v === ultimo.current) return
    ultimo.current = v
    const g = canvas.getContext('2d')!
    g.clearRect(0, 0, W, H)
    g.font = '500 22px Inter, system-ui, sans-serif'
    const wl = g.measureText(etichetta).width
    g.font = '700 26px Inter, system-ui, sans-serif'
    const wv = g.measureText(v).width
    const w = Math.min(W, Math.ceil(wl + wv + 44))
    const x0 = (W - w) / 2
    g.fillStyle = 'rgba(5,16,28,0.5)'
    g.strokeStyle = colore === 'cyan' ? 'rgba(53,224,255,0.45)' : 'rgba(255,138,42,0.5)'
    g.lineWidth = 2
    g.beginPath()
    g.roundRect(x0 + 1, 1, w - 2, H - 2, 24)
    g.fill()
    g.stroke()
    g.textBaseline = 'middle'
    g.font = '500 22px Inter, system-ui, sans-serif'
    g.fillStyle = 'rgba(235,242,255,0.65)'
    g.fillText(etichetta, x0 + 18, 27)
    g.font = '700 26px Inter, system-ui, sans-serif'
    g.fillStyle = COLORI[colore]
    g.fillText(v, x0 + 18 + wl + 8, 27)
    tex.needsUpdate = true
  })
  return (
    <sprite position={p} scale={[0.022 * (W / H), 0.022, 1]} renderOrder={9} center={new THREE.Vector2(0.5, sotto ? 1.15 : -0.15)}>
      <spriteMaterial map={tex} depthTest={false} transparent opacity={0.92} sizeAttenuation={false} />
    </sprite>
  )
}

/** Numero con virgola decimale italiana. */
export const num = (x: number, d = 1) => x.toFixed(d).replace('.', ',')
