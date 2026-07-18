import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Utensils, Plus, Pencil, X, Clock, Building2, Trash2 } from 'lucide-react';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';

const articles = [
  { name: 'Menu midi complet', type: 'Fixe', tone: 'badge-blue', desc: 'Riz · Sauce tomate · Poisson · Salade', packaging: 'Sur place · Sachet · Take away +100 tickets', price: '800 tickets', available: true },
  { name: 'Assiette personnalisée', type: 'Personnalisable', tone: 'badge-peach', desc: 'Riz (200 t.) · Œuf 0–3 (100 t./u.) · Saucisse 0–3 (100 t./u.)', packaging: 'Sur place · Sachet · Take away +100 tickets', price: 'dès 200 tickets', available: true },
  { name: 'Menu soupe', type: 'Fixe', tone: 'badge-blue', desc: 'Soupe de légumes · Pain', packaging: null, price: '400 tickets', available: false },
];

export default function CantineFiche() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tab, setTab] = useState('infos');
  const [modalOpen, setModalOpen] = useState(false);
  const [motif, setMotif] = useState('');

  return (
    <>
      <Topbar
        icon={Utensils}
        breadcrumb={[{ label: 'Cantines', path: '/admin/cantines' }, { label: 'Cantine Centrale' }]}
        badge={{ text: 'Actif · Ouverte' }}
      >
        <button className="btn-secondary-sm" onClick={() => navigate('/admin/cantines')}>← Retour à la liste</button>
      </Topbar>
      <PageContent>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <span className="initials init-indigo" style={{ width: 56, height: 56, borderRadius: 14, fontSize: 18 }}>CC</span>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.02em', marginBottom: 4 }}>Cantine Centrale</h1>
            <p style={{ fontSize: 15, color: 'var(--muted)' }}>Campus UCAO · Vendeur : Koffi Agbénou · Créée le 12 jan. 2026 {id ? `· #${id}` : ''}</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn-secondary-sm" onClick={() => setModalOpen(true)}>Suspendre le compte</button>
            <button className="btn-primary-sm">Enregistrer les modifications</button>
          </div>
        </div>

        <div className="tab-bar">
          <button className={`tab-btn ${tab === 'infos' ? 'active' : ''}`} onClick={() => setTab('infos')}>Infos & accès</button>
          <button className={`tab-btn ${tab === 'catalogue' ? 'active' : ''}`} onClick={() => setTab('catalogue')}>Catalogue & menus</button>
          <button className={`tab-btn ${tab === 'campus' ? 'active' : ''}`} onClick={() => setTab('campus')}>Campus couverts</button>
        </div>

        {tab === 'infos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="form-grid">
                <div className="field-group" style={{ gridColumn: '1/-1' }}>
                  <label className="fg-label">Nom de la cantine</label>
                  <input className="fg-input" defaultValue="Cantine Centrale" />
                </div>
                <div className="field-group">
                  <label className="fg-label">Nom du vendeur</label>
                  <input className="fg-input" defaultValue="Koffi Agbénou" />
                </div>
                <div className="field-group">
                  <label className="fg-label">Téléphone de contact</label>
                  <input className="fg-input" defaultValue="+228 90 12 34 56" />
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--indigo)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 7, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                <Clock size={15} /> Horaires typiques d&apos;ouverture
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
                Indicatif — l&apos;ouverture réelle reste gérée par le vendeur depuis l&apos;application mobile.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="horaire-row">
                  <div className="horaire-jours">
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'].map((j) => (
                      <label className="jour-check" key={j}><input type="checkbox" defaultChecked /> {j}</label>
                    ))}
                    {['Sam', 'Dim'].map((j) => (
                      <label className="jour-check" key={j}><input type="checkbox" /> {j}</label>
                    ))}
                  </div>
                  <div className="horaire-times">
                    <input className="fg-input" type="time" defaultValue="07:30" style={{ width: 110, height: 36 }} />
                    <span style={{ color: 'var(--muted)' }}>→</span>
                    <input className="fg-input" type="time" defaultValue="15:00" style={{ width: 110, height: 36 }} />
                  </div>
                  <button className="icon-btn" style={{ color: '#EF4444', borderColor: '#FEE2E2' }} title="Supprimer"><Trash2 size={14} /></button>
                </div>
              </div>
              <button className="btn-secondary-sm" style={{ marginTop: 12 }}><Plus size={13} /> Ajouter une plage</button>
              <div style={{ marginTop: 14, padding: '12px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>
                  Aperçu affiché à l&apos;étudiant
                </div>
                <span style={{ fontSize: 13, color: '#475569', background: '#fff', padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border)' }}>
                  Lun–Ven · 07h30 – 15h00
                </span>
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--indigo)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                Accès vendeur
              </div>
              <div className="form-grid">
                <div className="field-group" style={{ gridColumn: '1/-1' }}>
                  <label className="fg-label">Email de connexion</label>
                  <input className="fg-input" defaultValue="cantine.centrale@kabakaba.app" />
                </div>
                <div className="field-group" style={{ gridColumn: '1/-1' }}>
                  <label className="fg-label">Mot de passe</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="fg-input" type="password" defaultValue="motdepasse123" style={{ flex: 1 }} />
                    <button className="btn-secondary-sm">Réinitialiser</button>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ padding: '14px 16px', background: '#F8FAFC', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>Statut du compte</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <span className="badge-green">Actif</span>
                    <button className="btn-secondary-sm" style={{ fontSize: 13 }} onClick={() => setModalOpen(true)}>Suspendre</button>
                  </div>
                </div>
                <div style={{ padding: '14px 16px', background: '#FFF7ED', borderRadius: 10, border: '1px solid #FED7AA' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#92400E', textTransform: 'uppercase', marginBottom: 6 }}>Créance active</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#DC2626' }}>0 FCFA</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'catalogue' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0 18px', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Articles disponibles</div>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>6 articles configurés · 2 types</div>
              </div>
              <button className="btn-primary-sm" onClick={() => navigate(`/admin/cantines/${id || 1}/articles/nouveau`)}><Plus size={14} /> Ajouter un article</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {articles.map((a) => (
                <div className="article-card" key={a.name} style={a.available ? undefined : { opacity: 0.65 }}>
                  <div className="article-left">
                    <div className="article-img-placeholder">
                      <Utensils size={20} color="#94A3B8" />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 600 }}>{a.name}</span>
                        <span className={a.tone} style={{ fontSize: 11 }}>{a.type}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--muted)' }}>{a.desc}</div>
                      {a.packaging && <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Conditionnements : {a.packaging}</div>}
                    </div>
                  </div>
                  <div className="article-right">
                    <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--indigo)' }}>{a.price}</span>
                    <span className={a.available ? 'badge-green' : 'badge-gray'}>{a.available ? 'Disponible' : 'Indisponible'}</span>
                    <button className="icon-btn" title="Modifier" onClick={() => navigate(`/admin/cantines/${id || 1}/articles/${a.name}`)}><Pencil size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'campus' && (
          <div className="card">
            <div className="card-title">Campus affiliés</div>
            <div className="card-sub">Cette cantine est visible par les étudiants des campus suivants</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { init: 'init-indigo', code: 'UC', name: 'UCAO', full: "Université Catholique de l'Afrique de l'Ouest — Lomé", tone: 'badge-green', label: 'Principale' },
                { init: 'init-gray', code: 'UL', name: 'UL', full: 'Université de Lomé', tone: 'badge-gray', label: 'Secondaire' },
              ].map((c) => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#F8FAFC', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className={`initials ${c.init}`} style={{ width: 36, height: 36, borderRadius: 10, fontSize: 12 }}>{c.code}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--muted)' }}>{c.full}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className={c.tone}>{c.label}</span>
                    <button className="icon-btn" style={{ color: '#EF4444', borderColor: '#FEE2E2' }} title="Retirer ce campus"><X size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-secondary-sm" style={{ marginTop: 14 }}><Building2 size={14} /> Affilier un campus supplémentaire</button>
          </div>
        )}
      </PageContent>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <X size={20} color="#DC2626" />
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>Suspendre le compte vendeur</div>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>Cantine Centrale</div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>
              Le compte sera désactivé immédiatement. Les étudiants ne pourront plus passer commande. Les
              commandes en cours ne sont pas annulées automatiquement.
            </p>
            <div className="field-group" style={{ marginBottom: 16 }}>
              <label className="fg-label">Motif de la suspension (obligatoire)</label>
              <textarea
                className="fg-input"
                rows={3}
                placeholder="Ex : non-respect des délais de livraison..."
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-secondary-sm" onClick={() => setModalOpen(false)}>Annuler</button>
              <button className="btn-danger-sm" disabled={!motif} onClick={() => setModalOpen(false)}>Confirmer la suspension</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}