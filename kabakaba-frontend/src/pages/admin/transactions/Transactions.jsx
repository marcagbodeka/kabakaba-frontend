import { useState } from 'react';
import { Monitor, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../../components/Topbar';
import PageContent from '../../../components/PageContent';

const transactions = [
  { ref: 'TX-9821', type: 'Commande', tone: 'badge-blue', init: 'init-indigo', initials: 'AK', person: 'Ama Kokou', vendor: 'Cantine Centrale', amount: '800 tickets', amountColor: 'var(--indigo)', op: '—', status: 'Débité', time: "Aujourd'hui 11:22" },
  { ref: 'TX-9820', type: 'Recharge', tone: 'badge-peach', init: 'init-orange', initials: 'KD', person: 'Komi Dodzi', vendor: '—', amount: '1 200 FCFA', amountColor: 'var(--indigo)', op: 'Moov', status: 'Confirmé', time: "Aujourd'hui 11:18" },
  { ref: 'TX-9819', type: 'Remboursement', toneStyle: { background: '#FEE2E2', color: '#B91C1C' }, init: 'init-gray', initials: 'EF', person: 'Efua Fianu', vendor: 'Bistro UL', amount: '−1 200 tickets', amountColor: '#DC2626', op: '—', status: 'Effectué', time: "Aujourd'hui 10:54" },
  { ref: 'TX-9818', type: 'Séquestre', tone: 'badge-amber', init: 'init-gray', initials: 'YA', person: 'Yawa Agbo', vendor: 'Cantine Centrale', amount: '500 tickets', amountColor: 'var(--orange)', op: '—', status: 'En attente', statusTone: 'badge-amber', time: "Aujourd'hui 10:47", highlight: true },
  { ref: 'TX-9817', type: 'Retrait', toneStyle: { background: '#DCFCE7', color: '#166534' }, init: 'init-orange', initials: 'CC', person: 'Cantine Centrale', vendor: '—', amount: '42 000 FCFA', amountColor: '#22C55E', op: 'TMoney', status: 'Versé', time: 'Hier 16:30' },
];

export default function Transactions() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');

  return (
    <>
      <Topbar icon={Monitor} breadcrumb={[{ label: 'Transactions' }]} />
      <PageContent>
        <div className="page-header">
          <h1>Transactions</h1>
          <p>Suivi en temps réel · Séquestres, débits, remboursements, créances</p>
        </div>

        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <div className="kpi-card">
            <div className="kpi-label">Transactions aujourd&apos;hui</div>
            <div className="kpi-value">247</div>
            <div className="kpi-sub">toutes catégories</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">En séquestre</div>
            <div className="kpi-value" style={{ color: 'var(--orange)' }}>14 800 tickets</div>
            <div className="kpi-sub">commandes en cours</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Débits complétés</div>
            <div className="kpi-value" style={{ color: '#22C55E' }}>186 300 tickets</div>
            <div className="kpi-sub">commandes livrées</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Remboursements</div>
            <div className="kpi-value" style={{ color: '#DC2626' }}>3 200 tickets</div>
            <div className="kpi-sub">4 remboursements</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Créances actives</div>
            <div className="kpi-value" style={{ color: '#DC2626' }}>3 500 FCFA</div>
            <div className="kpi-sub">1 vendeur</div>
          </div>
        </div>

        <div className="tab-bar">
          <button className={`tab-btn ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>Toutes (247)</button>
          <button className={`tab-btn ${tab === 'seq' ? 'active' : ''}`} onClick={() => setTab('seq')}>Séquestres (18)</button>
          <button className={`tab-btn ${tab === 'remb' ? 'active' : ''}`} onClick={() => setTab('remb')}>Remboursements (4)</button>
          <button className={`tab-btn ${tab === 'creances' ? 'active' : ''}`} onClick={() => setTab('creances')}>Créances (1)</button>
        </div>

        {tab === 'all' && (
          <>
            <div className="filter-bar">
              <div className="filter-group">
                <label className="filter-label">Type</label>
                <div className="tab-pills">
                  <button className="pill active">Tous</button>
                  <button className="pill">Recharge</button>
                  <button className="pill">Commande</button>
                  <button className="pill">Remboursement</button>
                  <button className="pill">Retrait</button>
                </div>
              </div>
              <div className="filter-group">
                <label className="filter-label">Campus</label>
                <select className="filter-select"><option>Tous</option><option>UCAO</option><option>UL</option></select>
              </div>
              <div className="filter-group">
                <label className="filter-label">Cantine</label>
                <select className="filter-select"><option>Toutes</option><option>Cantine Centrale</option><option>Snack Resto</option></select>
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr><th>Réf.</th><th>Type</th><th>Étudiant / Vendeur</th><th>Cantine</th><th>Montant</th><th>Opérateur</th><th>Statut</th><th>Horodatage</th><th></th></tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr
                        key={t.ref}
                        onClick={() => navigate(`/admin/transactions/${t.ref}`)}
                        style={{ cursor: 'pointer', background: t.highlight ? '#FFF7ED' : undefined }}
                      >
                        <td style={{ fontWeight: 700, color: 'var(--indigo)', fontFamily: 'monospace', fontSize: 13 }}>#{t.ref}</td>
                        <td>{t.tone ? <span className={t.tone}>{t.type}</span> : <span style={{ ...t.toneStyle, fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>{t.type}</span>}</td>
                        <td className="name-cell"><span className={`initials ${t.init}`} style={{ width: 24, height: 24, borderRadius: 6, fontSize: 10 }}>{t.initials}</span>{t.person}</td>
                        <td style={{ fontSize: 13, color: t.vendor === '—' ? 'var(--muted)' : 'inherit' }}>{t.vendor}</td>
                        <td style={{ fontWeight: 700, color: t.amountColor }}>{t.amount}</td>
                        <td><span className="badge-gray" style={{ fontSize: 11 }}>{t.op}</span></td>
                        <td><span className={t.statusTone || 'badge-green'}>{t.status}</span></td>
                        <td style={{ fontSize: 12, color: 'var(--muted)' }}>{t.time}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => navigate(`/admin/transactions/${t.ref}`)}>
                            <Eye size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
                <span>Affichage 1–5 sur 247 transactions</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="icon-btn">←</button>
                  <button className="icon-btn" style={{ background: 'var(--indigo)', color: '#fff', borderColor: 'var(--indigo)' }}>1</button>
                  <button className="icon-btn">2</button>
                  <span style={{ padding: '0 4px' }}>…</span>
                  <button className="icon-btn">50</button>
                  <button className="icon-btn">→</button>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'seq' && (
          <div className="card">
            <div className="card-title">Séquestres actifs</div>
            <div className="card-sub">Tickets réservés pour des commandes en cours — non encore débités</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { init: 'init-indigo', initials: 'AK', name: 'Ama Kokou · Cantine Centrale', meta: 'Commande #CMD-2851 · EN PRÉPARATION · depuis 8 min', amount: '500 tickets' },
                { init: 'init-gray', initials: 'YA', name: 'Yawa Agbo · Snack Resto', meta: 'Commande #CMD-2850 · EN ATTENTE VENDEUR · depuis 3 min', amount: '800 tickets' },
              ].map((s) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#FFF7ED', borderRadius: 10, border: '1px solid #FED7AA', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className={`initials ${s.init}`} style={{ width: 28, height: 28, fontSize: 11 }}>{s.initials}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.meta}</div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--orange)' }}>{s.amount}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, padding: '12px 14px', background: '#F8FAFC', borderRadius: 10, fontSize: 14, color: '#475569' }}>
              Total en séquestre : <strong style={{ color: 'var(--indigo)' }}>14 800 tickets</strong> · 18 commandes actives
            </div>
          </div>
        )}

        {tab === 'remb' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-scroll">
              <table>
                <thead><tr><th>Réf.</th><th>Étudiant</th><th>Vendeur</th><th>Montant</th><th>Source débit</th><th>Date</th><th>Motif</th></tr></thead>
                <tbody>
                  <tr>
                    <td style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'var(--indigo)' }}>#RMB-041</td>
                    <td>Efua Fianu</td><td>Bistro UL</td>
                    <td style={{ fontWeight: 700, color: '#DC2626' }}>1 200 tickets</td>
                    <td><span className="badge-green">Vendeur</span></td>
                    <td style={{ fontSize: 13, color: 'var(--muted)' }}>Aujourd&apos;hui 10:54</td>
                    <td style={{ fontSize: 13, color: '#475569' }}>Commande non livrée</td>
                  </tr>
                  <tr>
                    <td style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'var(--indigo)' }}>#RMB-040</td>
                    <td>Koffi Amevor</td><td>Snack du Campus</td>
                    <td style={{ fontWeight: 700, color: '#DC2626' }}>800 tickets</td>
                    <td><span style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>Plateforme</span></td>
                    <td style={{ fontSize: 13, color: 'var(--muted)' }}>Hier 14:10</td>
                    <td style={{ fontSize: 13, color: '#475569' }}>Solde vendeur insuffisant</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'creances' && (
          <div className="card">
            <div className="card-title">Créances actives</div>
            <div className="card-sub">Montants avancés par la plateforme en attente de récupération sur le solde vendeur</div>
            <div style={{ padding: 16, background: '#FEF2F2', borderRadius: 12, border: '1px solid #FCA5A5' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>Snack du Campus</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Ama Setodji · UCAO · Créance ouverte depuis hier 14:10</div>
                  <div style={{ fontSize: 13, color: '#DC2626', marginTop: 4, fontWeight: 500 }}>Retrait bloqué jusqu&apos;au remboursement intégral</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#DC2626' }}>3 500 FCFA</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Solde vendeur actuel : 1 200 FCFA</div>
                  <div style={{ fontSize: 12, color: '#DC2626', marginTop: 2 }}>Manque encore : 2 300 FCFA</div>
                </div>
              </div>
              <div style={{ marginTop: 14, height: 8, background: '#FEE2E2', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '34%', background: '#DC2626', borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 5 }}>Progression : 1 200 / 3 500 FCFA récupérés (34%)</div>
            </div>
            <div style={{ marginTop: 12, padding: '12px 14px', background: '#F8FAFC', borderRadius: 10, fontSize: 14, color: '#475569' }}>
              La créance sera récupérée automatiquement dès que le solde du vendeur l&apos;atteint, à chaque nouvelle commande.
            </div>
          </div>
        )}
      </PageContent>
    </>
  );
}