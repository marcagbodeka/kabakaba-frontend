import { useEffect, useMemo, useState } from 'react';
import { UserPlus, ChevronDown, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';
import { getPartnerApplicationsByStatus, updatePartnerApplicationStatus } from '../../../services/domain/applicationsService';

const STATUSES = ['Nouvelle', 'Contactée', 'Acceptée', 'Refusée'];
const LABEL_TO_API = { Nouvelle: 'NEW', Contactée: 'CONTACTED', Acceptée: 'ACCEPTED', Refusée: 'REJECTED' };
const API_TO_LABEL = { NEW: 'Nouvelle', CONTACTED: 'Contactée', ACCEPTED: 'Acceptée', REJECTED: 'Refusée' };
const PILLS = ['Tous', 'Nouvelles', 'Contactées', 'Acceptées', 'Refusées'];
const PILL_TO_API = { Nouvelles: 'NEW', Contactées: 'CONTACTED', Acceptées: 'ACCEPTED', Refusées: 'REJECTED' };

function initialsOf(name) {
  return (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '?';
}

function timeAgo(iso) {
  if (!iso) return '—';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "Reçu aujourd'hui";
  if (days === 1) return 'Reçu hier';
  return `Reçu il y a ${days}j`;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Candidatures() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [byStatus, setByStatus] = useState({ NEW: [], CONTACTED: [], ACCEPTED: [], REJECTED: [] });
  const [openId, setOpenId] = useState(null);
  const [pendingStatus, setPendingStatus] = useState({}); // { [id]: 'Contactée' }
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const [pillFilter, setPillFilter] = useState('Tous');
  const [campusFilter, setCampusFilter] = useState('all');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [n, c, a, r] = await Promise.all([
        getPartnerApplicationsByStatus('NEW', 50),
        getPartnerApplicationsByStatus('CONTACTED', 50),
        getPartnerApplicationsByStatus('ACCEPTED', 50),
        getPartnerApplicationsByStatus('REJECTED', 50),
      ]);
      setByStatus({ NEW: n.data, CONTACTED: c.data, ACCEPTED: a.data, REJECTED: r.data });
      setOpenId(n.data[0]?.id ?? null);
    } catch (err) {
      setError(err.message || 'Impossible de charger les candidatures.');
    } finally {
      setLoading(false);
    }
  }

  const allApps = useMemo(
    () => [...byStatus.NEW, ...byStatus.CONTACTED, ...byStatus.ACCEPTED, ...byStatus.REJECTED],
    [byStatus],
  );
  const campuses = useMemo(
    () => Array.from(new Set(allApps.map((a) => a.targetCampus).filter(Boolean))).sort(),
    [allApps],
  );

  const otherRows = useMemo(() => {
    const pool = [...byStatus.CONTACTED, ...byStatus.ACCEPTED, ...byStatus.REJECTED];
    return pool
      .filter((a) => pillFilter === 'Tous' || a.status === PILL_TO_API[pillFilter])
      .filter((a) => campusFilter === 'all' || a.targetCampus === campusFilter)
      .sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt));
  }, [byStatus, pillFilter, campusFilter]);

  const newRows = useMemo(
    () => byStatus.NEW.filter((a) => campusFilter === 'all' || a.targetCampus === campusFilter),
    [byStatus.NEW, campusFilter],
  );

  async function commitStatus(app) {
    const label = pendingStatus[app.id] || API_TO_LABEL[app.status];
    const apiStatus = LABEL_TO_API[label];
    if (apiStatus === app.status) return;
    setBusyId(app.id);
    setActionError(null);
    try {
      const updated = await updatePartnerApplicationStatus(app.id, apiStatus);
      moveApp(app.status, updated);
    } catch (err) {
      setActionError(err.message || 'Échec de la mise à jour.');
    } finally {
      setBusyId(null);
    }
  }

  function moveApp(oldStatus, updated) {
    setByStatus((prev) => {
      const next = { ...prev };
      next[oldStatus] = next[oldStatus].filter((a) => a.id !== updated.id);
      next[updated.status] = [updated, ...next[updated.status]];
      return next;
    });
  }

  async function handleAcceptAndCreate(app) {
    setBusyId(app.id);
    setActionError(null);
    try {
      const updated = await updatePartnerApplicationStatus(app.id, 'ACCEPTED');
      moveApp(app.status, updated);
      navigate('/admin/cantines/creer');
    } catch (err) {
      setActionError(err.message || "Échec de l'acceptation.");
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <>
        <Topbar icon={UserPlus} breadcrumb={[{ label: 'Partenaires' }]} />
        <PageContent><p>Chargement…</p></PageContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Topbar icon={UserPlus} breadcrumb={[{ label: 'Partenaires' }]} />
        <PageContent><p style={{ color: '#DC2626' }}>{error}</p></PageContent>
      </>
    );
  }

  return (
    <>
      <Topbar icon={UserPlus} breadcrumb={[{ label: 'Partenaires' }]} badge={{ text: `${byStatus.NEW.length} nouvelle${byStatus.NEW.length === 1 ? '' : 's'}`, tone: byStatus.NEW.length > 0 ? 'red' : 'default' }} />
      <PageContent>
        <div className="page-header">
      <div className="eyebrow">Admin web · Partenaires</div>
          <h1>Candidatures partenaires</h1>
          <p>Soumises via le formulaire kabakaba.com · Traitement manuel</p>
        </div>

        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <div className="kpi-card">
            <div className="kpi-label">Nouvelles</div>
            <div className="kpi-value" style={{ color: '#DC2626' }}>{byStatus.NEW.length}</div>
            <div className="kpi-sub">non traitées</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Contactées</div>
            <div className="kpi-value" style={{ color: 'var(--orange)' }}>{byStatus.CONTACTED.length}</div>
            <div className="kpi-sub">en discussion</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Acceptées</div>
            <div className="kpi-value" style={{ color: '#22C55E' }}>{byStatus.ACCEPTED.length}</div>
            <div className="kpi-sub">devenues cantines</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Refusées</div>
            <div className="kpi-value">{byStatus.REJECTED.length}</div>
            <div className="kpi-sub">ce mois</div>
          </div>
        </div>

        <div className="filter-bar">
          <div className="filter-group">
            <label className="filter-label">Statut</label>
            <div className="tab-pills">
              {PILLS.map((p) => (
                <button key={p} className={`pill${pillFilter === p ? ' active' : ''}`} onClick={() => setPillFilter(p)}>{p}</button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Campus visé</label>
            <select className="filter-select" value={campusFilter} onChange={(e) => setCampusFilter(e.target.value)}>
              <option value="all">Tous</option>
              {campuses.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {(pillFilter === 'Tous' || pillFilter === 'Nouvelles') && newRows.length > 0 && (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>
              Nouvelles — à traiter
            </div>

            {newRows.map((d) => {
              const open = openId === d.id;
              const isBusy = busyId === d.id;
              const selectedLabel = pendingStatus[d.id] || API_TO_LABEL[d.status];
              return (
                <div className="demande-card" key={d.id}>
                  <div className="demande-header" onClick={() => setOpenId(open ? null : d.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className="initials init-gray" style={{ width: 40, height: 40, borderRadius: 12, fontSize: 13 }}>{initialsOf(d.structureName)}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{d.structureName}</div>
                        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Contact : {d.contactName} · Campus visé : {d.targetCampus} · {timeAgo(d.createdAt)}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="badge-gray">Nouvelle</span>
                      <ChevronDown size={18} className={`dem-chevron ${open ? 'open' : ''}`} />
                    </div>
                  </div>

                  {open && (
                    <div className="demande-body">
                      <div className="two-col" style={{ marginTop: 0 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                          <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 140, flexShrink: 0 }}>Structure</span><strong>{d.structureName}</strong></div>
                          <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 140, flexShrink: 0 }}>Contact</span><strong>{d.contactName}</strong></div>
                          <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 140, flexShrink: 0 }}>Téléphone</span><strong>{d.phone}</strong></div>
                          <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 140, flexShrink: 0 }}>Email</span><strong>{d.email}</strong></div>
                          <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 140, flexShrink: 0 }}>Campus visé</span><span className="badge-blue">{d.targetCampus}</span></div>
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Message</div>
                          <div style={{ padding: 14, background: '#F8FAFC', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, color: '#475569', lineHeight: 1.7, fontStyle: 'italic' }}>
                            {d.message ? `"${d.message}"` : 'Aucun message.'}
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 10 }}>Faire évoluer le statut</div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {STATUSES.map((s) => (
                            <button
                              key={s}
                              className={`pill ${selectedLabel === s ? 'active' : ''}`}
                              style={s === 'Acceptée' && selectedLabel !== s ? { color: '#16A34A' } : s === 'Refusée' && selectedLabel !== s ? { color: '#DC2626' } : undefined}
                              onClick={() => setPendingStatus((prev) => ({ ...prev, [d.id]: s }))}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                          <button className="btn-primary-sm" disabled={isBusy} onClick={() => handleAcceptAndCreate(d)}>
                            <Plus size={14} /> {isBusy ? 'Traitement…' : 'Accepter & créer la cantine'}
                          </button>
                          <button className="btn-secondary-sm" disabled={isBusy || selectedLabel === 'Nouvelle'} onClick={() => commitStatus(d)}>
                            {isBusy ? 'Enregistrement…' : 'Enregistrer le statut'}
                          </button>
                        </div>
                        {actionError && <p style={{ color: '#DC2626', fontSize: 13, marginTop: 8 }}>{actionError}</p>}
                        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>
                          L&apos;acceptation ne crée pas de compte vendeur automatiquement — vous devrez le créer manuellement.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', margin: '20px 0 10px' }}>
          {pillFilter === 'Tous' ? 'Contactées, acceptées, refusées' : pillFilter}
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Structure</th><th>Contact</th><th>Campus</th><th>Reçu le</th><th>Statut</th></tr>
              </thead>
              <tbody>
                {otherRows.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px 0' }}>Aucune candidature ne correspond à ces filtres.</td></tr>
                )}
                {otherRows.map((c) => (
                  <tr key={c.id}>
                    <td className="name-cell"><span className="initials init-gray" style={{ width: 28, height: 28, fontSize: 11 }}>{initialsOf(c.structureName)}</span><strong>{c.structureName}</strong></td>
                    <td>{c.contactName}</td>
                    <td><span className="badge-blue">{c.targetCampus}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--muted)' }}>{formatDate(c.createdAt)}</td>
                    <td>
                      <span className={c.status === 'ACCEPTED' ? 'badge-green' : c.status === 'REJECTED' ? 'badge-gray' : 'badge-amber'}>
                        {API_TO_LABEL[c.status]}
                      </span>
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
