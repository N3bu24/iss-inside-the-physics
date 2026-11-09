// Riprende il polling di una richiesta Higgsfield: node volo-resume.mjs <request_id> <out.mp4>
import fs from 'node:fs';
const env = fs.readFileSync(process.env.ENV_FILE, 'utf8');
const KEY = (env.match(/^HIGGSFIELD_API_KEY=(.*)$/m) || [])[1]?.trim().replace(/"/g, '');
const API = 'https://api.higgsfield.ai';
const H = { Authorization: `Key ${KEY}` };
const [id, out] = process.argv.slice(2);
const sleep = (ms) => new Promise((x) => setTimeout(x, ms));
for (let i = 0; i < 90; i++) {
  try {
    const r = await fetch(`${API}/requests/${id}/status`, { headers: H });
    const t = await r.text();
    let s;
    try { s = JSON.parse(t); } catch { await sleep(10000); continue; }
    if (s.status === 'completed') {
      const url = s.video?.url || s.videos?.[0]?.url || s.output?.video?.url;
      fs.writeFileSync(out, Buffer.from(await (await fetch(url)).arrayBuffer()));
      console.log('ok', out);
      process.exit(0);
    }
    if (['failed', 'nsfw', 'canceled'].includes(s.status)) { console.log('stato', s.status); process.exit(1); }
  } catch { /* riprova */ }
  await sleep(10000);
}
console.log('timeout');
process.exit(2);
