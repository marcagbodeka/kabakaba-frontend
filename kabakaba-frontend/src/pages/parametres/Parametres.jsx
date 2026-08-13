import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';
import { useAuth } from '../../context/AuthContext';
import { listMyWithdrawals, requestWithdrawal } from '../../services/domain/payrollService';

function formatFcfa(n) {
  return `${Number(n).toLocaleString('fr-FR')} FCFA`;
}

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const STATUS_LABEL = { PENDING: 'En attente', COMPLETED: 'Effectué', FAILED: 'Rejeté / échec' };

export default function Parametres() {
  const { user, refreshMe } = useAuth();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loadingWd, setLoadingWd] = useState(true);
  const [amount, setAmount] = useState('');
  const [payoutNumber, setPayoutNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    refreshMe().catch(() => {});
  }, [refreshMe]);

  useEffect(() => {
    (async () => {
      setLoadingWd(true);
      try {
        setWithdrawals(await listMyWithdrawals());
      } catch {
        setWithdrawals([]);
      } finally {
        setLoadingWd(false);
      }
    })();
  }, []);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      await requestWithdrawal(Number(amount), payoutNumber.trim());
      setSuccess('Demande enregistrée — en attente de validation Supervision.');
      setAmount('');
      setWithdrawals(await listMyWithdrawals());
      await refreshMe();
    } catch (err) {
      setError(err.message || 'Impossible de créer la demande.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Topbar icon={Settings} breadcrumb={[{ label: 'Paramètres' }]} />
      <PageContent>
        <div className="page-header">
      <div className="eyebrow">Supervision · Paramètres</div>
          <h1>Paramètres</h1>
          <p>Profil connecté, solde de paie et demandes de retrait</p>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">Profil</div>
          {user ? (
            <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.7 }}>
              <div>
                <strong>
                  {user.firstName} {user.lastName}
                </strong>{' '}
                · {user.role}
              </div>
              <div style={{ color: 'var(--muted)' }}>{user.email}</div>
              <div style={{ marginTop: 8 }}>
                2FA : {user.twoFaEnabled ? <span className="badge-green">Activé</span> : <span className="badge-orange">Non configuré</span>}
              </div>
              <div>
                Solde paie : <strong>{formatFcfa(user.balance ?? 0)}</strong>
              </div>
              {user.payoutNumber && (
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Numéro payout enregistré : {user.payoutNumber}</div>
              )}
            </div>
          ) : (
            <p style={{ marginTop: 12, color: 'var(--muted)' }}>Chargement du profil…</p>
          )}
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">Demander un retrait</div>
          <div className="card-sub">Le montant est débité immédiatement en attente ; validation Supervision requise</div>
          <form onSubmit={handleWithdraw} style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
            <label style={{ fontSize: 13 }}>
              Montant (FCFA)
              <input type="number" min={1} required value={amount} onChange={(e) => setAmount(e.target.value)} style={{ display: 'block', width: '100%', marginTop: 4 }} />
            </label>
            <label style={{ fontSize: 13 }}>
              Numéro Mobile Money
              <input
                type="tel"
                required
                placeholder="+228…"
                value={payoutNumber}
                onChange={(e) => setPayoutNumber(e.target.value)}
                style={{ display: 'block', width: '100%', marginTop: 4 }}
              />
            </label>
            {error && <div style={{ color: '#EF4444', fontSize: 13 }}>{error}</div>}
            {success && <div style={{ color: '#16A34A', fontSize: 13 }}>{success}</div>}
            <button type="submit" className="btn-secondary-sm" disabled={submitting}>
              {submitting ? 'Envoi…' : 'Soumettre la demande'}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-title">Mes demandes de retrait</div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Montant</th>
                  <th>Numéro</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loadingWd && (
                  <tr>
                    <td colSpan={4}>Chargement...</td>
                  </tr>
                )}
                {!loadingWd && withdrawals.length === 0 && (
                  <tr>
                    <td colSpan={4}>Aucune demande.</td>
                  </tr>
                )}
                {!loadingWd &&
                  withdrawals.map((w) => (
                    <tr key={w.id}>
                      <td>{formatFcfa(w.amount)}</td>
                      <td>{w.payoutNumber}</td>
                      <td>{STATUS_LABEL[w.status] ?? w.status}</td>
                      <td>{formatDateTime(w.requestedAt)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </PageContent>
    </>
  );
}
