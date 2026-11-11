// Inquadrature dei passi dell'EML: una schermata per passo (e per l'esplorazione libera).
// Uso: node scripts/qa/eml-passi.mjs --base http://localhost:5190 --out <cartella> [--w 1440 --h 900] [--touch 1]
// Richiede puppeteer-core (npm i --no-save puppeteer-core@23) e il server di sviluppo.
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d }
const BASE = arg('base', 'http://localhost:5190')
const OUT = arg('out', 'eml-passi')
const W = Number(arg('w', 1440)), H = Number(arg('h', 900)), TOUCH = arg('touch', '0') === '1'
const SOLO = arg('solo', '')
const CHROME = arg('chrome', 'C:/Program Files/Google/Chrome/Application/chrome.exe')
const attendi = (ms) => new Promise((r) => setTimeout(r, ms))
fs.mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--mute-audio'],
})
const p = await browser.newPage()
p.on('pageerror', (e) => console.log('pageerror', e.message))
await p.setViewport({ width: W, height: H, deviceScaleFactor: TOUCH ? 2 : 1, isMobile: TOUCH, hasTouch: TOUCH })
if (TOUCH) await p.emulateMediaFeatures([{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }]).catch(() => {})
await p.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 60000 })
await p.waitForFunction(() => window.__app, { timeout: 30000 })
await p.evaluate(() => window.__app.avvia())
await p.waitForFunction(() => window.__iss, { timeout: 60000 })
await attendi(4000)
await p.evaluate(() => window.__iss.saltaA('eml'))
await p.waitForFunction(() => window.__eml?.ancore && Object.keys(window.__eml.ancore).length > 3, { timeout: 60000 })
await attendi(2500)
const tag = `${W}x${H}${TOUCH ? 't' : ''}`
await p.screenshot({ path: path.join(OUT, `${tag}-libera.png`) })
console.log('ancore', JSON.stringify(await p.evaluate(() => Object.fromEntries(Object.entries(window.__eml.ancore).map(([k, v]) => [k, [v.x, v.y, v.z].map((n) => +n.toFixed(2))])))))
const clic = (re) => p.evaluate((src) => {
  const r = new RegExp(src)
  const b = [...document.querySelectorAll('button')].filter((x) => r.test((x.textContent || '').trim())).pop()
  b?.click(); return !!b
}, re.source)
await clic(/Avvia esperimento/)
await attendi(2500)
for (let i = 1; i <= 6; i++) {
  if (!SOLO || SOLO.split(',').includes(String(i))) {
    await attendi(3200)
    await p.screenshot({ path: path.join(OUT, `${tag}-passo${i}.png`) })
    console.log('passo', i, JSON.stringify(await p.evaluate(() => { const c = window.__eml.camera, t = window.__eml.controls.target; return { cam: [c.position.x, c.position.y, c.position.z].map((n) => +n.toFixed(2)), tgt: [t.x, t.y, t.z].map((n) => +n.toFixed(2)) } })))
  }
  await clic(/^Avanti/)
}
// X di uscita
console.log('esci visibile', await p.evaluate(() => !![...document.querySelectorAll('button')].find((b) => /Esci/.test(b.textContent || ''))))
await browser.close()
