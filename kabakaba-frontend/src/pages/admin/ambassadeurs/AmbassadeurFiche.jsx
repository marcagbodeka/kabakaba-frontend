import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trophy, X, ShieldCheck } from 'lucide-react';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';

const affilies = [
  { init: 'init-indigo', initials: 'MK', name: 'Mawuli Kofi', campus: 'UCAO', since: '12 jan. 2026', recharge: '5 300 FCFA', commission: '63,6 FCFA', active: true },
  { init: 'init-orange', initials: 'YS', name: 'Yawa Sossou', campus: 'UCAO', since: '18 jan. 2026', recharge: '2 400 FCFA', commission: '28,8 FCFA', active: true },
  { init: 'init-gray', initials: 'EK', name: 'Edem Kuma', campus: 'UCAO', since: '2 fév. 2026', recharge: '0 FCFA', commission: '—', active: false },
];

const commissions = [
  { date: "Aujourd'hui 10:44", affiliate: 'Mawuli Kofi', recharge: '5 300 FCFA', level: 'or', rate: '1,2%', amount: '63,6 FCFA' },
  { date: 'Hier 14:12', affiliate: 'Yawa Sossou', recharge: '2 200 FCFA', level: 'or', rate: '1,2%', amount: '26,4 FCFA' },
  { date: 'Hier 09:03', affiliate: 'Mawuli Kofi', recharge: '1 200 FCFA', level: 'argent', rate: '0,8%', amount: '9,6 FCFA' },
];

export default function AmbassadeurFiche() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tab, setTab] = useState('stats');
  const [modalOpen, setModalOpen] = useState(false);
  const [motif, setMotif] = useState('');

  return (
    <>
      <Topbar icon={Trophy} breadcrumb={[{ label: 'Ambassadeurs', path: '/admin/ambassadeurs' }, { label: 'Ama Kokou' }]} badge={{ text: 'Or' }}>
        <button className="btn-secondary-sm" onClick={() => navigate('/admin/ambassadeurs')}>← Retour</button>
      </Topbar>
      <PageContent>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <span className="initials init-indigo" style={{ width: 56, height: 56, borderRadius: 14, fontSize: 18 }}>AK</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.02em' }}>Ama Kokou</h1>
              <span className="level-badge or">Or</span>
              <span className="badge-green"><span className="status-dot dot-green" style={{ marginRight: 4 }} />Actif</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>
              UCAO · Faculté de Droit · +228 91 23 45 67 · Code promo :{' '}
              <strong style={{ color: 'var(--indigo)', fontFamily: 'monospace' }}>AMA-2026</strong>
              {id ? ` · #${id}` : ''}
            </p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn-secondary-sm" onClick={() => setModalOpen(true)}>Suspendre</button>
          </div>
        </div>

        <div className="tab-bar">
          <button className={`tab-btn ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>Vue générale</button>
          <button className={`tab-btn ${tab === 'affilies' ? 'active' : ''}`} onClick={() => setTab('affilies')}>Affiliés (42)</button>
          <button className={`tab-btn ${tab === 'commissions' ? 'active' : ''}`} onClick={() => setTab('commissions')}>Historique commissions</button>
          <button className={`tab-btn ${tab === 'appels' ? 'active' : ''}`} onClick={() => setTab('appels')}>Appels</button>
        </div>

        {tab === 'stats' && (
          <>
            <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              <div className="kpi-card">
                <div className="kpi-label">Volume affiliés 30j</div>
                <div className="kpi-value" style={{ color: 'var(--indigo)' }}>187 400 FCFA</div>
                <div className="kpi-sub">Seuil Or : 150 000 FCFA</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Commission ce mois</div>
                <div className="kpi-value" style={{ color: '#22C55E' }}>2 248 FCFA</div>
                <div className="kpi-sub">Taux Or : 1,2%</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Affiliés totaux</div>
                <div className="kpi-value">42</div>
                <div className="kpi-sub">28 actifs ce mois</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Dernier parrainage</div>
                <div className="kpi-value" style={{ fontSize: 20 }}>Il y a 3j</div>
                <div className="kpi-sub">Seuil suspension : 3 mois</div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">Progression de niveau</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
                <span>Niveau actuel : <strong style={{ color: '#F59E0B' }}>Or</strong></span>
                <span>187 400 FCFA / 150 000 FCFA minimum</span>
              </div>
              <div style={{ height: 12, background: '#F1F5F9', borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg,#F59E0B,#FBBF24)', borderRadius: 6 }} />
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>Niveau Or maintenu · prochain recalcul dans 12 jours</div>
            </div>
          </>
        )}

        {tab === 'affilies' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px 0', fontSize: 15, fontWeight: 700 }}>42 affiliés inscrits via le code AMA-2026</div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr><th>Affilié</th><th>Campus</th><th>Inscrit le</th><th>Recharges 30j</th><th>Commission générée</th><th>Statut</th></tr>
                </thead>
                <tbody>
                  {affilies.map((a) => (
                    <tr key={a.name}>
                      <td className="name-cell"><span className={`initials ${a.init}`} style={{ width: 28, height: 28, fontSize: 11 }}>{a.initials}</span>{a.name}</td>
                      <td><span className="badge-blue">{a.campus}</span></td>
                      <td style={{ fontSize: 13, color: 'var(--muted)' }}>{a.since}</td>
                      <td style={{ fontWeight: a.active ? 700 : 400, color: a.active ? 'var(--indigo)' : 'var(--muted)' }}>{a.recharge}</td>
                      <td style={{ color: a.active ? '#22C55E' : 'var(--muted)', fontWeight: a.active ? 600 : 400 }}>{a.commission}</td>
                      <td><span className={a.active ? 'badge-green' : 'badge-gray'}>{a.active ? 'Actif' : 'Inactif'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
              <span>Affichage 1–3 sur 42 affiliés</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="icon-btn">←</button>
                <button className="icon-btn" style={{ background: 'var(--indigo)', color: '#fff', borderColor: 'var(--indigo)' }}>1</button>
                <button className="icon-btn">2</button>
                <button className="icon-btn">→</button>
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
                  {commissions.map((c, i) => (
                    <tr key={i}>
                      <td style={{ fontSize: 13, color: 'var(--muted)' }}>{c.date}</td>
                      <td>{c.affiliate}</td>
                      <td style={{ fontWeight: 600 }}>{c.recharge}</td>
                      <td><span className={`level-badge ${c.level}`} style={{ fontSize: 11 }}>{c.level === 'or' ? 'Or' : 'Argent'}</span></td>
                      <td>{c.rate}</td>
                      <td style={{ fontWeight: 700, color: '#22C55E' }}>{c.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--muted)' }}>
              Total versé ce mois : <strong style={{ color: 'var(--indigo)' }}>2 248 FCFA</strong>
            </div>
          </div>
        )}

        {tab === 'appels' && (
          <div className="card">
            <div className="card-title">Appels soumis</div>
            <div className="card-sub">Aucun appel en cours pour cet ambassadeur.</div>
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--muted)' }}>
              <ShieldCheck size={44} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: 15, fontWeight: 500 }}>Aucun appel soumis</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Les appels suite à une suspension apparaissent ici.</div>
            </div>
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
                <div style={{ fontSize: 17, fontWeight: 700 }}>Suspendre l&apos;ambassadeur</div>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>Ama Kokou · Niveau Or</div>
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
