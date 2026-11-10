import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, Home, Settings } from 'lucide-react'
import { preferenze, usePreferenza } from '../lib/preferenze'
import { moduloChiusoPerEtichetta } from '../data/extra'
import { moduliMappa } from '../data/mappa'
import NotaModulo from '../ui/NotaModulo'
import { nodi, portelli, portelloVerso, rotta, urlVolo, type AmbienteId, type Nodo, type NodoId, type Portello } from '../data/stazione'
import { hotspotDi, luogoDi } from '../data/contenuti'
import type { Hotspot } from '../data/types'
import { assetExists } from '../lib/assets'
import { impostaSottofondo } from '../lib/ambient'
import { caloreFenomeno } from '../components/FenomeniPanel'
import FenomeniPanel from '../components/FenomeniPanel'
import Crediti from '../components/Crediti'
import Badge from '../components/Badge'
import HotspotMarker, { IndicatoreBordo } from '../ui/Hotspot'
import HotspotCard from '../ui/HotspotCard'
import SchedaLuogo from '../ui/SchedaLuogo'
import ListaPunti from '../ui/ListaPunti'
import MiniMappa from '../ui/MiniMappa'
import TappeBar from '../ui/TappeBar'
import Voce from '../ui/Voce'
import AmbienteOverlay from '../ui/Ambienti'
import SimulazioneOverlay from '../ui/Simulazioni'
import PanoStage, { ZOOM_BASE, ZOOM_MAX, type Marcatore, type PanoApi } from './PanoStage'
import VoloFx, { type FxApi } from './VoloFx'
import ImmagineNodo from './ImmagineNodo'
import type { CapsulaApi } from './CapsulaRientro'
import Legenda from './Legenda'
import Indicatore from './Indicatore'
import { attendi, distanzaAngolare, inQuad, outCubic, portelloInquadrato, rad, tween } from './geometria'
import { useVista, vista } from './vista'

const EmlScene = lazy(() => import('../components/EmlScene'))
const CapsulaRientro = lazy(() => import('./CapsulaRientro'))

const CREDITO_VOLO = 'Volo: ricostruzione IA (Higgsfield) da panorami ESA'
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

/** FOV orizzontale dei voli: il primo e l'ultimo fotogramma sono viste prospettiche a 80 gradi su 16:9 (scripts/pano-view.py) */
const HFOV_VOLO = 80
/** spinta in avanti prima dello scambio: FOV orizzontale 80 -> 77 gradi */
const HFOV_SPINTA = 77
/** punto di vista sul nadir di Tranquility (portello "To CUP") */
const NADIR = { yaw: 0, pitch: -70 }

/** Richiesta dall'esterno (Indice): viaggio rapido fino a `nodo` e, se c'è, apertura della scheda `scheda`. `n` distingue richieste uguali. */
export interface Richiesta { nodo: NodoId; scheda?: string; n: number }

interface Props {
  /** la visita è in corso (l'introduzione non copre più la scena) */
  attivo: boolean
  audioOn: boolean
  onAudio: () => void
  onHome: () => void
  onIndice: () => void
  onImpostazioni: () => void
  /** apre il pannello sulla scheda Crediti */
  onCrediti: () => void
  /** un pannello a tutto schermo (indice, impostazioni) è aperto: i tasti di navigazione sono sospesi */
  bloccato?: boolean
  richiesta?: Richiesta | null
  onRichiestaFatta?: (n: number) => void
}

function PortelloMarker({ p, onGo }: { p: Portello; onGo: () => void }) {
  const att = useVista((v) => v.portello === p.verso)
  const etichetta = p.verso === 'cupola' ? 'Scendi nella Cupola' : p.verso === 'eml' ? "Entra nell'EML" : p.verso === 'finale' ? 'Verso il finale' : `Verso ${nodi[p.verso].nome.split(/\s*[—,]\s*/)[0]}`
  return <HotspotMarker tipo="portello" attivo={att} titolo={etichetta} onClick={onGo} />
}

/** Candidato "avanti" nei nodi a immagine: il portello che non riporta indietro. */
function portelloAvantiImmagine(nodo: NodoId, precedente: NodoId | null): Portello | null {
  return portelli[nodo].find((p) => p.x !== undefined && p.verso !== precedente) ?? null
}

/** Video di volo caricato fino al primo fotogramma (o null se manca). */
function preparaVideo(url: string): Promise<HTMLVideoElement | null> {
  return new Promise((ok) => {
    const v = document.createElement('video')
    v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = url
    v.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform-origin:50% 50%'
    // pronto quando si puo` riprodurre tutto senza fermarsi; se la rete e` lenta, dopo 3 s basta il primo fotogramma
    v.addEventListener('canplaythrough', () => ok(v), { once: true })
    v.addEventListener('loadeddata', () => setTimeout(() => ok(v), 3000), { once: true })
    v.onerror = () => ok(null)
    setTimeout(() => ok(v.readyState >= 2 ? v : null), 8000)
    v.load()
  })
}

/**
 * Motore dell'esplorazione: nodo corrente, storia (per ↓), voli tra i nodi, tappe suggerite come percorso nel grafo.
 *
 * Volo con video (panorama -> panorama), un unico gesto continuo:
 *  1. la camera ruota (easing) verso il portello e porta lo zoom al FOV che corrisponde a 80 gradi orizzontali del video (object-fit: cover);
 *  2. leggera spinta in avanti (80 -> 77 gradi);
 *  3. dissolvenza brevissima (200 ms) nel video, la cui scala iniziale compensa i 3 gradi di spinta, cosi l'immagine combacia;
 *  4. a fine video il nuovo panorama e` gia` orientato/zoomato come l'ultimo fotogramma: dissolvenza breve e zoom morbido al FOV normale.
 * ↓ = vola verso il modulo precedente usando il video IN AVANTI dell'arco inverso.
 * Cupola: zoom progressivo nel panorama verso il nadir + dissolvenza nel video NASA della Terra (nessun video di volo).
 */
export default function Esplora({ attivo, audioOn, onAudio, onHome, onIndice, onImpostazioni, onCrediti, bloccato = false, richiesta = null, onRichiestaFatta }: Props) {
  const [nodoId, setNodoId] = useState<NodoId>('harmony')
  const [storia, setStoria] = useState<NodoId[]>([])
  const [visitati, setVisitati] = useState<Set<NodoId>>(() => new Set(['harmony']))
  const [viste, setViste] = useState<Set<string>>(() => new Set())
  const [volando, setVolando] = useState(false)
  const [voloIA, setVoloIA] = useState(false)
  const [apri, setApri] = useState<string | null>(null)
  const [ambiente, setAmbiente] = useState<AmbienteId | null>(null)
  const [simulazione, setSimulazione] = useState<string | null>(null)
  const [pronto, setPronto] = useState(false)
  const [fenomeno, setFenomeno] = useState<string | null>(null)
  const [suggerimento, setSuggerimento] = useState<string | null>(null)
  const [fantasma, setFantasma] = useState<Nodo | null>(null)
  const [sequenzaEml, setSequenzaEml] = useState(false)
  const [nota, setNota] = useState<string | null>(null)
  const [saltoFade, setSaltoFade] = useState(false)
  const [saltando, setSaltando] = useState(false)

  const pano = useRef<PanoApi>(null)
  const fx = useRef<FxApi>(null)
  const capsula = useRef<CapsulaApi>(null)
  const caricato = useRef<NodoId>('harmony')
  const inVolo = useRef(false)
  const annulla = useRef(false)
  const entrato = useRef(false)
  const st = useRef({ nodoId, storia, ambiente, simulazione, attivo, bloccato })
  st.current = { nodoId, storia, ambiente, simulazione, attivo, bloccato }

  const saltaVoli = usePreferenza('saltaVoli')
  const nodo = nodi[nodoId]
  const luogo = useMemo(() => luogoDi(nodoId), [nodoId])
  const hotspot = useMemo(() => hotspotDi(nodoId), [nodoId])
  const precedente = storia[storia.length - 1] ?? null

  const suggerisci = useCallback((t: string) => {
    setSuggerimento(t)
    setTimeout(() => setSuggerimento((s) => (s === t ? null : s)), 3400)
  }, [])

  // ---------- effetti visivi ----------
  const blur = (px: number) => { const el = pano.current?.elemento(); if (el) el.style.filter = px > 0.05 ? `blur(${px}px) brightness(${1 - px * 0.04})` : '' }
  const ripulisci = () => { fx.current?.imposta({ vignetta: 0, scie: 0, copertura: 0, video: 0, coperturaColore: null }); blur(0) }

  /** Zoom-in verso il portello con vignettatura/scie/blur, poi copertura (solo per i passaggi senza video). */
  const entraNelPortello = async (api: PanoApi, ms: number, daPano: boolean) => {
    const zoom = daPano ? api.zoomTo(ZOOM_MAX, ms, 'inCubic') : Promise.resolve()
    await Promise.all([zoom, tween(ms, (t) => {
      fx.current?.imposta({ vignetta: clamp01(t * 1.1), scie: t * t, copertura: clamp01((t - 0.72) / 0.28) })
      blur(t * t * 3.2)
    }, inQuad)])
  }

  const esciDalPortello = async (api: PanoApi, ms: number, aPano: boolean) => {
    const zoom = aPano ? api.zoomTo(ZOOM_BASE, ms, 'outCubic') : Promise.resolve()
    await Promise.all([zoom, tween(ms, (t) => {
      fx.current?.imposta({ vignetta: 1 - t, scie: (1 - t) * (1 - t), copertura: clamp01(1 - t * 2.2) })
      blur((1 - t) * 2.4)
    }, outCubic)])
    ripulisci()
  }

  /** Video in avanti dell'arco (mai `_rev`): quello dichiarato nell'arco o la convenzione public/voli/<da>__<a>.mp4. */
  const sceltaVideo = async (p: Portello): Promise<string | null> => {
    for (const url of [p.video, urlVolo(p.da, p.verso)]) if (url && await assetExists(url)) return url
    return null
  }

  /** Registra l'arrivo in `a`: stato React, storia, vista (per l'indicatore ↑/↓). */
  const registraArrivo = (p: Portello, a: Nodo, yaw: number, pitch: number) => {
    registraStoria(a, aggiornaStoria(st.current.storia, p.da, a.id), yaw, pitch)
  }

  /** Un passo nel grafo da `da` ad `a`: tornando al nodo in cima alla storia lo si toglie, altrimenti `da` vi si aggiunge. */
  const aggiornaStoria = (storia: NodoId[], da: NodoId, a: NodoId): NodoId[] =>
    storia[storia.length - 1] === a ? storia.slice(0, -1) : [...storia, da]

  const registraStoria = (a: Nodo, nuovaStoria: NodoId[], yaw: number, pitch: number) => {
    const s = st.current
    st.current = { ...s, nodoId: a.id, storia: nuovaStoria }
    setStoria(nuovaStoria); setNodoId(a.id); setFenomeno(null)
    setVisitati((v) => new Set(v).add(a.id))
    vista.set({
      yaw: rad(yaw), pitch: rad(pitch),
      portello: a.tipo === 'panorama' ? (portelloInquadrato(a.id, rad(yaw), rad(pitch))?.verso ?? null) : (portelloAvantiImmagine(a.id, nuovaStoria[nuovaStoria.length - 1] ?? null)?.verso ?? null),
    })
  }

  /** Sguardo all'arrivo (gradi): coerente con l'ultimo fotogramma dei video (di spalle al portello d'arrivo). */
  const sguardoArrivo = (p: Portello, daPanorama: boolean) => {
    if (p.arrivo) return p.arrivo
    if (!daPanorama) return { yaw: p.yawArrivo, pitch: p.pitchArrivo * 0.3 }
    return { yaw: p.yawArrivo + 180, pitch: 0 }
  }

  const mostraPanorama = async (api: PanoApi, a: Nodo, yaw: number, pitch: number, zoom: number) => {
    if (caricato.current !== a.id) { await api.show(a.panorama!, rad(yaw), rad(pitch), zoom); caricato.current = a.id }
    else api.orienta(rad(yaw), rad(pitch), zoom)
  }

  // ---------- volo con video, panorama -> panorama ----------
  const voloVideo = async (api: PanoApi, p: Portello, url: string, ultimo: boolean) => {
    const a = nodi[p.verso]
    const z80 = api.zoomPerVideo(HFOV_VOLO)
    const zSpinta = api.zoomPerVideo(HFOV_SPINTA)
    const yaw = rad(p.yaw), pitch = rad(p.pitch)
    const videoPronto = preparaVideo(url)
    // 1. la camera si gira verso il portello e porta lo zoom a 80 gradi (stesso FOV della prima immagine del video)
    const cur = api.posizione()
    const delta = distanzaAngolare(cur.yaw, cur.pitch, yaw, pitch)
    const dZoom = Math.abs(api.zoom() - z80) / 100
    await api.anima({ yaw, pitch, zoom: z80, ms: 500 + 900 * (delta / Math.PI) + 500 * dZoom, easing: 'inOutQuad' })
    // 2. leggera spinta in avanti
    await api.anima({ yaw, pitch, zoom: zSpinta, ms: 480, easing: 'inQuad' })
    const v = await videoPronto
    if (!v) { await api.anima({ yaw, pitch, zoom: ZOOM_MAX, ms: 700, easing: 'inQuad' }); return false }
    // 3. scambio: la scala iniziale del video compensa la spinta (tan 40 / tan 38.5), cosi le immagini combaciano
    const s0 = Math.tan(rad(HFOV_VOLO / 2)) / Math.tan(rad(HFOV_SPINTA / 2))
    v.currentTime = 0
    v.style.transform = `scale(${s0})`
    const host = fx.current?.videoHost()
    host?.replaceChildren(v)
    fx.current?.imposta({ video: 0 })
    const fine = new Promise<void>((ok) => { v.onended = () => ok(); v.onerror = () => ok(); setTimeout(ok, 14000) })
    await v.play().catch(() => {})
    setVoloIA(true)
    tween(700, (t) => { v.style.transform = `scale(${s0 + (1 - s0) * t})` }, outCubic)
    await tween(200, (t) => fx.current?.imposta({ video: t }))
    // 4. sotto il video il nuovo panorama si prepara all'orientamento d'arrivo, con lo stesso FOV dell'ultimo fotogramma
    const g = sguardoArrivo(p, true)
    await mostraPanorama(api, a, g.yaw, g.pitch, z80)
    await fine
    registraArrivo(p, a, g.yaw, g.pitch)
    await attendi(60)
    setVoloIA(false)
    await tween(220, (t) => fx.current?.imposta({ video: 1 - t }))
    host?.replaceChildren()
    ripulisci()
    if (ultimo) await api.anima({ yaw: rad(g.yaw), pitch: rad(g.pitch), zoom: ZOOM_BASE, ms: 1100, easing: 'outCubic' })
    return true
  }

  // ---------- Cupola: zoom nel panorama + dissolvenza nella Terra, e viceversa ----------
  const entraCupola = async (api: PanoApi, p: Portello) => {
    const a = nodi.cupola
    const cur = api.posizione()
    if (distanzaAngolare(cur.yaw, cur.pitch, rad(NADIR.yaw), rad(NADIR.pitch)) > 0.03) await api.anima({ yaw: rad(NADIR.yaw), pitch: rad(NADIR.pitch), ms: 800, easing: 'inOutQuad' })
    const zoom = api.anima({ yaw: rad(NADIR.yaw), pitch: rad(NADIR.pitch), zoom: ZOOM_MAX, ms: 2600, easing: 'inCubic' })
    const vign = tween(2600, (t) => fx.current?.imposta({ vignetta: t * 0.7 }), inQuad)
    await attendi(1500)
    registraArrivo(p, a, 0, 0) // monta la Cupola, che entra in dissolvenza sopra il panorama
    await Promise.all([zoom, vign])
    await attendi(500)
    api.orienta(rad(NADIR.yaw), rad(NADIR.pitch), ZOOM_BASE) // sotto la Cupola, invisibile
    ripulisci()
  }

  const esciCupola = async (api: PanoApi, p: Portello) => {
    const a = nodi.tranquility
    await mostraPanorama(api, a, NADIR.yaw, NADIR.pitch, ZOOM_MAX)
    setFantasma(nodi.cupola) // la Cupola resta un attimo per dissolversi
    registraArrivo(p, a, NADIR.yaw, NADIR.pitch)
    setTimeout(() => setFantasma(null), 900)
    await attendi(500)
    fx.current?.imposta({ vignetta: 0.7 })
    await Promise.all([
      api.anima({ yaw: rad(NADIR.yaw), pitch: rad(-48), zoom: ZOOM_BASE, ms: 2200, easing: 'outCubic' }),
      tween(2200, (t) => fx.current?.imposta({ vignetta: 0.7 * (1 - t) }), outCubic),
    ])
    ripulisci()
  }

  // ---------- Cupola <-> capsula di rientro: dissolvenza al nero/arancione di ~0,8 s (solo un taglio morbido con "salta i voli" o animazioni ridotte) ----------
  const passaggioCapsula = async (p: Portello, a: Nodo) => {
    const breve = preferenze.get().saltaVoli || preferenze.get().riduciAnimazioni
    const ms = breve ? 220 : 800
    fx.current?.imposta({ coperturaColore: 'radial-gradient(circle at center, #4a1a06 0%, #05030a 78%)' })
    await tween(ms, (t) => fx.current?.imposta({ copertura: t }), inQuad)
    const g = sguardoArrivo(p, false)
    registraArrivo(p, a, g.yaw, g.pitch)
    await attendi(breve ? 60 : 160)
    await tween(ms, (t) => fx.current?.imposta({ copertura: 1 - t }), outCubic)
    ripulisci()
  }

  // ---------- volo tra due nodi ----------
  const attraversa = async (p: Portello, ultimo: boolean) => {
    const api = pano.current
    if (!api) return
    const da = nodi[p.da], a = nodi[p.verso]
    if (da.id === 'tranquility' && a.id === 'cupola') return entraCupola(api, p)
    if (da.id === 'cupola' && a.id === 'tranquility') return esciCupola(api, p)
    if (da.id === 'finale' || a.id === 'finale') return passaggioCapsula(p, a)

    if (da.tipo === 'panorama' && a.tipo === 'panorama') {
      const url = await sceltaVideo(p)
      if (url && await voloVideo(api, p, url, ultimo)) return
    }

    // passaggio senza video: transizione procedurale (EML, finale, ritorni dalle scene non panoramiche)
    const k = ultimo ? 1 : 0.75
    if (da.tipo === 'panorama') {
      const cur = api.posizione()
      const delta = distanzaAngolare(cur.yaw, cur.pitch, rad(p.yaw), rad(p.pitch))
      if (delta > 0.02) await api.rotateTo(rad(p.yaw), rad(p.pitch), (420 + 700 * (delta / Math.PI)) * k)
      await entraNelPortello(api, 1400 * k, true)
    } else {
      await tween(550 * k, (t) => fx.current?.imposta({ copertura: t }))
    }
    const g = sguardoArrivo(p, false)
    if (a.tipo === 'panorama') await mostraPanorama(api, a, g.yaw, g.pitch, ZOOM_MAX)
    registraArrivo(p, a, g.yaw, g.pitch)
    await attendi(a.tipo === 'panorama' ? 60 : 160)
    await esciDalPortello(api, 1200 * k, a.tipo === 'panorama')
  }

  /** Vola fino a `meta` passando per i nodi intermedi. */
  const vaiA = useCallback(async (meta: NodoId) => {
    if (inVolo.current) return
    const s = st.current
    const r = rotta(s.nodoId, meta)
    if (!r || r.length < 2) return
    inVolo.current = true; annulla.current = false
    setVolando(true); setApri(null)
    try {
      for (let i = 0; i < r.length - 1; i++) {
        if (annulla.current) break
        await attraversa(portelloVerso(r[i], r[i + 1])!, i === r.length - 2 || annulla.current)
      }
    } finally {
      inVolo.current = false
      setVolando(false)
      setVoloIA(false)
      fx.current?.videoHost()?.replaceChildren()
      ripulisci()
      // se si e` annullato a meta`, riporta lo zoom al valore normale
      const api = pano.current
      if (api && nodi[st.current.nodoId].tipo === 'panorama' && api.zoom() > ZOOM_BASE + 1 && api.zoom() < ZOOM_MAX - 1) api.zoomTo(ZOOM_BASE, 800, 'outCubic')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Viaggio rapido: salto diretto a `meta`, senza voli ne` animazioni, solo una dissolvenza brevissima (~250 ms).
   * Storia, visitati e sguardo d'arrivo restano coerenti: la storia segue il percorso piu` breve nel grafo come se lo si fosse
   * percorso (cosi ↓ "torna a" riporta al modulo precedente sul percorso), e lo sguardo e` quello dell'ultimo portello attraversato.
   * Funziona da/verso i nodi non panoramici (EML, Cupola, finale). Solo `meta` risulta visitato (gli intermedi non sono stati visti).
   */
  const saltaA = useCallback(async (meta: NodoId) => {
    const s = st.current
    if (inVolo.current || meta === s.nodoId) return
    const r = rotta(s.nodoId, meta)
    const api = pano.current
    if (!r || r.length < 2 || !api) return
    inVolo.current = true; annulla.current = false
    setApri(null); setNota(null); setSaltando(true); setSaltoFade(true)
    try {
      await attendi(115)
      let storiaNuova = s.storia
      for (let i = 0; i < r.length - 1; i++) storiaNuova = aggiornaStoria(storiaNuova, r[i], r[i + 1])
      const ultimo = portelloVerso(r[r.length - 2], meta)!
      const a = nodi[meta]
      const g = sguardoArrivo(ultimo, nodi[ultimo.da].tipo === 'panorama')
      if (a.tipo === 'panorama') await mostraPanorama(api, a, g.yaw, g.pitch, ZOOM_BASE)
      setSequenzaEml(false); setVoloIA(false); setFantasma(null)
      fx.current?.videoHost()?.replaceChildren()
      ripulisci()
      registraStoria(a, storiaNuova, a.tipo === 'panorama' ? g.yaw : 0, a.tipo === 'panorama' ? g.pitch : 0)
      await attendi(50)
      setSaltoFade(false)
      await attendi(120)
    } finally {
      inVolo.current = false
      setSaltando(false); setSaltoFade(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Spostamento scelto dall'utente: viaggio rapido se la preferenza "salta i voli" e` attiva, altrimenti volo con i video. */
  const vai = useCallback((meta: NodoId) => { if (preferenze.get().saltaVoli) void saltaA(meta); else void vaiA(meta) }, [saltaA, vaiA])

  // ---------- comandi ----------
  const avanti = useCallback(() => {
    const s = st.current
    const n = nodi[s.nodoId]
    let p: Portello | null = null
    if (n.tipo === 'panorama') {
      const pos = pano.current?.posizione()
      if (pos) p = portelloInquadrato(n.id, pos.yaw, pos.pitch)
    } else p = portelloAvantiImmagine(n.id, s.storia[s.storia.length - 1] ?? null)
    if (p) vai(p.verso)
    else suggerisci(n.tipo === 'panorama' ? 'Guarda un portello (il rombo con le frecce) e premi ↑' : 'Da qui si torna indietro con ↓')
  }, [vai, suggerisci])

  /** ↓ = vola verso il modulo precedente, guardando avanti (video in avanti dell'arco inverso). */
  const indietro = useCallback(() => {
    const top = st.current.storia[st.current.storia.length - 1]
    if (top) vai(top)
    else suggerisci('Sei al punto di partenza: avanza con ↑ verso un portello')
  }, [vai, suggerisci])

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const s = st.current
      if (!s.attivo || s.ambiente || s.simulazione || s.bloccato) return
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      const su = e.key === 'ArrowUp' || e.code === 'KeyW'
      const giu = e.key === 'ArrowDown' || e.code === 'KeyS'
      if (!su && !giu) return
      e.preventDefault()
      if (inVolo.current) { annulla.current = true; return }
      if (e.repeat) return
      if (su) avanti(); else indietro()
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [avanti, indietro])

  // ---------- punti di interesse ----------
  const segnaVisto = useCallback((id: string) => setViste((v) => (v.has(id) ? v : new Set(v).add(id))), [])
  const ruotando = useRef(false)

  /** Ruota lentamente (1,2 s, easing) fino a centrare il punto; poi, se richiesto, apre la scheda. */
  const vaiAlPunto = useCallback(async (id: string, apriScheda: boolean) => {
    const h = hotspotDi(st.current.nodoId).find((x) => x.id === id)
    if (!h || inVolo.current || ruotando.current) return
    const api = pano.current
    if (st.current.nodoId === 'finale') {
      ruotando.current = true
      try { await capsula.current?.rotateToPunto(id, 1200) } finally { ruotando.current = false }
    } else if (h.pos?.tipo === 'sfera' && nodi[st.current.nodoId].tipo === 'panorama' && api) {
      ruotando.current = true
      try { await api.rotateTo(rad(h.pos.yaw), rad(h.pos.pitch), 1200) } finally { ruotando.current = false }
    }
    if (apriScheda) { setApri(id); segnaVisto(id) }
  }, [segnaVisto])

  const apriScheda = useCallback((id: string) => { setApri(id); segnaVisto(id) }, [segnaVisto])

  // ---------- ingresso nella stazione ----------
  const iniziaIngresso = async () => {
    const api = pano.current
    if (!api || entrato.current) return
    entrato.current = true
    blur(2.5)
    fx.current?.imposta({ copertura: 1, vignetta: 1 })
    await attendi(150)
    await Promise.all([
      api.zoomTo(ZOOM_BASE, 2400, 'outCubic'),
      tween(2000, (t) => { fx.current?.imposta({ copertura: 1 - clamp01(t * 1.6), vignetta: 1 - t, scie: (1 - t) * 0.4 }); blur((1 - t) * 2.5) }, outCubic),
    ])
    ripulisci()
  }
  // richiesta dall'Indice (anche dall'introduzione): niente ingresso lento, si va dritti alla destinazione
  useEffect(() => {
    if (!richiesta || !attivo || !pronto) return
    const api = pano.current
    if (!api) return
    entrato.current = true
    onRichiestaFatta?.(richiesta.n)
    ;(async () => {
      fx.current?.imposta({ copertura: 0, vignetta: 0, scie: 0, video: 0 })
      if (richiesta.nodo === st.current.nodoId) await api.zoomTo(ZOOM_BASE, 700, 'outCubic')
      else await saltaA(richiesta.nodo)
      if (richiesta.scheda) {
        const h = hotspotDi(richiesta.nodo).find((x) => x.id === richiesta.scheda)
        if (h) {
          if (h.pos?.tipo === 'sfera' && nodi[richiesta.nodo].tipo === 'panorama') api.orienta(rad(h.pos.yaw), rad(h.pos.pitch), ZOOM_BASE)
          setApri(h.id); segnaVisto(h.id)
        }
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [richiesta, attivo, pronto])
  useEffect(() => { if (pronto && attivo) iniziaIngresso() }, [pronto, attivo]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- sottofondo: rombo del rientro nel finale, stazione altrove (dissolvenza incrociata in lib/ambient) ----------
  useEffect(() => { impostaSottofondo(nodoId === 'finale' ? 'rientro' : 'stazione') }, [nodoId])
  useEffect(() => () => impostaSottofondo('stazione'), [])

  // ---------- precarico dei vicini ----------
  useEffect(() => {
    if (!attivo) return
    const id = setTimeout(() => {
      for (const p of portelli[nodoId]) {
        const v = nodi[p.verso]
        if (v.tipo === 'panorama' && v.panorama && caricato.current !== v.id) { const i = new Image(); i.src = v.panorama }
        assetExists(urlVolo(p.da, p.verso)).then((ok) => { if (ok && v.tipo === 'panorama') fetch(urlVolo(p.da, p.verso)).catch(() => {}) })
      }
    }, 1500)
    return () => clearTimeout(id)
  }, [nodoId, attivo])

  // ---------- marcatori del panorama ----------
  const marcatori: Marcatore[] = useMemo(() => {
    if (nodo.tipo !== 'panorama') return []
    const out: Marcatore[] = []
    for (const h of hotspot) if (h.pos?.tipo === 'sfera') {
      out.push({
        key: `h:${h.id}`, yaw: h.pos.yaw, pitch: h.pos.pitch,
        nodo: <HotspotMarker tipo={h.categoria} titolo={h.titolo} simulazione={h.simulazione} visto={viste.has(h.id)} onClick={() => apriScheda(h.id)} />,
        bordo: <IndicatoreBordo tipo={h.categoria} titolo={h.titolo} simulazione={h.simulazione} onClick={() => vaiAlPunto(h.id, false)} />,
      })
    }
    for (const p of portelli[nodo.id]) out.push({ key: `p:${p.verso}`, yaw: p.yaw, pitch: p.pitch, nodo: <PortelloMarker p={p} onGo={() => vai(p.verso)} /> })
    for (const c of nodo.chiusi ?? []) {
      const idModulo = moduloChiusoPerEtichetta(c.etichetta)?.id ?? moduliMappa.find((m) => !m.nodo && c.etichetta.toLowerCase().includes(m.nome.toLowerCase()))?.id
      out.push({ key: `c:${c.etichetta}`, yaw: c.yaw, pitch: c.pitch, nodo: <HotspotMarker tipo="chiuso" titolo={c.etichetta.split(/\s*\(/)[0]} onClick={idModulo ? () => setNota(idModulo) : undefined} /> })
    }
    for (const a of nodo.porte ?? []) if (a.yaw !== undefined) out.push({ key: `a:${a.ambiente}`, yaw: a.yaw, pitch: a.pitch ?? 0, nodo: <HotspotMarker tipo="ambiente" ambiente={a.ambiente} titolo={a.titolo} onClick={() => setAmbiente(a.ambiente)} /> })
    return out
  }, [nodo, hotspot, vai, viste, apriScheda, vaiAlPunto])

  const hotspotEml: Hotspot[] = useMemo(() => hotspot.filter((h) => h.pos?.tipo === 'oggetto3d').map((h) => ({
    id: h.id, titolo: h.titolo, testo: h.breve, badge: h.badge, categoria: h.categoria, simulazione: h.simulazione,
    oggetto3d: h.pos?.tipo === 'oggetto3d' ? h.pos.oggetto : undefined, spostamento3d: h.pos?.tipo === 'oggetto3d' ? h.pos.spostamento : undefined,
  })), [hotspot])

  const voci = useMemo(() => hotspot.map((h) => ({ id: h.id, titolo: h.titolo, categoria: h.categoria, visto: viste.has(h.id), simulazione: h.simulazione })), [hotspot, viste])
  const scheda = hotspot.find((h) => h.id === apri) ?? null
  useEffect(() => { if (apri) segnaVisto(apri) }, [apri, segnaVisto])
  const panoramico = nodo.tipo === 'panorama'
  const principale = nodi.harmony

  // aggancio per le prove automatiche (solo in sviluppo)
  if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__iss = { vaiA, saltaA, avanti, indietro, vaiAlPunto, pano, st }

  return (
    <div className="absolute inset-0 isolate overflow-hidden bg-[#05070f]">
      <PanoStage
        ref={pano}
        url={principale.panorama!}
        yaw={principale.yawIniziale} pitch={principale.pitchIniziale}
        marcatori={marcatori}
        nascosti={volando || !attivo || !panoramico}
        schedaAperta={!!scheda}
        onPosizione={(y, p) => vista.set({ yaw: y, pitch: p, portello: nodi[st.current.nodoId].tipo === 'panorama' ? (portelloInquadrato(st.current.nodoId, y, p)?.verso ?? null) : vista.get().portello })}
        onPronto={() => { pano.current?.orienta(rad(principale.yawIniziale), rad(principale.pitchIniziale), ZOOM_MAX); setPronto(true) }}
      />

      {nodo.tipo === 'eml' && (
        <div className="absolute inset-0 z-20">
          <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center bg-[#05070f] text-sm text-white/40">Caricamento…</div>}>
            <EmlScene hotspot={hotspotEml} attivo={apri} fenomeno={fenomeno} calore={fenomeno ? caloreFenomeno[fenomeno] : null} onHotspot={apriScheda} onSequenza={setSequenzaEml} />
          </Suspense>
          {!scheda && !sequenzaEml && <FenomeniPanel attivo={fenomeno} onSelect={setFenomeno} />}
          {!scheda && !sequenzaEml && nodo.porte?.map((a) => (
            <div key={a.ambiente} className="absolute bottom-[13rem] right-[26.5rem] z-30"><HotspotMarker tipo="ambiente" ambiente={a.ambiente} titolo={a.titolo} onClick={() => setAmbiente(a.ambiente)} /></div>
          ))}
        </div>
      )}
      {nodo.tipo === 'cupola' && (
        <ImmagineNodo
          key={nodo.id} nodo={nodo} hotspot={hotspot} portelli={portelli[nodo.id]} porte={nodo.porte ?? []}
          onHotspot={apriScheda} onPortello={(p) => vai(p.verso)} onAmbiente={setAmbiente} nomeNodo={(id) => nodi[id].nome}
        />
      )}
      {nodo.tipo === 'finale' && (
        <Suspense fallback={<div className="absolute inset-0 z-20 bg-[#02030a]" />}>
          <CapsulaRientro
            ref={capsula} hotspot={hotspot} portelli={portelli.finale} pausa={!attivo || !!ambiente || !!simulazione || bloccato}
            visti={viste} onHotspot={apriScheda} onPortello={(p) => vai(p.verso)} nomeNodo={(id) => nodi[id].nome}
          />
        </Suspense>
      )}
      {fantasma && <ImmagineNodo key={`f-${fantasma.id}`} uscendo nodo={fantasma} hotspot={[]} portelli={[]} porte={[]} onHotspot={() => {}} onPortello={() => {}} onAmbiente={() => {}} nomeNodo={(id) => nodi[id].nome} />}

      {attivo && (
        <>
          <div className={`transition-opacity duration-300 ${volando ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
            <div className="absolute left-4 top-[4.75rem] z-30 flex max-h-[calc(100vh-12rem)] flex-col gap-3">
              <SchedaLuogo key={nodo.id} luogo={luogo} iniziaChiusa={nodo.tipo === 'eml'} />
              {!(nodo.tipo === 'eml' && sequenzaEml) && <ListaPunti key={`l-${nodo.id}`} punti={voci} onScegli={(id) => vaiAlPunto(id, true)} />}
              {nodo.id === 'finale' && (
                <button onClick={onHome} className="btn-ghost fixed bottom-5 left-[calc(50%+7.5rem)] z-30 !py-2 text-sm">Ricomincia dall'inizio</button>
              )}
            </div>
            {scheda && <HotspotCard scheda={scheda} audioOn={audioOn} onClose={() => setApri(null)} onSimulazione={setSimulazione} />}
            {!(nodo.tipo === 'eml' && sequenzaEml) && <Indicatore precedente={precedente} laterale={nodo.tipo === 'eml'} />}
            {suggerimento && (
              <div className="fade-in pointer-events-none absolute bottom-[11.5rem] left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/20 bg-[rgba(4,8,20,.85)] px-4 py-1.5 text-sm text-white/85">{suggerimento}</div>
            )}
          </div>
          <MiniMappa corrente={nodoId} visitati={visitati} onVaiA={(n) => { void vaiA(n) }} onSaltaA={(n) => { void saltaA(n) }} onNota={setNota} saltaVoli={saltaVoli} occupato={volando || saltando} />
          {nota && <NotaModulo key={nota} id={nota} onClose={() => setNota(null)} />}
          <TappeBar corrente={nodoId} visitati={visitati} occupato={volando || saltando} onVai={vai} />
          <Legenda />
          <Voce
            key={nodo.id} luogo={luogo} audioOn={audioOn} onAudio={onAudio} schedaAperta={!!scheda}
            extra={(
              <>
                <button onClick={onIndice} title="Indice di tutti i contenuti" aria-label="Indice di tutti i contenuti" className="glass flex items-center gap-1.5 rounded-full px-3 py-2.5 text-xs text-white/80 hover:text-white"><BookOpen size={16} /><span className="hidden 2xl:inline">Indice</span></button>
                <button onClick={onImpostazioni} title="Impostazioni" aria-label="Impostazioni" className="glass rounded-full p-2.5 text-white/70 hover:text-white"><Settings size={16} /></button>
                <button onClick={onHome} title="Torna all'introduzione" aria-label="Torna all'introduzione" className="glass hidden rounded-full p-2.5 text-white/70 hover:text-white xl:block"><Home size={16} /></button>
              </>
            )}
          />
          <Crediti credito={nodo.credito} onApri={onCrediti} />
        </>
      )}

      <VoloFx ref={fx} />
      {voloIA && (
        <div className="fade-in pointer-events-none absolute bottom-5 left-4 z-[36] flex flex-col gap-1.5">
          <Badge tipo="ia" />
          <span className="credito-linea">{CREDITO_VOLO}</span>
        </div>
      )}
      <div className={`salto-fade ${saltoFade ? 'on' : ''}`} aria-hidden />
      {(volando || saltando) && <div className="absolute inset-0 z-[38] cursor-progress" />}
      {ambiente && <AmbienteOverlay id={ambiente} onClose={() => setAmbiente(null)} />}
      {simulazione && <SimulazioneOverlay id={simulazione} onClose={() => setSimulazione(null)} />}
      {!pronto && <div className="absolute inset-0 z-[39] flex items-center justify-center bg-[#05070f] text-xs uppercase tracking-[0.35em] text-white/40">Caricamento della stazione…</div>}
    </div>
  )
}
