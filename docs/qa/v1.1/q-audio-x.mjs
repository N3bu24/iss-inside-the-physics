// QA v1.1: voci sovrapposte (1), X/Esc in ogni simulazione (2), muto (11), musica (13). Uso: node q-audio-x.mjs <base> <w> <h> [touch]
import puppeteer from 'puppeteer-core'
const [,, BASE='http://localhost:5173', W='1280', H='720', TOUCH] = process.argv
const attendi = (ms) => new Promise((r) => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required'] })
const p = await b.newPage()
const errs = []
p.on('pageerror', e => errs.push('pageerror '+e.message)); p.on('console', m => { if (m.type()==='error' && !/favicon|Failed to load resource/.test(m.text())) errs.push('console '+m.text().slice(0,200)) })
await p.evaluateOnNewDocument(() => {
  window.__aud = new Set()
  const P = HTMLMediaElement.prototype.play
  HTMLMediaElement.prototype.play = function () { window.__aud.add(this); return P.apply(this, arguments) }
  window.__suona = () => [...window.__aud].filter(e => !e.paused && !e.ended && !e.muted && e.volume > 0).map(e => (e.currentSrc||e.src).split('/').slice(-2).join('/'))
})
await p.setViewport({ width: +W, height: +H, isMobile: !!TOUCH, hasTouch: !!TOUCH, deviceScaleFactor: 1 })
await p.goto(BASE + '/', { waitUntil: 'networkidle2' })
await p.waitForFunction(() => window.__app)
await p.evaluate(() => window.__app.avvia())
await p.waitForFunction(() => window.__iss, { timeout: 60000 })
await attendi(5000)
console.log('voci in corso al modulo iniziale:', await p.evaluate(() => window.__suona()))
await p.evaluate(() => window.__iss.saltaA('columbus')); await attendi(4000)
console.log('Columbus voce:', await p.evaluate(() => window.__suona()))
const ids = ['aurora','autoinduzione','motore','campo','energia','levitazione','rmn']
for (const id of ids) {
  await p.evaluate((i) => window.__iss.apriSimulazione(i), id); await attendi(5000)
  const suona = await p.evaluate(() => window.__suona())
  const x = await p.evaluate(() => { const bt = [...document.querySelectorAll('button')].find(e => /Esci/.test(e.getAttribute('aria-label')||e.textContent||'')); if(!bt) return null; const r=bt.getBoundingClientRect(); return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),right:Math.round(innerWidth-r.right)} })
  await p.screenshot({ path: `docs/qa/v1.1/sim-${id}-${W}x${H}.png` })
  await p.keyboard.press('Escape'); await attendi(1500)
  const chiusa = await p.evaluate(() => window.__iss.st.current.simulazione === null && window.__iss.st.current.ambiente === null)
  console.log(id, 'voci:', JSON.stringify(suona), 'X:', JSON.stringify(x), 'EscChiude:', chiusa)
  if (!chiusa) { await p.evaluate(() => window.__iss.apriSimulazione(null)); await attendi(500) }
}
// muto
const t0 = await p.evaluate(() => performance.now())
await p.evaluate(() => window.__iss.apriSimulazione('aurora')); await attendi(4000)
const prima = await p.evaluate(() => window.__suona())
const tl = Date.now()
await p.evaluate(() => { const bt=[...document.querySelectorAll('button')].find(e=>/Audio/i.test(e.getAttribute('title')||'')); bt?.click() })
const dopo = await p.evaluate(() => window.__suona())
console.log('muto: prima', prima, 'subito dopo clic', dopo, 'ms', Date.now()-tl)
console.log('ERRORI', errs)
await b.close()
