import { Settings } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';

export default function Parametres() {
  return (
    <>
      <Topbar icon={Settings} breadcrumb={[{ label: 'Paramètres' }]} />
      <PageContent>
        <div className="page-header">
          <h1>Paramètres</h1>
          <p>Profil, sécurité, notifications, préférences et gestion des accès</p>
        </div>
        <div className="card">
          <div className="card-title">À connecter à l&apos;API</div>
          <div className="card-sub">
            Onglets Profil / Sécurité (2FA) / Notifications / Préférences / Gestion des accès (réservé Supervision) —
            correspond aux modèles WebUser, WebUserSession, WebUserPreferences, WebUserNotificationSetting déjà en base.
          </div>
        </div>
      </PageContent>
    </>
  );
}
