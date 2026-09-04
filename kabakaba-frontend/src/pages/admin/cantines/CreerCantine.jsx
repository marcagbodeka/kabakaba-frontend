import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils } from 'lucide-react';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';
import { createVendor } from '../../../services/domain/vendorsService';
import { findAllCampuses } from '../../../services/domain/campusesService';

export default function CreerCantine() {
  const navigate = useNavigate();

  const [campuses, setCampuses] = useState([]);
  const [campusChecked, setCampusChecked] = useState({});

  const [canteenName, setCanteenName] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    findAllCampuses().then((list) => {
      setCampuses(list);
      // Pré-coche le premier campus pour retrouver le comportement de la
      // maquette (un campus coché par défaut), sans en présumer le nom.
      if (list[0]) setCampusChecked({ [list[0].id]: true });
    });
  }, []);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    const pwd = Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setTempPassword(pwd);
    setConfirmPassword(pwd);
  };

  const selectedCampusIds = Object.entries(campusChecked).filter(([, v]) => v).map(([k]) => k);

  const [firstName, ...lastNameParts] = vendorName.trim().split(/\s+/);
  const lastName = lastNameParts.join(' ');

  const canSubmit =
    canteenName.trim() &&
    firstName && lastName &&
    phone.trim() &&
    email.trim() &&
    tempPassword.length >= 8 &&
    tempPassword === confirmPassword &&
    selectedCampusIds.length > 0;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await createVendor(
        { firstName, lastName, phone, email, temporaryPassword: tempPassword },
        { canteenName, campusIds: selectedCampusIds },
      );
      navigate('/admin/cantines');
    } catch (err) {
      setError(err.message || 'Échec de la création.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Topbar icon={Utensils} breadcrumb={[{ label: 'Cantines', path: '/admin/cantines' }, { label: 'Créer une cantine' }]}>
        <button className="btn-secondary-sm" disabled={submitting} onClick={() => navigate('/admin/cantines')}>Annuler</button>
        <button className="btn-primary-sm" disabled={!canSubmit || submitting} onClick={handleSubmit}>
          {submitting ? 'Création…' : 'Créer la cantine'}
        </button>
      </Topbar>
      <PageContent>
        <div className="page-header">
      <div className="eyebrow">Admin web · Cantines</div>
          <h1>Créer une cantine</h1>
          <p>Renseignez les informations du vendeur et configurez son accès à l&apos;application mobile.</p>
        </div>

        {error && <p style={{ color: '#DC2626', fontSize: 14, marginBottom: 16 }}>{error}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 800 }}>
          <div className="card">
            <div className="card-title">Informations de la cantine</div>
            <div className="form-grid">
              <div className="field-group" style={{ gridColumn: '1/-1' }}>
                <label className="fg-label">Nom de la cantine <span style={{ color: '#EF4444' }}>*</span></label>
                <input className="fg-input" placeholder="Ex : Cantine du Bloc A" value={canteenName} onChange={(e) => setCanteenName(e.target.value)} />
              </div>
              <div className="field-group">
                <label className="fg-label">Nom du vendeur <span style={{ color: '#EF4444' }}>*</span></label>
                <input className="fg-input" placeholder="Prénom NOM" value={vendorName} onChange={(e) => setVendorName(e.target.value)} />
              </div>
              <div className="field-group">
                <label className="fg-label">Téléphone de contact <span style={{ color: '#EF4444' }}>*</span></label>
                <input className="fg-input" type="tel" placeholder="+228 XX XX XX XX" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Campus affiliés <span style={{ color: '#EF4444' }}>*</span></div>
            <div className="card-sub">Sélectionnez le ou les campus où cette cantine sera visible</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {campuses.map((c) => (
                <label
                  key={c.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    background: '#F8FAFC', borderRadius: 10, cursor: 'pointer',
                    border: `1.5px solid ${campusChecked[c.id] ? 'var(--indigo)' : 'var(--border)'}`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!campusChecked[c.id]}
                    onChange={() => setCampusChecked((prev) => ({ ...prev, [c.id]: !prev[c.id] }))}
                    style={{ width: 16, height: 16, accentColor: 'var(--indigo)' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{[c.institution, c.city].filter(Boolean).join(' — ')}</div>
                  </div>
                </label>
              ))}
              {campuses.length === 0 && <div style={{ fontSize: 13, color: 'var(--muted)' }}>Chargement des campus…</div>}
            </div>
          </div>

          <div className="card">
            <div className="card-title">Identifiants de connexion vendeur</div>
            <div className="card-sub">Ces identifiants seront transmis au vendeur pour accéder à l&apos;application mobile.</div>
            <div className="form-grid">
              <div className="field-group" style={{ gridColumn: '1/-1' }}>
                <label className="fg-label">Email de connexion <span style={{ color: '#EF4444' }}>*</span></label>
                <input className="fg-input" type="email" placeholder="vendeur@kabakaba.app" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="field-group">
                <label className="fg-label">Mot de passe temporaire <span style={{ color: '#EF4444' }}>*</span></label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="fg-input" value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} placeholder="Générer automatiquement (min. 8 caractères)" style={{ flex: 1 }} />
                  <button type="button" className="btn-secondary-sm" onClick={generatePassword}>Générer</button>
                </div>
              </div>
              <div className="field-group">
                <label className="fg-label">Confirmer le mot de passe <span style={{ color: '#EF4444' }}>*</span></label>
                <input
                  className="fg-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={confirmPassword && confirmPassword !== tempPassword ? { borderColor: '#EF4444' } : undefined}
                />
              </div>
            </div>
            {confirmPassword && confirmPassword !== tempPassword && (
              <div style={{ fontSize: 12, color: '#DC2626', marginTop: 6 }}>Les mots de passe ne correspondent pas.</div>
            )}
            <div style={{ marginTop: 12, padding: '12px 14px', background: 'var(--peach)', borderRadius: 10, fontSize: 13, color: 'var(--indigo)', lineHeight: 1.6 }}>
              Le vendeur devra changer ce mot de passe temporaire dès sa première connexion à l&apos;application mobile.
            </div>
          </div>
        </div>
      </PageContent>
    </>
  );
}
