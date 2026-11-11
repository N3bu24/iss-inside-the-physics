import puppeteer from 'puppeteer-core'
const attendi = (ms) => new Promise((r) => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--mute-audio'] })
for (const [W,H] of [[1280,720],[1440,900]]) {
const p = await b.newPage(); await p.setViewport({ width: W, height: H })
await p.goto('http://localhost:5173/', { waitUntil: 'networkidle2' })
await p.waitForFunction(() => window.__app); await p.evaluate(() => window.__app.avvia())
await p.waitForFunction(() => window.__iss, { timeout: 60000 }); await attendi(3000)
await p.evaluate(() => window.__iss.saltaA('eml')); await attendi(7000)
await p.evaluate(() => [...document.querySelectorAll('button')].find(x=>/Avvia esperimento/.test(x.textContent))?.click()); await attendi(3000)
const r = await p.evaluate(() => { const out=[]; for (const re of [/Indietro/,/Automatico/]) { const bt=[...document.querySelectorAll('button')].find(x=>re.test((x.textContent||'').trim())); if(!bt){out.push(String(re)+': assente');continue}; const q=bt.getBoundingClientRect(); const el=document.elementFromPoint(q.x+q.width/2,q.y+q.height/2); out.push(String(re)+' rect y='+Math.round(q.y)+' coperto da: '+(el===bt||bt.contains(el)?'nessuno':(el?.textContent||el?.tagName||'').slice(0,40))) } return out })
console.log(W+'x'+H, r)
await p.close() }
await b.close()
