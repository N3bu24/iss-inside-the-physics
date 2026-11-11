import { assetExists } from './assets'
import { preferenze } from './preferenze'

/**
 * Audio di sottofondo della stazione (public/audio/ambient/stazione.mp3), in loop, con abbassamento automatico (ducking)
 * quando parla una voce narrante. Se il file manca il modulo non fa nulla (silenzio, nessun errore).
 *
 * Catena: sorgente in loop -> highpass 60 Hz -> lowpass 12,5 kHz -> gain -> uscita.
 * Parte solo dopo un gesto dell'utente (`avviaAmbient`, chiamata dal pulsante "Inizia l'esplorazione").
 */

export type Sottofondo = 'stazione' | 'rientro' | 'simulazioni'
/**
 * Tracce di sottofondo. `gainDb` compensa il livello di registrazione: il rombo del rientro e` a -29,4 LUFS, quasi come la stazione
 * (-30,5), ma deve risultare nettamente piu` presente: +5 dB. Passano entrambe da `entrata`, quindi da ducking, volume e analizzatore.
 */
const TRACCE: Record<Sottofondo, { url: string; gainDb: number }> = {
  stazione: { url: '/audio/ambient/stazione.mp3', gainDb: 0 },
  rientro: { url: '/audio/ambient/rientro.mp3', gainDb: 5 },
  simulazioni: { url: '/audio/ambient/simulazioni.mp3', gainDb: 0 },
}
/** durata della dissolvenza incrociata (s): setTargetAtTime con tau = DURATA / 3 */
const DISSOLVENZA = 1.5
/** volume di base del sottofondo (0..1) */
export const GAIN_BASE = 0.22
/** frazione del volume base mentre una voce parla */
const FATTORE_DUCK = 0.32
/** costanti di tempo (s) di setTargetAtTime: la rampa completa dura circa 3 volte questo valore */
const TAU_DUCK_GIU = 0.2   // ~0,6 s
const TAU_DUCK_SU = 0.5    // ~1,5 s
const TAU_AVVIO = 1.0     // ~3 s (prima entrata del sottofondo)
const TAU_ENTRATA = 0.35   // ~1 s (riaccensione dell'audio: deve essere pronta)
const TAU_USCITA = 0.08    // ~0,25 s (muto: immediato)

let ctx: AudioContext | null = null
let gain: GainNode | null = null
let avviato = false
let attivo = true
let entrata: AudioNode | null = null
let analisi: AnalyserNode | null = null
let gainVoce: GainNode | null = null
const collegate = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>()

/** elementi audio che stanno parlando (DOM catturati dagli eventi globali + Audio creati a mano) */
const inUso = new Set<HTMLMediaElement>()
const seguiti = new WeakSet<HTMLMediaElement>()

const staParlando = (el: HTMLMediaElement) => !el.paused && !el.ended && !el.muted && el.volume > 0

function aggiorna() {
  for (const el of [...inUso]) if (!staParlando(el)) inUso.delete(el)
  applica()
}

function applica(tau?: number) {
  if (!ctx || !gain) return
  const duck = inUso.size > 0
  const target = attivo ? GAIN_BASE * preferenze.get().volumeSottofondo * (duck ? FATTORE_DUCK : 1) : 0
  const t = tau ?? (!attivo ? TAU_USCITA : duck ? TAU_DUCK_GIU : TAU_DUCK_SU)
  gain.gain.cancelScheduledValues(ctx.currentTime)
  gain.gain.setTargetAtTime(target, ctx.currentTime, t)
}

function registra(el: HTMLMediaElement) {
  if (el.paused || el.ended || el.muted) { inUso.delete(el); return }
  inUso.add(el)
}

function gestisci(e: Event) {
  const el = e.target
  if (!(el instanceof HTMLAudioElement)) return
  registra(el)
  aggiorna()
}

let ascoltoGlobale = false
function ascoltaGlobale() {
  if (ascoltoGlobale || typeof document === 'undefined') return
  ascoltoGlobale = true
  // gli eventi media non risalgono: si ascolta in fase di cattura su document (copre ogni <audio> nel DOM)
  for (const ev of ['play', 'playing', 'pause', 'ended', 'emptied', 'volumechange']) document.addEventListener(ev, gestisci, true)
  // rete di sicurezza: elementi rimossi dal DOM mentre suonavano
  window.setInterval(() => { if (inUso.size) aggiorna() }, 500)
}
ascoltaGlobale()

/** Per gli `Audio` creati a mano (non nel DOM): da chiamare una volta per elemento. */
export function seguiVoce(el: HTMLMediaElement) {
  if (seguiti.has(el)) return
  seguiti.add(el)
  for (const ev of ['play', 'playing', 'pause', 'ended', 'emptied', 'volumechange']) el.addEventListener(ev, () => { registra(el); aggiorna() })
}

const nodiTraccia: Partial<Record<Sottofondo, GainNode>> = {}
const inCaricamento = new Set<Sottofondo>()
let desiderato: Sottofondo = 'stazione'
/** dentro una simulazione: se la musica esiste sostituisce il sottofondo, altrimenti resta quello di prima */
let inSim = false
const effettivo = (): Sottofondo => (inSim && nodiTraccia.simulazioni ? 'simulazioni' : desiderato)

/** Porta il livello di ogni traccia caricata al valore voluto: la desiderata sale, le altre scendono (dissolvenza incrociata). */
function applicaTracce(tau = DISSOLVENZA / 3) {
  if (!ctx) return
  for (const k of Object.keys(nodiTraccia) as Sottofondo[]) {
    const g = nodiTraccia[k]!
    const t = k === effettivo() ? Math.pow(10, TRACCE[k].gainDb / 20) : 0
    g.gain.cancelScheduledValues(ctx.currentTime)
    g.gain.setTargetAtTime(t, ctx.currentTime, tau)
  }
}

async function caricaTraccia(nome: Sottofondo) {
  if (!ctx || !entrata || nodiTraccia[nome] || inCaricamento.has(nome)) return
  inCaricamento.add(nome)
  const url = TRACCE[nome].url
  try {
    if (!(await assetExists(url))) return
    const r = await fetch(url)
    if (!r.ok) return
    const buffer = await ctx.decodeAudioData(await r.arrayBuffer())
    if (!ctx || !entrata) return
    const sorgente = ctx.createBufferSource()
    sorgente.buffer = buffer
    sorgente.loop = true
    const g = ctx.createGain(); g.gain.value = 0
    sorgente.connect(g); g.connect(entrata)
    nodiTraccia[nome] = g
    sorgente.start()
    // la traccia che parte ora entra con la dissolvenza (se non e` la desiderata resta a zero)
    applicaTracce()
  } catch {
    // file mancante o non decodificabile: nessun sottofondo
  } finally {
    inCaricamento.delete(nome)
  }
}

/** Cambia il sottofondo con una dissolvenza incrociata di ~1,5 s: 'rientro' nel finale, 'stazione' altrove. Sicura da chiamare in ogni momento. */
export function impostaSottofondo(nome: Sottofondo) {
  if (desiderato === nome) return
  desiderato = nome
  if (!ctx) return
  void caricaTraccia(nome)
  applicaTracce()
}

async function caricaSorgente() {
  await caricaTraccia('stazione')
  if (desiderato !== 'stazione') await caricaTraccia(desiderato)
  if (inSim) await caricaTraccia('simulazioni')
}

/** Chiamata dalle simulazioni: dissolvenza incrociata verso la musica calma (se il file esiste) e ritorno all'uscita. */
export function impostaInSimulazione(dentro: boolean) {
  if (inSim === dentro) return
  inSim = dentro
  if (!ctx) return
  if (dentro) void caricaTraccia('simulazioni')
  applicaTracce()
}

/** Da chiamare dentro un gesto dell'utente. Crea la catena audio e fa partire il sottofondo con dissolvenza di ~3 s. */
export function avviaAmbient() {
  if (avviato || typeof window === 'undefined') return
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return
  avviato = true
  try {
    ctx = new Ctx()
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 60
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 12500
    gain = ctx.createGain(); gain.gain.value = 0
    // tutto cio` che va alle casse passa dall'analizzatore (visualizzatore accanto al pulsante audio)
    analisi = ctx.createAnalyser(); analisi.fftSize = 512; analisi.smoothingTimeConstant = 0.78
    analisi.connect(ctx.destination)
    gainVoce = ctx.createGain(); gainVoce.gain.value = preferenze.get().volumeVoce
    gainVoce.connect(analisi)
    hp.connect(lp); lp.connect(gain); gain.connect(analisi)
    // la sorgente si collega all'ingresso della catena (highpass)
    entrata = hp
    ctx.addEventListener('statechange', () => { if (ctx?.state === 'running') riprovaTutti() })
    void ctx.resume()
    void caricaSorgente()
    ascoltaGlobale()
    for (const el of document.querySelectorAll('audio')) registra(el)
    applica(TAU_AVVIO)
  } catch {
    ctx = null; gain = null; analisi = null; gainVoce = null; for (const k of Object.keys(nodiTraccia) as Sottofondo[]) delete nodiTraccia[k]
  }
}

/** Audio attivo/disattivo (pulsante AudioToggle): spegnendo il sottofondo svanisce in mezzo secondo. */
export function impostaAmbientAttivo(on: boolean) {
  attivo = on
  if (!ctx) return
  if (on) void ctx.resume()
  applica(on ? TAU_ENTRATA : TAU_USCITA)
}

/** Analizzatore finale (voce + sottofondo) o null se l'audio non e` ancora partito. */
export function analizzatore(): AnalyserNode | null { return analisi }

/**
 * Instrada un elemento audio nel grafo (cosi la voce passa dall'analizzatore e dal volume della voce).
 * Una sola volta per elemento. Se il contesto non c'e` o non sta girando, l'elemento resta com'e` e suona normalmente.
 */
export function collegaVoce(el: HTMLMediaElement): void {
  if (collegate.has(el)) return
  try {
    if (!ctx || !gainVoce || ctx.state !== 'running') {
      // il contesto non c'e` ancora o non gira: l'elemento suona normalmente (volume diretto) e si riprova al prossimo play
      // o appena il contesto diventa `running`
      el.volume = Math.min(1, Math.max(0, preferenze.get().volumeVoce))
      if (ctx && ctx.state !== 'running') void ctx.resume().catch(() => {})
      inAttesa(el)
      return
    }
    const src = ctx.createMediaElementSource(el)
    src.connect(gainVoce)
    collegate.set(el, src)
    attesa.delete(el)
    el.volume = 1 // da qui il volume lo decide gainVoce
  } catch {
    // gia` collegato altrove o non supportato: l'elemento prosegue normalmente
  }
}

/** elementi non ancora instradati: si riprova al prossimo `play` e quando il contesto passa a `running` */
const attesa = new Set<HTMLMediaElement>()
function inAttesa(el: HTMLMediaElement) {
  if (attesa.has(el)) return
  attesa.add(el)
  const riprova = () => collegaVoce(el)
  el.addEventListener('play', riprova)
  el.addEventListener('playing', riprova)
}
function riprovaTutti() { for (const el of [...attesa]) collegaVoce(el) }

// le preferenze di volume sono reattive
preferenze.ascolta(() => {
  if (gainVoce && ctx) gainVoce.gain.setTargetAtTime(preferenze.get().volumeVoce, ctx.currentTime, 0.05)
  applica(0.1)
})
