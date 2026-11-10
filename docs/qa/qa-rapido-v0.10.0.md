# QA rapido v0.10.0 — 10/11/2026

Build di produzione (`npm run build`, `vite preview` porta 5195), Chrome headless via puppeteer-core (installato fuori dal repo), 1440x900 e 1280x720, flag `--autoplay-policy=no-user-gesture-required`. Screenshot: `docs/qa/screens/rapido-*.jpg`.
Console: nessun errore e nessun avviso (THREE.Clock non compare piu). Nessuna risposta HTTP >= 400.

## Esito per punto

| # | Punto | Esito | Evidenza |
|---|---|---|---|
| 1 | Rimozioni (esempio-hotspot.ts, mp3 in radice, 3 pacchetti PSV) | OK | Build senza errori di import; nessun 404. Percorsi audio: tutti i 30 id hotspot di `content/hotspot-v3.json` hanno `public/audio/poi/<id>.mp3` (inclusa `finale-trasformatore`, ora presente); i 16 luoghi di `luoghi-v3.json` hanno `audio/luoghi/<id>.mp3`; gli 8 id di `simulazioni.json` hanno `audio/simulazioni/<id>.mp3`; `/audio/finale-01..03.mp3` (hotspot-v3.json righe 992, 1030) esistono. Nessun file mancante. |
| 2 | Panorami 6144x3072 q70 | OK (riserva minore) | Caricati Harmony, Columbus, Destiny, Unity, Tranquility, EML durante i voli, senza errori. Columbus a zoom normale nitido (`rapido-columbus-1440`); a zoom massimo grana/pixel visibile ma accettabile (`rapido-columbus-zoom-1440`, `-1280`). `public/panorami` 15 MB. |
| 3 | `terra-cupola.mp4` ricodificato | OK | Cupola: video 1600 px, `paused=false`, readyState 4, currentTime avanza (loop da ~5 s). Il finale usa il poster jpg con Ken Burns (`ImmagineNodo.tsx` righe 47-52: il video e solo in Cupola): comportamento previsto dal codice, non un difetto. |
| 4 | `Esplora` in React.lazy | OK | "Inizia l'esplorazione" -> canvas presente in 0,2-0,6 s (preview locale), nessuna schermata vuota prolungata (`rapido-harmony-1440`). |
| 5 | Sottofondo ambient + ducking | OK | `stazione.mp3` 200 audio/mpeg (1,7 MB). AudioContext `running` dopo il clic. Gain campionato via hook su `createGain`: 0,07 (=0,22x0,32) mentre parla la voce di Harmony, poi risale 0,185 -> 0,219 -> 0,22 a fine voce (~4 s). Voce di un punto (Ascolta): 0,22 -> 0,083 -> 0,07 in ~1 s. Audio off: gain 0; riattivando riparte (0,07 con voce in corso). Il modulo non espone lo stato: verificato solo tramite hook esterno. |
| 6 | Finale: etichetta "Verso Cupola" | OK | 1440: etichetta y 627-656, sottotitolo y 768-810. 1280: etichetta y 508-537, sottotitolo y 566-630. Nessun contatto (`rapido-finale2-1280`, `-1440`). A 1280 "Ricomincia dall'inizio" non copre piu la lista (4 voci visibili). |
| 7 | Regressione | OK | Intro; Harmony -> Columbus -> EML ("Avvia esperimento": passi 1 e 3 verificati, finestra a passi, badge "Simulazione concettuale", formula P=Ri^2); simulazione "Energia di bordo" da Harmony (apre, Esc chiude); volo con ArrowUp (Harmony -> Destiny); Cupola (video); Finale; "Ricomincia dall'inizio" -> intro (1440 e 1280). Nessun errore di console. |

## Problemi (in ordine di gravita)

Nessun bloccante. Nessun importante nuovo.

1. **Minore** — Sonde a file facoltativi servite come text/html (fallback SPA, status 200): `/video/intro-bg.mp4` (`src/components/IntroScreen.tsx` riga 7, segnaposto) e `/voli/columbus__eml.mp4` (convenzione `urlVolo`, `src/data/stazione.ts` riga 137). Il codice li gestisce con `assetExists`, nessun errore visibile. Correzione opzionale: togliere il segnaposto intro-bg o dichiarare esplicitamente che il volo columbus->eml non esiste.
2. **Minore** — Persiste "Teoria: L'induzione elettromagnetica, slide 3, 5, 18-23" in schede e simulazioni (visibile in `rapido-sim-energia-1440`; `SimulazioneShell.tsx` ~riga 205, `HotspotCard.tsx` ~riga 110): fa sembrare il sito una presentazione (gia segnalato in `qa-conferma-10-11.md`).
3. **Minore** — Zoom massimo sui panorami: risoluzione piu bassa dopo la ricompressione; accettabile, nessuna azione richiesta.
4. **Nota prestazioni** — `public/audio` 19 MB (clip a richiesta, `preload="none"` per i punti), `public/video` 7 MB, `public/panorami` 15 MB; JS totale `dist` circa 2,0 MB (chunk `pulisci` 748 kB, `index` 299 kB, `Esplora` 272 kB). Caricamento progressivo mantenuto.

## Limiti del test
Rendering software (SwiftShader): tempi e fluidita non rappresentativi; ducking verificato solo con hook sui GainNode; passi 4-6 dell'EML e simulazioni diverse da "Energia" non riaperti in questo giro.
