import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';
import FirstLoginOnboarding from './pages/auth/FirstLoginOnboarding';
import Home from './pages/site/Home';
import { useAuth } from './context/AuthContext';

import { navSections as supervisionNav } from './router/navConfigSupervision';
import { navSections as adminNav } from './router/navConfigAdmin';

// Supervision
import VueGenerale from './pages/dashboard/VueGenerale';
import ComparaisonCampus from './pages/campus/ComparaisonCampus';
import VolumeRevenus from './pages/campus/VolumeRevenus';
import PerformanceVendeurs from './pages/cantines/PerformanceVendeurs';
import SoldeCreances from './pages/cantines/SoldeCreances';
import ComportementEtudiants from './pages/etudiants/ComportementEtudiants';
import ComptesSuspendus from './pages/etudiants/ComptesSuspendus';
import HistoriqueSuspensions from './pages/etudiants/HistoriqueSuspensions';
import NotesAlertes from './pages/qualite/NotesAlertes';
import Commentaires from './pages/qualite/Commentaires';
import SupervisionAmbassadeurs from './pages/ambassadeurs/SupervisionAmbassadeurs';
import DetailAmbassadeur from './pages/ambassadeurs/DetailAmbassadeur';
import ParametresSupervision from './pages/parametres/Parametres';
import ComptesSupervision from './pages/comptes/ComptesSupervision';
import ComptesAdmin from './pages/comptes/ComptesAdmin';
import ConfigurationPaie from './pages/paie/ConfigurationPaie';
import DemandesRetraits from './pages/paie/DemandesRetraits';

// Admin web
import VueVendeurs from './pages/admin/dashboard/VueVendeurs';
import ListeCantines from './pages/admin/cantines/ListeCantines';
import CantineFiche from './pages/admin/cantines/CantineFiche';
import CreerCantine from './pages/admin/cantines/CreerCantine';
import CampusFacultes from './pages/admin/cantines/CampusFacultes';
import ArticleConfig from './pages/admin/cantines/ArticleConfig';
import FileLitiges from './pages/admin/litiges/FileLitiges';
import LitigeDetail from './pages/admin/litiges/LitigeDetail';
import ComptesSuspendusAdmin from './pages/admin/litiges/ComptesSuspendus';
import ListeAmbassadeurs from './pages/admin/ambassadeurs/ListeAmbassadeurs';
import AmbassadeurFiche from './pages/admin/ambassadeurs/AmbassadeurFiche';
import DemandesAmbassadeur from './pages/admin/ambassadeurs/DemandesAmbassadeur';
import Candidatures from './pages/admin/partenaires/Candidatures';
import Transactions from './pages/admin/transactions/Transactions';
import TransactionDetail from './pages/admin/transactions/TransactionDetail';
import ParametresAdmin from './pages/admin/parametres/ParametresAdmin';

const fakeAdminUser = { name: 'Kofi Mensah', role: 'Admin web' };

export default function App() {
  // Admin web : toujours en mock pour l'instant — hors périmètre du câblage
  // API en cours (on ne fait que Supervision pour le moment).
  const [adminAuth, setAdminAuth] = useState(false);

  // Supervision : branché sur le vrai AuthContext (session réelle via /web-auth/*)
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Site vitrine — page publique */}
        <Route path="/" element={<Home />} />

        {/* ── Espace Supervision ─────────────────────────────── */}
        <Route
          path="/supervision/login"
          element={
            isAuthenticated ? (
              <Navigate to="/supervision/dashboard" replace />
            ) : (
              <LoginPage subtitle="Supervision" userName="Directeur général" onSuccess={() => {}} />
            )
          }
        />
        <Route
          path="/supervision"
          element={<Navigate to={isAuthenticated ? '/supervision/dashboard' : '/supervision/login'} replace />}
        />
        <Route
          element={
            isAuthenticated ? (
              <DashboardLayout
                user={user ? { name: `${user.firstName} ${user.lastName}`, role: 'Supervision' } : { name: 'Supervision', role: 'Supervision' }}
                onLogout={logout}
                navSections={supervisionNav}
                subtitle="Supervision"
                loginPath="/supervision/login"
              />
            ) : (
              <Navigate to="/supervision/login" replace />
            )
          }
        >
          <Route path="/supervision/dashboard" element={<VueGenerale />} />
          <Route path="/supervision/campus" element={<ComparaisonCampus />} />
          <Route path="/supervision/campus/revenus" element={<VolumeRevenus />} />
          <Route path="/supervision/cantines/performance" element={<PerformanceVendeurs />} />
          <Route path="/supervision/cantines/solde" element={<SoldeCreances />} />
          <Route path="/supervision/etudiants" element={<ComportementEtudiants />} />
          <Route path="/supervision/etudiants/suspendus" element={<ComptesSuspendus />} />
          <Route path="/supervision/etudiants/historique" element={<HistoriqueSuspensions />} />
          <Route path="/supervision/qualite/notes" element={<NotesAlertes />} />
          <Route path="/supervision/qualite/commentaires" element={<Commentaires />} />
          <Route path="/supervision/ambassadeurs" element={<SupervisionAmbassadeurs />} />
          <Route path="/supervision/ambassadeurs/:id" element={<DetailAmbassadeur />} />
          <Route path="/supervision/comptes/supervision" element={<ComptesSupervision />} />
          <Route path="/supervision/comptes/admin" element={<ComptesAdmin />} />
          <Route path="/supervision/paie/config" element={<ConfigurationPaie />} />
          <Route path="/supervision/paie/retraits" element={<DemandesRetraits />} />
          <Route path="/supervision/parametres" element={<ParametresSupervision />} />
        </Route>

        {/* ── Espace Admin web (toujours mock pour l'instant) ── */}
        <Route
          path="/admin/login"
          element={
            adminAuth ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <FirstLoginOnboarding userName="Kofi Mensah" onDone={() => setAdminAuth(true)} />
            )
          }
        />
        <Route
          path="/admin"
          element={<Navigate to={adminAuth ? '/admin/dashboard' : '/admin/login'} replace />}
        />
        <Route
          element={
            adminAuth ? (
              <DashboardLayout
                user={fakeAdminUser}
                onLogout={() => setAdminAuth(false)}
                navSections={adminNav}
                subtitle="Admin web"
                loginPath="/admin/login"
              />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        >
          <Route path="/admin/dashboard" element={<VueVendeurs />} />
          <Route path="/admin/cantines" element={<ListeCantines />} />
          <Route path="/admin/cantines/creer" element={<CreerCantine />} />
          <Route path="/admin/cantines/campus" element={<CampusFacultes />} />
          <Route path="/admin/cantines/:id" element={<CantineFiche />} />
          <Route path="/admin/cantines/:id/articles/nouveau" element={<ArticleConfig />} />
          <Route path="/admin/cantines/:id/articles/:articleId" element={<ArticleConfig />} />
          <Route path="/admin/litiges" element={<FileLitiges />} />
          <Route path="/admin/litiges/suspensions" element={<ComptesSuspendusAdmin />} />
          <Route path="/admin/litiges/:id" element={<LitigeDetail />} />
          <Route path="/admin/ambassadeurs" element={<ListeAmbassadeurs />} />
          <Route path="/admin/ambassadeurs/demandes" element={<DemandesAmbassadeur />} />
          <Route path="/admin/ambassadeurs/:id" element={<AmbassadeurFiche />} />
          <Route path="/admin/partenaires" element={<Candidatures />} />
          <Route path="/admin/transactions" element={<Transactions />} />
          <Route path="/admin/transactions/:ref" element={<TransactionDetail />} />
          <Route path="/admin/parametres" element={<ParametresAdmin />} />
        </Route>

        {/* URL inconnue → site public */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}