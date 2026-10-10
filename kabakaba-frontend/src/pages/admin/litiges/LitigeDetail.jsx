import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';
import { getDispute, updateDispute } from '../../../services/domain/disputesService';
import { useAuth } from '../../../context/AuthContext';
import { ORDER_STATUS_LABEL } from '../../../utils/orderStatus';

const STATUS_LABEL = { OPEN: 'Ouvert', IN_PROGRESS: 'En cours', RESOLVED: 'Traité' };
// Classes de badge partagées (styles/dashboard.css), cohérentes avec la liste des litiges.
const STATUS_BADGE_CLASS = { OPEN: 'badge-red', IN_PROGRESS: 'badge-orange', RESOLVED: 'badge-green' };

function initialsOf(name) {
  return (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';
}
function formatTickets(n) { return n != null ? `${Number(n).toLocaleString('fr-FR')} tickets` : '—'; }
function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function timeAgo(iso) {
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (hours < 1) return "à l'instant";
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${Math.floor(hours / 24)}j`;
}

export default function LitigeDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: currentAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dispute, setDispute] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getDispute(id)
      .then(setDispute)
      .catch((err) => setError(err.message || 'Litige introuvable.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleStatus(status) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const updated = await updateDispute(id, {
        status,
        ...(currentAdmin?.id ? { treatedByWebUserId: currentAdmin.id } : {}),
      });
      setDispute((prev) => ({ ...prev, ...updated }));
    } catch (err) {
      setSubmitError(err.message || 'Échec de la mise à jour.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <>
        <Topbar icon={AlertTriangle} breadcrumb={[{ label: 'Litiges', path: '/admin/litiges' }]} />
        <PageContent><p>Chargement…</p></PageContent>
      </>
    );
  }

  if (error || !dispute) {
    return (
      <>
        <Topbar icon={AlertTriangle} breadcrumb={[{ label: 'Litiges', path: '/admin/litiges' }]} />
        <PageContent><p style={{ color: '#DC2626' }}>{error || 'Litige introuvable.'}</p></PageContent>
      </>
    );
  }

  const { student, vendor, order } = dispute;
  const studentName = `${student?.firstName ?? ''} ${student?.lastName ?? ''}`.trim();
  const shortRef = dispute.id.slice(0, 8).toUpperCase();

  return (
    <>
      <Topbar
        icon={AlertTriangle}
        breadcrumb={[{ label: 'Litiges', path: '/admin/litiges' }, { label: `#${shortRef}` }]}
        badge={{ text: STATUS_LABEL[dispute.status], tone: dispute.status === 'OPEN' ? 'red' : 'default' }}
      >
        <button className="btn-secondary-sm" onClick={() => navigate('/admin/litiges')}>← Retour</button>
      </Topbar>
      <PageContent>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.02em' }}>Litige #{shortRef}</h1>
          <span className={STATUS_BADGE_CLASS[dispute.status]}>{STATUS_LABEL[dispute.status]}</span>
          <span style={{ fontSize: 14, color: 'var(--muted)' }}>Signalé {timeAgo(dispute.createdAt)}{vendor ? ` · ${vendor.canteenName}` : ''}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-title">Signalement</div>
            <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.6 }}>{dispute.reason}</div>
            {dispute.ticketAmount != null && (
              <div style={{ fontSize: 13, marginTop: 8 }}>Montant concerné : <strong>{formatTickets(dispute.ticketAmount)}</strong></div>
            )}
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>
              Signalé le {formatDateTime(dispute.createdAt)}
              {dispute.resolvedAt ? ` · traité le ${formatDateTime(dispute.resolvedAt)}` : ''}
            </div>
          </div>

          <div className="card">
            <div className="card-title">Parties concernées</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200, padding: 14, background: '#F8FAFC', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Étudiant</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="initials init-indigo" style={{ width: 32, height: 32, fontSize: 12 }}>{initialsOf(studentName)}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{studentName || '—'}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{student?.phone || '—'}</div>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 200, padding: 14, background: '#F8FAFC', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Cantine</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="initials init-orange" style={{ width: 32, height: 32, fontSize: 12 }}>{initialsOf(vendor?.canteenName)}</span>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{vendor?.canteenName || '—'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Commande #{order?.id.slice(0, 8).toUpperCase()}</div>
            <div style={{ fontSize: 14, color: '#475569' }}>
              {ORDER_STATUS_LABEL[order?.status] ?? order?.status} · {formatTickets(order?.totalTickets)} · {order?.consumptionMode === 'TAKEAWAY' ? 'À emporter' : 'Sur place'}
            </div>
          </div>

          {dispute.status !== 'RESOLVED' && (
            <div className="card">
              <div className="card-title">Traitement</div>
              {submitError && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 8 }}>{submitError}</p>}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {dispute.status === 'OPEN' && (
                  <button className="btn-secondary-sm" disabled={submitting} onClick={() => handleStatus('IN_PROGRESS')}>
                    Prendre en charge
                  </button>
                )}
                <button className="btn-primary-sm" disabled={submitting} onClick={() => handleStatus('RESOLVED')}>
                  {submitting ? 'Enregistrement…' : 'Marquer comme traité'}
                </button>
              </div>
            </div>
          )}
        </div>
      </PageContent>
    </>
  );
}
