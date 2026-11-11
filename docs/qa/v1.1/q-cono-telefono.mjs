// Cono della mini-mappa su telefono dopo navigazione e rotazione. Uso: node q-cono-telefono.mjs <w> <h>
import puppeteer from 'puppeteer-core'
const [,, W='390', H='844'] = process.argv
const attendi = (ms) => new Promise((r) => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--mute-audio'] })
const p = await b.newPage()
const errs=[]; p.on('pageerror', e=>errs.push(e.message)); p.on('console', m=>{ if(m.type()==='error'&&!/favicon|Failed to load resource/.test(m.text())) errs.push(m.text().slice(0,160)) })
await p.setViewport({ width:+W, height:+H, deviceScaleFactor:2, isMobile:true, hasTouch:true })
await p.emulateMediaFeatures([{ name:'hover', value:'none' },{ name:'pointer', value:'coarse' }]).catch(()=>{})
await p.goto('http://localhost:5173/', { waitUntil:'networkidle2' })
await p.waitForFunction(() => window.__app); await p.evaluate(() => window.__app.avvia())
await p.waitForFunction(() => window.__iss, { timeout: 60000 }); await attendi(4000)
const stato = () => p.evaluate(() => {
  const out = []
  for (const g of document.querySelectorAll('svg g[transform*="rotate"]')) {
    const paths = [...g.querySelectorAll('path')]
    const r = g.getBoundingClientRect()
    out.push({ vis: r.width>0 && getComputedStyle(g.closest('svg')).display!=='none', w: Math.round(r.width), h: Math.round(r.height), t: g.getAttribute('transform'), fill: paths[0]?.getAttribute('fill'), hidden: !!g.closest('[hidden],.hidden') })
  }
  return out
})
const apriMappa = async (nome) => {
  const ok = await p.evaluate(() => { const bt=[...document.querySelectorAll('button')].find(e=>/Mappa/i.test(e.getAttribute('aria-label')||e.textContent||'')); bt?.click(); return !!bt })
  await attendi(1200); await p.screenshot({ path: `docs/qa/v1.1/cono-${W}x${H}-${nome}.png` })
  console.log(nome, 'mappa aperta:', ok, JSON.stringify(await stato()))
  await p.keyboard.press('Escape'); await attendi(600)
  await p.evaluate(() => { const x=[...document.querySelectorAll('button')].find(e=>/Chiudi/i.test(e.getAttribute('aria-label')||'')); x?.click() }); await attendi(500)
}
await apriMappa('harmony')
for (const m of ['columbus','destiny','kibo','columbus']) {
  await p.evaluate((x) => window.__iss.saltaA(x), m); await attendi(4000)
  await p.evaluate(() => { const a=window.__iss.pano.current; a.rotateTo(2.4, 0.2, 0) }).catch(()=>{}); await attendi(1200)
  await apriMappa(m+'-ruotato')
}
console.log('ERRORI', errs)
await b.close()
