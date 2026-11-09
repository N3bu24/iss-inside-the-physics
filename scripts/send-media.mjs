// uso: node send-media.mjs <.env> "file|didascalia" ...   (png/jpg → foto, mp4 → video, mp3 → audio)
import fs from "node:fs";
const env = fs.readFileSync(process.argv[2], "utf8");
const get = k => (env.match(new RegExp("^" + k + "=(.*)$", "m")) || [])[1]?.trim().replace(/"/g, "");
const token = get("TELEGRAM_BOT_TOKEN"), chat = get("TELEGRAM_CHAT_ID");
for (const [file, caption] of process.argv.slice(3).map(a => a.split("|"))) {
  const ext = file.split(".").pop().toLowerCase();
  const [method, field, type] = ext === "mp4" ? ["sendVideo", "video", "video/mp4"] : ext === "mp3" ? ["sendAudio", "audio", "audio/mpeg"] : ["sendPhoto", "photo", "image/" + (ext === "jpg" ? "jpeg" : ext)];
  const fd = new FormData();
  fd.append("chat_id", chat); fd.append("caption", caption || "");
  fd.append(field, new Blob([fs.readFileSync(file)], { type }), file.split("/").pop());
  const r = await (await fetch(`https://api.telegram.org/bot${token}/${method}`, { method: "POST", body: fd })).json();
  console.log(file.split("/").pop(), r.ok ? "inviato" : r.description);
}
