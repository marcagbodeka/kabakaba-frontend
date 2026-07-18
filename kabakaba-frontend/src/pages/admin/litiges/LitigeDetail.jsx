import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Check, AlertCircle } from 'lucide-react';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';

const signalsStudent = [
  { ok: true, text: '0 litige signalé ce mois' },
  { ok: true, text: '12 commandes sans incident (historique)' },
  { ok: true, text: 'Compte jamais suspendu' },
  { ok: false, text: "Auto-réception : n'a pas confirmé dans l'heure" },
  { ok: true, text: '3 commandes chez ce vendeur sans problème' },
];

const signalsVendor = [
  { ok: true, text: "Taux d'acceptation : 94% (très bon)" },
  { ok: true, text: '1 seul litige similaire en 6 mois' },
  { ok: true, text: 'Temps moyen de préparation : 18 min' },
  { ok: true, text: 'Note moyenne : 4,2/5 sur 30 jours' },
];

const decisions = [
  {
    key: 'remb',
    title: "Rembourser l'étudiant",
    desc: 'Débiter le vendeur et recréditer l\u2019étudiant. Si solde insuffisant, la plateforme avance.',
  },
  {
    key: 'susp',
    title: 'Ajuster / lever une suspension',
    desc: 'Modifier ou annuler une suspension étudiant liée à ce litige.',
  },
  {
    key: 'close',
    title: 'Clôturer sans action',
    desc: 'Le litige est non fondé ou résolu par les parties.',
  },
];

export default function LitigeDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [decision, setDecision] = useState(null);
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    // TODO: appeler l'API de résolution du litige une fois le backend prêt
    navigate('/admin/litiges');
  };

  return (
    <>
      <Topbar
        icon={AlertTriangle}
        breadcrumb={[{ label: 'Litiges', path: '/admin/litiges' }, { label: `#${id || 'LIT-0041'}` }]}
        badge={{ text: 'Ouvert', tone: 'red' }}
      >
        <button className="btn-secondary-sm" onClick={() => navigate('/admin/litiges')}>← Retour</button>
      </Topbar>
      <PageContent>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.02em' }}>Litige #{id || 'LIT-0041'}</h1>
          <span style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 13, fontWeight: 600, padding: '5px 12px', borderRadius: 20 }}>Ouvert</span>
          <span style={{ fontSize: 14, color: 'var(--muted)' }}>Signalé il y a 1h · Cantine Centrale · UCAO</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-title">Parties concernées</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200, padding: 14, background: '#F8FAFC', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Étudiant</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span className="initials init-indigo" style={{ width: 32, height: 32, fontSize: 12 }}>AK</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>Ama Kokou</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>+228 91 23 45 67</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Inscrit le 3 jan. 2026 · UCAO</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Solde actuel : <strong>1 450 tickets</strong></div>
              </div>
              <div style={{ flex: 1, minWidth: 200, padding: 14, background: '#F8FAFC', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Vendeur</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span className="initials init-orange" style={{ width: 32, height: 32, fontSize: 12 }}>CC</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>Cantine Centrale</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>Koffi Agbénou</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Campus UCAO · Actif</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Solde vendeur : <strong>42 300 FCFA</strong></div>
              </div>
            </div>
          </div>

          <div className="two-col" style={{ alignItems: 'start', marginBottom: 0 }}>
            {/* Colonne gauche : timeline + versions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card">
                <div className="card-title">Timeline de la commande #CMD-2847</div>
                <div className="card-sub">Menu midi complet · 800 tickets · Sur place</div>
                <div className="timeline">
                  {[
                    { label: 'Commande passée', time: '11:03 · tickets mis en séquestre (800)', done: true },
                    { label: 'Acceptée par le vendeur', time: '11:04 · délai : 1 min · taux habituel : 94%', done: true },
                    { label: 'Marquée Prête', time: '11:22 · débit de 800 tickets · portefeuille vendeur crédité', done: true },
                    { label: 'Auto-réception déclenchée', time: '12:22 · 1h sans confirmation étudiant', done: true },
                    { label: 'Litige signalé', time: '12:35 · motif : commande non reçue', alert: true },
                  ].map((t) => (
                    <div className="tl-item" key={t.label}>
                      <div className={`tl-dot ${t.alert ? 'alert' : t.done ? 'done' : ''}`} />
                      <div className="tl-content">
                        <div className="tl-label" style={t.alert ? { color: '#DC2626' } : undefined}>{t.label}</div>
                        <div className="tl-time">{t.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ background: '#FFFBF5', borderColor: '#FED7AA' }}>
                <div className="card-title" style={{ fontSize: 15 }}>Version du vendeur</div>
                <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, fontStyle: 'italic' }}>
                  &quot;La commande était prête à 11h22 et posée sur le comptoir avec le numéro de ticket.
                  L&apos;étudiant ne s&apos;est pas présenté dans l&apos;heure.&quot;
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 8 }}>Soumis depuis l&apos;app mobile · 13:10</div>
              </div>

              <div className="card" style={{ background: '#FFFBF5', borderColor: '#FED7AA' }}>
                <div className="card-title" style={{ fontSize: 15 }}>Version de l&apos;étudiant</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span className="comment-stars">★★☆☆☆</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#92400E' }}>2/5 · Note interne</span>
                </div>
                <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, fontStyle: 'italic' }}>
                  &quot;J&apos;ai attendu 40 minutes et on m&apos;a dit que la commande avait été marquée prête
                  mais je n&apos;ai rien reçu.&quot;
                </div>
              </div>
            </div>

            {/* Colonne droite : instruction + décision */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ borderTop: '3px solid var(--indigo)' }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Éléments d&apos;instruction</div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>
                    Profil étudiant
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {signalsStudent.map((s) => (
                      <div className={`signal-row ${s.ok ? 'signal-good' : 'signal-warn'}`} key={s.text}>
                        {s.ok ? <Check size={13} /> : <AlertCircle size={13} />}
                        <span>{s.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ height: 1, background: 'var(--border)', margin: '4px 0 14px' }} />

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>
                    Profil vendeur
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {signalsVendor.map((s) => (
                      <div className="signal-row signal-good" key={s.text}>
                        <Check size={13} />
                        <span>{s.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ height: 1, background: 'var(--border)', margin: '4px 0 14px' }} />

                <div style={{ padding: '12px 14px', background: '#EEF1FA', borderRadius: 10, border: '1px solid #C7D2FE' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--indigo)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>
                    Analyse automatique
                  </div>
                  <div style={{ fontSize: 13, color: '#1e3a8a', lineHeight: 1.6 }}>
                    L&apos;auto-réception a été déclenchée après 1h sans confirmation. Le vendeur a un historique
                    fiable (94% d&apos;acceptation, note 4,2/5). L&apos;étudiant n&apos;a pas de précédents suspects.
                    La situation est <strong>ambiguë</strong> — les deux parties semblent de bonne foi.
                  </div>
                  <div style={{ fontSize: 12, color: '#3730a3', marginTop: 6, fontWeight: 500 }}>
                    Suggestion : remboursement partiel ou remboursement total selon politique plateforme.
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-title">Décision</div>
                <div className="card-sub">Choisissez l&apos;action à appliquer pour résoudre ce litige</div>

                {decisions.map((d) => (
                  <div
                    key={d.key}
                    className={`decision-option ${decision === d.key ? 'selected' : ''}`}
                    style={{ marginTop: d.key !== 'remb' ? 10 : 0 }}
                    onClick={() => setDecision(d.key)}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div className="decision-radio">
                        {decision === d.key && <div className="decision-radio-dot" />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>{d.title}</div>
                        <div style={{ fontSize: 13, color: 'var(--muted)' }}>{d.desc}</div>
                      </div>
                    </div>

                    {decision === d.key && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }} onClick={(e) => e.stopPropagation()}>
                        {d.key === 'remb' && (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                              <span style={{ fontSize: 14, color: '#475569' }}>Montant à rembourser</span>
                              <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--indigo)' }}>800 tickets</span>
                            </div>
                            <div style={{ padding: '12px 14px', background: '#F0FDF4', borderRadius: 10, border: '1px solid #BBF7D0', fontSize: 13, color: '#166534', marginBottom: 12 }}>
                              Solde vendeur suffisant (42 300 FCFA) · débit immédiat
                            </div>
                          </>
                        )}
                        {d.key === 'susp' && (
                          <div style={{ padding: '12px 14px', background: '#FFF7ED', borderRadius: 10, border: '1px solid #FED7AA', fontSize: 13, color: '#92400E', marginBottom: 12 }}>
                            Ama Kokou n&apos;est pas actuellement suspendue.
                          </div>
                        )}
                        <div className="field-group">
                          <label className="fg-label">{d.key === 'close' ? 'Motif de clôture (obligatoire)' : 'Note interne'}</label>
                          <textarea
                            className="fg-input"
                            rows={2}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder={d.key === 'close' ? 'Ex : litige non fondé, commande reçue confirmée...' : 'Justification de la décision...'}
                          />
                        </div>
                        <button
                          className={d.key === 'remb' ? 'btn-primary-sm' : 'btn-secondary-sm'}
                          style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
                          disabled={d.key === 'close' && !note}
                          onClick={handleConfirm}
                        >
                          {d.key === 'remb' && 'Confirmer le remboursement'}
                          {d.key === 'susp' && 'Enregistrer la décision'}
                          {d.key === 'close' && 'Clôturer le litige'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    </>
  );
}
