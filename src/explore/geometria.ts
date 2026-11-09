import { portelli, type NodoId, type Portello } from '../data/stazione'

export const rad = (d: number) => (d * Math.PI) / 180
export const gradi = (r: number) => (r * 180) / Math.PI

/** Angolo (rad) tra due direzioni date da yaw/pitch (rad). */
export function distanzaAngolare(y1: number, p1: number, y2: number, p2: number) {
  const dot = Math.sin(p1) * Math.sin(p2) + Math.cos(p1) * Math.cos(p2) * Math.cos(y1 - y2)
  return Math.acos(Math.min(1, Math.max(-1, dot)))
}

/** Differenza di yaw più corta in (-PI, PI]. */
export function deltaYaw(da: number, a: number) {
  let d = (a - da) % (2 * Math.PI)
  if (d > Math.PI) d -= 2 * Math.PI
  if (d <= -Math.PI) d += 2 * Math.PI
  return d
}

export const SOGLIA_INQUADRATURA = rad(35)

/** Portello entro ±35° dallo sguardo (il più vicino), per i nodi panoramici. */
export function portelloInquadrato(nodo: NodoId, yaw: number, pitch: number): Portello | null {
  let best: Portello | null = null
  let bestD = SOGLIA_INQUADRATURA
  for (const p of portelli[nodo]) {
    if (p.x !== undefined) continue
    const d = distanzaAngolare(yaw, pitch, rad(p.yaw), rad(p.pitch))
    if (d <= bestD) { best = p; bestD = d }
  }
  return best
}

/** Interpolazione con easing, in ms; chiama `f(t)` con t in 0..1 a ogni frame. */
export function tween(ms: number, f: (t: number) => void, ease: (t: number) => number = (t) => t): Promise<void> {
  return new Promise((ok) => {
    const t0 = performance.now()
    const passo = (now: number) => {
      const t = Math.min(1, (now - t0) / ms)
      f(ease(t))
      if (t < 1) requestAnimationFrame(passo); else ok()
    }
    requestAnimationFrame(passo)
  })
}

export const attendi = (ms: number) => new Promise<void>((ok) => setTimeout(ok, ms))
export const inQuad = (t: number) => t * t
export const inCubic = (t: number) => t * t * t
export const outCubic = (t: number) => 1 - Math.pow(1 - t, 3)
export const inOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
