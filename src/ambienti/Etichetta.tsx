import { useMemo } from 'react'
import * as THREE from 'three'

/** Etichetta 3D come sprite (con `fisso` ha dimensione costante sullo schermo e sta sopra il punto) (evita drei/Html, che crea una root React per ogni etichetta). */
export default function Etichetta({ p, children, size = 0.3, fisso }: { p: [number, number, number]; children: string; size?: number; fisso?: boolean }) {
  const { tex, ratio } = useMemo(() => {
    const c = document.createElement('canvas')
    const g = c.getContext('2d')!
    const font = '600 30px Inter, system-ui, sans-serif'
    g.font = font
    const txt = children.toUpperCase()
    const w = Math.ceil(g.measureText(txt).width) + 36
    c.width = w
    c.height = 52
    g.font = font
    g.fillStyle = 'rgba(0,0,0,0.45)'
    g.beginPath()
    g.roundRect(0, 0, w, 52, 26)
    g.fill()
    g.fillStyle = 'rgba(235,242,255,0.8)'
    g.textBaseline = 'middle'
    g.fillText(txt, 18, 27)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return { tex: t, ratio: w / 52 }
  }, [children])
  return (
    <sprite position={p} scale={[size * ratio, size, 1]} renderOrder={10} center={new THREE.Vector2(0.5, fisso ? -0.9 : 0.5)}>
      <spriteMaterial map={tex} depthTest={false} transparent sizeAttenuation={!fisso} />
    </sprite>
  )
}
