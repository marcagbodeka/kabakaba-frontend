import { useEffect, useState } from 'react';
import { Trophy, ChevronDown, Check, X, ImageIcon } from 'lucide-react';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';
import { getPendingAmbassadors, acceptAmbassadorApplication, refuseAmbassadorApplication } from '../../../services/domain/applicationsService';

function initialsOf(first, last) {
  return `${(first || '?')[0]}${(last || '?')[0]}`.toUpperCase();
}

function timeAgo(iso) {
  if (!iso) return '—';
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return "Reçu à l'instant";
  if (hours < 24) return `Reçu il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Reçu hier';
  return `Reçu il y a ${days}j`;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DemandesAmbassadeur() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [demandes, setDemandes] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [refusingId, setRefusingId] = useState(null);
  const [motif, setMotif] = useState('');
  const [acceptTargetId, setAcceptTargetId] = useState(null); // id en cours de confirmation
  const [acceptResult, setAcceptResult] = useState(null); // { name, university, promoCode } une fois généré
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    setError(null);
    getPendingAmbassadors(50)
      .then((res) => {
        const list = res.data || [];
        setDemandes(list);
        setOpenId(list[0]?.id ?? null);
      })
      .catch((err) => setError(err.message || 'Impossible de charger les demandes.'))
      .finally(() => setLoading(false));
  }

  const pendingCount = demandes.length;
  const acceptTarget = demandes.find((d) => d.id === acceptTargetId);

  async function handleRefuse(id) {
    setBusyId(id);
    setActionError(null);
    try {
      await refuseAmbassadorApplication(id, motif);
      setDemandes((prev) => prev.filter((d) => d.id !== id));
      setRefusingId(null);
      setMotif('');
    } catch (err) {
      setActionError(err.message || 'Échec du refus.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleConfirmAccept() {
    if (!acceptTarget) return;
    setBusyId(acceptTarget.id);
    setActionError(null);
    try {
      const updated = await acceptAmbassadorApplication(acceptTarget.id);
      setAcceptResult({
        name: `${acceptTarget.user?.firstName ?? ''} ${acceptTarget.user?.lastName ?? ''}`.trim(),
        university: acceptTarget.institution || acceptTarget.user?.campus?.name || '—',
        promoCode: updated.promoCode,
      });
      setDemandes((prev) => prev.filter((d) => d.id !== acceptTarget.id));
      setAcceptTargetId(null);
    } catch (err) {
      setActionError(err.message || "Échec de l'acceptation.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <>
        <Topbar icon={Trophy} breadcrumb={[{ label: 'Ambassadeurs', path: '/admin/ambassadeurs' }, { label: 'Demandes en attente' }]} />
        <PageContent><p>Chargement…</p></PageContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Topbar icon={Trophy} breadcrumb={[{ label: 'Ambassadeurs', path: '/admin/ambassadeurs' }, { label: 'Demandes en attente' }]} />
        <PageContent><p style={{ color: '#DC2626' }}>{error}</p></PageContent>
      </>
    );
  }

  return (
    <>
      <Topbar
        icon={Trophy}
        breadcrumb={[{ label: 'Ambassadeurs', path: '/admin/ambassadeurs' }, { label: 'Demandes en attente' }]}
        badge={{ text: `${pendingCount} en attente`, tone: pendingCount > 0 ? 'red' : 'default' }}
      />
      <PageContent>
        <div className="page-header">
      <div className="eyebrow">Admin web · Ambassadeurs</div>
          <h1>Demandes de statut ambassadeur</h1>
          <p>Chaque demande doit être traitée manuellement. Le code promo est généré uniquement à l&apos;acceptation.</p>
        </div>

        {demandes.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
            Aucune demande en attente.
          </div>
        )}

        {demandes.map((d) => {
          const open = openId === d.id;
          const fullName = `${d.user?.firstName ?? ''} ${d.user?.lastName ?? ''}`.trim() || '—';
          const meta = [d.institution, d.faculty, d.user?.phone, timeAgo(d.createdAt)].filter(Boolean).join(' · ');
          const isBusy = busyId === d.id;
          return (
            <div className="demande-card" key={d.id}>
              <div className="demande-header" onClick={() => setOpenId(open ? null : d.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="initials init-indigo" style={{ width: 40, height: 40, borderRadius: 12, fontSize: 14 }}>
                    {initialsOf(d.user?.firstName, d.user?.lastName)}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{fullName}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{meta}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="badge-amber">En attente</span>
                  <ChevronDown size={18} className={`dem-chevron ${open ? 'open' : ''}`} />
                </div>
              </div>

              {open && (
                <div className="demande-body">
                  <div className="two-col" style={{ marginTop: 0 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>
                        Informations déclarées
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                        <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 130, flexShrink: 0 }}>Nom complet</span><strong>{fullName}</strong></div>
                        <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 130, flexShrink: 0 }}>Téléphone</span><strong>{d.user?.phone || '—'}</strong></div>
                        <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 130, flexShrink: 0 }}>Université</span><strong>{d.institution || '—'}</strong></div>
                        <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 130, flexShrink: 0 }}>Faculté</span><strong>{d.faculty || '—'}</strong></div>
                        <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 130, flexShrink: 0 }}>Inscrit sur l&apos;app</span><strong>{formatDate(d.user?.createdAt)}</strong></div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>
                        Pièce justificative
                      </div>
                      {d.schoolCardUrl ? (
                        <div style={{ width: '100%', aspectRatio: '3/2', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden', position: 'relative' }}>
                          <img src={d.schoolCardUrl} alt="Carte scolaire" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <a
                            href={d.schoolCardUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-secondary-sm"
                            style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', padding: '6px 12px', fontSize: 13 }}
                          >
                            Voir en taille réelle
                          </a>
                        </div>
                      ) : (
                        <div style={{ width: '100%', aspectRatio: '3/2', background: '#F1F5F9', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#94A3B8' }}>
                          <ImageIcon size={36} />
                          <span style={{ fontSize: 13 }}>Aucune pièce jointe</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                    <button className="btn-primary-sm" disabled={isBusy} onClick={() => setAcceptTargetId(d.id)}>
                      <Check size={15} /> Accepter — générer le code promo
                    </button>
                    <button className="btn-danger-sm" disabled={isBusy} onClick={() => setRefusingId(refusingId === d.id ? null : d.id)}>
                      <X size={15} /> Refuser
                    </button>

                    {refusingId === d.id && (
                      <div style={{ width: '100%', marginTop: 4 }}>
                        <div className="field-group">
                          <label className="fg-label">Motif du refus (obligatoire)</label>
                          <textarea
                            className="fg-input"
                            rows={2}
                            placeholder="Ex : carte scolaire illisible, université non couverte..."
                            value={motif}
                            onChange={(e) => setMotif(e.target.value)}
                          />
                        </div>
                        {actionError && busyId === null && <p style={{ color: '#DC2626', fontSize: 13, marginTop: 6 }}>{actionError}</p>}
                        <button className="btn-danger-sm" style={{ marginTop: 8 }} disabled={!motif || isBusy} onClick={() => handleRefuse(d.id)}>
                          {isBusy ? 'Refus…' : 'Confirmer le refus'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </PageContent>

      {acceptTarget && (
        <div className="modal-overlay" onClick={() => !busyId && setAcceptTargetId(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={20} color="#16A34A" />
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>Accepter la demande</div>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>
                  {`${acceptTarget.user?.firstName ?? ''} ${acceptTarget.user?.lastName ?? ''}`.trim()} · {acceptTarget.institution || '—'}
                </div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>
              Un code de parrainage unique sera généré pour cet ambassadeur et lui sera communiqué par
              notification.
            </p>
            {actionError && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{actionError}</p>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-secondary-sm" disabled={busyId === acceptTarget.id} onClick={() => setAcceptTargetId(null)}>Annuler</button>
              <button className="btn-primary-sm" disabled={busyId === acceptTarget.id} onClick={handleConfirmAccept}>
                <Check size={15} /> {busyId === acceptTarget.id ? 'Génération…' : "Confirmer l'acceptation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {acceptResult && (
        <div className="modal-overlay" onClick={() => setAcceptResult(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={20} color="#16A34A" />
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>Demande acceptée</div>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>{acceptResult.name} · {acceptResult.university}</div>
              </div>
            </div>
            <div style={{ padding: 16, background: '#F0FDF4', borderRadius: 12, border: '1px solid #BBF7D0', textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#166534', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>
                Code promo généré
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--indigo)', fontFamily: 'monospace', letterSpacing: '.1em' }}>
                {acceptResult.promoCode}
              </div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Communiqué à l&apos;étudiant par notification push</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary-sm" onClick={() => setAcceptResult(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
