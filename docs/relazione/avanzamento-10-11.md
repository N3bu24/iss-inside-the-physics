# Relazione di avanzamento — 10/11/2026, notte

Progetto: ISS — Inside the Physics (Alessandro Bettinelli, 5ALSA). Versione attuale: **v0.9.5**.

## 1. Cosa è stato fatto (struttura del sito)
- **Ingresso:** schermata iniziale con un solo bottone "Inizia l'esplorazione", "Tappe suggerite" in alto e intestazione con il nome dell'autore su ogni schermata.
- **Esplorazione:** 6 panorami ESA reali a 360° (Harmony, Columbus, Kibo, Destiny, Unity, Tranquility), la Cupola con un video NASA reale della Terra, la scena 3D dell'EML e il finale. Comandi: ↑/↓ verso i portelli, rotella per lo zoom, trascinamento per guardarsi intorno, con una legenda discreta sempre a schermo.
- **Voli tra i moduli:** 10 video IA senza stacchi, perché la prima e l'ultima immagine sono prese dai panorami veri. 5 sono fatti con Seedance 2.0 e 5 con Kling 3.0. Nel test notturno sono risultati tutti corretti.
- **Punti di interesse:** 32 in tutto, con icone diverse per categoria, indicatori ai bordi dello schermo e una lista laterale (al clic la visuale ruota lentamente verso il punto). Le schede hanno testi, immagini, formule e un badge di provenienza (Foto reale / Ricostruzione IA / Modello 3D / Simulazione concettuale).
- **Orientamento:** mini-mappa di tutta la stazione con il modulo attuale, i moduli visitati e il clic per volare.
- **Simulazioni:** 8 simulazioni nello stile dell'EML, con una finestra "a passi". Nell'EML il bottone "Avvia esperimento" apre una sequenza di 6 passi.
- **Ambienti interattivi:** 4 (campo magnetico terrestre, energia di bordo, levitazione/Maglev, RMN).
- **Finale "Dallo spazio alla Terra":** Obiettivi 3, 7 e 9 dell'Agenda 2030 e Art. 32, con 4 schede e la voce.
- **Audio:** voce narrante ElevenLabs (circa 52 clip) con sottotitoli lenti e leggibili, sempre disattivabile.
- **Crediti:** pagina dei crediti completa (ESA, NASA, IA).
- **Organizzazione del lavoro:**
  - repository GitHub privato con 112 commit e 13 versioni con tag (SemVer e CHANGELOG);
  - lavoro diviso tra subagent, ognuno sul proprio branch;
  - 4 cicli di test QA con screenshot a 3 risoluzioni;
  - aggiornamenti continui su Telegram.

## 2. Cosa manca
- **Pubblicazione su Vercel:** serve il tuo account, collegato a GitHub.
- **Relazione scritta** di accompagnamento, con fonti e crediti.
- **Peso del sito:**
  - il codice iniziale pesa circa 367 KB compressi;
  - i panorami pesano 4-6 MB l'uno;
  - c'è il video della Terra da 8,8 MB.

  Vanno alleggeriti per un caricamento più rapido.
- **Prova su tablet** e test finale prima della 1.0.0.
- **Verifiche aperte:**
  - la licenza dei panorami ESA;
  - due frasi del finale da confermare con una fonte (FDA 2008, OMS);
  - piccole rifiniture, per esempio i sottotitoli vicino a un'etichetta del finale.

## 3. Commento
Il sito ha tutta la struttura prevista ed è stabile. L'ultimo test non ha trovato blocchi e la console è pulita. La parte più riuscita è l'esplorazione continua tra panorami e voli, insieme all'EML. I punti deboli sono il peso dei file e la qualità variabile dei voli IA (qualche artefatto a metà volo). Un errore da segnalare: rifare i voli a 1080p con Seedance è costato molto più del previsto.

## 4. Completamento
- **Avanzamento stimato: ~85%.**
- **Tempo rimanente stimato:** 7-9 ore di lavoro.

| Attività | Ore stimate |
|---|---|
| Vercel | ~1 |
| Relazione | ~2 |
| Prestazioni | ~2 |
| Tablet e test finale | ~2 |
| Margine | 1-2 |

C'è margine rispetto alla scadenza di giovedì sera, purché l'account Vercel sia pronto entro mercoledì.

## 5. Spese
**Higgsfield, spesa totale ≈ 21,6 $** (circa 20 €), a prezzi di listino verificati con l'endpoint di stima dell'API.

| Lotto | Clip | Costo |
|---|---|---|
| Prova Kling 3.0 std | 1 | 0,42 $ |
| Lotto Kling 3.0 std | 10 | 4,20 $ |
| Seedance 2.0 a 1080p | 5 | circa 17,0 $ (3,40 $ l'una) |
| Voli rifatti dopo il test | 0 | 0 $ |
| Ricodifica a 24 fps | — | gratis |

- I tentativi falliti per saldo non vengono addebitati.
- L'API non permette di leggere il saldo: è una **stima**, da verificare sulla dashboard Higgsfield.

**ElevenLabs:** tutto dentro il piano Starter già pagato, circa 22.000 caratteri.
