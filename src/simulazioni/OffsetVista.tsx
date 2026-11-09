import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { PerspectiveCamera } from 'three'

/** Sposta il centro dell'inquadratura verso l'alto (con easing) mentre la finestra a passi occupa la parte bassa. */
export default function OffsetVista({ attivo, frazione = 0.2 }: { attivo: boolean; frazione?: number }) {
  const { camera, size } = useThree()
  const k = useRef(0)
  useFrame((_, dt) => {
    const cam = camera as PerspectiveCamera
    k.current += ((attivo ? frazione : 0) - k.current) * Math.min(1, dt * 4)
    if (!attivo && k.current < 0.0008) {
      k.current = 0
      if (cam.view?.enabled) cam.clearViewOffset()
      return
    }
    cam.setViewOffset(size.width, size.height, 0, size.height * k.current, size.width, size.height)
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
