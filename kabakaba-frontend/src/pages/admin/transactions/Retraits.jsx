import { useEffect, useState } from 'react';
import { Banknote, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';
import DateRangePicker from '../../../components/DateRangePicker';
import { getWithdrawals, getWithdrawalsStats } from '../../../services/domain/withdrawalsService';

const PAGE_SIZE = 10;

const STATUS_LABEL = {
  PENDING: 'En attente',
  PROCESSING: 'En cours',
  COMPLETED: 'Versé',
  FAILED: 'Non abouti',
  CANCELLED: 'Annulé',
};
const STATUS_TONE = {
  PENDING: 'badge-amber',
  PROCESSING: 'badge-blue',
  COMPLETED: 'badge-green',
  FAILED: 'badge-gray',
  CANCELLED: 'badge-red',
};

function formatFcfa(n) {
  return `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;
}
function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
function startOfDay(d) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return startOfDay(d);
}

export default function Retraits() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [range, setRange] = useState({ from: daysAgo(29), to: startOfDay(new Date()) });
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

  useEffect(() => { setPage(1); }, [statusFilter, range]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getWithdrawals(page, PAGE_SIZE, statusFilter, range)
      .then((res) => { setWithdrawals(res.data || []); setMeta(res.meta || { total: 0, totalPages: 1 }); })
      .catch((err) => setError(err.message || 'Impossible de charger les retraits.'))
      .finally(() => setLoading(false));
  }, [page, statusFilter, range]);

  return (
    <>
      <Topbar icon={Banknote} breadcrumb={[{ label: 'Retraits' }]} hidePeriodSelect>
        <DateRangePicker value={range} onChange={setRange} />
      </Topbar>
      <PageContent>
        <div className="page-header">
          <div className="eyebrow">Admin web · Monitoring</div>
          <h1>Retraits</h1>
          <p>Traitement manuel des demandes de retrait vendeur. L&apos;administrateur effectue le transfert USSD et dépose la preuve.</p>
        </div>

        {error && <div className="notice-banner notice-error">{error}</div>}
        {statsError && <div className="notice-banner notice-error">{statsError}</div>}

        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          {[
            ['En attente', 'pending', 'var(--amber)'],
            ['En cours', 'processing', 'var(--indigo)'],
            ['Versés', 'completed', '#22C55E'],
            ['Non aboutis', 'failed', '#DC2626'],
            ['Annulés', 'cancelled', '#64748B'],
          ].map(([label, key, color]) => (
            <div className="kpi-card" key={key}>
              <div className="kpi-label">{label}</div>
              <div className="kpi-value" style={{ color }}>{stats ? formatFcfa(stats[key]?.total) : '…'}</div>
              <div className="kpi-sub">{stats ? `${stats[key]?.count || 0} retrait${stats[key]?.count === 1 ? '' : 's'}` : '—'}</div>
            </div>
          ))}
        </div>

        <div className="filter-bar">
          <div className="filter-group">
            <label className="filter-label">Statut</label>
            <div className="tab-pills" style={{ flexWrap: 'wrap' }}>
              {[
                ['all', 'Tous'], ['PENDING', 'En attente'], ['PROCESSING', 'En cours'],
                ['COMPLETED', 'Versés'], ['FAILED', 'Non aboutis'], ['CANCELLED', 'Annulés'],
              ].map(([value, label]) => (
                <button key={value} className={`pill${statusFilter === value ? ' active' : ''}`} onClick={() => setStatusFilter(value)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Vendeur / Cantine</th>
                  <th>Téléphone</th>
                  <th>Brut demandé</th>
                  <th>Frais retenus</th>
                  <th>Net à envoyer</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={8} style={{ padding: '24px 0', color: 'var(--muted)' }}>Chargement…</td></tr>}
                {!loading && withdrawals.length === 0 && <tr><td colSpan={8} style={{ padding: '24px 0', color: 'var(--muted)' }}>Aucun retrait ne correspond à ce filtre.</td></tr>}
                {!loading && withdrawals.map((w) => (
                  <tr key={w.id} onClick={() => navigate(`/admin/retraits/${encodeURIComponent(w.id)}`)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 600 }}>
                      {w.vendor?.canteenName || '—'}
                      <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 400 }}>
                        {`${w.vendor?.user?.firstName || ''} ${w.vendor?.user?.lastName || ''}`.trim() || '—'}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{w.vendor?.user?.phone || '—'}</td>
                    <td>{formatFcfa(w.amount)}</td>
                    <td style={{ color: 'var(--muted)' }}>{formatFcfa(w.feeRetained)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--indigo)' }}>{formatFcfa(w.payoutAmount ?? w.amount)}</td>
                    <td><span className={STATUS_TONE[w.status] || 'badge-gray'}>{STATUS_LABEL[w.status] || w.status}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>{formatDateTime(w.createdAt)}</td>
                    <td><button className="icon-btn" title="Voir le détail" aria-label="Voir le détail" onClick={(e) => { e.stopPropagation(); navigate(`/admin/retraits/${encodeURIComponent(w.id)}`); }}><Eye size={15} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
            <span>Affichage {meta.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, meta.total)} sur {meta.total} retrait{meta.total === 1 ? '' : 's'}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="icon-btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>←</button>
              {Array.from({ length: Math.min(meta.totalPages || 1, 7) }, (_, i) => i + 1).map((n) => (
                <button key={n} className="icon-btn" style={n === page ? { background: 'var(--indigo)', color: '#fff', borderColor: 'var(--indigo)' } : undefined} onClick={() => setPage(n)}>{n}</button>
              ))}
              <button className="icon-btn" disabled={page >= (meta.totalPages || 1)} onClick={() => setPage((p) => Math.min(meta.totalPages || 1, p + 1))}>→</button>
            </div>
          </div>
        </div>
      </PageContent>
    </>
  );
}
