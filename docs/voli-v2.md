# Voli v2 (Seedance 2.0 via API Higgsfield, 1080p, 5 s, start+end frame, senza audio)

Script: scripts/media/volo-seedance.mjs (endpoint bytedance/seedance-2.0/image-to-video), voli-v2-batch.sh (lancio in parallelo), sheet.py (contact sheet di controllo), web-encode.py (1280x720 crf 25). Originali in assets/voli/originali-v2/ (gitignored).
Frame di partenza/arrivo: viste pano-view fov 80 pitch 0; arrivo = yawArrivo+180 (come Esplora.tsx), tranne Unity->Tranquility.
Durata nuovi video: 5,04 s. Esplora.tsx usa onended con timeout 14 s: nessuna durata fissa da adeguare.

| Volo | Partenza (yaw) | Arrivo (yaw) | Esito |
|---|---|---|---|
| unity__tranquility | unity 90 | cupola 180, pitch 0 | RIFATTO, ottimo (attraversa il portello e ruota fino alla vista dritta) |
| columbus__harmony | columbus 90 | nodo 30 | RIFATTO, ok, inizio e fine coincidono con i frame |
| destiny__harmony | destiny 180 | nodo 180 | RIFATTO, ok |
| destiny__unity | destiny 0 | unity 0 | RIFATTO, ok |
| harmony__columbus | nodo -150 | columbus -90 | RIFATTO, ok |
| harmony__destiny | nodo 0 | destiny 0 | Kling, lasciato (QA 3,5/5, scie) |
| harmony__kibo | nodo 150 | materiali 0 | Kling, lasciato (QA 4/5) |
| kibo__harmony | materiali 180 | nodo -30 | RIFATTO 10/11 (v3), ok |
| tranquility__unity | cupola -92 | unity -90 | RIFATTO 10/11 (v3), ok |
| unity__destiny | unity 180 | destiny 180 | RIFATTO 10/11 (v3), ok |

Valore da applicare in src/data/stazione.ts: arco unity->tranquility `arrivoAvanti: { yaw: 180, pitch: 0 }` (era yaw 20, pitch -30).
Causa dell'errore originale: il panorama di Tranquility e' ruotato di ~90 gradi in rollio; il portello in Unity (yaw 90) era corretto.
I voli non rifatti restano con il video vecchio (Kling). Per finirli: ricaricare il saldo e lanciare
`bash scripts/media/voli-v2-batch.sh "harmony__destiny|nodo|0|destiny|0"` (una riga per volo, vedi script), poi sheet.py e web-encode.py.
Costo: ~60 crediti/volo stimati da preflight MCP (saldo API non consultabile).

## 10/11 - Voli Kling a 24 fps
I 5 voli Kling (harmony__destiny, harmony__kibo, kibo__harmony, tranquility__unity, unity__destiny) erano a 30 fps (151 frame, un duplicato ogni 5). Ricodificati dagli originali nativi a 24 fps (121 frame, 5.04 s, 1280x720, crf 25). Voli Seedance gia a 24 fps nativi: non toccati. Nessun credito speso.
