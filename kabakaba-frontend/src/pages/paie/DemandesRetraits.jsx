import { useEffect, useMemo, useState } from 'react';
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

// PROCESSING = validé par la Supervision, payout envoyé à FedaPay, en attente
// de confirmation (webhook). Tant que ce n'est pas COMPLETED ou FAILED, l'argent
// est en transit : aucune action possible sur ces lignes.
const STATUS_LABEL = {
  PENDING: 'À valider',
  PROCESSING: 'Envoyé à FedaPay',
  COMPLETED: 'Payé',
  FAILED: 'Rejeté / échec',
};
const STATUS_BADGE = {
  PENDING: 'badge-orange',
  PROCESSING: 'badge-amber',
  COMPLETED: 'badge-green',
  FAILED: 'badge-red',
};
const STATUS_HINT = {
  PROCESSING: "En transit chez FedaPay — le statut passera automatiquement à \"Payé\" ou \"Échec\" dès confirmation.",
};

const TABS = [
  { key: 'PENDING', label: 'À valider' },
  { key: 'PROCESSING', label: 'En cours chez FedaPay' },
  { key: 'HISTORY', label: 'Historique (payés / échecs)' },
  { key: 'ALL', label: 'Toutes' },
];

export default function DemandesRetraits() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [tab, setTab] = useState('PENDING');

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
    if (!window.confirm('Valider cette demande et envoyer le payout FedaPay ? Cette action est irréversible et déclenche un vrai transfert d\'argent.')) return;
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

  const counts = useMemo(() => {
    const c = { PENDING: 0, PROCESSING: 0, COMPLETED: 0, FAILED: 0 };
    for (const r of items) if (c[r.status] !== undefined) c[r.status] += 1;
    return c;
  }, [items]);

  const pendingAmount = useMemo(
    () => items.filter((i) => i.status === 'PENDING').reduce((sum, i) => sum + Number(i.amount), 0),
    [items],
  );

  const visibleItems = useMemo(() => {
    if (tab === 'ALL') return items;
    if (tab === 'HISTORY') return items.filter((i) => i.status === 'COMPLETED' || i.status === 'FAILED');
    return items.filter((i) => i.status === tab);
  }, [items, tab]);

  return (
    <>
      <Topbar
        icon={ArrowDownToLine}
        breadcrumb={[{ label: 'Paie', path: '/supervision/paie/config' }, { label: 'Demandes de retrait' }]}
        badge={counts.PENDING > 0 ? { text: `${counts.PENDING} à valider`, tone: 'orange' } : undefined}
      />
      <PageContent>
        <div className="page-header">
          <h1>Demandes de retrait (paie)</h1>
          <p>Valide un retrait pour déclencher un vrai transfert Mobile Money via FedaPay — action irréversible</p>
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

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">À valider</div>
            <div className="kpi-value kpi-value-sm">{loading ? '—' : counts.PENDING}</div>
            <div className="kpi-sub">{loading ? '' : formatFcfa(pendingAmount)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">En cours chez FedaPay</div>
            <div className="kpi-value kpi-value-sm">{loading ? '—' : counts.PROCESSING}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Payés</div>
            <div className="kpi-value kpi-value-sm">{loading ? '—' : counts.COMPLETED}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Échecs / rejets</div>
            <div className="kpi-value kpi-value-sm">{loading ? '—' : counts.FAILED}</div>
          </div>
        </div>

        <div className="filter-pills">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`filter-pill ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {t.key !== 'ALL' && t.key !== 'HISTORY' && counts[t.key] > 0 ? ` (${counts[t.key]})` : ''}
            </button>
          ))}
        </div>

        <div className="card">
          <div className="card-title">
            {TABS.find((t) => t.key === tab)?.label}
          </div>
          <div className="card-sub">
            {tab === 'PENDING' && "Ces demandes attendent ta validation. Vérifie le numéro Mobile Money avant de valider."}
            {tab === 'PROCESSING' && "Payout déjà envoyé à FedaPay pour ces demandes — aucune action possible, en attente de confirmation."}
            {tab === 'HISTORY' && "Demandes déjà finalisées (payées ou en échec)."}
            {tab === 'ALL' && "Toutes les demandes, tous statuts confondus."}
          </div>
          <div className="table-scroll" style={{ marginTop: 12 }}>
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
                {!loading && visibleItems.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      {tab === 'PENDING' ? 'Aucune demande à valider pour le moment.' : 'Aucune demande dans cette catégorie.'}
                    </td>
                  </tr>
                )}
                {!loading &&
                  visibleItems.map((r) => (
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
                        {STATUS_HINT[r.status] && (
                          <div style={{ fontSize: 11.5, color: 'var(--muted-light)', marginTop: 4, maxWidth: 220 }}>
                            {STATUS_HINT[r.status]}
                          </div>
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
                              {busyId === r.id ? '…' : 'Valider'}
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