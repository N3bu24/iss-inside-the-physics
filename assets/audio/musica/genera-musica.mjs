#!/usr/bin/env node
// Genera UNA traccia con ElevenLabs Music (una chiamata per invocazione). Nessun retry.
// Uso: node assets/audio/musica/genera-musica.mjs --out <file.mp3> --ms <durata_ms> --prompt "<EN>"
// La chiave viene letta da ELEVENLABS_API_KEY nel .env e non viene mai stampata.
// Errori 401/402/403/429 = stop crediti/autenticazione (exit 4).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENV_FILE = 'C:/Users/Alessandro/Desktop/Lavoro edc ISS/.env';
const LOG = path.join(HERE, 'registro-generazioni.md');

function leggiChiave() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY.trim();
  for (const r of fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
    const m = r.match(/^\s*ELEVENLABS_API_KEY\s*=\s*(.*)$/);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  throw new Error('ELEVENLABS_API_KEY assente');
}

const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const out = arg('--out');
const ms = Number(arg('--ms', '10000'));
const prompt = arg('--prompt');
if (!out || !prompt) { console.error('Servono --out e --prompt'); process.exit(1); }
if (ms < 3000 || ms > 600000) { console.error('durata fuori limite'); process.exit(1); }

const body = { prompt, music_length_ms: ms, model_id: 'music_v1', force_instrumental: true };
const r = await fetch('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128', {
  method: 'POST',
  headers: { 'xi-api-key': leggiChiave(), 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
  body: JSON.stringify(body),
});
if (!r.ok) {
  const txt = await r.text();
  console.error(`ERRORE HTTP ${r.status}: ${txt.slice(0, 200).replace(/[A-Za-z0-9_-]{30,}/g, '[...]')}`);
  process.exit(r.status === 401 || r.status === 402 || r.status === 403 || r.status === 429 ? 4 : 5);
}
const buf = Buffer.from(await r.arrayBuffer());
fs.writeFileSync(out, buf);
fs.appendFileSync(LOG, `| ${new Date().toISOString()} | ${path.basename(out)} | ${ms} ms | music_v1 instrumental | ${buf.length} byte | prompt: ${prompt.slice(0, 80)}... |\n`);
console.log(`OK ${out} ${buf.length} byte, richiesti ${ms} ms`);
