import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  Settings,
  UserPlus,
  Utensils,
  Star,
  ShieldAlert,
  Trophy,
  CheckCircle2,
  Menu,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTodayEvents } from '../services/domain/adminStatsService';
import { TOGGLE_MOBILE_NAV_EVENT } from './Sidebar';
import styles from './Topbar.module.css';

const PERIOD_OPTIONS = ['Aujourd\'hui', '7 jours', '30 jours'];

const EVENT_ICON_BY_TYPE = {
  NEW_STUDENT: UserPlus,
  NEW_VENDOR: Utensils,
  BAD_REVIEW: Star,
  SUSPENSION: ShieldAlert,
  NEW_AMBASSADOR: Trophy,
  DISPUTE_RESOLVED: CheckCircle2,
};

function formatRelativeTime(isoDate) {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleToggle() {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen && events === null) {
      setLoading(true);
      setError(null);
      try {
        const data = await getTodayEvents();
        setEvents(data?.events ?? []);
      } catch (err) {
        setError(err.message || 'Impossible de charger les notifications.');
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className={styles.notifWrap} ref={wrapRef}>
      <button type="button" className={styles.iconBtn} title="Notifications" onClick={handleToggle}>
        <Bell size={18} />
        {events && events.length > 0 && <span className={styles.notifDot} />}
      </button>

      {open && (
        <div className={styles.notifPanel}>
          <div className={styles.notifHeader}>
            <span>Notifications</span>
            <span className={styles.notifHeaderSub}>Aujourd'hui</span>
          </div>

          <div className={styles.notifList}>
            {loading && <div className={styles.notifEmpty}>Chargement…</div>}
            {error && <div className={styles.notifEmpty}>{error}</div>}
            {!loading && !error && events && events.length === 0 && (
              <div className={styles.notifEmpty}>Aucun évènement pour l'instant aujourd'hui.</div>
            )}
            {!loading && !error && events && events.map((evt) => {
              const Icon = EVENT_ICON_BY_TYPE[evt.type] ?? Bell;
              return (
                <div key={evt.id} className={styles.notifItem}>
                  <span className={styles.notifItemIcon}>
                    <Icon size={15} />
                  </span>
                  <div className={styles.notifItemBody}>
                    <div className={styles.notifItemMsg}>{evt.message}</div>
                    <div className={styles.notifItemTime}>{formatRelativeTime(evt.occurredAt)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Topbar réutilisable pour toutes les pages du dashboard.
 *
 * Props :
 * - icon: composant icône lucide-react affiché à gauche
 * - breadcrumb: [{ label, path? }] — le dernier élément est toujours en gras, non-cliquable
 * - badge: { text, tone: 'default' | 'red' } — pastille d'info (ex: "Aujourd'hui", "3 suspensions actives")
 * - periodOptions: liste des options du sélecteur de période (défaut: Aujourd'hui / 7 jours / 30 jours)
 * - hidePeriodSelect: masque le sélecteur de période par défaut (ex: page qui fournit son propre contrôle via children)
 * - children: contrôles à droite (select campus, sélecteur de plage personnalisé...) insérés avant les icônes fixes
 */
export default function Topbar({
  icon: Icon,
  breadcrumb = [],
  badge,
  periodOptions = PERIOD_OPTIONS,
  hidePeriodSelect = false,
  children,
}) {
  return (
    <div className={styles.topbar}>
      <button
        type="button"
        className={styles.menuBtn}
        onClick={() => window.dispatchEvent(new CustomEvent(TOGGLE_MOBILE_NAV_EVENT))}
        title="Ouvrir le menu"
        aria-label="Ouvrir le menu"
      >
        <Menu size={20} />
      </button>

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
        {!hidePeriodSelect && (
          <select className={styles.topbarSelect} defaultValue={periodOptions[0]} aria-label="Période">
            {periodOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
        <NotificationsBell />
        <button type="button" className={styles.iconBtn} title="Paramètres">
          <Settings size={18} />
        </button>
      </div>
    </div>
  );
}
