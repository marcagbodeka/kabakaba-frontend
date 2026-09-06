import { useEffect, useState } from 'react';
import { Banknote } from 'lucide-react';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';
import { getWithdrawals, getWithdrawalsStats } from '../../../services/domain/withdrawalsService';

const PAGE_SIZE = 10;

const STATUS_LABEL = {
  PENDING: 'En attente',
  PROCESSING: 'En cours',
  COMPLETED: 'Versé',
  FAILED: 'Échoué',
};
const STATUS_TONE = {
  PENDING: 'badge-amber',
  PROCESSING: 'badge-blue',
  COMPLETED: 'badge-green',
  FAILED: 'badge-gray',
};

function formatFcfa(n) {
  return `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;
}
function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function Retraits() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(null);

  useEffect(() => {
    getWithdrawalsStats().then(setStats).catch((err) => setStatsError(err.message));
  }, []);

  useEffect(() => { setPage(1); }, [statusFilter]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getWithdrawals(page, PAGE_SIZE, statusFilter)
      .then((res) => { setWithdrawals(res.data); setMeta(res.meta); })
      .catch((err) => setError(err.message || 'Impossible de charger les retraits.'))
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  return (
    <>
      <Topbar icon={Banknote} breadcrumb={[{ label: 'Retraits' }]} />
      <PageContent>
        <div className="page-header">
          <div className="eyebrow">Admin web · Monitoring</div>
          <h1>Retraits</h1>
          <p>Récapitulatif des retraits vendeur — le versement (payout) est automatique, ceci n&apos;est pas un outil de traitement manuel.</p>
        </div>

        {error && <div className="notice-banner notice-error">{error}</div>}
        {statsError && <div className="notice-banner notice-error">{statsError}</div>}

        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <div className="kpi-card">
            <div className="kpi-label">En attente</div>
            <div className="kpi-value" style={{ color: 'var(--amber)' }}>{stats ? formatFcfa(stats.pending.total) : '…'}</div>
            <div className="kpi-sub">{stats ? `${stats.pending.count} retrait${stats.pending.count === 1 ? '' : 's'}` : '—'}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">En cours</div>
            <div className="kpi-value" style={{ color: 'var(--indigo)' }}>{stats ? formatFcfa(stats.processing.total) : '…'}</div>
            <div className="kpi-sub">{stats ? `${stats.processing.count} retrait${stats.processing.count === 1 ? '' : 's'}` : '—'}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Versés</div>
            <div className="kpi-value" style={{ color: '#22C55E' }}>{stats ? formatFcfa(stats.completed.total) : '…'}</div>
            <div className="kpi-sub">{stats ? `${stats.completed.count} retrait${stats.completed.count === 1 ? '' : 's'}` : '—'}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Échoués</div>
            <div className="kpi-value" style={{ color: '#DC2626' }}>{stats ? formatFcfa(stats.failed.total) : '…'}</div>
            <div className="kpi-sub">{stats ? `${stats.failed.count} retrait${stats.failed.count === 1 ? '' : 's'}` : '—'}</div>
          </div>
        </div>

        <div className="filter-bar">
          <div className="filter-group">
            <label className="filter-label">Statut</label>
            <div className="tab-pills">
              <button className={`pill${statusFilter === 'all' ? ' active' : ''}`} onClick={() => setStatusFilter('all')}>Tous</button>
              <button className={`pill${statusFilter === 'PENDING' ? ' active' : ''}`} onClick={() => setStatusFilter('PENDING')}>En attente</button>
              <button className={`pill${statusFilter === 'PROCESSING' ? ' active' : ''}`} onClick={() => setStatusFilter('PROCESSING')}>En cours</button>
              <button className={`pill${statusFilter === 'COMPLETED' ? ' active' : ''}`} onClick={() => setStatusFilter('COMPLETED')}>Versés</button>
              <button className={`pill${statusFilter === 'FAILED' ? ' active' : ''}`} onClick={() => setStatusFilter('FAILED')}>Échoués</button>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Cantine</th>
                  <th>Montant demandé</th>
                  <th>Frais FedaPay</th>
                  <th>Frais cash</th>
                  <th>Débité du solde</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} style={{ padding: '24px 0', color: 'var(--muted)' }}>Chargement…</td></tr>
                )}
                {!loading && withdrawals.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: '24px 0', color: 'var(--muted)' }}>Aucun retrait ne correspond à ce filtre.</td></tr>
                )}
                {!loading && withdrawals.map((w) => (
                  <tr key={w.id}>
                    <td style={{ fontWeight: 600 }}>{w.vendor?.canteenName || '—'}</td>
                    <td>{formatFcfa(w.amount)}</td>
                    <td style={{ color: 'var(--muted)' }}>{formatFcfa(w.operatorFee)}</td>
                    <td style={{ color: 'var(--muted)' }}>{formatFcfa(w.platformFee)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--indigo)' }}>{formatFcfa(w.debitedAmount)}</td>
                    <td><span className={STATUS_TONE[w.status] || 'badge-gray'}>{STATUS_LABEL[w.status] || w.status}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>{formatDateTime(w.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
            <span>Affichage {meta.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, meta.total)} sur {meta.total} retrait{meta.total === 1 ? '' : 's'}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="icon-btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>←</button>
              {Array.from({ length: Math.min(meta.totalPages, 7) }, (_, i) => i + 1).map((n) => (
                <button key={n} className="icon-btn" style={n === page ? { background: 'var(--indigo)', color: '#fff', borderColor: 'var(--indigo)' } : undefined} onClick={() => setPage(n)}>{n}</button>
              ))}
              <button className="icon-btn" disabled={page >= meta.totalPages} onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}>→</button>
            </div>
          </div>
        </div>
      </PageContent>
    </>
  );
}
