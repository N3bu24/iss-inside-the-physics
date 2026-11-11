// Voce delle simulazioni senza flag di autoplay: dopo il vero clic su "Inizia" e senza gesti successivi.
import puppeteer from 'puppeteer-core'
const attendi = (ms) => new Promise((r) => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--autoplay-policy=document-user-activation-required'] })
const p = await b.newPage(); await p.setViewport({ width: 1280, height: 720 })
await p.evaluateOnNewDocument(() => { window.__aud = new Set(); const P = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function () { window.__aud.add(this); return P.apply(this, arguments) }
  window.__suona = () => [...window.__aud].filter(e => !e.paused && !e.ended && !e.muted && e.volume > 0).map(e => (e.currentSrc||e.src).split('/').slice(-1)[0]) })
await p.goto('http://localhost:5173/', { waitUntil: 'networkidle2' })
await p.evaluate(() => localStorage.clear())
await p.reload({ waitUntil: 'networkidle2' })
await p.evaluate(() => [...document.querySelectorAll('button')].find(e=>/Inizia/.test(e.textContent))?.click()) // clic reale non disponibile: click() conta come gesto
await p.waitForFunction(() => window.__iss, { timeout: 60000 }); await attendi(3000)
await p.evaluate(() => window.__iss.saltaA('columbus')); await attendi(3000)
for (const id of ['aurora','motore','rmn']) {
  await p.evaluate((i) => window.__iss.apriSimulazione(i), id); await attendi(5000)
  const r = await p.evaluate(() => ({ suona: window.__suona(), tocca: !!document.querySelector('button[aria-label="Avvia la voce narrante"]') }))
  console.log(id, JSON.stringify(r))
  await p.keyboard.press('Escape'); await attendi(1500)
}
await b.close()
