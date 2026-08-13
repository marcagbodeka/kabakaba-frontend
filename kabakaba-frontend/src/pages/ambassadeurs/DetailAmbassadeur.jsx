import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trophy, Phone, Mail, GraduationCap, IdCard } from 'lucide-react';
import Topbar from '../../components/Topbar';
import PageContent from '../../components/PageContent';
import { getAmbassadorDetail } from '../../services/domain/analyticsService';

function formatFcfa(n) {
  return `${Number(n ?? 0).toLocaleString('fr-FR')} FCFA`;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function initials(firstName, lastName) {
  return `${(firstName || '?')[0]}${(lastName || '?')[0]}`.toUpperCase();
}

const levelLabel = { GOLD: 'Or', SILVER: 'Argent', BRONZE: 'Bronze' };
const statusLabel = { PENDING: 'En attente', ACTIVE: 'Actif', SUSPENDED: 'Suspendu', REJECTED: 'Rejeté' };
const statusBadge = { PENDING: 'badge-gray', ACTIVE: 'badge-green', SUSPENDED: 'badge-red', REJECTED: 'badge-red' };

export default function DetailAmbassadeur() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tab, setTab] = useState('stats');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        setData(await getAmbassadorDetail(id, 30));
      } catch (err) {
        setError(err.message || 'Impossible de charger cet ambassadeur.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <>
        <Topbar icon={Trophy} breadcrumb={[{ label: 'Ambassadeurs', path: '/supervision/ambassadeurs' }, { label: '...' }]} />
        <PageContent><div className="card">Chargement...</div></PageContent>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Topbar icon={Trophy} breadcrumb={[{ label: 'Ambassadeurs', path: '/supervision/ambassadeurs' }, { label: 'Introuvable' }]}>
          <button className="btn-secondary-sm" onClick={() => navigate('/supervision/ambassadeurs')}>← Retour</button>
        </Topbar>
        <PageContent>
          <div className="notice-banner notice-error">{error || 'Ambassadeur introuvable.'}</div>
        </PageContent>
      </>
    );
  }

  const { identity, stats, affiliates, commissions } = data;
  const fullName = `${identity.firstName ?? ''} ${identity.lastName ?? ''}`.trim() || '—';
  const progressPct = stats.levelThreshold ? Math.min(100, (stats.volume30d / stats.levelThreshold) * 100) : 100;

  return (
    <>
      <Topbar
        icon={Trophy}
        breadcrumb={[{ label: 'Ambassadeurs', path: '/supervision/ambassadeurs' }, { label: fullName }]}
        badge={{ text: levelLabel[identity.level] }}
      >
        <button className="btn-secondary-sm" onClick={() => navigate('/supervision/ambassadeurs')}>← Retour</button>
      </Topbar>
      <PageContent>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <span className="initials init-indigo" style={{ width: 56, height: 56, borderRadius: 14, fontSize: 18 }}>
            {initials(identity.firstName, identity.lastName)}
          </span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.02em' }}>{fullName}</h1>
              <span className="level-badge">{levelLabel[identity.level]}</span>
              <span className={statusBadge[identity.status]}>{statusLabel[identity.status]}</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <span><GraduationCap size={13} style={{ verticalAlign: -2 }} /> {identity.campusName}{identity.faculty ? ` · ${identity.faculty}` : ''}</span>
              {identity.phone && <span><Phone size={13} style={{ verticalAlign: -2 }} /> {identity.phone}</span>}
              {identity.email && <span><Mail size={13} style={{ verticalAlign: -2 }} /> {identity.email}</span>}
              {identity.promoCode && (
                <span>Code promo : <strong style={{ color: 'var(--indigo)', fontFamily: 'monospace' }}>{identity.promoCode}</strong></span>
              )}
            </p>
          </div>
        </div>

        {identity.schoolCardUrl && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title"><IdCard size={15} style={{ verticalAlign: -2 }} /> Carte étudiante fournie</div>
            <a href={identity.schoolCardUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--indigo)', fontSize: 13 }}>
              Voir le justificatif →
            </a>
          </div>
        )}

        {identity.status === 'SUSPENDED' && identity.decisionReason && (
          <div className="card" style={{ borderColor: '#EF4444', marginBottom: 16 }}>
            <div className="card-title" style={{ color: '#EF4444' }}>Compte suspendu</div>
            <div style={{ fontSize: 13 }}>Motif : {identity.decisionReason}</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>Depuis le {formatDate(identity.suspendedAt)}</div>
          </div>
        )}

        <div className="tab-bar">
          <button className={`tab-btn ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>Vue générale</button>
          <button className={`tab-btn ${tab === 'affilies' ? 'active' : ''}`} onClick={() => setTab('affilies')}>Affiliés ({stats.totalAffiliates})</button>
          <button className={`tab-btn ${tab === 'commissions' ? 'active' : ''}`} onClick={() => setTab('commissions')}>Historique commissions</button>
        </div>

        {tab === 'stats' && (
          <>
            <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              <div className="kpi-card">
                <div className="kpi-label">Volume affiliés 30j</div>
                <div className="kpi-value" style={{ color: 'var(--indigo)' }}>{formatFcfa(stats.volume30d)}</div>
                {stats.levelThreshold && <div className="kpi-sub">Seuil {levelLabel[stats.nextLevel]} : {formatFcfa(stats.levelThreshold)}</div>}
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Commission ce mois</div>
                <div className="kpi-value" style={{ color: '#22C55E' }}>{formatFcfa(stats.commissionThisMonth)}</div>
                <div className="kpi-sub">Taux {levelLabel[identity.level]} : {(stats.commissionRate * 100).toFixed(1)}%</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Affiliés totaux</div>
                <div className="kpi-value">{stats.totalAffiliates}</div>
                <div className="kpi-sub">{stats.activeAffiliates} actifs</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Dernier parrainage</div>
                <div className="kpi-value" style={{ fontSize: 20 }}>{formatDate(stats.lastReferralAt)}</div>
              </div>
            </div>

            {stats.levelThreshold && (
              <div className="card">
                <div className="card-title">Progression de niveau</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
                  <span>Niveau actuel : <strong>{levelLabel[identity.level]}</strong></span>
                  <span>{formatFcfa(stats.volume30d)} / {formatFcfa(stats.levelThreshold)} pour {levelLabel[stats.nextLevel]}</span>
                </div>
                <div style={{ height: 12, background: '#F1F5F9', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg,#F59E0B,#FBBF24)', borderRadius: 6 }} />
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'affilies' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr><th>Étudiant</th><th>Campus</th><th>Affilié depuis</th><th>Recharges totales</th><th>Statut</th></tr>
                </thead>
                <tbody>
                  {affiliates.length === 0 && <tr><td colSpan={5}>Aucun affilié.</td></tr>}
                  {affiliates.map((a) => (
                    <tr key={a.id}>
                      <td><strong>{a.name}</strong></td>
                      <td>{a.campusName}</td>
                      <td>{formatDate(a.since)}</td>
                      <td>{formatFcfa(a.totalRecharge)}</td>
                      <td>{a.active ? <span className="badge-green">Actif</span> : <span className="badge-gray">Inactif</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'commissions' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr><th>Date</th><th>Recharge</th><th>Niveau appliqué</th><th>Taux</th><th>Commission</th></tr>
                </thead>
                <tbody>
                  {commissions.length === 0 && <tr><td colSpan={5}>Aucune commission enregistrée.</td></tr>}
                  {commissions.map((c) => (
                    <tr key={c.id}>
                      <td>{formatDateTime(c.date)}</td>
                      <td>{c.rechargeAmount !== null ? formatFcfa(c.rechargeAmount) : '—'}</td>
                      <td>{c.levelApplied ? levelLabel[c.levelApplied] : '—'}</td>
                      <td>{c.commissionRate !== null ? `${(c.commissionRate * 100).toFixed(1)}%` : '—'}</td>
                      <td>{formatFcfa(c.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </PageContent>
    </>
  );
}