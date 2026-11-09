# Street View della ISS: verifica di fattibilità (9/11/2026)

Legenda: [V] verificato su fonte ufficiale, [S] da fonte secondaria, [?] incerto/non trovato.

## 1. Quali panorami esistono
- Google ha pubblicato nel 2017 "Outer Space View": panorami 360 degli interni ISS, foto scattate da Thomas Pesquet con fotocamere già a bordo, ricucite a terra. [V] https://blog.google/products/maps/welcome-outer-space-view/
- Il post ufficiale cita per nome: Cupola, US Laboratory (Destiny), Node 1 (Unity), Node 2 (Harmony) crew quarters, Joint Airlock (Quest). [V, ma sono solo i link dell'articolo, non l'elenco completo]
- "15 moduli" / "tutti i moduli incluso BEAM" e presenza di Columbus: [S] (stampa, es. https://www.diyphotography.net/google-street-view-now-lets-explore-international-space-station/). Non ho trovato un elenco ufficiale completo.
- Kibo: non trovato in nessuna fonte. Harmony: confermato solo come "crew quarters" (V); il nodo in generale [S].
- Il progetto include annotazioni cliccabili di Google (descrizioni di oggetti). [S]

## 2. Incorporabilità
- **Maps Embed API, modalità streetview**: iframe con parametri `pano` (ID panorama), `location`, `heading`, `pitch`, `fov` (10-100). Serve sempre una API key. [V] https://developers.google.com/maps/documentation/embed/embedding-map
- Embed API: gratuita e senza limite di richieste, ma la chiave è obbligatoria e vale il ToS di Google Maps Platform (License Restrictions). [V] https://developers.google.com/maps/documentation/embed/usage-and-billing. Un account Cloud con fatturazione attiva è in genere richiesto per ottenere la chiave [?, non verificato in questa sessione].
- **Maps JavaScript API `StreetViewPanorama` con pano ID**: tecnicamente possibile se si conosce il pano ID; "Dynamic Street View" è un SKU a pagamento (5.000 gratis/mese, poi circa 14 USD per 1000, prezzi da pagina in cache) [S/V parziale]. https://developers.google.com/maps/billing-and-pricing/pricing
- I pano ID interni ISS: non li ho ricavati (richiede browser interattivo / Maps). [?] Non verificato che l'embed funzioni per i panorami ISS (che sono "photo path"/contributi non sulla rete stradale); è probabile ma va testato.

## 3. Navigazione e hotspot
- Con l'embed iframe: nessun controllo programmatico, nessun hotspot proprio, UI di Google (frecce, logo, link ad altre viste). Non si può impedire che l'utente passi ad altri panorami o esca. [V per i parametri; limiti dedotti]
- Con la JS API: si possono impostare pano, heading, pitch, e ascoltare eventi; i "links" tra panorami sono quelli di Google. Si possono sovrapporre elementi HTML propri, ma gli hotspot ancorati a coordinate sferiche non sono una funzione nativa per panorami di Google. [Deduzione, parzialmente S]
- Le transizioni tra panorami sono di Google, non personalizzabili.

## 4. Termini d'uso
- Il ToS di Google Maps Platform vieta di esportare/estrarre/fare scraping di contenuti Maps (esplicitamente immagini Street View, tile, ecc.) per usarli fuori dai Servizi, e di rehostarli. [S: riportato da aggregatore, testo ufficiale non letto per troncamento] https://cloud.google.com/maps-platform/terms
- Le Service Specific Terms permettono di mettere in cache solo i `pano_id`, non le immagini. [V] https://cloud.google.com/maps-platform/terms/maps-service-terms
- **Conclusione: scaricare i panorami Google e usarli come equirettangolari in Photo Sphere Viewer NON è consentito.** Non farlo.

## 5. Alternative con licenza chiara
- **ESA, "International Space Station panoramic tour"** (Samantha Cristoforetti, 2015, ~14-15 foto fisheye per modulo, ricucite): panorama interattivo, tra cui Columbus (credito ESA/NASA). [S/V parziale] https://www.esa.int/Our_Activities/Human_Spaceflight/International_Space_Station/Highlights/International_Space_Station_panoramic_tour (la pagina non era raggiungibile da WebFetch: 404; visibile via ricerca). Il file equirettangolare scaricabile: **non trovato**; licenza non verificata (credito "ESA/NASA"; ESA usa Standard Licence o CC BY-SA 3.0 IGO a seconda della pagina).
- **ESA video 360** "Space Station 360" (Pesquet, 2021: Columbus, Node 2 ecc.), "Cupola in 360" (ESA-M. Wandt, 2024), "Columbus, Kibo and a Dragon, Cosmic Kiss 360" (2022). Sono video 360, non immagini; se ne può estrarre un fotogramma equirettangolare per ogni stanza, ma le condizioni vanno controllate pagina per pagina. https://www.esa.int/ESA_Multimedia/Videos/2022/02/Columbus_Kibo_and_a_Dragon_Cosmic_Kiss_360 ; https://www.esa.int/esatv/Videos/2024/02/Cupola_in_360_Muninn ; https://esa.int/esatv/Videos/2021/08/Node_2_Space_Station_360_in_French_with_English_subtitles_available [V esistenza; licenza non verificata]
- Cupola 360 di Felix & Paul Studios/Time (ISS Experience): immagine con licenza non chiara, probabilmente non riusabile. https://www.eurekalert.org/multimedia/636254 [?]
- NASA: nessuna immagine equirettangolare di Columbus/Cupola/nodo trovata nell'archivio. Le foto NASA normali sono utilizzabili (vedi licenze-api.md) ma non sono panorami.
- **URL diretti a equirettangolari scaricabili per Columbus, Cupola, nodo: NON TROVATI.** Non invento link.

## 6. Conclusione operativa (5 righe)
1. Street View via iframe è fattibile ma non permette hotspot propri, navigazione controllata né transizioni curate: contrasta con il brief (sez. 4.2-4.3).
2. Scaricare i panorami Google per Photo Sphere Viewer viola il ToS: escluso.
3. Opzione consigliata: **fallback già deciso**, Photo Sphere Viewer con 4-6 panorami ricavati da video 360 ESA (fotogrammi equirettangolari di Columbus, Cupola, Node 2, Kibo) collegati a mano con hotspot propri, previa verifica licenza della singola pagina ESA e credito "ESA/NASA" visibile.
4. Opzionale: una sola vista Street View in iframe come "extra" (Cupola o US Lab), con chiave limitata per referrer; non dipenderne.
5. Se i fotogrammi ESA risultano inutilizzabili, ricostruire Columbus in 3D (Blender/Three.js) come panorama renderizzato equirettangolare: l'ambiente Columbus è comunque il fulcro.

Rischio aperto: licenza esatta dei video/panorami ESA da controllare sulle singole pagine (uso scolastico non commerciale in genere ammesso con credito "ESA").
