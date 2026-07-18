import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import styles from './DashboardLayout.module.css';

/**
 * Coquille commune à toutes les pages du dashboard : Sidebar fixe + zone
 * de contenu défilante. Chaque page (via <Outlet/>) place sa propre
 * Topbar et son propre contenu.
 *
 * `navSections` + `subtitle` déterminent quelle façade s'affiche
 * (Supervision ou Admin web) — c'est App.jsx qui les fournit selon le
 * rôle de la personne connectée. Même Sidebar, même Layout, deux menus.
 */
export default function DashboardLayout({ user, onLogout, navSections, subtitle, loginPath }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout?.();
    navigate(loginPath, { replace: true });
  };

  return (
    <div className={styles.layout}>
      <Sidebar sections={navSections} subtitle={subtitle} user={user} onLogout={handleLogout} />
      <div className={styles.mainArea}>
        <Outlet />
      </div>
    </div>
  );
}
