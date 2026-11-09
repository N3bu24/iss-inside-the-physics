import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

const TERRA_URL = '/ambienti/terra-bluemarble.jpg'

/* ---------- Terra: Blue Marble NASA, giorno/notte morbidi, atmosfera fresnel ---------- */
const TERRA_VERT = /* glsl */ `
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){
  vUv = uv;
  vN = normalize(mat3(modelMatrix) * normal);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vV = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`
const TERRA_FRAG = /* glsl */ `
uniform sampler2D map; uniform vec3 sun;
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){
  vec3 c = texture2D(map, vUv).rgb;
  vec3 n = normalize(vN);
  float d = dot(n, sun);
  float giorno = smoothstep(-0.16, 0.3, d);
  vec3 luce = c * (0.12 + 1.15 * clamp(d, 0.0, 1.0));
  vec3 notte = c * vec3(0.025, 0.04, 0.09);
  vec3 col = mix(notte, luce, giorno);
  float crep = exp(-pow((d - 0.03) / 0.14, 2.0));
  col += crep * c * vec3(0.22, 0.09, 0.03);
  float f = pow(1.0 - max(dot(n, normalize(vV)), 0.0), 3.0);
  col += vec3(0.22, 0.5, 1.0) * f * (0.18 + 0.7 * giorno);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`
const ATM_FRAG = /* glsl */ `
varying vec3 vNv;
void main(){
  float i = pow(max(0.0, 0.72 - dot(vNv, vec3(0.0, 0.0, 1.0))), 3.0);
  gl_FragColor = vec4(0.25, 0.55, 1.0, 1.0) * i * 1.5;
}`
const ATM_VERT = /* glsl */ `
varying vec3 vNv;
void main(){ vNv = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`

export default function TerraNasa({ raggio = 2, sole = new THREE.Vector3(8, 4, 6).normalize(), rotazione = 0.02 }: { raggio?: number; sole?: THREE.Vector3; rotazione?: number }) {
  const tex = useTexture(TERRA_URL)
  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
  }, [tex])
  const uniforms = useMemo(() => ({ map: { value: tex }, sun: { value: sole.clone() } }), [tex])
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => ref.current && (ref.current.rotation.y += dt * rotazione))
  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[raggio, 96, 64]} />
        <shaderMaterial uniforms={uniforms} vertexShader={TERRA_VERT} fragmentShader={TERRA_FRAG} />
      </mesh>
      <mesh scale={1.07}>
        <sphereGeometry args={[raggio, 64, 48]} />
        <shaderMaterial vertexShader={ATM_VERT} fragmentShader={ATM_FRAG} side={THREE.BackSide} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  )
}

