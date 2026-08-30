import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronLeft, LogOut } from 'lucide-react';
import styles from './Sidebar.module.css';

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
    // Si le menu est replié, un clic sur un groupe le déplie d'abord pour
    // que le libellé et les sous-items redeviennent visibles.
    if (collapsed) {
      toggleCollapsed();
      setOpenGroups((prev) => ({ ...prev, [label]: true }));
      return;
    }
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLinkClick = () => {
    if (collapsed) toggleCollapsed();
  };

  const isChildActive = (children) =>
    children?.some((c) => location.pathname.startsWith(c.path));

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
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
        {!collapsed && (
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
            <div className={styles.sectionLabel}>{!collapsed && section.label}</div>
            {section.items.map((item) => {
              const Icon = item.icon;

              if (!item.children) {
                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `${styles.navItem} ${isActive ? styles.active : ''}`
                    }
                  >
                    <Icon size={18} strokeWidth={2} className={styles.navIcon} />
                    {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                  </NavLink>
                );
              }

              const open = !collapsed && !!openGroups[item.label];
              const parentActive = isChildActive(item.children);
              return (
                <div key={item.label}>
                  <button
                    type="button"
                    title={collapsed ? item.label : undefined}
                    className={`${styles.navItem} ${styles.navItemButton} ${
                      parentActive ? styles.parentActive : ''
                    }`}
                    onClick={() => toggleGroup(item.label)}
                    aria-expanded={open}
                  >
                    <Icon size={18} strokeWidth={2} className={styles.navIcon} />
                    {!collapsed && (
                      <>
                        <span className={styles.navLabel}>{item.label}</span>
                        <ChevronDown
                          size={14}
                          className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
                        />
                      </>
                    )}
                  </button>
                  {!collapsed && (
                    <div className={styles.subNav} style={{ maxHeight: open ? '240px' : '0' }}>
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
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
        {!collapsed && (
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
  );
}
