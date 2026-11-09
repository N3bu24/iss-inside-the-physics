import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

function Stars() {
  const ref = useRef<THREE.Points>(null)
  const geo = useMemo(() => {
    const n = 2500
    const p = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const r = 20 + Math.random() * 60
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      p.set([r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph)], i * 3)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(p, 3))
    return g
  }, [])
  useFrame((_, d) => {
    if (ref.current) { ref.current.rotation.y += d * 0.01; ref.current.rotation.x += d * 0.004 }
  })
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.18} color="#cfe8ff" sizeAttenuation transparent opacity={0.85} depthWrite={false} />
    </points>
  )
}

export default function StarField() {
  return (
    <Canvas camera={{ fov: 60, position: [0, 0, 0.1] }} dpr={[1, 1.5]} gl={{ antialias: false }}>
      <Stars />
    </Canvas>
  )
}
