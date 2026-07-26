import { ShieldCheck } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';
import AccountsManager from '../../components/AccountsManager';

export default function ComptesAdmin() {
  return (
    <>
      <Topbar icon={ShieldCheck} breadcrumb={[{ label: 'Gestion des comptes', path: '/supervision/comptes' }, { label: 'Comptes Admin' }]} />
      <PageContent>
        <div className="page-header">
          <h1>Comptes Admin web</h1>
          <p>Création et suppression immédiate (tracée) des comptes Admin web</p>
        </div>
        <AccountsManager role="ADMIN" roleLabel="Admin web" />
      </PageContent>
    </>
  );
}