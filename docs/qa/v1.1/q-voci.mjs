// QA v1.1 nota 1: voce del modulo in corso + apertura simulazione / scheda con voce -> una sola voce.
import puppeteer from 'puppeteer-core'
const BASE = process.argv[2] ?? 'http://localhost:5173'
const attendi = (ms) => new Promise((r) => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required'] })
const p = await b.newPage()
await p.evaluateOnNewDocument(() => {
  window.__aud = new Set()
  document.addEventListener('playing', e => window.__aud.add(e.target), true)
  document.addEventListener('play', e => window.__aud.add(e.target), true)
  const P = HTMLMediaElement.prototype.play
  HTMLMediaElement.prototype.play = function () { window.__aud.add(this); return P.apply(this, arguments) }
  window.__suona = () => [...window.__aud].filter(e => e.tagName!=='VIDEO' && !e.paused && !e.ended && !e.muted && e.volume > 0).map(e => (e.currentSrc||e.src).split('/').slice(-2).join('/'))
})
await p.setViewport({ width: 1280, height: 720 })
await p.goto(BASE + '/', { waitUntil: 'networkidle2' })
await p.waitForFunction(() => window.__app)
await p.evaluate(() => window.__app.avvia())
await p.waitForFunction(() => window.__iss, { timeout: 60000 })
await attendi(3000)
for (const modulo of ['columbus','destiny']) {
  await p.evaluate((m) => window.__iss.saltaA(m), modulo)
  for (let i=0;i<8;i++){ await attendi(1000); const s=await p.evaluate(()=>window.__suona()); if (s.length){ console.log(modulo,'voce modulo dopo',i+1,'s:',s); break } if(i==7) console.log(modulo,'nessuna voce in 8 s') }
  await p.evaluate(() => window.__iss.apriSimulazione('autoinduzione'))
  for (const t of [100, 400, 1500, 4000]) { await attendi(t===100?100:t/2); console.log('  dopo apertura sim', t, 'ms:', await p.evaluate(()=>window.__suona())) }
  await p.keyboard.press('Escape'); await attendi(1500)
  console.log('  dopo uscita sim:', await p.evaluate(()=>window.__suona()))
}
// scheda con voce poi simulazione
await p.evaluate(() => window.__iss.saltaA('columbus')); await attendi(3000)
await p.evaluate(() => window.__iss.apriScheda('columbus-rack-eml')); await attendi(3000)
console.log('scheda aperta:', await p.evaluate(()=>window.__suona()))
await p.evaluate(() => window.__iss.apriSimulazione('motore')); await attendi(3000)
console.log('scheda + sim:', await p.evaluate(()=>window.__suona()))
await b.close()
