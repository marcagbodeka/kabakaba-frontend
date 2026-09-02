import { X } from 'lucide-react';
import StoreBadges from './StoreBadges';

/**
 * Popup affichée quand une action (ex. "Devenir ambassadeur") n'est
 * réalisable que depuis l'app mobile. Ferme au clic sur le fond, sur la
 * croix, ou sur Échap.
 */
export default function AppOnlyModal({ open, onClose, title, text }) {
  if (!open) return null;

  return (
    <div
      className="site-modal-overlay"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role="presentation"
    >
      <div className="site-modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <button className="site-modal-close" onClick={onClose} aria-label="Fermer">
          <X size={18} />
        </button>
        <div className="site-modal-icon">📲</div>
        <h3>{title}</h3>
        <p>{text}</p>
        <StoreBadges className="site-modal-badges" />
      </div>
    </div>
  );
}
