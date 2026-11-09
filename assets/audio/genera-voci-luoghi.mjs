#!/usr/bin/env node
// Genera le clip vocali brevi (campo "voce") dei luoghi di content/luoghi.json con ElevenLabs.
// Voce: Thomas A. (stessa voce del sito). Modello: eleven_v4. Nessuna dipendenza (Node 18+).
//
// Uso:
//   node assets/audio/genera-voci-luoghi.mjs --solo harmony   genera una sola clip (prova)
//   node assets/audio/genera-voci-luoghi.mjs --tutte          genera tutte le clip mancanti
//   node assets/audio/genera-voci-luoghi.mjs --manifest       ricalcola il manifest
//   node assets/audio/genera-voci-luoghi.mjs --conteggio      stampa solo caratteri e contatore
//
// Chiave: ELEVENLABS_API_KEY nell'ambiente, oppure nel file indicato da ENV_FILE.
// La chiave non viene mai stampata né scritta su file.
// Le clip già presenti vengono saltate: nessuna rigenerazione. Nessun retry: ogni errore ferma lo script.
// Output: assets/audio/luoghi/<id>.mp3, manifest.json, e una riga di registro in assets/audio/luoghi-registro.md.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const LUOGHI = path.join(ROOT, 'content', 'luoghi.json');
const OUT = path.join(HERE, 'luoghi');
const REGISTRO = path.join(HERE, 'luoghi-registro.md');
const VOICE_ID = 'CITWdMEsnRduEUkNWXQv';
const MODEL_ID = 'eleven_v4';
const FORMAT = 'mp3_44100_128';
const VOICE_SETTINGS = { stability: 0.5, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true };
const API = 'https://api.elevenlabs.io/v1';
const MIN_BYTES_PROVA = 10 * 1024;

function loadKey() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY.trim();
  const envFile = process.env.ENV_FILE;
  if (!envFile) throw new Error('chiave non trovata: imposta ENV_FILE o ELEVENLABS_API_KEY');
  const raw = fs.readFileSync(envFile, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*ELEVENLABS_API_KEY\s*=\s*(.*)$/);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  throw new Error('ELEVENLABS_API_KEY assente nel file indicato da ENV_FILE');
}

function summarize(body) {
  try {
    const j = JSON.parse(body);
    const msg = j?.detail?.message || j?.detail?.status || j?.detail || j?.message || '';
    return String(msg).slice(0, 200);
  } catch {
    return body.slice(0, 200).replace(/\s+/g, ' ');
  }
}

async function api(url, init) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(180000) });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${summarize(body)}`);
  }
  return res;
}

async function quota(key) {
  const r = await api(`${API}/user/subscription`, { headers: { 'xi-api-key': key } });
  const j = await r.json();
  return { used: j.character_count, limit: j.character_limit, tier: j.tier };
}

// Accetta sia un array di luoghi sia un oggetto (chiave = id, oppure { luoghi: [...] }).
function caricaLuoghi() {
  const data = JSON.parse(fs.readFileSync(LUOGHI, 'utf8'));
  let lista;
  if (Array.isArray(data)) lista = data;
  else if (Array.isArray(data.luoghi)) lista = data.luoghi;
  else lista = Object.entries(data).map(([id, v]) => ({ id, ...v }));
  return lista
    .filter((l) => l && l.id && typeof l.voce === 'string' && l.voce.trim() !== '')
    .map((l) => ({ id: String(l.id), testo: l.voce.trim() }));
}

async function genera(clip, key) {
  const body = { text: clip.testo, model_id: MODEL_ID, voice_settings: VOICE_SETTINGS };
  const r = await api(`${API}/text-to-speech/${VOICE_ID}?output_format=${FORMAT}`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify(body),
  });
  const buf = Buffer.from(await r.arrayBuffer());
  const file = path.join(OUT, `${clip.id}.mp3`);
  const tmp = `${file}.part`;
  fs.writeFileSync(tmp, buf);
  fs.renameSync(tmp, file);
  return file;
}

function durata(file) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' });
  if (r.status === 0) {
    const d = parseFloat(r.stdout);
    if (!Number.isNaN(d)) return { s: Math.round(d * 10) / 10, metodo: 'ffprobe' };
  }
  return { s: Math.round((fs.statSync(file).size * 8 / 128000) * 10) / 10, metodo: 'stima 128 kbps' };
}

function writeManifest(luoghi) {
  const manifest = [];
  for (const l of luoghi) {
    const file = path.join(OUT, `${l.id}.mp3`);
    if (!fs.existsSync(file)) continue;
    const d = durata(file);
    manifest.push({ id: l.id, file: `${l.id}.mp3`, durata_s: d.s, testo: l.testo });
    console.log(`${l.id}: ${d.s} s (${d.metodo})`);
  }
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  const tot = manifest.reduce((a, b) => a + b.durata_s, 0);
  console.log(`manifest: ${manifest.length} clip, durata totale ${Math.round(tot * 10) / 10} s`);
}

function appendRegistro(riga) {
  if (!fs.existsSync(REGISTRO)) {
    fs.writeFileSync(REGISTRO, '# Registro clip vocali dei luoghi\n\n' +
      'Voce Thomas A. (CITWdMEsnRduEUkNWXQv), modello eleven_v4. Dati da /v1/user/subscription.\n\n' +
      '| Data | Operazione | Caratteri inviati | Contatore prima | Contatore dopo | File |\n' +
      '|---|---|---|---|---|---|\n');
  }
  fs.appendFileSync(REGISTRO, riga + '\n');
}

async function main() {
  const args = process.argv.slice(2);
  const luoghi = caricaLuoghi();
  fs.mkdirSync(OUT, { recursive: true });
  const totCaratteri = luoghi.reduce((a, l) => a + l.testo.length, 0);

  if (args.includes('--manifest')) {
    writeManifest(luoghi);
    return;
  }
  if (args.includes('--conteggio')) {
    console.log(`luoghi con voce: ${luoghi.length}, caratteri totali: ${totCaratteri}`);
    return;
  }

  if (args.includes('--quota')) {
    const q = await quota(loadKey());
    console.log(`contatore: ${q.used} / ${q.limit} (piano ${q.tier})`);
    return;
  }

  const soloIdx = args.indexOf('--solo');
  const solo = soloIdx >= 0 ? args[soloIdx + 1] : null;
  if (!solo && !args.includes('--tutte')) {
    console.error('Uso: --solo <id> | --tutte | --manifest | --conteggio');
    process.exit(1);
  }

  const targets = solo ? luoghi.filter((l) => l.id === solo) : luoghi;
  if (targets.length === 0) throw new Error(`luogo non trovato o senza voce: ${solo}`);

  const key = loadKey();
  const before = await quota(key);
  console.log(`contatore prima: ${before.used} / ${before.limit} (piano ${before.tier})`);

  const generati = [];
  let saltate = 0;
  let caratteri = 0;
  for (const clip of targets) {
    const file = path.join(OUT, `${clip.id}.mp3`);
    if (fs.existsSync(file) && fs.statSync(file).size > 0) {
      saltate++;
      console.log(`saltata ${clip.id} (già presente)`);
      continue;
    }
    console.log(`genero ${clip.id} (${clip.testo.length} caratteri)...`);
    const out = await genera(clip, key);
    const size = fs.statSync(out).size;
    console.log(`scritto ${clip.id}.mp3 (${Math.round(size / 1024)} KB)`);
    generati.push(clip.id);
    caratteri += clip.testo.length;
    if (solo && size < MIN_BYTES_PROVA) {
      throw new Error(`prova ${clip.id} sotto 10 KB: controllare il file prima di proseguire`);
    }
  }

  const after = await quota(key);
  console.log(`contatore dopo: ${after.used} / ${after.limit}`);
  console.log(`riepilogo: generate ${generati.length}, saltate ${saltate}, caratteri inviati ${caratteri}`);

  const data = new Date().toISOString().slice(0, 10);
  appendRegistro(`| ${data} | ${solo ? `--solo ${solo}` : '--tutte'} | ${caratteri} | ${before.used} | ${after.used} | ${generati.map((g) => `${g}.mp3`).join(', ') || '-'} |`);

  if (!solo) writeManifest(luoghi);
}

main().catch((err) => {
  console.error(`ERRORE: ${err.message}`);
  process.exit(1);
});
