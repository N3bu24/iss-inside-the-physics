/**
 * Diretta dalla ISS (Cupola): tutti gli URL e le costanti in UN solo punto.
 * Nessuna chiave API: lo stream e' un embed pubblico, la posizione arriva da un'API pubblica HTTPS con CORS.
 */

/** ID del video YouTube della diretta ufficiale NASA ("Live High-Definition Views from the ISS").
 *  Cambia quando NASA riavvia lo stream: se la diretta non parte c'e' il link al canale e il ritorno al video registrato. */
export const ID_STREAM_NASA = 'ROboUHfPUrU'

export const URL_EMBED_STREAM = `https://www.youtube-nocookie.com/embed/${ID_STREAM_NASA}?autoplay=1&mute=1&controls=0&rel=0&playsinline=1`

/** Pagina "live" del canale NASA (ripiego esterno: segue sempre la diretta in corso). */
export const URL_CANALE_LIVE = 'https://www.youtube.com/channel/UCLA_DiR1FfKNvjuUpBHmylQ/live'

/** Posizione attuale della ISS (HTTPS, CORS aperto, senza chiave; limite ~1 richiesta/s). Campi usati: latitude, longitude, timestamp. */
export const URL_POSIZIONE_ISS = 'https://api.wheretheiss.at/v1/satellites/25544'

/** Ogni quanti millisecondi si interroga l'API (mai sotto i 5 s). */
export const INTERVALLO_POSIZIONE_MS = 5000

/** Quanti punti della traccia recente si conservano (60 x 5 s = 5 minuti). */
export const PUNTI_TRACCIA = 60

/** Planisfero equirettangolare 2:1 (NASA Earth Observatory, Blue Marble Next Generation), ridotto. x=(lon+180)/360, y=(90-lat)/180. */
export const IMMAGINE_PLANISFERO = '/img/mondo-bluemarble.jpg'

export const CREDITO_MAPPA = 'Mappa: NASA Earth Observatory (Blue Marble)'
export const CREDITO_STREAM = 'Video: NASA'
