import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import './AccountModals.css';

export default function DeleteAccountModal({ account, immediate, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Le motif est obligatoire.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(reason.trim());
      onClose();
    } catch (err) {
      setError(err.message || 'Impossible de traiter cette suppression.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="acct-overlay" onClick={onClose}>
      <div className="acct-modal" onClick={(e) => e.stopPropagation()}>
        <div className="acct-modal-header">
          <h2 style={{ color: '#EF4444' }}><AlertTriangle size={16} style={{ verticalAlign: -2, marginRight: 6 }} /> Supprimer ce compte</h2>
          <button className="acct-close-btn" onClick={onClose} aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="acct-modal-body">
            <p className="acct-hint" style={{ marginBottom: 14 }}>
              Compte concerné : <strong>{account.firstName} {account.lastName}</strong> ({account.email})
              <br />
              {immediate
                ? 'Cette action désactive le compte immédiatement (soft delete, traçable).'
                : "Cette action crée une demande soumise au vote des comptes Supervision (majorité, 48h)."}
            </p>
            <div className="acct-field">
              <label>Motif <span className="acct-required">*</span></label>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Raison de cette suppression..."
              />
            </div>
            {error && <div className="acct-error">{error}</div>}
          </div>
          <div className="acct-modal-footer">
            <button type="button" className="acct-btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="acct-btn-danger" disabled={submitting}>
              {submitting ? 'Traitement...' : immediate ? 'Désactiver le compte' : 'Soumettre au vote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}