import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Ban, Upload, FileImage, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';
import {
  getWithdrawal,
  acceptWithdrawal,
  uploadWithdrawalProof,
  getWithdrawalProof,
  confirmWithdrawal,
  failWithdrawal,
  cancelWithdrawal,
  resolveWithdrawalAppeal,
} from '../../../services/domain/withdrawalsService';

const STATUS_LABEL = {
  PENDING: 'En attente',
  PROCESSING: 'En cours de traitement',
  COMPLETED: 'Versé — fenêtre de signalement ouverte',
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
const APPEAL_LABEL = {
  NOT_RECEIVED: 'Argent non reçu',
  AMOUNT_MISMATCH: 'Montant incorrect',
};

function fcfa(n) {
  return `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;
}
function dateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
}
function operatorLabel(op) {
  return op === 'FLOOZ' ? 'Flooz' : op === 'MIXX' ? 'Mixx' : op || '—';
}
function errorMessage(err) {
  return err?.message || 'Une erreur est survenue.';
}

function DetailRow({ label, value, strong = false }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span style={{ textAlign: 'right', fontWeight: strong ? 700 : 500 }}>{value}</span>
    </div>
  );
}

export default function RetraitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const withdrawalId = decodeURIComponent(id || '');
  const [withdrawal, setWithdrawal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState('');
  const [showReasonFor, setShowReasonFor] = useState(null);
  const [file, setFile] = useState(null);
  const [proofUrl, setProofUrl] = useState(null);
  const [proofLoading, setProofLoading] = useState(false);
  const [appealNote, setAppealNote] = useState({});
  const [appealBusy, setAppealBusy] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setWithdrawal(await getWithdrawal(withdrawalId));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [withdrawalId]);

  useEffect(() => () => { if (proofUrl) URL.revokeObjectURL(proofUrl); }, [proofUrl]);

  const manual = withdrawal?.manualTransfer;
  const hasProof = Boolean(withdrawal?.proof);
  const pendingAppeals = useMemo(
    () => (withdrawal?.appeals || []).filter((a) => a.status === 'PENDING'),
    [withdrawal],
  );

  const doAction = async (action, successMessage) => {
    setBusy(true);
    setActionError(null);
    try {
      await action();
      await load();
      setReason('');
      setShowReasonFor(null);
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    await doAction(() => uploadWithdrawalProof(withdrawalId, file), 'Preuve ajoutée');
    setFile(null);
    const input = document.getElementById('withdrawal-proof-input');
    if (input) input.value = '';
  };

  const handleViewProof = async () => {
    setProofLoading(true);
    setActionError(null);
    try {
      const blob = await getWithdrawalProof(withdrawalId);
      if (proofUrl) URL.revokeObjectURL(proofUrl);
      setProofUrl(URL.createObjectURL(blob));
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setProofLoading(false);
    }
  };

  const resolveAppeal = async (appealId, approved) => {
    const note = String(appealNote[appealId] || '').trim();
    if (note.length < 3) {
      setActionError('Ajoutez une note de vérification avant de traiter la contestation.');
      return;
    }
    setAppealBusy(appealId);
    setActionError(null);
    try {
      await resolveWithdrawalAppeal(appealId, note, approved);
      setAppealNote((current) => ({ ...current, [appealId]: '' }));
      await load();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setAppealBusy(null);
    }
  };

  if (loading) {
    return (
      <>
        <Topbar breadcrumb={[{ label: 'Retraits', path: '/admin/retraits' }, { label: 'Détail' }]} />
        <PageContent><div className="card">Chargement…</div></PageContent>
      </>
    );
  }

  if (error || !withdrawal) {
    return (
      <>
        <Topbar breadcrumb={[{ label: 'Retraits', path: '/admin/retraits' }, { label: 'Détail' }]} />
        <PageContent>
          <div className="notice-banner notice-error">{error || 'Retrait introuvable.'}</div>
          <button className="btn-secondary-sm" onClick={() => navigate('/admin/retraits')}><ArrowLeft size={15} /> Retour aux retraits</button>
        </PageContent>
      </>
    );
  }

  const vendor = withdrawal.vendor;
  const vendorName = `${vendor?.user?.firstName || ''} ${vendor?.user?.lastName || ''}`.trim() || 'Vendeur';
  const canAccept = withdrawal.status === 'PENDING';
  const canProcess = withdrawal.status === 'PROCESSING';
  const canCancel = ['PENDING', 'PROCESSING'].includes(withdrawal.status);
  const deadline = withdrawal.confirmationDeadlineAt ? new Date(withdrawal.confirmationDeadlineAt) : null;
  const deadlineActive = deadline && deadline.getTime() > Date.now() && !withdrawal.autoConfirmedAt;

  return (
    <>
      <Topbar icon={FileImage} breadcrumb={[{ label: 'Retraits', path: '/admin/retraits' }, { label: `#${withdrawal.id.slice(0, 8)}` }]} hidePeriodSelect>
        <button className="btn-secondary-sm" onClick={() => navigate('/admin/retraits')}><ArrowLeft size={15} /> Retour</button>
      </Topbar>
      <PageContent>
        <div className="page-header">
          <div className="eyebrow">Admin web · Retrait manuel</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0 }}>Retrait #{withdrawal.id.slice(0, 8)}</h1>
            <span className={STATUS_TONE[withdrawal.status] || 'badge-gray'}>{STATUS_LABEL[withdrawal.status] || withdrawal.status}</span>
          </div>
          <p>Vérifiez le bénéficiaire et le montant net avant d&apos;effectuer le transfert USSD.</p>
        </div>

        {actionError && <div className="notice-banner notice-error" style={{ marginBottom: 16 }}>{actionError}</div>}

        <div className="two-col" style={{ alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-title">Montant à transférer</div>
              <DetailRow label="Montant brut demandé" value={fcfa(manual?.grossAmountRequested ?? withdrawal.amount)} strong />
              <DetailRow label="Frais retenus par Kabakaba" value={fcfa(manual?.feeRetainedByKabakaba ?? withdrawal.feeRetained)} />
              <DetailRow label="Frais opérateur pris en charge" value={fcfa(manual?.operatorCashFeeCoveredByKabakaba ?? withdrawal.platformFee)} />
              <DetailRow label="Total débité du vendeur" value={fcfa(manual?.totalDebitedFromVendor ?? withdrawal.debitedAmount)} strong />
              <div style={{ marginTop: 14, padding: 18, borderRadius: 12, background: '#F8FAFC', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>Montant exact à envoyer</div>
                <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--indigo)', marginTop: 4 }}>{fcfa(manual?.netAmountToSend ?? withdrawal.payoutAmount ?? withdrawal.amount)}</div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">Bénéficiaire</div>
              <DetailRow label="Vendeur" value={vendorName} />
              <DetailRow label="Cantine" value={vendor?.canteenName || '—'} />
              <DetailRow label="Téléphone" value={manual?.vendorPhone || vendor?.user?.phone || '—'} strong />
              <DetailRow label="Opérateur" value={operatorLabel(manual?.operator || withdrawal.operator)} />
              <DetailRow label="Demande créée" value={dateTime(withdrawal.createdAt)} />
              {withdrawal.acceptedAt && <DetailRow label="Acceptée le" value={dateTime(withdrawal.acceptedAt)} />}
            </div>

            <div className="card">
              <div className="card-title">Preuve de transaction</div>
              <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 0 }}>
                Après le transfert USSD, importez la facture ou le résumé de transaction. JPEG, PNG ou WebP, 5 Mo maximum.
              </p>
              {hasProof ? (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text)' }}>
                    <FileImage size={18} />
                    <span>{withdrawal.proof.originalName}</span>
                  </div>
                  <button className="btn-secondary-sm" onClick={handleViewProof} disabled={proofLoading}>
                    {proofLoading ? 'Ouverture…' : 'Voir la preuve'}
                  </button>
                </div>
              ) : (
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>Aucune preuve déposée.</div>
              )}

              {canProcess && (
                <div style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    id="withdrawal-proof-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <button className="btn-primary-sm" disabled={!file || busy} onClick={handleUpload}>
                    <Upload size={15} /> {busy ? 'Envoi…' : 'Déposer la preuve'}
                  </button>
                </div>
              )}

              {proofUrl && (
                <div style={{ marginTop: 16, padding: 10, background: '#0F172A', borderRadius: 10 }}>
                  <img src={proofUrl} alt="Preuve de transaction" style={{ display: 'block', maxWidth: '100%', maxHeight: 520, margin: '0 auto', objectFit: 'contain' }} />
                </div>
              )}
            </div>

            {withdrawal.appeals?.length > 0 && (
              <div className="card">
                <div className="card-title">Contestations vendeur</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {withdrawal.appeals.map((appeal) => (
                    <div key={appeal.id} style={{ padding: 14, border: '1px solid var(--border)', borderRadius: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                        <strong>{APPEAL_LABEL[appeal.type] || appeal.type}</strong>
                        <span className={appeal.status === 'PENDING' ? 'badge-amber' : appeal.status === 'APPROVED' ? 'badge-green' : 'badge-gray'}>
                          {appeal.status === 'PENDING' ? 'À vérifier' : appeal.status === 'APPROVED' ? 'Approuvée' : 'Rejetée'}
                        </span>
                      </div>
                      <p style={{ marginBottom: 8 }}>{appeal.reason}</p>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>Signalement : {dateTime(appeal.createdAt)}</div>
                      {appeal.status === 'PENDING' && (
                        <div style={{ marginTop: 12 }}>
                          <textarea
                            rows={3}
                            className="form-input"
                            placeholder="Note de vérification (obligatoire)"
                            value={appealNote[appeal.id] || ''}
                            onChange={(e) => setAppealNote((current) => ({ ...current, [appeal.id]: e.target.value }))}
                            maxLength={1000}
                          />
                          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                            <button className="btn-primary-sm" disabled={appealBusy === appeal.id} onClick={() => resolveAppeal(appeal.id, true)}>
                              <CheckCircle2 size={15} /> Confirmer après vérification
                            </button>
                            <button className="btn-secondary-sm" disabled={appealBusy === appeal.id} onClick={() => resolveAppeal(appeal.id, false)}>
                              <XCircle size={15} /> Rejeter
                            </button>
                          </div>
                        </div>
                      )}
                      {appeal.resolutionNote && <div style={{ marginTop: 10, fontSize: 13, color: 'var(--muted)' }}>Résolution : {appeal.resolutionNote}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-title">Workflow manuel</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {canAccept && (
                  <button className="btn-primary-sm" disabled={busy} onClick={() => doAction(() => acceptWithdrawal(withdrawalId))}>
                    <CheckCircle2 size={16} /> Accepter la demande
                  </button>
                )}

                {canProcess && (
                  <>
                    <div style={{ padding: 12, borderRadius: 10, background: '#FFF7ED', border: '1px solid #FED7AA', fontSize: 13 }}>
                      <strong>Étape 1 :</strong> vérifiez le numéro, ouvrez votre USSD et envoyez exactement <strong>{fcfa(manual?.netAmountToSend ?? withdrawal.payoutAmount ?? withdrawal.amount)}</strong>.
                    </div>
                    <div style={{ padding: 12, borderRadius: 10, background: '#F8FAFC', border: '1px solid var(--border)', fontSize: 13 }}>
                      <strong>Étape 2 :</strong> récupérez la facture / le résumé de transaction puis déposez la preuve ci-dessus.
                    </div>
                    <button className="btn-primary-sm" disabled={busy || !hasProof} onClick={() => doAction(() => confirmWithdrawal(withdrawalId))}>
                      <CheckCircle2 size={16} /> Valider le paiement et notifier le vendeur
                    </button>
                    {!hasProof && <div style={{ fontSize: 12, color: 'var(--muted)' }}>La preuve est obligatoire avant la validation.</div>}
                    {showReasonFor === 'fail' ? (
                      <div>
                        <textarea className="form-input" rows={3} maxLength={500} placeholder="Motif de l'échec" value={reason} onChange={(e) => setReason(e.target.value)} />
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button className="btn-secondary-sm" disabled={busy || reason.trim().length < 3} onClick={() => doAction(() => failWithdrawal(withdrawalId, reason.trim()))}><XCircle size={15} /> Confirmer l&apos;échec</button>
                          <button className="btn-secondary-sm" disabled={busy} onClick={() => setShowReasonFor(null)}>Annuler</button>
                        </div>
                      </div>
                    ) : (
                      <button className="btn-secondary-sm" disabled={busy} onClick={() => setShowReasonFor('fail')}><XCircle size={15} /> Déclarer le transfert non abouti</button>
                    )}
                  </>
                )}

                {canCancel && (
                  showReasonFor === 'cancel' ? (
                    <div>
                      <textarea className="form-input" rows={3} maxLength={500} placeholder="Motif de l'annulation" value={reason} onChange={(e) => setReason(e.target.value)} />
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button className="btn-secondary-sm" disabled={busy || reason.trim().length < 3} onClick={() => doAction(() => cancelWithdrawal(withdrawalId, reason.trim()))}><Ban size={15} /> Confirmer l&apos;annulation</button>
                        <button className="btn-secondary-sm" disabled={busy} onClick={() => setShowReasonFor(null)}>Annuler</button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn-secondary-sm" disabled={busy} onClick={() => setShowReasonFor('cancel')}><Ban size={15} /> Annuler la demande</button>
                  )
                )}
              </div>
            </div>

            <div className="card" style={{ background: '#F8FAFC' }}>
              <div className="card-title">Suivi</div>
              <DetailRow label="Statut" value={<span className={STATUS_TONE[withdrawal.status] || 'badge-gray'}>{STATUS_LABEL[withdrawal.status]}</span>} />
              <DetailRow label="Preuve" value={hasProof ? 'Déposée' : 'Manquante'} />
              {withdrawal.paidAt && <DetailRow label="Paiement validé" value={dateTime(withdrawal.paidAt)} />}
              {deadline && <DetailRow label="Fin du délai de signalement" value={dateTime(deadline)} />}
              {withdrawal.autoConfirmedAt && <DetailRow label="Auto-confirmé" value={dateTime(withdrawal.autoConfirmedAt)} />}
              {deadlineActive && (
                <div style={{ marginTop: 12, display: 'flex', gap: 8, color: 'var(--muted)', fontSize: 12 }}>
                  <Clock size={15} /> Le vendeur peut encore signaler un problème pendant cette fenêtre.
                </div>
              )}
              {withdrawal.failureReason && <div style={{ marginTop: 12, color: '#B91C1C', fontSize: 13 }}><AlertTriangle size={14} style={{ verticalAlign: 'middle' }} /> {withdrawal.failureReason}</div>}
              {withdrawal.cancellationReason && <div style={{ marginTop: 12, color: 'var(--muted)', fontSize: 13 }}>Motif d&apos;annulation : {withdrawal.cancellationReason}</div>}
            </div>
          </div>
        </div>
      </PageContent>
    </>
  );
}
