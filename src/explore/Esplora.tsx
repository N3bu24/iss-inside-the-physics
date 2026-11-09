import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Home } from 'lucide-react'
import { nodi, percorsoGuidato, portelli, portelloVerso, rotta, urlVolo, type AmbienteId, type NodoId, type Portello } from '../data/stazione'
import { hotspotDi, luogoDi } from '../data/contenuti'
import type { Hotspot } from '../data/types'
import { assetExists } from '../lib/assets'
import { caloreFenomeno } from '../components/FenomeniPanel'
import FenomeniPanel from '../components/FenomeniPanel'
import Crediti from '../components/Crediti'
import Badge from '../components/Badge'
import HotspotMarker from '../ui/Hotspot'
import HotspotCard from '../ui/HotspotCard'
import SchedaLuogo from '../ui/SchedaLuogo'
import MiniMappa from '../ui/MiniMappa'
import PercorsoBar from '../ui/PercorsoBar'
import Voce from '../ui/Voce'
import AmbienteOverlay from '../ui/Ambienti'
import PanoStage, { ZOOM_BASE, ZOOM_MAX, type Marcatore, type PanoApi } from './PanoStage'
import VoloFx, { type FxApi } from './VoloFx'
import ImmagineNodo from './ImmagineNodo'
import Legenda from './Legenda'
import Indicatore from './Indicatore'
import { attendi, distanzaAngolare, inCubic, inQuad, outCubic, portelloInquadrato, rad, tween } from './geometria'
import { useVista, vista } from './vista'

const EmlScene = lazy(() => import('../components/EmlScene'))

const CREDITO_VOLO = 'Volo: ricostruzione IA (Higgsfield) da panorami ESA'
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

interface Props {
  /** la visita è in corso (l'introduzione non copre più la scena) */
  attivo: boolean
  guidataIniziale: boolean
  audioOn: boolean
  onAudio: () => void
  onHome: () => void
}

function PortelloMarker({ p, onGo }: { p: Portello; onGo: () => void }) {
  const att = useVista((v) => v.portello === p.verso)
  const etichetta = p.verso === 'cupola' ? 'Scendi nella Cupola' : p.verso === 'eml' ? "Entra nell'EML" : `Verso ${nodi[p.verso].nome}`
  return <HotspotMarker tipo="portello" attivo={att} titolo={etichetta} onClick={onGo} />
}

/** Candidato "avanti" nei nodi a immagine: il portello che non riporta indietro. */
function portelloAvantiImmagine(nodo: NodoId, precedente: NodoId | null): Portello | null {
  return portelli[nodo].find((p) => p.x !== undefined && p.verso !== precedente) ?? null
}

/**
 * Motore dell'esplorazione: nodo corrente, storia (per ↓), voli tra i nodi (video se presente, altrimenti transizione procedurale),
 * visita guidata come percorso nel grafo.
 */
export default function Esplora({ attivo, guidataIniziale, audioOn, onAudio, onHome }: Props) {
  const [nodoId, setNodoId] = useState<NodoId>('harmony')
  const [storia, setStoria] = useState<NodoId[]>([])
  const [visitati, setVisitati] = useState<Set<NodoId>>(() => new Set(['harmony']))
  const [volando, setVolando] = useState(false)
  const [voloIA, setVoloIA] = useState(false)
  const [apri, setApri] = useState<string | null>(null)
  const [ambiente, setAmbiente] = useState<AmbienteId | null>(null)
  const [guidata, setGuidata] = useState(guidataIniziale)
  const [idx, setIdx] = useState(0)
  const [pronto, setPronto] = useState(false)
  const [fenomeno, setFenomeno] = useState<string | null>(null)
  const [suggerimento, setSuggerimento] = useState<string | null>(null)

  const pano = useRef<PanoApi>(null)
  const fx = useRef<FxApi>(null)
  const caricato = useRef<NodoId>('harmony')
  const inVolo = useRef(false)
  const annulla = useRef(false)
  const entrato = useRef(false)
  const st = useRef({ nodoId, storia, guidata, idx, ambiente, attivo })
  st.current = { nodoId, storia, guidata, idx, ambiente, attivo }

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
  const ripulisci = () => { fx.current?.imposta({ vignetta: 0, scie: 0, copertura: 0, video: 0 }); blur(0) }

  /** Zoom-in verso il portello con vignettatura/scie/blur, poi copertura. `fin` = quota di tempo in cui sale la copertura. */
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

  const sceltaVideo = async (p: Portello, indietro: boolean): Promise<{ url: string; rev: boolean } | null> => {
    const cand: { url: string; rev: boolean }[] = []
    if (p.video) cand.push({ url: p.video, rev: false })
    if (indietro) cand.push({ url: `/voli/${p.verso}__${p.da}_rev.mp4`, rev: true })
    cand.push({ url: urlVolo(p.da, p.verso), rev: false })
    for (const c of cand) if (await assetExists(c.url)) return c
    return null
  }

  const riproduciVideo = async (url: string) => {
    const host = fx.current?.videoHost()
    if (!host) return
    const v = document.createElement('video')
    v.src = url; v.muted = true; v.playsInline = true; v.preload = 'auto'
    v.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover'
    host.replaceChildren(v)
    const fine = new Promise<void>((ok) => {
      v.onended = () => ok(); v.onerror = () => ok()
      v.play().catch(() => ok())
      setTimeout(ok, 20000)
    })
    setVoloIA(true)
    await tween(450, (t) => fx.current?.imposta({ video: t }))
    await fine
  }

  // ---------- volo tra due nodi ----------
  const attraversa = async (p: Portello, indietro: boolean, veloce: boolean) => {
    const api = pano.current
    if (!api) return
    const da = nodi[p.da], a = nodi[p.verso]
    const scelto = await sceltaVideo(p, indietro)
    const k = veloce ? 0.75 : 1
    let rev = false
    if (da.tipo === 'panorama') {
      const cur = api.posizione()
      const delta = distanzaAngolare(cur.yaw, cur.pitch, rad(p.yaw), rad(p.pitch))
      if (delta > 0.02) await api.rotateTo(rad(p.yaw), rad(p.pitch), (420 + 700 * (delta / Math.PI)) * k)
    }
    let zoomArrivo = ZOOM_MAX
    if (scelto) {
      rev = scelto.rev
      if (da.tipo === 'panorama') {
        await Promise.all([api.zoomTo(40, 650, 'inQuad'), tween(650, (t) => { fx.current?.imposta({ vignetta: t * 0.6, scie: t * 0.3 }); blur(t * 1.5) }, inQuad)])
      }
      await riproduciVideo(scelto.url)
      zoomArrivo = 30
    } else if (da.tipo === 'panorama') {
      await entraNelPortello(api, 1400 * k, true)
    } else {
      await tween(550 * k, (t) => fx.current?.imposta({ copertura: t }))
    }

    // sguardo all'arrivo
    let yaw: number, pitch: number
    if (rev) { yaw = p.yawArrivo; pitch = p.pitchArrivo * 0.3 }
    else if (p.arrivo) { yaw = p.arrivo.yaw; pitch = p.arrivo.pitch }
    else if (da.tipo !== 'panorama') { yaw = p.yawArrivo; pitch = p.pitchArrivo * 0.3 }
    else { yaw = p.yawArrivo + 180; pitch = 0 }

    // scambio (sotto copertura)
    if (a.tipo === 'panorama') {
      if (caricato.current !== a.id) { await api.show(a.panorama!, rad(yaw), rad(pitch), zoomArrivo); caricato.current = a.id }
      else api.orienta(rad(yaw), rad(pitch), zoomArrivo)
    }
    const s = st.current
    const top = s.storia[s.storia.length - 1]
    const nuovaStoria = top === a.id ? s.storia.slice(0, -1) : [...s.storia, da.id]
    st.current = { ...s, nodoId: a.id, storia: nuovaStoria }
    setStoria(nuovaStoria); setNodoId(a.id); setFenomeno(null)
    setVisitati((v) => new Set(v).add(a.id))
    vista.set({
      yaw: rad(yaw), pitch: rad(pitch),
      portello: a.tipo === 'panorama' ? (portelloInquadrato(a.id, rad(yaw), rad(pitch))?.verso ?? null) : (portelloAvantiImmagine(a.id, nuovaStoria[nuovaStoria.length - 1] ?? null)?.verso ?? null),
    })
    await attendi(a.tipo === 'panorama' ? 60 : 160)

    // dissolvenza nel nuovo luogo
    if (scelto) {
      setVoloIA(false)
      await Promise.all([a.tipo === 'panorama' ? api.zoomTo(ZOOM_BASE, 900, 'outCubic') : Promise.resolve(), tween(800, (t) => { fx.current?.imposta({ video: 1 - t, vignetta: (1 - t) * 0.6, scie: (1 - t) * 0.3 }); blur((1 - t) * 1.5) })])
      fx.current?.videoHost()?.replaceChildren()
      ripulisci()
    } else {
      await esciDalPortello(api, 1200 * k, a.tipo === 'panorama')
    }
  }

  /** Vola fino a `meta` passando per i nodi intermedi. `guida` = indice del percorso guidato a cui si arriva. */
  const vaiA = useCallback(async (meta: NodoId, guida?: number) => {
    if (inVolo.current) return
    const s = st.current
    const r = rotta(s.nodoId, meta)
    if (!r || r.length < 2) return
    if (guida === undefined && s.guidata) {
      const dir = r.length === 2 ? (meta === percorsoGuidato[s.idx + 1] ? 1 : meta === percorsoGuidato[s.idx - 1] ? -1 : 0) : 0
      if (dir) setIdx(s.idx + dir); else setGuidata(false)
    }
    inVolo.current = true; annulla.current = false
    setVolando(true); setApri(null)
    try {
      for (let i = 0; i < r.length - 1; i++) {
        if (annulla.current) break
        const p = portelloVerso(r[i], r[i + 1])!
        const cur = st.current
        await attraversa(p, cur.storia[cur.storia.length - 1] === r[i + 1], r.length > 2)
      }
      if (guida !== undefined && !annulla.current) { setGuidata(true); setIdx(guida) }
    } finally {
      inVolo.current = false
      setVolando(false)
      ripulisci()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------- comandi ----------
  const avanti = useCallback(() => {
    const s = st.current
    const n = nodi[s.nodoId]
    let p: Portello | null = null
    if (n.tipo === 'panorama') {
      const pos = pano.current?.posizione()
      if (pos) p = portelloInquadrato(n.id, pos.yaw, pos.pitch)
    } else p = portelloAvantiImmagine(n.id, s.storia[s.storia.length - 1] ?? null)
    if (p) vaiA(p.verso)
    else suggerisci(n.tipo === 'panorama' ? 'Guarda un portello (il cerchio con la porta) e premi ↑' : 'Da qui si torna indietro con ↓')
  }, [vaiA, suggerisci])

  const indietro = useCallback(() => {
    const top = st.current.storia[st.current.storia.length - 1]
    if (top) vaiA(top)
    else suggerisci('Sei al punto di partenza: avanza con ↑ verso un portello')
  }, [vaiA, suggerisci])

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const s = st.current
      if (!s.attivo || s.ambiente) return
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      if (e.key === 'Escape') { setApri(null); return }
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

  // ---------- visita guidata ----------
  const tot = percorsoGuidato.length
  const prossimo = () => idx + 1 < tot && vaiA(percorsoGuidato[idx + 1], idx + 1)
  const precedenteGuida = () => idx > 0 && vaiA(percorsoGuidato[idx - 1], idx - 1)
  const riprendi = () => {
    const vicini = percorsoGuidato.map((n, i) => ({ n, i })).filter((x) => x.n === nodoId)
    if (!vicini.length) { vaiA(percorsoGuidato[idx], idx); return }
    const j = vicini.reduce((b, x) => (Math.abs(x.i - idx) < Math.abs(b.i - idx) ? x : b)).i
    setIdx(j); setGuidata(true)
  }

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
  useEffect(() => { if (attivo) setGuidata(guidataIniziale) }, [attivo, guidataIniziale])
  useEffect(() => { if (pronto && attivo) iniziaIngresso() }, [pronto, attivo]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- precarico dei vicini ----------
  useEffect(() => {
    if (!attivo) return
    const id = setTimeout(() => {
      for (const p of portelli[nodoId]) {
        const v = nodi[p.verso]
        if (v.tipo === 'panorama' && v.panorama && caricato.current !== v.id) { const i = new Image(); i.src = v.panorama }
        assetExists(urlVolo(p.da, p.verso)).then((ok) => { if (ok) fetch(urlVolo(p.da, p.verso)).catch(() => {}) })
      }
    }, 1500)
    return () => clearTimeout(id)
  }, [nodoId, attivo])

  // ---------- marcatori del panorama ----------
  const marcatori: Marcatore[] = useMemo(() => {
    if (nodo.tipo !== 'panorama') return []
    const out: Marcatore[] = []
    for (const h of hotspot) if (h.pos?.tipo === 'sfera') out.push({ key: `h:${h.id}`, yaw: h.pos.yaw, pitch: h.pos.pitch, nodo: <HotspotMarker tipo={h.categoria} titolo={h.titolo} onClick={() => setApri(h.id)} /> })
    for (const p of portelli[nodo.id]) out.push({ key: `p:${p.verso}`, yaw: p.yaw, pitch: p.pitch, nodo: <PortelloMarker p={p} onGo={() => vaiA(p.verso)} /> })
    for (const c of nodo.chiusi ?? []) out.push({ key: `c:${c.etichetta}`, yaw: c.yaw, pitch: c.pitch, nodo: <HotspotMarker tipo="chiuso" titolo={`${c.etichetta}: non percorribile`} /> })
    for (const a of nodo.porte ?? []) if (a.yaw !== undefined) out.push({ key: `a:${a.ambiente}`, yaw: a.yaw, pitch: a.pitch ?? 0, nodo: <HotspotMarker tipo="ambiente" titolo={a.titolo} onClick={() => setAmbiente(a.ambiente)} /> })
    return out
  }, [nodo, hotspot, vaiA])

  const hotspotEml: Hotspot[] = useMemo(() => hotspot.filter((h) => h.pos?.tipo === 'oggetto3d').map((h) => ({
    id: h.id, titolo: h.titolo, testo: h.breve, badge: h.badge, categoria: h.categoria,
    oggetto3d: h.pos?.tipo === 'oggetto3d' ? h.pos.oggetto : undefined, spostamento3d: h.pos?.tipo === 'oggetto3d' ? h.pos.spostamento : undefined,
  })), [hotspot])

  const scheda = hotspot.find((h) => h.id === apri) ?? null
  const panoramico = nodo.tipo === 'panorama'
  const principale = nodi.harmony

  return (
    <div className="absolute inset-0 isolate overflow-hidden bg-[#05070f]">
      <PanoStage
        ref={pano}
        url={principale.panorama!}
        yaw={principale.yawIniziale} pitch={principale.pitchIniziale}
        marcatori={marcatori}
        nascosti={volando || !attivo || !panoramico}
        onPosizione={(y, p) => vista.set({ yaw: y, pitch: p, portello: nodi[st.current.nodoId].tipo === 'panorama' ? (portelloInquadrato(st.current.nodoId, y, p)?.verso ?? null) : vista.get().portello })}
        onPronto={() => { pano.current?.orienta(rad(principale.yawIniziale), rad(principale.pitchIniziale), ZOOM_MAX); setPronto(true) }}
      />

      {nodo.tipo === 'eml' && (
        <div className="absolute inset-0 z-20">
          <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center bg-[#05070f] text-sm text-white/40">Caricamento…</div>}>
            <EmlScene hotspot={hotspotEml} attivo={apri} fenomeno={fenomeno} calore={fenomeno ? caloreFenomeno[fenomeno] : null} onHotspot={setApri} />
          </Suspense>
          <FenomeniPanel attivo={fenomeno} onSelect={setFenomeno} />
          {nodo.porte?.map((a) => (
            <div key={a.ambiente} className="absolute right-[7%] top-[52%] z-30"><HotspotMarker tipo="ambiente" titolo={a.titolo} onClick={() => setAmbiente(a.ambiente)} /></div>
          ))}
        </div>
      )}
      {(nodo.tipo === 'cupola' || nodo.tipo === 'finale') && (
        <ImmagineNodo
          key={nodo.id} nodo={nodo} hotspot={hotspot} portelli={portelli[nodo.id]} porte={nodo.porte ?? []}
          onHotspot={setApri} onPortello={(p) => vaiA(p.verso)} onAmbiente={setAmbiente} nomeNodo={(id) => nodi[id].nome}
        />
      )}

      {attivo && (
        <>
          <div className={`transition-opacity duration-300 ${volando ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
            <SchedaLuogo key={nodo.id} luogo={luogo} iniziaChiusa={nodo.tipo === 'eml'} />
            {scheda && <HotspotCard scheda={scheda} onClose={() => setApri(null)} />}
            <Indicatore precedente={precedente} />
            {suggerimento && (
              <div className="fade-in pointer-events-none absolute bottom-[9.2rem] left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/20 bg-[rgba(4,8,20,.85)] px-4 py-1.5 text-sm text-white/85">{suggerimento}</div>
            )}
            {nodo.id === 'finale' && (
              <button onClick={onHome} className="btn-ghost absolute bottom-40 left-1/2 z-30 -translate-x-1/2 !py-2 text-sm">Ricomincia dall'inizio</button>
            )}
          </div>
          <MiniMappa corrente={nodoId} visitati={visitati} onVaiA={(n) => vaiA(n)} occupato={volando} />
          <PercorsoBar
            guidata={guidata} indice={idx} totale={tot} titolo={nodo.nome} occupato={volando}
            onPrev={precedenteGuida} onNext={prossimo} onLibero={() => setGuidata(false)} onRiprendi={riprendi}
          />
          <Legenda />
          <Voce key={nodo.id} luogo={luogo} audioOn={audioOn} onAudio={onAudio} />
          <button onClick={onHome} title="Torna all'introduzione" aria-label="Torna all'introduzione" className="glass absolute bottom-5 right-[17.5rem] z-30 hidden rounded-full p-2.5 text-white/70 hover:text-white xl:block">
            <Home size={16} />
          </button>
          <Crediti credito={nodo.credito} />
        </>
      )}

      <VoloFx ref={fx} />
      {voloIA && (
        <div className="fade-in pointer-events-none absolute bottom-5 left-4 z-[36] flex flex-col gap-1.5">
          <Badge tipo="ia" />
          <span className="credito-linea">{CREDITO_VOLO}</span>
        </div>
      )}
      {volando && <div className="absolute inset-0 z-[38] cursor-progress" />}
      {ambiente && <AmbienteOverlay id={ambiente} onClose={() => setAmbiente(null)} />}
      {!pronto && <div className="absolute inset-0 z-[39] flex items-center justify-center bg-[#05070f] text-xs uppercase tracking-[0.35em] text-white/40">Caricamento della stazione…</div>}
    </div>
  )
}
