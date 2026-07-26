import { useState } from 'react';
import { X, Copy, Check, RefreshCw } from 'lucide-react';
import { provisionWebUser, generateTemporaryPassword } from '../services/domain/webUsersService';
import './AccountModals.css';

export default function AccountFormModal({ role, roleLabel, onClose, onCreated }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [tempPassword, setTempPassword] = useState(generateTemporaryPassword());
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const result = await provisionWebUser({ ...form, role, temporaryPassword: tempPassword });
      setCreated({ email: result.email, password: tempPassword });
      onCreated?.();
    } catch (err) {
      setError(err.message || 'Impossible de créer ce compte.');
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!created) return;
    await navigator.clipboard.writeText(`Email : ${created.email}\nMot de passe temporaire : ${created.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="acct-overlay" onClick={onClose}>
      <div className="acct-modal" onClick={(e) => e.stopPropagation()}>
        <div className="acct-modal-header">
          <h2>{created ? 'Compte créé' : `Nouveau compte ${roleLabel}`}</h2>
          <button className="acct-close-btn" onClick={onClose} aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        {!created ? (
          <form onSubmit={handleSubmit}>
            <div className="acct-modal-body">
              <div className="acct-row">
                <div className="acct-field">
                  <label>Prénom</label>
                  <input required autoFocus value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div className="acct-field">
                  <label>Nom</label>
                  <input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                </div>
              </div>
              <div className="acct-field">
                <label>Email</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="acct-field">
                <label>Téléphone <span className="acct-optional">(optionnel)</span></label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="acct-field">
                <label>Mot de passe temporaire</label>
                <div className="acct-password-row">
                  <input readOnly value={tempPassword} className="acct-mono" />
                  <button type="button" className="acct-icon-btn" onClick={() => setTempPassword(generateTemporaryPassword())} title="Régénérer">
                    <RefreshCw size={14} />
                  </button>
                </div>
                <p className="acct-hint">Généré automatiquement — l'espace ({roleLabel}) est déjà fixé par cette page.</p>
              </div>
              {error && <div className="acct-error">{error}</div>}
            </div>
            <div className="acct-modal-footer">
              <button type="button" className="acct-btn-secondary" onClick={onClose}>Annuler</button>
              <button type="submit" className="acct-btn-primary" disabled={creating}>
                {creating ? 'Création...' : 'Créer le compte'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="acct-modal-body">
              <p className="acct-hint" style={{ marginBottom: 12 }}>
                Transmets ces identifiants à la personne concernée par un canal sûr — le mot de passe ne sera plus jamais affiché.
              </p>
              <div className="acct-credentials-box">
                <div><span className="acct-cred-label">Email</span> {created.email}</div>
                <div><span className="acct-cred-label">Mot de passe</span> {created.password}</div>
              </div>
            </div>
            <div className="acct-modal-footer">
              <button className="acct-btn-secondary" onClick={handleCopy}>
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copié' : 'Copier'}
              </button>
              <button className="acct-btn-primary" onClick={onClose}>Fermer</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}