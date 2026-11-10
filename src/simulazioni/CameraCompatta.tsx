import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import type { Vector3 } from 'three'

type Orbita = { target: Vector3; minDistance: number; maxDistance: number; update: () => void }

/**
 * Solo telefono e tablet: allontana la camera (e i limiti dello zoom) del `fattore` indicato, così il soggetto
 * entra tutto nello spazio libero (stretto in verticale). Si monta solo fuori dal desktop, che resta com'è.
 */
export default function CameraCompatta({ fattore }: { fattore: number }) {
  const { camera, controls } = useThree()
  const prec = useRef(1)
  useEffect(() => {
    const c = controls as unknown as Orbita | null
    if (!c) return
    const k = fattore / prec.current
    if (Math.abs(k - 1) < 0.001) return
    prec.current = fattore
    camera.position.sub(c.target).multiplyScalar(k).add(c.target)
    c.minDistance *= k
    c.maxDistance *= k
    c.update()
  }, [fattore, controls, camera])
  return null
}
