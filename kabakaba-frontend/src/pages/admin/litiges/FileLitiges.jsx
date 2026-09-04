import { useEffect, useState } from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';
import { getDisputesStats, getDisputes } from '../../../services/domain/disputesService';
import { findAllCampuses } from '../../../services/domain/campusesService';

const PAGE_SIZE = 10;

const STATUS_PILLS = [
  { key: 'all', label: 'Tous' },
  { key: 'OPEN', label: 'Ouverts' },
  { key: 'IN_PROGRESS', label: 'En cours' },
  { key: 'RESOLVED', label: 'Traités' },
];
const STATUS_LABEL = { OPEN: 'Ouvert', IN_PROGRESS: 'En cours', RESOLVED: 'Traité' };
const STATUS_STYLE = {
  OPEN: { background: '#FEE2E2', color: '#B91C1C' },
  IN_PROGRESS: { background: '#FFEDD5', color: '#C2410C' },
};
const URGENCY_COLOR = { OPEN: '#EF4444', IN_PROGRESS: 'var(--orange)', RESOLVED: '#22C55E' };
const ACTION_LABEL = { OPEN: 'Traiter →', IN_PROGRESS: 'Continuer →', RESOLVED: 'Voir →' };

function initialsOf(name) {
  return (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';
}
function formatAmount(n) {
  return n != null ? `${Number(n).toLocaleString('fr-FR')} tickets` : '—';
}
function timeAgo(iso) {
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (hours < 1) return "À l'instant";
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'Hier' : `Il y a ${days}j`;
}
function formatDelay(minutes) {
  if (minutes == null) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${m} min`;
}

export default function FileLitiges() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [campuses, setCampuses] = useState([]);

  const [statusFilter, setStatusFilter] = useState('all');
  const [campusFilter, setCampusFilter] = useState('all');
  const [days, setDays] = useState(undefined); // undefined = pas de filtre période
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [litiges, setLitiges] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  useEffect(() => {
    getDisputesStats().then(setStats).catch(() => setStats(null));
    findAllCampuses().then(setCampuses).catch(() => setCampuses([]));
  }, []);

  useEffect(() => { setPage(1); }, [statusFilter, campusFilter, days]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getDisputes(page, PAGE_SIZE, {
      status: statusFilter !== 'all' ? statusFilter : undefined,
      campusId: campusFilter !== 'all' ? campusFilter : undefined,
      days,
    })
      .then((res) => { setLitiges(res.data); setMeta(res.meta); })
      .catch((err) => setError(err.message || 'Impossible de charger les litiges.'))
      .finally(() => setLoading(false));
  }, [page, statusFilter, campusFilter, days]);

  return (
    <>
      <Topbar icon={AlertTriangle} breadcrumb={[{ label: 'Gestion' }, { label: 'Litiges' }]} />
      <PageContent>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div className="page-header" style={{ marginBottom: 0 }}>
            <div className="eyebrow">Admin web · Litiges</div>
            <h1>Litiges</h1>
            <p>
              {stats ? `${stats.open} litige${stats.open === 1 ? '' : 's'} ouvert${stats.open === 1 ? '' : 's'} · ${stats.inProgress} en cours de traitement · ${stats.resolvedThisMonth} traité${stats.resolvedThisMonth === 1 ? '' : 's'} ce mois` : '…'}
            </p>
          </div>
          <button className="btn-secondary-sm" onClick={() => navigate('/admin/litiges/suspensions')}>
            <ShieldAlert size={15} /> Comptes suspendus
          </button>
        </div>

        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <div className="kpi-card">
            <div className="kpi-label">Ouverts</div>
            <div className="kpi-value" style={{ color: '#DC2626' }}>{stats ? stats.open : '…'}</div>
            <div className="kpi-sub">à traiter</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">En cours</div>
            <div className="kpi-value" style={{ color: 'var(--orange)' }}>{stats ? stats.inProgress : '…'}</div>
            <div className="kpi-sub">prise en charge</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Traités ce mois</div>
            <div className="kpi-value">{stats ? stats.resolvedThisMonth : '…'}</div>
            <div className="kpi-sub">{stats ? `dont ${stats.refundedThisMonth} remboursés` : '—'}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Délai moyen</div>
            <div className="kpi-value">{stats ? formatDelay(stats.avgResolutionMinutes) : '…'}</div>
            <div className="kpi-sub">de résolution ce mois</div>
          </div>
        </div>

        <div className="filter-bar">
          <div className="filter-group">
            <label className="filter-label">Statut</label>
            <div className="tab-pills">
              {STATUS_PILLS.map((p) => (
                <button key={p.key} className={`pill${statusFilter === p.key ? ' active' : ''}`} onClick={() => setStatusFilter(p.key)}>{p.label}</button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Campus</label>
            <select className="filter-select" value={campusFilter} onChange={(e) => setCampusFilter(e.target.value)}>
              <option value="all">Tous les campus</option>
              {campuses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Période</label>
            <select className="filter-select" value={days ?? ''} onChange={(e) => setDays(e.target.value ? Number(e.target.value) : undefined)}>
              <option value="">Toutes</option>
              <option value="1">Aujourd&apos;hui</option>
              <option value="7">7 jours</option>
              <option value="30">30 jours</option>
            </select>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Ref. litige</th><th>Étudiant</th><th>Cantine</th><th>Campus</th>
                  <th>Motif</th><th>Montant</th><th>Statut</th><th>Signalé le</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={9} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)' }}>Chargement…</td></tr>}
                {error && <tr><td colSpan={9} style={{ textAlign: 'center', padding: '24px 0', color: '#DC2626' }}>{error}</td></tr>}
                {!loading && !error && litiges.length === 0 && (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)' }}>Aucun litige ne correspond à ces filtres.</td></tr>
                )}
                {!loading && !error && litiges.map((l) => {
                  const studentName = `${l.student?.firstName ?? ''} ${l.student?.lastName ?? ''}`.trim() || '—';
                  const shortRef = l.id.slice(0, 8).toUpperCase();
                  return (
                    <tr
                      key={l.id}
                      onClick={() => navigate(`/admin/litiges/${l.id}`)}
                      style={{ cursor: 'pointer', borderLeft: `3px solid ${URGENCY_COLOR[l.status]}` }}
                    >
                      <td style={{ fontWeight: 700, color: 'var(--indigo)' }}>#{shortRef}</td>
                      <td className="name-cell">
                        <span className="initials init-indigo" style={{ width: 28, height: 28, fontSize: 11 }}>{initialsOf(studentName)}</span>
                        {studentName}
                      </td>
                      <td style={{ fontWeight: 500 }}>{l.vendor?.canteenName || '—'}</td>
                      <td>{l.student?.campus?.name ? <span className="badge-blue">{l.student.campus.name}</span> : <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                      <td style={{ maxWidth: 160, fontSize: 13, color: '#475569' }}>{l.reason}</td>
                      <td style={{ fontWeight: l.status === 'RESOLVED' ? 500 : 700, color: l.status === 'RESOLVED' ? 'var(--muted)' : '#DC2626' }}>
                        {formatAmount(l.ticketAmount)}
                      </td>
                      <td>
                        {l.status === 'RESOLVED' ? (
                          <span className="badge-green">Traité</span>
                        ) : (
                          <span style={{ ...STATUS_STYLE[l.status], fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>
                            {STATUS_LABEL[l.status]}
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--muted)' }}>{timeAgo(l.createdAt)}</td>
                      <td>
                        <button
                          className="action-btn"
                          style={l.status === 'RESOLVED' ? { color: 'var(--muted)', borderColor: 'var(--border)' } : undefined}
                          onClick={(e) => { e.stopPropagation(); navigate(`/admin/litiges/${l.id}`); }}
                        >
                          {ACTION_LABEL[l.status]}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
            <span>Affichage {meta.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, meta.total)} sur {meta.total} litige{meta.total === 1 ? '' : 's'}</span>
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
