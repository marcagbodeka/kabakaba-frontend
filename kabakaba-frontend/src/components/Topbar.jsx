import { Bell, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Topbar.module.css';

const PERIOD_OPTIONS = ['Aujourd\'hui', '7 jours', '30 jours'];

/**
 * Topbar réutilisable pour toutes les pages du dashboard.
 *
 * Props :
 * - icon: composant icône lucide-react affiché à gauche
 * - breadcrumb: [{ label, path? }] — le dernier élément est toujours en gras, non-cliquable
 * - badge: { text, tone: 'default' | 'red' } — pastille d'info (ex: "Aujourd'hui", "3 suspensions actives")
 * - periodOptions: liste des options du sélecteur de période (défaut: Aujourd'hui / 7 jours / 30 jours)
 * - children: contrôles à droite (select campus...) insérés avant les icônes fixes
 */
export default function Topbar({
  icon: Icon,
  breadcrumb = [],
  badge,
  periodOptions = PERIOD_OPTIONS,
  children,
}) {
  return (
    <div className={styles.topbar}>
      {Icon && (
        <span className={styles.iconWrap}>
          <Icon size={18} />
        </span>
      )}

      <span className={styles.breadcrumb}>
        {breadcrumb.map((crumb, i) => {
          const isLast = i === breadcrumb.length - 1;
          return (
            <span key={crumb.label} className={styles.crumbGroup}>
              {i > 0 && <span className={styles.sep}>/</span>}
              {crumb.path && !isLast ? (
                <Link to={crumb.path} className={styles.link}>
                  {crumb.label}
                </Link>
              ) : (
                <span className={isLast ? styles.current : undefined}>
                  {crumb.label}
                </span>
              )}
            </span>
          );
        })}
      </span>

      {badge && (
        <span className={`${styles.badge} ${badge.tone === 'red' ? styles.badgeRed : ''}`}>
          {badge.text}
        </span>
      )}

      <div className={styles.right}>
        {children}
        <select className={styles.topbarSelect} defaultValue={periodOptions[0]} aria-label="Période">
          {periodOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button type="button" className={styles.iconBtn} title="Notifications">
          <Bell size={18} />
        </button>
        <button type="button" className={styles.iconBtn} title="Paramètres">
          <Settings size={18} />
        </button>
      </div>
    </div>
  );
}
