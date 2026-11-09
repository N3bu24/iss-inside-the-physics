---
name: close-session
description: Chiude la sessione di lavoro salvando tutto lo stato del progetto (progressi, decisioni, costi, prossimi passi) in file, così la sessione successiva riparte esattamente da dove ci si è fermati. Usare quando l'autore scrive /close-session o dice di chiudere/finire la sessione.
---

# /close-session

Obiettivo: **non deve andare perso niente**. Alla fine di questa procedura un agent che non ha mai visto questa conversazione deve poter leggere i file e sapere esattamente a che punto siamo, cosa è stato deciso, cosa costa quanto e qual è il prossimo passo preciso.

Esegui i passi nell'ordine. Non saltarne nessuno, anche se la sessione è stata breve.

## 1. Raccogli la situazione reale
- Rileggi `TASKS.md`, `docs/STATE.md`, `docs/DECISIONS.md`, `docs/SESSION-LOG.md` e `docs/costi.md` (se esistono).
- Controlla lo stato del repository (`git status`, `git log --oneline -10`), se la cartella è un repository.
- Se hai lanciato subagent, verifica che abbiano finito (ListAgents); raccogli il loro rapporto e annota il lavoro lasciato a metà. Termina eventuali processi in background (server di sviluppo, render) oppure annotali in STATE.md con il comando per rilanciarli.
- Elenca i file creati o modificati in questa sessione e gli asset generati (video, audio, modelli, render) con il loro percorso.

## 2. Aggiorna `TASKS.md`
- Spunta `[x]` ciò che è davvero finito e verificato (non ciò che è solo iniziato).
- Per ciò che è a metà scrivi accanto una nota breve: `(a metà: cosa manca)`.
- In fondo, sotto "Tagli e problemi", aggiungi cosa è stato tagliato o non è riuscito, con data e motivo.

## 3. Riscrivi `docs/STATE.md` (sovrascrivi tutto, deve essere sempre aggiornato)
Struttura obbligatoria:
- **Data e ora ultimo aggiornamento**
- **Fase e giorno del calendario** (es. "Martedì 10, produzione asset")
- **Fatto** (con percorsi dei file)
- **In corso / a metà** (cosa manca esattamente)
- **Prossimo passo preciso** (la prima cosa da fare alla riapertura, scritta come istruzione concreta)
- **Prossimi passi dopo** (in ordine)
- **Bloccato / serve l'autore** (conferme, account, scelte, file da fornire)
- **File e cartelle importanti** (dove stanno modelli, video, audio, componenti, script)
- **Come avviare il progetto** (comandi esatti per sviluppo, build, test)
- **Stato dei subagent** (chi stava facendo cosa, cosa ha consegnato, cosa va rilanciato)
- **Rischi aperti** (cosa potrebbe non farcela entro giovedì 12 novembre 2026)

## 4. Aggiorna `docs/DECISIONS.md` (solo aggiunte in fondo)
Per ogni decisione presa in questa sessione aggiungi una voce: data, decisione, motivo, alternative scartate. Non cancellare né modificare le voci precedenti; se una decisione cambia, aggiungi una voce che dice cosa sostituisce.

## 5. Aggiungi una voce a `docs/SESSION-LOG.md` (solo in fondo)
Formato: data e ora, durata approssimativa, cosa è stato fatto (5-10 righe), file principali toccati, problemi incontrati, cosa è stato chiesto all'autore e cosa ha risposto.

## 6. Aggiorna `docs/costi.md`
Per ogni generazione API fatta in questa sessione: servizio, cosa, quantità, costo stimato. Riga finale con il **totale speso** e il **budget residuo** (budget totale circa 20-30 €).

## 7. Metti in sicurezza il lavoro
- Verifica che `.env` sia in `.gitignore` e non sia tra i file in staging. Se lo è, toglilo e avvisa l'autore.
- Se la cartella è un repository git, fai un commit con messaggio chiaro (es. `Sessione 2026-11-10: modello EML e render fusione`). Fai il push solo se esiste un remote configurato.
- Se ci sono asset pesanti non versionati, annotali in STATE.md con il loro percorso locale.

## 8. Verifica finale
Rileggi `docs/STATE.md` come se fossi un agent nuovo. Chiediti: so cosa fare per primo? So cosa è deciso? So cosa è bloccato? Se la risposta a una domanda è no, correggi il file.

## 9. Rapporto all'autore (breve)
Scrivi poche righe: cosa è stato fatto, cosa resta, cosa serve da lui, quanto è stato speso. Poi dagli il prompt da incollare alla prossima apertura:

> Leggi CLAUDE.md, poi docs/STATE.md, TASKS.md e docs/DECISIONS.md. Riprendi dal "Prossimo passo preciso" e dimmi in due righe a che punto siamo prima di partire.

Se `.env` contiene le variabili Telegram, manda anche un messaggio breve con `node scripts/notify.mjs --level ok "Sessione chiusa: <1 frase su cosa è pronto>. Prossimo passo: <1 frase>. Speso: <totale> €."`. Se non è configurato, salta questo passaggio senza segnalarlo come errore.

Non iniziare nuovo lavoro dopo aver chiuso la sessione.
