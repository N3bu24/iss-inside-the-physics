#!/usr/bin/env node
// Genera UN campione del rombo di rientro con ElevenLabs Sound Effects (una chiamata per invocazione).
// Uso:
//   node assets/audio/ambient/genera-rientro.mjs --quota
//   node assets/audio/ambient/genera-rientro.mjs --prova            (5 s, prova breve)
//   node assets/audio/ambient/genera-rientro.mjs --finale <n>       (22 s, n = 1 o 2)
// La chiave viene letta da ELEVENLABS_API_KEY nel .env della cartella principale e non viene mai stampata.
// Nessun retry: al primo errore lo script si ferma e segnala il codice (401/402/403/429 = stop crediti/auth).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENV_FILE = 'C:/Users/Alessandro/Desktop/Lavoro edc ISS/.env';
const API = 'https://api.elevenlabs.io/v1';
const LOG = path.join(HERE, 'registro-generazioni.md');
const SORGENTI = path.join(HERE, 'sorgenti');
const PROVE = path.join(HERE, 'prove');

const PROMPT =
  'Interior of a space capsule during atmospheric re-entry, deep continuous low rumble, ' +
  'heavy structural vibration of the hull, clearly audible roaring airflow and soft crackling plasma ' +
  'outside the hull, a steady mid-frequency hiss of air at high speed, occasional soft metallic creak, ' +
  'steady and tense but not shrill, no music, no voices, no alarms, no beeps, seamless loop';

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
const key = leggiChiave();
const headers = { 'xi-api-key': key };

if (args.includes('--quota')) {
  const r = await fetch(`${API}/user/subscription`, { headers });
  if (!r.ok) { console.error(`ERRORE quota HTTP ${r.status}`); process.exit(4); }
  const j = await r.json();
  console.log(`Piano: ${j.tier} | caratteri ${j.character_count}/${j.character_limit}`);
  process.exit(0);
}

let out;
let durata;
let loop = true;
if (args.includes('--prova')) {
  durata = 5;
  fs.mkdirSync(PROVE, { recursive: true });
  out = path.join(PROVE, 'prova-rientro.mp3');
} else if (args.includes('--finale')) {
  const n = args[args.indexOf('--finale') + 1];
  if (n !== '1' && n !== '2') { console.error('--finale richiede 1 o 2'); process.exit(1); }
  durata = 22;
  fs.mkdirSync(SORGENTI, { recursive: true });
  out = path.join(SORGENTI, `rientro-finale-${n}.mp3`);
} else {
  console.error('Usa --prova, --finale <1|2> oppure --quota');
  process.exit(1);
}

if (fs.existsSync(out)) { console.error(`Esiste gia' ${path.basename(out)}: non rigenero`); process.exit(1); }

const body = { text: PROMPT, duration_seconds: durata, prompt_influence: 0.4, loop };

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
fs.appendFileSync(LOG, `| ${new Date().toISOString()} | ${path.relative(HERE, out).replace(/\\/g, '/')} | ${durata} s | loop=${loop} | influence=0.4 | ${buf.length} byte | rombo rientro |\n`);
console.log(`OK ${out} ${buf.length} byte, durata richiesta ${durata} s`);
