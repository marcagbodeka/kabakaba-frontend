import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import styles from './Toast.module.css';

/**
 * Notification ponctuelle en superposition (coin haut-droit), indépendante du
 * défilement de la page — contrairement à un message inline qui peut se
 * retrouver hors champ si l'utilisateur a scrollé avant de soumettre.
 *
 * Usage :
 *   const [toast, setToast] = useState(null); // { type: 'error'|'success', message }
 *   ...
 *   catch (err) { setToast({ type: 'error', message: err.message }); }
 *   ...
 *   <Toast toast={toast} onClose={() => setToast(null)} />
 */
export default function Toast({ toast, onClose, duration = 7000 }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [toast, duration, onClose]);

  if (!toast) return null;
  const isError = toast.type !== 'success';
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <div className={`${styles.toast} ${isError ? styles.error : styles.success}`} role="alert">
      <Icon size={19} className={styles.icon} />
      <span className={styles.message}>{toast.message}</span>
      <button type="button" className={styles.close} onClick={onClose} aria-label="Fermer la notification">
        <X size={14} />
      </button>
    </div>
  );
}
