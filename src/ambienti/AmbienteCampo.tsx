import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Line, Stars, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import SimulazioneShell from '../simulazioni/SimulazioneShell'
import { Cursore, Pulsante, Scope, Trace } from '../simulazioni/controlli'
import { passiSimulazione } from '../simulazioni/passi'
import type { Passo } from '../simulazioni/contenuto'
import { TESTI } from './testi'
import Etichetta from './Etichetta'
import Valore, { num } from '../simulazioni/Valore'
import TerraNasa from '../simulazioni/TerraNasa'

const R_E = 2
const R_ORB = 2.35 // orbita didattica (in realta' sarebbe 1,06 R_T: qui un po' piu' alta per leggibilita')
const W0 = 0.25 // rad/s alla "velocita reale" (scala didattica)
const TILT = (11 * Math.PI) / 180
const M = new THREE.Vector3(Math.sin(TILT), Math.cos(TILT), 0) // asse dipolo
const ISS_L = R_E * 0.037 // lunghezza ISS ~3,7% del raggio terrestre (NON in scala reale: ingrandita)
const SOLE = new THREE.Vector3(8, 4, 6).normalize()
const ISS_URL = '/ambienti/iss.glb'

function dipole(p: THREE.Vector3, out: THREE.Vector3) {
  const r = p.length()
  const rh = p.clone().divideScalar(r)
  const k = Math.pow(R_E / r, 3)
  return out.copy(rh).multiplyScalar(3 * M.dot(rh)).sub(M).multiplyScalar(k)
}

function LineeCampo() {
  const linee = useMemo(() => {
    const out: THREE.Vector3[][] = []
    for (const L of [2.7, 3.4, 4.4, 5.8])
      for (let k = 0; k < 8; k++) {
        const ph = (k / 8) * Math.PI * 2
        const th0 = Math.asin(Math.sqrt(R_E / L))
        const pts: THREE.Vector3[] = []
        for (let i = 0; i <= 56; i++) {
          const th = th0 + ((Math.PI - 2 * th0) * i) / 56
          const r = L * Math.sin(th) ** 2
          pts.push(new THREE.Vector3(r * Math.sin(th) * Math.cos(ph), r * Math.cos(th), r * Math.sin(th) * Math.sin(ph)))
        }
        out.push(pts)
      }
    return out
  }, [])
  return (
    <group rotation={[0, 0, -TILT]}>
      {linee.map((p, i) => (
        <Line key={i} points={p} color="#35e0ff" lineWidth={1.1} transparent opacity={0.5} />
      ))}
    </group>
  )
}

/* ---------- ISS: modello NASA, centrato e orientato (traliccio = z, moduli lungo la velocita' = x) ---------- */
function ModelloIss() {
  const { scene } = useGLTF(ISS_URL, '/draco/')
  const { oggetto, centro, scala } = useMemo(() => {
    const o = scene.clone(true)
    // pezzi isolati del file (tralicci "piegati" a parte, lontani dall'assemblaggio): si nascondono
    const scartati: THREE.Object3D[] = []
    o.traverse((n) => {
      if (/^(bendedtru|pCylinder)/i.test(n.name)) scartati.push(n)
    })
    scartati.forEach((n) => (n.visible = false))
    const argento = new THREE.MeshStandardMaterial({ color: '#d7dce4', metalness: 0.55, roughness: 0.42 })
    const pannello = new THREE.MeshStandardMaterial({ color: '#16337f', emissive: '#0a1d52', emissiveIntensity: 0.5, metalness: 0.75, roughness: 0.28, side: THREE.DoubleSide })
    const oro = new THREE.MeshStandardMaterial({ color: '#c9a063', metalness: 0.7, roughness: 0.4 })
    o.updateMatrixWorld(true)
    o.traverse((n) => {
      const m = n as THREE.Mesh
      if (!m.isMesh || !m.visible) return
      const g = m.geometry
      g.computeBoundingBox()
      const s = g.boundingBox!.getSize(new THREE.Vector3()).toArray().sort((a, b) => a - b)
      const sottile = s[0] / s[2] < 0.06 && s[2] > 3
      m.material = sottile && s[1] > 3 ? pannello : s[2] < 4 && s[0] > 0.5 ? oro : argento
    })
    const box = new THREE.Box3()
    o.traverse((n) => {
      const m = n as THREE.Mesh
      if (m.isMesh && m.visible) box.union(new THREE.Box3().setFromObject(m))
    })
    const size = box.getSize(new THREE.Vector3())
    return { oggetto: o, centro: box.getCenter(new THREE.Vector3()), scala: ISS_L / Math.max(size.x, size.y, size.z) }
  }, [scene])
  return (
    // asse dei moduli (y del file) -> x (direzione del moto); asse del traliccio (z del file) resta z
    <group scale={scala} rotation={[0, 0, -Math.PI / 2]}>
      <primitive object={oggetto} position={[-centro.x, -centro.y, -centro.z]} />
    </group>
  )
}

const NP = 16

type Frame = { p: THREE.Vector3; rh: THREE.Vector3; vh: THREE.Vector3; zh: THREE.Vector3 }

function ISS({ vel, incl, tr, frame }: { vel: number; incl: number; tr: Trace; frame: React.RefObject<Frame> }) {
  const g = useRef<THREE.Group>(null)
  const trussMat = useRef<THREE.MeshBasicMaterial>(null)
  const inst = useRef<THREE.InstancedMesh>(null)
  const u = useRef(0)
  const fase = useRef(Array.from({ length: NP }, (_, i) => i / NP))
  const tmp = useMemo(
    () => ({
      q: new THREE.Vector3(),
      v: new THREE.Vector3(),
      B: new THREE.Vector3(),
      c: new THREE.Color(),
      d: new THREE.Object3D(),
      m: new THREE.Matrix4(),
      cross: new THREE.Vector3(),
    }),
    [],
  )
  useFrame((_, dt0) => {
    const dt = Math.min(dt0, 0.05)
    const w = W0 * vel
    u.current += w * dt
    const i = (incl * Math.PI) / 180
    const f = frame.current
    const ex = new THREE.Vector3(1, 0, 0),
      e2 = new THREE.Vector3(0, Math.sin(i), Math.cos(i))
    f.rh.copy(ex).multiplyScalar(Math.cos(u.current)).addScaledVector(e2, Math.sin(u.current))
    f.vh.copy(ex).multiplyScalar(-Math.sin(u.current)).addScaledVector(e2, Math.cos(u.current))
    f.zh.crossVectors(f.vh, f.rh) // direzione del traliccio
    const { q, v, B, c, d, cross } = tmp
    f.p.copy(f.rh).multiplyScalar(R_ORB)
    v.copy(f.vh).multiplyScalar(w * R_ORB)
    const g0 = g.current!
    g0.position.copy(f.p)
    tmp.m.makeBasis(f.vh, f.rh, f.zh)
    g0.quaternion.setFromRotationMatrix(tmp.m)
    dipole(f.p, B)
    const eps0 = cross.crossVectors(v, B).dot(f.zh)
    const lv0 = Math.min(1, Math.abs(eps0) * 2)
    tr.push(Math.max(-1, Math.min(1, eps0 * 1.6)))
    trussMat.current!.opacity = 0.12 + 0.75 * lv0
    const im = inst.current!
    for (let k = 0; k < NP; k++) {
      const s = fase.current[k]
      const x = (s - 0.5) * ISS_L * 1.05
      q.copy(f.p).addScaledVector(f.zh, x)
      dipole(q, B)
      const e = cross.crossVectors(v, B).dot(f.zh)
      const lv = Math.min(1, Math.abs(e) * 2)
      fase.current[k] = (s + Math.sign(e) * dt * (0.25 + 0.9 * lv) + 1) % 1
      d.position.set(0, 0, x)
      d.scale.setScalar(lv < 0.01 ? 0.0001 : 0.5 + 1.0 * lv)
      d.updateMatrix()
      im.setMatrixAt(k, d.matrix)
      c.set(e > 0 ? '#35e0ff' : '#b8f3ff')
      im.setColorAt(k, c)
    }
    im.instanceMatrix.needsUpdate = true
    if (im.instanceColor) im.instanceColor.needsUpdate = true
  })
  return (
    <group ref={g}>
      <ModelloIss />
      {/* traliccio che si illumina quando la fem e' attiva */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[ISS_L * 0.012, ISS_L * 0.012, ISS_L * 1.08, 8]} />
        <meshBasicMaterial ref={trussMat} color="#35e0ff" transparent toneMapped={false} depthWrite={false} />
      </mesh>
      <instancedMesh ref={inst} args={[undefined, undefined, NP]}>
        <sphereGeometry args={[ISS_L * 0.018, 8, 8]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <Etichetta p={[0, 0, 0]} fisso size={0.026}>ISS</Etichetta>
      <Valore sim="campo" chiave="velocita" ripiego="Velocità" sotto p={[0, 0, 0]} valore={() => `${num(vel * 7.7, 1)} km/s`} />
      <Valore sim="campo" chiave="fem" ripiego="fem" colore="orange" p={[0, 0, ISS_L * 0.58]} valore={() => `${num((tr.data[(tr.head - 1 + tr.data.length) % tr.data.length] / 1.6) * 23, 0)} V`} />
    </group>
  )
}

/** Camera che segue la ISS (l'offset ruota con la base orbitale: la Terra resta sotto la stazione) oppure vista d'insieme fissa. */
function Segui({ frame, segui }: { frame: React.RefObject<Frame>; segui: boolean }) {
  const { camera, controls } = useThree()
  const prec = useRef<{ p: THREE.Vector3; m: THREE.Matrix4 } | null>(null)
  const pronto = useRef(false)
  const base = (f: Frame, m: THREE.Matrix4) => m.makeBasis(f.vh, f.rh, f.zh)
  useEffect(() => {
    const c = controls as unknown as { target: THREE.Vector3; update: () => void } | null
    if (!c) return
    pronto.current = false
    if (!segui) {
      prec.current = null
      camera.position.set(0, 3.8, 9.5)
      c.target.set(0, 0, 0)
      c.update()
    }
  }, [segui, camera, controls])
  useFrame(() => {
    const c = controls as unknown as { target: THREE.Vector3; update: () => void } | null
    if (!segui || !c) return
    const f = frame.current
    if (!pronto.current) {
      // primo fotogramma dopo l'attivazione: dietro e sopra la ISS, con la Terra ampia sotto
      camera.position.copy(f.p).addScaledVector(f.rh, ISS_L * 3.2).addScaledVector(f.vh, -ISS_L * 6.5).addScaledVector(f.zh, ISS_L * 1.2)
      c.target.copy(f.p).addScaledVector(f.rh, -ISS_L * 2.5)
      prec.current = { p: f.p.clone(), m: base(f, new THREE.Matrix4()) }
      pronto.current = true
      c.update()
      return
    }
    const pr = prec.current!
    const mNuova = base(f, new THREE.Matrix4())
    // rotazione dalla base precedente alla nuova
    const rot = mNuova.clone().multiply(pr.m.clone().transpose())
    camera.position.sub(pr.p).applyMatrix4(rot).add(f.p)
    c.target.sub(pr.p).applyMatrix4(rot).add(f.p)
    pr.p.copy(f.p)
    pr.m.copy(mNuova)
    c.update()
  })
  return null
}

/** Luce solare didattica: segue la ISS (resta sul lato illuminato) con una componente fissa dal Sole. */
function LuceSole({ frame }: { frame: React.RefObject<Frame> }) {
  const l = useRef<THREE.DirectionalLight>(null)
  useFrame(() => l.current?.position.copy(frame.current.p).multiplyScalar(8).addScaledVector(SOLE, 3))
  return <directionalLight ref={l} position={[8, 4, 6]} intensity={3.2} />
}

function Orbita({ incl }: { incl: number }) {
  const pts = useMemo(
    () =>
      Array.from(
        { length: 129 },
        (_, k) => new THREE.Vector3(Math.cos((k / 128) * Math.PI * 2) * R_ORB, 0, Math.sin((k / 128) * Math.PI * 2) * R_ORB),
      ),
    [],
  )
  // piano orbitale: contiene x; inclinato di i verso y (e2 = (0, sin i, cos i))
  return (
    <group rotation={[-(incl * Math.PI) / 180, 0, 0]}>
      <Line points={pts} color="#ffffff" lineWidth={0.8} transparent opacity={0.22} dashed dashSize={0.1} gapSize={0.1} />
    </group>
  )
}

export default function AmbienteCampo({ onClose }: { onClose: () => void }) {
  const [vel, setVel] = useState(1)
  const [incl, setIncl] = useState(51.6)
  const [segui, setSegui] = useState(true)
  const tr = useMemo(() => new Trace('#35e0ff', 'fem'), [])
  const frame = useRef<Frame>({ p: new THREE.Vector3(R_ORB, 0, 0), rh: new THREE.Vector3(1, 0, 0), vh: new THREE.Vector3(0, 0, 1), zh: new THREE.Vector3(0, 1, 0) })
  const passi = useMemo(() => passiSimulazione('campo'), [])
  const T = TESTI.campo.didascalie
  const did = vel < 0.02 ? T.ferma : vel > 1.6 ? T.esagerata : T.reale
  const km =
    vel < 0.02 ? 'ferma' : vel > 1.6 ? 'esagerata' : Math.abs(vel - 1) < 0.06 ? '7,7 km/s' : `${(vel * 7.7).toFixed(1).replace('.', ',')} km/s`

  const onPasso = (i: number | null, p?: Passo) => {
    if (i === null || !p) return
    switch (p.stato) {
      case 'insieme':
        setSegui(false); setVel(1); setIncl(51.6); break
      case 'ferma':
        setSegui(true); setVel(0); break
      case 'reale':
        setSegui(true); setVel(1); setIncl(51.6); break
      case 'polare':
        setSegui(true); setVel(1); setIncl(85); break
      case 'esagerata':
        setSegui(true); setVel(2.5); setIncl(51.6); break
    }
  }

  return (
    <SimulazioneShell
      id="campo"
      onClose={onClose}
      titolo={TESTI.campo.titolo}
      intro={TESTI.campo.intro}
      formula={TESTI.campo.formula}
      formulaNota={TESTI.campo.formulaNota}
      agenda={TESTI.campo.agenda}
      slide={TESTI.campo.slide}
      didascalia={did}
      passi={passi}
      onPasso={onPasso}
      camera={{ position: [0, 3.8, 9.5], fov: 45 }}
      orbit={{ minDistance: 0.12, maxDistance: 16 }}
      hotspot={[
        { id: 'dipolo', categoria: 'terra', titolo: 'Il campo geomagnetico', pos: [0.3, 2.9, 0], testo: 'La Terra si comporta come un grande magnete a dipolo: le linee di campo escono da un polo, si chiudono attorno al pianeta e rientrano dall\'altro. A 400 km di quota il campo vale circa 30 microtesla.' },
        { id: 'traliccio', categoria: 'fisica', titolo: 'Perché serve il moto', pos: [3.4, 0.9, 0.5], testo: 'Una fem di moto richiede che il conduttore tagli le linee di campo: con la ISS ferma il flusso non cambia e ε = Blv si annulla.' },
      ]}
      scope={<Scope titolo="fem lungo il traliccio" traces={[tr]} />}
      controlli={
        <>
          <Cursore
            etichetta="Velocità orbitale"
            valore={vel}
            min={0}
            max={3}
            onChange={(v) => setVel(Math.abs(v - 1) < 0.06 ? 1 : v)}
            testo={km}
            sinistra="ferma"
            destra="esagerata"
          />
          <Cursore
            etichetta="Inclinazione orbita"
            valore={incl}
            min={0}
            max={90}
            step={0.5}
            onChange={(v) => setIncl(Math.abs(v - 51.6) < 1.5 ? 51.6 : v)}
            testo={`${incl.toFixed(1).replace('.', ',')}°`}
            sinistra="equatoriale"
            destra="polare"
          />
          <Pulsante onClick={() => setSegui(!segui)} attivo={segui}>
            {segui ? 'Vista d\'insieme' : 'Segui la ISS'}
          </Pulsante>
        </>
      }
    >
      <ambientLight intensity={0.15} />
      <LuceSole frame={frame} />
      <Stars radius={60} depth={30} count={1200} factor={3} fade speed={0} />
      <TerraNasa raggio={R_E} sole={SOLE} />
      <LineeCampo />
      <Orbita incl={incl} />
      <ISS vel={vel} incl={incl} tr={tr} frame={frame} />
      <Segui frame={frame} segui={segui} />
    </SimulazioneShell>
  )
}
