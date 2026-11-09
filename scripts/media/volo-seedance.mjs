#!/usr/bin/env node
// Genera un volo tra due moduli con Higgsfield Kling 3.0 Standard (prima + ultima immagine).
// Uso: node scripts/media/volo-higgsfield.mjs <start.jpg> <end.jpg> <out.mp4> ["prompt"]
// La chiave HIGGSFIELD_API_KEY (formato id:secret) è letta dal .env della radice e non viene mai stampata.
// Regola crediti: ogni chiamata costa circa 0,42 USD (5 s). Lanciare solo con l'ok dell'orchestratore.
import fs from 'node:fs';

const ENV_PATH = process.env.ENV_FILE || new URL('../../.env', import.meta.url);
const env = fs.readFileSync(ENV_PATH, 'utf8');
const KEY = (env.match(/^HIGGSFIELD_API_KEY=(.*)$/m) || [])[1]?.trim().replace(/"/g, '');
if (!KEY) { console.error('Manca HIGGSFIELD_API_KEY'); process.exit(3); }
const API = 'https://api.higgsfield.ai';
const H = { Authorization: `Key ${KEY}`, 'Content-Type': 'application/json' };
const scrub = (s) => String(s).split(KEY).join('***');

const [start, end, out, promptArg] = process.argv.slice(2);
if (!start || !end || !out) { console.error('Uso: <start.jpg> <end.jpg> <out.mp4> ["prompt"]'); process.exit(3); }
const prompt = promptArg || 'Smooth slow forward camera glide floating through the interior of the International Space Station, moving through the hatch into the next module, steady lighting, objects stay unchanged, photorealistic, no people';

async function upload(file) {
  const r = await fetch(`${API}/files/generate-upload-url`, { method: 'POST', headers: H, body: JSON.stringify({ content_type: 'image/jpeg' }) });
  if (!r.ok) throw new Error(`upload-url ${r.status}: ${scrub(await r.text())}`);
  const u = await r.json();
  const put = await fetch(u.upload_url, { method: 'PUT', headers: { 'Content-Type': 'image/jpeg', ...(u.upload_headers || {}) }, body: fs.readFileSync(file) });
  if (!put.ok) throw new Error(`PUT ${put.status}`);
  return u.public_url;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  const [a, b] = [await upload(start), await upload(end)];
  const r = await fetch(`${API}/bytedance/seedance-2.0/image-to-video`, {
    method: 'POST', headers: H,
    body: JSON.stringify({ image_url: a, end_image_url: b, prompt, duration: 5, resolution: '1080p', generate_audio: false }),
  });
  const job = await r.json();
  if (!r.ok) throw new Error(`generate ${r.status}: ${scrub(JSON.stringify(job))}`);
  const statusUrl = job.status_url || `${API}/requests/${job.request_id}/status`;
  console.log('richiesta', job.request_id);
  for (let i = 0; i < 120; i++) {
    await sleep(10000);
    let s;
    try { s = JSON.parse(await (await fetch(statusUrl, { headers: H })).text()); } catch { continue; }
    if (s.status === 'completed') {
      const url = s.video?.url || s.videos?.[0]?.url || s.output?.video?.url;
      const v = await fetch(url);
      fs.writeFileSync(out, Buffer.from(await v.arrayBuffer()));
      console.log('ok', out, fs.statSync(out).size, 'byte');
      process.exit(0);
    }
    if (['failed', 'nsfw', 'canceled'].includes(s.status)) throw new Error(`stato ${s.status}: ${scrub(JSON.stringify(s))}`);
    if (i % 3 === 0) console.log('stato', s.status);
  }
  throw new Error('timeout 20 min');
} catch (e) {
  console.error('ERRORE', scrub(e.message));
  process.exit(1);
}
