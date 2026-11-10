import { useEffect, useState } from 'react'
import { useDispositivo, type Dispositivo } from '../lib/dispositivo'

/**
 * Disposizione dell'interfaccia delle simulazioni:
 * - 'desktop': layout originale (colonna a sinistra, barra comandi in basso a destra);
 * - 'sheet':   telefono e tablet in verticale: pannello dal basso (bottom sheet) con maniglia;
 * - 'lato':    telefono e tablet in orizzontale: pannello laterale stretto a sinistra, scena a destra.
 */
export type ModoLayout = 'desktop' | 'sheet' | 'lato'

export interface InfoLayout {
  dispositivo: Dispositivo
  modo: ModoLayout
  larghezza: number
  altezza: number
  /** larghezza del pannello laterale (solo modo 'lato') */
  larghLato: number
}

function leggi(dispositivo: Dispositivo): InfoLayout {
  const w = typeof window === 'undefined' ? 1280 : window.innerWidth
  const h = typeof window === 'undefined' ? 720 : window.innerHeight
  const modo: ModoLayout = dispositivo === 'desktop' ? 'desktop' : h > w ? 'sheet' : 'lato'
  const larghLato = dispositivo === 'telefono' ? Math.round(Math.min(380, Math.max(300, w * 0.42))) : 340
  return { dispositivo, modo, larghezza: w, altezza: h, larghLato }
}

/** Disposizione corrente (si aggiorna al ridimensionamento e alla rotazione). */
export function useLayoutSim(): InfoLayout {
  const dispositivo = useDispositivo()
  const [info, setInfo] = useState(() => leggi(dispositivo))
  useEffect(() => {
    const agg = () => setInfo(leggi(dispositivo))
    agg()
    window.addEventListener('resize', agg)
    window.addEventListener('orientationchange', agg)
    return () => { window.removeEventListener('resize', agg); window.removeEventListener('orientationchange', agg) }
  }, [dispositivo])
  return info
}

/** Altezza (px) della sola striscia del pannello dal basso quando è chiuso. */
export const ALTEZZA_STRISCIA = 68

/** Altezza (px) stimata della barra dei comandi sopra il pannello (telefono/tablet). */
export const ALTEZZA_BARRA = 72

/** Altezza (px) del pannello dal basso quando è aperto, in base all'altezza dello schermo. */
export function altezzaSheet(info: InfoLayout, aperto: boolean): number {
  if (!aperto) return ALTEZZA_STRISCIA
  const frazione = info.dispositivo === 'tablet' ? 0.46 : 0.42
  return Math.max(ALTEZZA_STRISCIA + 120, Math.round(info.altezza * frazione))
}

/**
 * Fattore con cui allontanare la camera perché il soggetto stia nello spazio libero (taratura sul desktop,
 * dove la scena occupa circa il 60% dell'altezza). Sul desktop vale sempre 1.
 */
export function fattoreCamera(info: InfoLayout, sinistraPx: number, sopraPx: number): number {
  if (info.modo === 'desktop') return 1
  const H = info.altezza
  const liberaH = info.modo === 'sheet' ? Math.max(160, sopraPx > 0 ? H - 2 * sopraPx : H - 200) : Math.max(160, H - ALTEZZA_BARRA)
  const liberaW = Math.max(200, info.larghezza - sinistraPx * 2)
  const kV = (0.75 * H) / liberaH
  const kW = (0.73 * H) / liberaW
  return Math.min(2.4, Math.max(1, kV, kW))
}
