import { useEffect, useMemo, useState } from 'react';
import { Trophy, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';
import { getAmbassadorRanking } from '../../../services/domain/analyticsService';
import { getPendingAmbassadors } from '../../../services/domain/applicationsService';

const PAGE_SIZE = 10;

const LEVEL_LABEL = { GOLD: 'Or', SILVER: 'Argent', BRONZE: 'Bronze' };
const LEVEL_KEY = { GOLD: 'or', SILVER: 'argent', BRONZE: 'bronze' };

function initialsOf(name) {
  return (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '?';
}

function formatFcfa(n) {
  return `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;
}

export default function ListeAmbassadeurs() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);

  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [campusFilter, setCampusFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [rankingRes, pending] = await Promise.all([
          getAmbassadorRanking(30),
          getPendingAmbassadors(),
        ]);
        setSummary(rankingRes.summary);
        setRanking(rankingRes.ranking);
        setPendingCount((pending.data || pending || []).length ?? 0);
      } catch (err) {
        setError(err.message || 'Impossible de charger les ambassadeurs.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const campuses = useMemo(
    () => Array.from(new Set(ranking.map((a) => a.campusName).filter(Boolean))).sort(),
    [ranking],
  );

  const filtered = useMemo(() => {
    return ranking.filter((a) => {
      if (levelFilter !== 'all' && a.level !== levelFilter) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (campusFilter !== 'all' && a.campusName !== campusFilter) return false;
      return true;
    });
  }, [ranking, levelFilter, statusFilter, campusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const setFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  if (loading) {
    return (
      <>
        <Topbar icon={Trophy} breadcrumb={[{ label: 'Gestion' }, { label: 'Ambassadeurs' }]} />
        <PageContent><p>Chargement…</p></PageContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Topbar icon={Trophy} breadcrumb={[{ label: 'Gestion' }, { label: 'Ambassadeurs' }]} />
        <PageContent><p style={{ color: '#DC2626' }}>{error}</p></PageContent>
      </>
    );
  }

  return (
    <>
      <Topbar icon={Trophy} breadcrumb={[{ label: 'Gestion' }, { label: 'Ambassadeurs' }]}>
        <button className="btn-primary-sm" onClick={() => navigate('/admin/ambassadeurs/demandes')}>
          {pendingCount} demande{pendingCount === 1 ? '' : 's'} en attente
        </button>
      </Topbar>
      <PageContent>
        <div className="page-header">
      <div className="eyebrow">Admin web · Ambassadeurs</div>
          <h1>Ambassadeurs</h1>
          <p>{summary.activeAmbassadors} ambassadeurs actifs · {summary.suspendedAmbassadors} suspendus · {pendingCount} demande{pendingCount === 1 ? '' : 's'} en attente</p>
        </div>

        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <div className="kpi-card">
            <div className="kpi-label">Actifs</div>
            <div className="kpi-value" style={{ color: '#22C55E' }}>{summary.activeAmbassadors}</div>
            <div className="kpi-sub">sur {summary.campusCount} campus</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Niveau Or</div>
            <div className="kpi-value" style={{ color: '#F59E0B' }}>{summary.levelCounts.GOLD}</div>
            <div className="kpi-sub">vol. 30j &gt; 150 000 FCFA</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Niveau Argent</div>
            <div className="kpi-value" style={{ color: '#94A3B8' }}>{summary.levelCounts.SILVER}</div>
            <div className="kpi-sub">50k–149k FCFA</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Niveau Bronze</div>
            <div className="kpi-value" style={{ color: '#CD7C2F' }}>{summary.levelCounts.BRONZE}</div>
            <div className="kpi-sub">&lt; 50 000 FCFA</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Suspendus</div>
            <div className="kpi-value" style={{ color: '#DC2626' }}>{summary.suspendedAmbassadors}</div>
            <div className="kpi-sub">inactivité parrainage</div>
          </div>
        </div>

        <div className="filter-bar">
          <div className="filter-group">
            <label className="filter-label">Niveau</label>
            <div className="tab-pills">
              <button className={`pill${levelFilter === 'all' ? ' active' : ''}`} onClick={() => setFilter(setLevelFilter)('all')}>Tous</button>
              <button className="pill" style={{ color: '#F59E0B' }} onClick={() => setFilter(setLevelFilter)('GOLD')}>Or</button>
              <button className="pill" style={{ color: '#94A3B8' }} onClick={() => setFilter(setLevelFilter)('SILVER')}>Argent</button>
              <button className="pill" style={{ color: '#CD7C2F' }} onClick={() => setFilter(setLevelFilter)('BRONZE')}>Bronze</button>
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Statut</label>
            <div className="tab-pills">
              <button className={`pill${statusFilter === 'all' ? ' active' : ''}`} onClick={() => setFilter(setStatusFilter)('all')}>Tous</button>
              <button className={`pill${statusFilter === 'ACTIVE' ? ' active' : ''}`} onClick={() => setFilter(setStatusFilter)('ACTIVE')}>Actifs</button>
              <button className={`pill${statusFilter === 'SUSPENDED' ? ' active' : ''}`} onClick={() => setFilter(setStatusFilter)('SUSPENDED')}>Suspendus</button>
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Campus</label>
            <select className="filter-select" value={campusFilter} onChange={(e) => setFilter(setCampusFilter)(e.target.value)}>
              <option value="all">Tous les campus</option>
              {campuses.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Ambassadeur</th><th>Campus</th><th>Niveau</th><th>Vol. 30j (affiliés)</th>
                  <th>Affiliés totaux</th><th>Affiliés actifs</th><th>Statut</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px 0' }}>Aucun ambassadeur ne correspond à ces filtres.</td></tr>
                )}
                {pageRows.map((a) => {
                  const isActive = a.status === 'ACTIVE';
                  return (
                    <tr key={a.id} onClick={() => navigate(`/admin/ambassadeurs/${a.id}`)} style={{ cursor: 'pointer', opacity: isActive ? 1 : 0.7 }}>
                      <td className="name-cell">
                        <span className="initials init-indigo" style={{ width: 34, height: 34, borderRadius: 10 }}>{initialsOf(a.name)}</span>
                        <div>
                          <div style={{ fontWeight: 600 }}>{a.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{a.phone || '—'}</div>
                        </div>
                      </td>
                      <td><span className="badge-blue">{a.campusName}</span></td>
                      <td><span className={`level-badge ${LEVEL_KEY[a.level]}`}>{LEVEL_LABEL[a.level]}</span></td>
                      <td style={{ fontWeight: 700, color: isActive ? 'var(--indigo)' : 'var(--muted)' }}>{formatFcfa(a.volume)}</td>
                      <td>{a.affiliates}</td>
                      <td><span className={isActive ? 'badge-green' : 'badge-gray'}>{a.activeAffiliates} actif{a.activeAffiliates === 1 ? '' : 's'}</span></td>
                      <td>
                        {isActive ? (
                          <span className="badge-green"><span className="status-dot dot-green" style={{ marginRight: 4 }} />Actif</span>
                        ) : (
                          <span style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <span className="status-dot" style={{ background: '#EF4444' }} />Suspendu
                          </span>
                        )}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button className="icon-btn" title="Voir la fiche" onClick={() => navigate(`/admin/ambassadeurs/${a.id}`)}>
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
            <span>
              Affichage {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} sur {filtered.length} ambassadeur{filtered.length === 1 ? '' : 's'}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="icon-btn" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>←</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className="icon-btn"
                  style={n === currentPage ? { background: 'var(--indigo)', color: '#fff', borderColor: 'var(--indigo)' } : undefined}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              <button className="icon-btn" disabled={currentPage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>→</button>
            </div>
          </div>
        </div>
      </PageContent>
    </>
  );
}
