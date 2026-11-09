# Licenze e API (sintesi, 9/11/2026)

Legenda: [V] fonte ufficiale, [S] secondaria, [?] da verificare.

## Immagini NASA
- In genere non soggette a copyright negli USA; uso educativo/informativo (siti, mostre) ammesso senza permesso, citando NASA come fonte e senza suggerire endorsement. [V] https://www.nasa.gov/nasa-brand-center/images-and-media/
- Eccezioni: materiali con copyright di terzi (indicati), logo/insegna NASA (protetti), persone riconoscibili per usi commerciali. Le immagini generate da IA non devono usare il logo NASA né essere attribuite a NASA. [V]
- Credito consigliato: "Immagine: NASA" (o "NASA/ESA-A. Gerst" come da pagina).

## Immagini ESA
- ESA Standard Licence: uso editoriale/educativo/informativo gratuito, senza autorizzazione, **con credito ESA visibile sotto l'immagine** (es. "ESA/NASA-A.Gerst"). Uso commerciale escluso. Alcuni contenuti sono CC BY-SA 3.0 IGO (seguire quella licenza: credito, link, stessa licenza). Contenuti di terzi: contattare il titolare. [V/S] https://www.esa.int/ESA_Multimedia/Terms_and_Conditions (testo letto via ricerca; pagina 404 al fetch)
- Un sito scolastico non commerciale rientra nell'uso educativo. Non modificare ingannevolmente.
- DLR: l'immagine "EML onboard the ISS" è CC BY-NC-ND 3.0 (credito DLR, no commerciale, no opere derivate). [V]
- Regola di progetto: ogni asset con credito + badge "Foto reale"; mantenere un file crediti.

## ElevenLabs
- Piano gratuito: solo non commerciale e con attribuzione. [V, doc ufficiale riportata: https://elevenlabs.io/docs/overview/administration/billing.md]
- Starter (circa 5-6 USD/mese): include licenza commerciale. [S] Se l'attribuzione sia richiesta su Starter: fonti in conflitto, non confermato da pagina ufficiale. [?] Prudenza: inserire nei crediti "Voce generata con ElevenLabs" (costa nulla). Licenza valida per l'audio generato mentre l'abbonamento è attivo [S]: generare tutto durante l'abbonamento e salvare i file.
- Uso scolastico: comunque coperto sia come commerciale che non commerciale. Voce sintetica da dichiarare nel sito.

## Higgsfield
- Costi API: saldo prepagato in USD separato dai crediti dell'abbonamento (i crediti creator non si convertono). Tariffe indicative: Kling 2.6 circa 0,07 USD/s, Seedance 2.5 circa 0,074 USD/s, Kling 3.0 circa 0,112 USD/s (promo a 0,042 vista in una fonte terza). [S, dal blog Higgsfield https://higgsfield.ai/blog/higgsfield-api e terzi; non verificate su docs.higgsfield.ai: la pagina docs non riporta prezzi]
- Quindi clip da 5 s: circa 0,35-0,56 USD con modelli Kling/Seedance; 10 clip da 5 s sono circa 4-6 USD, dentro il budget (20-30 euro insieme a ElevenLabs).
- Modelli economici adatti: Kling 2.6, Seedance 2.5/2.0, Wan (famiglia 2.7/3.0). Prezzi esatti: [?] consultare open.higgsfield.ai / il pricing nell'account prima di generare. Prova breve sempre (regola CLAUDE.md).
- Autenticazione API: header `Authorization: Key ID:SECRET`; i file output restano disponibili almeno 7 giorni: scaricarli subito. [V] https://docs.higgsfield.ai
- Proprietà output: per il help center l'utente conserva la proprietà e l'uso commerciale non è limitato dal piano (Terms 4.4); fonti terze dicono che il piano gratuito ha limiti/watermark. Divieto di usare gli output per addestrare modelli. [S/V parziale] https://higgsfield.ai/creator-hub/help-center/account/who-owns-my-generations-and-can-i-use-them-commercially . Novità ToS effettive dal 27/8/2026 (licenza limitata al funzionamento del servizio): leggerle nell'account. [S]
- Per le clip: etichetta "Ricostruzione IA", mai presentarle come riprese NASA/ESA.

## Rischi aperti
- Attribuzione ElevenLabs Starter e prezzi esatti Higgsfield: da confermare nell'account prima di spendere.
