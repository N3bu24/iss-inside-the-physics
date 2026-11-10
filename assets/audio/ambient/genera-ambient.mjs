#!/usr/bin/env node
// Genera UNO strato ambient con ElevenLabs Sound Effects (una chiamata per invocazione).
// Uso:
//   node assets/audio/ambient/genera-ambient.mjs --quota
//   node assets/audio/ambient/genera-ambient.mjs --out <file.mp3> --durata <s> --testo "<prompt EN>" [--loop] [--influence 0.4]
// La chiave viene letta da ELEVENLABS_API_KEY nel .env della cartella principale e non viene mai stampata.
// Nessun retry: al primo errore lo script si ferma e segnala il codice (401/402/429 = stop crediti/auth).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENV_FILE = 'C:/Users/Alessandro/Desktop/Lavoro edc ISS/.env';
const API = 'https://api.elevenlabs.io/v1';
const LOG = path.join(HERE, 'registro-generazioni.md');

function leggiChiave() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY.trim();
  const righe = fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/);
  for (const r of righe) {
    const m = r.match(/^\s*ELEVENLABS_API_KEY\s*=\s*(.*)$/);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  throw new Error('ELEVENLABS_API_KEY assente');
}

const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const key = leggiChiave();
const headers = { 'xi-api-key': key };

if (args.includes('--quota')) {
  const r = await fetch(`${API}/user/subscription`, { headers });
  if (!r.ok) { console.error(`ERRORE quota HTTP ${r.status}`); process.exit(4); }
  const j = await r.json();
  console.log(`Piano: ${j.tier} | caratteri ${j.character_count}/${j.character_limit}`);
  process.exit(0);
}

const out = arg('--out');
const durata = Number(arg('--durata', '8'));
const testo = arg('--testo');
const influence = Number(arg('--influence', '0.4'));
const loop = args.includes('--loop');
if (!out || !testo) { console.error('Servono --out e --testo'); process.exit(1); }
if (durata < 0.5 || durata > 30) { console.error('durata fuori limite (0.5-30 s)'); process.exit(1); }

const body = { text: testo, duration_seconds: durata, prompt_influence: influence };
if (loop) body.loop = true;

const r = await fetch(`${API}/sound-generation?output_format=mp3_44100_128`, {
  method: 'POST',
  headers: { ...headers, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
  body: JSON.stringify(body),
});
if (!r.ok) {
  const txt = await r.text();
  // Solo codice ed estratto neutro, senza chiavi o dati dell'account.
  console.error(`ERRORE HTTP ${r.status}: ${txt.slice(0, 200).replace(/[A-Za-z0-9_-]{30,}/g, '[...]')}`);
  process.exit(r.status === 401 || r.status === 402 || r.status === 403 || r.status === 429 ? 4 : 5);
}
const buf = Buffer.from(await r.arrayBuffer());
fs.writeFileSync(out, buf);
fs.appendFileSync(LOG, `| ${new Date().toISOString()} | ${path.basename(out)} | ${durata} s | loop=${loop} | influence=${influence} | ${buf.length} byte |\n`);
console.log(`OK ${out} ${buf.length} byte, durata richiesta ${durata} s`);
