# Cupola: vista in diretta + posizione ISS (nota 9)

Data verifica: 11/11/2026. Legenda: [V] verificato, [I] ipotesi / non verificato.

## 1. Stream della Terra dalla ISS

- [V] Esiste una diretta NASA ufficiale "Live Video from the International Space Station (Official NASA Stream)" sul canale YouTube NASA, ID canale `UCLA_DiR1FfKNvjuUpBHmylQ`. La pagina `https://www.youtube.com/channel/UCLA_DiR1FfKNvjuUpBHmylQ/live` compare nei risultati di ricerca con quel titolo; la descrizione parla di una camera esterna sul modulo Harmony. Fonte: ricerca web, risultato "Live Video from the International Space Station (Official NASA Stream) - YouTube".
- [I] Non sono riuscito a leggere la pagina (YouTube reindirizza al consenso cookie) quindi NON ho verificato: ID del video live attuale, se e' attiva oggi, se l'embed e' consentito dal proprietario.
- [V] Attenzione: il canale NASA ospita piu' dirette contemporanee (NASA TV, lanci, ecc.). Quindi `embed/live_stream?channel=UCLA_DiR1FfKNvjuUpBHmylQ` potrebbe mostrare un'altra diretta (quella "principale" del canale), non quella ISS. Sconsigliato come unica soluzione.
- [V] Video ID trovati ma NON ufficiali NASA (da non usare): `fO9e9jnhYK8` (canale "Sen", camere 4K commerciali), `wdskLm9e3iI` (canale "Captain Hindsight", ri-trasmissione), `86BxOcWMylc`, `-BhPYpiPsdc`, `tj4knR4r1UU` (aggregatori).
- Raccomandazione: l'autore apre in browser `https://www.youtube.com/channel/UCLA_DiR1FfKNvjuUpBHmylQ/live` (o cerca "Live Video from the International Space Station" sul canale NASA), legge il video ID dalla URL e lo prova come `https://www.youtube.com/embed/<VIDEO_ID>?autoplay=0&mute=1&rel=0`. Se la pagina NASA mostra "video non disponibile all'incorporamento", usare il fallback sotto. Come test rapido dell'embed: aprire l'URL embed in una scheda.
- Fallback sempre funzionante: link esterno "Guarda in diretta su NASA" verso la pagina YouTube, piu' una mappa/posizione senza video.
- Limiti noti [V da fonti generiche, Space.com]: la vista puo' diventare nera durante la parte notturna dell'orbita (circa 45 min su 90), puo' passare per schermate di perdita segnale (AOS/LOS) o essere spenta/sostituita. Mostrare un avviso discreto ("Se lo schermo e' nero, la ISS sta attraversando la notte orbitale").
- Nota privacy/tecnica: usare `youtube-nocookie.com` per l'embed riduce i cookie; l'embed YouTube e' compatibile con un sito statico HTTPS. Caricare l'iframe solo dopo il clic dell'utente (lazy), cosi' nulla parte da solo.

## 2. API posizione ISS

Raccomandata: `https://api.wheretheiss.at/v1/satellites/25544`
- [V] Risposta HTTPS testata (JSON): `{"name":"iss","id":25544,"latitude":-51.78,"longitude":108.17,"altitude":437.5,"velocity":27534.9,"visibility":"daylight","footprint":4595.6,"timestamp":1794366135,"daynum":...,"solar_lat":-17.39,"solar_lon":130.43,"units":"kilometers"}`. Campi utili: `latitude`, `longitude` (gradi), `timestamp` (Unix, secondi, UTC), `altitude` (km), `velocity` (km/h presunto), `visibility`, `solar_lat/solar_lon` (punto subsolare, utile per disegnare la linea giorno/notte).
- [V] Limite dichiarato: circa 1 richiesta al secondo; nessuna autenticazione per ora. Fonte: https://wheretheiss.at/w/developer. Consiglio: aggiornare ogni 5 s al massimo.
- [I] CORS: NON documentato e non verificabile da WebFetch (serve vedere gli header). Molti progetti la usano dal browser, ma va testato: da console del browser sul sito, `fetch('https://api.wheretheiss.at/v1/satellites/25544').then(r=>r.json()).then(console.log)`. Se bloccato: funzione serverless Vercel (`/api/iss`) che fa da proxy (nessuna chiave richiesta, quindi nessun segreto).
- Open-notify (`api.open-notify.org`): scartata, e' solo HTTP [I, noto da conoscenza generale, non riverificato oggi]; dal sito HTTPS sarebbe bloccata (mixed content).
- Fallback offline: se la fetch fallisce, mostrare "Posizione non disponibile" oppure calcolare la posizione con TLE (satellite.js), non verificato.
- Data e ora: derivare da `timestamp` (UTC) con `toLocaleString('it-IT', {timeZone:'Europe/Rome'})`; indicare anche UTC.

## 3. Planisfero in pubblico dominio

- Raccomandato: NASA Earth Observatory, Blue Marble: Next Generation, gennaio 2004, 5400x2700 px, 500 m/pixel. Pagina: https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/
- URL diretto (come riportato dalla pagina; [I] non ho scaricato il file per confermare il tipo di proiezione, ma il rapporto 2:1 e' coerente con equirettangolare, cioe' lat/long lineari):
  `https://assets.science.nasa.gov/dynamicimage/assets/science/esd/eo/images/bmng/bmng-base/january/world.200401.3x5400x2700.jpg`
  Variante con rilievo: `.../bmng-topography/january/world.topo.200401.3x5400x2700.jpg`.
- Consiglio: scaricare una volta e salvarlo nel progetto (ridimensionato a ~2048x1024 o 2700x1350) invece di hotlinkare. Posizionamento: x = (lon+180)/360, y = (90-lat)/180.
- Alternativa: Blue Marble 2002 (8192x4096 TIFF / 2048x1024 JPEG), https://science.nasa.gov/earth/earth-observatory/the-blue-marble-true-color-global-imagery-at-1km-resolution/
- Credito richiesto dalla pagina: "NASA Earth Observatory" (dati prodotti da Reto Stöckli, NASA Earth Observatory / NASA GSFC).

## 4. Licenze e crediti

- [V] Linee guida media NASA (https://www.nasa.gov/nasa-brand-center/images-and-media/): immagini e video NASA in genere non protetti da copyright negli USA, utilizzabili per scopi educativi/informativi (siti inclusi); va citata NASA come fonte; non si deve suggerire endorsement NASA; logo NASA ("meatball", "worm") NON in pubblico dominio: non usarli nel sito. Il materiale di terzi e' marcato con il titolare. Le linee guida non trattano esplicitamente l'embed.
- [I] Lo stream sul canale NASA e' ospitato da YouTube: l'embed usa il player ufficiale e rientra nei termini YouTube (non rimuovere branding/link). Se il video fosse caricato da terzi (come Sen), diritti non NASA: evitare.
- Testo credito proposto (badge/didascalia): "Diretta: NASA, Live Video from the International Space Station, via YouTube. Posizione: wheretheiss.at. Mappa: NASA Earth Observatory (Blue Marble: Next Generation). Il sito non e' affiliato ne' approvato da NASA."
- Badge di provenienza: "Foto reale" non adatto; suggerire "Diretta NASA" (nuovo tipo) per distinguerlo dalle ricostruzioni.

## Rischi
1. ID video live non verificato e dirette NASA multiple sul canale: serve controllo manuale dell'autore.
2. CORS di wheretheiss.at non verificato: test in browser, proxy Vercel come piano B.
3. Stream nero di notte / offline: previsto avviso e link esterno.
4. Limite ~1 req/s: polling >= 5 s.
