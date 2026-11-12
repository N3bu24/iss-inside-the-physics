// Legge il saldo ElevenLabs (senza stampare la chiave).
import fs from 'node:fs';
const ENV_FILE = 'C:/Users/Alessandro/Desktop/Lavoro edc ISS/.env';
function leggiChiave() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY.trim();
  for (const r of fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
    const m = r.match(/^\s*ELEVENLABS_API_KEY\s*=\s*(.*)$/);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  throw new Error('ELEVENLABS_API_KEY assente');
}
const r = await fetch('https://api.elevenlabs.io/v1/user/subscription', { headers: { 'xi-api-key': leggiChiave() } });
if (!r.ok) { console.error(`ERRORE HTTP ${r.status}`); process.exit(4); }
const j = await r.json();
console.log(JSON.stringify({ tier: j.tier, character_count: j.character_count, character_limit: j.character_limit, status: j.status, next_reset: j.next_character_count_reset_unix, music_limit: j.music_limit ?? null, can_use_music: j.can_use_music ?? null }, null, 1));
