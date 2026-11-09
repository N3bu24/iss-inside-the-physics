# Voli interni (Higgsfield) e Terra dalla Cupola

Ricerca del 9/11/2026. Fonti ufficiali; dove un dato non e' stato trovato e' scritto "non trovato". Niente chiavi qui dentro.

## A. Higgsfield API: video con prima e ultima immagine

### A1. Fatti verificati (docs.higgsfield.ai)
- Base URL: `https://api.higgsfield.ai`. Auth: `Authorization: Key ${HF_API_KEY_ID}:${HF_API_KEY_SECRET}`. Idempotency-Key opzionale sulle submit. https://docs.higgsfield.ai/docs/api-reference/overview.md
- Flusso asincrono: POST -> `request_id`, `status_url` (`https://api.higgsfield.ai/requests/{id}/status`), `cancel_url`. Stati: `queued`, `in_progress`, `completed`, `failed`, `nsfw`, `canceled`. Output video in `video.url`. https://docs.higgsfield.ai/docs/concepts/requests.md
- I file in uscita restano 7 giorni poi vengono cancellati: scaricarli subito. `failed`/`nsfw` non vengono addebitati. https://docs.higgsfield.ai/docs/concepts/billing-and-retention.md
- Tempo medio di generazione: **non trovato** (la doc non lo dichiara; ogni modello ha un timeout). Fare una prova e misurarlo. https://docs.higgsfield.ai/docs/help/faq.md
- Limiti: concorrenza per account/modello, oltre la quale le richieste vanno in coda; 429 se la coda e' piena. https://docs.higgsfield.ai/docs/concepts/rate-limits.md

### A2. Caricare un'immagine (verificato)
Tutti i modelli vogliono **URL pubblici HTTPS**. Per file locali (i nostri panorami/render):
1. `POST https://api.higgsfield.ai/files/generate-upload-url` con body `{"content_type":"image/jpeg"}` (con header Authorization). Risposta: `public_url`, `upload_url`, `content_type`, `upload_headers`.
2. `PUT` del file su `upload_url` con tutti gli `upload_headers` (Content-Type e `x-amz-tagging: retention=temporary`). NON inviare l'Authorization a questo URL. L'URL scade dopo 1 ora.
3. Usare `public_url` come `image_url` / `first_frame_url` ecc.
Tipi: jpeg, png, webp, gif. Dimensione massima: non trovata. Retention del file caricato: "temporary", durata non indicata. https://docs.higgsfield.ai/docs/concepts/file-uploads.md

### A3. Modelli con prima + ultima immagine (schemi letti dalle pagine di ogni modello)

| Modello | Endpoint (POST) | Param. prima / ultima | Durata | Risoluzione | Note |
|---|---|---|---|---|---|
| Kling 3.0 Standard I2V | `/kling-video/v3.0/std/image-to-video` | `image_url` / `last_image_url` | 3-15 s (def. 5) | non indicata in pixel (varianti `std`, `pro`, `4k` sono endpoint separati) | `sound` on/off (def. **on**: mettere `off`), `cfg_scale` 0-1, prompt non vuoto obbligatorio |
| Kling 3.0 Pro / 4K / Turbo I2V | `/kling-video/v3.0/pro/image-to-video`, `/4k/`, `/kling-video/v3.0-turbo/image-to-video` | idem presumibile (verificato solo per std) | idem | pro/4k | costo piu' alto, non trovato |
| Kling O3 first-last-frame | `/kling-video/o3/first-last-frame` | `first_frame_url` / `last_frame_url` | 3-15 s (def. 5) | `mode`: `std`, `pro` (def.), `4k` | `aspect_ratio` 16:9/9:16/1:1, `sound` def. off, multi-shot fino a 6 |
| MiniMax H3 I2V | `/minimax/h3/image-to-video` | `image_url` / `end_image_url` | 5-15 s (def. 5) | solo `"2K"` | `aspect_ratio` auto/16:9..., schema chiuso (campi extra rifiutati) |
| Wan 2.7 I2V | `/wan/v2.7/image-to-video` | `image_url` / `end_image_url` | 2-15 s (def. 5) | `720p` (def.) o `1080p` | `negative_prompt`, `seed`, prompt opzionale |
| Seedance 2.0 I2V | `/bytedance/seedance-2.0/image-to-video` | `image_url` / `end_image_url` | 4-15 s (def. 5) | 480p/720p/1080p/4k (def. 720p) | `generate_audio` def. true (mettere false), niente aspect_ratio: segue `image_url`, schema chiuso |

Pagine: https://docs.higgsfield.ai/docs/models/kling-3/standard-image-to-video.md , https://docs.higgsfield.ai/docs/models/kling-o3/first-last-frame.md , https://docs.higgsfield.ai/docs/models/minimax-h3/image-to-video.md , https://docs.higgsfield.ai/docs/models/wan-2-7/image-to-video.md , https://docs.higgsfield.ai/docs/models/seedance-2/image-to-video.md . Elenco completo modelli: https://docs.higgsfield.ai/docs/models/video-generation.md

Non esistono su Higgsfield (nell'elenco modelli) ne' Veo ne' "DoP" come modelli API; compaiono Kling, Seedance, Wan, MiniMax, Hailuo 2.3 (solo prima immagine, nessun `end_image_url` documentato), LTX, PixVerse, Grok. Il Hailuo 2.3 di terze parti con `end_image_url` (withone.ai) non e' confermato dalla doc ufficiale.

### A4. Costi e saldo
- La doc ufficiale **non pubblica prezzi per modello** e **non documenta un endpoint per il saldo** (parla solo di "balance" in USD, i fondi scadono dopo 1 anno). Il saldo si vede dalla Console (https://console.higgsfield.ai). https://docs.higgsfield.ai/docs/concepts/billing-and-retention.md , https://docs.higgsfield.ai/docs/help/faq.md
- Un blog Higgsfield (14/10/2026) cita un endpoint "estimate" che restituisce il costo con gli stessi parametri prima dell'invio, ma path e formato **non sono nella doc**: non trovato. https://higgsfield.ai/blog/ai-video-api-pricing-vs-subscriptions
- Unico prezzo ufficiale trovato: Kling 3.0 Standard, 720p, senza audio, **0,084 USD/s** a listino (clip 5 s = 0,42 USD), stessa fonte del blog. Un sito terzo parla di una promozione a 0,042 USD/s (non verificato). Prezzi di Wan, Seedance, MiniMax, Kling O3 first-last: non trovati.
- Altri indizi su Kling O3 presso rivenditori terzi: 0,084-0,224 USD/s a seconda di modalita' (non Higgsfield, indicativi).

### A5. Raccomandazione
**Kling 3.0 Standard image-to-video** (`/kling-video/v3.0/std/image-to-video`) con `image_url` + `last_image_url`, `sound: "off"`, `duration: 5`.
Motivi: unico modello con prezzo ufficiale noto e basso; Kling e' tra i migliori nel movimento di camera fluido e nella coerenza tra frame iniziale e finale; l'interpolazione tra due viste reali tende a restare fedele agli interni. Fedelta' e fluidita': ipotesi basata su reputazione del modello, **non testata**. Piano B: Kling O3 first-last-frame (`mode: std`) se la std produce deformazioni; Seedance 2.0 a 1080p come alternativa.
Stima 10 clip da 5 s: 10 x 5 x 0,084 = **circa 4,2 USD** (circa 3,6-4 EUR) al listino; circa 2,1 USD se vale la promozione. Stima, da confermare con una prova e con il saldo in Console prima del lotto (regola CLAUDE.md: confermare il lotto con l'autore; prima 1 clip di prova).
Suggerimento di prompt: camera dolly in avanti lenta, interno di modulo ISS, nessun cambio di oggetti, luce costante; le due immagini devono avere lo stesso aspect ratio (16:9) perche' l'output segue la prima.

### A6. Esempio completo (segnaposto per le chiavi)
```bash
# 1) upload di un frame locale
UP=$(curl -s -X POST https://api.higgsfield.ai/files/generate-upload-url \
  -H "Authorization: Key ${HF_API_KEY_ID}:${HF_API_KEY_SECRET}" \
  -H "Content-Type: application/json" -d '{"content_type":"image/jpeg"}')
# upload_url, public_url e upload_headers sono nella risposta
curl -X PUT "<upload_url>" -H "Content-Type: image/jpeg" \
  -H "x-amz-tagging: retention=temporary" --upload-file ./frame_a.jpg
# (ripetere per frame_b.jpg; non inviare Authorization al PUT)

# 2) richiesta di volo
curl -X POST https://api.higgsfield.ai/kling-video/v3.0/std/image-to-video \
  -H "Authorization: Key ${HF_API_KEY_ID}:${HF_API_KEY_SECRET}" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: volo-columbus-01" \
  -d '{
    "prompt": "Smooth slow forward camera glide through the interior of a space station module, steady lighting, no objects change, photorealistic",
    "image_url": "<public_url frame A>",
    "last_image_url": "<public_url frame B>",
    "duration": 5,
    "sound": "off",
    "cfg_scale": 0.5
  }'

# 3) polling (usare lo status_url della risposta) fino a "completed", poi scaricare video.url
curl -s "https://api.higgsfield.ai/requests/<request_id>/status" \
  -H "Authorization: Key ${HF_API_KEY_ID}:${HF_API_KEY_SECRET}"
```

## B. Terra dalla ISS in movimento

### B1. Cosa e' stato trovato
Metodo: images-api.nasa.gov (search + asset) e pagine SVS/Commons. Molte query con "cupola" danno solo video di preparazione al lancio; **nessun video ripreso dalla Cupola con le finestre visibili e' stato confermato** in 4K e scaricabile. Cio' che si vede nei clip (giorno/notte, aurore, telaio finestra) per SVS 30771 non e' descritto sulla pagina: va verificato guardando il file.

| # | Candidato | ID | URL diretto | Risoluzione / durata | Licenza e credito |
|---|---|---|---|---|---|
| 1 | ISS View of Planet Earth (SVS 30771, aprile 2016) | SVS 30771 | https://svs.gsfc.nasa.gov/vis/a030000/a030700/a030771/ISS_View_of_Planet_Earth_2160p.mp4 | 3840x2160, 107,6 MB; durata non indicata (breve) | Credito NASA Johnson / SVS. Licenza: nessuna dichiarata sulla pagina, rimanda alle linee guida NASA. |
| 2 | ISS Crew Earth Observations (SVS 30771) | SVS 30771 | https://svs.gsfc.nasa.gov/vis/a030000/a030700/a030771/ISS_Crew_Earth_Observations_2160p.mp4 (720p: `..._720p.mp4`) | 3840x2160, 80,1 MB; stesso contenuto della versione Commons sotto | idem |
| 3 | Crew Earth Observations (4K) su Commons | File:Crew_Earth_Observations_(4K).webm | https://upload.wikimedia.org/wikipedia/commons/4/42/Crew_Earth_Observations_%284K%29.webm | 3840x2160, 66 s, VP9 WebM, 80 MB | Dominio pubblico (NASA Johnson), revisione Commons 18/02/2017. https://commons.wikimedia.org/wiki/File:Crew_Earth_Observations_(4K).webm |
| 4 | 4K Earth Views Extended Cut (Earth Day 2021) | `jsc2021m000138_4K_Earth_Views_Extended_Cut_for_Earth_Day_ 2021_210422-4KMP4` (spazio nell'id) | `https://images-assets.nasa.gov/video/jsc2021m000138_4K_Earth_Views_Extended_Cut_for_Earth_Day_%202021_210422-4KMP4/jsc2021m000138_4K_Earth_Views_Extended_Cut_for_Earth_Day_%202021_210422-4KMP4~orig.mp4` (anche `~large.mp4`) | 3840x2160, 29,97 fps, 52 min 34 s, **15,5 GB** (orig); riprese 2019-2020 | NASA JSC. Nessun copyright sul video, ma **la colonna sonora e' musica con licenza (Universal Production Music)**: scartare l'audio. Metadata: https://images-assets.nasa.gov/video/jsc2021m000138_4K_Earth_Views_Extended_Cut_for_Earth_Day_%202021_210422-4KMP4/metadata.json |
| 5 | Earth Views from the ISS - No Music | `NHQ_2020_1221_Earth Views` | `http://images-assets.nasa.gov/video/NHQ_2020_1221_Earth Views/NHQ_2020_1221_Earth Views~orig.mp4` (codificare gli spazi come %20) | solo 1280x720, 59,94 fps, 44 min, 5,8 GB | NASA HQ, nessun campo copyright. La versione 2019 (`NHQ_2019_0626_Earth Views from the ISS`) ha lo stesso formato ma con musica. |

Nota: gli URL SVS provengono dalla tabella della pagina; non ho potuto eseguire un download di prova (nessuna shell). Verificare con un `curl -I`.

### B2. Licenza
Le linee guida NASA dicono che i contenuti NASA sono in genere non soggetti a copyright negli USA, uso educativo ammesso senza permesso purche' non si suggerisca approvazione NASA; loghi NASA protetti; contenuti di terzi marcati. Il testo e' lievemente ambiguo ("non e' nel pubblico dominio ... generalmente non soggetto a copyright"). Per la relazione usare il credito "NASA" (o "NASA Johnson") e non usare il logo. https://www.nasa.gov/nasa-brand-center/images-and-media/ . Badge del sito: "Foto reale".

### B3. Miglior candidato per il loop 10-20 s
**ISS View of Planet Earth (SVS 30771, 2160p)** per dimensioni gestibili (107 MB), 4K, fonte NASA ufficiale, senza musica documentata. Ritagliare 10-20 s di Terra che scorre, togliere l'audio, loop con cross-fade (ffmpeg). Riserva: Commons "Crew Earth Observations (4K)" (licenza PD esplicitamente rivista). **Rischio aperto:** non e' confermato che mostri le finestre della Cupola; se non le mostra, sovrapporre in CSS/PNG una cornice di finestra (lavoro del web-developer) e dichiararlo. Il clip 4 e' la scelta per cercare inquadrature con aurore/notte, ma richiede scaricare 15 GB (oppure `~large.mp4`, dimensione non verificata).

### B4. Extra utile al progetto (non richiesto)
NASA "Step Inside the International Space Station" (4K, tour guidato filmato a ottobre 2022 durante Crew-4/Crew-5, pubblicato 17/12/2025): `Step_Inside_the_Station-4K-Clean` (senza testi) e `Step_Inside_the_Station-4K`. Possibile fonte di frame reali degli interni per i voli di A. Asset: https://images-api.nasa.gov/asset/Step_Inside_the_Station-4K-Clean . Licenza/credito: "NASA", non verificati in dettaglio.
