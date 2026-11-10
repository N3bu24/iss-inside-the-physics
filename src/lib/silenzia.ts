/**
 * React Three Fiber (anche l'ultima versione, 9.8) crea internamente un THREE.Clock, che three r183+ segnala come
 * deprecato. Il nostro codice non usa Clock (le animazioni usano il tempo di R3F): filtriamo solo quel singolo avviso.
 */
const avviso = console.warn.bind(console)
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes('Clock: This module has been deprecated')) return
  avviso(...args)
}
