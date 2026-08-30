import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronLeft, LogOut } from 'lucide-react';
import styles from './Sidebar.module.css';

// Événement global qui permet à Topbar (rendue par chaque page, pas un
// parent direct de Sidebar) de déclencher l'ouverture/fermeture du tiroir
// mobile sans avoir à faire remonter cet état jusqu'à DashboardLayout —
// même principe que AUTH_EXPIRED_EVENT dans httpClient.js.
export const TOGGLE_MOBILE_NAV_EVENT = 'kbb:toggle-mobile-nav';

function getInitials(name = '') {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

// Sidebar générique et réutilisable : elle ne connaît ni Supervision ni
// Admin web, elle affiche simplement la liste de sections qu'on lui donne.
// Chaque façade (Supervision, Admin web) passe son propre navConfig.
//
// Repliable : en mode replié, on ne montre que les icônes de chaque
// section (une bande fine) ; cliquer sur un item la déplie automatiquement
// pour révéler son libellé et, le cas échéant, ses sous-items.
export default function Sidebar({ sections, subtitle, user, onLogout }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('kabakaba-sidebar-collapsed') === '1';
    } catch {
      return false;
    }
  });
  // Tiroir mobile : état séparé de "collapsed" (qui n'a de sens que sur
  // desktop, où la sidebar reste dans le flux normal en bande fine). Sur
  // mobile, la sidebar est soit totalement hors-écran, soit ouverte en
  // recouvrement plein — jamais "repliée en icônes".
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {};
    sections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children?.some((c) => location.pathname.startsWith(c.path))) {
          initial[item.label] = true;
        }
      });
    });
    return initial;
  });

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('kabakaba-sidebar-collapsed', next ? '1' : '0');
      } catch {
        // stockage indisponible, tant pis, on garde juste l'état en mémoire
      }
      return next;
    });
  };

  // La zone principale (DashboardLayout) lit --sidebar-w pour son
  // margin-left : on la met à jour ici plutôt que de faire remonter l'état
  // "collapsed" au layout, pour que Sidebar reste un composant autonome.
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-w',
      collapsed ? 'var(--sidebar-w-collapsed)' : '272px',
    );
  }, [collapsed]);

  const toggleGroup = (label) => {
    // "collapsed" (icônes seules) n'a de sens que sur desktop. Sur mobile,
    // le tiroir ouvert affiche toujours les libellés, peu importe la
    // préférence desktop persistée — donc on ne déclenche l'auto-dépliage
    // (qui modifierait cette préférence) que si on n'est PAS dans le
    // tiroir mobile.
    if (collapsed && !mobileOpen) {
      toggleCollapsed();
      setOpenGroups((prev) => ({ ...prev, [label]: true }));
      return;
    }
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Écoute le déclencheur (bouton hamburger dans Topbar, sur mobile).
  useEffect(() => {
    const handleToggle = () => setMobileOpen((v) => !v);
    window.addEventListener(TOGGLE_MOBILE_NAV_EVENT, handleToggle);
    return () => window.removeEventListener(TOGGLE_MOBILE_NAV_EVENT, handleToggle);
  }, []);

  // Ferme automatiquement le tiroir mobile à chaque changement de page —
  // sans ça, la sidebar resterait ouverte par-dessus le contenu après
  // avoir cliqué un lien.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLinkClick = () => {
    if (collapsed && !mobileOpen) toggleCollapsed();
  };

  // Libellés visibles dès qu'on n'est pas en mode "replié icônes" desktop
  // — et TOUJOURS visibles dans le tiroir mobile, même si "collapsed" est
  // resté vrai depuis une session desktop précédente (localStorage).
  const showLabels = mobileOpen || !collapsed;

  const isChildActive = (children) =>
    children?.some((c) => location.pathname.startsWith(c.path));

  return (
    <>
      {mobileOpen && (
        <div className={styles.backdrop} onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}>
      <button
        type="button"
        className={`${styles.collapseBtn} ${collapsed ? styles.collapsed : ''}`}
        onClick={toggleCollapsed}
        title={collapsed ? 'Déplier le menu' : 'Replier le menu'}
        aria-label={collapsed ? 'Déplier le menu' : 'Replier le menu'}
      >
        <ChevronLeft size={13} strokeWidth={2.4} />
      </button>

      <div className={styles.logo}>
        <picture>
          <source srcSet="/site/logo-64.webp" type="image/webp" />
          <img className={styles.logoMark} src="/site/logo-64.png" alt="kabakaba" />
        </picture>
        {showLabels && (
          <div>
            <div className={styles.logoText}>
              kaba<span>kaba</span>
            </div>
            <div className={styles.logoSub}>{subtitle}</div>
          </div>
        )}
      </div>

      <nav className={styles.nav}>
        {sections.map((section) => (
          <div className={styles.section} key={section.label}>
            <div className={styles.sectionLabel}>{showLabels && section.label}</div>
            {section.items.map((item) => {
              const Icon = item.icon;

              if (!item.children) {
                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    title={!showLabels ? item.label : undefined}
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `${styles.navItem} ${isActive ? styles.active : ''}`
                    }
                  >
                    <Icon size={18} strokeWidth={2} className={styles.navIcon} />
                    {showLabels && <span className={styles.navLabel}>{item.label}</span>}
                  </NavLink>
                );
              }

              const open = showLabels && !!openGroups[item.label];
              const parentActive = isChildActive(item.children);
              return (
                <div key={item.label}>
                  <button
                    type="button"
                    title={!showLabels ? item.label : undefined}
                    className={`${styles.navItem} ${styles.navItemButton} ${
                      parentActive ? styles.parentActive : ''
                    }`}
                    onClick={() => toggleGroup(item.label)}
                    aria-expanded={open}
                  >
                    <Icon size={18} strokeWidth={2} className={styles.navIcon} />
                    {showLabels && (
                      <>
                        <span className={styles.navLabel}>{item.label}</span>
                        <ChevronDown
                          size={14}
                          className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
                        />
                      </>
                    )}
                  </button>
                  {showLabels && (
                    <div className={styles.subNav} style={{ maxHeight: open ? '240px' : '0' }}>
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          onClick={handleLinkClick}
                          className={({ isActive }) =>
                            `${styles.subNavItem} ${isActive ? styles.active : ''}`
                          }
                        >
                          {child.label}
                          {child.count > 0 && (
                            <span className="nav-count-badge">{child.count}</span>
                          )}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={styles.bottom}>
        <div className={styles.avatar}>{getInitials(user?.name || 'U')}</div>
        {showLabels && (
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user?.name || 'Utilisateur'}</div>
            <div className={styles.userRole}>{user?.role || ''}</div>
          </div>
        )}
        <button className={styles.logoutBtn} onClick={onLogout} title="Déconnexion">
          <LogOut size={16} strokeWidth={2} />
        </button>
      </div>
    </aside>
    </>
  );
}
