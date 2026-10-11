import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';
import { getReport, updateReport } from '../../../services/domain/reportsService';
import { ORDER_STATUS_LABEL } from '../../../utils/orderStatus';
import { REPORT_TYPE_LABEL, REPORT_STATUS_LABEL, REPORT_STATUS_BADGE } from '../../../utils/reportLabels';

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

export default function SignalementDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getReport(id)
      .then(setReport)
      .catch((err) => setError(err.message || 'Signalement introuvable.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleStatus(status) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const updated = await updateReport(id, { status });
      setReport((prev) => ({ ...prev, ...updated }));
    } catch (err) {
      setSubmitError(err.message || 'Échec de la mise à jour.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <>
        <Topbar icon={AlertTriangle} breadcrumb={[{ label: 'Signalements', path: '/admin/signalements' }]} />
        <PageContent><p>Chargement…</p></PageContent>
      </>
    );
  }

  if (error || !report) {
    return (
      <>
        <Topbar icon={AlertTriangle} breadcrumb={[{ label: 'Signalements', path: '/admin/signalements' }]} />
        <PageContent><p style={{ color: '#DC2626' }}>{error || 'Signalement introuvable.'}</p></PageContent>
      </>
    );
  }

  const { student, vendor, order } = report;
  const studentName = `${student?.firstName ?? ''} ${student?.lastName ?? ''}`.trim();
  const shortRef = report.id.slice(0, 8).toUpperCase();

  return (
    <>
      <Topbar
        icon={AlertTriangle}
        breadcrumb={[{ label: 'Signalements', path: '/admin/signalements' }, { label: `#${shortRef}` }]}
        badge={{ text: REPORT_STATUS_LABEL[report.status], tone: report.status === 'OPEN' ? 'red' : 'default' }}
      >
        <button className="btn-secondary-sm" onClick={() => navigate('/admin/signalements')}>← Retour</button>
      </Topbar>
      <PageContent>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.02em' }}>Signalement #{shortRef}</h1>
          <span className={REPORT_STATUS_BADGE[report.status]}>{REPORT_STATUS_LABEL[report.status]}</span>
          <span style={{ fontSize: 14, color: 'var(--muted)' }}>Signalé {timeAgo(report.createdAt)}{vendor ? ` · ${vendor.canteenName}` : ''}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-title">Problème signalé</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{REPORT_TYPE_LABEL[report.type] ?? report.type}</div>
            <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginTop: 6 }}>{report.comment || 'Aucun commentaire.'}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>
              Signalé le {formatDateTime(report.createdAt)}
              {report.resolvedAt ? ` · traité le ${formatDateTime(report.resolvedAt)}` : ''}
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
            <div className="card-title">Commande {order?.orderNumber ?? `#${order?.id.slice(0, 8).toUpperCase()}`}</div>
            <div style={{ fontSize: 14, color: '#475569' }}>
              {ORDER_STATUS_LABEL[order?.status] ?? order?.status} · {formatTickets(order?.totalTickets)} · {order?.consumptionMode === 'TAKEAWAY' ? 'À emporter' : 'Sur place'}
            </div>
            {order?.items?.length > 0 && (
              <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 12px', background: '#F8FAFC', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14 }}
                  >
                    <span>{item.name}</span>
                    <span style={{ fontWeight: 600 }}>× {item.quantity}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {report.status !== 'RESOLVED' && (
            <div className="card">
              <div className="card-title">Traitement</div>
              {submitError && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 8 }}>{submitError}</p>}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {report.status === 'OPEN' && (
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
