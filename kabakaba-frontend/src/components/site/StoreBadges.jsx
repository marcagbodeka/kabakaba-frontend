/**
 * Badges de téléchargement Google Play / App Store, réutilisés dans le hero
 * et le pied de page. Icônes en SVG inline (poids négligeable, pas de requête
 * réseau supplémentaire).
 */
export default function StoreBadges({ className = '' }) {
  return (
    <div className={`store-badges ${className}`}>
      <a href="#telecharger" className="store-badge">
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3.6 2.3c-.4.3-.6.8-.6 1.4v16.6c0 .6.2 1.1.6 1.4l.1.1L13 12.2v-.2L3.7 2.2l-.1.1z" fill="#00D2FF" />
          <path d="M16.1 15.3l-3.1-3.1v-.2l3.1-3.1.1.1 3.7 2.1c1.1.6 1.1 1.6 0 2.2l-3.7 2.1-.1-.1z" fill="#FFD500" />
          <path d="M16.2 15.2L13 12l-9.4 9.4c.3.4.9.4 1.6.1l11-6.3" fill="#FF3A44" />
          <path d="M16.2 8.8L5.2 2.5c-.7-.4-1.3-.3-1.6.1L13 12l3.2-3.2z" fill="#00D95A" />
        </svg>
        <span className="sb-text">
          <span className="sb-eyebrow">Disponible sur</span>
          <span className="sb-name">Google Play</span>
        </span>
      </a>
      <a href="#telecharger" className="store-badge">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
          <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12-1.14.463-2.35 1.126-3.09.744-.9 2.014-1.57 3.038-1.56zm4.567 16.32c-.744 1.09-1.523 2.15-2.75 2.17-1.204.02-1.59-.71-2.96-.71-1.37 0-1.8.69-2.94.73-1.19.04-2.1-1.18-2.85-2.27-1.54-2.23-2.72-6.31-1.14-9.06.79-1.37 2.2-2.24 3.73-2.26 1.17-.02 2.27.79 2.98.79.71 0 2.04-.98 3.44-.83.59.02 2.24.24 3.3 1.8-.09.05-1.97 1.15-1.95 3.43.02 2.72 2.39 3.63 2.42 3.64-.02.06-.38 1.3-1.26 2.58z" />
        </svg>
        <span className="sb-text">
          <span className="sb-eyebrow">Télécharger dans</span>
          <span className="sb-name">l&apos;App Store</span>
        </span>
      </a>
    </div>
  );
}
