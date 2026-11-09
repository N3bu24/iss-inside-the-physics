# Voli v2 (stato 10/11, notte)

## Esito: NON rigenerato nulla - crediti Higgsfield a 0
Il MCP Higgsfield risponde: crediti 0, piano free. Seedance 2.0 std 1080p 5s costa 60 crediti/volo (preflight); std richiede piano Plus.
Serve piano Plus (1000 crediti, 39-49 EUR) o il trial MCP di 3 giorni (100 crediti = ~1 volo da 60, non bastano per 10). Nessuna generazione fatta, nessun volo sovrascritto.

## Diagnosi Unity -> Tranquility
- Portello in Unity yaw 90 pitch 0: CORRETTO (cartello "To NOD 3" ai due lati del portello).
- Panorama Tranquility (cupola.jpg): ruotato di ~90 gradi di rollio rispetto a Unity (pareti e pavimento di lato nella vista a yaw -92). Un volo "diritto" da Unity non puo' atterrare senza salto su quella vista: causa principale dell'errore percepito.
- Vista di arrivo attuale (yaw 20, pitch -30): mostra rack di sbieco e un traverso dorato in primo piano, non il portello; non e' un arrivo credibile.
- Portello verso Unity in Tranquility a yaw circa -92. Vista piu' dritta con portello aperto riconoscibile: yaw 180 pitch 0 (portello a sinistra).
- Raccomandazione: frame finale a yaw 180 pitch 0 (camera che curva verso il portello laterale), oppure vista yaw -92 con roll 90 (serve opzione roll in pano-view.py, assente). Alternativa senza IA: crossfade+zoom nel panorama (come per la Cupola).

## Altri 9 voli
Non analizzati sul video (priorita' al blocco crediti).
