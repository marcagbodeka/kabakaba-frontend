import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trophy, X, ShieldCheck } from 'lucide-react';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';
import { getAmbassadorDetail } from '../../../services/domain/analyticsService';
import { suspendAmbassador } from '../../../services/domain/applicationsService';

const PAGE_SIZE = 10;
const LEVEL_LABEL = { GOLD: 'Or', SILVER: 'Argent', BRONZE: 'Bronze' };
const LEVEL_KEY = { GOLD: 'or', SILVER: 'argent', BRONZE: 'bronze' };
const APPEAL_STATUS_LABEL = { PENDING: 'En attente', ACCEPTED: 'Acceptée', REJECTED: 'Rejetée' };

function initialsOf(first, last) {
  return `${(first || '?')[0]}${(last || '?')[0]}`.toUpperCase();
}

function formatFcfa(n) {
  return `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function timeAgo(iso) {
  if (!iso) return '—';
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days <= 0) return "Aujourd'hui";
  if (days === 1) return 'Il y a 1j';
  return `Il y a ${days}j`;
}

export default function AmbassadeurFiche() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tab, setTab] = useState('stats');
  const [modalOpen, setModalOpen] = useState(false);
  const [motif, setMotif] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null);
  const [affiliatesPage, setAffiliatesPage] = useState(1);

  const loadDetail = () => {
    setLoading(true);
    setError(null);
    getAmbassadorDetail(id, 30)
      .then(setDetail)
      .catch((err) => setError(err.message || "Impossible de charger cet ambassadeur."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const affiliatesTotalPages = useMemo(
    () => Math.max(1, Math.ceil((detail?.affiliates.length ?? 0) / PAGE_SIZE)),
    [detail],
  );
  const affiliatesPageRows = useMemo(() => {
    if (!detail) return [];
    return detail.affiliates.slice((affiliatesPage - 1) * PAGE_SIZE, affiliatesPage * PAGE_SIZE);
  }, [detail, affiliatesPage]);

  async function handleConfirmSuspend() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await suspendAmbassador(id, motif);
      setModalOpen(false);
      setMotif('');
      loadDetail();
    } catch (err) {
      setSubmitError(err.message || 'Échec de la suspension.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <>
        <Topbar icon={Trophy} breadcrumb={[{ label: 'Ambassadeurs', path: '/admin/ambassadeurs' }]} />
        <PageContent><p>Chargement…</p></PageContent>
      </>
    );
  }

  if (error || !detail) {
    return (
      <>
        <Topbar icon={Trophy} breadcrumb={[{ label: 'Ambassadeurs', path: '/admin/ambassadeurs' }]} />
        <PageContent><p style={{ color: '#DC2626' }}>{error || 'Ambassadeur introuvable.'}</p></PageContent>
      </>
    );
  }

  const { identity, stats, affiliates, commissions, appeals } = detail;
  const fullName = `${identity.firstName ?? ''} ${identity.lastName ?? ''}`.trim() || '—';
  const isActive = identity.status === 'ACTIVE';
  const progressPct = stats.levelThreshold ? Math.min(100, (stats.volume30d / stats.levelThreshold) * 100) : 100;

  return (
    <>
      <Topbar icon={Trophy} breadcrumb={[{ label: 'Ambassadeurs', path: '/admin/ambassadeurs' }, { label: fullName }]} badge={{ text: LEVEL_LABEL[identity.level] }}>
        <button className="btn-secondary-sm" onClick={() => navigate('/admin/ambassadeurs')}>← Retour</button>
      </Topbar>
      <PageContent>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <span className="initials init-indigo" style={{ width: 56, height: 56, borderRadius: 14, fontSize: 18 }}>
            {initialsOf(identity.firstName, identity.lastName)}
          </span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.02em' }}>{fullName}</h1>
              <span className={`level-badge ${LEVEL_KEY[identity.level]}`}>{LEVEL_LABEL[identity.level]}</span>
              {isActive ? (
                <span className="badge-green"><span className="status-dot dot-green" style={{ marginRight: 4 }} />Actif</span>
              ) : (
                <span style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span className="status-dot" style={{ background: '#EF4444' }} />Suspendu
                </span>
              )}
            </div>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>
              {identity.campusName}{identity.faculty ? ` · ${identity.faculty}` : ''} · {identity.phone || '—'} · Code promo :{' '}
              <strong style={{ color: 'var(--indigo)', fontFamily: 'monospace' }}>{identity.promoCode || '—'}</strong>
            </p>
          </div>
          {isActive && (
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn-secondary-sm" onClick={() => setModalOpen(true)}>Suspendre</button>
            </div>
          )}
        </div>

        <div className="tab-bar">
          <button className={`tab-btn ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>Vue générale</button>
          <button className={`tab-btn ${tab === 'affilies' ? 'active' : ''}`} onClick={() => setTab('affilies')}>Affiliés ({stats.totalAffiliates})</button>
          <button className={`tab-btn ${tab === 'commissions' ? 'active' : ''}`} onClick={() => setTab('commissions')}>Historique commissions</button>
          <button className={`tab-btn ${tab === 'appels' ? 'active' : ''}`} onClick={() => setTab('appels')}>Appels{appeals.length ? ` (${appeals.length})` : ''}</button>
        </div>

        {tab === 'stats' && (
          <>
            <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              <div className="kpi-card">
                <div className="kpi-label">Volume affiliés 30j</div>
                <div className="kpi-value" style={{ color: 'var(--indigo)' }}>{formatFcfa(stats.volume30d)}</div>
                <div className="kpi-sub">Seuil {identity.level === 'GOLD' ? 'Or' : 'suivant'} : {stats.levelThreshold != null ? formatFcfa(stats.levelThreshold) : '—'}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Commission ce mois</div>
                <div className="kpi-value" style={{ color: '#22C55E' }}>{formatFcfa(stats.commissionThisMonth)}</div>
                <div className="kpi-sub">Taux {LEVEL_LABEL[identity.level]} : {stats.commissionRate}%</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Affiliés totaux</div>
                <div className="kpi-value">{stats.totalAffiliates}</div>
                <div className="kpi-sub">{stats.activeAffiliates} actifs ce mois</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Dernier parrainage</div>
                <div className="kpi-value" style={{ fontSize: 20 }}>{timeAgo(stats.lastReferralAt)}</div>
                <div className="kpi-sub">Seuil suspension : 3 mois</div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">Progression de niveau</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
                <span>Niveau actuel : <strong style={{ color: '#F59E0B' }}>{LEVEL_LABEL[identity.level]}</strong></span>
                {stats.nextLevel ? (
                  <span>{formatFcfa(stats.volume30d)} / {formatFcfa(stats.levelThreshold)} minimum ({LEVEL_LABEL[stats.nextLevel]})</span>
                ) : (
                  <span>Niveau maximum atteint</span>
                )}
              </div>
              <div style={{ height: 12, background: '#F1F5F9', borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg,#F59E0B,#FBBF24)', borderRadius: 6 }} />
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                {stats.nextLevel ? `Encore ${formatFcfa(Math.max(0, stats.levelThreshold - stats.volume30d))} pour atteindre le niveau ${LEVEL_LABEL[stats.nextLevel]}` : 'Niveau Or maintenu'}
              </div>
            </div>
          </>
        )}

        {tab === 'affilies' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px 0', fontSize: 15, fontWeight: 700 }}>
              {stats.totalAffiliates} affilié{stats.totalAffiliates === 1 ? '' : 's'} inscrit{stats.totalAffiliates === 1 ? '' : 's'} via le code {identity.promoCode || '—'}
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr><th>Affilié</th><th>Campus</th><th>Inscrit le</th><th>Recharges 30j</th><th>Commission générée</th><th>Statut</th></tr>
                </thead>
                <tbody>
                  {affiliatesPageRows.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px 0' }}>Aucun affilié pour le moment.</td></tr>
                  )}
                  {affiliatesPageRows.map((a) => (
                    <tr key={a.id}>
                      <td className="name-cell"><span className="initials init-indigo" style={{ width: 28, height: 28, fontSize: 11 }}>{initialsOf(a.name.split(' ')[0], a.name.split(' ')[1])}</span>{a.name}</td>
                      <td><span className="badge-blue">{a.campusName}</span></td>
                      <td style={{ fontSize: 13, color: 'var(--muted)' }}>{formatDate(a.since)}</td>
                      <td style={{ fontWeight: a.active ? 700 : 400, color: a.active ? 'var(--indigo)' : 'var(--muted)' }}>{formatFcfa(a.totalRecharge)}</td>
                      <td style={{ color: a.active ? '#22C55E' : 'var(--muted)', fontWeight: a.active ? 600 : 400 }}>{a.commissionGenerated ? formatFcfa(a.commissionGenerated) : '—'}</td>
                      <td><span className={a.active ? 'badge-green' : 'badge-gray'}>{a.active ? 'Actif' : 'Inactif'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
              <span>
                Affichage {affiliates.length === 0 ? 0 : (affiliatesPage - 1) * PAGE_SIZE + 1}–{Math.min(affiliatesPage * PAGE_SIZE, affiliates.length)} sur {affiliates.length} affiliés
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="icon-btn" disabled={affiliatesPage <= 1} onClick={() => setAffiliatesPage((p) => Math.max(1, p - 1))}>←</button>
                {Array.from({ length: affiliatesTotalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    className="icon-btn"
                    style={n === affiliatesPage ? { background: 'var(--indigo)', color: '#fff', borderColor: 'var(--indigo)' } : undefined}
                    onClick={() => setAffiliatesPage(n)}
                  >
                    {n}
                  </button>
                ))}
                <button className="icon-btn" disabled={affiliatesPage >= affiliatesTotalPages} onClick={() => setAffiliatesPage((p) => Math.min(affiliatesTotalPages, p + 1))}>→</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'commissions' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px 0', fontSize: 15, fontWeight: 700 }}>Historique des commissions</div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr><th>Date</th><th>Affilié</th><th>Recharge affilié</th><th>Niveau appliqué</th><th>Taux</th><th>Commission versée</th></tr>
                </thead>
                <tbody>
                  {commissions.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px 0' }}>Aucune commission pour le moment.</td></tr>
                  )}
                  {commissions.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontSize: 13, color: 'var(--muted)' }}>{formatDate(c.date)}</td>
                      <td>{c.affiliateName}</td>
                      <td style={{ fontWeight: 600 }}>{c.rechargeAmount != null ? formatFcfa(c.rechargeAmount) : '—'}</td>
                      <td>{c.levelApplied ? <span className={`level-badge ${LEVEL_KEY[c.levelApplied]}`} style={{ fontSize: 11 }}>{LEVEL_LABEL[c.levelApplied]}</span> : '—'}</td>
                      <td>{c.commissionRate != null ? `${c.commissionRate}%` : '—'}</td>
                      <td style={{ fontWeight: 700, color: '#22C55E' }}>{formatFcfa(c.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--muted)' }}>
              Total versé ce mois : <strong style={{ color: 'var(--indigo)' }}>{formatFcfa(stats.commissionThisMonth)}</strong>
            </div>
          </div>
        )}

        {tab === 'appels' && (
          <div className="card">
            <div className="card-title">Appels soumis</div>
            {appeals.length === 0 ? (
              <>
                <div className="card-sub">Aucun appel en cours pour cet ambassadeur.</div>
                <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--muted)' }}>
                  <ShieldCheck size={44} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontSize: 15, fontWeight: 500 }}>Aucun appel soumis</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>Les appels suite à une suspension apparaissent ici.</div>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {appeals.map((ap) => (
                  <div key={ap.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span className={ap.status === 'ACCEPTED' ? 'badge-green' : ap.status === 'REJECTED' ? 'badge-gray' : 'badge-blue'}>
                        {APPEAL_STATUS_LABEL[ap.status] || ap.status}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{formatDate(ap.createdAt)}</span>
                    </div>
                    <p style={{ fontSize: 14, color: '#475569', margin: 0 }}>{ap.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </PageContent>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => !submitting && setModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <X size={20} color="#DC2626" />
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>Suspendre l&apos;ambassadeur</div>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>{fullName} · Niveau {LEVEL_LABEL[identity.level]}</div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 14 }}>
              Le compte ambassadeur sera suspendu. Les affiliés déjà inscrits restent rattachés mais ne
              génèrent plus de commission pendant la suspension.
            </p>
            <div className="field-group" style={{ marginBottom: 16 }}>
              <label className="fg-label">Motif (obligatoire)</label>
              <textarea className="fg-input" rows={2} placeholder="Ex : inactivité de parrainage prolongée..." value={motif} onChange={(e) => setMotif(e.target.value)} />
            </div>
            {submitError && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{submitError}</p>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-secondary-sm" disabled={submitting} onClick={() => setModalOpen(false)}>Annuler</button>
              <button className="btn-danger-sm" disabled={!motif || submitting} onClick={handleConfirmSuspend}>
                {submitting ? 'Suspension…' : 'Confirmer la suspension'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
