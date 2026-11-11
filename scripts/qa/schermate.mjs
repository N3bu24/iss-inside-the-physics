// Schermate e rilievo del layout a più risoluzioni (prove dell'interfaccia responsive).
// Uso: node scripts/qa/schermate.mjs --base http://localhost:5190 --out <cartella> [--gruppo desktop|tablet|telefono|tutti] [--stati intro,esplora,...]
// Richiede puppeteer-core (npm i --no-save puppeteer-core@23) e il server di sviluppo (usa i ganci window.__app / window.__iss).
// Per ogni risoluzione e stato salva <out>/<risoluzione>/<stato>.png e <stato>.json (rettangoli degli elementi visibili dell'interfaccia).
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d }
const BASE = arg('base', 'http://localhost:5190')
const OUT = arg('out', 'schermate')
const GRUPPO = arg('gruppo', 'tutti')
const CHROME = arg('chrome', 'C:/Program Files/Google/Chrome/Application/chrome.exe')

export const RISOLUZIONI = [
  { id: 'desktop-1920x1080', gruppo: 'desktop', width: 1920, height: 1080 },
  { id: 'desktop-1440x900', gruppo: 'desktop', width: 1440, height: 900 },
  { id: 'desktop-1280x720', gruppo: 'desktop', width: 1280, height: 720 },
  { id: 'tablet-ipadpro-1366x1024', gruppo: 'tablet', width: 1366, height: 1024, touch: true, dpr: 2 },
  { id: 'tablet-ipad-1180x820', gruppo: 'tablet', width: 1180, height: 820, touch: true, dpr: 2 },
  { id: 'tablet-ipad-820x1180', gruppo: 'tablet', width: 820, height: 1180, touch: true, dpr: 2 },
  { id: 'tablet-768x1024', gruppo: 'tablet', width: 768, height: 1024, touch: true, dpr: 2 },
  { id: 'telefono-iphone-390x844', gruppo: 'telefono', width: 390, height: 844, touch: true, dpr: 3 },
  { id: 'telefono-android-360x780', gruppo: 'telefono', width: 360, height: 780, touch: true, dpr: 3 },
  { id: 'telefono-orizzontale-844x390', gruppo: 'telefono', width: 844, height: 390, touch: true, dpr: 3 },
]

const attendi = (ms) => new Promise((r) => setTimeout(r, ms))

/** Stati da fotografare: ognuno parte da una pagina fresca. */
const STATI = {
  intro: async () => {},
  esplora: async (p) => { await avvia(p) },
  scheda: async (p) => { await avvia(p); await p.evaluate(() => window.__iss.apriScheda('harmony-cavi')); await attendi(1500) },
  mappa: async (p) => {
    await avvia(p)
    // menu del viaggio rapido: clic su Columbus nella mini-mappa (se visibile)
    await p.evaluate(() => { const g = [...document.querySelectorAll('svg g')].find((e) => /Columbus/.test(e.querySelector('title')?.textContent || '')); g?.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    await attendi(800)
  },
  indice: async (p) => { await avvia(p); await p.evaluate(() => window.__app.apriIndice()); await attendi(2500) },
  impostazioni: async (p) => { await avvia(p); await p.evaluate(() => window.__app.apriImpostazioni()); await attendi(1500) },
  eml: async (p) => { await avvia(p); await p.evaluate(() => window.__iss.saltaA('eml')); await attendi(7000) },
  'sim-eml': async (p) => { await avvia(p); await p.evaluate(() => window.__iss.apriSimulazione('eml')); await attendi(8000) },
  'sim-eml-passi': async (p) => {
    await avvia(p); await p.evaluate(() => window.__iss.apriSimulazione('eml')); await attendi(7000)
    await p.evaluate(() => { const b = [...document.querySelectorAll('.fixed button, [data-sim-ui] button, button')].filter((x) => /Avvia esperimento/.test(x.textContent || '')).pop(); b?.click() })
    await attendi(1500)
    for (let i = 0; i < 2; i++) { await p.evaluate(() => { const b = [...document.querySelectorAll('button')].filter((x) => (x.textContent || '').trim().startsWith('Avanti')).pop(); b?.click() }); await attendi(1200) }
    await attendi(2000)
  },
  'sim-aurora': async (p) => { await avvia(p); await p.evaluate(() => window.__iss.apriSimulazione('aurora')); await attendi(7000) },
  'sim-autoinduzione-passi': async (p) => {
    await avvia(p); await p.evaluate(() => window.__iss.apriSimulazione('autoinduzione')); await attendi(7000)
    await p.evaluate(() => { const b = [...document.querySelectorAll('button')].filter((x) => /^\s*Avvia\b/.test(x.textContent || '')).pop(); b?.click() })
    await attendi(1500)
    await p.evaluate(() => { const b = [...document.querySelectorAll('button')].filter((x) => (x.textContent || '').trim().startsWith('Avanti')).pop(); b?.click() })
    await attendi(2500)
  },
  'cupola-diretta': async (p) => {
    await p.evaluate(() => localStorage.setItem('iss-preferenze-v1', JSON.stringify({ cupolaDiretta: true })))
    await p.reload({ waitUntil: 'networkidle2' }); await avvia(p)
    await p.evaluate(() => window.__iss.saltaA('cupola')); await attendi(9000)
  },
  'cupola-video': async (p) => { await avvia(p); await p.evaluate(() => window.__iss.saltaA('cupola')); await attendi(7000) },
  capsula: async (p) => { await avvia(p); await p.evaluate(() => window.__iss.saltaA('finale')); await attendi(7000) },
}

async function avvia(p) {
  await p.waitForFunction(() => window.__app, { timeout: 30000 })
  await p.evaluate(() => window.__app.avvia())
  await p.waitForFunction(() => window.__iss, { timeout: 60000 })
  await attendi(5000)
}

/** Rettangoli degli elementi d'interfaccia visibili (bottoni, pannelli, testi fissi): serve a confrontare il layout prima/dopo. */
async function rilievo(p) {
  return p.evaluate(() => {
    const sel = 'button, aside, header, nav, [role=dialog], [role=tab], input, h1, h2, h3, kbd, [data-sim-ui], .glass, svg[viewBox]'
    const out = []
    for (const el of document.querySelectorAll(sel)) {
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      if (r.width < 2 || r.height < 2 || cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) continue
      if (el.closest('.psv-container .psv-marker, [data-marcatore]')) continue // marcatori sul panorama: dipendono dallo sguardo
      const testo = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40)
      out.push({ tag: el.tagName.toLowerCase(), testo, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) })
    }
    return { scrollW: document.documentElement.scrollWidth, scrollH: document.documentElement.scrollHeight, W: innerWidth, H: innerHeight, el: out }
  })
}

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--mute-audio'],
})
const stati = (arg('stati', Object.keys(STATI).join(','))).split(',')
const errori = []
const RIS = arg('ris', '')
for (const v of RISOLUZIONI.filter((r) => (GRUPPO === 'tutti' || r.gruppo === GRUPPO) && (!RIS || r.id === RIS))) {
  const dir = path.join(OUT, v.id)
  fs.mkdirSync(dir, { recursive: true })
  for (const s of stati) {
    const p = await browser.newPage()
    p.on('pageerror', (e) => errori.push(`${v.id}/${s}: ${e.message}`))
    p.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) errori.push(`${v.id}/${s} console: ${m.text().slice(0, 200)}`) })
    await p.setViewport({ width: v.width, height: v.height, deviceScaleFactor: v.dpr ?? 1, isMobile: !!v.touch, hasTouch: !!v.touch })
    if (v.touch) await p.emulateMediaFeatures([{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }]).catch(() => {})
    try {
      await p.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 60000 })
      await attendi(1500)
      await STATI[s](p)
      await p.screenshot({ path: path.join(dir, `${s}.png`) })
      fs.writeFileSync(path.join(dir, `${s}.json`), JSON.stringify(await rilievo(p), null, 1))
      process.stdout.write(`ok ${v.id}/${s}\n`)
    } catch (e) {
      errori.push(`${v.id}/${s}: ${e.message}`)
      process.stdout.write(`ERRORE ${v.id}/${s}: ${e.message}\n`)
    }
    await p.close()
  }
}
await browser.close()
fs.writeFileSync(path.join(OUT, 'errori.txt'), errori.join('\n'))
console.log(`fatto. errori: ${errori.length} (vedi ${path.join(OUT, 'errori.txt')})`)
