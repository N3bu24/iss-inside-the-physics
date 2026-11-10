| 2026-11-10T09:37:50.188Z | prova-aria.mp3 | 8 s | loop=true | influence=0.4 | 129192 byte |
| 2026-11-10T09:38:20.870Z | strato1-aria.mp3 | 30 s | loop=true | influence=0.4 | 481114 byte |
| 2026-11-10T09:38:32.308Z | strato2-elettronica.mp3 | 30 s | loop=true | influence=0.4 | 481114 byte |
| 2026-11-10T09:38:46.170Z | strato3a-beep.mp3 | 30 s | loop=false | influence=0.4 | 481114 byte |
| 2026-11-10T09:38:55.035Z | strato3b-dettagli.mp3 | 30 s | loop=false | influence=0.4 | 481114 byte |
| 2026-11-10T13:53:32.423Z | prove/prova-rientro.mp3 | 5 s | loop=true | influence=0.4 | 81127 byte | rombo rientro |
| 2026-11-10T13:54:16.916Z | sorgenti/rientro-finale-1.mp3 | 22 s | loop=true | influence=0.4 | 353218 byte | rombo rientro |
| 2026-11-10T13:54:41.195Z | sorgenti/rientro-finale-2.mp3 | 22 s | loop=true | influence=0.4 | 353218 byte | rombo rientro |

### Rientro: strato sintetico aggiunto dall'orchestratore (10/11, pomeriggio)
Il materiale ElevenLabs era quasi solo rombo grave. Senza nuove generazioni, con ffmpeg sono stati aggiunti un sibilo (rumore rosa 700-5200 Hz, tremolo lento) e un crepitio (rumore bianco 2,5-9 kHz, tremolo a 13 Hz). Base senza strato: `sorgenti/rientro-base-solo-rombo.mp3`. Finale: `public/audio/ambient/rientro.mp3`, -29,4 LUFS misurati (il volume si alza nel sito, in `src/lib/ambient.ts`).
