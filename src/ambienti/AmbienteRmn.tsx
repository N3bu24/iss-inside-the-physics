import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, Stars } from '@react-three/drei'
import * as THREE from 'three'
import SimulazioneShell from '../simulazioni/SimulazioneShell'
import { Cursore, Pulsante, Scope, Trace } from '../simulazioni/controlli'
import { passiSimulazione } from '../simulazioni/passi'
import type { Passo } from '../simulazioni/contenuto'
import { TESTI } from './testi'
import Etichetta from './Etichetta'

const CYAN = '#35e0ff'
const ALPHA0 = 0.2 // inclinazione "termica" a riposo

type Ctl = { b0: number; trig: boolean }
type Label = 'riposo' | 'impulso' | 'fid' | 'rilassa'

const wrap = (a: number) => a - Math.PI * 2 * Math.round(a / (Math.PI * 2))

function Spins({ ctl, trS, trM, setLabel }: { ctl: React.RefObject<Ctl>; trS: Trace; trM: Trace; setLabel: (l: Label) => void }) {
  const inst = useRef<THREE.InstancedMesh>(null)
  const arrow = useRef<THREE.Group>(null)
  const shell = useRef<THREE.MeshBasicMaterial>(null)
  const coil = useRef<THREE.Group>(null)
  const data = useMemo(() => {
    const pos: THREE.Vector3[] = []
    const s = 0.5
    for (let x = -2; x <= 2; x++)
      for (let y = -3; y <= 3; y++)
        for (let z = -2; z <= 2; z++) {
          const p = new THREE.Vector3(x * s * 1.1, y * s * 1.05, z * s * 1.1)
          if ((p.x / 1.8) ** 2 + (p.y / 1.65) ** 2 + (p.z / 1.8) ** 2 <= 1) pos.push(p)
        }
    const n = pos.length
    const alpha = new Float32Array(n).fill(ALPHA0)
    const phi = new Float32Array(n)
    const delta = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      phi[i] = Math.random() * Math.PI * 2
      delta[i] = Math.random() * 2 - 1
    }
    return { pos, n, alpha, phi, delta }
  }, [])
  const s = useRef({ phase: 0, pulse: -1, since: 99, t: 0, auto: false, label: 'riposo' as Label })
  const o = useMemo(
    () => ({ d: new THREE.Object3D(), up: new THREE.Vector3(0, 1, 0), dir: new THREE.Vector3(), c: new THREE.Color(), c0: new THREE.Color('#1c7f99'), c1: new THREE.Color('#d9fbff') }),
    [],
  )
  useFrame((_, dt0) => {
    const dt = Math.min(dt0, 0.05)
    const st = s.current
    st.t += dt
    if (!st.auto && st.t > 1.3) {
      st.auto = true
      ctl.current.trig = true
    }
    if (ctl.current.trig) {
      ctl.current.trig = false
      if (st.pulse < 0) st.pulse = 0
    }
    const w0 = 7 * ctl.current.b0
    st.phase += w0 * dt
    const pulsing = st.pulse >= 0
    if (pulsing) {
      st.pulse += dt / 1.1
      if (st.pulse >= 1) {
        st.pulse = -1
        st.since = 0
      }
    } else st.since += dt
    const { alpha, phi, delta, n, pos } = data
    let mx = 0,
      my = 0,
      mz = 0,
      sg = 0
    const im = inst.current!
    const { d, up, dir, c } = o
    for (let i = 0; i < n; i++) {
      if (pulsing) {
        alpha[i] += (Math.PI / 2 - alpha[i]) * Math.min(1, dt * 3.2)
        phi[i] += w0 * dt + wrap(st.phase - phi[i]) * Math.min(1, dt * 6)
      } else {
        phi[i] += w0 * (1 + 0.06 * delta[i]) * dt
        alpha[i] += (ALPHA0 - alpha[i]) * Math.min(1, dt / 4.5) // T1
      }
      const sa = Math.sin(alpha[i]),
        ca = Math.cos(alpha[i])
      const sx = sa * Math.cos(phi[i]),
        sz = sa * Math.sin(phi[i])
      mx += sx
      my += ca
      mz += sz
      sg += sa * Math.sin(phi[i])
      dir.set(sx, ca, sz)
      d.position.copy(pos[i])
      d.quaternion.setFromUnitVectors(up, dir)
      d.scale.setScalar(0.9)
      d.updateMatrix()
      im.setMatrixAt(i, d.matrix)
      c.copy(o.c0).lerp(o.c1, Math.min(1, sa * 1.1))
      im.setColorAt(i, c)
    }
    im.instanceMatrix.needsUpdate = true
    if (im.instanceColor) im.instanceColor.needsUpdate = true
    mx /= n
    my /= n
    mz /= n
    sg /= n
    const perp = Math.hypot(mx, mz)
    trS.push(sg * 1.15)
    trM.push(perp)
    // freccia di magnetizzazione
    dir.set(mx, my, mz)
    const len = dir.length()
    dir.normalize()
    arrow.current!.quaternion.setFromUnitVectors(up, dir)
    arrow.current!.scale.set(1, Math.max(0.01, len * 3.2), 1)
    // bobina ricevente e impulso RF
    coil.current!.children.forEach((ch) => (((ch as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.12 + 0.88 * Math.min(1, Math.abs(sg) * 2.2)))
    shell.current!.opacity = pulsing ? 0.1 + 0.08 * Math.sin(st.phase * 3) : 0
    // etichetta di stato
    const lab: Label = pulsing ? 'impulso' : st.since < 12 && perp > 0.1 ? 'fid' : st.since < 12 ? 'rilassa' : 'riposo'
    if (lab !== st.label) {
      st.label = lab
      setLabel(lab)
    }
  })
  return (
    <group>
      <instancedMesh ref={inst} args={[undefined, undefined, data.n]}>
        <coneGeometry args={[0.07, 0.4, 8]} />
        <meshStandardMaterial emissive="#35e0ff" emissiveIntensity={0.4} />
      </instancedMesh>
      {/* magnetizzazione netta */}
      <group ref={arrow}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
          <meshBasicMaterial color="#fff2c4" toneMapped={false} />
        </mesh>
        <mesh position={[0, 1.08, 0]}>
          <coneGeometry args={[0.13, 0.25, 12]} />
          <meshBasicMaterial color="#fff2c4" toneMapped={false} />
        </mesh>
      </group>
      {/* bobina ricevente: spire attorno all'asse x */}
      <group ref={coil}>
        {[-0.7, 0, 0.7].map((x) => (
          <mesh key={x} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[2.35, 0.022, 8, 64]} />
            <meshBasicMaterial color={CYAN} transparent opacity={0.3} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <mesh>
        <sphereGeometry args={[2.5, 32, 24]} />
        <meshBasicMaterial ref={shell} color="#9ff2ff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  )
}

function Magnete() {
  const linee = useMemo(() => {
    const out: [number, number, number][][] = []
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2
      out.push([
        [Math.cos(a) * 3.0, -2.5, Math.sin(a) * 3.0],
        [Math.cos(a) * 3.0, 2.5, Math.sin(a) * 3.0],
      ])
    }
    return out
  }, [])
  return (
    <group>
      {[-1, 1].map((sg) => (
        <group key={sg} position={[0, sg * 3.0, 0]}>
          <mesh>
            <cylinderGeometry args={[3.8, 3.8, 0.55, 48]} />
            <meshStandardMaterial color="#3a4458" metalness={0.4} roughness={0.5} />
          </mesh>
          <mesh position={[0, -sg * 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[3.8, 0.04, 6, 64]} />
            <meshBasicMaterial color={CYAN} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {linee.map((p, i) => (
        <Line key={i} points={p} color={CYAN} lineWidth={1} transparent opacity={0.28} />
      ))}
      <mesh position={[0, 0, -4.2]}>
        <cylinderGeometry args={[0.5, 0.5, 6, 12]} />
        <meshStandardMaterial color="#12161f" />
      </mesh>
      <Etichetta p={[0, 3.8, 0]}>B₀ · magnete</Etichetta>
      <Etichetta p={[2.8, 1.8, 0]}>Bobina ricevente</Etichetta>
    </group>
  )
}

export default function AmbienteRmn({ onClose }: { onClose: () => void }) {
  const [b0, setB0] = useState(1)
  const [label, setLabel] = useState<Label>('riposo')
  const ctl = useRef<Ctl>({ b0: 1, trig: false })
  ctl.current.b0 = b0
  const trS = useMemo(() => new Trace(CYAN, 'fem indotta'), [])
  const trM = useMemo(() => new Trace('#fff2c4aa', 'magnetizzazione trasversale'), [])
  useEffect(() => () => void 0, [])
  const passi = useMemo(() => passiSimulazione('rmn'), [])
  const onPasso = (i: number | null, p?: Passo) => {
    if (i === null || !p) return
    if (p.stato === 'impulso') ctl.current.trig = true
  }
  return (
    <SimulazioneShell
      id="rmn"
      onClose={onClose}
      titolo={TESTI.rmn.titolo}
      intro={TESTI.rmn.intro}
      formula={TESTI.rmn.formula}
      formulaNota={TESTI.rmn.formulaNota}
      agenda={TESTI.rmn.agenda}
      slide={TESTI.rmn.slide}
      passi={passi}
      onPasso={onPasso}
      orbit={{ minDistance: 6, maxDistance: 18 }}
      didascalia={TESTI.rmn.didascalie[label]}
      camera={{ position: [4, 3, 13.5], fov: 45 }}
      scope={<Scope titolo="segnale FID" traces={[trM, trS]} />}
      controlli={
        <>
          <Pulsante onClick={() => (ctl.current.trig = true)}>Impulso RF</Pulsante>
          <Cursore etichetta="Campo B₀" valore={b0} min={0.4} max={1.6} onChange={setB0} testo={b0 < 0.7 ? 'debole' : b0 > 1.3 ? 'molto intenso' : 'intenso'} sinistra="precessione lenta" destra="veloce" />
        </>
      }
    >
      <ambientLight intensity={1.4} />
      <directionalLight position={[4, 6, 6]} intensity={1.6} />
      <Stars radius={60} depth={30} count={600} factor={3} fade speed={0} />
      <Magnete />
      <Spins ctl={ctl} trS={trS} trM={trM} setLabel={setLabel} />
    </SimulazioneShell>
  )
}
