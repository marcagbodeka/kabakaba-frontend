import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import BrandLoader from './components/BrandLoader';
import LoginPage from './pages/auth/LoginPage';
import { useAuth } from './context/AuthContext';

// Site public chargé en lazy : les visiteurs de la page d'accueil ne
// téléchargent pas tout le bundle du dashboard Supervision/Admin (pages,
// graphiques, etc.) avant de voir la page. Vite génère un chunk séparé.
const Home = lazy(() => import('./pages/site/Home'));

import { navSections as supervisionNav } from './router/navConfigSupervision';
import { navSections as adminNav } from './router/navConfigAdmin';

// Supervision
const VueGenerale = lazy(() => import('./pages/dashboard/VueGenerale'));
const ComparaisonCampus = lazy(() => import('./pages/campus/ComparaisonCampus'));
const VolumeRevenus = lazy(() => import('./pages/campus/VolumeRevenus'));
const PerformanceVendeurs = lazy(() => import('./pages/cantines/PerformanceVendeurs'));
const SoldeCreances = lazy(() => import('./pages/cantines/SoldeCreances'));
const ComportementEtudiants = lazy(() => import('./pages/etudiants/ComportementEtudiants'));
const ComptesSuspendus = lazy(() => import('./pages/etudiants/ComptesSuspendus'));
const HistoriqueSuspensions = lazy(() => import('./pages/etudiants/HistoriqueSuspensions'));
const NotesAlertes = lazy(() => import('./pages/qualite/NotesAlertes'));
const Commentaires = lazy(() => import('./pages/qualite/Commentaires'));
const SupervisionAmbassadeurs = lazy(() => import('./pages/ambassadeurs/SupervisionAmbassadeurs'));
const DetailAmbassadeur = lazy(() => import('./pages/ambassadeurs/DetailAmbassadeur'));
const ParametresSupervision = lazy(() => import('./pages/parametres/Parametres'));
const ComptesSupervision = lazy(() => import('./pages/comptes/ComptesSupervision'));
const ComptesAdmin = lazy(() => import('./pages/comptes/ComptesAdmin'));

// Admin web
const VueVendeurs = lazy(() => import('./pages/admin/dashboard/VueVendeurs'));
const ListeCantines = lazy(() => import('./pages/admin/cantines/ListeCantines'));
const CantineFiche = lazy(() => import('./pages/admin/cantines/CantineFiche'));
const CreerCantine = lazy(() => import('./pages/admin/cantines/CreerCantine'));
const CampusFacultes = lazy(() => import('./pages/admin/cantines/CampusFacultes'));
const ArticleConfig = lazy(() => import('./pages/admin/cantines/ArticleConfig'));
const FileLitiges = lazy(() => import('./pages/admin/litiges/FileLitiges'));
const LitigeDetail = lazy(() => import('./pages/admin/litiges/LitigeDetail'));
const ComptesSuspendusAdmin = lazy(() => import('./pages/admin/litiges/ComptesSuspendus'));
const ListeAmbassadeurs = lazy(() => import('./pages/admin/ambassadeurs/ListeAmbassadeurs'));
const AmbassadeurFiche = lazy(() => import('./pages/admin/ambassadeurs/AmbassadeurFiche'));
const DemandesAmbassadeur = lazy(() => import('./pages/admin/ambassadeurs/DemandesAmbassadeur'));
const Candidatures = lazy(() => import('./pages/admin/partenaires/Candidatures'));
const Transactions = lazy(() => import('./pages/admin/transactions/Transactions'));
const TransactionDetail = lazy(() => import('./pages/admin/transactions/TransactionDetail'));
const Retraits = lazy(() => import('./pages/admin/transactions/Retraits'));
const RetraitDetail = lazy(() => import('./pages/admin/transactions/RetraitDetail'));
const ParametresAdmin = lazy(() => import('./pages/admin/parametres/ParametresAdmin'));

export default function App() {
  // Une seule source de vérité pour la session, partagée entre les deux
  // espaces (même compte WebUser, même JWT, même /web-auth/*). Ce qui
  // distingue Supervision d'Admin, c'est le rôle du compte connecté — pas
  // une session séparée. Voir plus bas : chaque zone protégée vérifie
  // isAuthenticated ET user.role, pas seulement isAuthenticated, pour
  // qu'un compte Supervision ne puisse jamais atterrir sur le dashboard
  // Admin (et inversement) même en connaissant l'URL.
  const { isAuthenticated, user, logout, sessionChecked } = useAuth();

  const isSupervision = sessionChecked && isAuthenticated && user?.role === 'SUPERVISION';
  const isAdmin = sessionChecked && isAuthenticated && user?.role === 'ADMIN';

  return (
    <BrowserRouter>
      {!sessionChecked ? (
        <BrandLoader />
      ) : null}
      <div style={{ display: sessionChecked ? 'contents' : 'none' }}>
      <Suspense fallback={<BrandLoader />}>
      <Routes>
        {/* Site vitrine — page publique */}
        <Route path="/" element={<Suspense fallback={null}><Home /></Suspense>} />

        {/* ── Espace Supervision ─────────────────────────────── */}
        <Route
          path="/supervision/login"
          element={
            isSupervision ? (
              <Navigate to="/supervision/dashboard" replace />
            ) : (
              <LoginPage
                subtitle="Supervision"
                userName="Directeur général"
                expectedRole="SUPERVISION"
                onSuccess={() => {}}
              />
            )
          }
        />
        <Route
          path="/supervision"
          element={<Navigate to={isSupervision ? '/supervision/dashboard' : '/supervision/login'} replace />}
        />
        <Route
          element={
            isSupervision ? (
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
          <Route path="/supervision/parametres" element={<ParametresSupervision />} />
        </Route>

        {/* ── Espace Admin web ──────────────────────────────────
            Même mécanique que Supervision : LoginPage gère les 3 modes
            (connexion classique, première connexion, mot de passe
            oublié), branché sur le vrai AuthContext. Seule la valeur de
            expectedRole ("ADMIN") change. */}
        <Route
          path="/admin/login"
          element={
            isAdmin ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <LoginPage subtitle="Admin web" userName="Administrateur" expectedRole="ADMIN" onSuccess={() => {}} />
            )
          }
        />
        <Route path="/admin" element={<Navigate to={isAdmin ? '/admin/dashboard' : '/admin/login'} replace />} />
        <Route
          element={
            isAdmin ? (
              <DashboardLayout
                user={user ? { name: `${user.firstName} ${user.lastName}`, role: 'Admin web' } : { name: 'Admin web', role: 'Admin web' }}
                onLogout={logout}
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
          <Route path="/admin/retraits" element={<Retraits />} />
          <Route path="/admin/retraits/:id" element={<RetraitDetail />} />
          <Route path="/admin/parametres" element={<ParametresAdmin />} />
        </Route>

        {/* URL inconnue → site public */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
      </div>
    </BrowserRouter>
  );
}