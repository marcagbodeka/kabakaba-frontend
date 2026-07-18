import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, LogOut } from 'lucide-react';
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
export default function Sidebar({ sections, subtitle, user, onLogout }) {
  const location = useLocation();
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

  const toggleGroup = (label) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isChildActive = (children) =>
    children?.some((c) => location.pathname.startsWith(c.path));

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoText}>
          kaba<span>kaba</span>
        </div>
        <div className={styles.logoSub}>{subtitle}</div>
      </div>

      <nav className={styles.nav}>
        {sections.map((section) => (
          <div className={styles.section} key={section.label}>
            <div className={styles.sectionLabel}>{section.label}</div>
            {section.items.map((item) => {
              const Icon = item.icon;

              if (!item.children) {
                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    className={({ isActive }) =>
                      `${styles.navItem} ${isActive ? styles.active : ''}`
                    }
                  >
                    <Icon size={16} strokeWidth={2} className={styles.navIcon} />
                    {item.label}
                  </NavLink>
                );
              }

              const open = !!openGroups[item.label];
              const parentActive = isChildActive(item.children);
              return (
                <div key={item.label}>
                  <button
                    type="button"
                    className={`${styles.navItem} ${styles.navItemButton} ${
                      parentActive ? styles.parentActive : ''
                    }`}
                    onClick={() => toggleGroup(item.label)}
                    aria-expanded={open}
                  >
                    <Icon size={16} strokeWidth={2} className={styles.navIcon} />
                    <span className={styles.navLabel}>{item.label}</span>
                    <ChevronDown
                      size={14}
                      className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
                    />
                  </button>
                  <div
                    className={styles.subNav}
                    style={{ maxHeight: open ? '240px' : '0' }}
                  >
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
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={styles.bottom}>
        <div className={styles.avatar}>{getInitials(user?.name || 'U')}</div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>{user?.name || 'Utilisateur'}</div>
          <div className={styles.userRole}>{user?.role || ''}</div>
        </div>
        <button className={styles.logoutBtn} onClick={onLogout} title="Déconnexion">
          <LogOut size={16} strokeWidth={2} />
        </button>
      </div>
    </aside>
  );
}
