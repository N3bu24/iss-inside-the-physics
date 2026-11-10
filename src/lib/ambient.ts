import { assetExists } from './assets'

/**
 * Audio di sottofondo della stazione (public/audio/ambient/stazione.mp3), in loop, con abbassamento automatico (ducking)
 * quando parla una voce narrante. Se il file manca il modulo non fa nulla (silenzio, nessun errore).
 *
 * Catena: sorgente in loop -> highpass 60 Hz -> lowpass 12,5 kHz -> gain -> uscita.
 * Parte solo dopo un gesto dell'utente (`avviaAmbient`, chiamata dal pulsante "Inizia l'esplorazione").
 */

const URL_AMBIENT = '/audio/ambient/stazione.mp3'
/** volume di base del sottofondo (0..1) */
export const GAIN_BASE = 0.22
/** frazione del volume base mentre una voce parla */
const FATTORE_DUCK = 0.32
/** costanti di tempo (s) di setTargetAtTime: la rampa completa dura circa 3 volte questo valore */
const TAU_DUCK_GIU = 0.2   // ~0,6 s
const TAU_DUCK_SU = 0.5    // ~1,5 s
const TAU_ENTRATA = 1.0    // ~3 s
const TAU_USCITA = 0.15    // ~0,5 s

let ctx: AudioContext | null = null
let gain: GainNode | null = null
let avviato = false
let attivo = true
let entrata: AudioNode | null = null

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
  const target = attivo ? GAIN_BASE * (duck ? FATTORE_DUCK : 1) : 0
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

async function caricaSorgente() {
  if (!ctx || !gain) return
  try {
    if (!(await assetExists(URL_AMBIENT))) return
    const r = await fetch(URL_AMBIENT)
    if (!r.ok) return
    const buffer = await ctx.decodeAudioData(await r.arrayBuffer())
    if (!ctx || !entrata) return
    const sorgente = ctx.createBufferSource()
    sorgente.buffer = buffer
    sorgente.loop = true
    sorgente.connect(entrata)
    sorgente.start()
  } catch {
    // file mancante o non decodificabile: nessun sottofondo
  }
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
    hp.connect(lp); lp.connect(gain); gain.connect(ctx.destination)
    // la sorgente si collega all'ingresso della catena (highpass)
    entrata = hp
    void ctx.resume()
    void caricaSorgente()
    ascoltaGlobale()
    for (const el of document.querySelectorAll('audio')) registra(el)
    applica(TAU_ENTRATA)
  } catch {
    ctx = null; gain = null
  }
}

/** Audio attivo/disattivo (pulsante AudioToggle): spegnendo il sottofondo svanisce in mezzo secondo. */
export function impostaAmbientAttivo(on: boolean) {
  attivo = on
  if (!ctx) return
  if (on) void ctx.resume()
  applica(on ? TAU_ENTRATA : TAU_USCITA)
}
