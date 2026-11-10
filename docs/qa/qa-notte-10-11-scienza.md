# QA notte 10-11 novembre 2026: scienza, fonti, sicurezza, prestazioni, console (v0.9.3, main)

Data: 2026-11-10. Revisore: qa-reviewer. Nessun file di codice o contenuto modificato; nessun commit.
Verifiche fatte davvero: lettura integrale di `content/hotspot-v3.json`, `luoghi-v3.json`, `ambienti.json`, `simulazioni.json`, `mappa-pptx.md`; confronto con `docs/pptx-teoria.md` e con le immagini del pptx (slide 23 aperta); `npm run build`; scansione di `dist/` e del repository; `vite preview` su 5192 e Chrome headless su 9342 (script CDP, percorso Harmony, Columbus, EML, Kibo, Destiny, Unity, Tranquility, Cupola, Finale). Processi chiusi per PID (preview 7072/6320 e Chrome 23800); il server su 5173 non è stato toccato.

## Esito: NON PRONTO (1 bloccante, 2 alti)

La parte scientifica dei testi è nel complesso corretta e coerente col pptx. Il problema grave è strutturale: la tappa finale non ha contenuto.

---

## A. PROBLEMI DI CODICE (src/)

### BLOCCANTE 1. La tappa "Finale / Dallo spazio alla Terra" è vuota: manca il collegamento con Obiettivo 9 e Art. 32
- Dove: `src/data/contenuti.ts:100-101` (commento: "i luoghi senza hotspot reali (es. il finale) ricadono sugli esempi", ma subito dopo `listaHotspot = hotspotNuovi`, "niente testi di esempio/v2") e `:104-110` (`luogoDi` ricade su un luogo senza punti). In `content/hotspot-v3.json` e `content/luoghi-v3.json` non esiste nessuna voce con `luogo: "finale"`. Gli hotspot del finale (`finale-maglev`, `finale-obiettivo9`, `finale-art32`, ...) esistono solo in `src/data/esempio-hotspot.ts:122-127` e in `src/data/posizioni.ts:43-48`, e non vengono più caricati.
- Come riprodurlo: avvio, "Inizia l'esplorazione", barra "Tappe suggerite" -> Finale. Si vede solo il video della Terra, il titolo "Dallo spazio alla Terra / Innovazione, infrastrutture, salute", il badge "Foto reale", il portello "Verso Cupola" e il pulsante "Ricomincia dall'inizio". Nessun punto di interesse, nessuna scheda, nessun testo su Obiettivo 9 o Art. 32 (screenshot catturato in sessione). Esiste `public/audio` con `finale-01..03`? No: in `public/audio/luoghi` non c'è `finale.mp3`; `content/copioni.json:69-81` ha i copioni `finale-01..03` ma non risultano usati.
- Perché è bloccante: CLAUDE.md sezioni 17 e 18 ("Non tagliare mai: collegamento con l'Obiettivo 9") e criterio di successo 10. Oggi Obiettivo 9 compare solo dentro la simulazione "Levitazione: dall'EML al Maglev" (ambiente aperto da EML) e Art. 32 solo in Tranquility/RMN: la sezione narrativa finale richiesta dall'autore non c'è.
- Correzione: scrivere in `content/hotspot-v3.json` 4-6 hotspot con `luogo: "finale"` (maglev e correnti parassite, trasformatore e trasporto, motori, innovazione sui materiali, Obiettivo 9; salute e Art. 32 come ultimo punto), una voce `finale` in `content/luoghi-v3.json` (con testo narrante e punti) e rigenerare la clip vocale `finale`. Le posizioni 0..1 sono già pronte in `posizioni.ts:43-48`. In alternativa, nel codice, riattivare gli esempi solo per `luogo === 'finale'` (soluzione di emergenza: i testi in `esempio-hotspot.ts` non sono rivisti e hanno `badge: 'foto'` sbagliato per il Maglev).

### ALTO 2. Il badge del luogo "EML" (scena 3D) e dei luoghi senza campo `badge` risulta "Foto reale"
- Dove: `src/data/contenuti.ts:91` (`badge: badgeDa(g.badge ?? 'foto')`) e `content/luoghi-v3.json` (nessuna voce ha il campo `badge`); mostrato in `src/ui/SchedaLuogo.tsx:33`.
- Come riprodurlo: EML -> aprire la scheda "EML, Electromagnetic Levitator" (freccia) -> in fondo compare "Foto reale" (verificato via CDP: i badge in pagina sono "Foto reale, Modello 3D"). La scena è un modello 3D concettuale. Lo stesso accade per ogni luogo che dipende dal valore di default; per la Cupola e il finale (video NASA reale) il valore è giusto per caso.
- Correzione: aggiungere `"badge": "Modello 3D"` alla voce `eml` di `luoghi-v3.json` (oppure far dipendere il default da `nodi[id].badge` in `contenuti.ts:91` invece di `'foto'`). Controllare anche `nodi.eml.badge` in `src/data/stazione.ts`.

### ALTO 3. Crediti incompleti nell'elenco "Crediti" dell'interfaccia
- Dove: `src/data/crediti.ts:8-14` (6 voci) contro `public/panorami/CREDITI.md` (8 foto più 3 altri file).
- Mancano nell'interfaccia: `destiny.jpg`, `unity.jpg` (ESA/NASA S. Cristoforetti, stessa licenza), `ambienti/terra-bluemarble.jpg` (NASA Blue Marble), `ambienti/iss.glb` (modello NASA 3D Resources), le 8 foto di `public/img/poi/` (credito solo nella didascalia della scheda), la GIF ESA/DLR `eml-campione-1.gif`, il modello `models/eml.glb` (c'è la voce generica "Modello concettuale"). Sul sito si vedono quindi 2 dei 6 panorami senza credito nell'elenco (anche se la riga in basso a destra mostra il credito del nodo).
- Correzione: aggiungere le voci a `crediti.ts` (o generare l'elenco da CREDITI.md); aggiungere in `creditiAltri` i crediti dei video dei voli (modelli Seedance/Kling, già in CREDITI.md) e la dicitura "NASA 3D Resources" per `iss.glb`.

### MEDIO 4. Licenza dei panorami ESA non verificata e dichiarata in modo più favorevole di quanto trovato
- Dove: `public/panorami/CREDITI.md:5-10` e `src/data/crediti.ts:5` ("ESA Standard Licence, uso educativo non commerciale con credito"). `docs/research/panorami.md:8-18` dice invece: su Flickr le immagini sono "All rights reserved", il testo ufficiale della Standard Licence non è stato letto e "modificare/ridimensionare potrebbe richiedere consenso ESA". I panorami sono stati ridimensionati, e da essi derivano i 10 video IA dei voli (opere derivate).
- Rischio: se il sito viene pubblicato su Vercel pubblico, la dichiarazione di licenza è un'affermazione non verificata. Per una consegna scolastica non commerciale il rischio è basso.
- Correzione: nella relazione scritta dichiarare "uso a scopo didattico non commerciale, credito ESA/NASA", conservare il link all'album Flickr e, se possibile, chiedere conferma a ESA; riscrivere la colonna "Licenza" come "ESA Standard Licence (uso educativo, da confermare)".

### MEDIO 5. Una foto reale ESA/DLR sotto un badge "Simulazione concettuale"
- Dove: hotspot `eml-campione` (`content/hotspot-v3.json:474` `badge: "Simulazione concettuale"`, immagine `eml-campione-1.gif` alle righe 459-467) e visualizzazione in `src/ui/HotspotCard.tsx:106` (un solo badge per scheda, valido per tutte le immagini).
- La didascalia dice correttamente "Immagine reale ESA/DLR, non una simulazione", ma il badge dice l'opposto. Il caso inverso è più grave (IA scambiata per reale), questo è comunque un'etichetta contraddittoria.
- Correzione: badge per immagine (`immagini[].badge`) oppure badge "Foto reale" sulla GIF; vedi anche `kibo-joystick` (foto NASA del Destiny sotto un hotspot di Kibo, già dichiarata in didascalia, righe 532-541).

### MEDIO 6. Testi provvisori in `src/` incoerenti con la scienza (EML a due bobine) e mai nel flusso reale
- `src/data/tour.ts:9,12,15`: "La corrente alternata nelle **bobine**...", e in `src/simulazioni/passi.ts:24` "Le bobine di rame... il campione sospeso al centro delle **due bobine**". L'EML ha una sola bobina con due correnti sovrapposte (come dicono `hotspot-v3.json` righe 151-153 e 261). I testi di `simulazioni.json` sostituiscono quelli di `passi.ts` per i passi della scena EML, ma `tour.ts` alimenta il pannello "Cosa succede nel campione" (visibile nella scena EML) e `passi.ts:24` è il ripiego se la glob fallisce.
- Correzione: "nella bobina" e "attorno al campione" in tour.ts e passi.ts. Inoltre `passi.ts:56` usa `\gamma` per la tensione superficiale mentre il contenuto usa `\sigma`: uniformare a σ (γ è già usato per il rapporto giromagnetico in RMN).

### MEDIO 7. Un singolo chunk iniziale da 1,3 MB (367 KB gzip) e font da Google Fonts
- Vedi sezione Prestazioni. Il sito dipende da `fonts.googleapis.com` (`index.html:6-8`): richiesta a terzi (privacy/GDPR) e comportamento diverso offline. Correzione: scaricare Inter (woff2) in `public/fonts` e usare `@font-face` con `font-display: swap`.

### BASSO 8. Riferimenti "al pptx" visibili nell'interfaccia
- `src/ui/HotspotCard.tsx:108-109` mostra "Fonte: ... teoria pptx 5LSA, slide 23 ... · Slide 23 del pptx" e `src/simulazioni/SimulazioneShell.tsx:205` "Teoria: Slide ...". Danno un tono da presentazione scolastica, contro la sezione 8 del brief ("da evitare: aspetto da sito scolastico"). Suggerimento: mostrare "Teoria: slide 23" senza la parola pptx e togliere "consegna scolastica" dal campo `fonte` visibile (es. `hotspot-v3.json:548,804`).

### BASSO 9. `pulisciTesto` fa da rete di sicurezza ma `content/hotspot.json` conserva note interne
- I file attivi (v3) non contengono note interne (verificato con grep: "DA VERIFICARE", "da riscontrare", "docs/research" non compaiono in `hotspot-v3.json`, `luoghi-v3.json`, `ambienti.json`, `simulazioni.json`; in `dist/` rimane solo il codice di `pulisci.ts`). Restano invece in file non usati: `content/hotspot.json:92,149,166,234,320,326,363,377,382,415,433,469`, `content/struttura.md:32,105`. Nessun impatto sul sito; ripulire prima di consegnare il repository.

### BASSO 10. Console
- Unico messaggio nell'intero percorso (home e 9 tappe): `console.warning: THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.` (libreria three, innocuo). Nessun errore, nessuna eccezione, nessun 404 o richiesta fallita. `favicon` è `data:,` (nessun 404). `/subs/` è una cartella vuota in `public/` (non referenziata).
- Nota: vite preview risponde 200 con l'HTML anche per URL inesistenti (es. `/favicon.ico` -> 404 vero, `/subs/` -> 200 HTML): su Vercel il comportamento va riprovato.

---

## B. PROBLEMI DI TESTO (content/)

Giudizio generale: formule, unità e cifre sono corrette e coerenti col pptx (Faraday-Neumann-Lenz, flusso, autoinduzione, induttanza del solenoide, extracorrente, energia ½Li², alternatore, c.a., trasformatore, trasporto). Cifre della slide 23 (10 kV, 220-380 kV, 20-132 kV) confermate sull'immagine del pptx. Formule LaTeX controllate una per una: nessuna sintassi errata, nessuna dimensione sbagliata. Verificati per ricalcolo: ε = B·l·v = 30 µT x 100 m x 7,7 km/s = 23 V; periodo 2π·6770 km / 7,66 km/s = 92,6 min (16 orbite/giorno); 7,7 km/s = 27 700 km/h (il testo dice 27 600, accettabile); perdite 10 MW su 5 ohm a 10 kV = 5 MW (50%); precessione 1,5 T = 63,9 MHz, 3 T = 127,7 MHz; Rayleigh ω² = 8σ/(ρr³) e Lamb τ = ρr²/(5η) corretti per il modo l = 2; Larmor f = γB₀/2π con γ/2π = 42,58 MHz/T.
Educazione civica: compaiono solo Obiettivi 3, 7, 9 e Art. 32 (nessun Art. 9 o 41; nessun quiz/punteggio/missione).

### ALTO (testo) 11. Manca del tutto il testo della tappa finale
Vedi bloccante 1: serve il contenuto in `content/`.

### MEDIO 12. Affermazioni non verificabili o con fonte solo indiretta (da tenere o da attenuare)
Verificate in `docs/research/eml.md` (18 campioni, 5-8 mm, >50 campioni e >2000 cicli, 2000 e 2200 °C: ok, fonti DLR/Airbus/ESA). Restano senza riscontro nei file `docs/research/`:
- `hotspot-v3.json:446` "fino a 30 000 fotogrammi al secondo secondo Airbus": non trovato in `eml.md`; verificare o togliere (anche in `simulazioni.json`, componente "Telecamera veloce").
- `hotspot-v3.json:562` Ga₂O₃ con ELF e AGC, "comunicato del 24 marzo 2022": data e sostanza da riscontrare con la fonte JAXA/AGC; se non trovata, riformulare senza data.
- `hotspot-v3.json:120, 719` "tensioni fino a circa 30 volt... margine ±20 volt" e "circa -140 volt" (NASA NTRS 19980201237 e 20090028688): dichiarate come previsioni, ma non riviste in questo giro; il testo è prudente ("non una misura"), accettabile.
- `hotspot-v3.json:261` frequenze 135-155 kHz e 365-390 kHz "secondo la letteratura tecnica": formulazione prudente, ok; la fonte è arXiv 1605.03511 (review), non ricontrollata.
- `hotspot-v3.json:623-625` DDCU 160 V -> 124,5 V, efficienza 95%: coerente con NASA NTRS 20020083039 citato. Nota di precisione: "V₂/V₁ = N₂/N₁, qui da 160 V a 124,5 V" è una semplificazione, un convertitore a commutazione regola anche col duty cycle (non solo col rapporto spire).

### MEDIO 13. Imprecisioni di formulazione
- `hotspot-v3.json:49-53` (antenne): la ISS usa soprattutto parabole e antenne a schiera per S/Ku-band, non antenne a spira. Il testo spiega il principio di induzione su un'antenna a spira e lo dichiara come caso didattico, ma l'accostamento al display delle comunicazioni può far pensare il contrario. Aggiungere "in un'antenna a spira, come esempio" (già presente nella voce, va portato anche nel titolo del breve).
- `hotspot-v3.json:10` trasporto: "dai 10 kV della centrale fino a 220-380 kV, per poi scendere a 20-132 kV": coerente con la slide, ma mischia 132 kV (alta tensione) con 20 kV (media); è la slide, ok. Dire "a seconda della sottostazione".
- `hotspot-v3.json:366` "Perciò il generatore dell'EML deve fornire correnti alternate controllate, non brusche": la deduzione (extracorrente -> "perciò") è un po' forzata; riformulare come "per questo il generatore deve tenere conto dell'induttanza".
- `hotspot-v3.json:335` "il campo di dipolo scalda; il quadrupolo posiziona": semplificazione corretta ma il campo di posizionamento riscalda un poco anche il campione (lo dice implicitamente la parte sui campi deboli). Aggiungere "soprattutto".
- `simulazioni.json` EML componente "camera": "La camera è sotto vuoto e riempita con gas inerte" (contraddizione in apparenza): scrivere "svuotata e poi riempita con gas inerte (argon)".
- `luoghi-v3.json:98` Tranquility "Il nodo sopra la Cupola": la Cupola è sul portello nadir; "sopra" è ambiguo. Suggerito "Il nodo della Cupola".
- `hotspot-v3.json:813-841` (`tranquility-eclss`): `oggetto_reale` dice "Nessun rack ECLSS identificabile nel panorama": l'hotspot è ancorato a una parete bianca ma è sotto il badge "Foto reale". Il testo (generatore di ossigeno ospitato in Tranquility) è corretto, ma il punto sulla foto non indica un oggetto reale. Dire nella scheda "non visibile nella foto" o spostare l'hotspot.
- `hotspot-v3.json:480-487` `kibo-elf`: l'oggetto fotografato è il rack MSPR (lo dice il testo); badge "Foto reale" ok, ma l'immagine della scheda mostra un'altra cosa rispetto al titolo: già dichiarato.

### BASSO 14. Note di processo nel testo di lavoro
- `content/mappa-pptx.md:41,59-63` e `content/hotspot-v3.json` campo `oggetto_reale` (es. righe 187, 507, 838) contengono istruzioni interne ("da posizionare su cupola-foto.jpg", "posizione da grafo: yaw +8", "usare la parete bianca sinistra come ancoraggio"). Non vengono mostrate (verificato a video) ma sono note interne nel repository. `content/mappa-pptx.md:56-63`: "Voci da rigenerare (fix QA)": verificare che `public/audio/poi/harmony-comunicazioni.mp3` sia stata davvero rigenerata dopo la modifica del testo.

---

## C. FONTI E CREDITI (riassunto)
- Ogni file in `public/` ha un credito in `public/panorami/CREDITI.md` o nell'elenco "Crediti" dell'interfaccia, tranne: 8 foto `public/img/poi/*.jpg` (credito solo nella didascalia: "NASA"), `eml-campione-1.gif` (didascalia "ESA/DLR"), `models/eml.glb` e `draco/` (modello e decoder: voce generica), i 5 video in `public/video/fenomeni/` (voce generica "Simulazione concettuale - render Blender"). Accettabile, ma completare `CREDITI.md` con queste righe (vedi problema 3).
- Provenienza: i 10 video dei voli (`public/voli/*.mp4`) sono marcati nell'interfaccia con badge "Ricostruzione IA" e riga "Volo: ricostruzione IA (Higgsfield) da panorami ESA" (`src/explore/Esplora.tsx:30,474-478`): nessun rischio di confusione con riprese NASA/ESA. I video dei fenomeni sono marcati "Simulazione concettuale" (`FenomeniPanel.tsx:54`, `SimulazioneShell.tsx:170`). Il video della Cupola è NASA SVS 30771 con credito; la voce ElevenLabs è dichiarata.
- Foto NASA `iss0xx`: pubblico dominio (credito NASA), ok. Foto ESA/Cristoforetti: vedi problema 4.

## D. SICUREZZA
- `npm run build` ok. Ricerca in `dist/` di `sk_[A-Za-z0-9]{10,}`, token Telegram `\d{8,10}:[A-Za-z0-9_-]{30,}`, `HIGGSFIELD`, `ELEVENLABS`, `xi-api-key`, `Key `: nessuna occorrenza. In `src/` e `public/` nessuna occorrenza di nomi di variabili segrete; l'unico uso di `import.meta.env` è `DEV` (`Esplora.tsx:414`).
- `git ls-files`: contiene solo `.env.example` (valori vuoti, tranne commento "formato id:secret" e `BLENDER_PATH`); nessun `.env`, `.env.local`, `dist/`, `node_modules/`. `.gitignore` ignora `.env`, `.env.*` (eccetto l'esempio), `/.env.local`, `dist/`, `node_modules/`; `git check-ignore` conferma `.env`, `dist`, `node_modules`. Cronologia: nessun commit ha mai toccato `.env`/`.env.local`; scansione di pattern di chiavi sulle ultime 50 revisioni: vuota. Il file `.env` non è stato aperto.
- Esito sicurezza: OK.

## E. PRESTAZIONI
- `dist/` totale 95 MB (92 MB sono `public/` copiato), JS in `dist/assets` 3,3 MB totali. Chunk iniziale `index-*.js` 1 302 kB (367 kB gzip) + `index-*.css` 54 kB (11 kB gzip); chunk caricati dopo: `passi` 273 kB (87 gzip), `katex.min` 259 kB (78 gzip), `EmlScene` 69 kB, `Gltf` 71 kB, resto sotto 12 kB. Avviso di Vite sul limite 900 kB.
- Home: ~370 kB di JS gzip + foto `intro.jpg` 0,9 MB + font Google. Accettabile su rete decente; il tempo di avvio dipende dal chunk unico. Suggerimenti: `build.rolldownOptions.output.codeSplitting` (o `manualChunks`) per separare `three`/`@react-three` dal codice dell'app, e far caricare `three` solo all'ingresso nel primo panorama o nella scena EML; già lazy: simulazioni e EmlScene.
- Media più pesanti in `public/`: `video/terra-cupola.mp4` 8,8 MB (4K); panorami 3,8-6,2 MB ciascuno (destiny 6,2; nodo 5,1; columbus 5,1; unity 5,0; materiali 4,5; cupola 3,8; 31 MB in tutto); `img/poi/eml-campione-1.gif` 3,8 MB; i 10 voli 1,2-3,1 MB (23 MB in tutto); `audio` 20 MB; fenomeni 3,0 MB; `terra-bluemarble.jpg` 1,1 MB.
- Suggerimenti concreti: (1) panorami in WebP/AVIF a 6144x3072 (circa -60% di peso), con precaricamento solo dei moduli adiacenti; (2) `terra-cupola.mp4` a 1080p (circa 2-3 MB) con il poster già presente; (3) GIF di 3,8 MB in MP4/WebM (-90%); (4) servire gli MP3 con `Cache-Control` lungo su Vercel e non precaricarli; (5) auto-ospitare i font. Peso totale del sito (92 MB di asset) rientra nei limiti Vercel, ma la prima visita a un modulo scarica 4-6 MB di panorama.
- Memoria JS misurata a fine percorso (headless, GPU software): 18 MB (nessuna perdita evidente).

## Elenco finale per gravità
1. BLOCCANTE: finale senza contenuti e senza Obiettivo 9/Art. 32 (`src/data/contenuti.ts:100-101`; manca `luogo: "finale"` in `content/`).
2. ALTO: badge "Foto reale" sulla scena 3D dell'EML (`contenuti.ts:91`, `luoghi-v3.json`).
3. ALTO: elenco crediti in app incompleto (`src/data/crediti.ts`).
4. MEDIO: licenza ESA dichiarata ma non verificata (`CREDITI.md`, `crediti.ts:5`).
5. MEDIO: badge "Simulazione concettuale" su foto reale ESA/DLR (`hotspot-v3.json:474`).
6. MEDIO: "due bobine" nei testi provvisori (`tour.ts`, `passi.ts:24`).
7. MEDIO: cifre non riscontrate (30 000 fps; comunicato AGC 24/3/2022).
8. MEDIO: chunk JS da 1,3 MB e font da Google; panorami/GIF/video pesanti.
9. MEDIO/BASSO: imprecisioni di formulazione elencate in B.13.
10. BASSO: riferimenti "pptx"/"consegna scolastica" visibili; note interne nei file non usati.
