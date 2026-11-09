#!/usr/bin/env node
// Genera le clip vocali (campo "voce") di content/hotspot-v3.json (-> v3/poi),
// content/luoghi-v3.json (-> v3/luoghi) e content/simulazioni.json (-> v3/simulazioni) con ElevenLabs.
// Voce: Thomas A. (stessa voce del sito). Modello: eleven_v4. Nessuna dipendenza (Node 18+).
//
// Uso:
//   node assets/audio/genera-voci-v3.mjs --quota      legge solo il contatore caratteri
//   node assets/audio/genera-voci-v3.mjs --conteggio  stampa clip e caratteri (nessuna chiamata API)
//   node assets/audio/genera-voci-v3.mjs --prova      genera UNA sola clip (primo luogo)
//   node assets/audio/genera-voci-v3.mjs --tutte      genera tutte le clip mancanti
//   node assets/audio/genera-voci-v3.mjs --manifest   ricalcola i manifest (nessuna chiamata API)
//
// Chiave: ELEVENLABS_API_KEY nell'ambiente, oppure la riga ELEVENLABS_API_KEY del file ENV_FILE
// (default: .env della cartella principale del progetto). La chiave non viene mai stampata né scritta.
// Le clip già presenti (file non vuoto) vengono saltate. Le voci vuote vengono ignorate.
// Nessun retry: al primo errore lo script si ferma. Pausa 300-500 ms fra una chiamata e l'altra.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const OUT = path.join(HERE, 'v3');
const REGISTRO = path.join(OUT, 'registro.md');
const ENV_FILE_DEFAULT = 'C:/Users/Alessandro/Desktop/Lavoro edc ISS/.env';
const VOICE_ID = 'CITWdMEsnRduEUkNWXQv';
const MODEL_ID = 'eleven_v4';
const FORMAT = 'mp3_44100_128';
const VOICE_SETTINGS = { stability: 0.5, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true };
const API = 'https://api.elevenlabs.io/v1';
const MIN_BYTES_PROVA = 20 * 1024;

// Fonti: cartella di output, file di origine, chiave se il file è un oggetto.
const FONTI = [
  { cartella: 'poi', file: 'content/hotspot-v3.json', chiave: 'hotspot' },
  { cartella: 'luoghi', file: 'content/luoghi-v3.json', chiave: 'luoghi' },
  { cartella: 'simulazioni', file: 'content/simulazioni.json', chiave: 'simulazioni' },
];

function loadKey() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY.trim();
  const envFile = process.env.ENV_FILE || ENV_FILE_DEFAULT;
  const raw = fs.readFileSync(envFile, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*ELEVENLABS_API_KEY\s*=\s*(.*)$/);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  throw new Error('ELEVENLABS_API_KEY assente nel file .env');
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

// Accetta array, oggetto con la chiave attesa, oppure oggetto indicizzato per id.
function caricaFonte(f) {
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, f.file), 'utf8'));
  let lista;
  if (Array.isArray(data)) lista = data;
  else if (Array.isArray(data[f.chiave])) lista = data[f.chiave];
  else lista = Object.entries(data).map(([id, v]) => ({ id, ...v }));
  return lista
    .filter((l) => l && l.id && typeof l.voce === 'string' && l.voce.trim() !== '')
    .map((l) => ({ cartella: f.cartella, id: String(l.id), testo: l.voce.trim() }));
}

function fileClip(clip) {
  return path.join(OUT, clip.cartella, `${clip.id}.mp3`);
}

async function genera(clip, key) {
  const body = { text: clip.testo, model_id: MODEL_ID, voice_settings: VOICE_SETTINGS };
  const r = await api(`${API}/text-to-speech/${VOICE_ID}?output_format=${FORMAT}`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify(body),
  });
  const buf = Buffer.from(await r.arrayBuffer());
  const file = fileClip(clip);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.part`;
  fs.writeFileSync(tmp, buf);
  fs.renameSync(tmp, file);
  return file;
}

function pausa() {
  const ms = 300 + Math.floor(Math.random() * 201); // 300-500 ms
  return new Promise((r) => setTimeout(r, ms));
}

// Cerca ffprobe nel PATH, altrimenti nella cartella WinGet di Gyan.FFmpeg.
function cercaFile(dir, nome, profondita) {
  if (!fs.existsSync(dir)) return null;
  const voci = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of voci) {
    if (e.isFile() && e.name.toLowerCase() === nome) return path.join(dir, e.name);
  }
  if (profondita <= 0) return null;
  for (const e of voci) {
    if (!e.isDirectory()) continue;
    const t = cercaFile(path.join(dir, e.name), nome, profondita - 1);
    if (t) return t;
  }
  return null;
}

function trovaFfprobe() {
  const r = spawnSync('ffprobe', ['-version'], { encoding: 'utf8' });
  if (r.status === 0) return 'ffprobe';
  const pacchetti = path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Packages');
  if (!fs.existsSync(pacchetti)) return null;
  for (const e of fs.readdirSync(pacchetti, { withFileTypes: true })) {
    if (!e.isDirectory() || !e.name.toLowerCase().startsWith('gyan.ffmpeg')) continue;
    const t = cercaFile(path.join(pacchetti, e.name), 'ffprobe.exe', 4);
    if (t) return t;
  }
  return null;
}

let FFPROBE;
function durata(file) {
  if (FFPROBE === undefined) FFPROBE = trovaFfprobe();
  if (FFPROBE) {
    const r = spawnSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' });
    if (r.status === 0) {
      const d = parseFloat(r.stdout);
      if (!Number.isNaN(d)) return { s: Math.round(d * 10) / 10, metodo: 'ffprobe' };
    }
  }
  return { s: Math.round((fs.statSync(file).size * 8 / 128000) * 10) / 10, metodo: 'stima 128 kbps' };
}

function writeManifests(clips) {
  for (const f of FONTI) {
    const dir = path.join(OUT, f.cartella);
    const lista = clips.filter((c) => c.cartella === f.cartella);
    const manifest = [];
    for (const c of lista) {
      const file = fileClip(c);
      if (!fs.existsSync(file)) continue;
      const d = durata(file);
      manifest.push({ id: c.id, file: `${c.id}.mp3`, durata_s: d.s, testo: c.testo });
      console.log(`${f.cartella}/${c.id}: ${d.s} s (${d.metodo})`);
    }
    if (manifest.length === 0) continue;
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    const tot = manifest.reduce((a, b) => a + b.durata_s, 0);
    console.log(`manifest ${f.cartella}: ${manifest.length} clip, durata totale ${Math.round(tot * 10) / 10} s`);
  }
}

function appendRegistro(riga) {
  fs.mkdirSync(OUT, { recursive: true });
  if (!fs.existsSync(REGISTRO)) {
    fs.writeFileSync(REGISTRO, '# Registro clip vocali v3 (hotspot, luoghi, simulazioni)\n\n' +
      'Voce Thomas A. (CITWdMEsnRduEUkNWXQv), modello eleven_v4, stability 0,5, similarity 0,75, style 0,15, speaker boost attivo. ' +
      'Contatore letto da /v1/user/subscription (character_count). Il contatore può avere un ritardo di aggiornamento.\n\n' +
      '| Data | Operazione | Clip generate | Caratteri inviati | Contatore prima | Contatore dopo | Note |\n' +
      '|---|---|---|---|---|---|---|\n');
  }
  fs.appendFileSync(REGISTRO, riga + '\n');
}

async function main() {
  const args = process.argv.slice(2);
  const clips = FONTI.flatMap(caricaFonte);
  const totCaratteri = clips.reduce((a, c) => a + c.testo.length, 0);

  if (args.includes('--conteggio')) {
    for (const f of FONTI) {
      const l = clips.filter((c) => c.cartella === f.cartella);
      console.log(`${f.cartella}: ${l.length} clip, ${l.reduce((a, c) => a + c.testo.length, 0)} caratteri`);
    }
    console.log(`totale: ${clips.length} clip, ${totCaratteri} caratteri`);
    return;
  }
  if (args.includes('--manifest')) {
    writeManifests(clips);
    return;
  }

  const key = loadKey();
  if (args.includes('--quota')) {
    const q = await quota(key);
    console.log(`contatore: ${q.used} / ${q.limit} (piano ${q.tier})`);
    return;
  }

  const prova = args.includes('--prova');
  if (!prova && !args.includes('--tutte')) {
    console.error('Uso: --quota | --conteggio | --prova | --tutte | --manifest');
    process.exit(1);
  }

  const targets = prova ? [clips.find((c) => c.cartella === 'luoghi')] : clips;
  if (!targets[0]) throw new Error('nessuna clip trovata');

  const before = await quota(key);
  console.log(`contatore prima: ${before.used} / ${before.limit} (piano ${before.tier})`);

  const generate = [];
  let saltate = 0;
  let caratteri = 0;
  let chiamate = 0;
  let errore = null;
  try {
    for (const clip of targets) {
      const file = fileClip(clip);
      if (fs.existsSync(file) && fs.statSync(file).size > 0) {
        saltate++;
        console.log(`saltata ${clip.cartella}/${clip.id} (già presente)`);
        continue;
      }
      if (chiamate > 0) await pausa();
      console.log(`genero ${clip.cartella}/${clip.id} (${clip.testo.length} caratteri)...`);
      const out = await genera(clip, key);
      chiamate++;
      const size = fs.statSync(out).size;
      console.log(`scritto ${clip.cartella}/${clip.id}.mp3 (${Math.round(size / 1024)} KB)`);
      generate.push(`${clip.cartella}/${clip.id}`);
      caratteri += clip.testo.length;
      if (prova && size < MIN_BYTES_PROVA) {
        throw new Error(`prova ${clip.id} sotto 20 KB (${Math.round(size / 1024)} KB): controllare prima di proseguire`);
      }
    }
  } catch (err) {
    errore = err.message;
  }

  const after = await quota(key).catch(() => ({ used: 'n.d.' }));
  console.log(`contatore dopo: ${after.used} / ${before.limit}`);
  console.log(`riepilogo: generate ${generate.length}, saltate ${saltate}, caratteri inviati ${caratteri}`);

  const data = new Date().toISOString().slice(0, 10);
  const nota = errore ? `ERRORE: ${errore}` : (prova ? 'prova' : 'completa');
  appendRegistro(`| ${data} | ${prova ? '--prova' : '--tutte'} | ${generate.length} | ${caratteri} | ${before.used} | ${after.used} | ${nota}; saltate ${saltate} |`);

  writeManifests(clips);
  if (errore) {
    console.error(`ERRORE: ${errore}`);
    console.error(`clip fatte in questo run: ${generate.length}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`ERRORE: ${err.message}`);
  process.exit(1);
});
