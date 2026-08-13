import { useState } from 'react';
import { Trophy, ChevronDown, Check, X, ImageIcon } from 'lucide-react';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';

const demandesInit = [
  {
    id: 'dem-1', initials: 'NK', init: 'init-indigo', name: 'Nana Klu',
    meta: 'UCAO · Faculté des Sciences · +228 91 11 22 33 · Reçu il y a 2h',
    university: 'UCAO', faculty: 'Faculté des Sciences', phone: '+228 91 11 22 33', joined: '3 jan. 2026',
    code: 'NAN-2026', status: 'pending',
  },
  {
    id: 'dem-2', initials: 'BS', init: 'init-orange', name: 'Bawa Sabi',
    meta: 'UL · Faculté de Médecine · +228 97 44 55 11 · Reçu il y a 5h',
    university: 'UL', faculty: 'Faculté de Médecine', phone: '+228 97 44 55 11', joined: '8 jan. 2026',
    code: 'BAW-2026', status: 'pending',
  },
  {
    id: 'dem-3', initials: 'TA', init: 'init-gray', name: 'Têko Agbovi',
    meta: 'UCAO · Institut de Technologie · +228 90 66 77 88 · Reçu hier',
    university: 'UCAO', faculty: 'Institut de Technologie', phone: '+228 90 66 77 88', joined: '2 jan. 2026',
    code: 'TEK-2026', status: 'pending',
  },
];

export default function DemandesAmbassadeur() {
  const [demandes, setDemandes] = useState(demandesInit);
  const [openId, setOpenId] = useState('dem-1');
  const [refusingId, setRefusingId] = useState(null);
  const [motif, setMotif] = useState('');
  const [acceptModal, setAcceptModal] = useState(null); // demande en cours d'acceptation

  const pendingCount = demandes.filter((d) => d.status === 'pending').length;

  const handleRefuse = (id) => {
    setDemandes((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'refused' } : d)));
    setRefusingId(null);
    setMotif('');
  };

  const handleAccept = (id) => {
    setDemandes((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'accepted' } : d)));
    setAcceptModal(null);
  };

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

        {demandes.map((d) => {
          const open = openId === d.id;
          return (
            <div className="demande-card" key={d.id}>
              <div className="demande-header" onClick={() => setOpenId(open ? null : d.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`initials ${d.init}`} style={{ width: 40, height: 40, borderRadius: 12, fontSize: 14 }}>{d.initials}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{d.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{d.meta}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {d.status === 'pending' && <span className="badge-amber">En attente</span>}
                  {d.status === 'accepted' && <span className="badge-green">Acceptée</span>}
                  {d.status === 'refused' && <span className="badge-gray">Refusée</span>}
                  <ChevronDown size={18} className={`dem-chevron ${open ? 'open' : ''}`} />
                </div>
              </div>

              {open && (
                <div className="demande-body">
                  {d.status !== 'pending' ? (
                    <div style={{ fontSize: 14, color: 'var(--muted)', textAlign: 'center', padding: '12px 0' }}>
                      {d.status === 'accepted'
                        ? `Demande acceptée — code promo ${d.code} généré.`
                        : 'Demande refusée.'}
                    </div>
                  ) : (
                    <>
                      <div className="two-col" style={{ marginTop: 0 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>
                            Informations déclarées
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                            <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 130, flexShrink: 0 }}>Nom complet</span><strong>{d.name}</strong></div>
                            <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 130, flexShrink: 0 }}>Téléphone</span><strong>{d.phone}</strong></div>
                            <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 130, flexShrink: 0 }}>Université</span><strong>{d.university}</strong></div>
                            <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 130, flexShrink: 0 }}>Faculté</span><strong>{d.faculty}</strong></div>
                            <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 130, flexShrink: 0 }}>Inscrit sur l&apos;app</span><strong>{d.joined}</strong></div>
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>
                            Pièce justificative
                          </div>
                          <div style={{ width: '100%', aspectRatio: '3/2', background: '#F1F5F9', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#94A3B8' }}>
                            <ImageIcon size={36} />
                            <span style={{ fontSize: 13 }}>Carte scolaire 2025–2026</span>
                            <button className="btn-secondary-sm" style={{ padding: '6px 12px', fontSize: 13 }}>Voir en taille réelle</button>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 10, marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                        <button className="btn-primary-sm" onClick={() => setAcceptModal(d)}>
                          <Check size={15} /> Accepter — générer le code promo
                        </button>
                        <button className="btn-danger-sm" onClick={() => setRefusingId(refusingId === d.id ? null : d.id)}>
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
                            <button className="btn-danger-sm" style={{ marginTop: 8 }} disabled={!motif} onClick={() => handleRefuse(d.id)}>
                              Confirmer le refus
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </PageContent>

      {acceptModal && (
        <div className="modal-overlay" onClick={() => setAcceptModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={20} color="#16A34A" />
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>Accepter la demande</div>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>{acceptModal.name} · {acceptModal.university}</div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>
              Un code de parrainage unique sera généré pour cet ambassadeur et lui sera communiqué par
              notification.
            </p>
            <div style={{ padding: 16, background: '#F0FDF4', borderRadius: 12, border: '1px solid #BBF7D0', textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#166534', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>
                Code promo généré
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--indigo)', fontFamily: 'monospace', letterSpacing: '.1em' }}>
                {acceptModal.code}
              </div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Communiqué à l&apos;étudiant par notification push</div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-secondary-sm" onClick={() => setAcceptModal(null)}>Annuler</button>
              <button className="btn-primary-sm" onClick={() => handleAccept(acceptModal.id)}>
                <Check size={15} /> Confirmer l&apos;acceptation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}