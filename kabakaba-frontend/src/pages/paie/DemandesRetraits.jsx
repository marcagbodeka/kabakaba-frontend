import { useEffect, useState } from 'react';
import { ArrowDownToLine } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';
import { approveWithdrawal, listAllWithdrawals, rejectWithdrawal } from '../../services/domain/payrollService';

function formatFcfa(n) {
  return `${Number(n).toLocaleString('fr-FR')} FCFA`;
}

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const STATUS_LABEL = { PENDING: 'En attente', COMPLETED: 'Effectué', FAILED: 'Rejeté / échec' };
const STATUS_BADGE = { PENDING: 'badge-orange', COMPLETED: 'badge-green', FAILED: 'badge-red' };

export default function DemandesRetraits() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listAllWithdrawals());
    } catch (err) {
      setError(err.message || 'Impossible de charger les demandes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('Valider cette demande et envoyer le payout FedaPay ?')) return;
    setActionError(null);
    setBusyId(id);
    try {
      await approveWithdrawal(id);
      await load();
    } catch (err) {
      setActionError(err.message || 'Validation impossible.');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Motif du rejet (obligatoire) :');
    if (!reason?.trim()) return;
    setActionError(null);
    setBusyId(id);
    try {
      await rejectWithdrawal(id, reason.trim());
      await load();
    } catch (err) {
      setActionError(err.message || 'Rejet impossible.');
    } finally {
      setBusyId(null);
    }
  };

  const pendingCount = items.filter((i) => i.status === 'PENDING').length;

  return (
    <>
      <Topbar
        icon={ArrowDownToLine}
        breadcrumb={[{ label: 'Paie', path: '/supervision/paie/config' }, { label: 'Demandes de retrait' }]}
        badge={pendingCount > 0 ? { text: `${pendingCount} en attente`, tone: 'orange' } : undefined}
      />
      <PageContent>
        <div className="page-header">
          <h1>Demandes de retrait (paie)</h1>
          <p>Validation Supervision des retraits sur solde WebUser — déclenche un payout Mobile Money</p>
        </div>

        {error && (
          <div className="card" style={{ borderColor: '#EF4444', color: '#EF4444', marginBottom: 16 }}>
            {error}
          </div>
        )}
        {actionError && (
          <div className="card" style={{ borderColor: '#EF4444', color: '#EF4444', marginBottom: 16 }}>
            {actionError}
          </div>
        )}

        <div className="card">
          <div className="card-title">Toutes les demandes</div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Demandeur</th>
                  <th>Montant</th>
                  <th>Numéro payout</th>
                  <th>Statut</th>
                  <th>Demandé le</th>
                  <th>Traité par</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7}>Chargement...</td>
                  </tr>
                )}
                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan={7}>Aucune demande.</td>
                  </tr>
                )}
                {!loading &&
                  items.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <strong>
                          {r.webUser?.firstName} {r.webUser?.lastName}
                        </strong>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.webUser?.email}</div>
                      </td>
                      <td>{formatFcfa(r.amount)}</td>
                      <td>{r.payoutNumber}</td>
                      <td>
                        <span className={STATUS_BADGE[r.status] ?? 'badge-gray'}>{STATUS_LABEL[r.status] ?? r.status}</span>
                        {r.rejectionReason && (
                          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{r.rejectionReason}</div>
                        )}
                      </td>
                      <td>{formatDateTime(r.requestedAt)}</td>
                      <td>
                        {r.processedBy ? `${r.processedBy.firstName} ${r.processedBy.lastName}` : '—'}
                        {r.processedAt && (
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{formatDateTime(r.processedAt)}</div>
                        )}
                      </td>
                      <td>
                        {r.status === 'PENDING' && (
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button type="button" className="action-btn" disabled={busyId === r.id} onClick={() => handleApprove(r.id)}>
                              Valider
                            </button>
                            <button type="button" className="btn-secondary-sm" disabled={busyId === r.id} onClick={() => handleReject(r.id)}>
                              Rejeter
                            </button>
                          </div>
                        )}
                      </td>
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
