import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { PerspectiveCamera } from 'three'

/**
 * Sposta il centro dell'inquadratura per centrare la scena nell'area libera:
 * `sinistraPx` pixel verso destra (colonna di testo a sinistra: desktop e orizzontale),
 * `sopraPx` pixel verso l'alto (pannello dal basso: telefono e tablet in verticale). Con easing.
 * Sul desktop `sopraPx` è sempre 0: comportamento identico a prima.
 */
export default function OffsetVista({ sinistraPx = 0, sopraPx = 0 }: { sinistraPx?: number; sopraPx?: number }) {
  const { camera, size } = useThree()
  const x = useRef(sinistraPx)
  const y = useRef(sopraPx)
  useFrame((_, dt) => {
    const cam = camera as PerspectiveCamera
    x.current += (sinistraPx - x.current) * Math.min(1, dt * 6)
    if (Math.abs(sinistraPx - x.current) < 0.3) x.current = sinistraPx
    y.current += (sopraPx - y.current) * Math.min(1, dt * 6)
    if (Math.abs(sopraPx - y.current) < 0.3) y.current = sopraPx
    if (x.current === 0 && y.current === 0) {
      if (cam.view?.enabled) cam.clearViewOffset()
      return
    }
    cam.setViewOffset(size.width, size.height, -x.current, y.current, size.width, size.height)
  })
  useEffect(
    () => () => {
      const cam = camera as PerspectiveCamera
      if (cam.view?.enabled) cam.clearViewOffset()
    },
    [camera],
  )
  return null
}
