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

**Totale speso:** circa 4,62 $ (~4,3 €) su Higgsfield; ElevenLabs dentro il piano Starter già pagato
**Budget residuo:** circa 16-26 €
