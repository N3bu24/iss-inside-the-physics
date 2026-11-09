/** Intestazione del sito, mostrata in alto nelle simulazioni a tutto schermo. */
export default function Intestazione({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none select-none text-[11px] uppercase tracking-[0.22em] text-white/60 ${className}`}>
      <span className="font-semibold text-white/85">ISS — Inside the Physics</span>
      <span className="mx-2 text-white/30">·</span>
      <span>Alessandro Bettinelli</span>
    </div>
  )
}
