import { useEffect } from 'react';
import { Settings } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';
import { useAuth } from '../../context/AuthContext';

export default function Parametres() {
  const { user, refreshMe } = useAuth();

  useEffect(() => {
    refreshMe().catch(() => {});
  }, [refreshMe]);

  return (
    <>
      <Topbar icon={Settings} breadcrumb={[{ label: 'Paramètres' }]} />
      <PageContent>
        <div className="page-header">
      <div className="eyebrow">Supervision · Paramètres</div>
          <h1>Paramètres</h1>
          <p>Profil connecté</p>
        </div>

        <div className="card">
          <div className="card-title">Profil</div>
          {user ? (
            <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.7 }}>
              <div>
                <strong>
                  {user.firstName} {user.lastName}
                </strong>{' '}
                · {user.role}
              </div>
              <div style={{ color: 'var(--muted)' }}>{user.email}</div>
              <div style={{ marginTop: 8 }}>
                2FA : {user.twoFaEnabled ? <span className="badge-green">Activé</span> : <span className="badge-orange">Non configuré</span>}
              </div>
            </div>
          ) : (
            <p style={{ marginTop: 12, color: 'var(--muted)' }}>Chargement du profil…</p>
          )}
        </div>
      </PageContent>
    </>
  );
}
