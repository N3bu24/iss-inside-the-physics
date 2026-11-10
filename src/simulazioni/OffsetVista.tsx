import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { PerspectiveCamera } from 'three'

/**
 * Sposta orizzontalmente il centro dell'inquadratura di `sinistraPx` pixel verso destra (con easing),
 * così la scena risulta centrata nell'area libera a destra della colonna di testo. Nessuno spostamento verticale.
 */
export default function OffsetVista({ sinistraPx = 0 }: { sinistraPx?: number }) {
  const { camera, size } = useThree()
  const x = useRef(sinistraPx)
  useFrame((_, dt) => {
    const cam = camera as PerspectiveCamera
    x.current += (sinistraPx - x.current) * Math.min(1, dt * 6)
    if (Math.abs(sinistraPx - x.current) < 0.3) x.current = sinistraPx
    if (x.current === 0) {
      if (cam.view?.enabled) cam.clearViewOffset()
      return
    }
    cam.setViewOffset(size.width, size.height, -x.current, 0, size.width, size.height)
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
