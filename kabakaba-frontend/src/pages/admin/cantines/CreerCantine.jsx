import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils } from 'lucide-react';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';

export default function CreerCantine() {
  const navigate = useNavigate();
  const [campusChecked, setCampusChecked] = useState({ UCAO: true, UL: false });
  const [tempPassword, setTempPassword] = useState('');

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    setTempPassword(Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''));
  };

  return (
    <>
      <Topbar icon={Utensils} breadcrumb={[{ label: 'Cantines', path: '/admin/cantines' }, { label: 'Créer une cantine' }]}>
        <button className="btn-secondary-sm" onClick={() => navigate('/admin/cantines')}>Annuler</button>
        <button className="btn-primary-sm" onClick={() => navigate('/admin/cantines')}>Créer la cantine</button>
      </Topbar>
      <PageContent>
        <div className="page-header">
          <h1>Créer une cantine</h1>
          <p>Renseignez les informations du vendeur et configurez son accès à l&apos;application mobile.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 800 }}>
          <div className="card">
            <div className="card-title">Informations de la cantine</div>
            <div className="form-grid">
              <div className="field-group" style={{ gridColumn: '1/-1' }}>
                <label className="fg-label">Nom de la cantine <span style={{ color: '#EF4444' }}>*</span></label>
                <input className="fg-input" placeholder="Ex : Cantine du Bloc A" />
              </div>
              <div className="field-group">
                <label className="fg-label">Nom du vendeur <span style={{ color: '#EF4444' }}>*</span></label>
                <input className="fg-input" placeholder="Prénom NOM" />
              </div>
              <div className="field-group">
                <label className="fg-label">Téléphone de contact <span style={{ color: '#EF4444' }}>*</span></label>
                <input className="fg-input" type="tel" placeholder="+228 XX XX XX XX" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Campus affiliés <span style={{ color: '#EF4444' }}>*</span></div>
            <div className="card-sub">Sélectionnez le ou les campus où cette cantine sera visible</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { code: 'UCAO', full: "Université Catholique de l'Afrique de l'Ouest" },
                { code: 'UL', full: 'Université de Lomé' },
              ].map((c) => (
                <label
                  key={c.code}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    background: '#F8FAFC', borderRadius: 10, cursor: 'pointer',
                    border: `1.5px solid ${campusChecked[c.code] ? 'var(--indigo)' : 'var(--border)'}`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!campusChecked[c.code]}
                    onChange={() => setCampusChecked((prev) => ({ ...prev, [c.code]: !prev[c.code] }))}
                    style={{ width: 16, height: 16, accentColor: 'var(--indigo)' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{c.code}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{c.full}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title">Identifiants de connexion vendeur</div>
            <div className="card-sub">Ces identifiants seront transmis au vendeur pour accéder à l&apos;application mobile.</div>
            <div className="form-grid">
              <div className="field-group" style={{ gridColumn: '1/-1' }}>
                <label className="fg-label">Email de connexion <span style={{ color: '#EF4444' }}>*</span></label>
                <input className="fg-input" type="email" placeholder="vendeur@kabakaba.app" />
              </div>
              <div className="field-group">
                <label className="fg-label">Mot de passe temporaire <span style={{ color: '#EF4444' }}>*</span></label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="fg-input" value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} placeholder="Générer automatiquement" style={{ flex: 1 }} />
                  <button type="button" className="btn-secondary-sm" onClick={generatePassword}>Générer</button>
                </div>
              </div>
              <div className="field-group">
                <label className="fg-label">Confirmer le mot de passe <span style={{ color: '#EF4444' }}>*</span></label>
                <input className="fg-input" placeholder="" />
              </div>
            </div>
            <div style={{ marginTop: 12, padding: '12px 14px', background: 'var(--peach)', borderRadius: 10, fontSize: 13, color: 'var(--indigo)', lineHeight: 1.6 }}>
              Le vendeur devra changer ce mot de passe temporaire dès sa première connexion à l&apos;application mobile.
            </div>
          </div>
        </div>
      </PageContent>
    </>
  );
}