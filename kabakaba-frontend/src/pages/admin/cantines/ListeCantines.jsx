import { useEffect, useMemo, useState } from 'react';
import { Utensils, Plus, Eye, Pencil, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';
import { getVendorsForAdmin } from '../../../services/domain/vendorsService';
import { findAllCampuses } from '../../../services/domain/campusesService';

const PAGE_SIZE = 5;
const INIT_CLASSES = ['init-indigo', 'init-orange', 'init-gray'];

function initialsOf(name) {
  return (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '?';
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatFcfa(n) {
  return `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;
}

export default function ListeCantines() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [campusFilter, setCampusFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | suspended
  const [debtFilter, setDebtFilter] = useState('all'); // all | true
  const [page, setPage] = useState(1);

  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  useEffect(() => {
    findAllCampuses().then(setCampuses).catch(() => setCampuses([]));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, campusFilter, statusFilter, debtFilter]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getVendorsForAdmin(page, PAGE_SIZE, {
      search: debouncedSearch || undefined,
      campusId: campusFilter !== 'all' ? campusFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      hasDebt: debtFilter === 'true' ? 'true' : undefined,
    })
      .then((res) => {
        setVendors(res.data);
        setMeta(res.meta);
      })
      .catch((err) => setError(err.message || 'Impossible de charger les cantines.'))
      .finally(() => setLoading(false));
  }, [page, debouncedSearch, campusFilter, statusFilter, debtFilter]);

  const campusCount = useMemo(() => new Set(campuses.map((c) => c.id)).size, [campuses]);

  return (
    <>
      <Topbar icon={Utensils} breadcrumb={[{ label: 'Gestion' }, { label: 'Cantines' }]}>
        <button className="btn-primary-sm" onClick={() => navigate('/admin/cantines/creer')}>
          <Plus size={16} /> Créer une cantine
        </button>
      </Topbar>
      <PageContent>
        <div className="page-header">
      <div className="eyebrow">Admin web · Cantines</div>
          <h1>Cantines</h1>
          <p>{meta.total} cantine{meta.total === 1 ? '' : 's'} enregistrée{meta.total === 1 ? '' : 's'} — {campusCount} campus couvert{campusCount === 1 ? '' : 's'}</p>
        </div>

        <div className="filter-bar">
          <div className="filter-group">
            <label className="filter-label">Recherche</label>
            <div className="global-search-wrap">
              <input
                className="global-search-input"
                style={{ width: 220 }}
                placeholder="Nom, vendeur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={14} className="global-search-icon" />
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
            <label className="filter-label">Statut</label>
            <div className="tab-pills">
              <button className={`pill${statusFilter === 'all' ? ' active' : ''}`} onClick={() => setStatusFilter('all')}>Tous</button>
              <button className={`pill${statusFilter === 'active' ? ' active' : ''}`} onClick={() => setStatusFilter('active')}><span className="status-dot dot-green" /> Actifs</button>
              <button className={`pill${statusFilter === 'suspended' ? ' active' : ''}`} onClick={() => setStatusFilter('suspended')}><span className="status-dot dot-orange" /> Suspendus</button>
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Créances</label>
            <div className="tab-pills">
              <button className={`pill${debtFilter === 'all' ? ' active' : ''}`} onClick={() => setDebtFilter('all')}>Toutes</button>
              <button className={`pill${debtFilter === 'true' ? ' active' : ''}`} style={{ color: '#DC2626' }} onClick={() => setDebtFilter('true')}>Actives</button>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Cantine</th><th>Campus</th><th>Vendeur</th><th>Statut compte</th>
                  <th>Ouverture</th><th>Cmd aujourd&apos;hui</th><th>Créance</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {!loading && !error && vendors.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px 0' }}>Aucune cantine ne correspond à ces filtres.</td></tr>
                )}
                {loading && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px 0' }}>Chargement…</td></tr>
                )}
                {error && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: '#DC2626', padding: '24px 0' }}>{error}</td></tr>
                )}
                {!loading && !error && vendors.map((c, i) => (
                  <tr key={c.id} onClick={() => navigate(`/admin/cantines/${c.id}`)} style={{ cursor: 'pointer' }}>
                    <td className="name-cell">
                      <span className={`initials ${INIT_CLASSES[i % INIT_CLASSES.length]}`} style={{ width: 36, height: 36, borderRadius: 10 }}>{initialsOf(c.name)}</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Créée le {formatDate(c.createdAt)}</div>
                      </div>
                    </td>
                    <td>{c.campuses.length ? c.campuses.map((cp) => <span key={cp.id} className="badge-blue" style={{ marginRight: 4 }}>{cp.name}</span>) : <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                    <td style={{ fontWeight: 500 }}>{c.owner || '—'}</td>
                    <td>
                      {c.isActive ? (
                        <span className="badge-green"><span className="status-dot dot-green" style={{ marginRight: 4 }} />Actif</span>
                      ) : (
                        <span style={{ background: '#FEF2F2', color: '#B91C1C', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>
                          <span className="status-dot" style={{ background: '#EF4444', marginRight: 4 }} />Suspendu
                        </span>
                      )}
                    </td>
                    <td><span className={c.isOpen ? 'badge-green' : 'badge-gray'}>{c.isOpen ? 'Ouverte' : 'Fermée'}</span></td>
                    <td style={{ fontWeight: 700, color: c.isActive ? 'var(--indigo)' : 'var(--muted)' }}>{c.todayOrders}</td>
                    <td>
                      {c.debtFcfa > 0 ? (
                        <>
                          <span style={{ color: '#DC2626', fontWeight: 700, fontSize: 13 }}>{formatFcfa(c.debtFcfa)}</span>
                          <div style={{ fontSize: 11, color: '#EF4444' }}>Retrait bloqué</div>
                        </>
                      ) : (
                        <span style={{ color: 'var(--muted)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                        <button className="icon-btn" title="Voir la fiche" onClick={() => navigate(`/admin/cantines/${c.id}`)}>
                          <Eye size={15} />
                        </button>
                        <button className="icon-btn" title="Modifier" onClick={() => navigate(`/admin/cantines/${c.id}`)}>
                          <Pencil size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
            <span>
              Affichage {meta.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, meta.total)} sur {meta.total} cantine{meta.total === 1 ? '' : 's'}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="icon-btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>←</button>
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className="icon-btn"
                  style={n === page ? { background: 'var(--indigo)', color: '#fff', borderColor: 'var(--indigo)' } : undefined}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              <button className="icon-btn" disabled={page >= meta.totalPages} onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}>→</button>
            </div>
          </div>
        </div>
      </PageContent>
    </>
  );
}
