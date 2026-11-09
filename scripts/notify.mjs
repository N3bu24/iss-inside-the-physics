#!/usr/bin/env node
// Notifiche Telegram per "ISS — Inside the Physics". Nessuna dipendenza (serve Node 18+).
//
// Uso:
//   node scripts/notify.mjs "testo"                         invia un messaggio
//   node scripts/notify.mjs --level warn "testo"            con prefisso (info | warn | error | ok)
//   node scripts/notify.mjs --ask "domanda" [--timeout 900] bottoni Approva/Rifiuta e attesa risposta
//                                                           stampa APPROVATO / RIFIUTATO / TIMEOUT
//                                                           (exit 0 / 1 / 2)
//   node scripts/notify.mjs --find-chat-id                  mostra il tuo chat id (dopo aver scritto /start al bot)
//   node scripts/notify.mjs --hook Notification|Stop        usato dagli hook di Claude Code (mai bloccante)
//
// Variabili (da .env nella radice del progetto):
//   TELEGRAM_BOT_TOKEN   token del bot (da @BotFather). Non viene mai stampato.
//   TELEGRAM_CHAT_ID     il tuo chat id. Solo questa chat può rispondere ai bottoni.
//   NOTIFY_HOOKS=off     (facoltativo) spegne le notifiche automatiche degli hook
//   TELEGRAM_API_BASE    (facoltativo, solo per test) indirizzo alternativo delle API

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadEnv() {
  const env = {};
  try {
    const raw = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      if (/^\s*#/.test(line)) continue;
      const m = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
      if (!m) continue;
      let v = m[2];
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      env[m[1]] = v;
    }
  } catch { /* .env assente: si usano le variabili di ambiente */ }
  return { ...env, ...process.env };
}

const ENV = loadEnv();
const TOKEN = ENV.TELEGRAM_BOT_TOKEN || '';
const CHAT_ID = ENV.TELEGRAM_CHAT_ID || '';
const API_BASE = (ENV.TELEGRAM_API_BASE || 'https://api.telegram.org').replace(/\/$/, '');

function scrub(text) {
  let s = String(text);
  if (TOKEN) s = s.split(TOKEN).join('***');
  return s;
}

async function api(method, body = {}, timeoutMs = 15000) {
  let res;
  try {
    res = await fetch(`${API_BASE}/bot${TOKEN}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (e) {
    throw new Error(scrub(`Telegram ${method}: ${e.message}`));
  }
  let data;
  try { data = await res.json(); } catch { throw new Error(`Telegram ${method}: risposta non valida (HTTP ${res.status})`); }
  if (!data.ok) throw new Error(scrub(`Telegram ${method}: ${data.description || 'errore'}`));
  return data;
}

const PREFIX = { info: 'ℹ️', warn: '⚠️', error: '🚨', ok: '✅' };

function clip(text, max = 3500) {
  const s = String(text).trim();
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

async function send(text, level = 'info') {
  const icon = PREFIX[level] || '';
  await api('sendMessage', { chat_id: CHAT_ID, text: clip(`${icon} ${text}`.trim()), disable_web_page_preview: true });
}

async function ask(question, timeoutSec) {
  const id = crypto.randomBytes(4).toString('hex');

  // Ignora tutto quello che è arrivato prima di questa domanda.
  let offset = 0;
  const base = await api('getUpdates', { offset: -1, timeout: 0 });
  if (base.result.length) offset = base.result[base.result.length - 1].update_id + 1;

  const sent = await api('sendMessage', {
    chat_id: CHAT_ID,
    text: clip(`❓ ${question}`),
    reply_markup: {
      inline_keyboard: [[
        { text: '✅ Approva', callback_data: `ask:${id}:yes` },
        { text: '❌ Rifiuta', callback_data: `ask:${id}:no` },
      ]],
    },
  });
  const messageId = sent.result.message_id;

  const deadline = Date.now() + timeoutSec * 1000;
  let answer = 'timeout';
  while (Date.now() < deadline && answer === 'timeout') {
    const wait = Math.min(25, Math.max(1, Math.ceil((deadline - Date.now()) / 1000)));
    const r = await api('getUpdates', { offset, timeout: wait, allowed_updates: ['callback_query'] }, (wait + 10) * 1000);
    for (const u of r.result) {
      offset = u.update_id + 1;
      const cq = u.callback_query;
      if (!cq) continue;
      // Solo il proprietario (TELEGRAM_CHAT_ID) può rispondere.
      if (String(cq.from?.id) !== String(CHAT_ID)) continue;
      const m = /^ask:([0-9a-f]+):(yes|no)$/.exec(cq.data || '');
      if (!m || m[1] !== id) continue;
      answer = m[2];
      await api('answerCallbackQuery', { callback_query_id: cq.id, text: answer === 'yes' ? 'Approvato' : 'Rifiutato' }).catch(() => {});
      break;
    }
  }

  const label = answer === 'yes' ? '✅ Approvato' : answer === 'no' ? '❌ Rifiutato' : '⌛ Nessuna risposta (scaduto)';
  await api('editMessageText', { chat_id: CHAT_ID, message_id: messageId, text: clip(`❓ ${question}\n\n${label}`) }).catch(() => {});
  return answer;
}

async function findChatId() {
  const r = await api('getUpdates', { offset: 0, timeout: 0 });
  const seen = new Map();
  for (const u of r.result) {
    const chat = u.message?.chat || u.edited_message?.chat || u.callback_query?.message?.chat;
    if (chat && chat.type === 'private') seen.set(chat.id, chat);
  }
  if (!seen.size) {
    console.log('Nessun messaggio trovato. Apri Telegram, cerca il tuo bot, scrivigli /start e rilancia questo comando.');
    return;
  }
  for (const [id, chat] of seen) {
    const name = [chat.first_name, chat.last_name].filter(Boolean).join(' ') || chat.username || '';
    console.log(`TELEGRAM_CHAT_ID=${id}   (${name})`);
  }
  console.log('Copia la riga giusta nel file .env.');
}

async function readStdin(ms = 800) {
  if (process.stdin.isTTY) return '';
  return new Promise((resolve) => {
    let data = '';
    const t = setTimeout(() => resolve(data), ms);
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => { data += c; });
    process.stdin.on('end', () => { clearTimeout(t); resolve(data); });
    process.stdin.on('error', () => { clearTimeout(t); resolve(data); });
  });
}

function throttled(name, seconds) {
  const file = path.join(os.tmpdir(), `iss-notify-${name}`);
  try {
    const last = Number(fs.readFileSync(file, 'utf8'));
    if (Date.now() - last < seconds * 1000) return true;
  } catch { /* primo invio */ }
  try { fs.writeFileSync(file, String(Date.now())); } catch { /* ignora */ }
  return false;
}

// Gli hook non devono mai far fallire o rallentare Claude Code: esce sempre con codice 0.
async function runHook(event) {
  try {
    if (ENV.NOTIFY_HOOKS === 'off' || !TOKEN || !CHAT_ID) return;
    const raw = await readStdin();
    let payload = {};
    try { payload = JSON.parse(raw); } catch { /* nessun JSON */ }
    if (event === 'Notification') {
      if (throttled('notification', 20)) return;
      const msg = typeof payload.message === 'string' && payload.message ? payload.message : 'Claude Code ha bisogno di te.';
      await send(clip(msg, 300), 'warn');
    } else if (event === 'Stop') {
      if (throttled('stop', 90)) return;
      await send('Claude Code ha finito e aspetta il tuo prossimo messaggio.', 'ok');
    }
  } catch { /* silenzio */ }
}

function parseArgs(argv) {
  const out = { text: [], level: 'info', timeout: 900 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--level') out.level = argv[++i] || 'info';
    else if (a === '--timeout') out.timeout = Math.max(10, Number(argv[++i]) || 900);
    else if (a === '--ask') out.ask = true;
    else if (a === '--find-chat-id') out.find = true;
    else if (a === '--hook') out.hook = argv[++i];
    else out.text.push(a);
  }
  out.text = out.text.join(' ').trim();
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.hook) { await runHook(args.hook); return 0; }

  if (!TOKEN) { console.error('Manca TELEGRAM_BOT_TOKEN nel file .env.'); return 3; }
  if (args.find) { await findChatId(); return 0; }
  if (!CHAT_ID) { console.error('Manca TELEGRAM_CHAT_ID nel file .env. Usa: node scripts/notify.mjs --find-chat-id'); return 3; }
  if (!args.text) { console.error('Manca il testo del messaggio.'); return 3; }

  if (args.ask) {
    const answer = await ask(args.text, args.timeout);
    if (answer === 'yes') { console.log('APPROVATO'); return 0; }
    if (answer === 'no') { console.log('RIFIUTATO'); return 1; }
    console.log('TIMEOUT');
    return 2;
  }

  await send(args.text, args.level);
  console.log('Inviato.');
  return 0;
}

main().then((code) => process.exit(code)).catch((e) => {
  console.error(scrub(e.message));
  process.exit(args_isHook() ? 0 : 4);
});

function args_isHook() { return process.argv.includes('--hook'); }
