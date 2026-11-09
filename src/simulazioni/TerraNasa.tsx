import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

const TERRA_URL = '/ambienti/terra-bluemarble.jpg'

/* Atmosfera: sottile alone fresnel, visibile solo sul bordo */
const ATM_VERT = /* glsl */ `
varying vec3 vN; varying vec3 vV;
void main(){
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`
const ATM_FRAG = /* glsl */ `
varying vec3 vN; varying vec3 vV;
void main(){
  float f = 1.0 - max(dot(normalize(vN), normalize(vV)), 0.0);
  float i = smoothstep(0.55, 1.0, f);
  gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * i * 0.3;
}`

export default function TerraNasa({ raggio = 2, rotazione = 0.02 }: { raggio?: number; sole?: THREE.Vector3; rotazione?: number }) {
  const tex = useTexture(TERRA_URL)
  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
  }, [tex])
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => ref.current && (ref.current.rotation.y += dt * rotazione))
  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[raggio, 96, 64]} />
        <meshStandardMaterial map={tex} roughness={0.9} metalness={0} />
      </mesh>
      <mesh scale={1.02}>
        <sphereGeometry args={[raggio, 64, 48]} />
        <shaderMaterial vertexShader={ATM_VERT} fragmentShader={ATM_FRAG} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  )
}
