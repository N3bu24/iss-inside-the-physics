# COSTI API — ISS: Inside the Physics

Budget totale: circa **20-30 €** (Higgsfield + ElevenLabs).
Regola: prova breve prima di ogni generazione; conferma dell'autore per generazioni lunghe, lotti e sopra circa 5 € in un passaggio.
Aggiornare a ogni generazione. Non scrivere mai chiavi API in questo file.

| Data | Servizio | Cosa | Quantità | Costo stimato | Percorso del file | Note |
|---|---|---|---|---|---|---|
| 9/11/2026 | ElevenLabs (eleven_v4) | Prova voce: 3 voci, prime frasi di eml-01 | 3 × 144 = 432 caratteri | 0 € (dentro il piano Starter, 40k caratteri/mese) | `assets/audio/prove/` | Voci: Thomas A., Igor, George |
| 9/11/2026 | ElevenLabs (eleven_v4) | 14 clip voce narrante, voce Thomas A. | 5.195 caratteri, 345,6 s | 0 € (dentro il piano Starter) | `assets/audio/clip/` | Contatore ElevenLabs in ritardo: verificare il saldo sul sito |
| 9/11/2026 | Higgsfield (Kling 3.0 std) | Volo di prova Harmony→Columbus | 1 clip × 5 s | ~0,42 $ | `public/voli/harmony__columbus.mp4` | Riuscito |
| 9/11/2026 | ElevenLabs (eleven_v4) | 12 clip brevi dei luoghi, voce Thomas A. | 1.393 caratteri, ~91 s | 0 € (dentro il piano Starter) | `assets/audio/luoghi/` | Sostituiscono le clip lunghe |

| 9/11/2026 | Higgsfield (Kling 3.0 std) | 10 voli tra moduli (lotto approvato dall'autore su Telegram) | 10 clip × 5 s | ~4,20 $ | `public/voli/` (originali in `assets/voli/originali/`, fuori da git) | Tutti riusciti, nessun errore |
| 9/11/2026 | ElevenLabs (eleven_v4) | Voce v3: 28 punti, 15 luoghi, 8 simulazioni (lotto approvato su Telegram) | 14.100 caratteri, ~15 min | 0 € (dentro il piano Starter) | `assets/audio/v3/` → `public/audio/{poi,luoghi,simulazioni}/` | Contatore API in ritardo: verificare sul sito |

| 10/11/2026 | Higgsfield (Seedance 2.0, 1080p) | 5 voli rifatti (unity→tranquility, columbus→harmony, destiny→harmony, destiny→unity, harmony→columbus) | 5 clip × 5 s | ~17,0 $ (3,40 $/volo: 5 s × 1920×1080 × 24 fps / 1024 = 243.000 token × 0,014 $/1000, listino da `POST /estimate`) | `public/voli/` (originali in `assets/voli/originali-v2/`) | Tentativi falliti per saldo non addebitati (doc Higgsfield: `failed` non si paga). Saldo esaurito, ricaricato dall'autore |
| 10/11/2026 | ffmpeg | 5 voli Kling ricodificati a 24 fps | — | 0 € | `public/voli/` | Niente crediti |
| 10/11/2026 | ElevenLabs (eleven_v4) | Voce finale-trasformatore (+1 clip luoghi/finale generata per errore e scartata) | 2 clip, 786 caratteri | 0 € (piano Starter) | `public/audio/poi/` | Dopo il test di conferma |

Prezzi verificati il 10/11 con l'endpoint gratuito `POST /estimate/{modello}` dell'API Higgsfield: Kling 3.0 std 5 s = 0,42 $ (6,72 crediti); Seedance 2.0 = 0,014 $ ogni 1000 token video (1080p 5 s ≈ 3,40 $, circa 8 volte Kling). L'API non ha un endpoint per leggere il saldo: verificare sulla dashboard.

**Totale speso:** circa **21,6 $** su Higgsfield (Kling 11 clip ≈ 4,62 $ + Seedance 5 clip ≈ 17,0 $; prezzi di listino, prima di eventuali sconti). ElevenLabs dentro il piano Starter già pagato.
**Budget:** ~21,6 $ ≈ 20 €, al limite basso del budget di 20-30 €. D'ora in poi eventuali rifacimenti solo con Kling std (0,42 $) o Seedance 720p (~1,51 $), previa conferma dell'autore.

**Budget residuo (chiusura 10/11 mattina):** speso ~21,6 $ ≈ 20 € su un budget di 20-30 € → residuo circa 0-10 €. Nessuna generazione in questa chiusura.

| 10/11/2026 | Higgsfield (Seedance 2.0, 1080p) | 3 voli rifatti su richiesta dell'autore (kibo→harmony, tranquility→unity, unity→destiny), frame di partenza/arrivo verificati prima | 3 clip × 5 s | ~10,2 $ (3,40 $/volo) | `public/voli/` (originali in `assets/voli/originali-v3/`) | Tutti riusciti al primo tentativo; 2 recuperati dall'ID dopo l'arresto dello script per memoria |

**Totale aggiornato (10/11, ore 10:15):** circa **31,8 $** su Higgsfield (≈ 29 €), al limite alto del budget di 20-30 €. Restano Kling solo harmony→destiny e harmony→kibo.
| 10/11/2026 | ElevenLabs Sound Effects | Sottofondo stazione: 6 generazioni (aria, elettronica, beep, dettagli + 2 prove) mixate in loop da 108 s | 136 s, 1.360 caratteri | 0 € (piano Starter, saldo 13.193/40.000) | `public/audio/ambient/stazione.mp3` (sorgenti in `assets/audio/ambient/`) | Una prova da 8 s addebitata e persa per cartella mancante |

**Totale alla chiusura (10/11, 13:15):** Higgsfield circa **31,8 $ ≈ 29 €**; ElevenLabs 0 € extra (piano Starter, saldo circa 13.193/40.000 caratteri). **Budget residuo:** circa 1 € sul massimo di 30 €. Nessuna generazione dopo il sottofondo.
| 10/11/2026 | ElevenLabs Sound Effects | Rombo del rientro per il finale nella capsula: 1 prova da 5 s + 2 generazioni da 22 s, loop da 40 s; sibilo e crepitio aggiunti con ffmpeg (gratis) | 49 s, 50 caratteri | 0 € (piano Starter, saldo 13.243/40.000) | `public/audio/ambient/rientro.mp3` (sorgenti in `assets/audio/ambient/sorgenti/`) | Nessuna spesa Higgsfield |
