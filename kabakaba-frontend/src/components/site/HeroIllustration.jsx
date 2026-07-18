/**
 * Illustration du hero : une carte "commande" stylisée qui flotte au-dessus
 * de pastilles représentant campus/cantines/portefeuille — même vocabulaire
 * visuel que l'illustration de login (réseau, orbite), décliné en plus grand
 * et plus concret pour la page vitrine.
 */
export default function HeroIllustration() {
  return (
    <div className="hero-illu" aria-hidden="true">
      <svg viewBox="0 0 420 420" className="hero-illu-svg">
        <circle cx="210" cy="210" r="170" className="hero-illu-ring" />
        <circle cx="210" cy="210" r="130" className="hero-illu-ring-2" />

        <g className="hero-illu-card" transform="translate(90,120)">
          <rect width="220" height="150" rx="18" className="hero-illu-card-bg" />
          <rect x="20" y="24" width="110" height="10" rx="5" className="hero-illu-card-line" />
          <rect x="20" y="44" width="70" height="8" rx="4" className="hero-illu-card-line-light" />
          <circle cx="185" cy="34" r="20" className="hero-illu-card-badge" />
          <path d="M176 34l6 6 12-12" className="hero-illu-check" />
          <rect x="20" y="86" width="180" height="1" className="hero-illu-divider" />
          <rect x="20" y="102" width="60" height="8" rx="4" className="hero-illu-card-line-light" />
          <rect x="160" y="102" width="40" height="8" rx="4" className="hero-illu-card-line" />
          <rect x="20" y="120" width="90" height="8" rx="4" className="hero-illu-card-line-light" />
          <rect x="160" y="120" width="40" height="8" rx="4" className="hero-illu-card-line" />
        </g>

        {[
          { x: 70, y: 70, r: 16 },
          { x: 350, y: 90, r: 12 },
          { x: 60, y: 320, r: 12 },
          { x: 360, y: 300, r: 16 },
        ].map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={n.r} className="hero-illu-node" style={{ animationDelay: `${i * 0.5}s` }} />
        ))}
      </svg>
    </div>
  );
}
