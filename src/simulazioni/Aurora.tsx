import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, Stars } from '@react-three/drei'
import * as THREE from 'three'
import SimulazioneShell from './SimulazioneShell'
import { Cursore, Pulsante } from './controlli'
import { passiSimulazione } from './passi'
import { metaSimulazione, type Passo } from './contenuto'
import type { HotspotSim } from './SimulazioneShell'
import TerraNasa from './TerraNasa'
import Etichetta from '../ambienti/Etichetta'
import Valore, { num } from './Valore'
import { nomiSezioni } from '../lib/contenutoV11'

const R = 3 // raggio della Terra (unita' scena)
const SOLE = new THREE.Vector3(-1, 0.25, 0.4).normalize() // il Sole e' a sinistra
const Y = new THREE.Vector3(0, 1, 0)

type Ctl = { B: number; sign: number; intensita: number; elica: boolean; impatti: number }

/** Raggio della traiettoria in millimetri (elettrone con v ~ 10^6 m/s in B = 10 mT x slider: r = mv/qB; il protone e' mostrato con lo stesso ordine di grandezza didattico). */
const raggioMm = (c: Ctl) => 0.57 / c.B * (c.sign > 0 ? 1.75 : 1)

/* ---------- Demo: carica in un campo uniforme (B uscente dallo schermo) ---------- */
function Demo({ ctl }: { ctl: React.RefObject<Ctl> }) {
  const N = 260
  const { linea, pos } = useMemo(() => {
    const pos = new Float32Array(N * 3)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const linea = new THREE.Line(g, new THREE.LineBasicMaterial({ color: '#7dffb0', transparent: true, opacity: 0.9 }))
    linea.frustumCulled = false
    return { linea, pos }
  }, [])
  const frecciaV = useMemo(() => new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 1, '#ffd23c', 0.3, 0.2), [])
  const frecciaF = useMemo(() => new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 1, '#ff5a5a', 0.3, 0.2), [])
  const part = useRef<THREE.Mesh>(null)
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  const ph = useRef(0)
  const z0 = useRef(0)
  useFrame((_, dt0) => {
    const dt = Math.min(dt0, 0.05)
    const { B, sign, elica } = ctl.current
    const v = 1.5
    const w = B * (sign > 0 ? 0.9 : 1.6) // omega = qB/m: l'elettrone ruota piu' in fretta
    const r = v / w
    ph.current += -sign * w * dt // il verso di rotazione dipende dal segno della carica
    const vz = elica ? 0.9 : 0
    z0.current += vz * dt
    if (z0.current > 4) {
      z0.current = -4
      pos.fill(0)
    }
    const p = new THREE.Vector3(r * Math.cos(ph.current), r * Math.sin(ph.current), elica ? z0.current : 0)
    // scorre la traccia
    pos.copyWithin(0, 3)
    pos[(N - 1) * 3] = p.x
    pos[(N - 1) * 3 + 1] = p.y
    pos[(N - 1) * 3 + 2] = p.z
    linea.geometry.attributes.position.needsUpdate = true
    part.current!.position.copy(p)
    mat.current!.color.set(sign > 0 ? '#ffd23c' : '#ffffff')
    const dirV = new THREE.Vector3(-Math.sin(ph.current) * -sign, Math.cos(ph.current) * -sign, 0).normalize().multiplyScalar(-1).multiplyScalar(-1)
    // velocita' = derivata della posizione
    dirV.set(-Math.sin(ph.current) * -sign, Math.cos(ph.current) * -sign, vz / v).normalize()
    frecciaV.position.copy(p)
    frecciaV.setDirection(dirV)
    frecciaV.setLength(1.1, 0.3, 0.2)
    const dirF = new THREE.Vector3(-Math.cos(ph.current), -Math.sin(ph.current), 0)
    frecciaF.position.copy(p)
    frecciaF.setDirection(dirF)
    frecciaF.setLength(Math.min(1.4, 0.4 + 0.5 * B), 0.3, 0.2)
  })
  const croci = useMemo(() => {
    const out: [number, number][] = []
    for (let x = -4; x <= 4; x += 2) for (let y = -3; y <= 3; y += 2) out.push([x, y])
    return out
  }, [])
  return (
    <group>
      <primitive object={linea} />
      <mesh ref={part}>
        <sphereGeometry args={[0.17, 16, 12]} />
        <meshBasicMaterial ref={mat} color="#ffd23c" toneMapped={false} />
        <Valore sim="aurora" chiave="raggio" ripiego="Raggio" p={[0, 0.3, 0]} valore={() => `${num(raggioMm(ctl.current), 2)} mm`} />
      </mesh>
      <primitive object={frecciaV} />
      <primitive object={frecciaF} />
      {croci.map(([x, y]) => (
        <group key={`${x}${y}`} position={[x, y, -4.2]}>
          <mesh>
            <torusGeometry args={[0.16, 0.012, 6, 20]} />
            <meshBasicMaterial color="#35e0ff" transparent opacity={0.45} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.035, 8, 6]} />
            <meshBasicMaterial color="#35e0ff" transparent opacity={0.6} />
          </mesh>
        </group>
      ))}
      <Etichetta p={[4.3, 3.4, -4.2]}>B uscente</Etichetta>
      <Valore sim="aurora" chiave="campo" ripiego="Campo" p={[4.3, 3.0, -4.2]} valore={() => `${num(ctl.current.B * 10, 0)} mT`} />

    </group>
  )
}

/* ---------- Terra: linee di campo, vento solare, particelle guidate, aurora ---------- */
const LR = [12, 15] // equatore delle linee di campo (unita' scena)

function lineaPunto(Lr: number, th: number, phi: number, out: THREE.Vector3) {
  const r = Lr * Math.sin(th) ** 2
  return out.set(r * Math.sin(th) * Math.cos(phi), r * Math.cos(th), r * Math.sin(th) * Math.sin(phi))
}

function LineeCampo() {
  const linee = useMemo(() => {
    const out: THREE.Vector3[][] = []
    for (const Lr of LR)
      for (let k = 0; k < 6; k++) {
        const ph = (k / 6) * Math.PI * 2
        const th0 = Math.asin(Math.sqrt(R / Lr))
        const pts: THREE.Vector3[] = []
        for (let i = 0; i <= 64; i++) pts.push(lineaPunto(Lr, th0 + ((Math.PI - 2 * th0) * i) / 64, ph, new THREE.Vector3()))
        out.push(pts)
      }
    return out
  }, [])
  return (
    <>
      {linee.map((p, i) => (
        <Line key={i} points={p} color="#35e0ff" lineWidth={1} transparent opacity={0.3} />
      ))}
    </>
  )
}

const AURORA_VERT = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`
const AURORA_FRAG = /* glsl */ `
uniform float t; uniform float k; varying vec2 vUv;
void main(){
  float y = vUv.y;
  float tende = 0.55 + 0.45 * sin(vUv.x * 70.0 + t * 1.6 + sin(vUv.x * 13.0 + t) * 2.5);
  float a = smoothstep(0.0, 0.08, y) * pow(1.0 - y, 1.4) * tende * k;
  vec3 verde = vec3(0.15, 1.0, 0.5);
  vec3 rosso = vec3(0.95, 0.15, 0.35);
  vec3 col = mix(verde, rosso, smoothstep(0.6, 1.0, y));
  gl_FragColor = vec4(col * 2.2, a);
}`

function Tendaggio({ nord, ctl }: { nord: boolean; ctl: React.RefObject<Ctl> }) {
  const uni = useMemo(() => ({ t: { value: 0 }, k: { value: 0.4 } }), [])
  useFrame((_, dt) => {
    uni.t.value += dt
    uni.k.value += (ctl.current.intensita - uni.k.value) * Math.min(1, dt * 2)
  })
  const lat = (62 * Math.PI) / 180
  const y = R * Math.sin(lat)
  const rr = R * Math.cos(lat) + 0.05
  return (
    <mesh position={[0, nord ? y + 0.5 : -(y + 0.5), 0]} scale={[1, nord ? 1 : -1, 1]}>
      <cylinderGeometry args={[rr + 0.28, rr, 1.5, 128, 1, true]} />
      <shaderMaterial uniforms={uni} vertexShader={AURORA_VERT} fragmentShader={AURORA_FRAG} transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
    </mesh>
  )
}

const NS = 80 // vento solare
const NG = 40 // particelle guidate

function Particelle({ ctl }: { ctl: React.RefObject<Ctl> }) {
  const sw = useRef<THREE.InstancedMesh>(null)
  const gd = useRef<THREE.InstancedMesh>(null)
  const dati = useMemo(() => {
    const sp = Array.from({ length: NS }, () => ({ p: new THREE.Vector3(-14 + Math.random() * 28, (Math.random() - 0.5) * 11, (Math.random() - 0.5) * 11), v: new THREE.Vector3(3, 0, 0) }))
    const g = Array.from({ length: NG }, () => ({ s: Math.random(), Lr: LR[Math.floor(Math.random() * 2)], phi: Math.random() * Math.PI * 2, nord: Math.random() < 0.6, ang: Math.random() * 6.28 }))
    return { sp, g, o: new THREE.Object3D(), c: new THREE.Color(), a: new THREE.Vector3(), b: new THREE.Vector3(), t1: new THREE.Vector3(), e1: new THREE.Vector3(), e2: new THREE.Vector3() }
  }, [])
  useFrame((_, dt0) => {
    const dt = Math.min(dt0, 0.05)
    const { o, a, b, t1, e1, e2, c } = dati
    // vento solare: deviato dal campo (repulsione concettuale)
    dati.sp.forEach((q, i) => {
      const r = q.p.length()
      if (r < 7.5) q.v.addScaledVector(q.p, ((7.5 - r) / r) * 6 * dt)
      q.v.x += (3 - q.v.x) * dt * 0.8
      q.v.y -= q.v.y * dt * 0.3
      q.v.z -= q.v.z * dt * 0.3
      q.p.addScaledVector(q.v, dt)
      if (q.p.x > 15 || r < 3.1) q.p.set(-14, (Math.random() - 0.5) * 11, (Math.random() - 0.5) * 11), q.v.set(3, 0, 0)
      o.position.copy(q.p)
      o.scale.setScalar(1)
      o.updateMatrix()
      sw.current!.setMatrixAt(i, o.matrix)
      sw.current!.setColorAt(i, c.set(i % 4 ? '#ffd23c' : '#ffffff'))
    })
    sw.current!.instanceMatrix.needsUpdate = true
    if (sw.current!.instanceColor) sw.current!.instanceColor.needsUpdate = true
    // particelle guidate: elica attorno alla linea di campo
    const { B, sign } = ctl.current
    dati.g.forEach((q, i) => {
      q.s += dt * 0.11
      q.ang += -sign * dt * 9 * B
      if (q.s >= 1) {
        q.s = 0
        q.phi = Math.random() * Math.PI * 2
        q.nord = Math.random() < 0.6
        ctl.current.impatti += 1
      }
      const th0 = Math.asin(Math.sqrt(R / q.Lr))
      const thEnd = q.nord ? th0 : Math.PI - th0
      const th = Math.PI / 2 + (thEnd - Math.PI / 2) * q.s
      lineaPunto(q.Lr, th, q.phi, a)
      lineaPunto(q.Lr, th + (thEnd - Math.PI / 2) * 0.01, q.phi, b)
      t1.copy(b).sub(a).normalize()
      e1.crossVectors(t1, Y).normalize()
      e2.crossVectors(t1, e1)
      const rho = ((sign > 0 ? 0.55 : 0.3) * Math.pow(a.length() / q.Lr, 0.7)) / B
      a.addScaledVector(e1, rho * Math.cos(q.ang)).addScaledVector(e2, rho * Math.sin(q.ang))
      o.position.copy(a)
      o.scale.setScalar(1.1)
      o.updateMatrix()
      gd.current!.setMatrixAt(i, o.matrix)
      gd.current!.setColorAt(i, c.set(sign > 0 ? '#ffd23c' : '#ffffff'))
    })
    gd.current!.instanceMatrix.needsUpdate = true
    if (gd.current!.instanceColor) gd.current!.instanceColor.needsUpdate = true
  })
  return (
    <>
      <instancedMesh ref={sw} args={[undefined, undefined, NS]} frustumCulled={false}>
        <sphereGeometry args={[0.06, 8, 6]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={gd} args={[undefined, undefined, NG]} frustumCulled={false}>
        <sphereGeometry args={[0.07, 8, 6]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </>
  )
}

function IssIcona() {
  const g = useRef<THREE.Group>(null)
  const a = useRef(0.25)
  useFrame((_, dt) => {
    a.current += dt * 0.12
    const t = Math.sin(a.current) * 0.5 // oscilla sopra la regione aurorale
    g.current!.position.set(3.55 * Math.sin(t + 0.35), 3.55 * Math.cos(t + 0.35), 0)
    g.current!.rotation.z = -(t + 0.35)
  })
  return (
    <group ref={g}>
      <mesh>
        <boxGeometry args={[0.28, 0.06, 0.06]} />
        <meshStandardMaterial color="#e6e9ef" metalness={0.6} roughness={0.4} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 0, s * 0.22]}>
          <boxGeometry args={[0.12, 0.01, 0.3]} />
          <meshStandardMaterial color="#16337f" emissive="#0a1d52" emissiveIntensity={0.6} />
        </mesh>
      ))}
      <Etichetta p={[0, 0, 0]} fisso size={0.024}>ISS</Etichetta>
      <Valore sim="aurora" chiave="quota" ripiego="Quota" p={[0, 0, 0]} sotto valore={() => '400 km · 7,7 km/s'} />
    </group>
  )
}

const HOT_DEMO: HotspotSim[] = [
  { id: 'particella', categoria: 'fisica', titolo: 'Particella carica', pos: [-2.6, 2.4, 0], testo: 'Un elettrone o un protone: la forza di Lorentz è sempre perpendicolare alla velocità, quindi curva la traiettoria senza cambiarne il modulo.' },
]
const HOT_TERRA: HotspotSim[] = [
  { id: 'linee', categoria: 'fisica', titolo: 'Linee del campo terrestre', pos: [7, 3.5, 4], testo: 'Guidano le particelle cariche del vento solare verso i poli.' },
  { id: 'aurora', categoria: 'terra', titolo: 'Atmosfera e aurora', pos: [1.9, 3.9, 0], testo: 'Gli atomi di ossigeno e azoto eccitati dalle particelle emettono luce verde, rossa o blu.' },
  { id: 'iss', categoria: 'terra', titolo: 'La ISS sopra l\'aurora', pos: [0.6, 4.7, 0], testo: 'A circa 400 km di quota la Stazione orbita sopra la regione in cui si accende l\'aurora.' },
]

export default function Aurora({ onClose }: { onClose: () => void }) {
  const [B, setB] = useState(1)
  const [protone, setProtone] = useState(true)
  const [stato, setStato] = useState('campo')
  const ctl = useRef<Ctl>({ B: 1, sign: 1, intensita: 0.4, elica: false, impatti: 0 })
  const demo = stato === 'campo' || stato === 'spirale'
  ctl.current.B = B
  ctl.current.sign = protone ? 1 : -1
  ctl.current.elica = stato === 'spirale'
  ctl.current.intensita = stato === 'aurora' || stato === 'cupola' ? 1 : 0.45
  const passi = useMemo(() => passiSimulazione('aurora'), [])
  const sole = SOLE
  const sezioni = useMemo(() => {
    const n = nomiSezioni('aurora', ['Particella nel campo', 'La Terra e la ISS'])
    return [{ id: 'carica', nome: n[0] }, { id: 'terra', nome: n[1] }]
  }, [])
  const cambiaSezione = (id: string) => { setStato(id === 'carica' ? 'campo' : 'vento'); if (id === 'carica') setB(1) }
  const passoDiSezione = (id: string) => {
    const i = passi.findIndex((q) => (id === 'carica' ? q.stato === 'campo' || q.stato === 'spirale' : q.stato !== 'campo' && q.stato !== 'spirale'))
    return i >= 0 ? i : undefined
  }
  const onPasso = (i: number | null, p?: Passo) => {
    if (i === null || !p) return
    setStato(p.stato ?? 'campo')
    if (p.stato === 'campo') setB(1)
  }
  const did = demo
    ? stato === 'spirale'
      ? 'Con una componente di velocità lungo B la traiettoria diventa un\'elica. Più forte è il campo, più stretta è la spirale (r = mv/qB).'
      : 'La carica curva sotto la forza di Lorentz (freccia rossa) e percorre un cerchio; la velocità (gialla) cambia direzione ma non modulo.'
    : stato === 'vento'
      ? 'Le particelle del vento solare (da sinistra) vengono deviate dal campo; alcune seguono le linee verso i poli.'
      : 'Arrivate in alta atmosfera, le particelle eccitano ossigeno e azoto: la luce emessa è l\'aurora, verde in basso e rossa in alto.'

  return (
    <SimulazioneShell
      id="aurora"
      onClose={onClose}
      titolo="Aurora: la forza di Lorentz"
      intro="Una carica in moto in un campo magnetico subisce una forza perpendicolare alla velocità. Il campo terrestre guida così le particelle del vento solare verso i poli, dove accendono l'aurora."
      formula={String.raw`\vec F = q\,\vec v\times\vec B \qquad r=\frac{m\,v}{q\,B}`}
      formulaNota="La forza di Lorentz non compie lavoro: cambia la direzione della velocità, non l'energia della particella. Il raggio r della traiettoria è inversamente proporzionale al campo."
      agenda={metaSimulazione('aurora').agenda}
      slide={metaSimulazione('aurora').slide}
      didascalia={did}
      passi={passi}
      onPasso={onPasso}
      sezioni={sezioni}
      sezione={demo ? 'carica' : 'terra'}
      onSezione={cambiaSezione}
      passoDiSezione={passoDiSezione}
      hotspot={demo ? HOT_DEMO : HOT_TERRA}
      camera={{ position: [0, 1.5, 9.5], fov: 45 }}
      orbit={{ minDistance: 3, maxDistance: 26 }}
      controlli={
        <>
          <Cursore etichetta="Campo B" valore={B} min={0.5} max={2} onChange={setB} testo={`${B.toFixed(1).replace('.', ',')} ×`} sinistra="spirale larga" destra="stretta" />
          <Pulsante onClick={() => setProtone(true)} attivo={protone}>Protone</Pulsante>
          <Pulsante onClick={() => setProtone(false)} attivo={!protone}>Elettrone</Pulsante>
        </>
      }
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[-8, 2, 3]} intensity={2.4} />
      <Stars radius={60} depth={30} count={1200} factor={3} fade speed={0} />
      <group visible={demo}>
        <Demo ctl={ctl} />
      </group>
      <group visible={!demo}>
        <TerraNasa raggio={R} sole={sole} rotazione={0.01} />
        <LineeCampo />
        <Particelle ctl={ctl} />
        <Tendaggio nord ctl={ctl} />
        <Tendaggio nord={false} ctl={ctl} />
        <IssIcona />
        <Etichetta p={[-11, 2, 0]} size={0.42}>Vento solare</Etichetta>
        <Valore sim="aurora" chiave="campo" ripiego="Campo" p={[12, 0, 0]} valore={() => `0,5 µT`} />
      </group>
    </SimulazioneShell>
  )
}
