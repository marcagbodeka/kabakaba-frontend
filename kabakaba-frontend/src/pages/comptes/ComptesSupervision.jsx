import { ShieldCheck } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';
import AccountsManager from '../../components/AccountsManager';

export default function ComptesSupervision() {
  return (
    <>
      <Topbar icon={ShieldCheck} breadcrumb={[{ label: 'Gestion des comptes', path: '/supervision/comptes' }, { label: 'Comptes Supervision' }]} />
      <PageContent>
        <div className="page-header">
      <div className="eyebrow">Supervision · Comptes</div>
          <h1>Comptes Supervision</h1>
          <p>Création et suppression (vote à la majorité, 48h) des comptes Supervision</p>
        </div>
        <AccountsManager role="SUPERVISION" roleLabel="Supervision" />
      </PageContent>
    </>
  );
}