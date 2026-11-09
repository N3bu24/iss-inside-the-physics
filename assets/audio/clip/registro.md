# Registro generazioni clip voce narrante (ElevenLabs)

Voce: Thomas A. - Italian PRO Narrator Voice (`CITWdMEsnRduEUkNWXQv`), modello `eleven_v4`, `mp3_44100_128`.
Impostazioni: stability 0.5, similarity_boost 0.75, style 0.15, use_speaker_boost attivo.
Script: `assets/audio/genera-voci.mjs` (salta le clip già presenti, usa previous_text/next_text della stessa tappa).

## Generazioni

| Data | Operazione | Clip generate | Clip saltate | Caratteri inviati | Contatore prima | Contatore dopo |
|---|---|---|---|---|---|---|
| 2026-11-09 | Prova `--solo intro-01` | 1 (intro-01) | 0 | 386 | 3148 | 3148 (non aggiornato) |
| 2026-11-09 | `--tutte` | 13 | 1 (intro-01) | 4809 | 3302 | 4497 |

Totale clip: 14 (5195 caratteri, come da `content/copioni.json`).
Totale contatore `character_count`: 3148 prima della prova, 4497 dopo il batch (limite piano Starter 40000).

Nota: il contatore non ha registrato l'intero consumo (differenza 1349 contro 5195 caratteri inviati). Probabilmente aggiornamento in ritardo, come già osservato nella prova del 9/11. Verificare il saldo sul sito ElevenLabs prima della prossima generazione.

## File

- `assets/audio/clip/<id>.mp3` per le 14 clip (intro-01, nodo-01, columbus-01, eml-01...eml-06, materiali-01, cupola-01, finale-01...finale-03)
- `assets/audio/clip/manifest.json` (id, tappa, file, durata_s, caratteri)

Durata totale: circa 345,6 s (5 min 46 s), misurata con ffprobe.

## Errori
Nessun errore di API, credito o autenticazione.
