import { X } from 'lucide-react';

/**
 * Popup affichée quand on clique sur un bouton de téléchargement de l'app
 * (Google Play, App Store, "Télécharger l'app") alors que l'app n'est pas
 * encore publiée sur les stores. Même pattern visuel que AppOnlyModal
 * (site-modal-overlay / site-modal), mais sans les StoreBadges à l'intérieur
 * pour éviter une boucle (le bouton qui ouvre le popup ne doit pas se
 * retrouver dans le popup lui-même).
 * Ferme au clic sur le fond, sur la croix, ou sur Échap.
 */
export default function ComingSoonModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      className="site-modal-overlay"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role="presentation"
    >
      <div
        className="site-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Application bientôt disponible"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="site-modal-close" onClick={onClose} aria-label="Fermer">
          <X size={18} />
        </button>
        <div className="site-modal-icon">🚀</div>
        <h3>Bientôt disponible</h3>
        <p>L&apos;application sera disponible bientôt&nbsp;! Reviens très vite pour la télécharger.</p>
      </div>
    </div>
  );
}
