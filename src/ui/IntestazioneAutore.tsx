/**
 * Intestazione fissa con il nome dell'autore, su ogni schermata (intro, esplorazione, EML, ambienti, simulazioni, Cupola).
 * Va montata una sola volta ad alto livello (App.tsx): sta sopra a tutto (z-[200]) e non intercetta i clic.
 * In src/ambienti/ non serve aggiungerla se l'ambiente e` montato dentro App; se un ambiente venisse montato fuori,
 * basta `<IntestazioneAutore />` nel suo contenitore.
 */
export default function IntestazioneAutore({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none fixed left-1/2 top-2 z-[200] -translate-x-1/2 whitespace-nowrap text-[12.5px] font-medium tracking-wide text-white/70 ${className}`}
      style={{ textShadow: '0 0 4px rgba(0,0,0,.95), 0 1px 8px rgba(0,0,0,.9)' }}
    >
      ISS — Inside the Physics <span className="mx-1 text-white/40">·</span> Alessandro Bettinelli
    </div>
  )
}
