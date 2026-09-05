import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Check, AlertCircle } from 'lucide-react';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';
import { getDisputeContext, updateDispute } from '../../../services/domain/disputesService';
import { updateUser } from '../../../services/domain/usersService';
import { useAuth } from '../../../context/AuthContext';

const STATUS_LABEL = { OPEN: 'Ouvert', IN_PROGRESS: 'En cours', RESOLVED: 'Traité' };
const STATUS_TONE = { OPEN: { background: '#FEE2E2', color: '#B91C1C' }, IN_PROGRESS: { background: '#FFEDD5', color: '#C2410C' } };

const ORDER_STEP_LABEL = {
  PENDING: 'Commande passée', ACCEPTED: 'Acceptée par le vendeur', IN_PREPARATION: 'En préparation',
  READY: 'Marquée Prête', RECEIVED: 'Reçue par l’étudiant', AUTO_RECEIVED: 'Auto-réception déclenchée',
  REFUSED: 'Refusée par le vendeur', CANCELLED_VENDOR: 'Annulée par le vendeur', REFUNDED: 'Remboursée',
};

const DECISIONS = [
  { key: 'REFUND', title: "Rembourser l'étudiant", desc: 'Débite le vendeur et recrédite l’étudiant. Si solde insuffisant, la plateforme avance (créance vendeur).' },
  { key: 'SUSPENSION_ADJUSTMENT', title: 'Ajuster / lever une suspension', desc: 'Modifier ou annuler une suspension étudiant liée à ce litige.' },
  { key: 'CLOSE_NO_ACTION', title: 'Clôturer sans action', desc: 'Le litige est non fondé ou résolu par les parties.' },
];

function initialsOf(name) {
  return (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';
}
function formatFcfa(n) { return `${Number(n || 0).toLocaleString('fr-FR')} FCFA`; }
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
  const [ctx, setCtx] = useState(null);

  const [decision, setDecision] = useState(null);
  const [note, setNote] = useState('');
  const [liftRequested, setLiftRequested] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getDisputeContext(id)
      .then(setCtx)
      .catch((err) => setError(err.message || 'Litige introuvable.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleConfirm(decisionKey) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (decisionKey === 'SUSPENSION_ADJUSTMENT' && liftRequested && ctx.student.isSuspended) {
        await updateUser(ctx.student.id, { isSuspended: false });
      }
      await updateDispute(id, {
        status: 'RESOLVED',
        decision: decisionKey,
        decisionNote: note,
        ...(currentAdmin?.id ? { treatedByWebUserId: currentAdmin.id } : {}),
      });
      navigate('/admin/litiges');
    } catch (err) {
      setSubmitError(err.message || 'Échec de la résolution.');
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

  if (error || !ctx) {
    return (
      <>
        <Topbar icon={AlertTriangle} breadcrumb={[{ label: 'Litiges', path: '/admin/litiges' }]} />
        <PageContent><p style={{ color: '#DC2626' }}>{error || 'Litige introuvable.'}</p></PageContent>
      </>
    );
  }

  const { dispute, student, vendor, order, signals } = ctx;
  const shortRef = dispute.id.slice(0, 8).toUpperCase();
  const isResolved = dispute.status === 'RESOLVED';
  const refundAmount = dispute.ticketAmount ?? order.totalTickets;
  const vendorCanCoverRefund = vendor.balanceFcfa >= refundAmount;

  const timelineSteps = [
    { label: ORDER_STEP_LABEL.PENDING, time: formatDateTime(order.createdAt), done: true },
    ...order.statusHistory.map((h) => ({ label: ORDER_STEP_LABEL[h.newStatus] || h.newStatus, time: formatDateTime(h.createdAt), done: true })),
    { label: 'Litige signalé', time: `${formatDateTime(dispute.createdAt)} · motif : ${dispute.reason}`, alert: true },
  ];

  return (
    <>
      <Topbar
        icon={AlertTriangle}
        breadcrumb={[{ label: 'Litiges', path: '/admin/litiges' }, { label: `#${shortRef}` }]}
        badge={{ text: STATUS_LABEL[dispute.status] }}
      >
        <button className="btn-secondary-sm" onClick={() => navigate('/admin/litiges')}>← Retour</button>
      </Topbar>
      <PageContent>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.02em' }}>Litige #{shortRef}</h1>
          {isResolved ? (
            <span className="badge-green">Traité</span>
          ) : (
            <span style={{ ...STATUS_TONE[dispute.status], fontSize: 13, fontWeight: 600, padding: '5px 12px', borderRadius: 20 }}>
              {STATUS_LABEL[dispute.status]}
            </span>
          )}
          <span style={{ fontSize: 14, color: 'var(--muted)' }}>Signalé {timeAgo(dispute.createdAt)} · {vendor.canteenName} · {vendor.campusName}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-title">Parties concernées</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200, padding: 14, background: '#F8FAFC', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Étudiant</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span className="initials init-indigo" style={{ width: 32, height: 32, fontSize: 12 }}>{initialsOf(student.name)}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{student.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{student.phone || '—'}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Inscrit le {formatDateTime(student.memberSince)} · {student.campusName}</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Solde actuel : <strong>{formatTickets(student.walletBalance)}</strong></div>
                {student.isSuspended && <div style={{ fontSize: 12, color: '#B91C1C', marginTop: 4 }}>Actuellement suspendu{student.suspensionReason ? ` — ${student.suspensionReason}` : ''}</div>}
              </div>
              <div style={{ flex: 1, minWidth: 200, padding: 14, background: '#F8FAFC', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Vendeur</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span className="initials init-orange" style={{ width: 32, height: 32, fontSize: 12 }}>{initialsOf(vendor.canteenName)}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{vendor.canteenName}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{vendor.ownerName}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Campus {vendor.campusName} · {vendor.isActive ? 'Actif' : 'Suspendu'}</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Solde vendeur : <strong>{formatFcfa(vendor.balanceFcfa)}</strong></div>
              </div>
            </div>
          </div>

          <div className="two-col" style={{ alignItems: 'start', marginBottom: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card">
                <div className="card-title">Timeline de la commande #{order.id.slice(0, 8).toUpperCase()}</div>
                <div className="card-sub">{formatTickets(order.totalTickets)}{order.packagingOptionName ? ` · ${order.packagingOptionName}` : ''}</div>
                <div className="timeline">
                  {timelineSteps.map((t, i) => (
                    <div className="tl-item" key={i}>
                      <div className={`tl-dot ${t.alert ? 'alert' : t.done ? 'done' : ''}`} />
                      <div className="tl-content">
                        <div className="tl-label" style={t.alert ? { color: '#DC2626' } : undefined}>{t.label}</div>
                        <div className="tl-time">{t.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {order.review ? (
                <div className="card" style={{ background: '#FFFBF5', borderColor: '#FED7AA' }}>
                  <div className="card-title" style={{ fontSize: 15 }}>Avis laissé par l&apos;étudiant sur cette commande</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span className="comment-stars">{'★'.repeat(order.review.rating)}{'☆'.repeat(5 - order.review.rating)}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#92400E' }}>{order.review.rating}/5</span>
                  </div>
                  {order.review.comment && (
                    <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, fontStyle: 'italic' }}>&quot;{order.review.comment}&quot;</div>
                  )}
                </div>
              ) : (
                <div className="card">
                  <div className="card-sub" style={{ marginBottom: 0 }}>L&apos;étudiant n&apos;a pas laissé d&apos;avis sur cette commande.</div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ borderTop: '3px solid var(--indigo)' }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Éléments d&apos;instruction</div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Profil étudiant</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <SignalRow ok={signals.student.disputesThisMonth === 0} text={`${signals.student.disputesThisMonth} litige${signals.student.disputesThisMonth === 1 ? '' : 's'} signalé${signals.student.disputesThisMonth === 1 ? '' : 's'} ce mois`} />
                    <SignalRow ok text={`${signals.student.incidentFreeOrders} commande${signals.student.incidentFreeOrders === 1 ? '' : 's'} sans incident (historique)`} />
                    <SignalRow ok={signals.student.neverSuspended} text={signals.student.neverSuspended ? 'Compte jamais suspendu' : `${signals.student.suspensionCount} suspension(s) au total`} />
                    {signals.student.thisOrderAutoReceived && <SignalRow ok={false} text="Auto-réception : n'a pas confirmé dans l'heure" />}
                    <SignalRow ok text={`${signals.student.ordersWithThisVendor} commande${signals.student.ordersWithThisVendor === 1 ? '' : 's'} chez ce vendeur`} />
                  </div>
                </div>

                <div style={{ height: 1, background: 'var(--border)', margin: '4px 0 14px' }} />

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Profil vendeur</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {signals.vendor.acceptanceRate != null && <SignalRow ok={signals.vendor.acceptanceRate >= 80} text={`Taux d'acceptation : ${signals.vendor.acceptanceRate}%`} />}
                    <SignalRow ok={signals.vendor.similarDisputesLast6Months <= 1} text={`${signals.vendor.similarDisputesLast6Months} litige(s) en 6 mois`} />
                    {signals.vendor.avgPrepMinutes != null && <SignalRow ok text={`Temps moyen de préparation : ${signals.vendor.avgPrepMinutes} min`} />}
                    {signals.vendor.avgRating30d != null ? (
                      <SignalRow ok={signals.vendor.avgRating30d >= 3.5} text={`Note moyenne : ${signals.vendor.avgRating30d}/5 sur 30 jours (${signals.vendor.reviewCount30d} avis)`} />
                    ) : (
                      <SignalRow ok text="Aucun avis sur les 30 derniers jours" />
                    )}
                  </div>
                </div>
              </div>

              {isResolved ? (
                <div className="card">
                  <div className="card-title">Décision appliquée</div>
                  <div style={{ fontSize: 14, color: '#475569' }}>
                    {DECISIONS.find((d) => d.key === dispute.decision)?.title || dispute.decision} · résolu le {formatDateTime(dispute.resolvedAt)}
                  </div>
                  {dispute.decisionNote && <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8, fontStyle: 'italic' }}>&quot;{dispute.decisionNote}&quot;</div>}
                </div>
              ) : (
                <div className="card">
                  <div className="card-title">Décision</div>
                  <div className="card-sub">Choisissez l&apos;action à appliquer pour résoudre ce litige</div>

                  {DECISIONS.map((d) => (
                    <div key={d.key} className={`decision-option ${decision === d.key ? 'selected' : ''}`} style={{ marginTop: d.key !== 'REFUND' ? 10 : 0 }} onClick={() => setDecision(d.key)}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div className="decision-radio">{decision === d.key && <div className="decision-radio-dot" />}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>{d.title}</div>
                          <div style={{ fontSize: 13, color: 'var(--muted)' }}>{d.desc}</div>
                        </div>
                      </div>

                      {decision === d.key && (
                        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }} onClick={(e) => e.stopPropagation()}>
                          {d.key === 'REFUND' && (
                            <>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                <span style={{ fontSize: 14, color: '#475569' }}>Montant à rembourser</span>
                                <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--indigo)' }}>{formatTickets(refundAmount)}</span>
                              </div>
                              <div style={{ padding: '12px 14px', borderRadius: 10, fontSize: 13, marginBottom: 12, ...(vendorCanCoverRefund ? { background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534' } : { background: '#FFF7ED', border: '1px solid #FED7AA', color: '#92400E' }) }}>
                                {vendorCanCoverRefund
                                  ? `Solde vendeur suffisant (${formatFcfa(vendor.balanceFcfa)}) · débit immédiat`
                                  : `Solde vendeur insuffisant (${formatFcfa(vendor.balanceFcfa)}) · la plateforme avance la différence, créance ouverte sur le vendeur`}
                              </div>
                            </>
                          )}
                          {d.key === 'SUSPENSION_ADJUSTMENT' && (
                            student.isSuspended ? (
                              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: '#FFF7ED', borderRadius: 10, border: '1px solid #FED7AA', fontSize: 13, color: '#92400E', marginBottom: 12, cursor: 'pointer' }}>
                                <input type="checkbox" checked={liftRequested} onChange={(e) => setLiftRequested(e.target.checked)} style={{ marginTop: 2, accentColor: 'var(--indigo)' }} />
                                <span>Lever la suspension actuelle de {student.name}{student.suspensionReason ? ` (motif : ${student.suspensionReason})` : ''} en confirmant cette décision.</span>
                              </label>
                            ) : (
                              <div style={{ padding: '12px 14px', background: '#FFF7ED', borderRadius: 10, border: '1px solid #FED7AA', fontSize: 13, color: '#92400E', marginBottom: 12 }}>
                                {student.name} n&apos;est pas actuellement suspendu(e).
                              </div>
                            )
                          )}
                          <div className="field-group">
                            <label className="fg-label">{d.key === 'CLOSE_NO_ACTION' ? 'Motif de clôture (obligatoire)' : 'Note interne'}</label>
                            <textarea className="fg-input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder={d.key === 'CLOSE_NO_ACTION' ? 'Ex : litige non fondé, commande reçue confirmée...' : 'Justification de la décision...'} />
                          </div>
                          {submitError && <p style={{ color: '#DC2626', fontSize: 13, marginTop: 8 }}>{submitError}</p>}
                          <button
                            className={d.key === 'REFUND' ? 'btn-primary-sm' : 'btn-secondary-sm'}
                            style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
                            disabled={submitting || (d.key === 'CLOSE_NO_ACTION' && !note)}
                            onClick={() => handleConfirm(d.key)}
                          >
                            {submitting ? 'Enregistrement…' : d.key === 'REFUND' ? 'Confirmer le remboursement' : d.key === 'SUSPENSION_ADJUSTMENT' ? 'Enregistrer la décision' : 'Clôturer le litige'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </PageContent>
    </>
  );
}

function SignalRow({ ok, text }) {
  return (
    <div className={`signal-row ${ok ? 'signal-good' : 'signal-warn'}`}>
      {ok ? <Check size={13} /> : <AlertCircle size={13} />}
      <span>{text}</span>
    </div>
  );
}
