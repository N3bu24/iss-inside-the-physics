import puppeteer from 'puppeteer-core'
const attendi = (ms) => new Promise((r) => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required'] })
const p = await b.newPage()
await p.evaluateOnNewDocument(() => {
  window.__aud = new Set()
  document.addEventListener('playing', e => window.__aud.add(e.target), true)
  const P = HTMLMediaElement.prototype.play
  HTMLMediaElement.prototype.play = function () { window.__aud.add(this); return P.apply(this, arguments) }
  window.__suona = () => [...window.__aud].filter(e => e.tagName!=='VIDEO' && !e.paused && !e.ended && !e.muted && e.volume > 0.05).map(e => (e.currentSrc||e.src).split('/').slice(-1)[0]+'@'+e.volume.toFixed(2))
  window.__log = []
  window.__t0 = 0
  setInterval(() => { if (window.__t0) window.__log.push([Math.round(performance.now()-window.__t0), window.__suona().join(' + ')]) }, 50)
})
await p.setViewport({ width: 1280, height: 720 })
await p.goto('http://localhost:5173/', { waitUntil: 'networkidle2' })
await p.waitForFunction(() => window.__app); await p.evaluate(() => window.__app.avvia())
await p.waitForFunction(() => window.__iss, { timeout: 60000 }); await attendi(3000)
await p.evaluate(() => window.__iss.saltaA('columbus')); await attendi(4000)
await p.evaluate(() => { window.__t0 = performance.now(); window.__iss.apriSimulazione('aurora') }); await attendi(4000)
const log = await p.evaluate(() => window.__log)
let last=''; for (const [t,s] of log) if (s!==last){ console.log(t,'ms',s); last=s }
await b.close()
