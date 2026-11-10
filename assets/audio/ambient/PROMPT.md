# Ambient ISS — prompt e ricetta (ElevenLabs Sound Effects + ffmpeg)

File finale: `public/audio/ambient/stazione.mp3` (108,00 s, stereo 44,1 kHz, 128 kbps, loop senza stacchi).

## Generazioni (ElevenLabs Sound Effects, una chiamata ciascuna)

| # | File | Durata | Loop | Prompt (EN) |
|---|---|---|---|---|
| 1 | prove/prova-aria.mp3 | 8 s | sì | Soft continuous air ventilation inside a spacecraft habitat module, gentle broadband fan airflow, steady and even, low volume, no tonal whine, no high frequency hiss, no bass rumble, calm technical ambience |
| 2 | strato1-aria.mp3 | 30 s | sì | Continuous low air circulation and fan noise inside a spacecraft habitat, soft broadband airflow, steady and even texture, gentle ventilation fans in the distance, very quiet, no tonal whine, no high frequency hiss, no bass rumble, no changes in volume, calm and seamless |
| 3 | strato2-elettronica.mp3 | 30 s | sì | Low electronic hum of computers and laptops in a quiet control room, switching power supply buzz, faint hard drive and small PC cooling fans, steady continuous background, very quiet, no high pitched whine, no sharp beeps, no bass rumble, seamless and even |
| 4 | strato3a-beep.mp3 | 30 s | no | Sparse, very quiet soft electronic chirps and short beeps from scientific instrument panels, far away in a spacecraft, irregular timing with long silences between events, gentle mid-range tones, no harsh, shrill or piercing sounds |
| 5 | strato3b-dettagli.mp3 | 30 s | no | Sparse, distant mechanical details inside a spacecraft: a single relay click, a far-off pump or valve sound, faint soft metallic tinkle, irregular and rare, very quiet with long silences, low volume, no bass rumble, no loud impacts |

Parametri comuni: `prompt_influence` 0,4; formato `mp3_44100_128`.
Tentativo perso: una prova da 8 s è stata generata ma il salvataggio è fallito (cartella mancante). Non è registrata nel registro ed è stata rifatta come prova n. 1.

## Mix (ffmpeg, grafo in `mix-stazione.filtro.txt`)

1. Letto d'aria: highpass 90 Hz; loop costruito con crossfade di 3 s tra coda e testa (27 s di corpo), ripetuto 4 volte = 108 s.
2. Elettronica: stesso schema di loop, +6 dB, lowpass 7 kHz (non serve energia acuta per un ronzio).
3. Beep e dettagli: fette da 6-10 s dei sorgenti 4 e 5, filtrate (beep: 350 Hz-6 kHz; dettagli: 200 Hz-8 kHz), attenuate di circa 34-38 dB, con fade in/out, posizionate con `adelay` a 9, 26, 47, 63, 79, 96 s (intervalli irregolari).
4. Somma del letto e degli eventi; filtro finale `highpass=70`, `lowpass=12500` due volte (4 poli), `acompressor` leggero, `loudnorm=I=-30:TP=-6:LRA=7`.
5. Export: `-ac 2 -ar 44100 -b:a 128k`.

## Verifiche
- Durata 108,00 s; peso 1,7 MB; loudness -30,5 LUFS; LRA 2,0 LU; picco reale -18,3 dBFS.
- Oltre 13 kHz: media -61,1 dB (circa 29 dB sotto la media del file).
- Punto di loop: salto di campione al raccordo 0,020 contro 0,028 di massimo nel file (nessun click); RMS in testa e in coda -33,5 / -33,0 dB.

## Registro
Vedi `registro-generazioni.md` (creato da `genera-ambient.mjs`).
