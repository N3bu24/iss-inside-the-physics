import * as THREE from 'three'

/** Elica (solenoide) lungo l'asse y, centrata nell'origine. */
export function helixGeometry(radius: number, height: number, turns: number, tube = 0.035) {
  const pts: THREE.Vector3[] = []
  const per = 14
  const n = Math.max(2, Math.round(turns * per))
  for (let i = 0; i <= n; i++) {
    const a = (i / per) * Math.PI * 2
    pts.push(new THREE.Vector3(Math.cos(a) * radius, (i / n - 0.5) * height, Math.sin(a) * radius))
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n, tube, 6, false)
}

/** Pseudo-rumore deterministico. */
export function hash2(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}
